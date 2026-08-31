"use client";

// Diary page: the signed-in user's logged matches (newest first) with
// summary stats. Auth is enforced by the parent Server Component.
import Link from "next/link";
import { MATCHES } from "@/lib/data";
import type { Match, Rating } from "@/lib/types";
import { Card } from "../ui/Card";
import { Crest } from "../ui/Crest";
import { EmptyState } from "../ui/EmptyState";
import { RatingValue } from "../ui/RatingValue";
import { SportChip } from "../ui/SportChip";

export function DiaryClient({ ratings }: { ratings: Rating[] }) {
  const rated = ratings
    .map((r) => ({ r, match: MATCHES.find((m) => m.id === r.matchId) }))
    .filter((x): x is { r: Rating; match: Match } => Boolean(x.match));

  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 6px", color: "var(--text)" }}>
        Your diary
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 26px" }}>
        Every match you&rsquo;ve logged, newest first.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[["Logged", ratings.length], ["Avg rating", avg ? avg.toFixed(1) : "–"], ["This year", ratings.length]].map(([k, v]) => (
          <Card key={String(k)} padding="18px 16px">
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-mono, monospace)", color: "var(--text)" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", marginTop: 2 }}>{k}</div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        {rated.length === 0 ? (
          <EmptyState
            image="/Wilt-100-ASCII.png" imageWidth={890} imageHeight={1116}
            alt="ASCII-art portrait of Wilt Chamberlain"
            title="Nothing logged yet." subtitle="Rate a match to start your diary."
          />
        ) : rated.map(({ r, match: m }) => (
          <Link key={m.id} href={`/matches/${m.id}`} style={{
            textAlign: "left", display: "flex", gap: 16, textDecoration: "none",
            borderBottom: "1px solid var(--border)", padding: "18px 0",
          }}>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <Crest side={m.a} size={38} />
              <Crest side={m.b} size={38} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{m.a.abbr} v {m.b.abbr}</span>
                <SportChip sport={m.sport} muted />
              </div>
              {r.review && <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>{r.review}</p>}
            </div>
            <div style={{ flexShrink: 0 }}>
              <RatingValue value={r.rating} size={16} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
