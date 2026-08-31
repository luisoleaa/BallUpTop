// GET /api/games/search?q=celtics&sport=nba&sort=recent&page=1
// Thin wrapper around lib/queries/games.ts's searchGames() -- the actual
// query/sorting/pagination logic lives there, not here.
import { NextRequest, NextResponse } from "next/server";
import { searchGames, type GameSport } from "@/lib/queries/games";

const VALID_SPORTS: (GameSport | "all")[] = ["all", "nba", "nfl", "mlb"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const sportParam = params.get("sport") ?? "all";
  const sortParam = params.get("sort") ?? "recent";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const sport = (VALID_SPORTS as string[]).includes(sportParam) ? (sportParam as GameSport | "all") : "all";
  const sort = sortParam === "popular" ? "popular" : "recent";

  const { games, total } = await searchGames({ q, sport, sort, page });
  return NextResponse.json({ games, total, page });
}
