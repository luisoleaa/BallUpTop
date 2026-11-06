-- Equivalent of 20261007000007's write-side fix, for the read side: the
-- freshness comparison now happens in Postgres instead of comparing the
-- app server's Date.now() against a DB-set updated_at. Keep the interval
-- in sync with the two in 20261007000002_require_live_status_for_inserts.sql
-- (that file is immutable history, so update both if this window changes).
create or replace function public.get_fresh_match_status(p_match_id text)
returns text
language sql
stable
security invoker
as $$
  select status
  from public.match_status_cache
  where match_id = p_match_id
    and updated_at > now() - interval '15 seconds'
  limit 1;
$$;

grant execute on function public.get_fresh_match_status(text) to anon, authenticated;
