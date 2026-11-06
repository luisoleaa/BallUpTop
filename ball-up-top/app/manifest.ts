import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ball Up Top",
    short_name: "Ball Up Top",
    description: "Rate and review the games you watch — NBA, NFL, UFC, boxing, and soccer.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/maskable-icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
