// Server-side reads for the `ratings` table. Mutations live in lib/actions/ratings.ts.
import { createClient } from "@/lib/supabase/server";
import { toRating, type RatingRow } from "@/lib/ratings-row";
import type { Rating } from "@/lib/types";

export async function getUserRatingForMatch(
  userId: string,
  matchId: string
): Promise<Rating | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();
  return data ? toRating(data as RatingRow) : null;
}

export async function getUserRatings(userId: string): Promise<Rating[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return ((data as RatingRow[]) ?? []).map(toRating);
}

export interface MatchReview {
  id: string;
  userName: string;
  rating: number;
  review: string;
  tags: string[];
  watchedLive: boolean;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
}

// Real fan reviews for a match, newest first. ratings.user_id has no direct
// FK to profiles (both point at auth.users), so profiles are fetched
// separately and merged in app code rather than relying on a PostgREST
// embed. Falls back to "Fan" for a user with no profile row. Likes are
// looked up best-effort -- review_likes may not exist yet (pending SQL
// migration), in which case every review just shows 0 likes rather than
// erroring the whole page.
export async function getMatchReviews(matchId: string, currentUserId?: string): Promise<MatchReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("id,user_id,rating,review,tags,watched_live,created_at")
    .eq("match_id", matchId)
    .not("review", "is", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: profiles } = await supabase.from("profiles").select("id,display_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string]));

  const ratingIds = rows.map((r) => r.id as string);
  const likeCountById = new Map<string, number>();
  const likedByMeSet = new Set<string>();
  const { data: likes, error: likesError } = await supabase
    .from("review_likes")
    .select("rating_id,user_id")
    .in("rating_id", ratingIds);
  if (!likesError) {
    for (const l of likes ?? []) {
      const ratingId = l.rating_id as string;
      likeCountById.set(ratingId, (likeCountById.get(ratingId) ?? 0) + 1);
      if (currentUserId && l.user_id === currentUserId) likedByMeSet.add(ratingId);
    }
  }

  return rows.map((r) => ({
    id: r.id as string,
    userName: nameById.get(r.user_id as string) ?? "Fan",
    rating: Number(r.rating),
    review: r.review as string,
    tags: (r.tags as string[]) ?? [],
    watchedLive: r.watched_live as boolean,
    createdAt: r.created_at as string,
    likeCount: likeCountById.get(r.id as string) ?? 0,
    likedByMe: likedByMeSet.has(r.id as string),
  }));
}
