import type { Metadata } from "next";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

export const metadata: Metadata = { title: "Terms of Service" };

const LAST_UPDATED = "September 3, 2026";

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 28px 80px" }}>
      <BackLink />
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 6px", color: "var(--text)" }}>
        Terms of Service
      </h1>
      <p style={{ color: "var(--text-faint)", fontSize: 13, fontFamily: "var(--font-mono, monospace)", margin: "0 0 26px" }}>
        Last updated {LAST_UPDATED}
      </p>

      <Card padding={20} style={{ marginBottom: 24, background: "var(--surface-2)" }}>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          Draft terms, not reviewed by a lawyer — have one review these (and fill in
          the bracketed placeholders) before a public launch.
        </p>
      </Card>

      <Section title="Using Ball Up Top">
        <p>Ball Up Top is a sports rating and review app — a &ldquo;Letterboxd for sports.&rdquo;
          Browsing is free and open to everyone; creating an account lets you log
          ratings, write reviews, and keep a diary.</p>
        <p>You&rsquo;re responsible for what you post. Don&rsquo;t post anything
          illegal, harassing, or that infringes someone else&rsquo;s rights.</p>
      </Section>

      <Section title="Your content">
        <p>You own what you write. By posting a rating or review, you let us display
          it publicly within the app (that&rsquo;s the point of a review) and let
          other users see it. You can edit or delete your own ratings/reviews, and
          delete your account and everything tied to it, anytime from Settings.</p>
      </Section>

      <Section title="Reporting content">
        <p>If a review breaks these terms, report it — a flag icon is available on
          real reviews. We may remove content or restrict accounts that violate these
          terms.</p>
      </Section>

      <Section title="No warranty">
        <p>The app is provided as-is. Sports data (scores, schedules) is sourced from
          a third-party provider and isn&rsquo;t guaranteed to be complete or
          error-free — see the app&rsquo;s data-sourcing notes for details.</p>
      </Section>

      <Section title="Changes">
        <p>We may update these terms as the app changes; continued use after an
          update means you accept the new terms.</p>
      </Section>

      <Section title="Contact">
        <p><em>[add a real contact email before launch]</em>.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <Label as="h2" variant="section" style={{ marginBottom: 10 }}>{title}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5, lineHeight: 1.6, color: "var(--text-muted)" }}>
        {children}
      </div>
    </section>
  );
}
