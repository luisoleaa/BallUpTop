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
- The "pending SQL migration" — applied to the live project 2026-09-06 and
  committed as `supabase/migrations/2026090600000{1..5}`: `postseason` column +
  `game_search` view rewrite, `review_likes` + `reports` tables,
  `delete_own_account()` RPC, `profiles` own-row `INSERT` policy.
  (`handle_new_user()` + trigger and `increment_game_search_count()` were already
  live from earlier.) So review likes, review reporting, account deletion, and
  postseason phrase search / real search logos are all wired end-to-end now.
- `postseason` flags backfilled 2026-09-06 via `scripts/backfill-postseason.ts`
  (NBA 4,551 / NFL 276 / MLB 896 playoff games; regular-season rows stay `NULL`).

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
