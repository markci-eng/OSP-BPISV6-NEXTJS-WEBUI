"use client";

// The measurements a Service Payables workspace is laid out to, and the one
// piece of behaviour that depends on them.
//
// There are two such pages now — For Process and Processed — and there will be
// four. They are the same screen a stage apart: a bounded, sticky rail you pick
// from, a main column showing what was picked, and one stacked column on a
// narrow screen with the rail on top. Every figure here was worked out for the
// first of them; this module is what keeps the second from being a copy that
// drifts.
//
// WHAT IS NOT HERE: anything one page does and another does not — the swap to a
// service record, the create-billing action. Those stay on the page that owns
// them.
//
// THE SPLIT IS MEASURED AGAINST THE WORKSPACE, NOT THE VIEWPORT — see
// {@link TWO_COLUMN_MIN}, which is the correction this module exists to hold.

import { scrollParentOf, visibleBandOf } from "../components/scroll-parent";

/**
 * Tallest the billing list may be when the page is one stacked column — the
 * smaller of half the screen and 360px, about five rows.
 *
 * That number is what keeps THE PAGE from being the thing that scrolls: at full
 * length, nine rows put the billing they lead to a screen and a half down, and
 * picking one meant scrolling past the other eight to see what you picked.
 *
 * It is applied to the WRAPPER around the list rather than to the list, which
 * is the same place the two-column cap goes — see {@link railListBox}.
 */
export const STACKED_LIST_MAX_HEIGHT = "min(50vh, 360px)";

/**
 * Tallest the RAIL may be on a desktop: a screenful, less where the page's
 * content starts (154px) and the 16px it is pinned with.
 *
 * THE RAIL ITSELF NEVER SCROLLS — it is bounded so everything in it is on
 * screen at once, and the billing list is the one item allowed to give: it
 * shrinks into what is left and scrolls inside itself. The bound matters
 * because the column is `position: sticky`: pinned, so scrolling the page does
 * not move it and anything past the bottom of the screen cannot be reached.
 */
export const RAIL_MAX_VIEWPORT = "calc(100vh - 170px)";

/* --------------------------- the two-column split --------------------------- */

// WHY THIS IS NOT A BREAKPOINT.
//
// It was one: `xl`, a 1280px VIEWPORT. And the viewport is not what this page
// is laid out in. The shell spends 419px of it before the workspace sees a
// pixel — a 300px sidebar, 8px of shell padding and 44px of page gutter at each
// edge — so at exactly 1280 the workspace itself is 861px wide and the main
// column is 497px. The number the layout was deciding on and the number it had
// to live in were 419px apart.
//
// What that cost: a monitor running any display scaling at all — 1920x1080 at
// 150% is 1280 CSS pixels, less a scrollbar — fell one pixel under the
// breakpoint and got the phone's stacked layout on a full-size screen. Nothing
// about the space available had changed; only the units it was counted in.
//
// So the split is a CONTAINER QUERY now, asked of the workspace itself: two
// columns when the workspace has room for two columns, whatever the viewport,
// the sidebar or the scaling happen to be. There is no number to keep in step
// with the shell any more, which is the real repair — the old one went stale
// the moment anything above this page changed width.

/** The container everything below is measured against — the workspace itself. */
export const WORKSPACE_CONTAINER = "sp-workspace";

/**
 * Workspace width, in pixels, at which the rail moves beside the main column.
 *
 * Set from what the MAIN column is left with, since that is the half that fails
 * first: the rail has a floor of 280px (see {@link RAIL_TRACK}) and the gutter
 * is 24px, so 720px leaves the billing table 416px — about where its four
 * columns stop being readable. Below that the stacked layout is genuinely the
 * better one, and the page still falls back to it.
 *
 * In this shell 720px of workspace is a 1139px viewport, against the 1280px the
 * old breakpoint demanded.
 */
export const TWO_COLUMN_MIN = 720;

/**
 * A floor under the whole arrangement: the shell's own desktop layout.
 *
 * Below `lg` the shell drops the sidebar and hands the page nearly the entire
 * viewport, which would put a 900px tablet over {@link TWO_COLUMN_MIN} and give
 * it a two-column workspace it was never meant to have. The container query
 * answers "is there room"; this answers "is this a desktop at all", and both
 * have to be true.
 */
export const DESKTOP_SHELL_MIN = 1024; // `lg`

const DESKTOP_SHELL = `@media (min-width: ${DESKTOP_SHELL_MIN}px)`;

const WIDE_ENOUGH = `@container ${WORKSPACE_CONTAINER} (min-width: ${TWO_COLUMN_MIN}px)`;

/** The workspace is wide enough for the rail to sit BESIDE the main column. */
const WIDER_STILL = `@container ${WORKSPACE_CONTAINER} (min-width: 1060px)`;

/** Styles that apply only once the workspace is two columns. */
const twoColumn = (styles: Record<string, unknown>) => ({
  [DESKTOP_SHELL]: { [WIDE_ENOUGH]: styles },
});

