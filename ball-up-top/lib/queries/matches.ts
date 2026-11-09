// Resolves a match id from either data system: mock MATCHES first, then a
// real game for "mlb-<gamePk>" / "nba-<espnId>" ids. cache() dedupes the
// provider fetch between generateMetadata and the page render of one request.
import { cache } from "react";
import { getMatch, MATCHES } from "@/lib/data";
import type { Match } from "@/lib/types";
import { getAllLiveGames, getLiveGamesByIds } from "@/routes/live/all_live";
import {
  filterLiveGames,
  LIVE_SPORTS,
  toMatch,
  type LiveSport,
} from "@/routes/live/live";

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
  // A mock "upcoming" entry for a sport the real feed now covers is the same
  // game the real feed already has fresher (and, unlike the mock Side, with
  // a correct logoSport/logoUrl set) -- drop it so browse doesn't show a
  // stale, logo-less duplicate next to the real one. Same filter the home
  // page's own "Upcoming" section already applies.
  const mockMatches = MATCHES.filter(
    (m) =>
      !(
        m.status === "upcoming" &&
        (LIVE_SPORTS as readonly string[]).includes(m.sport)
      ),
  );
  return [...mockMatches, ...live.map(toMatch)];
}

// Today's real/live games matching a /search query -- separate from the
// historical archive (lib/queries/games.ts#searchGames), which only covers
// finished NBA/NFL/MLB games. Covers all 6 LIVE_SPORTS.
export async function searchLiveGames({
  q,
  sport,
  liveOnly,
}: {
  q: string;
  sport: LiveSport | "all";
  liveOnly: boolean;
}): Promise<Match[]> {
  const games = await getAllLiveGames();
  return filterLiveGames(games, { q, sport, liveOnly }).map(toMatch);
}
