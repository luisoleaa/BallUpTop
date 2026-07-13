# Roadmap / known next steps

Nothing here is urgent or blocking — these are the known open threads to pick up
when asked to extend the app, not a to-do list to work through unprompted.

## From the README

- **Swap mock game data for a real live-scores provider** (e.g. API-Sports,
  SportsDataIO) — replace `lib/data.ts`'s static `MATCHES`/`SPORTS`/`EVENTS` without
  touching UI components, since pages already consume it through `getMatch`/
  `getEvent`-style accessors.
- **Move ratings/reviews off `localStorage` to a real backend with accounts** — so
  diaries and fan reviews are shared across users/devices instead of per-browser.
  This is the bigger of the two — auth is currently fully mock (see
  `docs/context/architecture.md`), so this implies real auth too.

## Unshipped ideas from the original design mockup

See `docs/context/design-system.md` for full detail on each:

- **Finish spoiler-free / "hide scores" mode** — `MatchCard.tsx` already supports a
  `hideScores` prop; what's missing is a persisted toggle (likely in
  `lib/app-store.tsx`) and wiring it through the pages that render match cards.
- **OKLCH rating-color gradient** — dynamically color a rating value along a
  red→green hue interpolation (`oklch(0.74 0.17 ${28 + t*117})`) instead of the
  current fixed accent color, if a more expressive rating display is wanted.
