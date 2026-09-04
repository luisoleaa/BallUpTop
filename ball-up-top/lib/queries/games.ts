// Server-side reads for the real historical game tables (nba_games/nfl_games/
// mlb_games, unified via the game_search view).
import { createClient } from "@/lib/supabase/server";

export type GameSport = "nba" | "nfl" | "mlb";

export interface GameSearchResult {
  sport: GameSport;
  id: number;
  title: string;
  date: string;
  status: string;
  home_team_score: number | null;
  visitor_team_score: number | null;
  search_count: number;
  postseason: boolean | null;
  home_team_abbr: string;
  visitor_team_abbr: string;
}

// Escapes ILIKE metacharacters so a search like "a_b" isn't read as a wildcard.
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

const GAME_TEAMS_TABLES: Record<GameSport, string> = {
  nba: "nba_teams",
  nfl: "nfl_teams",
  mlb: "mlb_teams",
};

// No round names available (just a flat postseason flag), so these are all
// treated as synonyms for "any postseason game".
const PLAYOFF_WORDS = new Set(["finals", "final", "semifinals", "semifinal", "playoffs", "playoff", "postseason"]);
const SPORT_WORDS: Record<string, GameSport> = { nba: "nba", nfl: "nfl", mlb: "mlb" };

export function parsePlayoffPhrase(term: string): { isPlayoffPhrase: boolean; sport?: GameSport } {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.some(w => PLAYOFF_WORDS.has(w))) return { isPlayoffPhrase: false };
  const sportWord = words.find(w => w in SPORT_WORDS);
  return { isPlayoffPhrase: true, sport: sportWord ? SPORT_WORDS[sportWord] : undefined };
}

// Resolves a team abbreviation ("BOS") to its full name(s) so it can be
// matched against title, which never contains the abbreviation itself.
async function resolveTeamNameMatches(term: string, sport: GameSport | "all"): Promise<string[]> {
  const supabase = await createClient();
  const tables = sport === "all" ? Object.values(GAME_TEAMS_TABLES) : [GAME_TEAMS_TABLES[sport]];

  const results = await Promise.all(
    tables.map(table =>
      supabase.from(table).select("full_name").ilike("abbreviation", `%${escapeLike(term)}%`)
    )
  );

  const names: string[] = [];
  for (const { data, error } of results) {
    if (error) throw new Error(error.message);
    for (const row of (data as { full_name: string }[]) ?? []) names.push(row.full_name);
  }
  return names;
}

export async function searchGames({
  q,
  sport = "all",
  sort = "recent",
  page = 1,
  pageSize = 24,
}: {
  q: string;
  sport?: GameSport | "all";
  sort?: "recent" | "popular";
  page?: number;
  pageSize?: number;
}): Promise<{ games: GameSearchResult[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("game_search")
    .select(
      "sport,id,title,date,status,home_team_score,visitor_team_score,search_count,postseason,home_team_abbr,visitor_team_abbr",
      { count: "exact" }
    );

  if (sport !== "all") query = query.eq("sport", sport);

  const term = q.trim();
  if (term) {
    const { isPlayoffPhrase, sport: phraseSport } = parsePlayoffPhrase(term);
    if (isPlayoffPhrase) {
      query = query.eq("postseason", true);
      if (phraseSport) query = query.eq("sport", phraseSport);
    } else {
      const teamNames = await resolveTeamNameMatches(term, sport);
      const orClauses = [term, ...teamNames].map(t => `title.ilike.%${escapeLike(t)}%`);
      query = query.or(orClauses.join(","));
    }
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order(sort === "popular" ? "search_count" : "date", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw new Error(error.message);

  return { games: (data as GameSearchResult[]) ?? [], total: count ?? 0 };
}

const GAME_TABLES: Record<GameSport, string> = {
  nba: "nba_games",
  nfl: "nfl_games",
  mlb: "mlb_games",
};

export async function getGame(sport: GameSport, id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(GAME_TABLES[sport])
    .select("id,title,date,status,home_team_score,visitor_team_score,search_count")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as GameSearchResult | null;
}
