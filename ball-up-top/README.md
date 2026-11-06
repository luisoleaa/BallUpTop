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
  - Auth, ratings/reviews, and profiles are real (Supabase Auth, a `ratings` table, a
    `profiles` table, all RLS-protected), not `localStorage` — the one exception is
    `hideScores` (spoiler-free mode), a pure per-device UI preference that's
    genuinely fine to keep local.

## Getting started

```bash
cp .env.example .env.local   # fill in your Supabase project's URL/anon key
npm run dev
npm test                     # unit tests (Vitest) for the pure helper functions
```

Open [http://localhost:3000](http://localhost:3000).

**One-time Supabase setup beyond `.env.local`**: a few features (postseason search +
real team logos, review likes, reporting a review, account deletion) need a SQL
migration run once against the Supabase project — it's not tracked in this repo (see
"Schema not tracked in this repo" in `docs/context/architecture.md`). Everything else
works without it; those specific features degrade gracefully until it's run.

## Project structure

- `app/page.tsx` — home feed (live now, popular this week, fight cards, upcoming)
- `app/browse/page.tsx` — search + sport-filter match grid (mock `Match` data)
- `app/search/page.tsx` — search over the real NBA/NFL/MLB game archive, backed by
  `app/api/games/search/route.ts` + `lib/queries/games.ts`
- `app/diary/page.tsx` — signed-in user's logged matches (auth-gated)
- `app/matches/[id]/page.tsx` — match detail: community rating, your rating, fan
  reviews (real reviews from `ratings` merged above the mock seed reviews)
- `app/events/[id]/page.tsx` — UFC fight-card detail (a card containing several matches)
- `app/login/page.tsx` — real Supabase Auth email/password sign-in
- `app/settings/page.tsx` — display name, spoiler-mode toggle, sign out, delete account
- `lib/data.ts` — mock sports/matches/events/seed reviews for the 9-sport
  `Match`/`Event` system (browse/matches/events/home); swap for a real sports-data API
  later without touching the UI
- `lib/queries/` — server-side reads against the real Supabase tables (games, teams,
  ratings/reviews, profiles)
- `lib/actions/` — Server Actions (auth, ratings, review likes, reports, profile,
  game-view tracking)
- `lib/supabase/` — browser/server Supabase clients + auth session-refresh (see
  `proxy.ts` at the project root, Next 16's renamed `middleware.ts`)
- `scripts/` — one-off backfill scripts that populate `nba_games`/`nfl_games`/
  `mlb_games`/`*_teams`/postseason flags from the balldontlie.io API
- `lib/types.ts` — `Match`, `Event`, `Side`, `Rating` data model (the mock
  `Match`/`Event` system plus the real `Rating` shape)
- `lib/app-store.tsx` — real auth/ratings state (from Supabase), `hideScores`
  (localStorage), toast state
- `app/manifest.ts`, `app/icon.tsx`, `public/sw.js` — PWA install + offline shell
  (service worker registered from `components/layout/RegisterSW.tsx`)
- `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` — SEO/social basics
- `*.test.ts` files alongside their source (e.g. `lib/queries/games.test.ts`) — Vitest
  unit tests for pure logic; run with `npm test`

For the app's vision, naming decisions, design system, and deeper architecture notes,
see [`docs/context/`](docs/context/) — `vision.md`, `design-system.md`,
`architecture.md`, `roadmap.md`. These are auto-loaded by Claude Code via `CLAUDE.md`.

## Known next steps

See `docs/context/roadmap.md` for the current list — most of what used to be listed
here (real auth, real ratings/reviews, spoiler mode, the games/search feature, a
settings page) has since shipped. What's actually still open: running the pending SQL
migration mentioned above, unifying the mock and real game systems, and the mobile
App Store / Play Store rollout (Android first via PWA + Trusted Web Activity, iOS
later via a React Native/Expo rewrite — see the project context doc linked from
`CLAUDE.md` for the full plan).
