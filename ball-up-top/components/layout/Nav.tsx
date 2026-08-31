"use client";

// Sticky top navigation bar. Hidden on /login, which has its own header.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, showToast } = useApp();

  const links: [string, string][] = [
    ["/", "Home"],
    ["/browse", "Browse"],
    ["/search", "Search"],
    ["/diary", "Diary"],
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
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
          <Logo size={30} />
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
            <Button
              variant="secondary" size="sm" pill onClick={handleSignOut}
              style={{ background: "transparent", color: "var(--text-muted)" }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>Browsing as guest</span>
            <Button href="/login" size="sm" pill>Sign in</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
