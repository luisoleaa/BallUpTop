// Result card for a real historical game (from the game_search view).
import { Card } from "../ui/Card";
import { SportChip } from "../ui/SportChip";
import { TeamLogo } from "./TeamLogo";
import type { GameSearchResult } from "@/lib/queries/games";

export function GameResultCard({ game }: { game: GameSearchResult }) {
  // UTC avoids rolling the date back a day when formatted in a local zone.
  const date = new Date(game.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
  const hasScore = game.home_team_score != null && game.visitor_team_score != null;

  const [homeName, visitorName] = game.title.split(" vs ");
  const canShowLogos = homeName && visitorName && game.home_team_abbr && game.visitor_team_abbr;

  return (
    <Card
      href={`/games/${game.sport}/${game.id}`}
      padding={18}
      style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SportChip sport={game.sport} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>
          {date}
        </span>
      </div>
      {canShowLogos ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
            <TeamLogo sport={game.sport} abbreviation={game.home_team_abbr} size={20} />
            {homeName}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
            <TeamLogo sport={game.sport} abbreviation={game.visitor_team_abbr} size={20} />
            {visitorName}
          </span>
        </div>
      ) : (
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{game.title}</span>
      )}
      {hasScore && (
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 17, color: "var(--text)" }}>
          {game.home_team_score} – {game.visitor_team_score}
        </span>
      )}
    </Card>
  );
}
