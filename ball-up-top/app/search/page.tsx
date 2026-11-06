// Server page for /search: does the initial query itself (real SSR render,
// no client-side loading flash on first load), then hands off to
// SearchClient for debounced re-search as the user types/filters.
import type { Metadata } from "next";
import { searchGames, type GameSport } from "@/lib/queries/games";
import { SearchClient } from "@/components/search/SearchClient";

const VALID_SPORTS: GameSport[] = ["nba", "nfl", "mlb"];

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
  searchParams: Promise<{ q?: string; sport?: string; sort?: string }>;
}) {
  const { q = "", sport: sportParam, sort: sortParam } = await searchParams;
  const sport: GameSport | "all" = VALID_SPORTS.includes(sportParam as GameSport) ? (sportParam as GameSport) : "all";
  const sort: "recent" | "popular" = sortParam === "popular" ? "popular" : "recent";

  const { games, total } = await searchGames({ q, sport, sort });

  return (
    <SearchClient
      initialGames={games}
      initialTotal={total}
      initialQuery={q}
      initialSport={sport}
      initialSort={sort}
    />
  );
}
