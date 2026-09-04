"use client";

// Responsive grid of MatchCards, used across the home page and event detail.
import type { Match } from "@/lib/types";
import { useApp } from "@/lib/app-store";
import { MatchCard } from "../match/MatchCard";

export function HomeGrid({ matches }: { matches: Match[] }) {
  const { ratingsByMatch, hideScores } = useApp();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} userLog={ratingsByMatch[m.id]} hideScores={hideScores} />
      ))}
    </div>
  );
}
