// Server-side reads for the `ratings` table. Mutations live in lib/actions/ratings.ts.
import { createClient } from "@/lib/supabase/server";
import { toRating, type RatingRow } from "@/lib/ratings-row";
import { getDisplayNamesByUserId } from "@/lib/queries/profiles";
import type { Rating } from "@/lib/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Shared by getMatchReviews/getTopRealReviews below -- counts review_likes
// rows per rating id. Best-effort: review_likes may not exist yet (pending
// SQL migration) or the query can otherwise fail, in which case every
// review just shows 0 likes rather than erroring the whole page (unlike the
// main ratings query, which does throw -- likes are a nice-to-have, the
// review text/rating itself isn't).
async function getReviewLikeCounts(
  supabase: SupabaseClient,
  ratingIds: string[],
  currentUserId?: string,
): Promise<{ likeCountById: Map<string, number>; likedByMeSet: Set<string> }> {
  const likeCountById = new Map<string, number>();
  const likedByMeSet = new Set<string>();
  const { data: likes, error } = await supabase
    .from("review_likes")
    .select("rating_id,user_id")
    .in("rating_id", ratingIds);
  if (!error) {
    for (const l of likes ?? []) {
      const ratingId = l.rating_id as string;
      likeCountById.set(ratingId, (likeCountById.get(ratingId) ?? 0) + 1);
      if (currentUserId && l.user_id === currentUserId)
        likedByMeSet.add(ratingId);
    }
  }
  return { likeCountById, likedByMeSet };
}

export async function getUserRatingForMatch(
  userId: string,
  matchId: string,
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
export async function getMatchReviews(
  matchId: string,
  currentUserId?: string,
): Promise<MatchReview[]> {
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

  const nameById = await getDisplayNamesByUserId(
    rows.map((r) => r.user_id as string),
  );

  const ratingIds = rows.map((r) => r.id as string);
  const { likeCountById, likedByMeSet } = await getReviewLikeCounts(
    supabase,
    ratingIds,
    currentUserId,
  );

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

export interface TopReview {
  id: string;
  matchId: string;
  userName: string;
  rating: number;
  review: string;
  likeCount: number;
}

// Most-liked real reviews across every match, for the home page's "Popular
// reviews" section (merged there with the mock SeedReview fallback list).
// Like counts aren't a column to ORDER BY in Postgres -- same manual-merge
// constraint as getMatchReviews above -- so this ranks within the most
// recent `cap` reviewed ratings rather than the true all-time top (fine
// while real review volume stays low; revisit if it ever doesn't).
export async function getTopRealReviews(
  limit: number,
  cap = 200,
): Promise<TopReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("id,user_id,match_id,rating,review,created_at")
    .not("review", "is", null)
    .order("created_at", { ascending: false })
    .limit(cap);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  const nameById = await getDisplayNamesByUserId(
    data.map((r) => r.user_id as string),
  );

  const ratingIds = data.map((r) => r.id as string);
  const { likeCountById } = await getReviewLikeCounts(supabase, ratingIds);

  return data
    .map((r) => ({
      id: r.id as string,
      matchId: r.match_id as string,
      userName: nameById.get(r.user_id as string) ?? "Fan",
      rating: Number(r.rating),
      review: r.review as string,
      likeCount: likeCountById.get(r.id as string) ?? 0,
    }))
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, limit);
}
