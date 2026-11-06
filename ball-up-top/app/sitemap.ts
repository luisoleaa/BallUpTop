import type { MetadataRoute } from "next";
import { EVENTS, MATCHES } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Real per-game pages (app/games/[sport]/[id]) aren't included -- there are
// potentially hundreds of thousands of them across the full historical
// archive, not worth enumerating in a static sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/browse`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/search`, changeFrequency: "daily", priority: 0.8 },
  ];

  const matchRoutes: MetadataRoute.Sitemap = MATCHES.map((m) => ({
    url: `${siteUrl}/matches/${m.id}`,
    changeFrequency: m.status === "upcoming" ? "hourly" : "monthly",
    priority: 0.6,
  }));

  const eventRoutes: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${siteUrl}/events/${e.id}`,
    changeFrequency: e.status === "upcoming" ? "hourly" : "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...matchRoutes, ...eventRoutes];
}
