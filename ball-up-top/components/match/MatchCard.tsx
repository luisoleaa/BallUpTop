// Clickable card summarizing one match: sport + status, both sides with
// crest/name/score, and community rating. `hideScores` isn't wired to any
// toggle yet, but the prop already works for spoiler-free mode later.
import type { Match } from "@/lib/types";
import { Card } from "../ui/Card";
import { Crest } from "../ui/Crest";
import { RatingValue } from "../ui/RatingValue";
import { SportChip } from "../ui/SportChip";
import { StatusPill } from "../ui/StatusPill";

export function MatchCard({
  match, hideScores, userLog,
}: {
  match: Match;
  hideScores?: boolean;
  userLog?: { rating: number };
}) {
  return (
    <Card
      href={`/matches/${match.id}`}
      padding={18}
      style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SportChip sport={match.sport} />
        <StatusPill match={match} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[match.a, match.b].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Crest side={s} size={34} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
            {s.score != null && !hideScores && (
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 17, color: "var(--text)", minWidth: 26, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {s.score}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: "var(--border)" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {match.avg != null
          ? <RatingValue value={match.avg} size={15} />
          : <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>Not yet rated</span>}
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>
          {userLog
            ? `You rated ${userLog.rating.toFixed(1)}`
            : (match.logs ? match.logs.toLocaleString() + " logs" : "")}
        </span>
      </div>
    </Card>
  );
}
