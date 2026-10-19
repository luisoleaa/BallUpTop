"use server";

// Saves a rating/review to the `ratings` table. RLS enforces user_id
// ownership; the getUser() check below is just a friendlier failure path.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface LogInput {
  rating: number;
  review: string;
  tags: string[];
  live: boolean;
}

export async function saveRatingAction(matchId: string, log: LogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?reason=rate&from=${encodeURIComponent(`/matches/${matchId}`)}`,
    );
  }

  const { error } = await supabase.from("ratings").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      rating: log.rating,
      review: log.review || null,
      tags: log.tags,
      watched_live: log.live,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,match_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/diary");
}

// Deletes the caller's own rating for a match. RLS already permits own-row
// delete on `ratings` (see supabase/migrations/README.md's baseline note),
// so no new SQL is needed for this.
export async function deleteRatingAction(matchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?reason=rate&from=${encodeURIComponent(`/matches/${matchId}`)}`,
    );
  }

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("match_id", matchId);

  if (error) throw new Error(error.message);

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/diary");
}
