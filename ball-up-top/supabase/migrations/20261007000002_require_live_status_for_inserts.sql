-- Tighten the insert policies from 20261006000001/20261006000002: ownership
-- alone (auth.uid() = user_id) let any signed-in user post chat/pulses to a
-- match that wasn't actually live by bypassing the Server Action's
-- assertMatchIsLive check via a direct PostgREST/client call. Now RLS itself
-- requires a fresh 'live' row in match_status_cache. 15s = 3x the panel's 5s
-- poll interval, so the cache self-expires shortly after a match goes final
-- or the last viewer's polling stops, without needing an active expiry job.
--
-- IMPORTANT: the two `interval '15 seconds'` literals below must match
-- CACHE_TTL_SECONDS in lib/match-status-cache.ts. They can't be shared (SQL
-- migrations can't import TS constants), so if you ever change one, add a
-- NEW migration updating these policies too -- this file is already
-- applied, immutable history -- or the app's own freshness check and the
-- DB's actual enforcement will silently diverge.
drop policy if exists "users post live chat as themselves" on public.live_chat_messages;

create policy "users post live chat as themselves"
  on public.live_chat_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.match_status_cache c
      where c.match_id = live_chat_messages.match_id
        and c.status = 'live'
        and c.updated_at > now() - interval '15 seconds'
    )
  );

drop policy if exists "users pulse-rate as themselves" on public.live_rating_pulses;

create policy "users pulse-rate as themselves"
  on public.live_rating_pulses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.match_status_cache c
      where c.match_id = live_rating_pulses.match_id
        and c.status = 'live'
        and c.updated_at > now() - interval '15 seconds'
    )
  );
