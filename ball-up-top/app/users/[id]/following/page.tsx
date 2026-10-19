import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/queries/profiles";
import { getFollowingIds, getFollowListEntries } from "@/lib/queries/follows";
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
    title: profile ? `${profile.displayName}'s following` : "Following",
  };
}

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const viewer = await getUser();
  const ids = await getFollowingIds(id);
  const entries = await getFollowListEntries(ids, viewer?.id ?? null);

  return (
    <FollowListClient
      title={`${profile.displayName} follows`}
      entries={entries}
    />
  );
}
