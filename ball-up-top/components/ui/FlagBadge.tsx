// Hand-drawn national flag SVGs, one branch per ISO-ish country code, used
// as the middle tier of Crest's logo -> flag -> monogram fallback chain.
export function FlagBadge({ code, size }: { code: string; size: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", style: { display: "block" as const } };
  if (code === "ar") return (
    <svg {...p}><rect width="24" height="24" fill="#74acdf"/><rect y="8" width="24" height="8" fill="#fff"/>
      <circle cx="12" cy="12" r="2.3" fill="#f6b40e"/></svg>);
  if (code === "br") return (
    <svg {...p}><rect width="24" height="24" fill="#009b3a"/>
      <polygon points="12,3.3 20.7,12 12,20.7 3.3,12" fill="#ffdf00"/>
      <circle cx="12" cy="12" r="3.4" fill="#002776"/></svg>);
  if (code === "in") return (
    <svg {...p}><rect width="24" height="24" fill="#ff9933"/><rect y="8" width="24" height="8" fill="#fff"/>
      <rect y="16" width="24" height="8" fill="#138808"/>
      <circle cx="12" cy="12" r="1.9" fill="none" stroke="#000080" strokeWidth="0.7"/></svg>);
  if (code === "es") return (
    <svg {...p}><rect width="24" height="24" fill="#c60b1e"/>
      <rect y="6" width="24" height="12" fill="#ffc400"/>
      <rect x="8.5" y="8" width="2.5" height="8" fill="#9c1515" opacity="0.7"/>
      <rect x="13" y="8" width="2.5" height="8" fill="#9c1515" opacity="0.7"/>
      <rect x="8.5" y="8" width="7" height="1.5" fill="#9c1515" opacity="0.7"/>
    </svg>);
  if (code === "it") return (
    <svg {...p}><rect width="24" height="24" fill="#ce2b37"/>
      <rect width="8" height="24" fill="#009246"/>
      <rect x="8" width="8" height="24" fill="#fff"/>
    </svg>);
  if (code === "ge") return (
    <svg {...p}><rect width="24" height="24" fill="#fff"/>
      <rect x="10.5" y="0" width="3" height="24" fill="#e11c38"/>
      <rect x="0" y="10.5" width="24" height="3" fill="#e11c38"/>
      <rect x="4" y="4" width="3" height="1" fill="#e11c38"/><rect x="5" y="3" width="1" height="3" fill="#e11c38"/>
      <rect x="17" y="4" width="3" height="1" fill="#e11c38"/><rect x="18" y="3" width="1" height="3" fill="#e11c38"/>
      <rect x="4" y="18" width="3" height="1" fill="#e11c38"/><rect x="5" y="17" width="1" height="3" fill="#e11c38"/>
      <rect x="17" y="18" width="3" height="1" fill="#e11c38"/><rect x="18" y="17" width="1" height="3" fill="#e11c38"/>
    </svg>);
  if (code === "gb") return (
    <svg {...p}><rect width="24" height="24" fill="#00247d"/>
      <path d="M0 0L24 24M24 0L0 24" stroke="#fff" strokeWidth="4"/>
      <path d="M0 0L24 24M24 0L0 24" stroke="#cf142b" strokeWidth="1.6"/>
      <path d="M12 0V24M0 12H24" stroke="#fff" strokeWidth="6.5"/>
      <path d="M12 0V24M0 12H24" stroke="#cf142b" strokeWidth="3.6"/>
    </svg>);
  if (code === "us") return (
    <svg {...p}><rect width="24" height="24" fill="#fff"/>
      {[1,3,5,7,9,11].map(i => <rect key={i} y={(i-1)*1.85} width="24" height="1.85" fill="#b22234"/>)}
      <rect width="11" height="11" fill="#3c3b6e"/>
      {([2,5.5,9] as number[]).flatMap(x => ([2,5.5,9] as number[]).map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.75" fill="#fff"/>))}
    </svg>);
  if (code === "mx") return (
    <svg {...p}><rect width="24" height="24" fill="#fff"/>
      <rect width="8" height="24" fill="#006847"/>
      <rect x="16" width="8" height="24" fill="#ce1126"/>
      <circle cx="12" cy="12" r="2.6" fill="#8a6d3b"/>
    </svg>);
  if (code === "nl") return (
    <svg {...p}><rect width="24" height="24" fill="#21468b"/>
      <rect width="24" height="16" fill="#fff"/>
      <rect width="24" height="8" fill="#ae1c28"/>
    </svg>);
  if (code === "au") return (
    <svg {...p}><rect width="24" height="24" fill="#00247d"/>
      <rect width="11" height="7" fill="#fff"/>
      <path d="M0 0L11 7M11 0L0 7" stroke="#cf142b" strokeWidth="1"/>
      <path d="M5.5 0V7M0 3.5H11" stroke="#cf142b" strokeWidth="1.3"/>
      <circle cx="5.5" cy="15.5" r="1.5" fill="#fff"/>
      <circle cx="18" cy="6" r="1" fill="#fff"/><circle cx="20.5" cy="11" r="0.9" fill="#fff"/>
      <circle cx="16.5" cy="12.5" r="0.9" fill="#fff"/><circle cx="18.5" cy="18" r="1" fill="#fff"/>
      <circle cx="21" cy="15" r="0.6" fill="#fff"/>
    </svg>);
  return null;
}
