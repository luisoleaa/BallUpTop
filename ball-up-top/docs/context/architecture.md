# Architecture

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 (used minimally —
most styling is inline `style={{}}`, see design-system.md). **Supabase** (Postgres +
Auth, RLS on every table) is the real backend — not mocked. Two data systems coexist
on purpose:

- The original 9-sport `Match`/`Event` mock model (`lib/data.ts`) still powers the
  home feed, `/browse`, `/matches/[id]`, `/events/[id]`. Real per-user data layers
  (auth, ratings, reviews, profiles) are already wired to these mock matches — see
  below — only the game/schedule data itself is still static.
- A separate, fully real NBA/NFL/MLB historical game archive
  (`nba_games`/`nfl_games`/`mlb_games`, backfilled from balldontlie.io — see
  `scripts/`), searchable at `/search`.

Auth, ratings/reviews, and profiles are real Supabase, not `localStorage` — see
State management below.

## Data model

**Mock system** (`lib/types.ts`, `lib/data.ts`):
- `SportSlug` — union of the 9 supported sports (`soccer, nba, nfl, tennis, mlb, f1,
  ufc, nhl, cricket`).
- `Match` — the atomic unit (one game/fight/race). Fields: `sport`, `league`,
  `status` (`live | final | upcoming`), optional `clock`/`date`/`note`, two `Side`
  objects (`a`, `b`), `avg`/`logs` (still the mock community-rating fields), optional
  `heat`/`event`.
- `Side` — `name`, `abbr`, `color`, optional `flag`, and `score: number | string |
  null` (string scores accommodate F1 positions/UFC results — not a bug to "fix").
- `Event` — a UFC fight card bundling multiple `Match` ids. See vision.md.
- `SeedReview` — seed fan reviews, still used as filler content alongside real
  reviews (see below).
- `User` — now has a real `id` (`auth.users.id`, also `ratings.user_id`), not just a
  display name.
- `Rating` — a real, DB-backed row from `public.ratings` (id, matchId, rating,
  review, tags, watchedLive, createdAt, updatedAt). Replaces the old `UserLog` as the
  saved shape; `UserLog` is still what `RateModal` collects before saving.

**Real games system** (`lib/queries/games.ts`): `GameSport` (`"nba"|"nfl"|"mlb"`,
distinct from `SportSlug`), `GameSearchResult` (sport, id, title, date, status,
scores, search_count, postseason, home/visitor team abbreviations).

## Real backend, by piece

- **Auth**: `lib/supabase/{client,server,middleware}.ts` (browser/server clients +
  session refresh), `proxy.ts` (Next 16's renamed `middleware.ts`, wires
  `updateSession` in on every request), `lib/actions/auth.ts` (sign in/up Server
  Action — signup requires email confirmation, so it returns `checkEmail: true`
  instead of a session).
- **Ratings/reviews**: `public.ratings` table (RLS: public read, own-row write).
  `lib/queries/ratings.ts` — `getUserRatingForMatch`/`getUserRatings` (the current
  user's own), `getMatchReviews` (every user's review for a match, joined against
  `profiles` for display names — real fan reviews, rendered above the mock
  `SeedReview[]` list in `MatchDetailClient.tsx` rather than replacing it, so pages
  stay populated while real content is sparse). `lib/actions/ratings.ts` —
  `saveRatingAction`.
- **Profiles**: `public.profiles` (id, display_name, RLS: public read, own-row
  update), auto-created on signup via a `handle_new_user()` trigger on `auth.users`
  insert (SQL, not in this repo — see the note at the bottom of this file). Edited at
  `/settings` (`lib/actions/profile.ts`).
- **Account deletion**: `/settings`'s danger zone calls a `delete_own_account()`
  `security definer` RPC (same pattern as `increment_game_search_count` below) — no
  service-role key anywhere in app code.
- **Real games archive**: `scripts/backfill*.ts` populate `nba_games`/`nfl_games`/
  `mlb_games`/`*_teams` from balldontlie.io. `lib/queries/games.ts`'s `searchGames()`
  queries a `game_search` Postgres view (UNION of the three sports) — team-name and
  abbreviation matching, and a `postseason`-phrase parser ("finals"/"nba finals"/etc,
  all synonyms for "any postseason game" since the provider has no round names).
  `lib/actions/games.ts`'s `incrementGameView` bumps `search_count` via RPC (not a
  direct UPDATE — no UPDATE policy on the games tables on purpose), fired from
  `GameViewTracker`'s client-mount effect, never from the page's own server render
  (Next prefetches viewport-visible `<Link>`s, which would otherwise inflate counts).

