"use client";

// Height-driven layout switch for the claims dashboards.
//
// Chakra's responsive props break on WIDTH. Some of this area's mobile layouts
// have to react to HEIGHT instead — a section that fits on a tall phone has to
// collapse into a carousel on a short one — and there is no width breakpoint
// that expresses that. Hence a measured hook.

import { useEffect, useState } from "react";

/**
 * True when the viewport is shorter than `minHeight` pixels.
 *
 * Depends only on the viewport's own height, never on laid-out element
 * positions, so a plain listener is enough: no ResizeObserver, and nothing that
 * has to wait for layout to settle. It deliberately does NOT use
 * requestAnimationFrame — frame callbacks stop running while a page is hidden or
 * not compositing, which would freeze the answer at whatever it was on load.
 *
 * Starts `false` (the taller layout) so server and first client render agree.
 */
export function useIsShortViewport(minHeight: number) {
  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    const measure = () => setIsShort(window.innerHeight < minHeight);

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    // On a phone the usable height also changes without a window resize — the
    // URL bar collapsing, the keyboard opening. That is the visual viewport.
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [minHeight]);

  return isShort;
}
