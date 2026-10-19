// Redirects guests server-side, then builds the activity feed for ActivityClient.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getActivityFeed } from "@/lib/queries/follows";
import { getRealMatchesForIds } from "@/lib/queries/matches";
import { MATCHES } from "@/lib/data";
import type { RatingAuthor } from "@/components/profile/RatingList";
import { ActivityClient } from "@/components/activity/ActivityClient";

export const metadata: Metadata = { title: "Activity" };

const FEED_LIMIT = 50;

export default async function ActivityPage() {
  const user = await getUser();
  if (!user) redirect("/login?reason=activity");

  const items = await getActivityFeed(user.id, FEED_LIMIT);
  const ratings = items.map((i) => i.rating);
  const realMatches = await getRealMatchesForIds(ratings.map((r) => r.matchId));
  const matches = [...MATCHES, ...realMatches];

  const authorByRatingId = new Map<string, RatingAuthor>(
    items.map((i) => [i.rating.id, { userId: i.userId, userName: i.userName }]),
  );

  return (
    <ActivityClient
      ratings={ratings}
      matches={matches}
      authorByRatingId={authorByRatingId}
    />
  );
}
