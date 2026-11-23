import { ImageResponse } from "next/og";
import { LogoStatic } from "@/components/ui/Logo";

// Same pattern as app/maskable-icon/route.tsx -- a plain Route Handler
// rather than the icon.tsx convention, since manifest.ts needs several
// differently-sized entries and that convention only supports one.
// Referenced directly from app/manifest.ts's icons array; covers Android
// installers that expect a 192x192 "any"-purpose icon alongside the 512.
export async function GET() {
  return new ImageResponse(
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
      <LogoStatic size={128} />
    </div>,
    { width: 192, height: 192 },
  );
}
