// Public profile page: thin server component, same server/client split
// convention as every other route. No auth required to view -- ratings and
// profiles are public-read.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/queries/profiles";
import { getUserRatings } from "@/lib/queries/ratings";
import { getRealMatchesForIds } from "@/lib/queries/matches";
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

  const ratings = await getUserRatings(id);
  const realMatches = await getRealMatchesForIds(ratings.map((r) => r.matchId));

  return (
    <ProfileClient
      profile={profile}
      ratings={ratings}
      realMatches={realMatches}
    />
  );
}
