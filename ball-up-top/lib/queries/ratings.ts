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
