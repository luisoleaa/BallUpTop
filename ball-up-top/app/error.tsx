"use client";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "100px 28px", textAlign: "center" }}>
      <Label variant="section" style={{ marginBottom: 10 }}>Something went wrong</Label>
      <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5, margin: "0 0 26px" }}>
        That didn&rsquo;t load right. Try again, or head back home.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" href="/">Back to home</Button>
      </div>
    </main>
  );
}
