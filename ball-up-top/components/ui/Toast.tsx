"use client";

// Fixed-position toast for the app-store's current `toast` message.
import { useApp } from "@/lib/app-store";
import { Icon } from "./Icon";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 32, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div className="rm-toast" style={{
        background: "var(--text)", color: "var(--bg)", padding: "12px 20px", borderRadius: 99,
        fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}>
        <Icon name="check" size={17} stroke="var(--bg)" sw={3} />
        {toast}
      </div>
    </div>
  );
}
