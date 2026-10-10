-- Repeated 1-10 rating "pulses" submitted while watching a match live. Many
-- rows per user per match on purpose -- NOT an upsert, unlike public.ratings.
-- Powers the live + permanent rating-over-time chart. Immutable: no
-- update/delete policy.
create table if not exists public.live_rating_pulses (
  id         uuid primary key default gen_random_uuid(),
  match_id   text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 10),
  created_at timestamptz not null default now()
);

create index if not exists live_rating_pulses_match_id_created_at_idx
  on public.live_rating_pulses (match_id, created_at);

alter table public.live_rating_pulses enable row level security;

drop policy if exists "live_rating_pulses are publicly readable" on public.live_rating_pulses;
drop policy if exists "users pulse-rate as themselves" on public.live_rating_pulses;

create policy "live_rating_pulses are publicly readable"
  on public.live_rating_pulses for select using (true);
create policy "users pulse-rate as themselves"
  on public.live_rating_pulses for insert with check (auth.uid() = user_id);
