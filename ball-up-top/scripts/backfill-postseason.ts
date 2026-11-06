import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env.local") });

import { supabase } from "./scripts-supabase-client";
import { BalldontlieAPI } from "@balldontlie/sdk";
import { backfillBySeasonRange } from "./backfill-lib";

const apiKey = process.env.BALL_DONT_LIE_API_KEY;

if (!apiKey) {
  throw new Error("API key is not set");
}
const api = new BalldontlieAPI({ apiKey });

// Assumes the `postseason` column already exists on the games tables. Only fetches
// postseason games (server-side filter) and flips `postseason = true` on the rows
// that ALREADY exist -- an UPDATE ... in (ids), never an upsert. (Upsert here once
// inserted 68 bare id-only rows into nba_games for playoff game ids the main
// backfill never had; those had to be deleted by hand.) Regular-season rows are
// left null, which search already treats as not-postseason.
const SPORTS: {
  sport: "nba" | "nfl" | "mlb";
  table: string;
  firstSeason: number;
  lastSeason: number;
  getGames: (
    season: number,
    cursor: number | undefined
  ) => Promise<{ data: { id: number }[]; meta?: { next_cursor?: number } }>;
}[] = [
  {
    sport: "nba",
    table: "nba_games",
    firstSeason: 1946,
    lastSeason: 2025,
    getGames: (season, cursor) => api.nba.getGames({ seasons: [season], postseason: true, cursor, per_page: 100 }),
  },
  {
    sport: "nfl",
    table: "nfl_games",
    firstSeason: 2002,
    lastSeason: 2025,
    getGames: (season, cursor) => api.nfl.getGames({ seasons: [season], postseason: true, cursor, per_page: 100 }),
  },
  {
    sport: "mlb",
    table: "mlb_games",
    firstSeason: 2000,
    lastSeason: 2025,
    getGames: (season, cursor) => api.mlb.getGames({ seasons: [season], postseason: true, cursor, per_page: 100 }),
  },
];

async function main() {
  for (const { sport, table, firstSeason, lastSeason, getGames } of SPORTS) {
    console.log(`--- ${sport} ---`);
    const checkpointPath = path.resolve(__dirname, `.backfill-postseason-${sport}-checkpoint.json`);
    await backfillBySeasonRange({
      checkpointPath,
      firstSeason,
      lastSeason,
      fetchPage: async (season, cursor) => {
        const response = await getGames(season, cursor);
        const rows = response.data.map(game => ({ id: game.id, postseason: true }));
        return { rows, nextCursor: response.meta?.next_cursor };
      },
      // UPDATE only -- do not INSERT ids the main backfill never had.
      upsertRows: async rows => {
        if (rows.length === 0) return { error: null };
        const ids = rows.map(r => r.id as number);
        return supabase.from(table).update({ postseason: true }).in("id", ids);
      },
    });
  }
  console.log("Done!");
}

main();
