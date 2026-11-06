// Shared uppercase mono micro-label for section headings and field labels.
// Polymorphic via `as` so real headings keep their semantics.
import type { ReactNode, CSSProperties, ElementType } from "react";

export function Label({
  as: As = "span",
  variant = "sub",
  color = "var(--text-muted)",
  style,
  children,
}: {
  as?: ElementType;
  variant?: "section" | "sub";
  color?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <As
      style={{
        display: "block",
        fontSize: variant === "section" ? 13 : 12,
        fontWeight: 700,
        color,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: variant === "section" ? 0.6 : 0.4,
        textTransform: "uppercase",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </As>
  );
}
