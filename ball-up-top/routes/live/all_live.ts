// Server-side entry points that combine every live source. Adding a sport
// means adding one entry to PROVIDERS below (and wiring LiveSport/
// VALID_SPORTS in live.ts) — getAllLiveGames/getLiveGamesByIds never change.
import { parseLiveMatchId, type liveGame, type LiveSport } from "./live";
import { getLiveMlbGames, getMlbGamesByPk } from "./mlb_live";
import { getLiveNbaGames, getNbaGamesById } from "./nba_live";
import { getLiveNflGames, getNflGamesById } from "./nfl_live";
import { getLiveNhlGames, getNhlGamesById } from "./nhl_live";
import { getLiveSoccerGames, getSoccerGamesById } from "./soccer_live";
import { getLiveUfcGames, getUfcGamesById } from "./ufc_live";

interface LiveProvider {
  today(): Promise<liveGame[]>;
  byIds(ids: string[]): Promise<liveGame[]>;
}

// Record<LiveSport, ...> makes this exhaustive at compile time: adding a
// sport to LiveSport (in live.ts) without adding it here is a type error.
// (It does NOT catch the reverse — a sport missing from live.ts's
// VALID_SPORTS set just fails to parse ids silently.)
const PROVIDERS: Record<LiveSport, LiveProvider> = {
  mlb: { today: getLiveMlbGames, byIds: getMlbGamesByPk },
  nba: { today: getLiveNbaGames, byIds: getNbaGamesById },
  nfl: { today: getLiveNflGames, byIds: getNflGamesById },
  soccer: { today: getLiveSoccerGames, byIds: getSoccerGamesById },
  ufc: { today: getLiveUfcGames, byIds: getUfcGamesById },
  nhl: { today: getLiveNhlGames, byIds: getNhlGamesById },
};

// Logs a rejected provider settlement instead of silently dropping it --
// allSettled still lets every other provider's games through, but a
// provider failing is otherwise invisible (e.g. the ESPN range-query 400
// that quietly emptied NBA/NFL's slice of this feed for an unknown period
// until it was caught by chance -- see roadmap.md's 10/13/2026 entry).
function logRejected(sport: string, result: PromiseSettledResult<liveGame[]>) {
  if (result.status === "rejected")
    console.error(`live-feed provider failed (${sport})`, result.reason);
}

// Today's games across sports. allSettled so one provider being down
// doesn't blank the whole "Live now" section.
export async function getAllLiveGames(): Promise<liveGame[]> {
  const sports = Object.keys(PROVIDERS) as LiveSport[];
  const results = await Promise.allSettled(
    sports.map((sport) => PROVIDERS[sport].today()),
  );
  results.forEach((r, i) => logRejected(sports[i], r));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

// Specific games by match id ("mlb-…" / "soccer-…" / "ufc-…"); unknown or failed ids are skipped.
export async function getLiveGamesByIds(
  matchIds: string[],
): Promise<liveGame[]> {
  const parsed = matchIds.map(parseLiveMatchId).filter((p) => p != null);
  const idsFor = (sport: LiveSport) =>
    parsed.filter((p) => p.sport === sport).map((p) => p.gameId);

  const sports = Object.keys(PROVIDERS) as LiveSport[];
  const results = await Promise.allSettled(
    sports.map((sport) => PROVIDERS[sport].byIds(idsFor(sport))),
  );
  results.forEach((r, i) => logRejected(sports[i], r));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
