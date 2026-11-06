-- Live chat tied to a match (mock or real, hence text match_id with no FK --
-- same convention as public.ratings.match_id). Public read (everyone viewing
-- the match page sees the same feed), own-row insert only. No update/delete
-- policy: chat history is immutable, like review_likes/reports.
create table if not exists public.live_chat_messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  message    text not null check (char_length(trim(message)) between 1 and 240),
  created_at timestamptz not null default now()
);

create index if not exists live_chat_messages_match_id_created_at_idx
  on public.live_chat_messages (match_id, created_at);

alter table public.live_chat_messages enable row level security;

drop policy if exists "live_chat_messages are publicly readable" on public.live_chat_messages;
drop policy if exists "users post live chat as themselves" on public.live_chat_messages;

create policy "live_chat_messages are publicly readable"
  on public.live_chat_messages for select using (true);
create policy "users post live chat as themselves"
  on public.live_chat_messages for insert with check (auth.uid() = user_id);
