import Link from "next/link";
import { MATCHES, SPORTS } from "@/lib/data";
import type { Event } from "@/lib/types";
import { Crest } from "./Crest";
import { Icon } from "./Icon";

export function EventCard({ event }: { event: Event }) {
  const fights = event.fights.map(id => MATCHES.find(m => m.id === id)).filter(Boolean) as typeof MATCHES;
  const main = fights[0];
  return (
    <Link
      href={`/events/${event.id}`}
      className="bw-card"
      style={{
        textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 16, display: "flex", flexDirection: "column",
        gap: 10, textDecoration: "none", boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: 0.4, textTransform: "uppercase", color: "#fff",
          background: SPORTS.ufc.color, padding: "3px 8px", borderRadius: 99, fontFamily: "var(--font-mono, monospace)",
        }}>UFC · Fight card</span>
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{event.date}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {main && (
          <>
            <Crest side={main.a} size={40} />
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 13, color: "var(--text-faint)" }}>VS</span>
            <Crest side={main.b} size={40} />
          </>
        )}
        <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>{event.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", marginTop: 2 }}>{event.venue}</div>
        </div>
        <Icon name="chevR" size={18} stroke="var(--text-faint)" />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {fights.length} fights · {main ? `${main.a.name} vs ${main.b.name}` : ""}
      </div>
    </Link>
  );
}
