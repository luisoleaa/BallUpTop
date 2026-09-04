"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleReviewLikeAction(ratingId: string): Promise<{ liked: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to like a review." };

  const { data: existing } = await supabase
    .from("review_likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("rating_id", ratingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("review_likes").delete().eq("user_id", user.id).eq("rating_id", ratingId);
    if (error) return { error: error.message };
    return { liked: false };
  }

  const { error } = await supabase.from("review_likes").insert({ user_id: user.id, rating_id: ratingId });
  if (error) return { error: error.message };
  return { liked: true };
}
