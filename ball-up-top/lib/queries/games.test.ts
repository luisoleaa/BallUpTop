import { describe, expect, it } from "vitest";
import { escapeLike, parsePlayoffPhrase } from "./games";

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
    expect(parsePlayoffPhrase("finals")).toEqual({ isPlayoffPhrase: true, sport: undefined });
    expect(parsePlayoffPhrase("semifinals")).toEqual({ isPlayoffPhrase: true, sport: undefined });
    expect(parsePlayoffPhrase("playoffs")).toEqual({ isPlayoffPhrase: true, sport: undefined });
  });

  it("extracts a sport word alongside a playoff keyword", () => {
    expect(parsePlayoffPhrase("nba finals")).toEqual({ isPlayoffPhrase: true, sport: "nba" });
    expect(parsePlayoffPhrase("mlb postseason")).toEqual({ isPlayoffPhrase: true, sport: "mlb" });
  });

  it("is case-insensitive", () => {
    expect(parsePlayoffPhrase("NBA Finals")).toEqual({ isPlayoffPhrase: true, sport: "nba" });
  });

  it("returns false for a normal team search", () => {
    expect(parsePlayoffPhrase("Celtics")).toEqual({ isPlayoffPhrase: false });
    expect(parsePlayoffPhrase("Lakers vs Celtics")).toEqual({ isPlayoffPhrase: false });
  });
});
