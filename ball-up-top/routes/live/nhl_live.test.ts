import { describe, it, expect } from "vitest";
import { mapEspnCompetition, type EspnCompetition } from "./nhl_live";
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

// Trimmed ESPN competition, shaped like the real scoreboard/summary payloads
// (verified live against site.api.espn.com/.../hockey/nhl).
function competition(
  state: "pre" | "in" | "post",
  overrides: Partial<EspnCompetition> = {},
  scores: [string | undefined, string | undefined] = ["0", "0"],
): EspnCompetition {
  return {
    date: "2026-10-13T22:00Z",
    status: {
      type: {
        state,
        shortDetail:
          state === "in"
            ? "12:04 - 2nd"
            : state === "post"
              ? "Final"
              : "10/13 - 6:00 PM EDT",
      },
    },
    competitors: [
      {
        homeAway: "home",
        score: scores[0],
        team: {
          id: "5",
          abbreviation: "DET",
          displayName: "Detroit Red Wings",
        },
      },
      {
        homeAway: "away",
        score: scores[1],
        team: {
          id: "11",
          abbreviation: "NJ",
          displayName: "New Jersey Devils",
        },
      },
    ],
    ...overrides,
  };
}

const REGULAR = { type: 2 };

describe("mapEspnCompetition", () => {
  it("maps a live game: state, clock, numeric scores, away/home by homeAway", () => {
    const g = mustMap("401892488", competition("in", {}, ["3", "2"]), REGULAR);
    expect(g.id).toBe("nhl-401892488");
    expect(g.sport).toBe("nhl");
    expect(g.state).toBe("Live");
    expect(g.clock).toBe("12:04 - 2nd");
    expect(g.away.abbr).toBe("NJ");
    expect(g.away.score).toBe(2);
    expect(g.home.abbr).toBe("DET");
    expect(g.home.score).toBe(3);
    expect(g.league).toBe("NHL");
  });

  it("has no scores or clock before puck drop", () => {
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
      competition("post", { notes: [{ headline: "Stanley Cup Final" }] }, [
        "4",
        "3",
      ]),
      { type: 3 },
    );
    expect(g.state).toBe("Final");
    expect(g.clock).toBeNull();
    expect(g.league).toBe("NHL · Stanley Cup Final");
  });

  it("labels preseason and prefixes non-NHL headlines", () => {
    expect(mustMap("1", competition("pre"), { type: 1 }).league).toBe(
      "NHL · Preseason",
    );
    expect(
      mustMap(
        "1",
        competition("pre", { notes: [{ headline: "Winter Classic" }] }),
        { type: 1 },
      ).league,
    ).toBe("NHL · Winter Classic");
  });

  it("returns null when a competition is missing an away or home side", () => {
    const malformed = competition("in");
    malformed.competitors = [malformed.competitors[0]]; // only one side present
    expect(mapEspnCompetition("1", malformed, REGULAR)).toBeNull();
  });
});

describe("NHL through the shared helpers", () => {
  it("toMatch keeps the nhl sport, falling back to the monogram crest (no ESPN-CDN tier for nhl)", () => {
    const m = toMatch(
      mustMap("401892488", competition("in", {}, ["3", "2"]), REGULAR),
    );
    expect(m.id).toBe("nhl-401892488");
    expect(m.sport).toBe("nhl");
    expect(m.status).toBe("live");
    expect(m.clock).toBe("12:04 - 2nd");
    expect(m.a.logoSport).toBeUndefined();
  });
});

describe("etDateKey", () => {
  it("uses the US Eastern calendar day", () => {
    // 02:30 UTC Oct 2 is still Oct 1 in New York.
    expect(etDateKey(new Date("2026-10-02T02:30:00Z"))).toBe("20261001");
    expect(etDateKey(new Date("2026-10-02T15:00:00Z"))).toBe("20261002");
  });
});
