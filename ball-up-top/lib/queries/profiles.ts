// Shared by getLiveChatMessages (lib/queries/live-activity.ts) and
// getMatchReviews (lib/queries/ratings.ts): both need user_id -> display name,
// falling back to "Fan" for a user with no profiles row. profiles isn't FK'd
// from either table -- both point at auth.users independently -- so this is
// always a separate fetch + app-side merge, never a PostgREST embed.
import { createClient } from "@/lib/supabase/server";

export async function getDisplayName(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  return data?.display_name ?? null;
}

export async function getDisplayNamesByUserId(
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const supabase = await createClient();
  const uniqueIds = [...new Set(userIds)];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", uniqueIds);
  return new Map(
    (profiles ?? []).map((p) => [p.id as string, p.display_name as string]),
  );
}
