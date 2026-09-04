// Event detail page: a UFC fight card, listing its fights as MatchCards.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent, MATCHES, SPORTS } from "@/lib/data";
import { HomeGrid } from "@/components/layout/HomeGrid";
import { BackLink } from "@/components/ui/BackLink";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) return {};
  return { title: event.name, description: `${event.venue} — Ball Up Top` };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const fights = event.fights.map((fid) => MATCHES.find((m) => m.id === fid)).filter(Boolean) as typeof MATCHES;

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px 80px" }}>
      <BackLink />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#fff",
          background: SPORTS.ufc.color, padding: "3px 9px", borderRadius: 99, fontFamily: "var(--font-mono, monospace)",
        }}>
          {event.status === "upcoming" ? "Upcoming" : "Completed"}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono, monospace)" }}>{event.date}</span>
      </div>

      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, margin: "0 0 4px", color: "var(--text)" }}>{event.name}</h1>
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono, monospace)", fontSize: 13, margin: "0 0 26px" }}>{event.venue}</p>

      <HomeGrid matches={fights} />
    </main>
  );
}
