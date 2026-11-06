// Shared surface-container primitive. Renders a Next.js <Link> when `href`
// is passed, else a <div>. `tone="accent"` is the lime-tinted variant.
import Link from "next/link";
import type { ReactNode, CSSProperties, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string;
  href?: string;
  hoverable?: boolean;
  tone?: "surface" | "accent";
  children: ReactNode;
}

export function Card({
  padding = 20,
  href,
  hoverable,
  tone = "surface",
  style,
  className,
  children,
  ...rest
}: CardProps) {
  const toneStyle: CSSProperties =
    tone === "accent"
      ? { background: "var(--accent-soft)", border: "1px solid var(--accent)" }
      : { background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" };

  const computed: CSSProperties = {
    ...toneStyle,
    borderRadius: "var(--radius)",
    padding,
    ...(href ? { textDecoration: "none", color: "inherit" } : null),
    ...style,
  };

  const lift = hoverable ?? !!href;
  const cls = [lift ? "bw-card" : "", className].filter(Boolean).join(" ").trim() || undefined;

  if (href) {
    return (
      <Link href={href} className={cls} style={computed}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cls} style={computed} {...rest}>
      {children}
    </div>
  );
}
