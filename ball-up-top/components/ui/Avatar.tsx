// Colored-monogram avatar for a user: initials on a deterministic color,
// no image upload. Color is hashed from `seed` (the user id, stable even if
// a display name changes) into the app's existing per-sport color palette
// so new avatar colors stay in-palette instead of inventing a new scheme.
// Replaces the two previously hand-rolled monogram circles in Nav.tsx and
// MatchDetailClient.tsx.
import { SPORTS } from "@/lib/data";

const PALETTE = Object.values(SPORTS).map((s) => s.color);

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

export function Avatar({
  name,
  seed,
  size = 32,
}: {
  name: string;
  seed: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        background: avatarColor(seed),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }}
    >
      <span
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: size * 0.34,
          letterSpacing: 0.2,
          fontFamily: "var(--font-mono, monospace)",
          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
