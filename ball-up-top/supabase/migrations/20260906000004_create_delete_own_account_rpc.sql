-- Lets a signed-in user delete their own auth.users row. profiles / ratings /
-- review_likes / reports all FK to auth.users with ON DELETE CASCADE, so the
-- user's data goes with it. security definer so app code needs no service-role
-- key; the function only ever touches the caller's own row (auth.uid()).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
