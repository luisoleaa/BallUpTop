import { describe, it, expect } from "vitest";
import { mapMlbGame } from "./mlb_live";
import {
  liveMatchId,
  parseLiveMatchId,
  selectLiveNow,
  toMatch,
  type liveGame,
} from "./live";

describe("mapMlbGame", () => {
  it("extracts abbreviation correctly", () => {
    const raw = {
      gameGuid: "test-game",
      gamePk: 123,
      gameDate: "2026-10-01T18:00:00Z",
      gameNumber: 1,
      status: { abstractGameState: "Live", detailedState: "In Progress" },
      teams: {
        away: {
          team: { id: 111, name: "New York Yankees", abbreviation: "NYY" },
          score: 5,
        },
        home: {
          team: { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
          score: 3,
        },
      },
      linescore: { inningState: "Top", currentInningOrdinal: "6th" },
    };

    const result = mapMlbGame(raw as any);
    expect(result.away.abbr).toBe("NYY");
    expect(result.home.abbr).toBe("WSH");
    expect(result.clock).toBe("Top 6th");
    expect(result.id).toBe("mlb-123");
  });

  it("handles missing inning gracefully", () => {
    const raw = {
      gameGuid: "test-game-preview",
      gamePk: 124,
      gameDate: "2026-10-02T19:00:00Z",
      gameNumber: 1,
      status: { abstractGameState: "Preview", detailedState: "Pre-Game" },
      teams: {
        away: {
          team: { id: 119, name: "Seattle Mariners", abbreviation: "SEA" },
          score: undefined,
        },
        home: {
          team: { id: 116, name: "Detroit Tigers", abbreviation: "DET" },
          score: undefined,
        },
      },
      linescore: undefined,
    };

    const result = mapMlbGame(raw as any);
    expect(result.clock).toBeNull();
    expect(result.away.score).toBeNull();
    expect(result.home.score).toBeNull();
  });
});

describe("selectLiveNow", () => {
  const makeLiveGame = (
    id: string,
    state: string,
    startTime: string,
  ): liveGame => ({
    id,
    sport: "mlb",
    state,
    startTime,
    gameId: id,
    clock: state === "Live" ? "Top 5th" : null,
    league: "MLB",
    away: { id: 1, name: "Away", abbr: "AWY", score: 0 },
    home: { id: 2, name: "Home", abbr: "HOM", score: 0 },
  });

  it("returns all live games when count is less than target", () => {
    const games = [
      makeLiveGame("1", "Live", "2026-10-01T10:00:00Z"),
      makeLiveGame("2", "Live", "2026-10-01T11:00:00Z"),
      makeLiveGame("3", "Preview", "2026-10-01T19:00:00Z"),
      makeLiveGame("4", "Final", "2026-10-01T22:00:00Z"),
    ];

    const result = selectLiveNow(games, 6);
    expect(result).toHaveLength(3); // 2 live + 1 upcoming
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
    expect(result[2].id).toBe("3");
  });

  it("fills remaining slots with upcoming games sorted by start time", () => {
    const games = [
      makeLiveGame("1", "Live", "2026-10-01T10:00:00Z"),
      makeLiveGame("2", "Preview", "2026-10-01T20:00:00Z"),
      makeLiveGame("3", "Preview", "2026-10-01T18:00:00Z"),
      makeLiveGame("4", "Preview", "2026-10-01T19:00:00Z"),
    ];

    const result = selectLiveNow(games, 4);
    expect(result).toHaveLength(4); // 1 live + 3 upcoming (all of them)
    expect(result[0].id).toBe("1"); // live
    expect(result[1].id).toBe("3"); // earliest upcoming (18:00)
    expect(result[2].id).toBe("4"); // next (19:00)
    expect(result[3].id).toBe("2"); // last (20:00)
  });

  it("excludes final games", () => {
    const games = [
      makeLiveGame("1", "Final", "2026-10-01T10:00:00Z"),
      makeLiveGame("2", "Final", "2026-10-01T11:00:00Z"),
      makeLiveGame("3", "Preview", "2026-10-01T19:00:00Z"),
    ];

    const result = selectLiveNow(games, 6);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("returns empty array when no live or upcoming games", () => {
    const games = [
      makeLiveGame("1", "Final", "2026-10-01T10:00:00Z"),
      makeLiveGame("2", "Final", "2026-10-01T11:00:00Z"),
    ];

    const result = selectLiveNow(games, 6);
    expect(result).toHaveLength(0);
  });

  it("respects target count", () => {
    const games = [
      makeLiveGame("1", "Preview", "2026-10-01T18:00:00Z"),
      makeLiveGame("2", "Preview", "2026-10-01T19:00:00Z"),
      makeLiveGame("3", "Preview", "2026-10-01T20:00:00Z"),
    ];

    const result = selectLiveNow(games, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });
});

describe("live match ids", () => {
  it("round-trips a gamePk", () => {
    expect(liveMatchId("mlb", "849841")).toBe("mlb-849841");
    expect(parseLiveMatchId("mlb-849841")).toEqual({
      sport: "mlb",
      gameId: "849841",
    });
    expect(parseLiveMatchId("nba-401902644")).toEqual({
      sport: "nba",
      gameId: "401902644",
    });
  });

  it("gameId is opaque: a composite id (soccer's league-qualified id) round-trips verbatim", () => {
    expect(parseLiveMatchId("soccer-eng.1-401584339")).toEqual({
      sport: "soccer",
      gameId: "eng.1-401584339",
    });
  });

  it("rejects mock and malformed ids", () => {
    expect(parseLiveMatchId("m4")).toBeNull();
    expect(parseLiveMatchId("mlb-")).toBeNull();
    expect(parseLiveMatchId("nhl-5")).toBeNull();
  });
});

describe("toMatch", () => {
  const base: liveGame = {
    id: "mlb-849841",
    sport: "mlb",
    state: "Live",
    startTime: "2026-10-01T23:05:00Z",
    gameId: "849841",
    clock: "Top 8th",
    league: "MLB · NL Wild Card Series",
    away: { id: 143, name: "Philadelphia Phillies", abbr: "PHI", score: 3 },
    home: { id: 144, name: "Atlanta Braves", abbr: "ATL", score: 4 },
  };

  it("maps a live game: away is side a, inning becomes the clock, real logos", () => {
    const m = toMatch(base);
    expect(m.id).toBe("mlb-849841");
    expect(m.status).toBe("live");
    expect(m.clock).toBe("Top 8th");
    expect(m.a.abbr).toBe("PHI");
    expect(m.b.score).toBe(4);
    expect(m.a.logoSport).toBe("mlb");
    expect(m.avg).toBeNull();
  });

  it("formats dates in US Eastern", () => {
    expect(toMatch({ ...base, state: "Final" }).date).toBe("Oct 1, 2026");
    expect(toMatch({ ...base, state: "Preview" }).date).toBe(
      "Oct 1, 7:05 PM ET",
    );
  });
});
