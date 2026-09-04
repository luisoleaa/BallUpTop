import { ImageResponse } from "next/og";
import { LogoStatic } from "@/components/ui/Logo";

// Not a Next.js icon-convention filename (those don't support a second
// "maskable" variant alongside icon.tsx), so this is a plain Route Handler
// returning the same ImageResponse shape instead. Referenced directly from
// app/manifest.ts's icons array. The OS can crop this to a circle/squircle,
// so the mark sits well inside Android's ~80%-diameter safe zone rather than
// filling the canvas like icon.tsx does.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c0f",
        }}
      >
        <LogoStatic size={280} />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
