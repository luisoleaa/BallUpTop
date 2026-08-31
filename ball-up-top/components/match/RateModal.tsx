"use client";

// Modal for logging/editing a rating: slider, live toggle, tags, review text.
// Pre-fills from `existing` when editing an already-logged match.
import { useEffect, useState } from "react";
import { TAGS } from "@/lib/data";
import type { Match, UserLog } from "@/lib/types";
import { Button } from "../ui/Button";
import { Crest } from "../ui/Crest";
import { Icon } from "../ui/Icon";
import { Label } from "../ui/Label";
import { RatingSlider } from "../ui/RatingSlider";
import { SportChip } from "../ui/SportChip";
import { TagPill } from "../ui/TagPill";

interface RateModalProps {
  match: Match;
  existing?: Omit<UserLog, "ts">;
  saving?: boolean;
  onClose: () => void;
  onSave: (log: Omit<UserLog, "ts">) => void;
}

export function RateModal({ match, existing, saving, onClose, onSave }: RateModalProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [live, setLive] = useState(existing?.live ?? false);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [review, setReview] = useState(existing?.review ?? "");
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const close = () => {
    setShow(false);
    setTimeout(onClose, 220);
  };

  const toggleTag = (t: string) =>
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div
        onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", opacity: show ? 1 : 0, transition: "opacity .2s" }}
      />
      <div style={{
        position: "relative", background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 22, padding: "26px 28px 28px", width: "100%", maxWidth: 480,
        maxHeight: "88vh", overflowY: "auto",
        transform: show ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
        opacity: show ? 1 : 0,
        transition: "all .22s cubic-bezier(.32,.72,0,1)",
        boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Crest side={match.a} size={30} />
          <Crest side={match.b} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: "var(--text)" }}>{match.a.abbr} v {match.b.abbr}</div>
            <SportChip sport={match.sport} muted />
          </div>
          <button onClick={close} style={{ border: "none", background: "var(--surface-2)", width: 34, height: 34, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="close" size={18} stroke="var(--text-muted)" />
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Label variant="section" style={{ textAlign: "center", marginBottom: 16 }}>How was it?</Label>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <RatingSlider value={rating} onChange={setRating} />
          </div>
        </div>

        <button onClick={() => setLive((v) => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)",
          cursor: "pointer", margin: "14px 0", fontFamily: "inherit",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${live ? "var(--accent)" : "var(--text-faint)"}`,
            background: live ? "var(--accent)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {live && <Icon name="check" size={15} stroke="var(--accent-text)" sw={3} />}
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>I watched this one live</span>
        </button>

        <Label style={{ margin: "6px 0 10px" }}>Add tags</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {TAGS.map((t) => <TagPill key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />)}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Add a review (optional)…"
          rows={3}
          className="bw-field"
          style={{
            width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", background: "var(--surface)",
            borderRadius: 14, padding: 14, fontSize: 15, color: "var(--text)", fontFamily: "inherit", resize: "none",
            lineHeight: 1.5, marginBottom: 18,
          }}
        />

        <Button
          fullWidth size="lg" disabled={!rating || saving}
          onClick={() => onSave({ rating, live, tags, review })}
        >
          {saving ? "Saving…" : existing ? "Update rating" : "Save to diary"}
        </Button>
      </div>
    </div>
  );
}
