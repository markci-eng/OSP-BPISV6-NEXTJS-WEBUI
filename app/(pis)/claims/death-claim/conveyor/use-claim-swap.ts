"use client";

// SWAPPING ONE CLAIM FOR THE NEXT, so it reads as a swap.
//
// The conveyor replaces everything on screen in a single paint. Done bare that
// is the worst thing a page like this can do: the eye has nothing to follow, the
// scroll position is wherever the LAST claim left it — which on a long one is
// two thousand pixels down, in the middle of a folder belonging to somebody
// else — and a processor who answered "endorse" cannot tell whether the page
// moved on or simply did not register the press.
//
// So a swap is three things happening together:
//
//   1. THE SCROLL GOES HOME. A new claim is read from the top; arriving
//      mid-folder is arriving in the wrong place.
//   2. A SKELETON HOLDS THE SHAPE for a beat, shaped like what is coming, so
//      the change is something the eye watches happen rather than a flicker.
//   3. THE STATE CHANGES UNDERNEATH IT, immediately — the beat is for the
//      reader, not for the data.
//
// THE JUMP IS INSTANT, NOT SMOOTH, and only because of the skeleton. Smooth
// scrolling exists so somebody can follow the page moving; there is nothing to
// follow here, since what they would be travelling through is the old claim,
// about to be replaced. Under the skeleton the jump is invisible and costs
// nothing, where a smooth scroll would make every answer wait on an animation.

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { scrollParentOf } from "../../components/scroll-parent";

/**
 * How long the skeleton stays up.
 *
 * The same beat the claims table uses when its queue tab changes, and for the
 * same reason: the data is already in memory, so this is not a load — it is a
 * deliberate signal that the thing underneath is now a different thing. Long
 * enough to register, short enough that answering thirty claims does not cost
 * half a minute of watching placeholders.
 *
 * When the queue comes from an API this becomes the real request's pending
 * state, and the timer goes.
 */
const SWAP_MS = 380;

/**
 * Runs a claim change as a swap.
 *
 * Returns `swapping` — true while the skeleton should be up — and `swap`, which
 * takes the state change to apply. Every path that puts a different claim on
 * screen goes through it: answering one, picking one out of the queue, and
 * changing stage. A path that did not would be the one that flickers.
 */
export function useClaimSwap(anchor: RefObject<HTMLElement | null>): {
  swapping: boolean;
  swap: (apply: () => void) => void;
} {
  const [swapping, setSwapping] = useState(false);
  const timer = useRef(0);

  // A swap left running when the page goes would set state on nothing.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const swap = useCallback(
    (apply: () => void) => {
      const element = anchor.current;
      if (element) {
        // The page's own scroller, not the window: this shell scrolls a DIV,
        // and `window.scrollTo` on it does nothing at all. `scrollParentOf`
        // is what the queue sections already use to find it.
        scrollParentOf(element).scrollTo({ top: 0, behavior: "auto" });
      }

      setSwapping(true);
      apply();

      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSwapping(false), SWAP_MS);
    },
    [anchor],
  );

  return { swapping, swap };
}
