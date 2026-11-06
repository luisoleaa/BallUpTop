import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env.local") });

import { supabase } from "./scripts-supabase-client";
import { BalldontlieAPI } from "@balldontlie/sdk";

const apiKey = process.env.BALL_DONT_LIE_API_KEY;

if (!apiKey) {
  throw new Error("API key is not set");
}
const api = new BalldontlieAPI({ apiKey });

// Team lists are small and unpaginated, so no checkpointing needed here.
async function backfillNbaTeams() {
  const response = await api.nba.getTeams();
  const rows = response.data.map(team => ({
    id: team.id,
    conference: team.conference,
    division: team.division,
    city: team.city,
    name: team.name,
    full_name: team.full_name,
    abbreviation: team.abbreviation,
  }));
  const { error } = await supabase.from("nba_teams").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`nba_teams upsert failed: ${JSON.stringify(error)}`);
  console.log(`nba_teams: imported ${rows.length} teams.`);
}

async function backfillNflTeams() {
  const response = await api.nfl.getTeams();
  const rows = response.data.map(team => ({
    id: team.id,
    conference: team.conference,
    division: team.division,
    city: team.location,
    name: team.name,
    full_name: team.full_name,
    abbreviation: team.abbreviation,
  }));
  const { error } = await supabase.from("nfl_teams").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`nfl_teams upsert failed: ${JSON.stringify(error)}`);
  console.log(`nfl_teams: imported ${rows.length} teams.`);
}

async function backfillMlbTeams() {
  const response = await api.mlb.getTeams();
  const rows = response.data.map(team => ({
    id: team.id,
    // MLB has no conference concept - "American"/"National" league fills that role.
    conference: team.league,
    division: team.division,
    city: team.location,
    name: team.name,
    full_name: team.display_name,
    abbreviation: team.abbreviation,
  }));
  const { error } = await supabase.from("mlb_teams").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`mlb_teams upsert failed: ${JSON.stringify(error)}`);
  console.log(`mlb_teams: imported ${rows.length} teams.`);
}

async function main() {
  await backfillNbaTeams();
  await backfillNflTeams();
  await backfillMlbTeams();
  console.log("Done!");
}

main();
