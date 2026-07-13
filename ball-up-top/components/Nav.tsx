"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";

function WebLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
      <path d="M6 32 Q14 10 28 12" stroke="var(--accent-strong)" strokeWidth="2.4" strokeDasharray="0.5 6" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="12" r="7" fill="var(--accent-strong)" />
      <path d="M30 5v14M23 12h14M25.2 7.2q4.8 4.8 0 9.6M34.8 7.2q-4.8 4.8 0 9.6" stroke="var(--bg)" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, showToast } = useApp();

  const links: [string, string][] = [
    ["/", "Home"],
    ["/browse", "Browse"],
    ["/diary", "Diary"],
  ];

  const handleSignOut = () => {
    signOut();
    router.push("/");
    showToast("Signed out — browsing as guest");
  };

  if (pathname === "/login") return null;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--bg-blur)",
      backdropFilter: "blur(18px) saturate(180%)",
      WebkitBackdropFilter: "blur(18px) saturate(180%)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 64,
        display: "flex", alignItems: "center", gap: 28,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <WebLogo size={30} />
          <span style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: -0.6, whiteSpace: "nowrap" }}>
            Ball Up Top
          </span>
        </Link>

        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {links.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className="bw-navlink" style={{
                border: "none", background: active ? "var(--surface-2)" : "transparent",
                padding: "8px 14px", borderRadius: 99, fontSize: 14.5, fontWeight: 700,
                color: active ? "var(--text)" : "var(--text-muted)", textDecoration: "none",
                display: "inline-block",
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 99, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono, monospace)", fontWeight: 800, fontSize: 13, color: "var(--accent-text)",
              }}>
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{user.name}</span>
            </div>
            <button onClick={handleSignOut} className="bw-navlink" style={{
              border: "1px solid var(--border)", background: "transparent", cursor: "pointer",
              padding: "7px 14px", borderRadius: 99, fontSize: 13.5, fontWeight: 700,
              color: "var(--text-muted)", whiteSpace: "nowrap", fontFamily: "inherit",
            }}>
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>Browsing as guest</span>
            <Link href="/login" style={{
              border: "none", background: "var(--accent)", cursor: "pointer",
              padding: "9px 18px", borderRadius: 99, fontSize: 14, fontWeight: 800,
              color: "var(--accent-text)", textDecoration: "none", display: "inline-block",
            }}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
