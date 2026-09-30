-- The existing profiles policy set had SELECT + UPDATE but no INSERT, so
-- updateDisplayNameAction's upsert() silently failed for any user without a
-- profiles row (e.g. one created before the handle_new_user trigger existed).
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
