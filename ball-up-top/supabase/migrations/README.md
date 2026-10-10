# Supabase migrations

Historically this project had **no** `supabase/migrations/` folder — the live
Postgres schema (RLS policies, the `game_search` view, `handle_new_user` /
`increment_game_search_count` functions, etc.) existed only inside the Supabase
project, applied by hand in the SQL editor. `docs/context/architecture.md` notes
this caused confusion more than once.

This folder starts tracking schema changes from **2026-09-06** onward. It does
**not** contain a full baseline of everything created before that date — the
following were already live and are *not* reproduced here:

- `nba_games` / `nfl_games` / `mlb_games` / `nba_teams` / `nfl_teams` /
  `mlb_teams` tables (+ public-read RLS), backfilled from balldontlie.io
- `profiles` table (public read, own-row `UPDATE`)
- `ratings` table (public read, own-row `INSERT` / `UPDATE` / `DELETE`)
- `game_search` view (the pre-2026-09-06 8-column version)
- `handle_new_user()` + the `on_auth_user_created` trigger on `auth.users`
- `increment_game_search_count(p_sport, p_id)` RPC
- `rls_auto_enable()` event trigger

## Applied 2026-09-06 (the migration that had been "pending" since 08/31)

Run in order. All were applied to the live project the same day via the Supabase
management API, so re-running against that project is a no-op (every statement is
guarded with `if not exists` / `or replace` / `drop ... if exists`).

| File | What it does |
|------|--------------|
| `20260906000001_add_postseason_and_rewrite_game_search.sql` | Adds a nullable `postseason boolean` to the three games tables; rewrites `game_search` to also expose `postseason`, `home_team_abbr`, `visitor_team_abbr` (the columns `lib/queries/games.ts` probes for). Sets `security_invoker = on` on the view. |
| `20260906000002_create_review_likes.sql` | `review_likes` join table (`user_id`, `rating_id`) + RLS — powers real likes on real fan reviews (`lib/actions/review-likes.ts`, `getMatchReviews`). |
| `20260906000003_create_reports.sql` | `reports` table + RLS — lets a signed-in user report a review (`lib/actions/reports.ts`). Not publicly readable. |
| `20260906000004_create_delete_own_account_rpc.sql` | `delete_own_account()` `security definer` RPC — `/settings`'s delete-account button calls it (`lib/actions/profile.ts`). |
| `20260906000005_add_profiles_insert_policy.sql` | Own-row `INSERT` policy on `profiles`, so `updateDisplayNameAction`'s `upsert` works for a user with no `profiles` row. |

After `20260906000001`, run `npx tsx scripts/backfill-postseason.ts` once to
populate the new `postseason` flags (regular-season rows stay `NULL`, which
search treats as not-postseason). This was done on 2026-09-06 — NBA 4,551 /
NFL 276 / MLB 896 playoff games flagged. The script does an `UPDATE ... in (ids)`
(it originally used `upsert`, which inserted 68 bare id-only rows into
`nba_games` that then had to be deleted).

## Applied 2026-10-06

| File | What it does |
|------|--------------|
| `20261006000001_create_live_chat_messages.sql` | `live_chat_messages` table + RLS — public read, own-row insert, no update/delete — powers live chat on `/matches/[id]` (`lib/queries/live-activity.ts`, `lib/actions/live-activity.ts`). |
| `20261006000002_create_live_rating_pulses.sql` | `live_rating_pulses` table + RLS — same shape as above — repeated 1-10 rating pulses powering the live/permanent rating-over-time chart. |

## Applied 2026-10-07

| File | What it does |
|------|--------------|
| `20261007000001_create_match_status_cache.sql` | `match_status_cache` table (`match_id`, `status`, `updated_at`) + public-read RLS — the single cached "is this match live" source of truth both the app (`lib/match-status-cache.ts`) and the RLS policies below check, so neither re-hits the external provider on every live-activity read/write. |
| `20261007000002_require_live_status_for_inserts.sql` | Tightens the `live_chat_messages`/`live_rating_pulses` insert policies from 2026-10-06 — ownership (`auth.uid() = user_id`) alone let a direct PostgREST/client call bypass the Server Action's own live-status check. Now RLS also requires a fresh (`<= 15s` old) `'live'` row in `match_status_cache`. |
| `20261007000003_add_pulse_cooldown_trigger.sql` | `enforce_live_rating_pulse_cooldown()` trigger — enforces the 1-pulse-per-2s-per-user cooldown atomically via a transaction-scoped advisory lock on `(match_id, user_id)`, closing the race in the app-layer read-then-insert pre-check in `submitRatingPulseAction`. |
| `20261007000004_add_live_rating_pulses_user_index.sql` | Adds a `(match_id, user_id, created_at)` index on `live_rating_pulses` to support the cooldown trigger's/pre-check's own-last-pulse lookup, which the existing `(match_id, created_at)` index doesn't cover. |
| `20261007000005_revoke_pulse_cooldown_trigger_rpc_access.sql` | Revokes `EXECUTE` on `enforce_live_rating_pulse_cooldown()` from `public`/`anon`/`authenticated` — being `SECURITY DEFINER` made the trigger function independently callable via PostgREST's `/rpc/` endpoint by default (flagged by the security advisor); it's only ever meant to fire as a trigger. |
| `20261007000006_add_chat_cooldown_trigger.sql` | Mirrors `20261007000003`-`20261007000005` for `live_chat_messages`: a `(match_id, user_id, created_at)` index, an `enforce_live_chat_message_cooldown()` advisory-lock trigger enforcing a 1-message-per-4s-per-user cooldown, and the same RPC-access revoke. Chat previously had no rate limiting at any layer. |
