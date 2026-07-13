# Ball Up Top

A Letterboxd-style app for sports: browse live and upcoming games across the NBA, NFL,
UFC, boxing, and soccer, then rate and review the ones you've watched. Built as a
Next.js PWA — it's a normal website, but installable to a phone home screen for an
app-like experience on iOS and Android.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- No backend yet — game data is mocked (`lib/data.ts`) and your ratings/reviews are
  stored in the browser's `localStorage` (`lib/app-store.tsx`)

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/page.tsx` — home feed (live now, popular this week, fight cards, upcoming)
- `app/browse/page.tsx` — search + sport-filter match grid
- `app/diary/page.tsx` — signed-in user's logged matches (auth-gated)
- `app/matches/[id]/page.tsx` — match detail, community rating, your rating, reviews
- `app/events/[id]/page.tsx` — UFC fight-card detail (a card containing several matches)
- `app/login/page.tsx` — mock email/password sign-in
- `lib/data.ts` — mock sports/matches/events/seed reviews; swap this for a real
  sports-data API later without touching the UI
- `lib/types.ts` — `Match`, `Event`, `Side`, `UserLog` data model
- `lib/app-store.tsx` — local auth/diary/toast state, persisted to `localStorage`
- `app/manifest.ts`, `app/icon.tsx`, `public/sw.js` — PWA install + offline shell

For the app's vision, naming decisions, design system, and deeper architecture notes,
see [`docs/context/`](docs/context/) — `vision.md`, `design-system.md`,
`architecture.md`, `roadmap.md`. These are auto-loaded by Claude Code via `CLAUDE.md`.

## Known next steps

- Swap mock game data for a real live-scores provider (e.g. API-Sports, SportsDataIO)
- Move ratings/reviews from `localStorage` to a real backend with accounts, so reviews
  are shared across users and devices instead of per-browser
- See `docs/context/roadmap.md` for more, including unfinished mockup ideas
