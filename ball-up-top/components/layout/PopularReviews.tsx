// Home page section spotlighting the most-liked fan reviews across every
// match. Real reviews (public.ratings + review_likes) are ranked first,
// mock SeedReview content fills in after -- see app/page.tsx, which builds
// this already-resolved display list so this component stays presentational.
import Link from "next/link";
import { Icon } from "../ui/Icon";
import { RatingValue } from "../ui/RatingValue";

export interface PopularReview {
  key: string;
  matchId: string;
  user: string;
  // Set only for real reviews -- mock seed content has no profile to link to.
  userId?: string;
  rating: number;
  text: string;
  likes: number;
  sportColor: string;
  vs: string;
}

export function PopularReviews({ reviews }: { reviews: PopularReview[] }) {
  return (
    <div>
      {reviews.map((r) => (
        <ReviewRow key={r.key} review={r} />
      ))}
    </div>
  );
}

// The row links to the match, but the reviewer's name links to their
// profile -- two separate <a> elements can't nest, so the match-link
// portions use `display: contents` (no box of their own) to sit as plain
// flex children alongside the name link/span, rather than one element
// wrapping the whole row.
function ReviewRow({ review: r }: { review: PopularReview }) {
  const matchLinkStyle = {
    display: "contents" as const,
    textDecoration: "none",
    color: "inherit",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 2px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href={`/matches/${r.matchId}`} style={matchLinkStyle}>
        <div style={{ flexShrink: 0, width: 34, textAlign: "right" }}>
          <RatingValue value={r.rating} size={13} />
        </div>
        <span
          style={{
            flexShrink: 0,
            width: 1,
            height: 20,
            borderLeft: "1px dashed var(--border)",
          }}
        />
        <span
          style={{
            flexShrink: 0,
            width: 6,
            height: 6,
            borderRadius: 99,
            background: r.sportColor,
          }}
        />
      </Link>
      {r.userId ? (
        <Link
          href={`/users/${r.userId}`}
          style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          {r.user}
        </Link>
      ) : (
        <span
          style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {r.user}
        </span>
      )}
      <Link href={`/matches/${r.matchId}`} style={matchLinkStyle}>
        <span
          className="bw-review-vs"
          style={{
            flexShrink: 0,
            fontSize: 11,
            color: "var(--text-faint)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {r.vs}
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          &ldquo;{r.text}&rdquo;
        </span>
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--star)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <Icon name="flame" size={12} stroke="var(--star)" />
          {r.likes.toLocaleString()}
        </span>
      </Link>
    </div>
  );
}
