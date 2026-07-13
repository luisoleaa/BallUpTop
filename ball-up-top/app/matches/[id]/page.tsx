import { notFound } from "next/navigation";
import { getMatch, REVIEWS, SPORTS } from "@/lib/data";
import { MatchDetailClient } from "@/components/MatchDetailClient";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const reviews = REVIEWS[id] ?? [];
  const sport = SPORTS[match.sport];

  // rating distribution (mock, weighted toward avg)
  let dist: number[] | null = null;
  if (match.avg != null) {
    const center = match.avg;
    dist = [10, 8, 6, 4, 2].map((n) => {
      const d = Math.abs(n - center);
      return Math.max(2, Math.round((1 - d / 6) * 100));
    });
  }

  return <MatchDetailClient match={match} sport={sport} reviews={reviews} dist={dist} />;
}
