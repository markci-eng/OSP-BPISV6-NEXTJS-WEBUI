"use client";

// A scroll box with no scrollbar, that still says it scrolls.
//
// Hiding the bar is the easy half, and it is the same technique the swipe deck
// uses on its track. The hard half is what replaces it: a list that is clipped
// with no bar and no edge simply looks like a list that ends there, and the
// claims below the fold are invisible in the strongest sense — nobody knows to
// look for them.
//
// So the content FADES OUT at any edge it continues past. That is the whole
// affordance, and it is a better one than the bar it replaces: a scrollbar says
// "there is more" only if you look at the bar, while a half-faded card says it
// at the exact place you are already reading. It also costs no layout — nothing
// is reserved, nothing shifts when it appears.
//
// Done with a mask rather than an overlaid gradient on purpose: a gradient has
// to be painted in the page's background colour, and would have to be kept in
// step with it through every theme and every surface this is dropped onto. A
// mask fades the content to whatever is actually behind it.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Box, type BoxProps } from "@chakra-ui/react";

/** How deep the fade is at an edge that has more content past it. */
const FADE = "28px";

/**
 * Slack, in pixels, before an edge counts as reached. Sub-pixel scroll offsets
 * mean the end is rarely hit exactly, and a fade that never quite goes away at
 * the bottom of a list reads as a rendering fault.
 */
const EPSILON = 2;

interface ScrollFadeProps extends Omit<BoxProps, "overflowY"> {
  children: ReactNode;
  /**
   * Whether the TOP edge may fade. Off for content with something pinned there.
   *
   * A mask applies to the box's whole painted result, sticky children included —
   * so a table whose header row sticks to the top would have that header fade
   * out the moment it was scrolled, which is the one thing it is pinned there to
   * avoid. Such a list says "there is more above" by the header still being
   * there, and only needs the bottom edge to say "there is more below".
   */
  fadeTop?: boolean;
}

/**
 * Vertically scrollable, with its scrollbar hidden and the edge it continues
 * past faded.
 *
 * Both edges are tracked, so scrolling into the middle of a long list fades the
 * top as well — which is what tells you the list did not start here.
 */
export function ScrollFade({
  children,
  fadeTop = true,
  ...rest
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ above: false, below: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const above = el.scrollTop > EPSILON;
    const below = el.scrollTop < max - EPSILON;

    // Returning the PREVIOUS object when nothing has moved is what makes this
    // safe to call after every commit: React bails out of a re-render only when
    // the state is identical, and a fresh `{above, below}` never is — however
    // equal its contents. Setting one every time would make the commit-time pass
    // below re-render forever.
    setMore((prev) =>
      prev.above === above && prev.below === below ? prev : { above, below },
    );
  }, []);

  // After every commit, and deliberately without a dependency list.
  //
  // The observer below reports the box and the list changing SIZE, which is not
  // quite the same event as the list changing CONTENT. Filter a long queue down
  // to four claims and the observer fires while `scrollTop` is still parked
  // where the long list left it — the browser clamps it to zero immediately
  // after, and nothing fires again. The reading taken in between says there is
  // content above, and it stands: a list of four cards, fitting easily, with its
  // top faded out for no reason. This is the pass that catches it.
  useEffect(sync);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    sync();
    // Subscribed natively rather than through React's `onScroll`, which is a
    // special-cased non-bubbling event; `passive` also promises the browser this
    // will never preventDefault, so it cannot delay the scroll itself.
    el.addEventListener("scroll", sync, { passive: true });

    // The box changing height, and the list inside it changing length, both
    // change whether there is anything past an edge — and neither is a scroll.
    // Filtering a queue down to two claims is the ordinary case: no scroll
    // happens, but the fade has to go.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  // Built from the two flags rather than switched between whole gradients, so an
  // edge that is not overflowing contributes no stop at all and stays fully
  // opaque — no fade on a list that fits.
  const mask = `linear-gradient(to bottom, ${
    more.above && fadeTop ? `transparent 0, #000 ${FADE}` : "#000 0"
  }, ${more.below ? `#000 calc(100% - ${FADE}), transparent 100%` : "#000 100%"})`;

  return (
    <Box
      ref={ref}
      overflowY="auto"
      // The list owns its scroll: reaching the end must not hand the gesture to
      // the page behind it, which on a fixed-height dashboard has nowhere to go.
      overscrollBehavior="contain"
      scrollbarWidth="none"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

export default ScrollFade;
