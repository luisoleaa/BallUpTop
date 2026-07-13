"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import type { Match, SeedReview, Sport } from "@/lib/types";
import { Crest } from "./Crest";
import { Icon } from "./Icon";
import { RateModal } from "./RateModal";
import { RatingValue, ratingColor } from "./RatingValue";
import { SportChip } from "./SportChip";
import { StatusPill } from "./StatusPill";
import { TagPill } from "./TagPill";

interface Props {
  match: Match;
  sport: Sport;
  reviews: SeedReview[];
  dist: number[] | null;
}

const CARD: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 22, boxShadow: "var(--shadow)",
};

export function MatchDetailClient({ match, sport, reviews, dist }: Props) {
  const { user, logs, saveLog, showToast } = useApp();
  const router = useRouter();
  const [rating, setRating] = useState(false);
  const userLog = logs[match.id];

  const winner =
    match.status === "final" && match.a.score != null && typeof match.a.score === "number"
      ? match.a.score > (match.b.score as number) ? "a" : (match.b.score as number) > match.a.score ? "b" : null
      : null;

  const requestRate = () => {
    if (!user) { router.push(`/login?reason=rate`); return; }
    setRating(true);
  };

  const handleSave = (log: Parameters<typeof saveLog>[1]) => {
    saveLog(match.id, log);
    setRating(false);
    showToast("Logged to your diary");
  };

  return (
    <main style={{ maxWidth: 1024, margin: "0 auto", padding: "36px 28px 80px" }}>
      <Link href="/" className="bw-navlink" style={{
        display: "flex", alignItems: "center", gap: 7, textDecoration: "none",
        color: "var(--text-muted)", fontSize: 14, fontWeight: 700, marginBottom: 22,
      }}>
        <Icon name="chevL" size={16} stroke="var(--text-muted)" />Back
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <SportChip sport={match.sport} />
        <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{match.league}</span>
        <StatusPill match={match} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 24, alignItems: "start" }} className="bw-detail-grid">
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Scoreboard */}
          <div style={{ ...CARD, padding: "32px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: winner && winner !== "a" ? 0.5 : 1 }}>
                <Crest side={match.a} size={78} />
                <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center", lineHeight: 1.2, color: "var(--text)" }}>{match.a.name}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, minWidth: 120 }}>
                {match.a.score != null ? (
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 46, letterSpacing: -1, color: "var(--text)" }}>
                    {match.a.score}<span style={{ color: "var(--text-faint)" }}>·</span>{match.b.score}
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 17, color: "var(--text-faint)", fontWeight: 700 }}>VS</div>
                )}
                {match.note && (
                  <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", marginTop: 6, textAlign: "center" }}>{match.note}</div>
                )}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: winner && winner !== "b" ? 0.5 : 1 }}>
                <Crest side={match.b} size={78} />
                <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center", lineHeight: 1.2, color: "var(--text)" }}>{match.b.name}</div>
              </div>
            </div>
          </div>

          {/* Fan reviews */}
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", margin: "0 0 6px" }}>
              Fan reviews
            </h2>
            {reviews.length === 0 && (
              <p style={{ color: "var(--text-faint)", fontSize: 14, fontFamily: "var(--font-mono, monospace)", padding: "24px 0" }}>No reviews yet.</p>
            )}
            {reviews.map((r, i) => (
              <div key={i} style={{ padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 99, background: "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: 12, color: "var(--text-muted)",
                  }}>
                    {r.user.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{r.user}</span>
                  {r.live && <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>· live</span>}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{r.time}</span>
                </div>
                <RatingValue value={r.rating} size={13} />
                {r.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
                    {r.tags.map((tg) => <TagPill key={tg} label={tg} small />)}
                  </div>
                )}
                <p style={{ fontSize: 15, margin: "10px 0 0", lineHeight: 1.55, color: "var(--text)" }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Community rating */}
          {match.avg != null && dist && (
            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>
                Community rating
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 42, lineHeight: 1, color: ratingColor(match.avg) }}>
                    {match.avg.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", marginTop: 5 }}>
                    {match.logs.toLocaleString()} ratings
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  {dist.map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)", width: 14 }}>{[10, 8, 6, 4, 2][i]}</span>
                      <div style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: w + "%", height: "100%", background: "var(--star)", borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Your rating */}
          {userLog && user ? (
            <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-strong)", fontFamily: "var(--font-mono, monospace)", letterSpacing: 0.4 }}>YOUR RATING</span>
                <button onClick={requestRate} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent", color: "var(--accent-strong)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  <Icon name="pen" size={15} stroke="var(--accent-strong)" />Edit
                </button>
              </div>
              <RatingValue value={userLog.rating} size={20} />
              {userLog.live && <span style={{ marginLeft: 10, fontSize: 11, color: "var(--accent-strong)", fontFamily: "var(--font-mono, monospace)" }}>· watched live</span>}
              {userLog.tags && userLog.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {userLog.tags.map((tg) => <TagPill key={tg} label={tg} small active />)}
                </div>
              )}
              {userLog.review && <p style={{ fontSize: 14, margin: "12px 0 0", lineHeight: 1.5, color: "var(--text)" }}>{userLog.review}</p>}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, boxShadow: "var(--shadow)" }}>
              <button onClick={requestRate} style={{
                width: "100%", height: 52, borderRadius: 14, border: "none",
                background: "var(--accent)", color: "var(--accent-text)", fontSize: 16, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9, cursor: "pointer", fontFamily: "inherit",
              }}>
                <Icon name="plus" size={19} stroke="var(--accent-text)" />
                {match.status === "upcoming" ? "Set a reminder" : "Rate this match"}
              </button>
              {!user && (
                <p style={{ fontSize: 12.5, color: "var(--text-faint)", textAlign: "center", margin: "12px 0 0", lineHeight: 1.5 }}>
                  You&rsquo;ll be asked to sign in first — rating requires an account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {rating && (
        <RateModal
          match={match}
          existing={userLog}
          onClose={() => setRating(false)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
