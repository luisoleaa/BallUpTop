-- syncMatchStatusCache (lib/match-status-cache.ts) used to set updated_at
-- from the app server's own clock, but the RLS freshness checks in
-- 20261007000002_require_live_status_for_inserts.sql compare it against
-- Postgres's own now(). If the app host's clock drifts behind the DB
-- host's, a just-written row looks stale immediately and every live
-- chat/pulse insert is wrongly rejected. Force updated_at to the DB's own
-- now() on every write, ignoring whatever the caller supplied, so the two
-- clocks can never disagree about what "fresh" means.
create or replace function public.set_match_status_cache_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists match_status_cache_set_updated_at on public.match_status_cache;

create trigger match_status_cache_set_updated_at
  before insert or update on public.match_status_cache
  for each row execute function public.set_match_status_cache_updated_at();
