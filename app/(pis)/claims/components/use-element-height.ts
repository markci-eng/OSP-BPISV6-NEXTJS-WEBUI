"use client";

// One element's rendered height, kept current as it changes.
//
// For the cases where two boxes must agree on a height that neither of them
// decides — a card in one column and a row in another, which CSS can only match
// when they are siblings in the same grid or flex line. They are not, so one of
// them has to be told.

import { useRef, useState, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./use-fitted-page-size";

/**
 * The element's `offsetHeight`, or `null` before it has been measured.
 *
 * `offsetHeight` rather than the observer's `contentRect`: that reports the
 * CONTENT box, so a bordered, padded card would come back short by exactly the
 * chrome that makes it the size it looks. What a caller matching a card wants
 * is the box they can see.
 *
 * `null` until measured, which is also what the server renders — a caller
 * should treat it as "no height yet" and leave the box to size itself, rather
 * than substitute a guess that would have to be corrected a frame later.
 */
export function useElementHeight(
  ref: RefObject<HTMLElement | null>,
): number | null {
  const [height, setHeight] = useState<number | null>(null);

  // Held in a ref so the observer's callback never has to be re-created, and so
  // an unchanged height costs nothing: React would bail out of the render
  // anyway, but this stops the state update being queued at all.
  const last = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const next = element.offsetHeight || null;
      if (next === last.current) return;
      last.current = next;
      setHeight(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
