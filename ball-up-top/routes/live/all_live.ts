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
import { redis } from "@/lib/redis";

// Short-TTL cache-aside in front of the provider fan-out below -- every
// client poll (30s) from every concurrent viewer otherwise re-fans-out to
// all 6 providers (up to ~13 upstream requests) on every single hit. 8s is
// shorter than the 30s poll interval (so scores never go stale by more than
// a poll's worth) but long enough to collapse near-simultaneous requests
// from many viewers into one fetch. No distributed lock on a cache miss --
// an occasional duplicate fetch under the 8s window is an acceptable
// tradeoff, same reasoning lib/match-status-cache.ts already uses for
// skipping cross-instance locking. Redis read/write failures fail open
// (treated as a miss) rather than ever breaking live scores.
const CACHE_TTL_SECONDS = 8;
const ALL_CACHE_KEY = "live:all";
const idCacheKey = (id: string) => `live:id:${id}`;

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
  const cached = await redis.get<liveGame[]>(ALL_CACHE_KEY).catch(() => null);
  if (cached) return cached;

  const sports = Object.keys(PROVIDERS) as LiveSport[];
  const results = await Promise.allSettled(
    sports.map((sport) => PROVIDERS[sport].today()),
  );
  results.forEach((r, i) => logRejected(sports[i], r));
  const games = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  await redis
    .set(ALL_CACHE_KEY, games, { ex: CACHE_TTL_SECONDS })
    .catch(() => {});
  return games;
}

// Specific games by match id ("mlb-…" / "soccer-…" / "ufc-…"); unknown or
// failed ids are skipped. Cached per id rather than per call -- callers pass
// varying, sometimes large id batches (e.g. a user's whole rated-matches
// list), which rarely repeat as a whole batch but individually overlap
// across requests and users (the same live game shows up in many diaries).
export async function getLiveGamesByIds(
  matchIds: string[],
): Promise<liveGame[]> {
  const parsedById = new Map(
    matchIds
      .map((id) => [id, parseLiveMatchId(id)] as const)
      .filter(
        (entry): entry is [string, { sport: LiveSport; gameId: string }] =>
          entry[1] != null,
      ),
  );
  if (parsedById.size === 0) return [];

  const cacheChecks = await Promise.all(
    [...parsedById.keys()].map(async (id) => {
      const cached = await redis
        .get<liveGame>(idCacheKey(id))
        .catch(() => null);
      return [id, cached] as const;
    }),
  );
  const hits = cacheChecks
    .filter((entry): entry is [string, liveGame] => entry[1] != null)
    .map(([, game]) => game);
  const missIds = cacheChecks
    .filter(([, game]) => game == null)
    .map(([id]) => id);

  if (missIds.length === 0) return hits;

  const sports = Object.keys(PROVIDERS) as LiveSport[];
  const idsFor = (sport: LiveSport) =>
    missIds
      .filter((id) => parsedById.get(id)!.sport === sport)
      .map((id) => parsedById.get(id)!.gameId);

  const results = await Promise.allSettled(
    sports.map((sport) => PROVIDERS[sport].byIds(idsFor(sport))),
  );
  results.forEach((r, i) => logRejected(sports[i], r));
  const fresh = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  await Promise.all(
    fresh.map((game) =>
      redis
        .set(idCacheKey(game.id), game, { ex: CACHE_TTL_SECONDS })
        .catch(() => {}),
    ),
  );

  return [...hits, ...fresh];
}
