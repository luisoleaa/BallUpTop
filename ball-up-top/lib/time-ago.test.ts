import { describe, expect, it, vi } from "vitest";
import { timeAgo } from "./time-ago";

describe("timeAgo", () => {
  it("formats increasing durations with the right unit", () => {
    const now = new Date("2026-09-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    expect(timeAgo(now.toISOString())).toBe("now");
    expect(timeAgo(new Date(now.getTime() - 5 * 60_000).toISOString())).toBe("5m");
    expect(timeAgo(new Date(now.getTime() - 3 * 3_600_000).toISOString())).toBe("3h");
    expect(timeAgo(new Date(now.getTime() - 4 * 86_400_000).toISOString())).toBe("4d");
    expect(timeAgo(new Date(now.getTime() - 60 * 86_400_000).toISOString())).toBe("2mo");
    expect(timeAgo(new Date(now.getTime() - 400 * 86_400_000).toISOString())).toBe("1y");

    vi.useRealTimers();
  });
});
