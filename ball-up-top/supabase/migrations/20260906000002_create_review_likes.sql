-- Real likes on real fan reviews (one row per user per rating).
create table if not exists public.review_likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating_id  uuid not null references public.ratings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, rating_id)
);

create index if not exists review_likes_rating_id_idx on public.review_likes (rating_id);

alter table public.review_likes enable row level security;

drop policy if exists "review_likes are publicly readable" on public.review_likes;
drop policy if exists "users like as themselves" on public.review_likes;
drop policy if exists "users remove own likes" on public.review_likes;

create policy "review_likes are publicly readable"
  on public.review_likes for select using (true);
create policy "users like as themselves"
  on public.review_likes for insert with check (auth.uid() = user_id);
create policy "users remove own likes"
  on public.review_likes for delete using (auth.uid() = user_id);
