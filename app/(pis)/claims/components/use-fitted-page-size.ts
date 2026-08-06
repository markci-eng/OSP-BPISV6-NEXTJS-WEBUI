"use client";

// How many items of a paged list fit on this device, measured rather than guessed.
//
// The alternative — a table of height breakpoints — is what
// `STACKED_MIN_HEIGHT` in `PendingClaimsSummary` does, and that constant has been
// silently wrong three times: it encodes the measured height of everything above
// it, so any change up the page invalidates it without a word. This asks the
// layout instead, so it cannot go stale.
//
// Everything read here is a LAYOUT value — `offsetHeight`, `offsetTop` — never
// `getBoundingClientRect` on an item. The deck scales departing slides, and a
// rect reflects that transform while the offsets do not; measuring the rect would
// make the answer depend on where the carousel happens to be sitting.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { scrollParentOf } from "./scroll-parent";

/**
 * Measure before the browser paints, so the list does not visibly re-flow from
 * its minimum to its fitted size. `useLayoutEffect` warns when it runs on the
 * server, hence the swap — the measurement is meaningless there anyway.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * How much of the screenful is left below `frame`, once `reserve` is kept clear.
 *
 * The screenful is the SCROLLER's height — measured inside it rather than
 * against the window, because this shell scrolls an inner container and pins
 * `document.body` to the viewport. The scroller is searched for from the ORIGIN
 * rather than from the frame: the box that bounds the screenful has to be an
 * ancestor of the section, never something nested inside it. That distinction is
 * load-bearing for the table view, whose rows sit inside the kit's own
 * `overflow: auto` wrapper — walking up from the rows finds that wrapper first,
 * and it is only ever as tall as the table already is, so "how much room is
 * left" comes back as none on the tallest screens.
 *
 * Both readings of `top` are scroll-independent: the anchored one because it is
 * the distance between two live rects, which scrolling moves equally; the other
 * because the scroller's own offset is added back.
 */
function availableBelow({
  frame,
  origin,
  anchoredToOrigin,
  reserve,
}: {
  frame: HTMLElement;
  origin: HTMLElement | null | undefined;
  anchoredToOrigin: boolean;
  reserve: number;
}): number {
  const scroller = scrollParentOf(origin ?? frame);
  const top =
    origin && anchoredToOrigin
      ? frame.getBoundingClientRect().top - origin.getBoundingClientRect().top
      : frame.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
  return scroller.clientHeight - top - reserve;
}

/**
 * Re-run `measure` whenever anything that could change its answer changes.
 *
 * Three triggers, and each covers a case the others miss:
 *
 *  - Every commit, without a dependency list. The observer below reports what
 *    the LAYOUT does; this reports what REACT does, and they are not the same
 *    set. A queue swapped for a shorter one, a filter narrowing the list, a deck
 *    remounting onto a new element — none of them is guaranteed to resize
 *    anything the observer watches, and when one does not, the answer from the
 *    previous layout simply stands: nothing changed size, so nothing asks again,
 *    and a measurement that is stale but stable is never corrected.
 *
 *  - The viewport. On a phone its usable height changes with no window resize at
 *    all — the URL bar collapsing, the keyboard opening — which is the visual
 *    viewport. The pair of timeouts is the load case: sections above make their
 *    own height-driven decisions that land in a later commit, so the first
 *    reading is taken against a layout that is about to change.
 *
 *  - The frame's own ancestors, up to the scroller. Content above settling —
 *    fonts landing, a section switching from a stack to a carousel — moves where
 *    the list starts with nothing else to signal it. Deliberately NOT
 *    `document.body`, which this shell pins to the viewport: it never resizes,
 *    so nothing would ever be noticed.
 *
 * Safe to run this often because every measurement is idempotent — same layout,
 * same answer, and React drops a `setState` that does not change the value.
 */
