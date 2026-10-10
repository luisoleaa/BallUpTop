-- enforce_live_rating_pulse_cooldown is a BEFORE INSERT trigger function
-- (references NEW), never meant to be called directly. Being SECURITY
-- DEFINER made it independently callable via PostgREST's /rpc/ endpoint by
-- anon/authenticated by default (flagged by the security advisor). Trigger
-- firing doesn't go through a privilege-checked function call the same way
-- a direct RPC invocation does, so revoking EXECUTE here doesn't affect the
-- trigger's normal operation on every insert -- it just closes the
-- unintended direct-RPC surface.
revoke execute on function public.enforce_live_rating_pulse_cooldown() from public, anon, authenticated;
