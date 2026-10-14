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

function ReviewRow({ review: r }: { review: PopularReview }) {
  return (
    <Link
      href={`/matches/${r.matchId}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 2px",
        borderBottom: "1px solid var(--border)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
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
  );
}
