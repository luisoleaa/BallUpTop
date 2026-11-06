-- Mirrors 20261007000003_add_pulse_cooldown_trigger.sql /
-- 20261007000004_add_live_rating_pulses_user_index.sql /
-- 20261007000005_revoke_pulse_cooldown_trigger_rpc_access.sql for
-- live_chat_messages: chat had no rate limiting at any layer (client,
-- app, or DB), unlike rating pulses, which enforce a cooldown in all three.
-- Same reasoning throughout -- see those files' comments for the full
-- explanation of each piece.

-- Index supporting the cooldown lookup/trigger below, which filters by
-- match_id AND user_id -- the existing (match_id, created_at) index from
-- 20261006000001 doesn't cover that access pattern.
create index if not exists live_chat_messages_match_user_created_idx
  on public.live_chat_messages (match_id, user_id, created_at);

-- Advisory-xact-lock pattern identical to enforce_live_rating_pulse_cooldown,
-- just with a 4s window (chat is longer-form than a 1-tap pulse rating) and
-- a distinct lock-key salt ('chat:' vs 'pulse:') so the two locks never
-- collide for the same match_id+user_id pair.
create or replace function public.enforce_live_chat_message_cooldown()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('chat:' || new.match_id || ':' || new.user_id::text, 0));

  if exists (
    select 1 from public.live_chat_messages
    where match_id = new.match_id
      and user_id = new.user_id
      and created_at > now() - interval '4 seconds'
  ) then
    raise exception 'chat cooldown: wait before posting again' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists live_chat_messages_cooldown on public.live_chat_messages;

create trigger live_chat_messages_cooldown
  before insert on public.live_chat_messages
  for each row execute function public.enforce_live_chat_message_cooldown();

-- Same unintended-direct-RPC-surface closure as the pulse trigger function.
revoke execute on function public.enforce_live_chat_message_cooldown() from public, anon, authenticated;
