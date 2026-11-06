"use server";

// Bumps a game's search_count via an RPC (there's no direct UPDATE policy
// on the games tables).
import { createClient } from "@/lib/supabase/server";
import type { GameSport } from "@/lib/queries/games";

const VALID_SPORTS: GameSport[] = ["nba", "nfl", "mlb"];

export async function incrementGameView(sport: GameSport, id: number) {
  if (!VALID_SPORTS.includes(sport)) return;
  const supabase = await createClient();
  await supabase.rpc("increment_game_search_count", { p_sport: sport, p_id: id });
}
