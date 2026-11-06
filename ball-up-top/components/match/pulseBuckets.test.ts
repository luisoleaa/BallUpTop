import { describe, expect, it } from "vitest";
import { bucketPulses, buildChartSeries } from "./pulseBuckets";

describe("bucketPulses", () => {
  it("returns an empty array for no pulses", () => {
    expect(bucketPulses([])).toEqual([]);
  });

  it("puts a single pulse in one bucket, leaving the rest empty", () => {
    const buckets = bucketPulses(
      [{ rating: 7, createdAt: "2026-10-06T00:00:00Z" }],
      4,
    );
    expect(buckets).toHaveLength(4);
    const filled = buckets.filter((b) => b.count > 0);
    expect(filled).toEqual([{ avg: 7, count: 1 }]);
  });

  it("averages multiple pulses that share a timestamp into one bucket", () => {
    const createdAt = "2026-10-06T00:00:00Z";
    const buckets = bucketPulses(
      [
        { rating: 2, createdAt },
        { rating: 4, createdAt },
        { rating: 6, createdAt },
      ],
      4,
    );
    const filled = buckets.filter((b) => b.count > 0);
    expect(filled).toEqual([{ avg: 4, count: 3 }]);
  });

  it("spreads pulses evenly across their observed timespan", () => {
    const base = new Date("2026-10-06T00:00:00Z").getTime();
    const pulses = [
      { rating: 2, createdAt: new Date(base).toISOString() },
      { rating: 10, createdAt: new Date(base + 1000).toISOString() },
    ];
    const buckets = bucketPulses(pulses, 2);
    expect(buckets).toEqual([
      { avg: 2, count: 1 },
      { avg: 10, count: 1 },
    ]);
  });
});

describe("buildChartSeries", () => {
  it("returns an empty series when every bucket is empty", () => {
    expect(
      buildChartSeries([
        { avg: null, count: 0 },
        { avg: null, count: 0 },
      ]),
    ).toEqual([]);
  });

  it("trims leading/trailing empty buckets and keeps a single real point", () => {
    const series = buildChartSeries([
      { avg: null, count: 0 },
      { avg: 8, count: 1 },
      { avg: null, count: 0 },
    ]);
    expect(series).toEqual([{ x: 0, avg: 8, isReal: true }]);
  });

  it("forward-fills gaps between real points", () => {
    const series = buildChartSeries([
      { avg: 4, count: 1 },
      { avg: null, count: 0 },
      { avg: 8, count: 1 },
    ]);
    expect(series).toEqual([
      { x: 0, avg: 4, isReal: true },
      { x: 0.5, avg: 4, isReal: false },
      { x: 1, avg: 8, isReal: true },
    ]);
  });
});
