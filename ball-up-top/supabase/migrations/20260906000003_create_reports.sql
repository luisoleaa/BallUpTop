-- Review reports (UGC moderation queue). Not publicly readable — a reporter
-- can only see their own filed reports.
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  rating_id   uuid not null references public.ratings(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists reports_rating_id_idx on public.reports (rating_id);

alter table public.reports enable row level security;

drop policy if exists "users file reports as themselves" on public.reports;
drop policy if exists "users read own reports" on public.reports;

create policy "users file reports as themselves"
  on public.reports for insert with check (auth.uid() = reporter_id);
create policy "users read own reports"
  on public.reports for select using (auth.uid() = reporter_id);
