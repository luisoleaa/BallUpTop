import { describe, expect, it } from "vitest";
import { ratingColor } from "./RatingValue";

describe("ratingColor", () => {
  it("clamps low ratings to the red end of the hue range", () => {
    expect(ratingColor(0)).toBe("oklch(0.74 0.17 28)");
    expect(ratingColor(3)).toBe("oklch(0.74 0.17 28)");
  });

  it("clamps high ratings to the green end of the hue range", () => {
    expect(ratingColor(9.5)).toBe("oklch(0.74 0.17 145)");
    expect(ratingColor(15)).toBe("oklch(0.74 0.17 145)");
  });

  it("interpolates in between", () => {
    expect(ratingColor(6.5)).toBe("oklch(0.74 0.17 91)");
  });
});
