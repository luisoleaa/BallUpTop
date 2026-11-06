-- Follow graph powering follower/following counts on /users/[id] and the
-- /activity feed. Public read (counts/lists are visible on anyone's
-- profile, same "everything here is public" posture as ratings); insert/
-- delete own row only.
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self_follow check (follower_id <> followee_id)
);

create index if not exists follows_followee_id_idx on public.follows (followee_id);
create index if not exists follows_follower_id_idx on public.follows (follower_id);

alter table public.follows enable row level security;

drop policy if exists "follows are publicly readable" on public.follows;
drop policy if exists "users follow as themselves" on public.follows;
drop policy if exists "users unfollow as themselves" on public.follows;

create policy "follows are publicly readable"
  on public.follows for select using (true);
create policy "users follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);
create policy "users unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);
