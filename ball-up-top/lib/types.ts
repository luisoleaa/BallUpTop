export type SportSlug =
  | "soccer"
  | "nba"
  | "nfl"
  | "tennis"
  | "mlb"
  | "f1"
  | "ufc"
  | "nhl"
  | "cricket";

export type MatchStatus = "live" | "final" | "upcoming";

export interface Sport {
  name: string;
  color: string;
}

export interface Side {
  name: string;
  abbr: string;
  color: string;
  flag?: string;
  // string for F1 positions ("P1") and UFC results ("W"/"L")
  score: number | string | null;
}

export interface Match {
  id: string;
  sport: SportSlug;
  league: string;
  status: MatchStatus;
  clock?: string;
  date?: string;
  a: Side;
  b: Side;
  note?: string;
  avg: number | null;
  logs: number;
  heat?: boolean;
  event?: string;
}

export interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  status: MatchStatus;
  fights: string[];
}

export interface SeedReview {
  user: string;
  rating: number;
  live: boolean;
  tags: string[];
  text: string;
  time: string;
  likes: number;
}

export interface UserLog {
  rating: number;
  review: string;
  tags: string[];
  live: boolean;
  ts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// DB-backed rating/review row (public.ratings)
export interface Rating {
  id: string;
  matchId: string;
  rating: number;
  review: string | null;
  tags: string[];
  watchedLive: boolean;
  createdAt: string;
  updatedAt: string;
}
