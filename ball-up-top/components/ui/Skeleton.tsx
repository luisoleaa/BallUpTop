// Pulsing placeholder block for loading.tsx route states. Reuses .rm-pulse
// (globals.css) rather than declaring a new animation.
export function Skeleton({ width = "100%", height = 16, radius = 8 }: { width?: number | string; height?: number; radius?: number }) {
  return (
    <div
      className="rm-pulse"
      style={{ width, height, borderRadius: radius, background: "var(--surface-2)" }}
    />
  );
}
