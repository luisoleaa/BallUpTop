import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/queries/profiles";
import { getFollowerIds, getFollowListEntries } from "@/lib/queries/follows";
import { getUser } from "@/lib/supabase/server";
import { FollowListClient } from "@/components/profile/FollowListClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);
  return {
    title: profile ? `${profile.displayName}'s followers` : "Followers",
  };
}

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const viewer = await getUser();
  const ids = await getFollowerIds(id);
  const entries = await getFollowListEntries(ids, viewer?.id ?? null);

  return (
    <FollowListClient
      title={`${profile.displayName}'s followers`}
      entries={entries}
    />
  );
}
