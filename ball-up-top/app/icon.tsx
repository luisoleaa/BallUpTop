import { ImageResponse } from "next/og";
import { LogoStatic } from "@/components/ui/Logo";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
        <LogoStatic size={340} />
      </div>
    ),
    { ...size }
  );
}
