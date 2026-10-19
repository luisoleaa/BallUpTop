// Shared reverse-chron rating-row list, extracted from DiaryClient so
// /diary, /users/[id], and /activity render the same row markup.
// Presentational only -- callers resolve `ratings` against mock+real
// matches before passing them in.
import Link from "next/link";
import type { Match, Rating } from "@/lib/types";
import type { ReactNode } from "react";
import { Avatar } from "../ui/Avatar";
import { Crest } from "../ui/Crest";
import { Icon } from "../ui/Icon";
import { RatingValue } from "../ui/RatingValue";
import { SportChip } from "../ui/SportChip";

export interface RatingAuthor {
  userId: string;
  userName: string;
}

export function RatingList({
  ratings,
  matches,
  emptyState,
  authorByRatingId,
  onDelete,
}: {
  ratings: Rating[];
  matches: Match[];
  emptyState: ReactNode;
  // When set, each row shows who logged it (used by /activity, where rows
  // span multiple users -- /diary and /users/[id] never pass this, since
  // every row there already belongs to one known profile).
  authorByRatingId?: Map<string, RatingAuthor>;
  // When set, each row gets an inline remove button (only /diary passes
  // this -- a profile/activity row isn't the viewer's own rating to delete).
  onDelete?: (matchId: string) => void;
}) {
  const rated = ratings
    .map((r) => ({ r, match: matches.find((m) => m.id === r.matchId) }))
    .filter((x): x is { r: Rating; match: Match } => Boolean(x.match));

  if (rated.length === 0) return <>{emptyState}</>;

  return (
    <div>
      {rated.map(({ r, match: m }) => {
        const author = authorByRatingId?.get(r.id);
        return (
          <div
            key={r.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderBottom: "1px solid var(--border)",
              padding: "18px 0",
            }}
          >
            {author && (
              <Link
                href={`/users/${author.userId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <Avatar name={author.userName} seed={author.userId} size={22} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  {author.userName}
                </span>
              </Link>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link
                href={`/matches/${m.id}`}
                style={{
                  textAlign: "left",
                  display: "flex",
                  gap: 16,
                  flex: 1,
                  minWidth: 0,
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Crest side={m.a} size={38} />
                  <Crest side={m.b} size={38} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
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
              {onDelete && (
                <button
                  onClick={() => onDelete(m.id)}
                  aria-label="Remove from diary"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 6,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="trash" size={15} stroke="var(--text-faint)" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
