// "← Back" link shown atop the match and event detail pages. Was
// byte-identical inline markup duplicated in both places.
import Link from "next/link";
import { Icon } from "./Icon";

export function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="bw-navlink"
      style={{
        display: "flex", alignItems: "center", gap: 7, textDecoration: "none",
        color: "var(--text-muted)", fontSize: 14, fontWeight: 700, marginBottom: 22,
      }}
    >
      <Icon name="chevL" size={16} stroke="var(--text-muted)" />Back
    </Link>
  );
}