/**
 * The rail's track.
 *
 * FLUID BETWEEN 280 AND 340px, where it used to be a flat 340. At the widths
 * this module was built against it still resolves to 340 (40% of an 861px
 * workspace is 344), so nothing moves on the screens it was tuned on; the
 * clamp only bites on the narrower ones the container query has just let in,
 * where a fixed 340px rail would have taken the main column below 400.
 *
 * The wider step is the old `2xl` track by another route: 380px once the
 * workspace passes 1060, which in this shell is about where a 1536px viewport
 * used to trigger it.
 */
const RAIL_TRACK = "minmax(0, 1fr) clamp(280px, 40%, 340px)";

/**
 * The workspace root: what the container queries above are asked of.
 *
 * `inline-size` and not `size` — this measures WIDTH only. A container that
 * also tracks height cannot be sized by its own contents vertically, which
 * would break the sticky rail underneath it.
 */
export const WORKSPACE_ROOT = {
  containerType: "inline-size",
  containerName: WORKSPACE_CONTAINER,
} as const;

/**
 * The one stacked column, which is the layout BEFORE any query matches.
 *
 * Exported because the drawer needs it on its own: a side panel is never wide
 * enough for two columns at any width, so `ServiceRecordView` renders this and
 * nothing else there rather than a two-column rule that can never fire.
 */
export const STACKED_GRID = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "20px",
  alignItems: "start",
};

/** An item of {@link STACKED_GRID} — full width, in written order. */
export const STACKED_ITEM = {
  order: 0,
  minWidth: 0,
  alignSelf: "start",
};

/** The two columns, and the one stacked column they collapse to. */
export const WORKSPACE_GRID = {
  ...STACKED_GRID,
  // Not `twoColumn()`, because this is the one rule with a second step in it —
  // both queries have to sit under the same media condition, and the wider one
  // has to come after so it wins where both match.
  [DESKTOP_SHELL]: {
    [WIDE_ENOUGH]: { gridTemplateColumns: RAIL_TRACK, gap: "24px" },
    [WIDER_STILL]: { gridTemplateColumns: "minmax(0, 1fr) 380px" },
  },
};

/**
 * The rail column.
 *
 * Written FIRST in the markup so that stacked it comes above the main column —
 * the order of the task is pick, then work what was picked — and `order` swaps
 * it to the right once there are two columns.
 *
 * A BOUNDED COLUMN that does not itself scroll: it is `position: sticky`, so
 * anything past the bottom of the screen could not be reached by scrolling the
 * page. Everything in it is on screen at once and the list is the only item
 * allowed to give — see {@link railListBox}.
 *
 * `maxHeight` is a parameter because the record view's rail starts higher up
 * the page than the billing view's does — it has no page heading above it — and
 * so has more of the screen to spend. The two figures live with the views that
 * measured them.
 */
export const workspaceRail = (maxHeight: string = RAIL_MAX_VIEWPORT) => ({
  ...STACKED_ITEM,
  ...twoColumn({
    order: 1,
    position: "sticky",
    top: "16px",
    maxHeight,
    display: "flex",
    flexDirection: "column",
  }),
});

export const WORKSPACE_RAIL = workspaceRail();

/**
 * A rail that is sticky but NOT bounded — the dashboard's.
 *
 * The difference is what the column holds. A workspace rail is a picker whose
 * foot carries an action, so nothing in it may fall past the bottom of the
 * screen; the dashboard's is a run of read-only panels, and a long one running
 * off the bottom costs the reader nothing but a scroll.
 */
export const WORKSPACE_ASIDE = {
  ...STACKED_ITEM,
  ...twoColumn({ order: 1, position: "sticky", top: "16px" }),
};

/**
 * Shown only while the page is stacked, and only once it is two columns.
 *
 * For content that is said in a DIFFERENT PLACE in the other layout rather than
 * not at all — the dashboard's figures, which head the work column when there
 * is one and sit above the panels when there is not. Rendering both would say
 * them twice.
 */
export const STACKED_ONLY = { display: "block", ...twoColumn({ display: "none" }) };
export const TWO_COLUMN_ONLY = {
  display: "none",
  ...twoColumn({ display: "block" }),
};

/** The main column — what the rail points at. */
export const WORKSPACE_MAIN = {
  ...STACKED_ITEM,
  order: 1,
  ...twoColumn({ order: 0 }),
};

/**
 * Air under the MAIN column, and ONLY it — see {@link MAIN_COLUMN_TAIL}.
 *
 * Two columns only. Stacked, the main column is the last thing on the page and
 * {@link PAGE_PADDING_BOTTOM} is already the air under it; a tail here as well
 * would be a second reserve stacked on the first.
 */
const MAIN_COLUMN_TAIL_HEIGHT = "40px";

