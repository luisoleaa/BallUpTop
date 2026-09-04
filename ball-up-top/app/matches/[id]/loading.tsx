import { Skeleton } from "@/components/ui/Skeleton";

export default function MatchLoading() {
  return (
    <main style={{ maxWidth: 1024, margin: "0 auto", padding: "36px 28px 80px" }}>
      <Skeleton width={80} height={18} radius={6} />
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 24 }} className="bw-detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Skeleton height={160} radius={18} />
          <Skeleton height={220} radius={18} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Skeleton height={120} radius={18} />
          <Skeleton height={80} radius={18} />
        </div>
      </div>
    </main>
  );
}
