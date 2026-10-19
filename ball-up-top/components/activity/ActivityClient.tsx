"use client";

// Activity feed: recent ratings from people the signed-in user follows.
// Auth is enforced by the parent Server Component.
import type { Match, Rating } from "@/lib/types";
import type { RatingAuthor } from "@/components/profile/RatingList";
import { EmptyState } from "../ui/EmptyState";
import { RatingList } from "../profile/RatingList";

export function ActivityClient({
  ratings,
  matches,
  authorByRatingId,
}: {
  ratings: Rating[];
  matches: Match[];
  authorByRatingId: Map<string, RatingAuthor>;
}) {
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
        Activity
      </h1>
      <p
        style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 26px" }}
      >
        Recent ratings from people you follow.
      </p>
      <RatingList
        ratings={ratings}
        matches={matches}
        authorByRatingId={authorByRatingId}
        emptyState={
          <EmptyState
            image="/Lebron-Lob-ASCII.png"
            imageWidth={870}
            imageHeight={1536}
            alt="ASCII-art illustration of LeBron James mid-lob dunk"
            title="Nothing here yet."
            subtitle="Follow a few fans to see what they're logging."
          />
        }
      />
    </main>
  );
}