/**
 * The main column with air under it — for a page whose main column ENDS in
 * something that needs room below it, where the plain {@link WORKSPACE_MAIN}
 * would put it against the bottom of the screen.
 *
 * WHY THIS IS NOT PAGE PADDING, which is where it was first put and where it
 * did real damage.
 *
 * The rail is `position: sticky`, and a sticky element may not leave its grid
 * area — which is the ROW, and the row ends where the grid does. Page padding
 * sits OUTSIDE the grid, so every pixel of it is a pixel the rail's sticky
 * range loses: scrolled to the foot of a long record, a rail taller than the
 * screen was pushed up by the full depth of the reserve and took its own head
 * with it — the billing number and the way back, gone off the top of the
 * screen, on a column whose whole point is that it cannot be scrolled to.
 *
 * Inside the grid the same 40px does the opposite. The row grows by it, so the
 * rail's area grows by it, and the rail is not moved at all.
 */
export const MAIN_COLUMN_TAIL = {
  ...WORKSPACE_MAIN,
  ...twoColumn({ order: 0, paddingBottom: MAIN_COLUMN_TAIL_HEIGHT }),
};

/**
 * An item in the rail that is allowed to SHRINK — everything else in the column
 * holds its size and this takes what is left.
 *
 * Only in two columns, where the rail is a bounded flex column that cannot be
 * scrolled to. Stacked it is an ordinary block in an ordinary scrolling page,
 * and there is nothing to fit inside of; the flex here is only so its own
 * children can be laid out the same way in both.
 */
export const RAIL_GIVES = {
  display: "flex",
  flexDirection: "column",
  ...twoColumn({ flex: "0 1 auto", minHeight: 0 }),
};

/**
 * The wrapper around the rail's list, and THE ONE THING IN THE COLUMN THAT
 * GIVES.
 *
 * Both caps live here rather than on the list, which is what lets the list be a
 * plain flex child (`1 1 auto` with `minH: 0`) that fills whatever it is given
 * and scrolls inside it. The list used to carry a `100%` max-height for the
 * two-column case, and a percentage resolves against a parent with a DEFINITE
 * height — which a flex item sized from its own content has none of, so the cap
 * silently dropped out and a tall monitor drew an eleventh row.
 *
 * `listMax` is the ten-row figure, and it belongs to the list that counts the
 * rows (`LIST_MAX_HEIGHT`) rather than being restated here.
 */
export const railListBox = (listMax: string) => ({
  ...RAIL_GIVES,
  maxHeight: STACKED_LIST_MAX_HEIGHT,
  ...twoColumn({ flex: "0 1 auto", minHeight: 0, maxHeight: listMax }),
});

/**
 * The billing index's place in a rail — the one item that GIVES, and the one
 * item that is not rendered at all while stacked.
 *
 * HIDDEN WHILE STACKED. Stacked, the closed accordion heads are themselves a
 * compact list of billings; an index above them would be the same list twice at
 * two sizes. The nav and the picker above it do not share that — they have no
 * second telling anywhere — so they stay.
 *
 * `flex: 1 1 auto` with `minHeight: 0` is what lets `BillingIndex` do what it
 * was written to do: the rail is bounded and sticky, so the list shrinks into
 * whatever the nav and the picker leave it and scrolls inside itself instead of
 * running off the bottom of a column that cannot be scrolled to.
 *
 * IN THIS MODULE AND NOT ON A PAGE, since 2026-08-26: For Verification took the
 * accordion too, so there are two rails carrying an index and this is the rule
 * that has to hold for both. It is `railListBox`'s counterpart — that one caps a
 * list to its own rows, this one lets an index take everything left over — and
 * it belongs beside it for the same reason every other figure here does.
 */
export const INDEX_IN_RAIL = {
  display: "none",
  [DESKTOP_SHELL]: {
    [WIDE_ENOUGH]: {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      minHeight: 0,
    },
  },
};

/** Air left above the billing when one is picked on a stacked layout. */
const DETAIL_SCROLL_MARGIN = 12;

/**
 * The shell reserves 96px under every page for the bottom navigation, which is
 * mobile-only — so on a desktop that reserve is a strip of nothing the page has
 * to scroll to reach. Handed back at `lg`, which is where the navigation stops
 * being rendered. A phone keeps the bar's own 62px plus twice the grid's gap,
 * and `env()` adds the home-indicator inset on the phones that have one.
 */
export const PAGE_PADDING_BOTTOM = {
  base: "calc(62px + 40px + env(safe-area-inset-bottom, 0px))",
  lg: 10,
  xl: 12,
};

/**
 * Bring the main column into view after something is picked in the rail.
 *
 * STACKED ONLY — the caller checks the width, since on a desktop the detail is
 * already beside the list and nothing moved. Above the fold there is no
 * scrolling to do; here the rail sits ON TOP of what it opens, so picking
 * without this leaves the user looking at the list they just used.
 *
 * Through `scrollParentOf` rather than `scrollIntoView`, for the reason that
 * helper was written: the shell scrolls an inner container, not the window.
 * `scrollIntoView` does find that container — but only its INSTANT form does;
 * asked to animate inside this shell it silently does nothing at all.
 */
export function scrollDetailIntoView(detail: HTMLElement | null) {
  if (!detail) return;
  const scroller = scrollParentOf(detail);
  const offset = detail.getBoundingClientRect().top - visibleBandOf(scroller).top;
  scroller.scrollBy({ top: offset - DETAIL_SCROLL_MARGIN });
}
