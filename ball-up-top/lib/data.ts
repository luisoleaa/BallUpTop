// Mock data for the Match/Event system (browse, matches, events). Pages read
// this through getMatch/getEvent so a real provider can swap in later.
import type { Event, Match, SeedReview, Sport, SportSlug, UserLog } from "./types";

// Display name + brand color per sport, keyed by SportSlug.
export const SPORTS: Record<SportSlug, Sport> = {
  soccer:  { name: "Soccer",  color: "#16a34a" },
  nba:     { name: "NBA",     color: "#ea580c" },
  nfl:     { name: "NFL",     color: "#7c3aed" },
  tennis:  { name: "Tennis",  color: "#ca8a04" },
  mlb:     { name: "MLB",     color: "#dc2626" },
  f1:      { name: "F1",      color: "#e11d48" },
  ufc:     { name: "UFC",     color: "#b91c1c" },
  nhl:     { name: "NHL",     color: "#0891b2" },
  cricket: { name: "Cricket", color: "#0d9488" },
};

// All mock matches/games/fights/races across every sport, live/final/upcoming.
export const MATCHES: Match[] = [
  {
    id: "m1", sport: "soccer", league: "Copa América · Group A", status: "live", clock: "67'",
    a: { name: "Argentina", abbr: "ARG", color: "#6cace4", flag: "ar", score: 1 },
    b: { name: "Brazil",    abbr: "BRA", color: "#f7d117", flag: "br", score: 1 },
    avg: 8.2, logs: 2840, heat: true,
  },
  {
    id: "m2", sport: "nba", league: "NBA Finals · Game 6", status: "live", clock: "Q3 4:12",
    a: { name: "Boston Celtics",   abbr: "BOS", color: "#1d8348", score: 71 },
    b: { name: "Oklahoma City",    abbr: "OKC", color: "#2980b9", score: 68 },
    avg: 9.0, logs: 5120, heat: true,
  },
  {
    id: "m3", sport: "mlb", league: "MLB · Interleague", status: "live", clock: "Top 8",
    a: { name: "LA Dodgers",  abbr: "LAD", color: "#1e40af", score: 3 },
    b: { name: "NY Yankees",  abbr: "NYY", color: "#0f172a", score: 4 },
    avg: 7.2, logs: 910,
  },
  {
    id: "m4", sport: "tennis", league: "Roland-Garros · Final", status: "final", date: "Jun 8, 2026",
    a: { name: "Carlos Alcaraz", abbr: "ALC", color: "#dc2626", flag: "es", score: 3 },
    b: { name: "Jannik Sinner",  abbr: "SIN", color: "#ea580c", flag: "it", score: 2 },
    note: "6-7, 6-3, 4-6, 6-4, 7-5",
    avg: 9.6, logs: 8730, heat: true,
  },
  {
    id: "m5", sport: "soccer", league: "UEFA Champions League · Final", status: "final", date: "May 30, 2026",
    a: { name: "Real Madrid",  abbr: "RMA", color: "#1e3a8a", score: 2 },
    b: { name: "Inter Milan",  abbr: "INT", color: "#0c4a6e", score: 1 },
    avg: 8.6, logs: 12400, heat: true,
  },
  {
    id: "m6", sport: "nba", league: "NBA Finals · Game 5", status: "final", date: "Jun 15, 2026",
    a: { name: "Boston Celtics", abbr: "BOS", color: "#1d8348", score: 104 },
    b: { name: "Oklahoma City",  abbr: "OKC", color: "#2980b9", score: 117 },
    avg: 7.8, logs: 4010,
  },
  {
    id: "m7", sport: "f1", league: "Canadian Grand Prix", status: "final", date: "Jun 14, 2026",
    a: { name: "Lando Norris",   abbr: "NOR", color: "#f59e0b", flag: "gb", score: "P1" },
    b: { name: "Max Verstappen", abbr: "VER", color: "#1e3a8a", flag: "nl", score: "P2" },
    note: "Norris holds off Verstappen by 0.9s",
    avg: 8.0, logs: 2230,
  },
  {
    id: "m9", sport: "cricket", league: "ICC T20 · Super 8", status: "final", date: "Jun 12, 2026",
    a: { name: "India",     abbr: "IND", color: "#2563eb", flag: "in", score: 186 },
    b: { name: "Australia", abbr: "AUS", color: "#16a34a", flag: "au", score: 184 },
    note: "India win by 2 runs",
    avg: 8.8, logs: 3380,
  },
  {
    id: "m10", sport: "nhl", league: "Stanley Cup Final · Game 7", status: "final", date: "Jun 16, 2026",
    a: { name: "Edmonton Oilers",  abbr: "EDM", color: "#ea580c", score: 2 },
    b: { name: "Florida Panthers", abbr: "FLA", color: "#dc2626", score: 3 },
    note: "OT winner",
    avg: 9.4, logs: 5460, heat: true,
  },
  {
    id: "m11", sport: "soccer", league: "Club World Cup · QF", status: "upcoming", date: "Tonight · 8:00 PM",
    a: { name: "Man City",      abbr: "MCI", color: "#60a5fa", score: null },
    b: { name: "Bayern Munich", abbr: "BAY", color: "#dc2626", score: null },
    avg: null, logs: 0,
  },
  {
    id: "m12", sport: "nba", league: "NBA Finals · Game 7", status: "upcoming", date: "Sun · 8:00 PM",
    a: { name: "Boston Celtics", abbr: "BOS", color: "#1d8348", score: null },
    b: { name: "Oklahoma City",  abbr: "OKC", color: "#2980b9", score: null },
    avg: null, logs: 0,
  },
  {
    id: "m8", sport: "ufc", league: "UFC 318 · Main Event · Lightweight", status: "final", date: "Jun 7, 2026", event: "e1",
    a: { name: "I. Topuria",  abbr: "TOP", color: "#b91c1c", flag: "ge", score: "W" },
    b: { name: "C. Oliveira", abbr: "OLI", color: "#0f172a", flag: "br", score: "L" },
    note: "KO · Round 2, 1:24",
    avg: 9.2, logs: 6190, heat: true,
  },
  {
    id: "m13", sport: "ufc", league: "UFC 318 · Co-Main · Featherweight", status: "final", date: "Jun 7, 2026", event: "e1",
    a: { name: "A. Volkanovski", abbr: "VOL", color: "#1e3a8a", flag: "au", score: "W" },
    b: { name: "Y. Rodríguez",   abbr: "ROD", color: "#166534", flag: "mx", score: "L" },
    note: "Unanimous decision (49-46 ×3)",
    avg: 8.4, logs: 3120,
  },
  {
    id: "m14", sport: "ufc", league: "UFC 318 · Main Card · Lightweight", status: "final", date: "Jun 7, 2026", event: "e1",
    a: { name: "P. Pimblett", abbr: "PIM", color: "#0e7490", flag: "gb", score: "W" },
    b: { name: "B. Green",    abbr: "GRE", color: "#374151", flag: "us", score: "L" },
    note: "Submission (RNC) · Round 3, 2:11",
    avg: 7.6, logs: 1980,
  },
  {
    id: "m15", sport: "ufc", league: "UFC 319 · Main Event · Bantamweight", status: "upcoming", date: "Sat · 10:00 PM", event: "e2",
    a: { name: "M. Dvalishvili", abbr: "DVA", color: "#b91c1c", flag: "ge", score: null },
    b: { name: "S. O'Malley",    abbr: "OMA", color: "#7c3aed", flag: "us", score: null },
    avg: null, logs: 0,
  },
  {
    id: "m16", sport: "ufc", league: "UFC 319 · Co-Main · Light Heavyweight", status: "upcoming", date: "Sat · 9:30 PM", event: "e2",
    a: { name: "A. Pereira", abbr: "PER", color: "#0f172a", flag: "br", score: null },
    b: { name: "J. Hill",    abbr: "HIL", color: "#374151", flag: "us", score: null },
    avg: null, logs: 0,
  },
];

