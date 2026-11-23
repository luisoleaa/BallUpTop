import { networkInterfaces } from "os";
import type { NextConfig } from "next";

// Auto-detects this machine's own LAN-facing IPv4 address instead of
// hardcoding one -- a literal IP here would only ever match the machine it
// was copied from, and would commit a personal network address to the repo.
// Skips virtual adapters (WSL, Hyper-V, VPNs) by name, since object key
// order from the OS isn't a reliable way to prefer the real Wi-Fi/Ethernet
// interface over them.
const VIRTUAL_ADAPTER =
  /vEthernet|Virtual|Loopback|WSL|VPN|Tailscale|ZeroTier|Hyper-V/i;

function getLanIPv4(): string[] {
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    if (VIRTUAL_ADAPTER.test(name)) continue;
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) return [addr.address];
    }
  }
  return [];
}

const nextConfig: NextConfig = {
  // Lets the dev server accept requests whose Origin/Referer is this LAN
  // IP (e.g. a phone on the same Wi-Fi), which Next's dev-origin allowlist
  // otherwise blocks. Matches hostname only -- no scheme/port, no CIDR.
  allowedDevOrigins: getLanIPv4(),
  async headers() {
    return [
      {
        // No CSP here -- the app uses inline style={{}} throughout, so a
        // strict one would need style-src 'unsafe-inline' anyway, and
        // getting it right blind (no CSP report-only testing in this
        // environment) risks breaking pages more than it protects them.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
