"use client";

// Shared button/CTA primitive. Renders a Next.js <Link> when `href` is
// passed, otherwise a <button>. Each variant has its own hover treatment,
// see .bw-btn--* in globals.css.
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: 14 },
  md: { padding: "13px 26px", fontSize: 16 },
  lg: { height: 52, padding: "0 24px", fontSize: 16 },
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
  icon,
  children,
  href,
  disabled,
  style,
  className,
  ...rest
}: ButtonProps) {
  const palette: CSSProperties = disabled
    ? { background: "var(--surface-2)", color: "var(--text-faint)", border: "none" }
    : variant === "primary"
    ? { background: "var(--accent)", color: "var(--accent-text)", border: "none" }
    : variant === "secondary"
    ? { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }
    : { background: "transparent", color: "var(--accent-strong)", border: "none" };

  const computed: CSSProperties = {
    ...palette,
    ...(variant === "ghost" ? { fontSize: SIZE[size].fontSize } : SIZE[size]),
    borderRadius: pill ? 99 : "var(--radius-sm)",
    fontWeight: variant === "ghost" ? 700 : 800,
    fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: fullWidth ? "100%" : undefined,
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...style,
  };

  const label = (
    <span className="bw-btn-label">
      {icon}
      {children}
    </span>
  );
  const cls = ["bw-btn", `bw-btn--${variant}`, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} style={computed}>
        {variant === "primary" && <ArcAccent />}
        {label}
      </Link>
    );
  }

  return (
    <button className={cls} style={computed} disabled={disabled} {...rest}>
      {variant === "primary" && <ArcAccent />}
      {label}
    </button>
  );
}

function ArcAccent() {
  return (
    <svg className="bw-btn-arc" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 12 Q50 -4 98 12" stroke="currentColor" strokeWidth="1.6" strokeDasharray="0.5 7" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
