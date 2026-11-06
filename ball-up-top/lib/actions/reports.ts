"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function reportReviewAction(
  ratingId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to report a review." };

  const { success } = await checkRateLimit("action", user.id);
  if (!success) return { error: "Too many requests. Try again in a minute." };

  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: user.id, rating_id: ratingId });
  if (error) return { error: error.message };
  return { ok: true };
}
