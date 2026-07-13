import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/lib/app-store";
import { Nav } from "@/components/Nav";
import { Toast } from "@/components/Toast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
    >
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <AppProvider>
          <Nav />
          <Toast />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
