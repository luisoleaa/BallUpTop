// Server-side reads for `lists`/`list_items`. Mutations live in lib/actions/lists.ts.
import { createClient } from "@/lib/supabase/server";

export interface MatchList {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isWatchlist: boolean;
  createdAt: string;
  itemCount: number;
}

interface ListRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_watchlist: boolean;
  created_at: string;
}

function toList(row: ListRow, itemCount: number): MatchList {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    isWatchlist: row.is_watchlist,
    createdAt: row.created_at,
    itemCount,
  };
}

// Item counts aren't a column to select directly -- same manual-merge
// constraint as review like counts elsewhere in this codebase (no
// aggregate-in-one-query via supabase-js) -- so this is one extra query
// per call, fine at this scale.
async function withItemCounts(rows: ListRow[]): Promise<MatchList[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("list_items")
    .select("list_id")
    .in(
      "list_id",
      rows.map((r) => r.id),
    );
  const countByListId = new Map<string, number>();
  for (const i of items ?? []) {
    const id = i.list_id as string;
    countByListId.set(id, (countByListId.get(id) ?? 0) + 1);
  }
  return rows.map((r) => toList(r, countByListId.get(r.id) ?? 0));
}

export async function getListsForUser(userId: string): Promise<MatchList[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("id,user_id,title,description,is_watchlist,created_at")
    .eq("user_id", userId)
    .order("is_watchlist", { ascending: false })
    .order("created_at", { ascending: false });
  return withItemCounts((data as ListRow[]) ?? []);
}

export async function getList(listId: string): Promise<MatchList | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("id,user_id,title,description,is_watchlist,created_at")
    .eq("id", listId)
    .maybeSingle();
  if (!data) return null;
  const [list] = await withItemCounts([data as ListRow]);
  return list;
}

export interface ListItem {
  matchId: string;
  position: number;
  addedAt: string;
}

export async function getListItems(listId: string): Promise<ListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("list_items")
    .select("match_id,position,added_at")
    .eq("list_id", listId)
    .order("position", { ascending: true })
    .order("added_at", { ascending: false });
  return (data ?? []).map((r) => ({
    matchId: r.match_id as string,
    position: r.position as number,
    addedAt: r.added_at as string,
  }));
}

export async function getWatchlist(userId: string): Promise<MatchList | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lists")
    .select("id,user_id,title,description,is_watchlist,created_at")
    .eq("user_id", userId)
    .eq("is_watchlist", true)
    .maybeSingle();
  if (!data) return null;
  const [list] = await withItemCounts([data as ListRow]);
  return list;
}

// Which of a user's lists already contain this match -- backs the
// "Add to list" picker's checked state.
export async function getListIdsContainingMatch(
  userId: string,
  matchId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: lists } = await supabase
    .from("lists")
    .select("id")
    .eq("user_id", userId);
  const listIds = (lists ?? []).map((l) => l.id as string);
  if (listIds.length === 0) return new Set();
  const { data: items } = await supabase
    .from("list_items")
    .select("list_id")
    .eq("match_id", matchId)
    .in("list_id", listIds);
  return new Set((items ?? []).map((i) => i.list_id as string));
}
