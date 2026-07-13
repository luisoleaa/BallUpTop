function LogoSvg({ size, children }: { size: number; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>{children}</svg>;
}

export const LOGOS: Record<string, ({ size }: { size: number }) => React.ReactNode> = {
  BOS: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#007a33"/>
      <circle cx="12" cy="7.5" r="4.2" fill="#fff"/>
      <circle cx="8.6" cy="14.5" r="4.2" fill="#fff"/>
      <circle cx="15.4" cy="14.5" r="4.2" fill="#fff"/>
      <circle cx="12" cy="12.1" r="2.5" fill="#007a33"/>
      <rect x="11.1" y="16.5" width="1.8" height="4" rx="0.9" fill="#fff"/>
    </LogoSvg>
  ),
  OKC: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#002d62"/>
      <polygon points="14,2 9,12 13,12 10,22 15,11 11,11" fill="#ef3b24"/>
    </LogoSvg>
  ),
  LAD: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#005a9c"/>
      <text x="12" y="14.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif" fill="#fff">LA</text>
    </LogoSvg>
  ),
  NYY: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#003087"/>
      <text x="12" y="14.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fontFamily="Georgia, 'Times New Roman', serif" fill="#fff">NY</text>
    </LogoSvg>
  ),
  RMA: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#f5f4ef"/>
      <path d="M4,4 L20,4 L20,15.5 L12,22 L4,15.5 Z" stroke="#1a1562" strokeWidth="1.1" fill="none"/>
      <path d="M8.5,9.5 L8.5,6.5 L10.5,8.5 L12,5.5 L13.5,8.5 L15.5,6.5 L15.5,9.5 Z" fill="#f5c518"/>
      <rect x="8" y="9.5" width="8" height="1" fill="#f5c518"/>
      <text x="12" y="18" textAnchor="middle" fontSize="5.5" fontWeight="800" fontFamily="Arial, sans-serif" fill="#1a1562">RM</text>
    </LogoSvg>
  ),
  INT: ({ size }) => (
    <LogoSvg size={size}>
      <rect x="0"  y="0" width="6"  height="24" fill="#002e8a"/>
      <rect x="6"  y="0" width="6"  height="24" fill="#000"/>
      <rect x="12" y="0" width="6"  height="24" fill="#002e8a"/>
      <rect x="18" y="0" width="6"  height="24" fill="#000"/>
      <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="900" fontFamily="Arial, sans-serif" fill="#fff">IM</text>
    </LogoSvg>
  ),
  MCI: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#6cabdd"/>
      <ellipse cx="12" cy="14" rx="3.5" ry="4.5" fill="#fff"/>
      <path d="M2,13 L12,9 L12,15 Z" fill="#fff"/>
      <path d="M22,13 L12,9 L12,15 Z" fill="#fff"/>
      <circle cx="12" cy="7.5" r="2.8" fill="#fff"/>
      <circle cx="12" cy="7.5" r="1.4" fill="#6cabdd"/>
    </LogoSvg>
  ),
  BAY: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#dc052d"/>
      <path d="M12,12 L20,12 A8,8 0 0,0 12,4 Z" fill="#fff"/>
      <path d="M12,12 L12,4  A8,8 0 0,0 4,12  Z" fill="#0066b2"/>
      <path d="M12,12 L4,12  A8,8 0 0,0 12,20 Z" fill="#fff"/>
      <path d="M12,12 L12,20 A8,8 0 0,0 20,12 Z" fill="#0066b2"/>
      <circle cx="12" cy="12" r="2.5" fill="#dc052d"/>
    </LogoSvg>
  ),
  EDM: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#fc4c02"/>
      <path d="M12,4 C17,4 20,11 12,21 C4,11 7,4 12,4 Z" fill="#003da5"/>
    </LogoSvg>
  ),
  FLA: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#041e42"/>
      <path d="M7,5 L5,11 L10,11 Z" fill="#c8102e"/>
      <path d="M17,5 L19,11 L14,11 Z" fill="#c8102e"/>
      <circle cx="12" cy="14.5" r="7" fill="#c8102e"/>
      <ellipse cx="9.5" cy="13.5" rx="1.4" ry="1" fill="#fff"/>
      <ellipse cx="14.5" cy="13.5" rx="1.4" ry="1" fill="#fff"/>
      <ellipse cx="9.5" cy="13.5" rx="0.6" ry="0.7" fill="#041e42"/>
      <ellipse cx="14.5" cy="13.5" rx="0.6" ry="0.7" fill="#041e42"/>
      <path d="M10.8,16.5 L13.2,16.5 L12,18 Z" fill="#041e42"/>
    </LogoSvg>
  ),
  NOR: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#ff8000"/>
      <path d="M4,17 L12,5 L15,5 L7,17 Z" fill="#000"/>
      <path d="M10,17 L18,5 L21,5 L13,17 Z" fill="#000"/>
    </LogoSvg>
  ),
  VER: ({ size }) => (
    <LogoSvg size={size}>
      <rect width="24" height="24" fill="#1c2951"/>
      <path d="M0,0 L24,0 L0,15 Z" fill="#e81920"/>
      <text x="12" y="21" textAnchor="middle" fontSize="5.5" fontWeight="800" fontFamily="Arial, sans-serif" fill="#ffcc00">RBR</text>
    </LogoSvg>
  ),
};
