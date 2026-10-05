// MLB source for the live-games feed: the keyless MLB Stats API.
import { liveMatchId, type liveGame } from "./live";

interface MlbTeamSide {
  team: { id: number; name: string; abbreviation: string };
  score?: number;
}

interface MlbGame {
  gameGuid: string;
  gamePk: number;
  gameDate: string;
  gameNumber: number;
  seriesDescription?: string;
  status: { abstractGameState: string; detailedState: string };
  teams: { away: MlbTeamSide; home: MlbTeamSide };
  linescore?: {
    currentInningOrdinal?: string;
    inningState?: string;
    outs?: number;
    offense?: unknown;
  };
}

export interface MlbScheduleResponse {
  dates: { games: MlbGame[] }[];
}

const SCHEDULE_URL =
  "https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=linescore,team";

async function fetchSchedule(url: string): Promise<MlbScheduleResponse> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`MLB schedule request failed: ${res.status}`);
  return res.json();
}

export function mapMlbGame(raw: MlbGame): liveGame {
  const state = raw.status.abstractGameState;
  const inningState = raw.linescore?.inningState;
  const currentInning = raw.linescore?.currentInningOrdinal;
  const clock =
    state === "Live" && inningState && currentInning
      ? `${inningState} ${currentInning}`
      : null;
  const gameId = String(raw.gamePk);

  return {
    id: liveMatchId("mlb", gameId),
    sport: "mlb",
    state,
    startTime: raw.gameDate,
    gameId,
    clock,
    league: raw.seriesDescription ? `MLB · ${raw.seriesDescription}` : "MLB",
    away: {
      id: raw.teams.away.team.id,
      name: raw.teams.away.team.name,
      abbr: raw.teams.away.team.abbreviation,
      score: raw.teams.away.score ?? null,
    },
    home: {
      id: raw.teams.home.team.id,
      name: raw.teams.home.team.name,
      abbr: raw.teams.home.team.abbreviation,
      score: raw.teams.home.score ?? null,
    },
  };
}

export async function getLiveMlbGames(): Promise<liveGame[]> {
  const data = await fetchSchedule(SCHEDULE_URL);
  const games = data.dates[0]?.games ?? [];
  return games.map((g) => mapMlbGame(g));
}

// Look up specific games (any date) by gamePk, e.g. for a detail page or the diary.
export async function getMlbGamesByPk(gamePks: string[]): Promise<liveGame[]> {
  if (gamePks.length === 0) return [];
  const data = await fetchSchedule(
    `${SCHEDULE_URL}&gamePks=${gamePks.join(",")}`,
  );
  return (data.dates ?? []).flatMap((d) => d.games).map((g) => mapMlbGame(g));
}
