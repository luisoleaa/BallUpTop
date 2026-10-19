// Shared reverse-chron rating-row list, extracted from DiaryClient so
// /diary and /users/[id] render the same row markup. Presentational only --
// callers resolve `ratings` against mock+real matches before passing them in.
import Link from "next/link";
import type { Match, Rating } from "@/lib/types";
import type { ReactNode } from "react";
import { Crest } from "../ui/Crest";
import { RatingValue } from "../ui/RatingValue";
import { SportChip } from "../ui/SportChip";

export function RatingList({
  ratings,
  matches,
  emptyState,
}: {
  ratings: Rating[];
  matches: Match[];
  emptyState: ReactNode;
}) {
  const rated = ratings
    .map((r) => ({ r, match: matches.find((m) => m.id === r.matchId) }))
    .filter((x): x is { r: Rating; match: Match } => Boolean(x.match));

  if (rated.length === 0) return <>{emptyState}</>;

  return (
    <div>
      {rated.map(({ r, match: m }) => (
        <Link
          key={m.id}
          href={`/matches/${m.id}`}
          style={{
            textAlign: "left",
            display: "flex",
            gap: 16,
            textDecoration: "none",
            borderBottom: "1px solid var(--border)",
            padding: "18px 0",
          }}
        >
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Crest side={m.a} size={38} />
            <Crest side={m.b} size={38} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--text)",
                }}
              >
                {m.a.abbr} v {m.b.abbr}
              </span>
              <SportChip sport={m.sport} muted />
            </div>
            {r.review && (
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  margin: "6px 0 0",
                  lineHeight: 1.5,
                }}
              >
                {r.review}
              </p>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <RatingValue value={r.rating} size={16} />
          </div>
        </Link>
      ))}
    </div>
  );
}
