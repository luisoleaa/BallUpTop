"use client";

// Hidden on /login, matching Nav.tsx -- that page is a focused full-height
// auth screen, not a normal content page.
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 60 }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "24px 28px", display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        fontSize: 12.5, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)",
      }}>
        <span>Ball Up Top</span>
        <div style={{ display: "flex", gap: 18 }}>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}
