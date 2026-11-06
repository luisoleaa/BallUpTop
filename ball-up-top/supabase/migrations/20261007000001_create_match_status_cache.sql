-- Server-synced cache of each match's last-known status, so RLS on
-- live_chat_messages/live_rating_pulses can check "is this match live"
-- itself instead of trusting the Server Action alone. Postgres has no way
-- to independently verify liveness (mock matches live in lib/data.ts, real
-- ones behind ESPN/MLB's HTTP APIs, neither reachable from SQL), so this
-- table is only ever written by the service role (lib/supabase/service.ts,
-- lib/match-status-cache.ts's syncMatchStatusCache) after the server
-- independently resolves status via getAnyMatch -- never from client input.
-- That's what makes a row here trustworthy enough for RLS to check.
create table if not exists public.match_status_cache (
  match_id   text primary key,
  status     text not null check (status in ('live', 'final', 'upcoming')),
  updated_at timestamptz not null default now()
);

alter table public.match_status_cache enable row level security;

drop policy if exists "match_status_cache is publicly readable" on public.match_status_cache;

create policy "match_status_cache is publicly readable"
  on public.match_status_cache for select using (true);

-- Deliberately no insert/update/delete policy for anon/authenticated --
-- only the service role (which bypasses RLS) may write here.
