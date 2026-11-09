-- "users manage own lists"/"users manage own list_items" were `for all`,
-- which includes select -- redundant with (and, per the performance
-- advisor, forcing Postgres to evaluate alongside) the separate
-- "publicly readable" select policy each table already has. Narrowing
-- these to insert/update/delete removes the overlap; read access is
-- unchanged since the public-read policy still covers select.

drop policy if exists "users manage own lists" on public.lists;
create policy "users manage own lists insert"
  on public.lists for insert
  with check ((select auth.uid()) = user_id);
create policy "users manage own lists update"
  on public.lists for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "users manage own lists delete"
  on public.lists for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "users manage own list_items" on public.list_items;
create policy "users manage own list_items insert"
  on public.list_items for insert
  with check (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid()))
  );
create policy "users manage own list_items update"
  on public.list_items for update
  using (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid()))
  );
create policy "users manage own list_items delete"
  on public.list_items for delete
  using (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid()))
  );
