import { SPORTS } from "@/lib/data";
import type { SportSlug } from "@/lib/types";

export function SportChip({ sport, muted }: { sport: SportSlug; muted?: boolean }) {
  const s = SPORTS[sport];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.3, textTransform: "uppercase",
      color: muted ? "var(--text-faint)" : "var(--text-muted)",
      fontFamily: "var(--font-mono, monospace)",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color, flexShrink: 0, display: "inline-block" }} />
      {s.name}
    </span>
  );
}
