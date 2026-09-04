import { Skeleton } from "@/components/ui/Skeleton";

export default function DiaryLoading() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "44px 28px 80px" }}>
      <Skeleton width={200} height={36} radius={8} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 26 }}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={70} radius={18} />)}
      </div>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 18 }}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={54} radius={12} />)}
      </div>
    </main>
  );
}
