# Ball Up Top

A Letterboxd-style app for sports: browse live and upcoming games across the NBA, NFL,
UFC, boxing, and soccer, then rate and review the ones you've watched. Built as a
Next.js PWA — it's a normal website, but installable to a phone home screen for an
app-like experience on iOS and Android.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth, RLS-protected) — real backend, not mocked. Two data
  systems currently coexist on purpose:
  - Real historical NBA/NFL/MLB games (`nba_games`/`nfl_games`/`mlb_games`, backfilled
    from balldontlie.io — see `scripts/`), searchable at `/search` via
    `app/api/games/search/route.ts` + `lib/queries/games.ts`.
  - The original 9-sport `Match`/`Event` mock data (`lib/data.ts`) still powers the
    home feed, `/browse`, `/matches/[id]`, and `/events/[id]` — not yet swapped for a
    real provider (soccer/tennis/F1/UFC/NHL/cricket have no real data source anyway;
    see `docs/context/roadmap.md`).
  - Auth and ratings are real (Supabase Auth + a `ratings` table with RLS), not
    `localStorage` — `lib/app-store.tsx` holds the signed-in user (from a real
    `getUser()` call) and an in-memory cache of the user's ratings fetched live from
    Supabase, plus toast state; it doesn't fake or persist any of this locally anymore.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/page.tsx` — home feed (live now, popular this week, fight cards, upcoming)
- `app/browse/page.tsx` — search + sport-filter match grid (mock `Match` data)
- `app/search/page.tsx` — search over the real NBA/NFL/MLB game archive, backed by
  `app/api/games/search/route.ts` + `lib/queries/games.ts`
- `app/diary/page.tsx` — signed-in user's logged matches (auth-gated)
- `app/matches/[id]/page.tsx` — match detail, community rating, your rating, reviews
- `app/events/[id]/page.tsx` — UFC fight-card detail (a card containing several matches)
- `app/login/page.tsx` — real Supabase Auth email/password sign-in
- `lib/data.ts` — mock sports/matches/events/seed reviews for the 9-sport
  `Match`/`Event` system (browse/matches/events/home); swap for a real sports-data API
  later without touching the UI
- `lib/queries/games.ts`, `lib/queries/ratings.ts` — server-side reads against the real
  Supabase tables (games, teams, ratings)
- `lib/actions/` — Server Actions (auth, ratings, game-view tracking)
- `lib/supabase/` — browser/server Supabase clients + auth session-refresh (see
  `proxy.ts` at the project root, Next 16's renamed `middleware.ts`)
- `scripts/` — one-off backfill scripts that populate `nba_games`/`nfl_games`/
  `mlb_games`/`*_teams` from the balldontlie.io API
- `lib/types.ts` — `Match`, `Event`, `Side`, `UserLog` data model (the mock system)
- `lib/app-store.tsx` — real auth/ratings state (from Supabase) + toast state
- `app/manifest.ts`, `app/icon.tsx`, `public/sw.js` — PWA install + offline shell

For the app's vision, naming decisions, design system, and deeper architecture notes,
see [`docs/context/`](docs/context/) — `vision.md`, `design-system.md`,
`architecture.md`, `roadmap.md`. These are auto-loaded by Claude Code via `CLAUDE.md`.

## Known next steps

- Swap the mock `Match`/`Event` data (home/browse/matches/events) for a real
  live-scores provider, at least for the sports that have one (NBA/NFL/MLB/EPL) — the
  real Supabase-backed games/search feature is a separate, parallel system today, not
  yet unified with these pages
- Decide what to do with the orphaned `profiles` table in Supabase (exists, has RLS,
  unused in app code)
- Add a `review_likes` mechanism so "Popular reviews" reflects real votes instead of
  static mock data
- Ship to the App Store / Play Store — roadmap decided: Android first via PWA +
  Trusted Web Activity, iOS later via a React Native/Expo rewrite (see the project
  context doc linked from `CLAUDE.md` for the full plan)
- See `docs/context/roadmap.md` for more, including unfinished mockup ideas — note
  that file and `docs/context/architecture.md` still describe a pre-Supabase,
  mock-only app and are due for a refresh
