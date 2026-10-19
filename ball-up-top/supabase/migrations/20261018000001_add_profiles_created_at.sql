-- Adds "member since" data to profiles, needed for public profile pages
-- (app/users/[id]). Backfilled from auth.users.created_at, which migrations
-- can read directly (full Postgres privileges) even though PostgREST never
-- exposes auth.users to the app.
alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

update public.profiles p
set created_at = u.created_at
from auth.users u
where u.id = p.id
  and p.created_at is distinct from u.created_at;
