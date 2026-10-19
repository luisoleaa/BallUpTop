"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { ok: true };
type CreateResult = { error: string } | { id: string };

async function requireUser(matchId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const from = matchId ? `/matches/${matchId}` : "/lists";
    redirect(`/login?reason=rate&from=${encodeURIComponent(from)}`);
  }
  return { supabase, user };
}

export async function createListAction(
  title: string,
  description: string,
): Promise<CreateResult> {
  const { supabase, user } = await requireUser();
  const trimmed = title.trim();
  if (!trimmed) return { error: "Give your list a title." };

  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      title: trimmed,
      description: description.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/lists");
  return { id: data.id as string };
}

export async function updateListAction(
  listId: string,
  title: string,
  description: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const trimmed = title.trim();
  if (!trimmed) return { error: "Give your list a title." };

  const { error } = await supabase
    .from("lists")
    .update({
      title: trimmed,
      description: description.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
  return { ok: true };
}

export async function deleteListAction(listId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: list } = await supabase
    .from("lists")
    .select("is_watchlist")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return { error: "List not found." };
  if (list.is_watchlist) return { error: "Your watchlist can't be deleted." };

  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/lists");
  return { ok: true };
}

export async function addToListAction(
  listId: string,
  matchId: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser(matchId);

  const { error } = await supabase
    .from("list_items")
    .insert({ list_id: listId, match_id: matchId });
  if (error) return { error: error.message };

  revalidatePath(`/lists/${listId}`);
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

export async function removeFromListAction(
  listId: string,
  matchId: string,
): Promise<ActionResult> {
  const { supabase } = await requireUser(matchId);

  const { error } = await supabase
    .from("list_items")
    .delete()
    .eq("list_id", listId)
    .eq("match_id", matchId);
  if (error) return { error: error.message };

  revalidatePath(`/lists/${listId}`);
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

// Adds a match to the caller's Watchlist, creating it on first use. This is
// what the "Set a reminder" CTA on upcoming matches now calls.
export async function addToWatchlistAction(
  matchId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser(matchId);

  let { data: watchlist } = await supabase
    .from("lists")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_watchlist", true)
    .maybeSingle();

  if (!watchlist) {
    const { data: created, error: createError } = await supabase
      .from("lists")
      .insert({ user_id: user.id, title: "Watchlist", is_watchlist: true })
      .select("id")
      .single();
    if (createError) return { error: createError.message };
    watchlist = created;
  }

  const { error } = await supabase
    .from("list_items")
    .insert({ list_id: watchlist.id as string, match_id: matchId });
  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/lists");
  return { ok: true };
}
