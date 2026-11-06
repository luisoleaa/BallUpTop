import { describe, it, expect } from "vitest";
import { mapEspnCompetition, type EspnCompetition } from "./nfl_live";
import { etDateKey, toMatch } from "./live";

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
    date: "2026-10-05T17:00Z",
    status: {
      type: {
        state,
        shortDetail:
          state === "in"
            ? "9:41 - 3rd"
            : state === "post"
              ? "Final"
              : "10/5 - 1:00 PM EDT",
      },
    },
    competitors: [
      {
        homeAway: "home",
        score: scores[0],
        team: { id: "2", abbreviation: "BUF", displayName: "Buffalo Bills" },
      },
      {
        homeAway: "away",
        score: scores[1],
        team: { id: "15", abbreviation: "MIA", displayName: "Miami Dolphins" },
      },
    ],
    ...overrides,
  };
}

const REGULAR = { type: 2 };

describe("mapEspnCompetition", () => {
  it("maps a live game: state, clock, numeric scores, away/home by homeAway", () => {
    const g = mustMap(
      "401547439",
      competition("in", {}, ["17", "14"]),
      REGULAR,
    );
    expect(g.id).toBe("nfl-401547439");
    expect(g.sport).toBe("nfl");
    expect(g.state).toBe("Live");
    expect(g.clock).toBe("9:41 - 3rd");
    expect(g.away.abbr).toBe("MIA");
    expect(g.away.score).toBe(14);
    expect(g.home.abbr).toBe("BUF");
    expect(g.home.score).toBe(17);
    expect(g.league).toBe("NFL");
  });

  it("has no scores or clock before kickoff", () => {
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
      "401671793",
      competition("post", { notes: [{ headline: "AFC Championship" }] }, [
        "27",
        "20",
      ]),
      { type: 3 },
    );
    expect(g.state).toBe("Final");
    expect(g.clock).toBeNull();
    expect(g.league).toBe("NFL · AFC Championship");
  });

  it("labels preseason and prefixes non-NFL headlines", () => {
    expect(mustMap("1", competition("pre"), { type: 1 }).league).toBe(
      "NFL · Preseason",
    );
    expect(
      mustMap(
        "1",
        competition("pre", { notes: [{ headline: "Hall of Fame Game" }] }),
        { type: 1 },
      ).league,
    ).toBe("NFL · Hall of Fame Game");
  });

  it("returns null when a competition is missing an away or home side", () => {
    const malformed = competition("in");
    malformed.competitors = [malformed.competitors[0]]; // only one side present
    expect(mapEspnCompetition("1", malformed, REGULAR)).toBeNull();
  });
});

describe("NFL through the shared helpers", () => {
  it("toMatch keeps the nfl sport and real logos", () => {
    const m = toMatch(
      mustMap("401547439", competition("in", {}, ["17", "14"]), REGULAR),
    );
    expect(m.id).toBe("nfl-401547439");
    expect(m.sport).toBe("nfl");
    expect(m.status).toBe("live");
    expect(m.clock).toBe("9:41 - 3rd");
    expect(m.a.logoSport).toBe("nfl");
  });
});

describe("etDateKey", () => {
  it("uses the US Eastern calendar day", () => {
    // 02:30 UTC Oct 2 is still Oct 1 in New York.
    expect(etDateKey(new Date("2026-10-02T02:30:00Z"))).toBe("20261001");
    expect(etDateKey(new Date("2026-10-02T15:00:00Z"))).toBe("20261002");
  });
});
