// Sport-agnostic pieces of the real live-games feed: the shared liveGame
// shape, match-id namespacing, home-page selection, and the adapter to the
// mock Match shape. Pure (no fetching), so client components can import it.
import type { Match, MatchStatus, Side } from "@/lib/types";

// Single source of truth for the sport literals — LiveSport and
// VALID_SPORTS both derive from this array so they can't drift apart (a
// sport missing from VALID_SPORTS would fail to parse silently in
// parseLiveMatchId, with no compiler error to catch it).
const LIVE_SPORTS = ["mlb", "nba", "nfl", "soccer", "ufc"] as const;
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
