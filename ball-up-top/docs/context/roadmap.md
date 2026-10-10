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
- NBA added to "Live now" (10/01/2026) via ESPN's keyless scoreboard/summary API,
  same clickable/rateable flow as MLB (`/matches/nba-<espnEventId>`).
- Home page "Live now" section wired to real MLB Stats API: client-side polling every
  30s, shows in-progress games with pulsing `LIVE <inning>` pill, fills empty slots
  with upcoming games (soonest first), final games excluded, respects spoiler-free
  mode. Cards link to `/matches/mlb-<gamePk>`, where real games can be rated and
  reviewed; they show up in the diary too.
- NFL, soccer (top 5 European leagues + Champions League), and UFC added to "Live
  now" (10/05/2026), all via ESPN's keyless site API — `routes/live/all_live.ts`
  now runs a 5-provider registry (`mlb`/`nba`/`nfl`/`soccer`/`ufc`) instead of a
  hardcoded MLB+NBA pair, and `selectLiveNow` round-robins live games across sports
  so one sport's simultaneous games can't crowd out the others. `tennis`/`f1`/`nhl`/
  `cricket` remain the only sports still mock-only.
- Live chat + a real rating-pulse chart on `/matches/[id]` (10/06/2026) — any
  match with `status === "live"` (mock or real) gets a chat feed and a fast
  1-10 tap row for repeated in-the-moment rating "pulses," client-polled every
  5s; a chart built from everyone's pulses (`components/match/LiveRatingChart.tsx`)
  shows how the crowd's rating moved over the match, and stays visible
  read-only once the match is final — a real, permanent record alongside the
  existing synthetic "Community rating" histogram. `public.live_chat_messages`/
  `public.live_rating_pulses`, see architecture.md.

## Open: unify the mock and real game systems

The home "Live now" section is now wired to five real sports (MLB, NBA, NFL,
soccer, UFC). Next steps:
- **Live-updating scoreboard**: `/matches/<sport>-*`'s scoreboard itself still
  doesn't poll like the home cards do — it's a snapshot at request time. (Chat
  and rating pulses on the same page now do poll, as of 10/06/2026 — see "Done"
  above — but that's additive and doesn't touch the scoreboard/clock.)
- **Expand to the remaining sports**: tennis, F1, NHL, and cricket stay mock —
  NHL would be the next easy win (same ESPN keyless-API family as NFL/soccer/UFC).
- **Unify the detail page systems**: `/browse`/`/matches/[id]`/`/events/[id]` still
  use mock data only. Decide whether to keep the parallel mock system indefinitely or
  migrate home/browse to real games (tradeoff: real data vs. curated mock experience).
- **Real UFC event pages**: individual fights resolve on `/matches/ufc-*` (same
  pattern as every other sport), but there's no real `/events/[id]` page bundling a
  fight card's real fights together the way the mock `Event` model does for UFC —
  out of scope for the initial live-feed work, not yet decided whether it's worth
  building.

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
