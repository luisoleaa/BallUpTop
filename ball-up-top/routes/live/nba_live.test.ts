import { describe, it, expect } from "vitest";
import { mapEspnCompetition, type EspnCompetition } from "./nba_live";
import { etDateKey, selectLiveNow, toMatch } from "./live";

// Test fixtures always include a valid away/home pair, so the mapper never
// returns null here — assert that so call sites don't need `!` everywhere.
function mustMap(
  ...args: Parameters<typeof mapEspnCompetition>
): NonNullable<ReturnType<typeof mapEspnCompetition>> {
  const g = mapEspnCompetition(...args);
  if (!g) throw new Error("mapEspnCompetition unexpectedly returned null");
  return g;
}

// Trimmed ESPN competition, shaped like the real scoreboard/summary payloads.
function competition(
  state: "pre" | "in" | "post",
  overrides: Partial<EspnCompetition> = {},
  scores: [string | undefined, string | undefined] = ["0", "0"],
): EspnCompetition {
  return {
    date: "2026-10-03T23:00Z",
    status: {
      type: {
        state,
        shortDetail:
          state === "in"
            ? "4:12 - 3rd"
            : state === "post"
              ? "Final"
              : "10/3 - 7:00 PM EDT",
      },
    },
    competitors: [
      {
        homeAway: "home",
        score: scores[0],
        team: { id: "28", abbreviation: "TOR", displayName: "Toronto Raptors" },
      },
      {
        homeAway: "away",
        score: scores[1],
        team: { id: "14", abbreviation: "MIA", displayName: "Miami Heat" },
      },
    ],
    ...overrides,
  };
}

const REGULAR = { type: 2 };

describe("mapEspnCompetition", () => {
  it("maps a live game: state, clock, numeric scores, away/home by homeAway", () => {
    const g = mustMap(
      "401902644",
      competition("in", {}, ["71", "68"]),
      REGULAR,
    );
    expect(g.id).toBe("nba-401902644");
    expect(g.sport).toBe("nba");
    expect(g.state).toBe("Live");
    expect(g.clock).toBe("4:12 - 3rd");
    expect(g.away.abbr).toBe("MIA");
    expect(g.away.score).toBe(68);
    expect(g.home.abbr).toBe("TOR");
    expect(g.home.score).toBe(71);
    expect(g.league).toBe("NBA");
  });

  it("has no scores or clock before tip-off", () => {
    const g = mustMap("1", competition("pre", {}, ["0", "0"]), REGULAR);
    expect(g.state).toBe("Preview");
    expect(g.clock).toBeNull();
    expect(g.home.score).toBeNull();
    expect(g.away.score).toBeNull();
  });

  it("handles a missing score field (summary endpoint, pre-game)", () => {
    const g = mustMap(
      "1",
      competition("pre", {}, [undefined, undefined]),
      REGULAR,
    );
    expect(g.home.score).toBeNull();
  });

  it("maps a final game and uses a playoff headline as the league", () => {
    const g = mustMap(
      "401859966",
      competition("post", { notes: [{ headline: "NBA Finals - Game 4" }] }, [
        "107",
        "106",
      ]),
      { type: 3 },
    );
    expect(g.state).toBe("Final");
    expect(g.clock).toBeNull();
    expect(g.league).toBe("NBA Finals - Game 4");
  });

  it("labels preseason and prefixes non-NBA headlines", () => {
    expect(mustMap("1", competition("pre"), { type: 1 }).league).toBe(
      "NBA · Preseason",
    );
    expect(
      mustMap(
        "1",
        competition("pre", { notes: [{ headline: "Canada Games 2026" }] }),
        { type: 1 },
      ).league,
    ).toBe("NBA · Canada Games 2026");
  });

  it("returns null when a competition is missing an away or home side", () => {
    const malformed = competition("in");
    malformed.competitors = [malformed.competitors[0]]; // only one side present
    expect(mapEspnCompetition("1", malformed, REGULAR)).toBeNull();
  });
});

describe("NBA through the shared helpers", () => {
  it("toMatch keeps the nba sport and real logos", () => {
    const m = toMatch(
      mustMap("401902644", competition("in", {}, ["71", "68"]), REGULAR),
    );
    expect(m.id).toBe("nba-401902644");
    expect(m.sport).toBe("nba");
    expect(m.status).toBe("live");
    expect(m.clock).toBe("4:12 - 3rd");
    expect(m.a.logoSport).toBe("nba");
  });

  it("selectLiveNow puts live games from both sports first", () => {
    const nbaLive = mustMap("2", competition("in"), REGULAR);
    const nbaUpcoming = mustMap("3", competition("pre"), REGULAR);
    const mlbLive = {
      ...nbaLive,
      id: "mlb-9",
      sport: "mlb" as const,
      gameId: "9",
    };
    const result = selectLiveNow([nbaUpcoming, mlbLive, nbaLive]);
    expect(result.map((g) => g.id)).toEqual(["mlb-9", "nba-2", "nba-3"]);
  });
});

describe("etDateKey", () => {
  it("uses the US Eastern calendar day", () => {
    // 02:30 UTC Oct 2 is still Oct 1 in New York.
    expect(etDateKey(new Date("2026-10-02T02:30:00Z"))).toBe("20261001");
    expect(etDateKey(new Date("2026-10-02T15:00:00Z"))).toBe("20261002");
  });
});
