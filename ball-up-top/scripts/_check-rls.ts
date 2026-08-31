import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Anon-key OpenAPI introspection returns an empty schema, so probe each
// table's REST endpoint directly instead.
const TABLES = ["nba_games", "nfl_games", "mlb_games", "nba_teams", "nfl_teams", "mlb_teams", "ratings"];

async function main() {
  for (const table of TABLES) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const body = await res.json();
    console.log(`${table}: status=${res.status}`, Array.isArray(body) ? `${body.length} row(s) returned` : JSON.stringify(body));
  }
}

main();
