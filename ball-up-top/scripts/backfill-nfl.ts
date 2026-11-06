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

// 2002 is the real data floor -- earlier seasons return nothing.
const FIRST_SEASON = 2002;
const LAST_SEASON = 2025;

const CHECKPOINT_PATH = path.resolve(__dirname, ".backfill-nfl-checkpoint.json");

async function main() {
  await backfillBySeasonRange({
    checkpointPath: CHECKPOINT_PATH,
    firstSeason: FIRST_SEASON,
    lastSeason: LAST_SEASON,
    fetchPage: async (season, cursor) => {
      const response = await api.nfl.getGames({ seasons: [season], cursor, per_page: 100 });
      const rows = response.data.map(game => ({
        id: game.id,
        date: game.date,
        season: game.season,
        status: game.status,
        home_team_score: game.home_team_score,
        visitor_team_score: game.visitor_team_score,
        home_team_id: game.home_team?.id,
        visitor_team_id: game.visitor_team?.id,
        title: game.home_team?.full_name && game.visitor_team?.full_name
          ? `${game.home_team.full_name} vs ${game.visitor_team.full_name}`
          : null,
      }));
      return { rows, nextCursor: response.meta?.next_cursor };
    },
    upsertRows: rows => supabase.from("nfl_games").upsert(rows, { onConflict: "id" }),
  });
  console.log("Done!");
}

main();
