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
}

export interface UserLog {
  rating: number;
  review: string;
  tags: string[];
  live: boolean;
  ts: number;
}

export interface User {
  name: string;
  email: string;
}
