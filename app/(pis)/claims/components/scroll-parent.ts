"use client";

/**
 * The element a given one actually scrolls inside.
 *
 * Not an academic question in this app: the shell scrolls an inner container,
 * and `document.body` is pinned to the viewport's height. So `window.scrollY` is
 * always 0 and the document never grows — measuring against the window gives an
 * answer that is wrong as soon as the page is scrolled, and watching `body` for
 * changes never fires at all.
 *
 * The overflow check is paired with an "is it actually taller than itself" test
 * on purpose: CSS computes `overflow-y` to `auto` on anything with
 * `overflow-x: auto` — the swipe deck's own track, for one — and those are not
 * what is being looked for.
 *
 * But "not overflowing right now" cannot be allowed to mean "not the scroller",
 * which is why a scroller whose content happens to fit is remembered rather than
 * skipped. Callers measure the screenful against whatever comes back, and on a
 * wide screen the dashboard is close enough to filling its scroller that a page
 * size which grows it by one row tips it into overflowing. If that flipped the
 * answer between this box and the viewport — 64px apart, the header's worth —
 * the page size would size the content to fit, and then, because it now fits,
 * measure against a taller screenful and grow again. Same box either way, so
 * there is nothing to oscillate between.
 */
export function scrollParentOf(element: HTMLElement): HTMLElement {
  /** A scroller that is not currently overflowing — the fallback, if nothing better turns up. */
  let idle: HTMLElement | null = null;

  let node = element.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") {
      if (node.scrollHeight > node.clientHeight + 1) return node;
      // Scrolls SIDEWAYS — a swipe deck's track, which only looks like a
      // scroller because `overflow-x: auto` computes `overflow-y` to `auto` too.
      // Never a candidate; its height is the deck's, not a screenful.
      if (node.scrollWidth <= node.clientWidth + 1) idle ??= node;
    }
    node = node.parentElement;
  }

  // Nothing anywhere overflows: the page scrolls as a whole, and
  // `documentElement` behaves like the scroller — rect top 0, `scrollTop` the
  // page offset, `clientHeight` the viewport — so callers need no special case.
  return idle ?? document.documentElement;
}

/**
 * The part of a scroller that is on screen, in viewport coordinates.
 *
 * `documentElement` needs the special case: its rect is as tall as the whole
 * document, so reading `bottom` off it would report everything below the fold as
 * visible. Its VISIBLE band is the viewport, which is its `clientHeight`.
 */
export function visibleBandOf(scroller: HTMLElement): {
  top: number;
  bottom: number;
} {
  if (scroller === document.documentElement) {
    return { top: 0, bottom: scroller.clientHeight };
  }
  const rect = scroller.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}
