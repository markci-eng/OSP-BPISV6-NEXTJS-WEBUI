"use client";

// SWIPE A CARD TO THE NEXT OR PREVIOUS ONE — a period on the History card, a
// filter on the Jump to account list.
//
// LIFTED OUT OF THE HISTORY CARD (user, 2026-10-01: "All, not opened, opened
// and discrepancy can also be accessed through swiping"), where it was written
// for periods. The gesture, the two-leg slide and the swallowed tap are the
// same whatever is being stepped through; the caller says only whether there
// is somewhere to go and what going there means.

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

export type SwipeDir = "prev" | "next";

/** How far a swipe has to travel before letting go takes the step. */
const SWIPE_COMMIT_PX = 60;
/** How far a finger moves before the gesture is read as sideways or not. */
const SWIPE_LOCK_PX = 8;
/** One leg of the slide — out, then in. */
const SLIDE_MS = 200;

/**
 * SWIPING IS ADDED TO THE CONTROLS, NEVER INSTEAD OF THEM (user, 2026-10-01:
 * "since it is a mobile swiping is much better rather than tapping the
 * screen"). The card moves under the finger; the arrows or tabs beside it stay,
 * and an arrow can run the same slide through `slide`.
 *
 * NO NEIGHBOUR SLIDES, unlike `SwipeDeck`. The card only holds what is on
 * screen, so it does not pretend to show the next one mid-drag: it follows the
 * finger, leaves to that side on release, and the next arrives from the other.
 *
 * TOUCH AND PEN ONLY. A mouse has the arrows, and a drag there would fight text
 * selection. `touch-action: pan-y` on the card leaves vertical scrolling of the
 * sheet to the browser; the gesture is locked to one axis after a few pixels, so
 * a scroll that wobbles sideways never takes a step.
 *
 * A SWIPE IS NEVER A TAP. A row is a button under the finger; the click that
 * follows a sideways drag is swallowed so letting go does not open a list.
 *
 * Where there is nothing that way the card stretches a little and springs back
 * — the edge is felt rather than silently ignored.
 */
export function useSwipeStep({
  canGo,
  onStep,
}: {
  /** Whether there is anywhere that way — a no gets the stretch-and-spring. */
  canGo: (dir: SwipeDir) => boolean;
  /** Take the step. Runs between the two legs, while the card is off-screen. */
  onStep: (dir: SwipeDir) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [animated, setAnimated] = useState(false);
  const [entering, setEntering] = useState(false);
  const busy = useRef(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const swallowClick = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const springBack = () => {
    setAnimated(true);
    setX(0);
  };

  const slide = (dir: SwipeDir) => {
    if (!canGo(dir) || busy.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const width = cardRef.current?.clientWidth ?? 0;
    if (reduced || width === 0) {
      setX(0);
      onStep(dir);
      return;
    }

    // What comes next arrives from the right, so "next" leaves to the left.
    const sign = dir === "next" ? -1 : 1;
    busy.current = true;
    setAnimated(true);
    setX(sign * width);
    later(() => {
      onStep(dir);
      setAnimated(false);
      setX(-sign * width);
      setEntering(true);
    }, SLIDE_MS);
  };

  // THE SECOND LEG. The jump to the far side has to reach the DOM with no
  // transition before the slide back to 0 switches one on, or it would animate
  // the jump. Reading `offsetWidth` here forces that style through — no
  // animation frames, which a hidden tab stops delivering and would strand the
  // card off to one side.
  useLayoutEffect(() => {
    if (!entering) return;
    void cardRef.current?.offsetWidth;
    setEntering(false);
    setAnimated(true);
    setX(0);
    later(() => {
      busy.current = false;
    }, SLIDE_MS);
  }, [entering]);

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" || busy.current) return;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;

    if (g.axis === null) {
      if (Math.abs(dx) < SWIPE_LOCK_PX && Math.abs(dy) < SWIPE_LOCK_PX) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (g.axis === "x") {
        // Throws if the pointer is already gone (a cancelled touch); the
        // gesture still works uncaptured, so a failure is not worth a crash.
        try {
          cardRef.current?.setPointerCapture(event.pointerId);
        } catch {
          /* no active pointer — carry on uncaptured */
        }
        setAnimated(false);
      }
    }
    if (g.axis !== "x") return;

    setX(canGo(dx < 0 ? "next" : "prev") ? dx : dx * 0.25);
  };

  const onPointerEnd = (event: PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.axis !== "x") return;

    swallowClick.current = true;
    const dx = event.clientX - g.x;
    const dir: SwipeDir = dx < 0 ? "next" : "prev";
    if (Math.abs(dx) >= SWIPE_COMMIT_PX && canGo(dir)) slide(dir);
    else springBack();
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  const width = cardRef.current?.clientWidth || 1;

  return {
    slide,
    cardProps: {
      ref: cardRef,
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
      touchAction: "pan-y",
    },
    contentStyle: {
      transform: `translateX(${x}px)`,
      // Fades as it travels, so the card leaving reads as leaving.
      opacity: 1 - Math.min(Math.abs(x) / width, 1) * 0.7,
      transition: animated
        ? `transform ${SLIDE_MS}ms ease, opacity ${SLIDE_MS}ms ease`
        : "none",
    },
  };
}
