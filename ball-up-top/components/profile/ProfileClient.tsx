"use client";

// Public profile page: anyone's display name, member-since date, aggregate
// stats, and their logged ratings -- all public per ratings/profiles RLS.
// Mirrors DiaryClient's stat-tile markup/pattern but for any user id, not
// just the signed-in one.
import Link from "next/link";
import { MATCHES, SPORTS } from "@/lib/data";
import type { Match, Rating } from "@/lib/types";
import type { Profile } from "@/lib/queries/profiles";
import type { MatchList } from "@/lib/queries/lists";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Label } from "../ui/Label";
import { FollowButton } from "./FollowButton";
import { RatingList } from "./RatingList";

function memberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function favoriteSport(ratings: Rating[], matches: Match[]): string | null {
  const counts = new Map<string, number>();
  for (const r of ratings) {
    const match = matches.find((m) => m.id === r.matchId);
    if (!match) continue;
    counts.set(match.sport, (counts.get(match.sport) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [sport, count] of counts) {
    if (count > bestCount) {
      best = sport;
      bestCount = count;
    }
  }
  return best;
}

export function ProfileClient({
  profile,
  ratings,
  realMatches,
  viewerId,
  isFollowing,
  followCounts,
  lists,
}: {
  profile: Profile;
  ratings: Rating[];
  realMatches: Match[];
  viewerId: string | null;
  isFollowing: boolean;
  followCounts: { followers: number; following: number };
  lists: MatchList[];
}) {
  const allMatches: Match[] = [...MATCHES, ...realMatches];
  const loggedCount = ratings.filter((r) =>
    allMatches.some((m) => m.id === r.matchId),
  ).length;
  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;
  const favSport = favoriteSport(ratings, allMatches);

  return (
    <main
      style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 6,
        }}
      >
        <Avatar name={profile.displayName} seed={profile.id} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -1,
              margin: 0,
              color: "var(--text)",
            }}
          >
            {profile.displayName}
          </h1>
          <p
            style={{
              color: "var(--text-faint)",
              fontSize: 13,
              fontFamily: "var(--font-mono, monospace)",
              margin: "4px 0 0",
            }}
          >
            Member since {memberSince(profile.createdAt)}
          </p>
        </div>
        {viewerId && viewerId !== profile.id && (
          <FollowButton targetId={profile.id} initialFollowing={isFollowing} />
        )}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        <Link
          href={`/users/${profile.id}/followers`}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          <strong style={{ color: "var(--text)" }}>
            {followCounts.followers}
          </strong>{" "}
          followers
        </Link>
        <Link
          href={`/users/${profile.id}/following`}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          <strong style={{ color: "var(--text)" }}>
            {followCounts.following}
          </strong>{" "}
          following
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 26,
        }}
      >
        {[
          ["Logged", loggedCount],
          ["Avg given", ratings.length ? avg.toFixed(1) : "–"],
          [
            "Favorite sport",
            favSport ? SPORTS[favSport as keyof typeof SPORTS].name : "–",
          ],
        ].map(([k, v]) => (
          <Card key={String(k)} padding="18px 16px">
            <div
              style={{
                fontSize: 24,
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

      {lists.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <Label as="h2" variant="section" style={{ marginBottom: 10 }}>
            Lists
          </Label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {lists.map((list) => (
              <Card
                key={list.id}
                href={`/lists/${list.id}`}
                hoverable
                padding="14px 14px"
              >
                {list.isWatchlist && (
                  <Label
                    variant="sub"
                    color="var(--accent-strong)"
                    style={{ marginBottom: 4 }}
                  >
                    Watchlist
                  </Label>
                )}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: "var(--text)",
                  }}
                >
                  {list.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    fontFamily: "var(--font-mono, monospace)",
                    marginTop: 4,
                  }}
                >
                  {list.itemCount} {list.itemCount === 1 ? "match" : "matches"}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
            />
          }
        />
      </div>
    </main>
  );
}
