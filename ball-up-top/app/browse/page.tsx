// Thin server wrapper: fetches all browsable matches (mock + today's
// real/live games) and the tag -> match-id map once, then hands them to
// BrowseClient, which does the actual filtering/search/rendering client-side.
import type { Metadata } from "next";
import { getAllBrowsableMatches } from "@/lib/queries/matches";
import { getTagToMatchIds } from "@/lib/queries/ratings";
import { BrowseClient } from "@/components/browse/BrowseClient";

export const metadata: Metadata = { title: "Browse matches" };

export default async function BrowsePage() {
  const [matches, tagToMatchIds] = await Promise.all([
    getAllBrowsableMatches(),
    getTagToMatchIds(),
  ]);

  const tagToMatchIdsPlain: Record<string, string[]> = {};
  for (const [tag, ids] of tagToMatchIds) tagToMatchIdsPlain[tag] = [...ids];

  return <BrowseClient matches={matches} tagToMatchIds={tagToMatchIdsPlain} />;
}
