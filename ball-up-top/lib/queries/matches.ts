// Resolves a match id from either data system: mock MATCHES first, then a
// real game for "mlb-<gamePk>" / "nba-<espnId>" ids. cache() dedupes the
// provider fetch between generateMetadata and the page render of one request.
import { cache } from "react";
import { getMatch, MATCHES } from "@/lib/data";
import type { Match } from "@/lib/types";
import { getAllLiveGames, getLiveGamesByIds } from "@/routes/live/all_live";
import { toMatch } from "@/routes/live/live";

export const getAnyMatch = cache(
  async (id: string): Promise<Match | undefined> => {
    const mock = getMatch(id);
    if (mock) return mock;

    const [game] = await getLiveGamesByIds([id]);
    return game ? toMatch(game) : undefined;
  },
);

// Real games referenced by rating ids (e.g. for the diary).
export async function getRealMatchesForIds(ids: string[]): Promise<Match[]> {
  const games = await getLiveGamesByIds(ids);
  return games.map(toMatch);
}

// Every mock match plus today's real/live games, for /browse -- which
// previously only ever saw the mock MATCHES array.
export async function getAllBrowsableMatches(): Promise<Match[]> {
  const live = await getAllLiveGames();
  return [...MATCHES, ...live.map(toMatch)];
}
