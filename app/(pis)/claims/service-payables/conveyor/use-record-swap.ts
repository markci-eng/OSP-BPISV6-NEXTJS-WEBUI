"use client";

// SWAPPING ONE PLAN HOLDER FOR THE NEXT — `useClaimSwap` one unit of work down.
//
// The billing swap owns the whole screen: a different chapel, a different queue
// position, both columns replaced. This owns the RECORD COLUMN alone. Picking a
// plan holder in the rail changes who is being read and nothing else — the
// billing, the queue and the list itself all stay exactly as they are, and the
// list has to stay, because the row that was just clicked is the feedback that
// the click landed.
//
// WHY IT IS A SKELETON AND NOT AN ANIMATED SCROLL (user, 2026-09-14: "can we
// have an animation when scrolling up when changing, or make it a skeleton
// instead"). Both answer the same complaint — the record used to change under a
// reader parked two thousand pixels down it — and the choice is the one
// `useClaimSwap` already argued for the claim:
//
//   AN ANIMATED SCROLL MAKES EVERY PICK WAIT. A full record runs some 2,000px,
//   and a smooth scroll over that is most of a second during which the screen is
//   busy and the processor is not. Clicking down a chapel of eight accounts
//   would cost eight of them.
//
//   AND IT TRAVELS THROUGH THE WRONG RECORD. The state has already changed by
//   the time the scroll starts, so what flies past on the way up is the NEW plan
//   holder's record, read backwards — the form, then the remarks, then the name.
//   That is not a journey anybody wanted to take.
//
//   UNDER A PLACEHOLDER THE JUMP IS FREE. The scroll goes home instantly and
//   invisibly, the beat says the thing underneath is now a different thing, and
//   the record lands at its top already in place.
//
// THE SCROLL IS THE CALLER'S, which is the one difference from `useClaimSwap`.
// That hook scrolls its anchor's own scroller to zero, and zero is not where
// this lands on a stacked layout: the rail sits above the record there, so the
// page's top is the LIST — answering a tap on the list by showing the list, with
// the record picked below the fold. The page knows which layout it is in; this
// only knows when to run it.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * How long the placeholder stays up — shorter than the billing swap's 380ms.
 *
 * The two beats are not the same size of event. A billing arriving is a new
 * chapel, a new folder and a new position in the queue, and it happens a few
 * times an hour; an account is picked as often as a processor can read, so the
 * beat has to register without ever being the reason the work is slow. 260ms is
 * about a third of a second — long enough that the column is seen to change,
 * short enough that eight of them in a row do not add up to a pause.
 */
const RECORD_SWAP_MS = 260;

/**
 * Runs a record change as a swap.
 *
 * `home` is what puts the reader at the top of the new record, and it is called
 * BEFORE the placeholder goes up — it must be instant, because the whole point
 * is that the jump happens where nobody can see it.
 */
export function useRecordSwap(home: () => void): {
  swapping: boolean;
  swap: (apply: () => void) => void;
} {
  const [swapping, setSwapping] = useState(false);
  const timer = useRef(0);

  // Held in a ref so `swap` is stable whatever the caller's closure does: `home`
  // reads the layout flag and two refs, so it is a new function every render,
  // and a `swap` that changed with it would be a new prop on everything that
  // takes it.
  const goHome = useRef(home);
  goHome.current = home;

  // A swap left running when the page goes would set state on nothing.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const swap = useCallback((apply: () => void) => {
    goHome.current();
    setSwapping(true);
    apply();

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSwapping(false), RECORD_SWAP_MS);
  }, []);

  return { swapping, swap };
}
