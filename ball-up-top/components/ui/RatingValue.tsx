// Maps a 1-10 rating to a red -> green OKLCH hue.
export function ratingColor(v: number): string {
  const t = Math.max(0, Math.min(1, (v - 3) / 6.5));
  return `oklch(0.74 0.17 ${Math.round(28 + t * 117)})`;
}

export function RatingValue({ value, size = 16 }: { value: number | null; size?: number }) {
  if (value == null) return null;
  const col = ratingColor(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 3 }}>
      <span style={{
        fontFamily: "var(--font-mono, monospace)", fontWeight: 800,
        fontSize: size + 2, color: col, fontVariantNumeric: "tabular-nums",
      }}>
        {Number(value).toFixed(1)}
      </span>
      <span style={{
        fontFamily: "var(--font-mono, monospace)", fontWeight: 600,
        fontSize: Math.max(9, size - 4), color: "var(--text-faint)",
      }}>
        /10
      </span>
    </span>
  );
}
