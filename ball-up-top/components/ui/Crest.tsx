// Team/competitor art with a fallback chain so a side always renders
// something: custom team logo -> national flag -> colored monogram
// (abbreviation initials on a colored circle).
import type { Side } from "@/lib/types";
import { FlagBadge } from "./FlagBadge";
import { LOGOS } from "./Logos";

export function Crest({ side, size = 38 }: { side: Side; size?: number }) {
  const r = size * 0.28;
  const TeamLogo = LOGOS[side.abbr];

  if (TeamLogo) {
    return (
      <div style={{
        width: size, height: size, borderRadius: r, overflow: "hidden", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
      }}>
        <TeamLogo size={size} />
      </div>
    );
  }

  if (side.flag) {
    return (
      <div style={{
        width: size, height: size, borderRadius: r, overflow: "hidden", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.16)",
      }}>
        <FlagBadge code={side.flag} size={size} />
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: r, background: side.color, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
    }}>
      <span style={{
        color: "#fff", fontWeight: 800, fontSize: size * 0.3, letterSpacing: 0.2,
        fontFamily: "var(--font-mono, monospace)", textShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}>
        {side.abbr}
      </span>
    </div>
  );
}
