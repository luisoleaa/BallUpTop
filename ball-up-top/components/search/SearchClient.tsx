"use client";

// Search over both the real historical game archive and today's real
// live/upcoming games. Debounced text input + sport filter + live-only
// filter + recent/popular sort (archive only), synced to the URL so a
// search is bookmarkable.
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { LIVE_SPORTS, type LiveSport } from "@/routes/live/live";
import type { Match } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { TagPill } from "../ui/TagPill";
import { EmptyState } from "../ui/EmptyState";
import { MatchCard } from "../match/MatchCard";
import { GameResultCard } from "./GameResultCard";
import type { GameSearchResult } from "@/lib/queries/games";

const SPORT_LABELS: Record<LiveSport, string> = {
  mlb: "MLB",
  nba: "NBA",
  nfl: "NFL",
  soccer: "Soccer",
  ufc: "UFC",
  nhl: "NHL",
};
const SPORT_OPTIONS: { value: LiveSport | "all"; label: string }[] = [
  { value: "all", label: "All sports" },
  ...LIVE_SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] })),
];

export function SearchClient({
  initialGames,
  initialTotal,
  initialLive,
  initialQuery,
  initialSport,
  initialSort,
  initialLiveOnly,
}: {
  initialGames: GameSearchResult[];
  initialTotal: number;
  initialLive: Match[];
  initialQuery: string;
  initialSport: LiveSport | "all";
  initialSort: "recent" | "popular";
  initialLiveOnly: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [sport, setSport] = useState<LiveSport | "all">(initialSport);
  const [sort, setSort] = useState<"recent" | "popular">(initialSort);
  const [liveOnly, setLiveOnly] = useState(initialLiveOnly);
  const [games, setGames] = useState(initialGames);
  const [total, setTotal] = useState(initialTotal);
  const [live, setLive] = useState(initialLive);
  const [isPending, startTransition] = useTransition();
  const { ratingsByMatch, hideScores } = useApp();

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (sport !== "all") params.set("sport", sport);
      if (sort !== "recent") params.set("sort", sort);
      if (liveOnly) params.set("live", "1");
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, {
        scroll: false,
      });

      startTransition(async () => {
        const res = await fetch(`/api/games/search?${params.toString()}`);
        const data = await res.json();
        setGames(data.games);
        setTotal(data.total);
        setLive(data.live);
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router/searchParams identity churn shouldn't re-trigger this
  }, [q, sport, sort, liveOnly]);

  const showArchive = !liveOnly;
  const empty =
    live.length === 0 && (!showArchive || games.length === 0) && !isPending;

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
        Search games
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
          placeholder="Search by team, e.g. Celtics vs Spurs…"
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
        {SPORT_OPTIONS.map((opt) => (
          <TagPill
            key={opt.value}
            label={opt.label}
            active={sport === opt.value}
            onClick={() => setSport(opt.value)}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "4px 0 8px",
        }}
      >
        <TagPill
          label="Live only"
          active={liveOnly}
          onClick={() => setLiveOnly((v) => !v)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <TagPill
            label="Most recent"
            active={sort === "recent"}
            onClick={() => setSort("recent")}
          />
          <TagPill
            label="Most popular"
            active={sort === "popular"}
            onClick={() => setSort("popular")}
          />
        </div>
      </div>

      {empty ? (
        <EmptyState
          image="/Wilt-100-ASCII.png"
          imageWidth={890}
          imageHeight={1116}
          alt="ASCII-art portrait of Wilt Chamberlain"
          opacity={0.3}
          title="No games found"
          subtitle={q ? `Nothing matches "${q}"` : undefined}
        />
      ) : (
        <div style={{ opacity: isPending ? 0.6 : 1 }}>
          {live.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  margin: "16px 0 10px",
                }}
              >
                Live & upcoming
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {live.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    userLog={ratingsByMatch[m.id]}
                    hideScores={hideScores}
                  />
                ))}
              </div>
            </>
          )}

          {showArchive && games.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {games.map((g) => (
                  <GameResultCard key={`${g.sport}-${g.id}`} game={g} />
                ))}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-faint)",
                  fontFamily: "var(--font-mono, monospace)",
                  marginTop: 20,
                }}
              >
                {total.toLocaleString()} game{total === 1 ? "" : "s"} found
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
