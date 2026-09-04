// Minimal detail page for a real historical game found via /search.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame, type GameSport } from "@/lib/queries/games";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { SportChip } from "@/components/ui/SportChip";
import { GameViewTracker } from "@/components/games/GameViewTracker";

const VALID_SPORTS: GameSport[] = ["nba", "nfl", "mlb"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; id: string }>;
}): Promise<Metadata> {
  const { sport: sportParam, id: idParam } = await params;
  if (!VALID_SPORTS.includes(sportParam as GameSport)) return {};
  const id = Number(idParam);
  if (!Number.isInteger(id)) return {};
  const game = await getGame(sportParam as GameSport, id);
  return game ? { title: game.title } : {};
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ sport: string; id: string }>;
}) {
  const { sport: sportParam, id: idParam } = await params;

  if (!VALID_SPORTS.includes(sportParam as GameSport)) notFound();
  const sport = sportParam as GameSport;

  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const game = await getGame(sport, id);
  if (!game) notFound();

  // UTC avoids rolling the date back a day when formatted in a local zone.
  const date = new Date(game.date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
  const hasScore = game.home_team_score != null && game.visitor_team_score != null;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "44px 28px 80px" }}>
      <GameViewTracker sport={sport} id={id} />
      <BackLink href="/search" />
      <Card padding={28}>
        <SportChip sport={sport} />
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: "10px 0 6px", color: "var(--text)" }}>
          {game.title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", fontFamily: "var(--font-mono, monospace)" }}>
          {date}
        </p>
        {hasScore && (
          <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono, monospace)", margin: "0 0 12px" }}>
            {game.home_team_score} – {game.visitor_team_score}
          </p>
        )}
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase", color: "var(--text-faint)", margin: 0 }}>
          {game.status}
        </p>
      </Card>
    </main>
  );
}
