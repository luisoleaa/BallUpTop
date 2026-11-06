-- Performance advisor: wraps auth.uid() as (select auth.uid()) in every RLS
-- policy that calls it directly, so Postgres evaluates it once per query
-- instead of once per row. No behavior change. Also covers follows/lists/
-- list_items (created earlier this session with the same un-wrapped
-- pattern) so they don't get flagged the next time the advisor runs.

-- profiles
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

-- ratings
drop policy if exists "users delete own ratings" on public.ratings;
create policy "users delete own ratings"
  on public.ratings for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "users insert own ratings" on public.ratings;
create policy "users insert own ratings"
  on public.ratings for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "users update own ratings" on public.ratings;
create policy "users update own ratings"
  on public.ratings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- reports
drop policy if exists "users file reports as themselves" on public.reports;
create policy "users file reports as themselves"
  on public.reports for insert
  with check ((select auth.uid()) = reporter_id);

drop policy if exists "users read own reports" on public.reports;
create policy "users read own reports"
  on public.reports for select
  using ((select auth.uid()) = reporter_id);

-- review_likes
drop policy if exists "users like as themselves" on public.review_likes;
create policy "users like as themselves"
  on public.review_likes for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "users remove own likes" on public.review_likes;
create policy "users remove own likes"
  on public.review_likes for delete
  using ((select auth.uid()) = user_id);

-- live_chat_messages
drop policy if exists "users post live chat as themselves" on public.live_chat_messages;
create policy "users post live chat as themselves"
  on public.live_chat_messages for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.match_status_cache c
      where c.match_id = live_chat_messages.match_id
        and c.status = 'live'
        and c.updated_at > (now() - interval '15 seconds')
    )
  );

-- live_rating_pulses
drop policy if exists "users pulse-rate as themselves" on public.live_rating_pulses;
create policy "users pulse-rate as themselves"
  on public.live_rating_pulses for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.match_status_cache c
      where c.match_id = live_rating_pulses.match_id
        and c.status = 'live'
        and c.updated_at > (now() - interval '15 seconds')
    )
  );

-- follows
drop policy if exists "users follow as themselves" on public.follows;
create policy "users follow as themselves"
  on public.follows for insert
  with check ((select auth.uid()) = follower_id);

drop policy if exists "users unfollow as themselves" on public.follows;
create policy "users unfollow as themselves"
  on public.follows for delete
  using ((select auth.uid()) = follower_id);

-- Covering indexes for the 3 unindexed foreign keys the performance advisor flagged.
create index if not exists live_chat_messages_user_id_idx on public.live_chat_messages (user_id);
create index if not exists live_rating_pulses_user_id_idx on public.live_rating_pulses (user_id);
create index if not exists reports_reporter_id_idx on public.reports (reporter_id);
