import type { Metadata } from "next";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

export const metadata: Metadata = { title: "Privacy Policy" };

const LAST_UPDATED = "September 3, 2026";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 28px 80px" }}>
      <BackLink />
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, margin: "0 0 6px", color: "var(--text)" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--text-faint)", fontSize: 13, fontFamily: "var(--font-mono, monospace)", margin: "0 0 26px" }}>
        Last updated {LAST_UPDATED}
      </p>

      <Card padding={20} style={{ marginBottom: 24, background: "var(--surface-2)" }}>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
          This is a draft written to accurately describe what Ball Up Top actually
          does today — it hasn&rsquo;t been reviewed by a lawyer. Have one review it
          (and update it if the app&rsquo;s data practices change) before treating it
          as a binding policy for a public launch.
        </p>
      </Card>

      <Section title="What we collect">
        <p>When you create an account: your email address and password (handled entirely
          by Supabase Auth — we never see or store your raw password).</p>
        <p>When you use the app: a display name (editable in Settings), and anything you
          log — ratings, written reviews, tags, and whether you watched a match live.
          If review likes/reporting are enabled, we also store which reviews you&rsquo;ve
          liked or reported.</p>
        <p>We do not collect payment information, location data, or device identifiers,
          and we don&rsquo;t run any analytics or advertising trackers.</p>
      </Section>

      <Section title="How we use it">
        <p>To run the app: authenticate you, show your ratings/reviews back to you and
          to other users (reviews and ratings are public by design — see the app&rsquo;s
          guest-browsing philosophy), and let you edit or delete what you&rsquo;ve
          logged.</p>
        <p>We don&rsquo;t sell your data or share it with advertisers.</p>
      </Section>

      <Section title="Where it's stored">
        <p>User accounts, ratings, reviews, and profile data are stored in Supabase
          (a hosted Postgres database and auth provider), protected by row-level
          security policies that limit writes to your own data.</p>
        <p>Sports schedule/score data shown in the app comes from balldontlie.io, a
          third-party sports data provider — this is public sports information, not
          personal data about you.</p>
      </Section>

      <Section title="Cookies">
        <p>We use one essential cookie to keep you signed in (managed by Supabase
          Auth). No advertising or cross-site tracking cookies.</p>
      </Section>

      <Section title="Your choices">
        <p>Edit your display name or sign out anytime from <a href="/settings" style={linkStyle}>Settings</a>.
          Delete your account and all associated data — permanently and immediately —
          from the same page.</p>
      </Section>

      <Section title="Children">
        <p>Ball Up Top isn&rsquo;t directed at children under 13, and we don&rsquo;t
          knowingly collect data from them.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about this policy: <em>[add a real contact email before launch]</em>.</p>
      </Section>
    </main>
  );
}

const linkStyle = { color: "var(--accent-strong)", fontWeight: 700 };

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
