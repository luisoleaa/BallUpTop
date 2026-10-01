"use client";
import { useEffect, useState } from "react";
import type { liveGame } from "@/routes/live/mlb_live";
import { selectLiveNow } from "@/routes/live/mlb_live";
import { useApp } from "@/lib/app-store";
import { Section } from "../layout/Section";
import { Card } from "../ui/Card";
import { SportChip } from "../ui/SportChip";
import { TeamLogo } from "../search/TeamLogo";
import { StatusPill } from "../ui/StatusPill";

export function LiveGamesClient({ initialGames }: { initialGames: liveGame[] }) {
  const { hideScores } = useApp();
  const [allGames, setAllGames] = useState<liveGame[]>(initialGames);

  useEffect(() => {
    const fetchGames = async () => {
      // Skip fetch if document is hidden
      if (document.hidden) return;

      try {
        const res = await fetch("/api/live/mlb");
        if (res.ok) {
          const data = await res.json();
          setAllGames(data.games || initialGames);
        }
        // On error, keep previous games
      } catch {
        // Network error; keep previous games
      }
    };

    fetchGames();
    const intervalId = setInterval(fetchGames, 30000); // poll every 30 seconds

    // Refetch on visibility change (resume when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGames();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialGames]);

  const games = selectLiveNow(allGames);
  const liveCount = allGames.filter((g) => g.state === "Live").length;

  const header = (
    <span
      style={{
        fontSize: 11,
        color: "var(--live)",
        fontWeight: 700,
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      {liveCount} ON NOW
    </span>
  );

  if (games.length === 0) {
    return (
      <Section title="Live now" right={header}>
        <Card
          style={{
            textAlign: "center",
            color: "var(--text-faint)",
            fontSize: 14,
            padding: 32,
          }}
        >
          No live games right now
        </Card>
      </Section>
    );
  }

  return (
    <Section title="Live now" right={header}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {games.map((game) => (
          <Card key={game.id} padding={18}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <SportChip sport="mlb" />
              {game.state === "Live" ? (
                <StatusPill
                  match={{
                    status: "live" as const,
                    clock: game.inning || "",
                    date: "",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                    letterSpacing: 0.3,
                  }}
                  suppressHydrationWarning
                >
                  {new Date(game.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[game.away, game.home].map((team, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TeamLogo sport="mlb" abbreviation={team.abbr} size={34} />
                  <span
                    style={{
                      flex: 1,
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {team.name}
                  </span>
                  {team.score != null && !hideScores && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 800,
                        fontSize: 17,
                        color: "var(--text)",
                        minWidth: 26,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {team.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
