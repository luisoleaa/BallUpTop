// Clickable card summarizing a UFC fight card: card name, venue, main event
// fighter names, fight count. No crest art -- UFC fighters have no logo, so
// unlike other sports' EventCard-equivalents this is text-only.
import { MATCHES, SPORTS } from "@/lib/data";
import type { Event } from "@/lib/types";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";

export function EventCard({ event }: { event: Event }) {
  const fights = event.fights
    .map((id) => MATCHES.find((m) => m.id === id))
    .filter(Boolean) as typeof MATCHES;
  const main = fights[0];
  return (
    <Card
      href={`/events/${event.id}`}
      padding={16}
      style={{
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: "#fff",
            background: SPORTS.ufc.color,
            padding: "3px 8px",
            borderRadius: 99,
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          UFC · Fight card
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-faint)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {event.date}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>
            {event.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono, monospace)",
              marginTop: 2,
            }}
          >
            {event.venue}
          </div>
        </div>
        <Icon name="chevR" size={18} stroke="var(--text-faint)" />
      </div>
      {main && (
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
          {main.a.name}{" "}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-faint)",
            }}
          >
            vs
          </span>{" "}
          {main.b.name}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {fights.length} fights
      </div>
    </Card>
  );
}
