import { Skeleton } from "@/components/ui/Skeleton";

export default function GameLoading() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "44px 28px 80px" }}>
      <Skeleton width={70} height={16} radius={6} />
      <div style={{ marginTop: 16 }}><Skeleton height={220} radius={18} /></div>
    </main>
  );
}
