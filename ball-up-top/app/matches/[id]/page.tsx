import { notFound } from "next/navigation";
import { getMatch, REVIEWS } from "@/lib/data";
import { getUser } from "@/lib/supabase/server";
import { getUserRatingForMatch } from "@/lib/queries/ratings";
import { MatchDetailClient } from "@/components/match/MatchDetailClient";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const reviews = REVIEWS[id] ?? [];

  // Synthetic decay curve from avg -- not real per-bucket vote data.
  let dist: number[] | null = null;
  if (match.avg != null) {
    const center = match.avg;
    dist = [10, 8, 6, 4, 2].map((n) => {
      const d = Math.abs(n - center);
      return Math.max(2, Math.round((1 - d / 6) * 100));
    });
  }

  const user = await getUser();
  const initialRating = user ? await getUserRatingForMatch(user.id, id) : null;

  return <MatchDetailClient match={match} reviews={reviews} dist={dist} initialRating={initialRating} />;
}
