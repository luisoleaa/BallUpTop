"use client";

// Continuous 1.0-10.0 rating slider plus quick-pick buttons for common values.
import { ratingColor } from "./RatingValue";

export function RatingSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const col = value ? ratingColor(value) : "var(--text-faint)";
  const pct = Math.max(0, (value - 1) / 9) * 100;

  return (
    <div style={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <span style={{
          fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 56, color: col,
          letterSpacing: -2, fontVariantNumeric: "tabular-nums", lineHeight: 1,
        }}>
          {value ? value.toFixed(1) : "–.–"}
        </span>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 600, fontSize: 18, color: "var(--text-faint)", marginLeft: 4 }}>/10</span>
      </div>
      <input
        type="range" min="1" max="10" step="0.1" value={value || 5.5}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="rm-slider"
        style={{ "--fill": pct + "%", "--thumb-col": value ? col : "var(--text-muted)" } as React.CSSProperties}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--text-faint)", fontWeight: 600 }}>1.0</span>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--text-faint)", fontWeight: 600 }}>10.0</span>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
        {[6, 7, 7.5, 8, 8.5, 9, 10].map((n) => (
          <button key={n} onClick={() => onChange(n)} style={{
            padding: "6px 11px", borderRadius: 99, fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 700,
            border: `1px solid ${value === n ? "transparent" : "var(--border)"}`,
            background: value === n ? ratingColor(n) : "var(--surface-2)",
            color: value === n ? "var(--accent-text)" : "var(--text-muted)", cursor: "pointer", transition: "all .12s",
          }}>
            {n.toFixed(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
