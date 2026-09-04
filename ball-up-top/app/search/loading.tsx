import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 28px 80px" }}>
      <Skeleton width={220} height={36} radius={8} />
      <div style={{ marginTop: 20 }}><Skeleton width={520} height={50} radius={13} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={118} radius={18} />)}
      </div>
    </main>
  );
}
