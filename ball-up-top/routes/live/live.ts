// Sport-agnostic pieces of the real live-games feed: the shared liveGame
// shape, match-id namespacing, home-page selection, and the adapter to the
// mock Match shape. Pure (no fetching), so client components can import it.
import type { Match, MatchStatus, Side } from "@/lib/types";

// Single source of truth for the sport literals — LiveSport and
// VALID_SPORTS both derive from this array so they can't drift apart (a
// sport missing from VALID_SPORTS would fail to parse silently in
// parseLiveMatchId, with no compiler error to catch it).
const LIVE_SPORTS = ["mlb", "nba", "nfl", "soccer", "ufc", "nhl"] as const;
export type LiveSport = (typeof LIVE_SPORTS)[number];
const VALID_SPORTS = new Set<LiveSport>(LIVE_SPORTS);

// Sports whose ESPN-CDN logo can be derived from sport+abbreviation alone
// (via TeamLogo). Soccer provides an explicit logoUrl instead; UFC has no
// team art and falls through to the flag/monogram chain.
const LOGO_SPORTS = new Set<LiveSport>(["mlb", "nba", "nfl"]);

export interface liveTeam {
  id: number;
  name: string;
  abbr: string;
  score: number | string | null; // string for UFC results ("W"/"L")
  logoUrl?: string; // explicit crest URL from the provider (soccer)
  flag?: string; // country code from the provider (UFC)
}

export interface liveGame {
  id: string; // match id, e.g. "mlb-849841" / "soccer-eng.1-401584339"
  sport: LiveSport;
  state: string; // "Live" | "Preview" | "Final" (MLB's vocabulary; others map to it)
  startTime: string;
  gameId: string; // opaque per-provider id (may itself contain "-", e.g. soccer's league-qualified id)
  clock: string | null; // "Top 8th" / "Q3 4:12" / "Round 2 · 3:14", only while live
  league: string;
  note?: string; // e.g. UFC's finish method once Final
  away: liveTeam;
  home: liveTeam;
}

// YYYYMMDD for a moment in US Eastern, ESPN's scoreboard day boundary.
export function etDateKey(d: Date): string {
  return d
    .toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    .replaceAll("-", "");
}

// Hour-of-day (0-23) for a moment in US Eastern. Intl's h23 cycle is used
// explicitly rather than hour12: false, which can format midnight as "24"
// on some ICU versions.
function etHour(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "America/New_York",
  }).formatToParts(d);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

// A game that started "yesterday" can only still be live this far into
// today (ET) -- covers a West Coast late start plus overtime. Outside this
// window there's no need to also query yesterday's scoreboard.
const YESTERDAY_RISK_WINDOW_END_HOUR_ET = 6;

// Fetches an ESPN scoreboard for today (ET), and also yesterday when it's
// still early enough that a game starting yesterday could be live, merging
// the events and deduping by id -- defends against a late game still live
// past midnight ET without relying on ESPN's `dates=<start>-<end>` range
// syntax, which 400s on the NBA/NFL/NHL endpoint family (their sibling
// /mma/ufc endpoint still accepts it, so this isn't a one-off format
// mistake, it's specific to this family). Shared by
// nba_live.ts/nfl_live.ts/nhl_live.ts, which otherwise had identical
// fetch/merge/dedupe logic copy-pasted three times. A failed date request
// is logged and skipped rather than failing the whole fetch, so a transient
// blip on one date can't blank out the other date's good data.
export async function fetchEtDateRangeEvents<E extends { id: string }>(
  fetchScoreboard: (dates: string) => Promise<{ events?: E[] }>,
  now: Date = new Date(),
): Promise<E[]> {
  const todayKey = etDateKey(now);
  const dateKeys =
    etHour(now) < YESTERDAY_RISK_WINDOW_END_HOUR_ET
      ? [
          ...new Set([
            etDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
            todayKey,
          ]),
        ]
      : [todayKey];

  const results = await Promise.allSettled(dateKeys.map(fetchScoreboard));

  const seen = new Set<string>();
  return results
    .flatMap((r) => {
      if (r.status === "rejected") {
        console.error(
          "fetchEtDateRangeEvents: scoreboard request failed",
          r.reason,
        );
        return [];
      }
      return r.value.events ?? [];
    })
    .filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}

// Real games share the ratings table's text match_id with the mock matches,
// namespaced as "<sport>-<provider id>" so the two can't collide.
export function liveMatchId(sport: LiveSport, gameId: string): string {
  return `${sport}-${gameId}`;
}

// Splits only on the first "-": sport is always a known literal with no
// dashes of its own, so everything after it is handed back verbatim as an
// opaque gameId. Soccer further splits that into "<leagueCode>-<eventId>"
// itself; every other provider uses it directly.
export function parseLiveMatchId(
  id: string,
): { sport: LiveSport; gameId: string } | null {
  const m = /^([a-z]+)-(.+)$/.exec(id);
  if (!m || !VALID_SPORTS.has(m[1] as LiveSport)) return null;
  return { sport: m[1] as LiveSport, gameId: m[2] };
}

// Live games first, round-robin across sports so one sport with many
// simultaneous games (MLB) can't monopolize every slot, then soonest-
// upcoming fills the rest. Final games are excluded.
export function selectLiveNow(
  games: liveGame[],
  target: number = 6,
): liveGame[] {
  const live = games.filter((g) => g.state === "Live");
  const upcoming = games
    .filter((g) => g.state === "Preview")
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  const bySport = new Map<LiveSport, liveGame[]>();
  for (const g of live) {
    const group = bySport.get(g.sport);
    if (group) group.push(g);
    else bySport.set(g.sport, [g]);
  }
  const groups = [...bySport.values()];

  const liveOrdered: liveGame[] = [];
  for (let i = 0; liveOrdered.length < live.length; i++) {
    for (const group of groups)
      if (i < group.length) liveOrdered.push(group[i]);
  }

  const needed = Math.max(0, target - liveOrdered.length);
  return [...liveOrdered, ...upcoming.slice(0, needed)];
}

const STATUS_BY_STATE: Record<string, MatchStatus> = {
  Live: "live",
  Final: "final",
  Preview: "upcoming",
};

export function toSide(team: liveTeam, sport: LiveSport): Side {
  return {
    name: team.name,
    abbr: team.abbr,
    color: "var(--surface-2)",
    logoSport: LOGO_SPORTS.has(sport)
      ? (sport as "mlb" | "nba" | "nfl")
      : undefined,
    logoUrl: team.logoUrl,
    flag: team.flag,
    score: team.score,
  };
}

// Adapts a real game to the mock Match shape so the existing match detail
// page, RateModal, and diary can render it. Away team is side "a". Dates are
// formatted in US Eastern on the server.
export function toMatch(game: liveGame): Match {
  const status = STATUS_BY_STATE[game.state] ?? "upcoming";
  const start = new Date(game.startTime);
  const date =
    status === "upcoming"
      ? start.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        }) + " ET"
      : start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "America/New_York",
        });

  return {
    id: game.id,
    sport: game.sport,
    league: game.league,
    status,
    clock: game.clock ?? undefined,
    date,
    note: game.note,
    a: toSide(game.away, game.sport),
    b: toSide(game.home, game.sport),
    avg: null,
    logs: 0,
  };
}
