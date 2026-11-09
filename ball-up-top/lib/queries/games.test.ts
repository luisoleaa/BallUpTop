import { describe, expect, it } from "vitest";
import {
  escapeLike,
  getOnThisDayBlurb,
  parsePlayoffPhrase,
  type GameSearchResult,
} from "./games";

function game(overrides: Partial<GameSearchResult> = {}): GameSearchResult {
  return {
    sport: "nba",
    id: 1,
    title: "Lakers vs Celtics",
    date: "2020-01-01T00:00:00Z",
    status: "Final",
    home_team_score: 112,
    visitor_team_score: 104,
    search_count: 0,
    postseason: null,
    home_team_abbr: "LAL",
    visitor_team_abbr: "BOS",
    ...overrides,
  };
}

describe("escapeLike", () => {
  it("escapes ILIKE metacharacters", () => {
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });

  it("leaves plain text untouched", () => {
    expect(escapeLike("Celtics")).toBe("Celtics");
  });
});

describe("parsePlayoffPhrase", () => {
  it("recognizes playoff keywords", () => {
    expect(parsePlayoffPhrase("finals")).toEqual({
      isPlayoffPhrase: true,
      sport: undefined,
    });
    expect(parsePlayoffPhrase("semifinals")).toEqual({
      isPlayoffPhrase: true,
      sport: undefined,
    });
    expect(parsePlayoffPhrase("playoffs")).toEqual({
      isPlayoffPhrase: true,
      sport: undefined,
    });
  });

  it("extracts a sport word alongside a playoff keyword", () => {
    expect(parsePlayoffPhrase("nba finals")).toEqual({
      isPlayoffPhrase: true,
      sport: "nba",
    });
    expect(parsePlayoffPhrase("mlb postseason")).toEqual({
      isPlayoffPhrase: true,
      sport: "mlb",
    });
  });

  it("is case-insensitive", () => {
    expect(parsePlayoffPhrase("NBA Finals")).toEqual({
      isPlayoffPhrase: true,
      sport: "nba",
    });
  });

  it("returns false for a normal team search", () => {
    expect(parsePlayoffPhrase("Celtics")).toEqual({ isPlayoffPhrase: false });
    expect(parsePlayoffPhrase("Lakers vs Celtics")).toEqual({
      isPlayoffPhrase: false,
    });
  });
});

describe("getOnThisDayBlurb", () => {
  it("names the winner first with the score, home team ahead", () => {
    expect(getOnThisDayBlurb(game())).toBe("Lakers beat Celtics 112–104");
  });

  it("names the winner first when the visitor team won", () => {
    expect(
      getOnThisDayBlurb(
        game({ home_team_score: 100, visitor_team_score: 110 }),
      ),
    ).toBe("Celtics beat Lakers 110–100");
  });

  it("appends a playoff note when postseason is true", () => {
    expect(getOnThisDayBlurb(game({ postseason: true }))).toBe(
      "Lakers beat Celtics 112–104 in the playoffs",
    );
  });

  it("falls back to a tie sentence on equal scores", () => {
    expect(
      getOnThisDayBlurb(game({ home_team_score: 20, visitor_team_score: 20 })),
    ).toBe("Lakers and Celtics tied 20");
  });

  it("returns an empty string when a score is missing", () => {
    expect(getOnThisDayBlurb(game({ home_team_score: null }))).toBe("");
  });
});
