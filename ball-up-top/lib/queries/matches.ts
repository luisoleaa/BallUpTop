// Resolves a match id from either data system: mock MATCHES first, then a
// real game for "mlb-<gamePk>" / "nba-<espnId>" ids. cache() dedupes the
// provider fetch between generateMetadata and the page render of one request.
import { cache } from "react";
import { getMatch } from "@/lib/data";
import type { Match } from "@/lib/types";
import { getLiveGamesByIds } from "@/routes/live/all_live";
import { toMatch } from "@/routes/live/live";

export const getAnyMatch = cache(async (id: string): Promise<Match | undefined> => {
  const mock = getMatch(id);
  if (mock) return mock;

  const [game] = await getLiveGamesByIds([id]);
  return game ? toMatch(game) : undefined;
});

// Real games referenced by rating ids (e.g. for the diary).
export async function getRealMatchesForIds(ids: string[]): Promise<Match[]> {
  const games = await getLiveGamesByIds(ids);
  return games.map(toMatch);
}
