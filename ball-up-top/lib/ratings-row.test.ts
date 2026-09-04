import { describe, expect, it } from "vitest";
import { toRating, type RatingRow } from "./ratings-row";

const baseRow: RatingRow = {
  id: "r1",
  match_id: "m4",
  rating: "8.5",
  review: "Great match",
  tags: ["Instant classic"],
  watched_live: true,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-02T00:00:00Z",
};

describe("toRating", () => {
  it("maps snake_case columns to the app's camelCase shape", () => {
    expect(toRating(baseRow)).toEqual({
      id: "r1",
      matchId: "m4",
      rating: 8.5,
      review: "Great match",
      tags: ["Instant classic"],
      watchedLive: true,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-02T00:00:00Z",
    });
  });

  it("coerces a numeric-string rating to a number", () => {
    expect(toRating({ ...baseRow, rating: "10" }).rating).toBe(10);
  });

  it("defaults null tags to an empty array", () => {
    expect(toRating({ ...baseRow, tags: null }).tags).toEqual([]);
  });
});
