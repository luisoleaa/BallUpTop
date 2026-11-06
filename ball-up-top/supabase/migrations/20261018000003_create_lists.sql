-- User-created match lists (collections) + a system-managed "Watchlist"
-- list per user (is_watchlist flag, auto-created lazily on first add
-- rather than a separate table -- reuses this same CRUD/RLS). All lists
-- are public-read, same posture as ratings/follows. match_id stays plain
-- text with no FK, same convention as ratings.match_id -- mock and real
-- match ids coexist.
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  is_watchlist boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lists_user_id_idx on public.lists (user_id);
-- At most one watchlist per user.
create unique index if not exists lists_one_watchlist_per_user
  on public.lists (user_id) where (is_watchlist);

create table if not exists public.list_items (
  list_id  uuid not null references public.lists(id) on delete cascade,
  match_id text not null,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (list_id, match_id)
);

create index if not exists list_items_list_id_idx on public.list_items (list_id);

alter table public.lists enable row level security;
alter table public.list_items enable row level security;

drop policy if exists "lists are publicly readable" on public.lists;
drop policy if exists "users manage own lists" on public.lists;
drop policy if exists "list_items are publicly readable" on public.list_items;
drop policy if exists "users manage own list_items" on public.list_items;

create policy "lists are publicly readable"
  on public.lists for select using (true);
create policy "users manage own lists"
  on public.lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "list_items are publicly readable"
  on public.list_items for select using (true);
-- Ownership of list_items is enforced via a subquery back to lists.user_id
-- (list_items itself has no user_id column).
create policy "users manage own list_items"
  on public.list_items for all
  using (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid())
  );
