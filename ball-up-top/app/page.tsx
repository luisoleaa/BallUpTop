// Home page: hero, then Live now / Popular this week / Fight cards / Upcoming
// sections, pulled from the mock MATCHES/EVENTS data.
import { EVENTS, getTopReviews, MATCHES } from "@/lib/data";
import { EventCard } from "@/components/event/EventCard";
import { HomeGrid } from "@/components/layout/HomeGrid";
import { PopularReviews } from "@/components/layout/PopularReviews";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export default function HomePage() {
  const live = MATCHES.filter((m) => m.status === "live");
  const popular = MATCHES.filter((m) => m.heat && m.status === "final");
  const upcoming = MATCHES.filter((m) => m.status === "upcoming" && !m.event);
  const topReviews = getTopReviews(4);

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px 80px" }}>
      {/* Hero */}
      <div style={{ padding: "54px 0 6px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, margin: "0 0 12px", color: "var(--text)" }}>
            Ball Up Top.
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
            Keep a diary of the games that moved you. Score them, review them, see what fans loved.
          </p>
        </div>
        <Button href="/login" pill>Start your diary</Button>
      </div>

      <Section title="Live now" right={
        <span style={{ fontSize: 11, color: "var(--live)", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
          {live.length} ON NOW
        </span>
      }>
        <HomeGrid matches={live} />
      </Section>

      <Section title="Popular this week" right={
        <Button href="/browse" variant="ghost" size="sm">Browse all →</Button>
      }>
        <HomeGrid matches={popular} />
      </Section>

      <Section title="Popular reviews">
        <PopularReviews reviews={topReviews} />
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
        <Label as="h2" variant="section">{title}</Label>
        {right}
      </div>
      {children}
    </section>
  );
}
