"use client";

// Diary page: the signed-in user's logged matches with summary stats,
// sort/filter controls, and a per-sport breakdown. Auth is enforced by the
// parent Server Component.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MATCHES, SPORTS } from "@/lib/data";
import { useApp } from "@/lib/app-store";
import { deleteRatingAction } from "@/lib/actions/ratings";
import type { Match, Rating, SportSlug } from "@/lib/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { TagPill } from "../ui/TagPill";
import { RatingList } from "../profile/RatingList";

type SortBy = "newest" | "highest";

export function DiaryClient({
  ratings,
  realMatches,
}: {
  ratings: Rating[];
  realMatches: Match[];
}) {
  const router = useRouter();
  const { showToast } = useApp();
  const [sport, setSport] = useState<"all" | SportSlug>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const allMatches: Match[] = [...MATCHES, ...realMatches];
  const matchById = useMemo(
    () => new Map(allMatches.map((m) => [m.id, m])),
    [allMatches],
  );

  const loggedCount = ratings.filter((r) => matchById.has(r.matchId)).length;
  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;
  const thisYear = ratings.filter(
    (r) => new Date(r.createdAt).getFullYear() === new Date().getFullYear(),
  ).length;

  const sportCounts = useMemo(() => {
    const counts = new Map<SportSlug, number>();
    for (const r of ratings) {
      const m = matchById.get(r.matchId);
      if (!m) continue;
      counts.set(m.sport, (counts.get(m.sport) ?? 0) + 1);
    }
    return counts;
  }, [ratings, matchById]);

  const loggedSports = [...sportCounts.keys()].sort((a, b) =>
    SPORTS[a].name.localeCompare(SPORTS[b].name),
  );

  const visibleRatings = useMemo(() => {
    let list = ratings.filter((r) => matchById.has(r.matchId));
    if (sport !== "all") {
      list = list.filter((r) => matchById.get(r.matchId)?.sport === sport);
    }
    list = [...list].sort((a, b) =>
      sortBy === "highest"
        ? b.rating - a.rating
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return list;
  }, [ratings, matchById, sport, sortBy]);

  const handleDelete = async (matchId: string) => {
    await deleteRatingAction(matchId);
    showToast("Removed from your diary");
    router.refresh();
  };

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

      {loggedSports.length > 1 && (
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}
        >
          {loggedSports.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 11,
                color: "var(--text-faint)",
                fontFamily: "var(--font-mono, monospace)",
                border: "1px solid var(--border)",
                borderRadius: 99,
                padding: "4px 10px",
              }}
            >
              {SPORTS[s].name} · {sportCounts.get(s)}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 26,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", ...loggedSports] as const).map((s) => (
            <TagPill
              key={s}
              label={s === "all" ? "All sports" : SPORTS[s].name}
              active={sport === s}
              onClick={() => setSport(s)}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TagPill
            label="Newest"
            active={sortBy === "newest"}
            onClick={() => setSortBy("newest")}
          />
          <TagPill
            label="Highest rated"
            active={sortBy === "highest"}
            onClick={() => setSortBy("highest")}
          />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <RatingList
          ratings={visibleRatings}
          matches={allMatches}
          onDelete={handleDelete}
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
