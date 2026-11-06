import { ImageResponse } from "next/og";
import { LogoStatic } from "@/components/ui/Logo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#0b0c0f",
        }}
      >
        <LogoStatic size={120} />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#f4f5f7", letterSpacing: -1.5 }}>
          Ball Up Top
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9aa0ab" }}>Rate every match you watch.</div>
      </div>
    ),
    { ...size }
  );
}
