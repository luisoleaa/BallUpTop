// Soccer source for the live-games feed: ESPN's keyless site API, fanned out
// across the top European leagues + Champions League. Looks like a single
// provider to all_live.ts even though it makes several requests internally.
import { liveMatchId, type liveGame, type liveTeam } from "./live";

const ESPN_SOCCER = "https://site.api.espn.com/apis/site/v2/sports/soccer";

// ESPN league code -> display name, used as the Match "league" field.
const LEAGUES: Record<string, string> = {
  "eng.1": "Premier League",
  "esp.1": "La Liga",
  "ger.1": "Bundesliga",
  "ita.1": "Serie A",
  "fra.1": "Ligue 1",
  "uefa.champions": "Champions League",
};

interface EspnSoccerCompetitor {
  homeAway: "home" | "away";
  score?: string;
  team: {
    id: string;
    abbreviation?: string;
    displayName: string;
    // Scoreboard payloads carry a single `logo` string; summary payloads
    // (verified against a live fetch) carry a `logos` array instead —
    // toTeam checks both.
    logo?: string;
    logos?: { href: string }[];
  };
}

export interface EspnSoccerCompetition {
  date: string;
  status: { type: { state: "pre" | "in" | "post"; shortDetail: string } };
  competitors: EspnSoccerCompetitor[];
}

interface EspnSoccerScoreboard {
  events: { id: string; competitions: EspnSoccerCompetition[] }[];
}

interface EspnSoccerSummary {
  header: { id: string; competitions: EspnSoccerCompetition[] };
}

const STATE: Record<EspnSoccerCompetition["status"]["type"]["state"], string> =
  {
    pre: "Preview",
    in: "Live",
    post: "Final",
  };

function toTeam(c: EspnSoccerCompetitor, started: boolean): liveTeam {
  return {
    id: Number(c.team.id),
    name: c.team.displayName,
    abbr: c.team.abbreviation ?? c.team.displayName.slice(0, 3).toUpperCase(),
    score:
      started && c.score != null && c.score !== "" ? Number(c.score) : null,
    // ESPN hands us the crest URL directly — no numeric-id/abbr CDN lookup needed.
    logoUrl: c.team.logo ?? c.team.logos?.[0]?.href,
  };
}

// Returns null for a malformed competition missing an away/home side (e.g.
// a TBD/placeholder slot), so one bad match can't throw and blank every
// soccer game for the poll cycle.
export function mapCompetition(
  leagueCode: string,
  eventId: string,
  competition: EspnSoccerCompetition,
): liveGame | null {
  const state = STATE[competition.status.type.state] ?? "Preview";
  const started = state !== "Preview";
  const away = competition.competitors.find((c) => c.homeAway === "away");
  const home = competition.competitors.find((c) => c.homeAway === "home");
  if (!away || !home) return null;
  const gameId = `${leagueCode}-${eventId}`;

  return {
    id: liveMatchId("soccer", gameId),
    sport: "soccer",
    state,
    startTime: competition.date,
    gameId,
    clock: state === "Live" ? competition.status.type.shortDetail : null,
    league: LEAGUES[leagueCode] ?? leagueCode,
    away: toTeam(away, started),
    home: toTeam(home, started),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`ESPN soccer request failed: ${res.status}`);
  return res.json();
}

// One fetch per league, merged here — all_live.ts sees this as a single provider.
export async function getLiveSoccerGames(): Promise<liveGame[]> {
  const results = await Promise.allSettled(
    Object.keys(LEAGUES).map(async (leagueCode) => {
      const data = await fetchJson<EspnSoccerScoreboard>(
        `${ESPN_SOCCER}/${leagueCode}/scoreboard`,
      );
      return (data.events ?? [])
        .map((e) => mapCompetition(leagueCode, e.id, e.competitions[0]))
        .filter((g) => g != null);
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

// Splits a composite "<leagueCode>-<eventId>" gameId back apart. League
// codes never contain "-", so splitting on the first one is unambiguous.
export function splitSoccerGameId(compositeId: string): {
  leagueCode: string;
  eventId: string;
} {
  const sep = compositeId.indexOf("-");
  return {
    leagueCode: compositeId.slice(0, sep),
    eventId: compositeId.slice(sep + 1),
  };
}

// ids arrive as the gameId half of the match id, e.g. "eng.1-401584339"
// (parseLiveMatchId already stripped the "soccer-" prefix).
export async function getSoccerGamesById(ids: string[]): Promise<liveGame[]> {
  const results = await Promise.allSettled(
    ids.map(async (compositeId) => {
      const { leagueCode, eventId } = splitSoccerGameId(compositeId);
      const { header } = await fetchJson<EspnSoccerSummary>(
        `${ESPN_SOCCER}/${leagueCode}/summary?event=${eventId}`,
      );
      return mapCompetition(leagueCode, header.id, header.competitions[0]);
    }),
  );
  return results.flatMap((r) =>
    r.status === "fulfilled" && r.value ? [r.value] : [],
  );
}
