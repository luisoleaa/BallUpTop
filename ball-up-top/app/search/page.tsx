// Server page for /search: does the initial query itself (real SSR render,
// no client-side loading flash on first load), then hands off to
// SearchClient for debounced re-search as the user types/filters.
import type { Metadata } from "next";
import { searchGames, type GameSport } from "@/lib/queries/games";
import { searchLiveGames } from "@/lib/queries/matches";
import { LIVE_SPORTS, type LiveSport } from "@/routes/live/live";
import { SearchClient } from "@/components/search/SearchClient";

const VALID_SPORTS: LiveSport[] = [...LIVE_SPORTS];
const GAME_SPORTS: GameSport[] = ["nba", "nfl", "mlb"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" — Search` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sport?: string;
    sort?: string;
    live?: string;
  }>;
}) {
  const {
    q = "",
    sport: sportParam,
    sort: sortParam,
    live: liveParam,
  } = await searchParams;
  const sport: LiveSport | "all" = VALID_SPORTS.includes(
    sportParam as LiveSport,
  )
    ? (sportParam as LiveSport)
    : "all";
  const sort: "recent" | "popular" =
    sortParam === "popular" ? "popular" : "recent";
  const liveOnly = liveParam === "1";

  const archiveSport: GameSport | "all" | null =
    sport === "all" || (GAME_SPORTS as string[]).includes(sport)
      ? (sport as GameSport | "all")
      : null;

  const [{ games, total }, live] = await Promise.all([
    liveOnly || archiveSport == null
      ? Promise.resolve({ games: [], total: 0 })
      : searchGames({ q, sport: archiveSport, sort }),
    searchLiveGames({ q, sport, liveOnly }),
  ]);

  return (
    <SearchClient
      initialGames={games}
      initialTotal={total}
      initialLive={live}
      initialQuery={q}
      initialSport={sport}
      initialSort={sort}
      initialLiveOnly={liveOnly}
    />
  );
}
