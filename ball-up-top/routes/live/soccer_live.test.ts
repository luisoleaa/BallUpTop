import { describe, it, expect } from "vitest";
import {
  mapCompetition,
  splitSoccerGameId,
  type EspnSoccerCompetition,
} from "./soccer_live";
import { toMatch } from "./live";

// Test fixtures always include a valid away/home pair, so the mapper never
// returns null here — assert that so call sites don't need `!` everywhere.
function mustMap(
  ...args: Parameters<typeof mapCompetition>
): NonNullable<ReturnType<typeof mapCompetition>> {
  const g = mapCompetition(...args);
  if (!g) throw new Error("mapCompetition unexpectedly returned null");
  return g;
}

// Trimmed ESPN soccer competition, shaped like the real scoreboard/summary payloads.
function competition(
  state: "pre" | "in" | "post",
  overrides: Partial<EspnSoccerCompetition> = {},
  scores: [string | undefined, string | undefined] = ["0", "0"],
): EspnSoccerCompetition {
  return {
    date: "2026-10-05T14:00Z",
    status: {
      type: {
        state,
        shortDetail:
          state === "in"
            ? "67'"
            : state === "post"
              ? "FT"
              : "10/5 - 10:00 AM EDT",
      },
    },
    competitors: [
      {
        homeAway: "home",
        score: scores[0],
        team: {
          id: "359",
          abbreviation: "ARS",
          displayName: "Arsenal",
          logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
        },
      },
      {
        homeAway: "away",
        score: scores[1],
        team: {
          id: "382",
          abbreviation: "CHE",
          displayName: "Chelsea",
          logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
        },
      },
    ],
    ...overrides,
  };
}

describe("mapCompetition", () => {
  it("reads logoUrl from the summary endpoint's logos array when the scoreboard's single logo field is absent", () => {
    const g = mustMap(
      "eng.1",
      "401584339",
      competition("pre", {
        competitors: [
          {
            homeAway: "home",
            score: "0",
            team: {
              id: "359",
              abbreviation: "ARS",
              displayName: "Arsenal",
              logos: [
                {
                  href: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
                },
              ],
            },
          },
          {
            homeAway: "away",
            score: "0",
            team: {
              id: "382",
              abbreviation: "CHE",
              displayName: "Chelsea",
              logos: [
                {
                  href: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
                },
              ],
            },
          },
        ],
      }),
    );
    expect(g.home.logoUrl).toBe(
      "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
    );
    expect(g.away.logoUrl).toBe(
      "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    );
  });

  it("maps a live match: state, clock, numeric scores, away/home by homeAway, league label, and logoUrl", () => {
    const g = mustMap("eng.1", "401584339", competition("in", {}, ["2", "1"]));
    expect(g.id).toBe("soccer-eng.1-401584339");
    expect(g.sport).toBe("soccer");
    expect(g.state).toBe("Live");
    expect(g.clock).toBe("67'");
    expect(g.away.abbr).toBe("CHE");
    expect(g.away.score).toBe(1);
    expect(g.away.logoUrl).toBe(
      "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    );
    expect(g.home.abbr).toBe("ARS");
    expect(g.home.score).toBe(2);
    expect(g.league).toBe("Premier League");
  });

  it("has no scores or clock before kickoff", () => {
    const g = mustMap("esp.1", "1", competition("pre", {}, ["0", "0"]));
    expect(g.state).toBe("Preview");
    expect(g.clock).toBeNull();
    expect(g.home.score).toBeNull();
    expect(g.away.score).toBeNull();
  });

  it("falls back to the raw league code when unmapped", () => {
    const g = mustMap("bra.1", "1", competition("pre"));
    expect(g.league).toBe("bra.1");
  });

  it("derives an abbreviation from the display name when ESPN omits it", () => {
    const g = mustMap(
      "uefa.champions",
      "1",
      competition("pre", {
        competitors: [
          {
            homeAway: "home",
            score: "0",
            team: { id: "1", displayName: "Paris Saint-Germain" },
          },
          {
            homeAway: "away",
            score: "0",
            team: { id: "2", displayName: "Inter Milan", abbreviation: "INT" },
          },
        ],
      }),
    );
    expect(g.home.abbr).toBe("PAR");
    expect(g.away.abbr).toBe("INT");
  });

  it("returns null when a competition is missing an away or home side", () => {
    const malformed = competition("in");
    malformed.competitors = [malformed.competitors[0]]; // only one side present
    expect(mapCompetition("eng.1", "1", malformed)).toBeNull();
  });
});

describe("soccer through the shared helpers", () => {
  it("toMatch keeps the soccer sport, logoUrl, and no logoSport", () => {
    const m = toMatch(
      mustMap("eng.1", "401584339", competition("in", {}, ["2", "1"])),
    );
    expect(m.id).toBe("soccer-eng.1-401584339");
    expect(m.sport).toBe("soccer");
    expect(m.status).toBe("live");
    expect(m.a.logoSport).toBeUndefined();
    // m.a is the away side (Chelsea, id 382); m.b is home (Arsenal, id 359).
    expect(m.a.logoUrl).toBe(
      "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    );
  });
});

describe("splitSoccerGameId", () => {
  it("splits a league-qualified composite id on the first dash", () => {
    expect(splitSoccerGameId("eng.1-401584339")).toEqual({
      leagueCode: "eng.1",
      eventId: "401584339",
    });
    expect(splitSoccerGameId("uefa.champions-401584339")).toEqual({
      leagueCode: "uefa.champions",
      eventId: "401584339",
    });
  });
});
