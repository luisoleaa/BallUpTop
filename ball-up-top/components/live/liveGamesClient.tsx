"use client";
import { useEffect, useState } from "react";
import type { liveGame } from "@/routes/live/mlb_live";
import { Card } from "../ui/Card";
import { SportChip } from "../ui/SportChip";
import { TeamLogo } from "../search/TeamLogo";

export function LiveGamesClient() {
  const [games, setGames] = useState<liveGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/live/mlb");
        const data = await res.json();
        setGames(data.games || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchGames();

    const intervalId = setInterval(fetchGames, 30000); // fetches every 30 seconds
    return () => clearInterval(intervalId);
  }, []);
  if (loading) return <div> Loading...</div>;
  if (games.length == 0) return <div>No Live Games</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "14px",
        padding: "20px",
      }}
    >
      {games.map((game) => (
        <Card key={game.id} padding={18}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <SportChip sport="mlb" />
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-faint)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {game.state}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[game.away, game.home].map((team, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                {team.score != null && (
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
  );
}
