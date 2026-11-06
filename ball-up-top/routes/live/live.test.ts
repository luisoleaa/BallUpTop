import { describe, it, expect } from "vitest";
import {
  liveMatchId,
  parseLiveMatchId,
  selectLiveNow,
  toMatch,
  toSide,
  type liveGame,
} from "./live";

function makeLiveGame(
  id: string,
  state: string,
  overrides: Partial<liveGame> = {},
): liveGame {
  const [sport, ...rest] = id.split("-");
  return {
    id,
    sport: sport as liveGame["sport"],
    state,
    startTime: "2026-10-05T18:00:00Z",
    gameId: rest.join("-"),
    clock: state === "Live" ? "clock" : null,
    league: "League",
    away: { id: 1, name: "Away", abbr: "AWY", score: 0 },
    home: { id: 2, name: "Home", abbr: "HOM", score: 0 },
    ...overrides,
  };
}

describe("selectLiveNow round-robin fairness", () => {
  it("interleaves live games one-per-sport-per-pass with uneven counts across 3+ sports", () => {
    // mlb: 3 simultaneous live games, nba: 1, soccer: 2.
    const games = [
      makeLiveGame("mlb-1", "Live"),
      makeLiveGame("mlb-2", "Live"),
      makeLiveGame("mlb-3", "Live"),
      makeLiveGame("nba-1", "Live"),
      makeLiveGame("soccer-eng.1-1", "Live"),
      makeLiveGame("soccer-eng.1-2", "Live"),
    ];
    const result = selectLiveNow(games, 10);
    expect(result.map((g) => g.id)).toEqual([
      "mlb-1",
      "nba-1",
      "soccer-eng.1-1",
      "mlb-2",
      "soccer-eng.1-2",
      "mlb-3",
    ]);
  });

  it("degenerates to plain filter order with a single sport", () => {
    const games = [
      makeLiveGame("mlb-1", "Live"),
      makeLiveGame("mlb-2", "Live"),
    ];
    expect(selectLiveNow(games, 10).map((g) => g.id)).toEqual([
      "mlb-1",
      "mlb-2",
    ]);
  });

  it("still fills remaining slots with soonest-upcoming after live games, excluding final", () => {
    const games = [
      makeLiveGame("mlb-1", "Live"),
      makeLiveGame("ufc-1", "Live"),
      makeLiveGame("nba-1", "Final"),
      makeLiveGame("soccer-eng.1-1", "Preview", {
        startTime: "2026-10-05T20:00:00Z",
      }),
      makeLiveGame("nfl-1", "Preview", { startTime: "2026-10-05T19:00:00Z" }),
    ];
    const result = selectLiveNow(games, 10);
    expect(result.map((g) => g.id)).toEqual([
      "mlb-1",
      "ufc-1",
      "nfl-1",
      "soccer-eng.1-1",
    ]);
  });
});

describe("toSide / toMatch passthrough", () => {
  it("sets logoSport for mlb/nba/nfl and passes logoUrl/flag through for soccer/ufc instead", () => {
    const mlbSide = toSide({ id: 1, name: "A", abbr: "A", score: 0 }, "mlb");
    expect(mlbSide.logoSport).toBe("mlb");
    expect(mlbSide.logoUrl).toBeUndefined();

    const soccerSide = toSide(
      { id: 1, name: "A", abbr: "A", score: 0, logoUrl: "https://x/a.png" },
      "soccer",
    );
    expect(soccerSide.logoSport).toBeUndefined();
    expect(soccerSide.logoUrl).toBe("https://x/a.png");

    const ufcSide = toSide(
      { id: 1, name: "A", abbr: "A", score: "W", flag: "us" },
      "ufc",
    );
    expect(ufcSide.logoSport).toBeUndefined();
    expect(ufcSide.flag).toBe("us");
    expect(ufcSide.score).toBe("W");
  });

  it("toMatch passes note through generically with no sport branching", () => {
    const game = makeLiveGame("ufc-1", "Final", { note: "Round 3 · 3:26" });
    expect(toMatch(game).note).toBe("Round 3 · 3:26");
  });

  it("toMatch leaves note undefined when the provider didn't set one", () => {
    const game = makeLiveGame("mlb-1", "Live");
    expect(toMatch(game).note).toBeUndefined();
  });
});

describe("id round-tripping for a soccer composite id", () => {
  it("round-trips liveMatchId/parseLiveMatchId for a league-qualified soccer id", () => {
    const id = liveMatchId("soccer", "eng.1-401584339");
    expect(id).toBe("soccer-eng.1-401584339");
    expect(parseLiveMatchId(id)).toEqual({
      sport: "soccer",
      gameId: "eng.1-401584339",
    });
  });
});
