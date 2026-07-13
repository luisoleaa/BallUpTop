# Architecture

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS v4. No backend — game data
is a static in-memory mock (`lib/data.ts`) and all user state (ratings, reviews,
auth) lives in the browser's `localStorage` via `lib/app-store.tsx`.

## Data model (`lib/types.ts`)

- `SportSlug` — union of the 9 supported sports (`soccer, nba, nfl, tennis, mlb, f1,
  ufc, nhl, cricket`).
- `Match` — the atomic unit (one game/fight/race). Fields: `sport`, `league`,
  `status` (`live | final | upcoming`), optional `clock`/`date`/`note`, two `Side`
  objects (`a`, `b`), `avg` (community rating) and `logs` (log count), optional
  `heat` (trending flag shown on the home page's "Popular This Week"), optional
  `event` (parent `Event` id for UFC fights).
- `Side` — `name`, `abbr`, `color`, optional `flag`, and `score: number | string |
  null` — **string scores are intentional**, they accommodate F1 finishing positions
  (`"P1"`) and UFC results (`"W"`/`"L"`), not a type error to "fix" to `number`.
- `Event` — a UFC fight card: `name`, `venue`, `date`, `status`, `fights: string[]`
  (ids of its `Match` records). See `docs/context/vision.md` for why this is separate
  from `Match`.
- `UserLog` — a user's own diary entry for a match: `rating`, `review`, `tags`,
  `live` (watched live flag), `ts` (timestamp).
- `SeedReview` / `SEED_LOGS` (`lib/data.ts`) — seed fan reviews and a starter diary so
  a fresh user/browser isn't looking at an empty app.

## State management (`lib/app-store.tsx`)

Single React Context (`AppProvider` / `useApp()`) holding: `user` (mock auth),
`logs` (the signed-in user's diary, `Record<matchId, UserLog>`), and `toast` state.
Persisted to `localStorage` under **versioned keys**: `ballup_logs_v2`,
`ballup_web_user_v2`. The `_v2` suffix reflects a schema change from an earlier
prototype (`_v1`) — bump the version suffix again if `UserLog`'s shape changes, so
old browsers don't load incompatible cached state.

Toasts auto-dismiss after ~2.2s (`showToast`, `setTimeout(() => setToast(null),
2200)`). Copy conventions: "Signed in as {name}," "Signed out — browsing as guest,"
"Logged to your diary."

## Server/client split — follow this pattern for new routes

Every route pairs a thin server `page.tsx` (fetches data via `getMatch(id)` /
`getEvent(id)` from `lib/data.ts`, calls Next's `notFound()` if missing) with a
`*Client.tsx` component that handles interactivity and `useApp()`/localStorage
access:

- `app/matches/[id]/page.tsx` → `components/MatchDetailClient.tsx`
- `app/events/[id]/page.tsx` → (event detail client component)
- `app/browse/page.tsx` → `components/BrowseClient.tsx`
- `app/diary/page.tsx` → `components/DiaryClient.tsx`
- `app/login/page.tsx` → `components/LoginClient.tsx`

Dynamic route params are typed as `Promise<{ id: string }>` and awaited (Next.js 16
convention): `const { id } = await params;`. Keep this convention for any new dynamic
route.

## Component conventions

- `components/Icon.tsx` — single component with an if/else chain per icon name, each
  branch returning a full inline `<svg>`. Follow this pattern for new icons rather
  than introducing a `PATHS` lookup object — that approach was tried and abandoned in
  the original build.
- `components/Crest.tsx` — fallback chain for team/competitor art: logo
  (`Logos.tsx`) → flag (`FlagBadge.tsx`) → colored monogram. See
  `docs/context/design-system.md`.
- Rating-distribution histogram on match detail pages is **not real vote data** — it's
  a synthetic decay curve computed client-side from the single `avg` value:
  `Math.max(2, Math.round((1 - Math.abs(n - avg)/6) * 100))` for buckets `[10, 8, 6,
  4, 2]`. Don't be surprised it doesn't match any real tally — there isn't one yet.

## Known gotcha: `next/font/google` blank-page bug

`next/font/google`'s `axes` option is **only valid when `weight: "variable"`**.
Setting `axes: ["opsz"]` alongside fixed weights (e.g. `weight: ["400","600","700",
"800"]`) causes a silent module-resolution failure — the entire app renders blank,
**no console error, no DOM output**. If the app ever goes blank with no visible
error, check the font config in `app/layout.tsx` first.

## Deleted legacy files — do not resurrect or reference

These were removed during the rewrite to the current `Match`/`Event` data model and
`app-store.tsx`. If you see a stale reference to them (e.g. in an old note, comment,
or search result), it's leftover from before the rewrite, not a file to recreate:

`lib/mock-games.ts`, `lib/leagues.ts`, `lib/reviews-store.tsx`,
`lib/use-game-reviews.ts`, `components/GameCard.tsx`, `app/games/[id]/page.tsx`,
`app/leagues/[slug]/page.tsx`.

If the `.next` build cache ever shows phantom type errors referencing deleted routes
(e.g. `.next/dev/types/validator.ts`), wipe `.next` (`Remove-Item -Recurse -Force
.next` on Windows) rather than debugging a route that no longer exists.
