// NBA source for the live-games feed: ESPN's keyless site API. (The official
// cdn.nba.com live scoreboard returns 403 to server requests.) Like the ESPN
// logo CDN, this is unofficial and could change without notice.
import {
  fetchEtDateRangeEvents,
  liveMatchId,
  type liveGame,
  type liveTeam,
} from "./live";

const ESPN_NBA = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";

interface EspnCompetitor {
  homeAway: "home" | "away";
  score?: string;
  team: { id: string; abbreviation: string; displayName: string };
}

export interface EspnCompetition {
  date: string;
  status: { type: { state: "pre" | "in" | "post"; shortDetail: string } };
  notes?: { headline?: string }[];
  competitors: EspnCompetitor[];
}

// season.type: 1 preseason, 2 regular season, 3 postseason
interface EspnSeason {
  type: number;
}

interface EspnScoreboard {
  events: { id: string; season: EspnSeason; competitions: EspnCompetition[] }[];
}

// The summary endpoint puts the playoff label in header.gameNote rather than
// competitions[0].notes like the scoreboard does.
interface EspnSummary {
  header: {
    id: string;
    season: EspnSeason;
    gameNote?: string;
    competitions: EspnCompetition[];
  };
}

const STATE: Record<EspnCompetition["status"]["type"]["state"], string> = {
  pre: "Preview",
  in: "Live",
  post: "Final",
};

function toTeam(c: EspnCompetitor, started: boolean): liveTeam {
  return {
    id: Number(c.team.id),
    name: c.team.displayName,
    abbr: c.team.abbreviation,
    score:
      started && c.score != null && c.score !== "" ? Number(c.score) : null,
  };
}

function leagueLabel(competition: EspnCompetition, season: EspnSeason): string {
  const headline = competition.notes?.[0]?.headline;
  if (headline)
    return headline.startsWith("NBA") ? headline : `NBA · ${headline}`;
  return season.type === 1 ? "NBA · Preseason" : "NBA";
}

// Shared by the scoreboard (events) and summary (header) endpoints, which
// both carry the same competition shape. Returns null for a malformed
// competition missing an away/home side (e.g. a TBD/placeholder slot), so
// one bad event can't throw and blank every NBA game for the poll cycle.
export function mapEspnCompetition(
  id: string,
  competition: EspnCompetition,
  season: EspnSeason,
): liveGame | null {
  const state = STATE[competition.status.type.state] ?? "Preview";
  const started = state !== "Preview";
  const away = competition.competitors.find((c) => c.homeAway === "away");
  const home = competition.competitors.find((c) => c.homeAway === "home");
  if (!away || !home) return null;
  const gameId = id;

  return {
    id: liveMatchId("nba", gameId),
    sport: "nba",
    state,
    startTime: competition.date,
    gameId,
    clock: state === "Live" ? competition.status.type.shortDetail : null,
    league: leagueLabel(competition, season),
    away: toTeam(away, started),
    home: toTeam(home, started),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`ESPN NBA request failed: ${res.status}`);
  return res.json();
}

// Yesterday + today (ET): ESPN with no date returns the *next* game day, and a
// late West Coast game still live past midnight ET belongs to yesterday. See
// fetchEtDateRangeEvents in live.ts for why this isn't a single range request.
export async function getLiveNbaGames(
  now: Date = new Date(),
): Promise<liveGame[]> {
  const events = await fetchEtDateRangeEvents<EspnScoreboard["events"][number]>(
    (dates) =>
      fetchJson<EspnScoreboard>(`${ESPN_NBA}/scoreboard?dates=${dates}`),
    now,
  );

  return (
    events
      // A placeholder/TBD event can carry an empty competitions array; skip it
      // rather than hand mapEspnCompetition an undefined competition, which
      // would throw before its own away/home-side guard ever runs.
      .filter((e) => e.competitions.length > 0)
      .map((e) => mapEspnCompetition(e.id, e.competitions[0], e.season))
      .filter((g) => g != null)
  );
}

// Look up specific games (any date) by ESPN event id. ESPN has no batch
// lookup, so this is one request per game; failed ids are skipped.
export async function getNbaGamesById(ids: string[]): Promise<liveGame[]> {
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const { header } = await fetchJson<EspnSummary>(
        `${ESPN_NBA}/summary?event=${id}`,
      );
      const competition = header.competitions[0];
      // header.season is typed as required, but that's only a TS-side
      // contract -- a malformed/placeholder response could omit it at
      // runtime the same way an empty competitions array can happen, and
      // leagueLabel() unconditionally dereferences season.type.
      if (!competition || !header.season) return null;
      const notes = competition.notes?.length
        ? competition.notes
        : header.gameNote
          ? [{ headline: header.gameNote }]
          : [];
      return mapEspnCompetition(
        header.id,
        { ...competition, notes },
        header.season,
      );
    }),
  );
  return results.flatMap((r) =>
    r.status === "fulfilled" && r.value ? [r.value] : [],
  );
}
