"use client";

import { useState } from "react";
import { MATCHES, SPORTS } from "@/lib/data";
import { useApp } from "@/lib/app-store";
import type { SportSlug } from "@/lib/types";
import { Icon } from "./Icon";
import { MatchCard } from "./MatchCard";
import { TagPill } from "./TagPill";

export function BrowseClient() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<"all" | SportSlug>("all");
  const { logs } = useApp();

  const filtered = MATCHES.filter((m) => {
    if (sport !== "all" && m.sport !== sport) return false;
    if (!q.trim()) return true;
    const hay = (m.a.name + m.b.name + m.league + SPORTS[m.sport].name).toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const sports: Array<"all" | SportSlug> = ["all", ...Object.keys(SPORTS) as SportSlug[]];

  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 28px 80px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 20px", color: "var(--text)" }}>
        Browse matches
      </h1>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)",
        borderRadius: 13, padding: "0 16px", height: 50, border: "1px solid var(--border)", maxWidth: 520,
      }}>
        <Icon name="search" size={19} stroke="var(--text-muted)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Teams, players, leagues…"
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: 16, color: "var(--text)", fontFamily: "inherit",
          }}
        />
        {q && (
          <button onClick={() => setQ("")} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex" }}>
            <Icon name="close" size={18} stroke="var(--text-faint)" />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "16px 0 8px" }}>
        {sports.map((s) => (
          <TagPill
            key={s}
            label={s === "all" ? "All sports" : SPORTS[s as SportSlug].name}
            active={sport === s}
            onClick={() => setSport(s)}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
          No matches found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>
          {filtered.map((m) => <MatchCard key={m.id} match={m} userLog={logs[m.id]} />)}
        </div>
      )}
    </main>
  );
}
