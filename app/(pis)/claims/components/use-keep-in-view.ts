"use client";

// Keep a section whole and on screen as its own height changes.
//
// This is the other half of `useFittedPageSize`. That hook sizes a section to
// exactly one screenful measured FROM ITS OWN TOP, which is only the truth while
// the section's top is at the top of the visible area. Let the section change
// height while it is scrolled part-way — a queue with fewer claims than the last
// one, a page size that just grew on rotation, a carousel that lost its dots
// because it is down to a single page — and the fit it was built around is
// quietly wrong: the last card ends up under the bottom navigation, or a band of
// the previous section is left stranded above it.
//
// So: whenever the height changes, put the section back where its measurement
// assumes it is.

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { scrollParentOf, visibleBandOf } from "./scroll-parent";

/**
 * How many pixels of the section may sit outside the visible area before it is
 * scrolled back. Sub-pixel layout means "fully visible" is rarely exact, and a
 * hair of overhang is not worth moving the page for.
 */
const SLACK = 2;

/**
 * How long after mount height changes are treated as the section still ARRIVING
 * rather than as it changing.
 *
 * This window is not padding, it is the load sequence. A section that measures
 * itself renders once at its minimum, gets measured, and re-renders at its real
 * size — `useFittedPageSize` deliberately takes that second reading on a timeout
 * so it lands after the sections above have settled. Every one of those steps is
 * a height change, and none of them is the section changing under the user: the
 * page is simply finishing arriving. Acting on them scrolls the page down to
 * this section the moment it loads, which is the opposite of what a dashboard
 * should do.
 *
 * So it sits clear of that settling — comfortably past the last remeasure — and
 * nothing is lost by being generous with it, because the taps that matter during
 * it (a queue tab, a filter) call the returned callback directly and are never
 * gated on this.
 */
const SETTLE_MS = 600;

/**
 * Scrolls `ref` fully into view when its height CHANGES, and returns a callback
 * that does the same on demand.
 *
 * Does NOTHING while the section is already whole on screen, which is what keeps
 * it from being a nuisance: it only ever moves the page when the change actually
 * pushed something out of sight. A section taller than the visible area can
 * never be whole, so that one is aligned to the top instead — the reading its
 * measurement was taken for.
 *
 * And nothing at all on load, however many times the section resizes while it
 * settles — see {@link SETTLE_MS}. The returned callback ignores that window,
 * since a tap is a change by definition whenever it happens.
 */
export function useKeepInView(
  ref: RefObject<HTMLElement | null>,
): () => void {
  // Held in a ref so the returned callback is stable and can be dropped into an
  // event handler without re-subscribing anything.
  const pending = useRef(0);

  const bringIntoView = useCallback(() => {
    // Deferred to the end of the current work, so a call made from an event
    // handler runs against the layout the handler CAUSED rather than the one it
    // fired on. Coalesced, so a height change and a tap landing together scroll
    // once.
    //
    // A timeout rather than requestAnimationFrame, for the reason
    // `useIsShortViewport` gives: frame callbacks do not run while the page is
    // not compositing — a backgrounded tab, a hidden pane — so the scroll would
    // silently never happen, and would not be queued up waiting when the page
    // came back either. A timeout fires regardless.
    window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      const element = ref.current;
      if (!element) return;

      const band = visibleBandOf(scrollParentOf(element));
      const rect = element.getBoundingClientRect();
      const whollyVisible =
        rect.top >= band.top - SLACK && rect.bottom <= band.bottom + SLACK;
      if (whollyVisible) return;

      // Smooth while the page is on screen: the section is about to move under
      // the user, and an animation is what says so.
      //
      // Instant while it is not. A smooth scroll is run by the compositor, which
      // a hidden page does not have — the animation never starts, and nothing
      // resumes it when the page comes back, so the scroll would simply be lost.
      // Jumping costs nothing here, since by definition nobody is watching.
      element.scrollIntoView({
        behavior: document.visibilityState === "hidden" ? "auto" : "smooth",
        block: "start",
      });
    }, 0);
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Every height the section passes through while it settles is recorded but
    // not acted on. Only once it is armed does a change mean the section moved
    // under someone, rather than the page still loading.
    let armed = false;
    const arm = window.setTimeout(() => {
      armed = true;
    }, SETTLE_MS);

    // -1 marks "no height seen yet". Kept even so the observer's own immediate
    // first callback, and any later re-report of an unchanged height, cost
    // nothing.
    let lastHeight = -1;

    const observer = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      if (height === lastHeight) return;
      lastHeight = height;

      if (!armed) return;
      bringIntoView();
    });

    observer.observe(element);

    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(pending.current);
      observer.disconnect();
    };
  }, [ref, bringIntoView]);

  return bringIntoView;
}
