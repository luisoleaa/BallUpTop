import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
      <EmptyState
        image="/MJ-3peet-ASCII.png" imageWidth={1029} imageHeight={1548}
        alt="ASCII-art portrait of Michael Jordan" opacity={0.3}
        title="This page doesn't exist."
        subtitle="404"
      />
      <Button href="/" style={{ marginTop: 8 }}>Back to home</Button>
    </main>
  );
}
