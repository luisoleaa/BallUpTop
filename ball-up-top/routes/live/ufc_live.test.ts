import { describe, it, expect } from "vitest";
import {
  flattenScoreboard,
  mapFight,
  splitUfcGameId,
  type EspnUfcCompetition,
  type EspnUfcScoreboard,
} from "./ufc_live";
import { toMatch } from "./live";

// Test fixtures always include both fighters, so the mapper never returns
// null here — assert that so call sites don't need `!` everywhere.
function mustMap(
  ...args: Parameters<typeof mapFight>
): NonNullable<ReturnType<typeof mapFight>> {
  const g = mapFight(...args);
  if (!g) throw new Error("mapFight unexpectedly returned null");
  return g;
}

// Trimmed ESPN MMA competition, shaped like the real scoreboard payload
// (verified against a live fetch — see ufc_live.ts's header comment).
function fight(
  state: "pre" | "in" | "post",
  overrides: Partial<EspnUfcCompetition> = {},
): EspnUfcCompetition {
  return {
    id: "401907089",
    date: "2026-10-03T20:00Z",
    status: {
      period: state === "pre" ? 0 : state === "in" ? 2 : 3,
      displayClock: state === "pre" ? "-" : state === "in" ? "3:12" : "3:26",
      type: {
        state,
        shortDetail: state === "post" ? "Final" : "10/3 - 4:00 PM EDT",
      },
    },
    competitors: [
      {
        id: "2504639",
        winner: false,
        athlete: {
          displayName: "Court McGee",
          shortName: "C. McGee",
          flag: {
            href: "https://a.espncdn.com/i/teamlogos/countries/500/usa.png",
            alt: "USA",
          },
        },
      },
      {
        id: "5290958",
        winner: state === "post",
        athlete: {
          displayName: "Eric Nolan",
          shortName: "E. Nolan",
          flag: {
            href: "https://a.espncdn.com/i/teamlogos/countries/500/fra.png",
            alt: "France",
          },
        },
      },
    ],
    ...overrides,
  };
}

describe("mapFight", () => {
  it("maps a live fight: state, round/time clock, no scores yet, flagged ids", () => {
    const g = mustMap("UFC 332: Silva vs. Wang", fight("in"));
    expect(g.id).toBe("ufc-20261003-401907089");
    expect(g.sport).toBe("ufc");
    expect(g.state).toBe("Live");
    expect(g.clock).toBe("Round 2 · 3:12");
    expect(g.away.score).toBeNull();
    expect(g.home.score).toBeNull();
    expect(g.league).toBe("UFC 332: Silva vs. Wang");
  });

  it("has no clock before the fight starts", () => {
    const g = mustMap("UFC 332: Silva vs. Wang", fight("pre"));
    expect(g.state).toBe("Preview");
    expect(g.clock).toBeNull();
    expect(g.away.score).toBeNull();
  });

  it("maps a final fight: W/L scores and a round/time note instead of a clock", () => {
    const g = mustMap("UFC 332: Silva vs. Wang", fight("post"));
    expect(g.state).toBe("Final");
    expect(g.clock).toBeNull();
    expect(g.away.score).toBe("L"); // McGee (competitors[0]) did not win
    expect(g.home.score).toBe("W"); // Nolan (competitors[1]) won
    expect(g.note).toBe("Round 3 · 3:26");
  });

  it("derives a 3-letter abbreviation from the fighter's surname", () => {
    const g = mustMap("UFC 332: Silva vs. Wang", fight("pre"));
    expect(g.away.abbr).toBe("MCGEE".slice(0, 3));
    expect(g.home.abbr).toBe("NOLAN".slice(0, 3));
  });

  it("maps a known ESPN country code to its FlagBadge equivalent, and leaves unknown codes unmapped", () => {
    const g = mustMap("UFC 332: Silva vs. Wang", fight("pre"));
    expect(g.away.flag).toBe("us"); // usa -> us
    expect(g.home.flag).toBeUndefined(); // fra has no FlagBadge equivalent
  });

  it("returns null when a fight is missing one of its two fighters", () => {
    const malformed = fight("in");
    malformed.competitors = [malformed.competitors[0]]; // withdrawn/TBD opponent
    expect(mapFight("UFC 332: Silva vs. Wang", malformed)).toBeNull();
  });
});

describe("flattenScoreboard", () => {
  it("flattens one event's multiple competitions into multiple liveGames, each carrying the event name as league", () => {
    const scoreboard: EspnUfcScoreboard = {
      events: [
        {
          id: "600061182",
          name: "UFC 332: Silva vs. Wang",
          competitions: [
            fight("post", { id: "401907089" }),
            fight("post", { id: "401912275" }),
          ],
        },
      ],
    };
    const games = flattenScoreboard(scoreboard);
    expect(games).toHaveLength(2);
    expect(games.map((g) => g.id)).toEqual([
      "ufc-20261003-401907089",
      "ufc-20261003-401912275",
    ]);
    expect(games.every((g) => g.league === "UFC 332: Silva vs. Wang")).toBe(
      true,
    );
  });

  it("skips a malformed fight without dropping the rest of the card", () => {
    const malformed = fight("in", { id: "401912275" });
    malformed.competitors = [malformed.competitors[0]];
    const scoreboard: EspnUfcScoreboard = {
      events: [
        {
          id: "600061182",
          name: "UFC 332: Silva vs. Wang",
          competitions: [fight("in", { id: "401907089" }), malformed],
        },
      ],
    };
    const games = flattenScoreboard(scoreboard);
    expect(games.map((g) => g.id)).toEqual(["ufc-20261003-401907089"]);
  });
});

describe("UFC through the shared helpers", () => {
  it("toMatch has no logoSport/logoUrl for UFC sides, so Crest falls through to the flag/monogram chain", () => {
    const m = toMatch(mustMap("UFC 332: Silva vs. Wang", fight("in")));
    expect(m.sport).toBe("ufc");
    expect(m.a.logoSport).toBeUndefined();
    expect(m.a.logoUrl).toBeUndefined();
  });
});

describe("splitUfcGameId", () => {
  it("splits a date-qualified composite id on the first dash", () => {
    expect(splitUfcGameId("20261003-401907089")).toEqual({
      dateKey: "20261003",
      competitionId: "401907089",
    });
  });
});
