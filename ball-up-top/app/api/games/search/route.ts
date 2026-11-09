// GET /api/games/search?q=celtics&sport=nba&sort=recent&page=1&live=1
// Combines two data systems: the real historical archive (searchGames(), the
// actual query/sorting/pagination logic lives there) and today's real
// live/upcoming games (searchLiveGames(), covers all 6 LIVE_SPORTS -- the
// archive only ever has nba/nfl/mlb).
import { NextRequest, NextResponse } from "next/server";
import { searchGames, type GameSport } from "@/lib/queries/games";
import { searchLiveGames } from "@/lib/queries/matches";
import { LIVE_SPORTS, type LiveSport } from "@/routes/live/live";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_SPORTS: (LiveSport | "all")[] = ["all", ...LIVE_SPORTS];
const GAME_SPORTS: GameSport[] = ["nba", "nfl", "mlb"];
const MAX_PAGE = 50;

export async function GET(request: NextRequest) {
  const { success } = await checkRateLimit("live-api", await getClientIp());
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const sportParam = params.get("sport") ?? "all";
  const sortParam = params.get("sort") ?? "recent";
  const page = Math.min(MAX_PAGE, Math.max(1, Number(params.get("page")) || 1));
  const liveOnly = params.get("live") === "1";

  const sport = (VALID_SPORTS as string[]).includes(sportParam)
    ? (sportParam as LiveSport | "all")
    : "all";
  const sort = sortParam === "popular" ? "popular" : "recent";

  // The archive never has a live/in-progress game, and only ever covers
  // nba/nfl/mlb -- skip the DB round-trip rather than pass an unsupported
  // sport into searchGames's typed GameSport | "all" param.
  const archiveSport =
    sport === "all" || (GAME_SPORTS as string[]).includes(sport)
      ? (sport as GameSport | "all")
      : null;

  const [archive, live] = await Promise.all([
    liveOnly || archiveSport == null
      ? Promise.resolve({ games: [], total: 0 })
      : searchGames({ q, sport: archiveSport, sort, page }),
    searchLiveGames({ q, sport, liveOnly }),
  ]);

  return NextResponse.json({
    games: archive.games,
    total: archive.total,
    live,
    page,
  });
}
