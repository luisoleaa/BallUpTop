import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("allows a same-origin relative path", () => {
    expect(safeRedirectPath("/matches/mlb-123")).toBe("/matches/mlb-123");
  });

  it("preserves a query string", () => {
    expect(safeRedirectPath("/matches/mlb-123?x=1")).toBe(
      "/matches/mlb-123?x=1",
    );
  });

  it("rejects null/empty input", () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath("")).toBeNull();
  });

  it("rejects an absolute URL", () => {
    expect(safeRedirectPath("https://evil.com")).toBeNull();
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeRedirectPath("//evil.com")).toBeNull();
  });

  it("rejects a path not starting with /", () => {
    expect(safeRedirectPath("evil.com")).toBeNull();
  });

  it("rejects the backslash open-redirect bypass", () => {
    // Browsers normalize \ to / for special schemes, so a naive "starts
    // with // " check alone lets this resolve to protocol-relative
    // //evil.com -- this is the exact bypass the review found.
    expect(safeRedirectPath("/\\evil.com")).toBeNull();
    expect(safeRedirectPath("/\\\\evil.com")).toBeNull();
  });
});
