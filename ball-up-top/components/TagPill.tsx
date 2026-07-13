"use client";

export function TagPill({
  label, active, onClick, small,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? "transparent" : "var(--border)"}`,
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-text)" : "var(--text-muted)",
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        padding: small ? "4px 9px" : "7px 13px",
        borderRadius: 99,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}
