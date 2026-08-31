// Home page section spotlighting the most-liked fan reviews across every
// match. `likes` is seeded mock data, not a real vote yet.
import Link from "next/link";
import { getMatch, SPORTS } from "@/lib/data";
import type { SeedReview } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { RatingValue } from "../ui/RatingValue";

export function PopularReviews({ reviews }: { reviews: Array<SeedReview & { matchId: string }> }) {
  return (
    <div>
      {reviews.map((r) => {
        const match = getMatch(r.matchId);
        if (!match) return null;
        return (
          <ReviewRow
            key={`${r.matchId}-${r.user}`}
            review={r}
            matchId={r.matchId}
            sportColor={SPORTS[match.sport].color}
            vs={`${match.a.abbr} v ${match.b.abbr}`}
          />
        );
      })}
    </div>
  );
}

function ReviewRow({
  review: r, matchId, sportColor, vs,
}: {
  review: SeedReview;
  matchId: string;
  sportColor: string;
  vs: string;
}) {
  return (
    <Link
      href={`/matches/${matchId}`}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 2px", borderBottom: "1px solid var(--border)",
        textDecoration: "none", color: "inherit",
      }}
    >
      <div style={{ flexShrink: 0, width: 34, textAlign: "right" }}>
        <RatingValue value={r.rating} size={13} />
      </div>
      <span style={{ flexShrink: 0, width: 1, height: 20, borderLeft: "1px dashed var(--border)" }} />
      <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: 99, background: sportColor }} />
      <span style={{ flexShrink: 0, fontWeight: 700, fontSize: 12, color: "var(--text-muted)" }}>{r.user}</span>
      <span className="bw-review-vs" style={{ flexShrink: 0, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{vs}</span>
      <span style={{
        flex: 1, minWidth: 0, fontSize: 13, color: "var(--text)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        &ldquo;{r.text}&rdquo;
      </span>
      <span style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 700, color: "var(--star)", fontFamily: "var(--font-mono, monospace)",
      }}>
        <Icon name="flame" size={12} stroke="var(--star)" />
        {r.likes.toLocaleString()}
      </span>
    </Link>
  );
}
