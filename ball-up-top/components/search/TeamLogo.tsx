"use client";

// Real-team logo hotlinked from ESPN's team-logo CDN, since there's no logo
// art for real teams anywhere else. Falls back to a colored monogram if the
// URL 404s or the abbreviation doesn't map cleanly.
import { useState } from "react";
import type { GameSport } from "@/lib/queries/games";

const ESPN_ABBR_OVERRIDES: Partial<Record<GameSport, Record<string, string>>> = {
  nba: { GSW: "gs", NOP: "no", NYK: "ny", PHX: "phx", SAS: "sa", UTA: "utah", WAS: "wsh" },
  nfl: { WAS: "wsh" },
  mlb: { AZ: "ari", CWS: "chw", WSH: "wsh" },
};

function espnLogoUrl(sport: GameSport, abbreviation: string) {
  const code = ESPN_ABBR_OVERRIDES[sport]?.[abbreviation] ?? abbreviation.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/${sport}/500/${code}.png`;
}

// Deterministic color hashed from the abbreviation (no real per-team color is stored).
function hashColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return `hsl(${Math.abs(hash) % 360}, 55%, 42%)`;
}

export function TeamLogo({
  sport,
  abbreviation,
  size = 22,
}: {
  sport: GameSport;
  abbreviation: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !abbreviation) {
    const label = (abbreviation || sport).slice(0, 2).toUpperCase();
    return (
      <span
        style={{
          width: size, height: size, borderRadius: "50%", flexShrink: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: hashColor(abbreviation || sport),
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.38, fontFamily: "var(--font-mono, monospace)" }}>
          {label}
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external hotlinked asset
    <img
      src={espnLogoUrl(sport, abbreviation)}
      alt={abbreviation}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}
