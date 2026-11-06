// Maps a raw `ratings` table row to the app's Rating shape.
import type { Rating } from "./types";

export interface RatingRow {
  id: string;
  match_id: string;
  rating: number | string;
  review: string | null;
  tags: string[] | null;
  watched_live: boolean;
  created_at: string;
  updated_at: string;
}

export function toRating(row: RatingRow): Rating {
  return {
    id: row.id,
    matchId: row.match_id,
    rating: Number(row.rating),
    review: row.review,
    tags: row.tags ?? [],
    watchedLive: row.watched_live,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
