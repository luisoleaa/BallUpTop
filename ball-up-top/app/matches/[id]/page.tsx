import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REVIEWS, SPORTS } from "@/lib/data";
import { getAnyMatch } from "@/lib/queries/matches";
import { getUser } from "@/lib/supabase/server";
import { getMatchReviews, getUserRatingForMatch } from "@/lib/queries/ratings";
import {
  getLiveChatMessages,
  getLiveRatingPulses,
} from "@/lib/queries/live-activity";
import { MatchDetailClient } from "@/components/match/MatchDetailClient";

// No score in the description -- link previews are more "public" than the
// app itself (can show up in a chat before the viewer chooses to look).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getAnyMatch(id);
  if (!match) return {};
  return {
    title: `${match.a.name} vs ${match.b.name}`,
    description: `Rate and review this ${SPORTS[match.sport].name} match on Ball Up Top.`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getAnyMatch(id);
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

  // None of these three depends on another's result (only on `user`, already
  // resolved above), so they run in parallel rather than one-after-another.
  // Live-activity fetch skipped entirely for "upcoming" matches -- no
  // chat/pulses exist yet.
  const [initialRating, realReviews, [initialLiveMessages, initialLivePulses]] =
    await Promise.all([
      user ? getUserRatingForMatch(user.id, id) : Promise.resolve(null),
      getMatchReviews(id, user?.id),
      match.status !== "upcoming"
        ? Promise.all([getLiveChatMessages(id), getLiveRatingPulses(id)])
        : Promise.resolve([[], []] as [
            Awaited<ReturnType<typeof getLiveChatMessages>>,
            Awaited<ReturnType<typeof getLiveRatingPulses>>,
          ]),
    ]);

  return (
    <MatchDetailClient
      match={match}
      reviews={reviews}
      realReviews={realReviews}
      dist={dist}
      initialRating={initialRating}
      initialLiveMessages={initialLiveMessages}
      initialLivePulses={initialLivePulses}
    />
  );
}
