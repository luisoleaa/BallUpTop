// Root layout: wires up fonts, global CSS, the app-wide state provider, and
// the persistent Nav/Toast shown on every page.
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/lib/app-store";
import { getUser } from "@/lib/supabase/server";
import { toUser } from "@/lib/to-user";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { RegisterSW } from "@/components/layout/RegisterSW";
import { Toast } from "@/components/ui/Toast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// Reserved for numeric/data content: scores, ratings, counts, timestamps.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Falls back to localhost until a real domain is set at deploy time.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Ball Up Top", template: "%s — Ball Up Top" },
  description: "Rate every match you watch.",
  openGraph: {
    title: "Ball Up Top",
    description: "Rate every match you watch.",
    siteName: "Ball Up Top",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ball Up Top",
    description: "Rate every match you watch.",
  },
  // iOS doesn't read the web manifest for "Add to Home Screen" polish --
  // these are the equivalent apple-mobile-web-app-* meta tags.
  appleWebApp: {
    capable: true,
    title: "Ball Up Top",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
    >
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <AppProvider initialUser={toUser(user)}>
          <RegisterSW />
          <Nav />
          <Toast />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
