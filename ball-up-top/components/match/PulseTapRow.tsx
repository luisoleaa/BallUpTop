"use client";

// Fast 1-10 tap row for in-the-moment rating pulses, as opposed to the
// continuous drag RatingSlider used for the single final rating. The short
// client-side cooldown mirrors the server's own cooldown (lib/actions/
// live-activity.ts) so an accidental double-tap doesn't surface an error
// toast -- the server check is still the real guard.
import { useState } from "react";
import { PULSE_CLIENT_COOLDOWN_MS } from "@/lib/live-activity-constants";
import { ratingColor } from "../ui/RatingValue";

export function PulseTapRow({ onTap }: { onTap: (rating: number) => void }) {
  const [cooldown, setCooldown] = useState(false);

  const handleTap = (n: number) => {
    if (cooldown) return;
    onTap(n);
    setCooldown(true);
    setTimeout(() => setCooldown(false), PULSE_CLIENT_COOLDOWN_MS);
  };

  return (
    <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => handleTap(n)}
          disabled={cooldown}
          aria-label={`Pulse rate ${n} out of 10`}
          style={{
            flex: 1,
            height: 38,
            border: "none",
            borderRadius: 8,
            background: ratingColor(n),
            color: "var(--accent-text)",
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 800,
            fontSize: 13,
            cursor: cooldown ? "not-allowed" : "pointer",
            opacity: cooldown ? 0.45 : 1,
            transition: "opacity .12s",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
