import { EVENTS, MATCHES } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { HomeGrid } from "@/components/HomeGrid";

export default function HomePage() {
  const live = MATCHES.filter((m) => m.status === "live");
  const popular = MATCHES.filter((m) => m.heat && m.status === "final");
  const upcoming = MATCHES.filter((m) => m.status === "upcoming" && !m.event);

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px 80px" }}>
      {/* Hero */}
      <div style={{ padding: "54px 0 6px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 12px", color: "var(--text)" }}>
            Rate every match you watch.
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
            Keep a diary of the games that moved you. Score them, review them, see what fans loved.
          </p>
        </div>
        <a href="/login" style={{
          border: "none", background: "var(--accent)", color: "var(--accent-text)",
          padding: "13px 26px", borderRadius: 99, fontSize: 16, fontWeight: 800,
          cursor: "pointer", textDecoration: "none", display: "inline-block",
        }}>
          Start your diary
        </a>
      </div>

      <Section title="Live now" right={
        <span style={{ fontSize: 11, color: "#e0392b", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
          {live.length} ON NOW
        </span>
      }>
        <HomeGrid matches={live} />
      </Section>

      <Section title="Popular this week" right={
        <a href="/browse" style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--accent-strong)", textDecoration: "none" }}>
          Browse all →
        </a>
      }>
        <HomeGrid matches={popular} />
      </Section>

      <Section title="Fight cards">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
          {EVENTS.map((ev) => <EventCard key={ev.id} event={ev} />)}
        </div>
      </Section>

      <Section title="Upcoming">
        <HomeGrid matches={upcoming} />
      </Section>
    </main>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 44 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", margin: 0 }}>
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}
