// Public profile page: thin server component, same server/client split
// convention as every other route. No auth required to view -- ratings and
// profiles are public-read.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/queries/profiles";
import { getUserRatings } from "@/lib/queries/ratings";
import { getRealMatchesForIds } from "@/lib/queries/matches";
import { getFollowCounts, isFollowing } from "@/lib/queries/follows";
import { getUser } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/profile/ProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) return {};
  return { title: profile.displayName };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const viewer = await getUser();
  const [ratings, followCounts, viewerIsFollowing] = await Promise.all([
    getUserRatings(id),
    getFollowCounts(id),
    viewer ? isFollowing(viewer.id, id) : Promise.resolve(false),
  ]);
  const realMatches = await getRealMatchesForIds(ratings.map((r) => r.matchId));

  return (
    <ProfileClient
      profile={profile}
      ratings={ratings}
      realMatches={realMatches}
      viewerId={viewer?.id ?? null}
      isFollowing={viewerIsFollowing}
      followCounts={followCounts}
    />
  );
}