// UFC fight cards; each references its fights by Match id.
export const EVENTS: Event[] = [
  {
    id: "e2", name: "UFC 319", venue: "T-Mobile Arena · Las Vegas", date: "Saturday · Main card 9 PM",
    status: "upcoming", fights: ["m15", "m16"],
  },
  {
    id: "e1", name: "UFC 318", venue: "Madison Square Garden · NYC", date: "Jun 7, 2026",
    status: "final", fights: ["m8", "m13", "m14"],
  },
];

// Seeded fan reviews shown on match detail pages, keyed by match id.
export const REVIEWS: Record<string, SeedReview[]> = {
  m4: [
    { user: "claymccourt", rating: 10, live: true, tags: ["Instant classic"], text: "Five sets of pure theatre. Saved match point and somehow lifted his level. Best final in years.", time: "11d", likes: 312 },
    { user: "baseline_betty", rating: 9, live: false, tags: ["Comeback"], text: "Sinner was two sets up and you still felt Carlos would find a way. Drained but glad I stayed up.", time: "11d", likes: 184 },
    { user: "gridironghost", rating: 10, live: true, tags: [], text: "Did not move from the couch for four and a half hours. No regrets.", time: "10d", likes: 441 },
  ],
  m8: [
    { user: "octagon_op", rating: 10, live: true, tags: ["Blowout"], text: "Felt it coming the second the bell rang. Scary precision.", time: "12d", likes: 226 },
    { user: "mma_marg", rating: 8, live: false, tags: [], text: "Short but electric. Undercard carried the rest of the night though.", time: "12d", likes: 97 },
  ],
  m13: [
    { user: "volk_army", rating: 8.5, live: true, tags: [], text: "Masterclass over five rounds. The champ never looked in trouble.", time: "12d", likes: 63 },
  ],
  m10: [
    { user: "puckluck", rating: 10, live: true, tags: ["Heartbreak", "Instant classic"], text: "Game 7, overtime, Cup on the line. This is why we watch sports. Gutted but what a game.", time: "3d", likes: 528 },
    { user: "rinkside", rating: 9, live: true, tags: ["Comeback"], text: "Down two in the third and clawed it back. The OT was unbearable in the best way.", time: "3d", likes: 201 },
  ],
  m5: [
    { user: "tikitaka", rating: 8, live: true, tags: [], text: "Tactical chess in the first half, chaos in the second. Worth the watch.", time: "20d", likes: 88 },
    { user: "leftbackliam", rating: 9, live: false, tags: ["Instant classic"], text: "Final goal was offside by a toenail and they still gave it. Drama to the end.", time: "19d", likes: 356 },
  ],
};

// Sample diary entries -- not currently wired into app-store.tsx.
export const SEED_LOGS: Record<string, UserLog> = {
  m6: { rating: 7.0, review: "Blowout but the rookie minutes were fun to watch.", tags: ["Blowout"], live: true, ts: Date.now() - 86400000 * 4 },
  m9: { rating: 9.0, review: "", tags: ["Instant classic"], live: false, ts: Date.now() - 86400000 * 7 },
};

// Fixed vocabulary for tagging a logged match (RateModal, TagPill).
export const TAGS = ["Instant classic", "Comeback", "Blowout", "Heartbreak", "Snoozer", "Upset", "Overtime"];

export function getMatch(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}

// Flattens every seeded fan review across all matches and returns the
// most-liked `limit`, each paired with its match id -- powers the home
// page's "Popular reviews" section (see components/layout/PopularReviews.tsx).
export function getTopReviews(limit: number): Array<SeedReview & { matchId: string }> {
  return Object.entries(REVIEWS)
    .flatMap(([matchId, reviews]) => reviews.map((r) => ({ ...r, matchId })))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}

export function getEvent(id: string): Event | undefined {
  return EVENTS.find((e) => e.id === id);
}
