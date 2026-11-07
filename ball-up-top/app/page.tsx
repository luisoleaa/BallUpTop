// Home page: hero, then Live now / Popular this week / On this day / Fight
// cards / Upcoming sections. Live now is real data across 6 sports;
// Popular/Fight cards are the mock MATCHES/EVENTS data; Upcoming mixes real
// Preview-state games (for the 6 real-feed sports, so logos are correct) with
// mock fallback for tennis/F1/cricket, which have no real feed; On this day
// pulls from the real historical archive.
import { EVENTS, getMatch, getTopReviews, MATCHES, SPORTS } from "@/lib/data";
import { getAllLiveGames } from "@/routes/live/all_live";
import {
  LIVE_SPORTS,
  roundRobinBySport,
  selectLiveNow,
  toMatch,
} from "@/routes/live/live";
import { getOnThisDay, getOnThisDayBlurb } from "@/lib/queries/games";
import { getAnyMatch } from "@/lib/queries/matches";
import { getTopRealReviews } from "@/lib/queries/ratings";
import { LiveGamesClient } from "@/components/live/liveGamesClient";
import { EventCard } from "@/components/event/EventCard";
import { GameResultCard } from "@/components/search/GameResultCard";
import { HomeGrid } from "@/components/layout/HomeGrid";
import {
  PopularReviews,
  type PopularReview,
} from "@/components/layout/PopularReviews";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

const POPULAR_REVIEWS_LIMIT = 4;
const UPCOMING_LIMIT = 8;

// Real reviews ranked first, mock seed reviews fill in after -- same
// real-first/mock-filler pattern match detail pages use for their own
// review lists. Resolves each review's match (mock or real) for its sport
// color/abbreviations so PopularReviews stays presentational.
async function getPopularReviews(limit: number): Promise<PopularReview[]> {
  const realReviews = await getTopRealReviews(limit);
  const realMatches = await Promise.all(
    realReviews.map((r) => getAnyMatch(r.matchId)),
  );
  const real: PopularReview[] = realReviews.flatMap((r, i) => {
    const match = realMatches[i];
    if (!match) return [];
    return [
      {
        key: r.id,
        matchId: r.matchId,
        user: r.userName,
        userId: r.userId,
        rating: r.rating,
        text: r.review,
        likes: r.likeCount,
        sportColor: SPORTS[match.sport].color,
        vs: `${match.a.abbr} v ${match.b.abbr}`,
      },
    ];
  });

  const needed = Math.max(0, limit - real.length);
  const mock: PopularReview[] =
    needed > 0
      ? getTopReviews(needed).flatMap((r) => {
          const match = getMatch(r.matchId);
          if (!match) return [];
          return [
            {
              key: `${r.matchId}-${r.user}`,
              matchId: r.matchId,
              user: r.user,
              rating: r.rating,
              text: r.text,
              likes: r.likes,
              sportColor: SPORTS[match.sport].color,
              vs: `${match.a.abbr} v ${match.b.abbr}`,
            },
          ];
        })
      : [];

  return [...real, ...mock];
}

export default async function HomePage() {
  const [liveGames, popular, topReviews, onThisDay] = await Promise.all([
    getAllLiveGames(),
    Promise.resolve(MATCHES.filter((m) => m.heat && m.status === "final")),
    getPopularReviews(POPULAR_REVIEWS_LIMIT),
    getOnThisDay(6),
  ]);

  // Same games "Live now" already shows (its own 6-slot pick) can't also
  // appear in "Upcoming" below.
  const liveNowIds = new Set(selectLiveNow(liveGames, 6).map((g) => g.id));
  const upcomingPreview = liveGames
    .filter((g) => g.state === "Preview" && !liveNowIds.has(g.id))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  // Round-robin across sports -- one UFC card's many fights, or one league's
  // many kickoffs, shouldn't monopolize every slot the way a plain
  // soonest-first sort would.
  const realUpcoming = roundRobinBySport(upcomingPreview).map(toMatch);
  // tennis/F1/cricket have no real feed, so they only ever show up here.
  const mockUpcoming = MATCHES.filter(
    (m) =>
      m.status === "upcoming" &&
      !m.event &&
      !(LIVE_SPORTS as readonly string[]).includes(m.sport),
  );
  const upcoming = [...realUpcoming, ...mockUpcoming].slice(0, UPCOMING_LIMIT);

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px 80px" }}>
      {/* Hero */}
      <div
        style={{
          padding: "54px 0 6px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              margin: "0 0 12px",
              color: "var(--text)",
            }}
          >
            Ball Up Top.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Keep a diary of the games that moved you. Score them, review them,
            see what fans loved.
          </p>
        </div>
        <Button href="/login" pill>
          Start your diary
        </Button>
      </div>

      <LiveGamesClient initialGames={liveGames} />

      <Section
        title="Popular this week"
        right={
          <Button href="/browse" variant="ghost" size="sm">
            Browse all →
          </Button>
        }
      >
        <HomeGrid matches={popular} />
      </Section>

      <Section title="Popular reviews">
        <PopularReviews reviews={topReviews} />
      </Section>

      {onThisDay.length > 0 && (
        <Section
          title="On this day in sports history"
          right={
            <Button href="/search" variant="ghost" size="sm">
              Search the archive →
            </Button>
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {onThisDay.map((g) => (
              <GameResultCard
                key={`${g.sport}-${g.id}`}
                game={g}
                blurb={getOnThisDayBlurb(g)}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Fight cards">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 16,
          }}
        >
          {EVENTS.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </Section>

      <Section title="Upcoming">
        <HomeGrid matches={upcoming} />
      </Section>
    </main>
  );
}
