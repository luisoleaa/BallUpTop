"use client";

import type { Match } from "@/lib/types";
import { useApp } from "@/lib/app-store";
import { MatchCard } from "./MatchCard";

export function HomeGrid({ matches }: { matches: Match[] }) {
  const { logs } = useApp();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} userLog={logs[m.id]} />
      ))}
    </div>
  );
}
