// UFC source for the live-games feed: ESPN's keyless site API. Unlike every
// other sport here, one ESPN "event" is a fight card bundling MULTIPLE
// "competitions" (individual fights) — flatten every competition on a card
// into its own liveGame, consistent with how every other provider treats one
// card = one rateable game.
//
// Verified against the live API (not guessed): neither `summary?event=<id>`
// nor `scoreboard?event=<id>` resolve a specific fight or card (both 404 or
// are silently ignored) — ESPN's only working query knob for MMA is
// `scoreboard?dates=<range>`. So by-id lookup needs the fight's date to
// query narrowly; the match id therefore encodes it as
// "ufc-<YYYYMMDD>-<competitionId>" (UTC — UFC's day grouping in this API is
// plain UTC, unlike MLB/NBA/NFL's US-Eastern convention).
import { liveMatchId, type liveGame, type liveTeam } from "./live";

const ESPN_UFC = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc";

interface EspnUfcAthlete {
  displayName: string;
  shortName?: string;
  flag?: { href: string; alt?: string };
}

interface EspnUfcCompetitor {
  id: string;
  winner?: boolean;
  athlete: EspnUfcAthlete;
}

export interface EspnUfcCompetition {
  id: string;
  date: string;
  status: {
    period: number;
    displayClock: string;
    type: { state: "pre" | "in" | "post"; shortDetail: string };
  };
  competitors: EspnUfcCompetitor[];
}

export interface EspnUfcEvent {
  id: string;
  name: string;
  competitions: EspnUfcCompetition[];
}

export interface EspnUfcScoreboard {
  events: EspnUfcEvent[];
}

const STATE: Record<EspnUfcCompetition["status"]["type"]["state"], string> = {
  pre: "Preview",
  in: "Live",
  post: "Final",
};

// FlagBadge only has hand-drawn SVGs for a small fixed set of ISO-alpha-2
// codes. ESPN's athlete.flag.href embeds its own 3-letter country codes
// (e.g. "usa", "eng", "bra") that don't match that scheme — map the ones
// that have a reasonable FlagBadge equivalent; anything else is left
// unmapped so Crest falls through to the monogram tier instead of an empty
// flag box.
const ESPN_TO_FLAG_BADGE: Record<string, string> = {
  usa: "us",
  bra: "br",
  mex: "mx",
  esp: "es",
  ita: "it",
  geo: "ge",
  ind: "in",
  nld: "nl",
  ned: "nl",
  aus: "au",
  arg: "ar",
  gbr: "gb",
  eng: "gb",
  sco: "gb",
  wls: "gb",
  nir: "gb",
};

function flagCode(athlete: EspnUfcAthlete): string | undefined {
  const m = /\/countries\/\d+\/([a-z]+)\.png/i.exec(athlete.flag?.href ?? "");
  const code = m?.[1]?.toLowerCase();
  return code ? ESPN_TO_FLAG_BADGE[code] : undefined;
}

function toFighter(
  c: EspnUfcCompetitor,
  state: string,
  anyWinner: boolean,
): liveTeam {
  const name = c.athlete.shortName ?? c.athlete.displayName;
  const abbr = c.athlete.displayName
    .split(" ")
    .pop()!
    .slice(0, 3)
    .toUpperCase();
  const score =
    state === "Final" ? (c.winner ? "W" : anyWinner ? "L" : null) : null;
  return { id: Number(c.id), name, abbr, score, flag: flagCode(c.athlete) };
}

// UTC YYYYMMDD — UFC's day grouping in this API is plain UTC, confirmed by
// querying `dates=<competition.date's UTC day>` and getting that card back.
function utcDateKey(iso: string): string {
  return iso.slice(0, 10).replaceAll("-", "");
}

// Returns null for a malformed card entry missing one of its two fighters
// (e.g. a withdrawn/TBD opponent slot), so one bad fight can't throw and
// blank every UFC fight on the card for the poll cycle.
export function mapFight(
  eventName: string,
  competition: EspnUfcCompetition,
): liveGame | null {
  const state = STATE[competition.status.type.state] ?? "Preview";
  const anyWinner = competition.competitors.some((c) => c.winner);
  const [a, b] = competition.competitors;
  if (!a || !b) return null;
  const gameId = `${utcDateKey(competition.date)}-${competition.id}`;
  const round =
    competition.status.period > 0
      ? `Round ${competition.status.period} · ${competition.status.displayClock}`
      : null;

  return {
    id: liveMatchId("ufc", gameId),
    sport: "ufc",
    state,
    startTime: competition.date,
    gameId,
    clock: state === "Live" ? round : null,
    note: state === "Final" ? (round ?? undefined) : undefined,
    league: eventName,
    away: toFighter(a, state, anyWinner),
    home: toFighter(b, state, anyWinner),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`ESPN UFC request failed: ${res.status}`);
  return res.json();
}

export function flattenScoreboard(data: EspnUfcScoreboard): liveGame[] {
  return (data.events ?? []).flatMap((e) =>
    e.competitions.map((c) => mapFight(e.name, c)).filter((g) => g != null),
  );
}

// Yesterday + today (UTC): defends against the same "no-param scoreboard
// returns only the next card" quirk NBA/NFL have, in case a card is live
// right at a UTC day boundary.
export async function getLiveUfcGames(
  now: Date = new Date(),
): Promise<liveGame[]> {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const range = `${utcDateKey(yesterday.toISOString())}-${utcDateKey(now.toISOString())}`;
  const data = await fetchJson<EspnUfcScoreboard>(
    `${ESPN_UFC}/scoreboard?dates=${range}`,
  );
  return flattenScoreboard(data);
}

// Splits a "<dateKey>-<competitionId>" composite gameId back apart. dateKey
// is always 8 digits with no dash, so splitting on the first one is unambiguous.
export function splitUfcGameId(compositeId: string): {
  dateKey: string;
  competitionId: string;
} {
  const sep = compositeId.indexOf("-");
  return {
    dateKey: compositeId.slice(0, sep),
    competitionId: compositeId.slice(sep + 1),
  };
}

// Look up specific fights by composite id. Groups by date (ESPN has no
// direct per-fight or per-card lookup for MMA — see file header), fetching
// each distinct day's card once and filtering to the requested fights.
export async function getUfcGamesById(ids: string[]): Promise<liveGame[]> {
  const byDate = new Map<string, Set<string>>();
  for (const id of ids) {
    const { dateKey, competitionId } = splitUfcGameId(id);
    const set = byDate.get(dateKey);
    if (set) set.add(competitionId);
    else byDate.set(dateKey, new Set([competitionId]));
  }

  const results = await Promise.allSettled(
    [...byDate.entries()].map(async ([dateKey, competitionIds]) => {
      const data = await fetchJson<EspnUfcScoreboard>(
        `${ESPN_UFC}/scoreboard?dates=${dateKey}`,
      );
      return flattenScoreboard(data).filter((g) =>
        competitionIds.has(splitUfcGameId(g.gameId).competitionId),
      );
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
