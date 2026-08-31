// Empty-state illustration using one of the ASCII-art renders in /public,
// screen-blended against --bg. `invert` defaults true (dark glyphs on a
// white canvas); `opacity` is a per-image escape hatch for ones that leave a
// faint box edge at the default. Plain <img>, not next/image -- one of the
// three source files hangs indefinitely through the image optimizer.
export function EmptyState({
  image, alt, imageWidth, imageHeight, title, subtitle, invert = true, opacity = 0.5,
}: {
  image: string;
  alt: string;
  imageWidth: number;
  imageHeight: number;
  title: string;
  subtitle?: string;
  invert?: boolean;
  opacity?: number;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", gap: 16, padding: "44px 18px 56px",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
      <img
        src={image}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        style={{
          height: 200, width: "auto",
          filter: invert ? "invert(1)" : undefined, mixBlendMode: "screen", opacity,
        }}
      />
      <div>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.5, margin: 0 }}>{title}</p>
        {subtitle && (
          <p style={{ color: "var(--text-faint)", fontSize: 13, fontFamily: "var(--font-mono, monospace)", margin: "6px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
