// Pure aggregation for LiveRatingChart: turns raw pulses into a drawable
// series. No "official" match duration exists across mock + 5 real
// providers, so buckets span the pulses' own observed timespan (first pulse
// -> last pulse) rather than a fixed clock.
export interface PulseLike {
  rating: number;
  createdAt: string;
}

export interface Bucket {
  avg: number | null;
  count: number;
}

export interface ChartPoint {
  x: number; // 0-1 position along the trimmed series
  avg: number; // real bucket average, or the last real value carried forward
  isReal: boolean; // false where the point is a forward-filled gap
}

const DEFAULT_BUCKET_COUNT = 24;

export function bucketPulses(
  pulses: PulseLike[],
  bucketCount: number = DEFAULT_BUCKET_COUNT,
): Bucket[] {
  if (pulses.length === 0) return [];

  const times = pulses.map((p) => new Date(p.createdAt).getTime());
  // Loop instead of Math.min(...times)/Math.max(...times): a spread over an
  // unbounded array risks "Maximum call stack size exceeded" for a long,
  // high-traffic live match's full pulse history.
  let min = times[0];
  let max = times[0];
  for (let i = 1; i < times.length; i++) {
    if (times[i] < min) min = times[i];
    if (times[i] > max) max = times[i];
  }
  // Avoid /0 when every pulse shares one timestamp.
  const span = Math.max(max - min, 1);

  const sums = new Array<number>(bucketCount).fill(0);
  const counts = new Array<number>(bucketCount).fill(0);
  pulses.forEach((p, i) => {
    const idx = Math.min(
      bucketCount - 1,
      Math.floor(((times[i] - min) / span) * bucketCount),
    );
    sums[idx] += p.rating;
    counts[idx] += 1;
  });

  return sums.map((sum, i) => ({
    avg: counts[i] > 0 ? sum / counts[i] : null,
    count: counts[i],
  }));
}

// Trims leading/trailing empty buckets (no sentiment implied before the
// first pulse or after the last) and forward-fills internal gaps so the
// polyline stays continuous between real data points.
export function buildChartSeries(buckets: Bucket[]): ChartPoint[] {
  const firstReal = buckets.findIndex((b) => b.avg != null);
  if (firstReal === -1) return [];
  let lastReal = firstReal;
  for (let i = buckets.length - 1; i >= 0; i--) {
    if (buckets[i].avg != null) {
      lastReal = i;
      break;
    }
  }

  const trimmed = buckets.slice(firstReal, lastReal + 1);
  let carry = trimmed[0].avg as number;
  return trimmed.map((b, i) => {
    const isReal = b.avg != null;
    if (isReal) carry = b.avg as number;
    return {
      x: trimmed.length > 1 ? i / (trimmed.length - 1) : 0,
      avg: carry,
      isReal,
    };
  });
}
