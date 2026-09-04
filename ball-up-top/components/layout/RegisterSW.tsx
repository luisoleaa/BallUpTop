"use client";

import { useEffect } from "react";

// Activates the existing public/sw.js, which was previously never registered.
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
