import React from "react";
import { Label } from "../ui/Label";

export function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 44 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Label as="h2" variant="section">
          {title}
        </Label>
        {right}
      </div>
      {children}
    </section>
  );
}
