// Server-side reads for the `follows` table. Mutations live in lib/actions/follows.ts.
import { createClient } from "@/lib/supabase/server";
import { getDisplayNamesByUserId } from "@/lib/queries/profiles";
import type { Rating } from "@/lib/types";
import { toRating, type RatingRow } from "@/lib/ratings-row";

export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  const supabase = await createClient();
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .maybeSingle();
  return Boolean(data);
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id,created_at")
    .eq("followee_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.follower_id as string);
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("followee_id,created_at")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.followee_id as string);
}

// Resolves display names + the viewer's own follow state for a list of
// user ids -- backs the /followers and /following pages.
export async function getFollowListEntries(
  ids: string[],
  viewerId: string | null,
): Promise<{ id: string; displayName: string; isFollowing: boolean }[]> {
  if (ids.length === 0) return [];
  const nameById = await getDisplayNamesByUserId(ids);
  const viewerFollowingIds = viewerId
    ? new Set(await getFollowingIds(viewerId))
    : new Set<string>();
  return ids.map((id) => ({
    id,
    displayName: nameById.get(id) ?? "Fan",
    isFollowing: viewerFollowingIds.has(id),
  }));
}

export interface ActivityItem {
  rating: Rating;
  userId: string;
  userName: string;
}

// Recent ratings from everyone `userId` follows, newest first. No FK-based
// embed available (ratings.user_id has no FK to profiles, same constraint
// as getMatchReviews), so this is: get the follow list, then a manual
// ratings fetch + profiles merge.
export async function getActivityFeed(
  userId: string,
  limit: number,
): Promise<ActivityItem[]> {
  const followingIds = await getFollowingIds(userId);
  if (followingIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  const rows = (data as (RatingRow & { user_id: string })[]) ?? [];
  if (rows.length === 0) return [];

  const nameById = await getDisplayNamesByUserId(rows.map((r) => r.user_id));

  return rows.map((row) => ({
    rating: toRating(row),
    userId: row.user_id,
    userName: nameById.get(row.user_id) ?? "Fan",
  }));
}