**`lib/app-store.tsx`** ties the client side together: signed-in `user` (from a
server-side `getUser()` in `app/layout.tsx`, kept in sync with client auth events),
`ratingsByMatch` (the current user's own ratings, fetched live from Supabase — not
persisted locally), `hideScores` (spoiler-free mode, the one thing that *is*
`localStorage`-persisted, since it's a pure per-device UI preference), and `toast`
state.

## Spoiler-free mode

Fully shipped (previously partial — `design-system.md` used to note this as
unfinished). `hideScores` lives in `lib/app-store.tsx`, toggled from an eye icon in
`Nav.tsx` or from `/settings`. Threaded through every `MatchCard` grid
(`HomeGrid`/`BrowseClient`), and additionally masks the match-detail scoreboard
behind a tap-to-reveal button for `status === "final"` matches — the "who won" hint
from dimming the losing side is suppressed too while masked, since that's itself a
spoiler.

## Server/client split — follow this pattern for new routes

Every route pairs a thin server `page.tsx` (fetches data, calls `notFound()`/
`redirect()` as needed) with a `*Client.tsx` component under `components/<area>/`
that handles interactivity:

- `app/matches/[id]/page.tsx` → `components/match/MatchDetailClient.tsx`
- `app/events/[id]/page.tsx` → renders `HomeGrid` directly, no dedicated client
- `app/browse/page.tsx` → `components/browse/BrowseClient.tsx`
- `app/diary/page.tsx` → `components/diary/DiaryClient.tsx`
- `app/login/page.tsx` → `components/auth/LoginClient.tsx`
- `app/settings/page.tsx` → `components/settings/SettingsClient.tsx`
- `app/search/page.tsx` → `components/search/SearchClient.tsx`

Dynamic route params are typed as `Promise<{ id: string }>` and awaited:
`const { id } = await params;`.

## Component conventions

- `components/` is split into feature subfolders: `ui/` (shared primitives —
  Button, Card, Label, Icon, Crest, EmptyState, etc.), `layout/` (Nav, HomeGrid,
  PopularReviews, RegisterSW), `auth/`, `browse/`, `diary/`, `event/`, `games/`,
  `match/`, `search/`, `settings/`.
- `components/ui/Icon.tsx` — single component with an if/else chain per icon name,
  each branch a full inline `<svg>`. Follow this pattern for new icons rather than a
  `PATHS` lookup object.
- `components/ui/Crest.tsx` — fallback chain for team/competitor art: logo
  (`Logos.tsx`) → flag (`FlagBadge.tsx`) → colored monogram. For real (non-mock)
  teams in search results, `components/search/TeamLogo.tsx` is a separate,
  ESPN-CDN-backed component instead (see the games-search section above) — `Crest`
  expects a mock `Side` object, `TeamLogo` a bare sport + abbreviation.
- Rating-distribution histogram on match detail pages is **not real vote data** —
  still a synthetic decay curve from the mock `avg` value (`RatingValue.tsx`'s
  `ratingColor` for the OKLCH gradient is real and shipped, though — see
  design-system.md).

## PWA / pre-launch hardening

- `app/manifest.ts` + `app/icon.tsx`/`apple-icon.tsx`/`maskable-icon/route.tsx` —
  installable, `display: "standalone"`.
- `public/sw.js` — network-first-with-cache-fallback service worker, registered from
  `components/layout/RegisterSW.tsx` (previously written but never registered).
- `app/opengraph-image.tsx` + `metadata.openGraph`/`twitter` in `app/layout.tsx` —
  real social link previews.
- `next.config.ts`'s `headers()` sets `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`. Deliberately no CSP — the app's
  inline-`style` styling approach would need `style-src 'unsafe-inline'` anyway, and
  there's no way to test a stricter one live in this environment without real risk of
  breaking pages.

## Known gotcha: `next/font/google` blank-page bug

`axes` is only valid alongside `weight: "variable"`. Pairing it with fixed weights
causes a silent failure — the whole app renders blank, no console error. Check
`app/layout.tsx`'s font config first if the app ever goes blank with no visible
error.

## Deleted legacy files — do not resurrect or reference

Removed during the original mock-data rewrite: `lib/mock-games.ts`, `lib/leagues.ts`,
`lib/reviews-store.tsx`, `lib/use-game-reviews.ts`, `components/GameCard.tsx`,
`app/leagues/[slug]/page.tsx`. Note `app/games/[id]/page.tsx` specifically was later
*re-added* for real reasons — `app/games/[sport]/[id]/page.tsx` is the real
historical-game detail page (see the games-search section above), not a resurrection
of deleted mock code; don't confuse the two.

## Schema not tracked in this repo

There's no `supabase/migrations/` — the live Postgres schema (RLS policies, the
`game_search` view, the `handle_new_user`/`delete_own_account`/
`increment_game_search_count` functions, `review_likes`/`reports` tables) lives only
in the Supabase project itself. Any change to it is applied by hand via the SQL
editor — check the most recent Obsidian progress-log entry for whether a given piece
of SQL has actually been run yet before assuming a feature that depends on it is
live.
