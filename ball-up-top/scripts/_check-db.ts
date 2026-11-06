import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env.local") });

import { supabase } from "./scripts-supabase-client";

async function main() {
  for (const table of ["nba_teams", "nfl_teams", "mlb_teams"]) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    console.log(error ? `${table}: ERROR ${JSON.stringify(error)}` : `${table}: ${count} rows`);
  }

  // Per-season counts + gaps, paged since selects cap at ~1000 rows.
  async function checkSeasonCoverage(table: string, minExpected: number) {
    const counts = new Map<number, number>();
    const PAGE = 1000;
    let from = 0;
    for (;;) {
      const { data: page, error: pageErr } = await supabase
        .from(table)
        .select("season")
        .order("season", { ascending: true })
        .range(from, from + PAGE - 1);
      if (pageErr) {
        console.log(`${table} season query error:`, JSON.stringify(pageErr));
        return;
      }
      if (!page || page.length === 0) break;
      for (const row of page as { season: number }[]) {
        counts.set(row.season, (counts.get(row.season) ?? 0) + 1);
      }
      if (page.length < PAGE) break;
      from += PAGE;
    }
    const allSeasons = [...counts.keys()].sort((a, b) => a - b);
    if (allSeasons.length === 0) {
      console.log(`${table}: no rows`);
      return;
    }
    console.log(`${table}: seasons present ${allSeasons[0]}-${allSeasons[allSeasons.length - 1]}, ${allSeasons.length} distinct seasons`);
    const missing: number[] = [];
    for (let s = allSeasons[0]; s <= allSeasons[allSeasons.length - 1]; s++) {
      if (!counts.has(s)) missing.push(s);
    }
    console.log(`${table}: missing seasons in range:`, missing.length ? missing : "(none)");
    const low = allSeasons.filter(s => (counts.get(s) ?? 0) < minExpected);
    console.log(`${table}: seasons with <${minExpected} games (possibly partial):`, low.map(s => `${s}:${counts.get(s)}`));
  }

  await checkSeasonCoverage("nba_games", 100);
  await checkSeasonCoverage("nfl_games", 200);
  await checkSeasonCoverage("mlb_games", 200);

  // Fall back to OpenAPI introspection for empty tables.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && anonKey) {
    const res = await fetch(`${url}/rest/v1/?apikey=${anonKey}`, {
      headers: { Authorization: `Bearer ${anonKey}` },
    });
    const spec = await res.json();
    for (const table of ["nfl_games", "mlb_games"]) {
      const def = spec?.definitions?.[table];
      console.log(`${table} columns (openapi):`, def ? Object.keys(def.properties) : "not found in schema");
    }
  }
}

main();
