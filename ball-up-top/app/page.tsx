// Home page: hero, then Live now / Popular this week / On this day / Fight
// cards / Upcoming sections. Live now is real MLB data; Popular/Fight cards/Upcoming
// are the mock MATCHES/EVENTS data; On this day pulls from the real historical archive.
import { EVENTS, getTopReviews, MATCHES } from "@/lib/data";
import { getAllLiveGames } from "@/routes/live/all_live";
import { getOnThisDay } from "@/lib/queries/games";
import { LiveGamesClient } from "@/components/live/liveGamesClient";
import { EventCard } from "@/components/event/EventCard";
import { GameResultCard } from "@/components/search/GameResultCard";
import { HomeGrid } from "@/components/layout/HomeGrid";
import { PopularReviews } from "@/components/layout/PopularReviews";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export default async function HomePage() {
  const [liveGames, popular, upcoming, topReviews, onThisDay] = await Promise.all([
    getAllLiveGames(),
    Promise.resolve(MATCHES.filter((m) => m.heat && m.status === "final")),
    Promise.resolve(MATCHES.filter((m) => m.status === "upcoming" && !m.event)),
    Promise.resolve(getTopReviews(4)),
    getOnThisDay(6),
  ]);

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

      <LiveGamesClient initialGames={liveGames} />

      <Section title="Popular this week" right={
        <Button href="/browse" variant="ghost" size="sm">Browse all →</Button>
      }>
        <HomeGrid matches={popular} />
      </Section>

      <Section title="Popular reviews">
        <PopularReviews reviews={topReviews} />
      </Section>

      {onThisDay.length > 0 && (
        <Section title="On this day in sports history" right={
          <Button href="/search" variant="ghost" size="sm">Search the archive →</Button>
        }>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {onThisDay.map((g) => <GameResultCard key={`${g.sport}-${g.id}`} game={g} />)}
          </div>
        </Section>
      )}

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
