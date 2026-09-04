import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 80px" }}>
      <Skeleton width={140} height={36} radius={8} />
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={90} radius={18} />)}
      </div>
    </main>
  );
}
