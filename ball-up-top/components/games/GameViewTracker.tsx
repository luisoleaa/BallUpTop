"use client";

// Fires the view-count increment once on real mount (not during the
// server render, so link prefetching doesn't inflate counts).
import { useEffect } from "react";
import { incrementGameView } from "@/lib/actions/games";
import type { GameSport } from "@/lib/queries/games";

export function GameViewTracker({ sport, id }: { sport: GameSport; id: number }) {
  useEffect(() => {
    incrementGameView(sport, id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per mount only
  }, []);

  return null;
}
