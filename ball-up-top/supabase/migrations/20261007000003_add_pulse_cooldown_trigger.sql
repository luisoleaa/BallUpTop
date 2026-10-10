-- The one-pulse-per-2s-per-user limit was previously enforced only in
-- submitRatingPulseAction (lib/actions/live-activity.ts) via a
-- read-then-insert check with no transaction, which is racy under
-- concurrent requests (two near-simultaneous submissions can both read the
-- same "last pulse" row before either insert lands). This trigger enforces
-- the limit atomically: a transaction-scoped advisory lock keyed on
-- (match_id, user_id) serializes concurrent inserts from the same
-- user+match before either can read the other's uncommitted row.
create or replace function public.enforce_live_rating_pulse_cooldown()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.match_id || ':' || new.user_id::text, 0));

  if exists (
    select 1 from public.live_rating_pulses
    where match_id = new.match_id
      and user_id = new.user_id
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'pulse cooldown: wait before pulsing again' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists live_rating_pulses_cooldown on public.live_rating_pulses;

create trigger live_rating_pulses_cooldown
  before insert on public.live_rating_pulses
  for each row execute function public.enforce_live_rating_pulse_cooldown();
