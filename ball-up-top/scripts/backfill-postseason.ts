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
// postseason games (server-side filter) and upserts { id, postseason: true } --
// regular-season rows are left null, which search already treats as not-postseason.
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
      upsertRows: rows => supabase.from(table).upsert(rows, { onConflict: "id" }),
    });
  }
  console.log("Done!");
}

main();