function useRemeasure(
  measure: () => void,
  frameRef: RefObject<HTMLElement | null>,
) {
  const remeasure = useCallback(() => {
    measure();
    const timers = [
      window.setTimeout(measure, 0),
      window.setTimeout(measure, 250),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [measure]);

  useIsomorphicLayoutEffect(measure);

  useIsomorphicLayoutEffect(() => {
    const cancel = remeasure();

    window.addEventListener("resize", remeasure);
    window.addEventListener("orientationchange", remeasure);
    window.visualViewport?.addEventListener("resize", remeasure);

    const observer = new ResizeObserver(measure);
    const frame = frameRef.current;
    if (frame) {
      const scroller = scrollParentOf(frame);
      observer.observe(scroller);
      for (
        let node = frame.parentElement;
        node && node !== scroller;
        node = node.parentElement
      ) {
        observer.observe(node);
      }
    }

    return () => {
      cancel();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("orientationchange", remeasure);
      window.visualViewport?.removeEventListener("resize", remeasure);
      observer.disconnect();
    };
  }, [measure, remeasure, frameRef]);
}

export interface FittedPageSizeOptions {
  /**
   * Element marking where the pages start. Must sit OUTSIDE any transformed
   * wrapper, since its position is read from a client rect.
   */
  frameRef: RefObject<HTMLElement | null>;
  /**
   * Element whose direct children are the items of one page. Their height and
   * the space between them is what a row costs.
   *
   * May be laid out in COLUMNS — the claim queues become a card grid once the
   * column they sit in is wide enough for two cards. How many there are is read
   * off the items themselves rather than passed in, so the caller can leave the
   * count to CSS (`auto-fill`) and never has to tell this hook about it.
   */
  listRef: RefObject<HTMLElement | null>;
  /**
   * Where the screenful this list is sizing itself into BEGINS — normally the
   * root of the section the list belongs to.
   *
   * Omit it and the screenful is measured from the top of the scrollable
   * content, which is right for a list near the top of the page: what fits is
   * what fits with the page scrolled home.
   *
   * Pass it for a section further down. Measured from the content top, a
   * section a screen and a half into the page has more above it than there is
   * viewport, so `available` comes out negative and the list is pinned to `min`
   * on every device — the measurement stops answering the question. Given an
   * origin, the space above the pages is measured within the SECTION instead:
   * its own heading, tabs and toolbar, and nothing before it. The answer becomes
   * "what fits once this section is scrolled to", which is how it is read.
   *
   * Both readings are scroll-independent — this one because it is the distance
   * between two live rects, which the scroll offset moves equally.
   */
  originRef?: RefObject<HTMLElement | null>;
  /**
   * Whether the section will be SCROLLED TO before it is read.
   *
   * That is the assumption `originRef` encodes, and on a phone it is right: the
   * queue sits below the fold, the processor scrolls down to it, and what fits
   * is what fits from its own top. So everything above it is rightly ignored.
   *
   * On a desktop it is wrong, and wrong by the height of the page header —
   * around a hundred pixels the section never gets back, because the page does
   * not scroll at all. Measured as if it did, every list comes out one row too
   * tall and the page acquires exactly the scrollbar the fitting was meant to
   * remove. Passing `false` measures from where the section actually IS.
   *
   * `originRef` still does its other job either way: it is where the search for
   * the scroller starts.
   */
  anchoredToOrigin?: boolean;
  /**
   * Pixels below the last item that must stay clear — a fixed bottom navigation,
   * the carousel's own dots, whatever must not be covered.
   */
  reserve: number;
  /** Fewest items a page may hold, however short the screen. */
  min: number;
  /**
   * Most ROWS a page may hold, however tall the screen.
   *
   * Rows rather than items, because the item count depends on how many columns
   * the list happens to be laid out in and the caller does not know that — it is
   * decided by CSS from the width the list was given. A cap of 8 means eight
   * cards in one column and sixteen in two: the same amount of SCREEN either
   * way, which is what the cap is really about.
   */
  maxRows: number;
}

/**
 * The number of items that fit on one screen — whole rows of however many
 * columns the list is in, never fewer than `min`.
 *
 * Returns `min` until the list has been laid out and measured, so the server and
 * the first client render agree.
 *
 * Recomputes when the viewport changes and when the page's own content settles.
 * Growing the page size makes the document taller, which fires the observer
 * again — but the frame's position and a row's height are both unaffected by how
 * many rows are rendered, so the second pass returns the same number and it
 * converges immediately.
 */
export function useFittedPageSize({
  frameRef,
  listRef,
  originRef,
  anchoredToOrigin = true,
  reserve,
  min,
  maxRows,
}: FittedPageSizeOptions): number {
  const [size, setSize] = useState(min);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const list = listRef.current;
    if (!frame || !list) return;

    const items = Array.from(list.children) as HTMLElement[];
    const itemHeight = items[0]?.offsetHeight ?? 0;
    // Nothing laid out yet — leave the current answer alone rather than
    // computing a page size from a zero-height row.
    if (itemHeight === 0) return;

    // How wide a row is, and what the space between two of them costs.
    //
    // Both come off the LIST rather than off the items in it. That distinction
    // is the difference between a measurement that converges and one that does
    // not: the items are what this hook is deciding the number of, so counting
    // columns by which items happen to sit level with the first would make the
    // answer depend on the last answer. A queue filtered down to two claims
    // would report two columns, size a page to two, and never find its way back
    // up. `grid-template-columns` resolves to the real track list whether or not
    // there is anything in them, and `row-gap` is there with a single row.
    //
    // A plain stack reports no tracks at all, which is one column — what every
    // phone gets, and what the feed in the side rail gets at any width.
    const listStyle = getComputedStyle(list);
    const tracks = listStyle.gridTemplateColumns;
    const columns =
      tracks && tracks !== "none" ? tracks.split(" ").length : 1;
    const gap = parseFloat(listStyle.rowGap) || 0;

    const available = availableBelow({
      frame,
      origin: originRef?.current,
      anchoredToOrigin,
      reserve,
    });

    // n rows cost n heights and n-1 gaps. The page is whole rows of `columns`,
    // never a ragged one — a grid that ends mid-row on every page reads as the
    // list having been cut off rather than paged.
    const rows = Math.floor((available + gap) / (itemHeight + gap));
    setSize(Math.max(min, Math.min(maxRows, rows) * columns));
  }, [
    frameRef,
    listRef,
    originRef,
    anchoredToOrigin,
    reserve,
    min,
    maxRows,
  ]);

  useRemeasure(measure, frameRef);


  return size;
}
