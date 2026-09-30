interface liveTeam {
  id: number;
  name: string;
  abbr: string;
  score: number | null;
}

export interface liveGame {
  id: string;
  sport: "mlb";
  state: string;
  startTime: string;
  gameId: number;
  away: liveTeam;
  home: liveTeam;
}

interface MlbTeamSide {
  team: { id: number; name: string; abbreviation: string };
  score?: number;
}

interface MlbGame {
  gameGuid: string;
  gamePk: number;
  gameDate: string;
  gameNumber: number;
  status: { abstractGameState: string; detailedState: string };
  teams: { away: MlbTeamSide; home: MlbTeamSide };
  linescore?: {
    currentInningOrdinal?: string;
    inningState?: string;
    outs?: number;
    offense?: any;
  };
}

export interface MlbScheduleResponse {
  dates: { games: MlbGame[] }[];
}

async function fetchMlbLiveData(): Promise<MlbScheduleResponse> {
  const res = await fetch("https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=linescore,team", {
    cache: "no-store",
  });
  const data = await res.json();
  return data;
}

export function mapMlbGame(raw: MlbGame): liveGame {
  return {
    id: raw.gameGuid,
    sport: "mlb",
    state: raw.status.abstractGameState,
    startTime: raw.gameDate,
    gameId: raw.gamePk,
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
  const data = await fetchMlbLiveData();
  const games = data.dates[0]?.games ?? [];
  return games.map((g) => mapMlbGame(g));
}
