// Single icon component with an if/else chain per icon name, each branch
// returning a full inline svg. This pattern is intentional over a PATHS
// lookup object -- that approach was tried and abandoned in the original build.
export type IconName =
  | "home" | "search" | "activity" | "chevL" | "chevR" | "close"
  | "check" | "plus" | "bell" | "pen" | "user" | "apple" | "flame"
  | "eye" | "eyeOff" | "flag" | "trash";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
}

export function Icon({ name, size = 22, stroke = "currentColor", fill = "none", sw = 2 }: IconProps) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill, stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { display: "block" as const, flexShrink: 0 } };

  if (name === "home") return <svg {...common}><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
  if (name === "activity") return <svg {...common}><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>;
  if (name === "chevL") return <svg {...common}><path d="M15 5l-7 7 7 7" /></svg>;
  if (name === "chevR") return <svg {...common}><path d="M9 5l7 7-7 7" /></svg>;
  if (name === "close") return <svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>;
  if (name === "check") return <svg {...common}><path d="M5 13l4 4 10-11" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "bell") return <svg {...common}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>;
  if (name === "pen") return <svg {...common}><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>;
  if (name === "apple") return (
    <svg {...common} fill={stroke} stroke="none">
      <path d="M16 13c0-2.5 2-3.5 2-3.5-1-1.5-2.7-1.7-3.3-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1 2.8-2.2.6-.9.9-1.4 1.4-2.4-3.3-1.3-3.2-5.4-2.8-6.1zM13.8 6.3c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-.9 2.7 1 0 2-.5 2.6-1.2z" />
    </svg>
  );
  if (name === "flame") return (
    <svg {...common} fill={stroke} stroke="none">
      <path d="M12.4 2.55a1 1 0 00-1.45-.38c-.86.57-1.4 1.44-1.83 2.44-.43 1-.75 2.2-1 3.42a26 26 0 00-.4 2.9 2.6 2.6 0 01-.95-1.07c-.33-.68-.4-1.53-.4-2.65a1 1 0 00-1.62-.79A7 7 0 1016.63 11a7 7 0 00-2.2-5.1c-.6-.6-1-1-1.35-1.47-.37-.48-.72-1.06-1.2-2.03z" />
      <path d="M12.12 15.12A3 3 0 017 13c.6.3 1.5.5 2.5.5 0-1 .5-4 1.25-4.5.5 1 .79 1.29 1.37 1.88A3 3 0 0113 15a3 3 0 01-.88.12z" />
    </svg>
  );
  if (name === "eye") return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>;
  if (name === "eyeOff") return (
    <svg {...common}>
      <path d="M3 3l18 18M10.6 5.2A10.9 10.9 0 0112 5c6.5 0 10 7 10 7a15.5 15.5 0 01-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a10 10 0 004.4-1" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    </svg>
  );
  if (name === "flag") return <svg {...common}><path d="M5 3v18M5 4h13l-3 4 3 4H5" /></svg>;
  if (name === "trash") return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
  return null;
}
