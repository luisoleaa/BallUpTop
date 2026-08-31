// Root layout: wires up fonts, global CSS, the app-wide state provider, and
// the persistent Nav/Toast shown on every page.
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/lib/app-store";
import { getUser } from "@/lib/supabase/server";
import { toUser } from "@/lib/to-user";
import { Nav } from "@/components/layout/Nav";
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

export const metadata: Metadata = {
  title: "Ball Up Top",
  description: "Rate every match you watch.",
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
          <Nav />
          <Toast />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
