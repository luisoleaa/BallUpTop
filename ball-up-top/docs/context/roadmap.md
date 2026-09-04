# Roadmap / known next steps

Nothing here is urgent or blocking — these are the known open threads to pick up
when asked to extend the app, not a to-do list to work through unprompted.

## Done (this file used to list these as open — they're not anymore)

- Real Supabase Auth (was mock/local).
- Real ratings/reviews backend (`public.ratings`, was `localStorage`).
- Real fan reviews merged into match detail pages, alongside the mock seed reviews.
- A real NBA/NFL/MLB historical game archive + search (`/search`), separate from the
  mock `Match`/`Event` system that still powers browse/home/matches/events.
- Spoiler-free mode ("hide scores"), fully wired.
- OKLCH rating-color gradient, fully wired.
- PWA activated (service worker registered, maskable icon), social preview image,
  baseline security headers.
- A settings page (display name, spoiler toggle, sign out, account deletion).

## Open: schema changes waiting on a manual SQL step

These have application code written and ready, but need one SQL script run against
the live Supabase project first (check the Obsidian progress log for whether it's
been run yet):
- `postseason` column + `game_search` view rewrite, for postseason-phrase search
  ("finals"/"nba finals") and real team logos in search results.
- `handle_new_user()` trigger, so every signup gets a `profiles` row automatically.
- `review_likes` table — real likes on real fan reviews (mock `SeedReview.likes`
  stays static for the still-mock seed content).
- `reports` table — lets a signed-in user report a review (App/Play Store
  UGC-moderation requirement).
- `delete_own_account()` RPC — `/settings`'s delete-account button already calls it.

## Open: unify the mock and real game systems

- **Swap mock game data for a real live-scores provider**, at least for the sports
  that have one (NBA/NFL/MLB/EPL via balldontlie or similar) — the real games/search
  system is a separate, parallel track today, not yet used to back
  `/browse`/`/matches`/home. Soccer/tennis/F1/UFC/NHL/cricket have no real data source
  and stay mock indefinitely.
- Decide whether `ratings`/reviews should eventually key against real game ids
  instead of (or alongside) mock `Match.id`s, if/when the above happens.

## Open: mobile app stores

See the mobile-deploy roadmap in the Obsidian project-context doc (linked from
`CLAUDE.md`) — chosen path is Android first via PWA + Trusted Web Activity, iOS later
via a React Native/Expo rewrite. Not started; needs real hosting + developer
accounts.

## Open: other ideas worth considering

- A `ratingMode` stars-vs-numeric toggle (see design-system.md) — never adopted.
- A full CSP — skipped for now, see architecture.md's PWA/hardening section.
- Real test coverage beyond the current unit tests on pure helpers — no
  component/integration tests yet (no testing-library installed).
