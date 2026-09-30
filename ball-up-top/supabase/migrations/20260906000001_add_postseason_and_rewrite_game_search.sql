-- postseason flag on each games table (nullable; NULL / false both mean
-- "regular season"). Populated afterwards by scripts/backfill-postseason.ts.
alter table public.nba_games add column if not exists postseason boolean;
alter table public.nfl_games add column if not exists postseason boolean;
alter table public.mlb_games add column if not exists postseason boolean;

-- game_search view: append postseason + resolved team abbreviations.
-- CREATE OR REPLACE keeps the existing 8 columns in the same order and adds 3
-- at the end, matching lib/queries/games.ts's EXTENDED_COLUMNS.
create or replace view public.game_search as
  select 'nba'::text as sport, g.id, g.title, g.date, g.status,
         g.home_team_score, g.visitor_team_score, g.search_count,
         g.postseason,
         coalesce(ht.abbreviation, '') as home_team_abbr,
         coalesce(vt.abbreviation, '') as visitor_team_abbr
    from public.nba_games g
    left join public.nba_teams ht on ht.id = g.home_team_id
    left join public.nba_teams vt on vt.id = g.visitor_team_id
  union all
  select 'nfl'::text as sport, g.id, g.title, g.date, g.status,
         g.home_team_score, g.visitor_team_score, g.search_count,
         g.postseason,
         coalesce(ht.abbreviation, '') as home_team_abbr,
         coalesce(vt.abbreviation, '') as visitor_team_abbr
    from public.nfl_games g
    left join public.nfl_teams ht on ht.id = g.home_team_id
    left join public.nfl_teams vt on vt.id = g.visitor_team_id
  union all
  select 'mlb'::text as sport, g.id, g.title, g.date, g.status,
         g.home_team_score, g.visitor_team_score, g.search_count,
         g.postseason,
         coalesce(ht.abbreviation, '') as home_team_abbr,
         coalesce(vt.abbreviation, '') as visitor_team_abbr
    from public.mlb_games g
    left join public.mlb_teams ht on ht.id = g.home_team_id
    left join public.mlb_teams vt on vt.id = g.visitor_team_id;

-- CREATE OR REPLACE VIEW resets the view to SECURITY DEFINER (advisor error
-- 0010). Every underlying table has public-read RLS, so run it as the caller.
alter view public.game_search set (security_invoker = on);




