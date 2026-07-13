import type { Match } from "@/lib/types";

export function StatusPill({ match }: { match: Pick<Match, "status" | "clock" | "date"> }) {
  if (match.status === "live") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700,
        letterSpacing: 0.4, color: "#fff", background: "#e0392b", padding: "3px 8px", borderRadius: 99,
        fontFamily: "var(--font-mono, monospace)",
      }}>
        <span className="rm-pulse" style={{ width: 6, height: 6, borderRadius: 99, background: "#fff" }} />
        LIVE {match.clock}
      </span>
    );
  }
  if (match.status === "upcoming") {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", letterSpacing: 0.3 }}>
        {match.date}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", letterSpacing: 0.3 }}>
      FINAL · {match.date}
    </span>
  );
}
