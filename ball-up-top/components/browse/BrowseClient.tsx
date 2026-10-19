"use client";

// Browse page: text search, sport/status filter pills, tag filter, and
// sort -- over every mock + real/live match (previously mock-only).
import { useMemo, useState } from "react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/app-store";
import type { Match, MatchStatus, SportSlug } from "@/lib/types";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { MatchCard } from "../match/MatchCard";
import { TagPill } from "../ui/TagPill";

type SortBy = "default" | "rating" | "popular";

const STATUSES: Array<"all" | MatchStatus> = [
  "all",
  "live",
  "upcoming",
  "final",
];
const STATUS_LABEL: Record<"all" | MatchStatus, string> = {
  all: "All",
  live: "Live",
  upcoming: "Upcoming",
  final: "Final",
};

export function BrowseClient({
  matches,
  tagToMatchIds,
}: {
  matches: Match[];
  tagToMatchIds: Record<string, string[]>;
}) {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<"all" | SportSlug>("all");
  const [status, setStatus] = useState<"all" | MatchStatus>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const { ratingsByMatch, hideScores } = useApp();

  const taggedIds = useMemo(
    () => (tag ? new Set(tagToMatchIds[tag] ?? []) : null),
    [tag, tagToMatchIds],
  );

  const filtered = useMemo(() => {
    let list = matches.filter((m) => {
      if (sport !== "all" && m.sport !== sport) return false;
      if (status !== "all" && m.status !== status) return false;
      if (taggedIds && !taggedIds.has(m.id)) return false;
      if (!q.trim()) return true;
      const hay = (
        m.a.name +
        m.b.name +
        m.league +
        SPORTS[m.sport].name
      ).toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    if (sortBy === "rating") {
      list = [...list].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
    } else if (sortBy === "popular") {
      list = [...list].sort((a, b) => b.logs - a.logs);
    }
    return list;
  }, [matches, sport, status, taggedIds, q, sortBy]);

  const sports: Array<"all" | SportSlug> = [
    "all",
    ...(Object.keys(SPORTS) as SportSlug[]),
  ];
  const availableTags = Object.keys(tagToMatchIds);

  return (
    <main
      style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 28px 80px" }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: -1,
          margin: "0 0 20px",
          color: "var(--text)",
        }}
      >
        Browse matches
      </h1>
      <div
        className="bw-search"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface-2)",
          borderRadius: 13,
          padding: "0 16px",
          height: 50,
          border: "1px solid var(--border)",
          maxWidth: 520,
        }}
      >
        <Icon name="search" size={19} stroke="var(--text-muted)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Teams, players, leagues…"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 16,
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Clear search"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <Icon name="close" size={18} stroke="var(--text-faint)" />
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "16px 0 8px",
        }}
      >
        {sports.map((s) => (
          <TagPill
            key={s}
            label={s === "all" ? "All sports" : SPORTS[s as SportSlug].name}
            active={sport === s}
            onClick={() => setSport(s)}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          padding: "4px 0 8px",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <TagPill
              key={s}
              label={STATUS_LABEL[s]}
              active={status === s}
              onClick={() => setStatus(s)}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TagPill
            label="Default"
            active={sortBy === "default"}
            onClick={() => setSortBy("default")}
          />
          <TagPill
            label="Highest rated"
            active={sortBy === "rating"}
            onClick={() => setSortBy("rating")}
          />
          <TagPill
            label="Most logged"
            active={sortBy === "popular"}
            onClick={() => setSortBy("popular")}
          />
        </div>
      </div>

      {availableTags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: "4px 0 16px",
          }}
        >
          {availableTags.map((t) => (
            <TagPill
              key={t}
              label={t}
              active={tag === t}
              onClick={() => setTag((prev) => (prev === t ? null : t))}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          image="/MJ-3peet-ASCII.png"
          imageWidth={1029}
          imageHeight={1548}
          alt="ASCII-art portrait of Michael Jordan"
          opacity={0.3}
          title="No matches found"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              userLog={ratingsByMatch[m.id]}
              hideScores={hideScores}
            />
          ))}
        </div>
      )}
    </main>
  );
}
