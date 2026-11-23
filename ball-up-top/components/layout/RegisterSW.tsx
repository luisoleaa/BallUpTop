"use client";

import { useEffect } from "react";

// Activates the existing public/sw.js, which was previously never registered.
// Service workers only register in a secure context (https:, or localhost) --
// isSecureContext is false on a plain http://<lan-ip> origin, so this is a
// deliberate, documented no-op there rather than a silent one.
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
