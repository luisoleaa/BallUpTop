"use client";

// Diary page: the signed-in user's logged matches (newest first) with
// summary stats. Auth is enforced by the parent Server Component.
import { MATCHES } from "@/lib/data";
import type { Match, Rating } from "@/lib/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { RatingList } from "../profile/RatingList";

export function DiaryClient({
  ratings,
  realMatches,
}: {
  ratings: Rating[];
  realMatches: Match[];
}) {
  const allMatches: Match[] = [...MATCHES, ...realMatches];
  const loggedCount = ratings.filter((r) =>
    allMatches.some((m) => m.id === r.matchId),
  ).length;

  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;
  const thisYear = ratings.filter(
    (r) => new Date(r.createdAt).getFullYear() === new Date().getFullYear(),
  ).length;

  return (
    <main
      style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: -1,
          margin: "0 0 6px",
          color: "var(--text)",
        }}
      >
        Your diary
      </h1>
      <p
        style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 26px" }}
      >
        Every match you&rsquo;ve logged, newest first.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {[
          ["Logged", loggedCount],
          ["Avg rating", avg ? avg.toFixed(1) : "–"],
          ["This year", thisYear],
        ].map(([k, v]) => (
          <Card key={String(k)} padding="18px 16px">
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--text)",
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono, monospace)",
                marginTop: 2,
              }}
            >
              {k}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        <RatingList
          ratings={ratings}
          matches={allMatches}
          emptyState={
            <EmptyState
              image="/Wilt-100-ASCII.png"
              imageWidth={890}
              imageHeight={1116}
              alt="ASCII-art portrait of Wilt Chamberlain"
              title="Nothing logged yet."
              subtitle="Rate a match to start your diary."
            />
          }
        />
      </div>
    </main>
  );
}
