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
