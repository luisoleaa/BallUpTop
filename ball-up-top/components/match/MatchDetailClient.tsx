"use client";

// Client half of the match detail page: scoreboard, fan reviews, rating
// distribution, and the user's own rating or a CTA to open RateModal.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { saveRatingAction } from "@/lib/actions/ratings";
import type { Match, Rating, SeedReview } from "@/lib/types";
import { BackLink } from "../ui/BackLink";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Crest } from "../ui/Crest";
import { EmptyState } from "../ui/EmptyState";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { RateModal } from "./RateModal";
import { RatingValue, ratingColor } from "../ui/RatingValue";
import { SportChip } from "../ui/SportChip";
import { StatusPill } from "../ui/StatusPill";
import { TagPill } from "../ui/TagPill";

interface Props {
  match: Match;
  reviews: SeedReview[];
  dist: number[] | null;
  initialRating: Rating | null;
}

export function MatchDetailClient({ match, reviews, dist, initialRating }: Props) {
  const { user, showToast, refreshRatings, hideScores } = useApp();
  const router = useRouter();
  const [rating, setRating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const userRating = initialRating;
  const existingLog = userRating
    ? { rating: userRating.rating, review: userRating.review ?? "", tags: userRating.tags, live: userRating.watchedLive }
    : undefined;

  // Dimming the loser's side is itself a spoiler, so it's suppressed along
  // with the score while masked.
  const scoreMasked = hideScores && match.status === "final" && !revealed;
  const winner =
    !scoreMasked && match.status === "final" && match.a.score != null && typeof match.a.score === "number"
      ? match.a.score > (match.b.score as number) ? "a" : (match.b.score as number) > match.a.score ? "b" : null
      : null;

  const requestRate = () => {
    if (!user) { router.push(`/login?reason=rate`); return; }
    setRating(true);
  };

  const handleSave = async (log: { rating: number; review: string; tags: string[]; live: boolean }) => {
    setSaving(true);
    try {
      await saveRatingAction(match.id, log);
      setRating(false);
      showToast("Logged to your diary");
      router.refresh();
      await refreshRatings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 1024, margin: "0 auto", padding: "36px 28px 80px" }}>
      <BackLink />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <SportChip sport={match.sport} />
        <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{match.league}</span>
        <StatusPill match={match} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 24, alignItems: "start" }} className="bw-detail-grid">
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Scoreboard */}
          <Card padding="32px 26px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: winner && winner !== "a" ? 0.5 : 1 }}>
                <Crest side={match.a} size={78} />
                <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center", lineHeight: 1.2, color: "var(--text)" }}>{match.a.name}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, minWidth: 120 }}>
                {match.a.score != null ? (
                  scoreMasked ? (
                    <button
                      onClick={() => setRevealed(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, border: "1px dashed var(--border)",
                        background: "transparent", borderRadius: 99, padding: "6px 12px", cursor: "pointer",
                        color: "var(--text-muted)", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
                      }}
                    >
                      <Icon name="eyeOff" size={14} stroke="var(--text-muted)" />
                      Reveal score
                    </button>
                  ) : (
                    <div style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 46, letterSpacing: -1, color: "var(--text)" }}>
                      {match.a.score}<span style={{ color: "var(--text-faint)" }}>·</span>{match.b.score}
                    </div>
                  )
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
          </Card>

          {/* Fan reviews */}
          <div>
            <Label as="h2" variant="section" style={{ marginBottom: 6 }}>Fan reviews</Label>
            {reviews.length === 0 && (
              <EmptyState
                image="/Lebron-Lob-ASCII.png" imageWidth={870} imageHeight={1536}
                alt="ASCII-art illustration of LeBron James mid-lob dunk"
                title="No reviews yet."
              />
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
          {/* Community rating -- dist is a synthetic curve, not real vote data */}
          {match.avg != null && dist && (
            <Card padding={22}>
              <Label variant="sub" style={{ marginBottom: 14 }}>Community rating</Label>
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
            </Card>
          )}

          {/* Your rating */}
          {userRating && user ? (
            <Card tone="accent" padding={20}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Label color="var(--accent-strong)">YOUR RATING</Label>
                <Button
                  variant="ghost" size="sm" onClick={requestRate}
                  icon={<Icon name="pen" size={15} stroke="var(--accent-strong)" />}
                >
                  Edit
                </Button>
              </div>
              <RatingValue value={userRating.rating} size={20} />
              {userRating.watchedLive && <span style={{ marginLeft: 10, fontSize: 11, color: "var(--accent-strong)", fontFamily: "var(--font-mono, monospace)" }}>· watched live</span>}
              {userRating.tags && userRating.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {userRating.tags.map((tg) => <TagPill key={tg} label={tg} small active />)}
                </div>
              )}
              {userRating.review && <p style={{ fontSize: 14, margin: "12px 0 0", lineHeight: 1.5, color: "var(--text)" }}>{userRating.review}</p>}
            </Card>
          ) : (
            <Card padding={20}>
              <Button
                fullWidth size="lg" onClick={requestRate}
                icon={<Icon name="plus" size={19} stroke="var(--accent-text)" />}
              >
                {match.status === "upcoming" ? "Set a reminder" : "Rate this match"}
              </Button>
              {!user && (
                <p style={{ fontSize: 12.5, color: "var(--text-faint)", textAlign: "center", margin: "12px 0 0", lineHeight: 1.5 }}>
                  You&rsquo;ll be asked to sign in first — rating requires an account.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>

      {rating && (
        <RateModal
          match={match}
          existing={existingLog}
          saving={saving}
          onClose={() => setRating(false)}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
