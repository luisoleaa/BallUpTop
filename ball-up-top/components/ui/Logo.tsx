// "The Lob" mark: a ball arcing up along a dotted path.
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
      <path d="M6 32 Q14 10 28 12" stroke="var(--accent-strong)" strokeWidth="2.4" strokeDasharray="0.5 6" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="12" r="7" fill="var(--accent-strong)" />
      <path d="M30 5v14M23 12h14M25.2 7.2q4.8 4.8 0 9.6M34.8 7.2q-4.8 4.8 0 9.6" stroke="var(--bg)" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

// Static hex-color variant for contexts (next/og ImageResponse) that can't
// resolve CSS custom properties -- keep colors in sync with --accent-strong/--bg.
export function LogoStatic({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
      <path d="M6 32 Q14 10 28 12" stroke="#c9f37e" strokeWidth="2.4" strokeDasharray="0.5 6" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="12" r="7" fill="#c9f37e" />
      <path d="M30 5v14M23 12h14M25.2 7.2q4.8 4.8 0 9.6M34.8 7.2q-4.8 4.8 0 9.6" stroke="#0b0c0f" strokeWidth="1.3" fill="none" />
    </svg>
  );
}
