"use client";

// Search over the real historical game archive. Debounced text input + sport
// filter + recent/popular sort, synced to the URL so a search is bookmarkable.
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../ui/Icon";
import { TagPill } from "../ui/TagPill";
import { EmptyState } from "../ui/EmptyState";
import { GameResultCard } from "./GameResultCard";
import type { GameSearchResult, GameSport } from "@/lib/queries/games";

const SPORT_OPTIONS: { value: GameSport | "all"; label: string }[] = [
  { value: "all", label: "All sports" },
  { value: "nba", label: "NBA" },
  { value: "nfl", label: "NFL" },
  { value: "mlb", label: "MLB" },
];

export function SearchClient({
  initialGames, initialTotal, initialQuery, initialSport, initialSort,
}: {
  initialGames: GameSearchResult[];
  initialTotal: number;
  initialQuery: string;
  initialSport: GameSport | "all";
  initialSort: "recent" | "popular";
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [sport, setSport] = useState<GameSport | "all">(initialSport);
  const [sort, setSort] = useState<"recent" | "popular">(initialSort);
  const [games, setGames] = useState(initialGames);
  const [total, setTotal] = useState(initialTotal);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (sport !== "all") params.set("sport", sport);
      if (sort !== "recent") params.set("sort", sort);
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, { scroll: false });

      startTransition(async () => {
        const res = await fetch(`/api/games/search?${params.toString()}`);
        const data = await res.json();
        setGames(data.games);
        setTotal(data.total);
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router/searchParams identity churn shouldn't re-trigger this
  }, [q, sport, sort]);

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 28px 80px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 20px", color: "var(--text)" }}>
        Search games
      </h1>
      <div
        className="bw-search"
        style={{
          display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)",
          borderRadius: 13, padding: "0 16px", height: 50, border: "1px solid var(--border)", maxWidth: 520,
        }}
      >
        <Icon name="search" size={19} stroke="var(--text-muted)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by team, e.g. Celtics vs Spurs…"
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: 16, color: "var(--text)", fontFamily: "inherit",
          }}
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear search" style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex" }}>
            <Icon name="close" size={18} stroke="var(--text-faint)" />
          </button>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 0 8px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SPORT_OPTIONS.map((opt) => (
            <TagPill key={opt.value} label={opt.label} active={sport === opt.value} onClick={() => setSport(opt.value)} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TagPill label="Most recent" active={sort === "recent"} onClick={() => setSort("recent")} />
          <TagPill label="Most popular" active={sort === "popular"} onClick={() => setSort("popular")} />
        </div>
      </div>

      {games.length === 0 && !isPending ? (
        <EmptyState
          image="/Wilt-100-ASCII.png" imageWidth={890} imageHeight={1116}
          alt="ASCII-art portrait of Wilt Chamberlain" opacity={0.3}
          title="No games found"
          subtitle={q ? `Nothing matches "${q}"` : undefined}
        />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 16, opacity: isPending ? 0.6 : 1 }}>
            {games.map((g) => <GameResultCard key={`${g.sport}-${g.id}`} game={g} />)}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", marginTop: 20 }}>
            {total.toLocaleString()} game{total === 1 ? "" : "s"} found
          </p>
        </>
      )}
    </main>
  );
}
