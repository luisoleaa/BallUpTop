"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MATCHES } from "@/lib/data";
import { useApp } from "@/lib/app-store";
import { Crest } from "./Crest";
import { RatingValue } from "./RatingValue";
import { SportChip } from "./SportChip";

export function DiaryClient() {
  const { user, logs } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login?reason=diary");
    }
  }, [user, router]);

  const ids = Object.keys(logs).sort((a, b) => logs[b].ts - logs[a].ts);
  const rated = ids.map((id) => MATCHES.find((m) => m.id === id)).filter(Boolean) as typeof MATCHES;
  const avg = ids.length ? ids.reduce((s, id) => s + logs[id].rating, 0) / ids.length : 0;

  if (!user) return null;

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 6px", color: "var(--text)" }}>
        Your diary
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 26px" }}>
        Every match you&rsquo;ve logged, newest first.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[["Logged", ids.length], ["Avg rating", avg ? avg.toFixed(1) : "–"], ["This year", ids.length]].map(([k, v]) => (
          <div key={String(k)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 16px", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-mono, monospace)", color: "var(--text)" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        {rated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 18px", color: "var(--text-faint)", fontSize: 15, lineHeight: 1.5 }}>
            Nothing logged yet.<br />Rate a match to start your diary.
          </div>
        ) : rated.map((m) => {
          const lg = logs[m.id];
          return (
            <Link key={m.id} href={`/matches/${m.id}`} style={{
              textAlign: "left", display: "flex", gap: 16, textDecoration: "none",
              borderBottom: "1px solid var(--border)", padding: "18px 0",
            }}>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Crest side={m.a} size={38} />
                <Crest side={m.b} size={38} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{m.a.abbr} v {m.b.abbr}</span>
                  <SportChip sport={m.sport} muted />
                </div>
                {lg.review && <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>{lg.review}</p>}
              </div>
              <div style={{ flexShrink: 0 }}>
                <RatingValue value={lg.rating} size={16} />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
