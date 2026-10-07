"use client";

// WHETHER THE SHELL'S MOBILE BOTTOM NAVIGATION IS TUCKED AWAY — so a bar that
// floats above it can drop into its place, and rise with it when it returns.
//
// THE KIT'S OWN RULE, RESTATED, because the kit keeps it private: osp-ui-kit's
// bottom navigation listens to every scroll (capture phase, any scroller) and
// hides when a scroll goes DOWN by more than 4px, shows when one goes UP by more
// than 4px, and always shows within 10px of the top. Read the same events the
// same way and this hook agrees with the bar on screen without reaching into its
// DOM. If the kit's rule ever changes, this is the one place to follow it.

import { useEffect, useRef, useState } from "react";

/** How much of the viewport's foot the navigation covers while it is up. */
export const SHELL_NAV_HEIGHT = "62px";

/** The kit's two easings — rising overshoots a little, hiding does not. */
export const SHELL_NAV_SHOW_EASE = "0.46s cubic-bezier(0.34, 1.56, 0.64, 1)";
export const SHELL_NAV_HIDE_EASE = "0.26s cubic-bezier(0.4, 0, 0.2, 1)";

export function useShellNavHidden(): boolean {
  const [hidden, setHidden] = useState(false);
  const last = useRef(new Map<EventTarget, number>());

  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target as { scrollTop?: unknown } | null;
      if (!target || typeof target.scrollTop !== "number") return;
      const top = target.scrollTop;
      const before = last.current.get(event.target as EventTarget) ?? top;
      last.current.set(event.target as EventTarget, top);
      const delta = top - before;
      if (top < 10) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
    };
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return hidden;
}
