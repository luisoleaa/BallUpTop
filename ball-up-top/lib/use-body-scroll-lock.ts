"use client";

import { useEffect } from "react";

// Locks background scroll while a modal is mounted. `overflow: hidden`
// alone doesn't stop touchmove-driven scroll on iOS Safari, so this also
// pins the body via `position: fixed` with its current scroll offset
// negated, restoring both the styles and the scroll position on unmount.
// Captures whatever values were already set (rather than assuming ""), so
// nested modals (e.g. CreateListModal opened from AddToListModal) restore
// the right values on unmount instead of clobbering each other.
export function useBodyScrollLock() {
  useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, []);
}
