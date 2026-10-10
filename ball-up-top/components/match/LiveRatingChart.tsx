"use client";

// No charting library exists in this app -- the only precedent is the
// hand-rolled percentage-width div bars in the "Community rating" card. For
// a real line chart, this hand-rolls a single inline <svg><path> instead,
// in the same spirit as Button.tsx's decorative ArcAccent svg.
import { ratingColor } from "../ui/RatingValue";
import { bucketPulses, buildChartSeries } from "./pulseBuckets";
import type { LiveRatingPulse } from "@/lib/types";

const WIDTH = 280;
const HEIGHT = 72;

export function LiveRatingChart({ pulses }: { pulses: LiveRatingPulse[] }) {
  if (pulses.length === 0) {
    return (
      <div
        style={{
          height: HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-faint)",
          fontSize: 12.5,
          textAlign: "center",
        }}
      >
        No pulses yet — be the first to tap a rating below.
      </div>
    );
  }

  const series = buildChartSeries(bucketPulses(pulses));
  const lineColor = ratingColor(series[series.length - 1]?.avg ?? 5.5);
  const toY = (avg: number) =>
    HEIGHT - ((Math.max(1, Math.min(10, avg)) - 1) / 9) * HEIGHT;
  const toX = (x: number) => x * WIDTH;
  const d = series
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.avg).toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg
      width="100%"
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Live fan rating over the course of the match"
    >
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {series
        .filter((p) => p.isReal)
        .map((p, i) => (
          <circle
            key={i}
            cx={toX(p.x)}
            cy={toY(p.avg)}
            r={3}
            fill={ratingColor(p.avg)}
          />
        ))}
    </svg>
  );
}
