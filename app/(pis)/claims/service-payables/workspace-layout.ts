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

/* ------------------------- the conveyor's mirror ------------------------- */

// CONTROLS LEFT, CONTENT RIGHT — the arrangement the conveyor asked for
// (user, 2026-09-11), and the mirror image of the three rules above.
//
// WHY IT IS A SECOND SET AND NOT A FLAG ON THE FIRST. The four archived
// workspaces are laid out to the originals and are still compiled; a `side`
// parameter threaded through `workspaceRail`, `WORKSPACE_MAIN` and
// `MAIN_COLUMN_TAIL` would put a branch in each of them for the benefit of one
// caller. These three are that caller's, they sit beside the originals so the
// two can be read against each other, and every figure in them — the track
// clamp, the wider step, the tail — is the same figure. Only the order changes.
//
// THE OLDER RULE THIS OVERTURNS (user-confirmed 2026-08-13) said the list being
// worked through is always on the RIGHT. That rule was about a PICKER: a rail
// you choose FROM stands beside the thing you have chosen. The conveyor's rail
// is not a picker — nothing on that page is chosen, the queue decides — so what
// is left in the column is controls, and controls are read before the content
// they act on.
//
// THE STACKED CASE IS UNCHANGED by any of it: the rail is written first in the
// markup and wanted first when stacked either way, so these only have to say
// what happens once there are two columns.

// IT SPLITS ON THE VIEWPORT, NOT ON THE WORKSPACE (user, 2026-09-11: "lets make
// it the same as the death claim") — which is the one place the conveyor departs
// from the container-query rule argued at the top of this file, and it is a
// deliberate exception rather than a lapse.
//
// WHAT THE DIFFERENCE WAS. The workspace rules need BOTH `lg` and 720px of
// workspace, and the shell spends about 419px before the workspace sees a pixel
// — so two columns needed roughly a 1139px viewport. The death claim asks only
// `lg`. Between 1024 and 1139 the two screens therefore disagreed: a claim sat
// in two columns with a pinned rail while a billing, on the same monitor, was
// one stacked column. They are worked by the same people at the same desk, and
// a window width that changes the shape of one screen and not the other is the
// kind of difference that gets read as a bug.
//
// WHAT IT COSTS is the thing the container query was written to fix: at exactly
// `lg` with the sidebar out, the workspace is about 605px and the record column
// is left with roughly 300. That is tight. It is answered by the TRACK below
// rather than by refusing to split — the rail gives width back on a narrow
// desktop instead of holding 340 — and by the compact account rows the rail
// carries there. See `PlanholderServiceList`'s `compact`.

/** Styles that apply once the SHELL is a desktop, whatever the workspace holds. */
const desktopShell = (styles: Record<string, unknown>) => ({
  [DESKTOP_SHELL]: styles,
});

/**
 * The conveyor's tracks — the rail first, and FLUID rather than clamped to 340.
 *
 * 32% with a 280 floor is what makes the viewport split survivable: at a 605px
 * workspace the rail takes its floor and hands the record 300px, where a fixed
 * 340 would have left 241. On a wide monitor 32% passes 360 and the ceiling
 * holds it there, which is about where the old two-step rule ended up anyway.
 */
const CONVEYOR_TRACK = "clamp(280px, 32%, 360px) minmax(0, 1fr)";

/** {@link WORKSPACE_GRID} with the rail on the left, split on the viewport. */
export const CONVEYOR_GRID = {
  ...STACKED_GRID,
  ...desktopShell({ gridTemplateColumns: CONVEYOR_TRACK, gap: "24px" }),
};

/**
 * The conveyor rail's own bound — a screenful, less everything above it.
 *
 * MEASURED IN THE SHELL AND NOT GUESSED (1440x1080, 2026-09-11): the app header
 * takes the first 76px and the scrolling container starts under it, the page's
 * heading block takes another 79px inside that container, so the rail's own top
 * is at 155px until anything is scrolled. A rail bounded to more than
 * `100vh - 155px` therefore ends below the fold ON THE VIEW A BILLING ARRIVES
 * IN, which is the one view a processor has not scrolled yet.
 *
 * IT USED TO BE `100vh - 96px`, which is the PINNED figure: 76 for the header
 * and the 16 the column is pinned with. That is the right bound for every scroll
 * position except the first one, and while the account list was capped at five
 * rows the rail never grew near either number so the difference never showed. It
 * shows now that the list takes whatever the column will give it — 59px of the
 * rail's foot, which is exactly where the commit is — so the bound is the
 * stricter of the two.
 *
 * WHAT IT COSTS is those 59px of list once the page IS scrolled and the rail is
 * pinned: about a row and a half out of fifteen on a 1080px screen. Cheap, for a
 * commit that is on screen in every state of the page rather than in all but
 * one.
 */
export const CONVEYOR_RAIL_MAX = "calc(100vh - 156px)";

/** {@link workspaceRail} in the left-hand track. */
export const conveyorRail = (maxHeight: string = RAIL_MAX_VIEWPORT) => ({
  ...STACKED_ITEM,
  ...desktopShell({
    order: 0,
    position: "sticky",
    top: "16px",
    maxHeight,
    display: "flex",
    flexDirection: "column",
  }),
});

/**
 * {@link MAIN_COLUMN_TAIL} in the right-hand track.
 *
 * `order: 1` in BOTH cases, which is the whole of the difference: stacked it
 * puts the record under the rail, and in two columns it puts it beside it, on
 * the right.
 */
export const CONVEYOR_MAIN_TAIL = {
  ...STACKED_ITEM,
  order: 1,
  // THE SHELL'S BOTTOM RESERVE LIVES HERE, INSIDE THE GRID — the conveyor
  // passes `paddingBottom={0}` to `Page.Root` and the record column carries it
  // instead. It is the same 96px the shell wants for the mobile bottom
  // navigation; what changes is which side of the grid it falls on.
  //
  // WHY IT HAD TO MOVE, measured at 1440x620: the rail pinned at 108px through
  // the whole scroll and then jumped to 48 over the last tenth of it — a 60px
  // lurch, at the exact moment a processor reaches the foot of the record. A
  // sticky element may not leave its containing block, which is the grid ROW,
  // and page padding sits OUTSIDE the row: every pixel of it is a pixel of
  // scrolling with nothing left to pin against, so the rail is shoved up by the
  // full depth of the reserve and takes its own head with it. The note on
  // `MAIN_COLUMN_TAIL` describes this hazard; the conveyor walked straight into
  // it by passing `PAGE_PADDING_BOTTOM` through.
  //
  // Inside the grid the same pixels do the opposite: the row grows by them, so
  // the rail's area grows by them, and the rail does not move at all. The death
  // claim does exactly this — see `paddingBottom={0}` on its own `Page.Root`.
  paddingBottom: "calc(62px + 40px + env(safe-area-inset-bottom, 0px))",
  ...desktopShell({ order: 1, paddingBottom: MAIN_COLUMN_TAIL_HEIGHT }),
};

/**
 * The rail's list, capped for the conveyor — {@link railListBox} on the
 * viewport condition, so it agrees with the three rules above.
 *
 * A list still capped by the wrapper and not by itself, for the reason
 * `railListBox` gives: a percentage max-height on a flex item sized from its own
 * content resolves to nothing.
 *
 * ON A DESKTOP IT IS CAPPED BY THE RAIL AND BY NOTHING ELSE (user, 2026-09-11:
 * "when the screen is long allowed to display more planholder as long as the
 * buttons will be shown"). It carried the five-row figure in both layouts, and
 * five rows is a number measured on a SHORT screen: a 1080px monitor has room
 * for about fifteen and drew five, with a third of the rail standing empty above
 * a commit that was never in any danger.
 *
 * WHAT REPLACES THE NUMBER IS THE BOUND THAT WAS ALREADY THERE, and it is
 * exactly the condition the request names. The rail is a flex column with a
 * `maxHeight` of a screenful (see {@link conveyorRail}); everything in it but
 * this holds its size (`flexShrink: 0`), and this one item is `0 1 auto` with
 * `minHeight: 0`. So the list grows to whatever the accounts need, and the
 * moment the column would outrun the screen the browser shrinks THIS — down to
 * three rows on a 620px laptop if that is what it takes — and the controls under
 * it stay where they are. "As long as the buttons will be shown" is not a figure
 * to be re-measured every time something moves in the rail; it is what a bounded
 * flex column does on its own.
 *
 * THE STACKED CAP STAYS A FIGURE, because stacked there is no bound to inherit:
 * the rail is an ordinary block on a scrolling page, so a list free to run on
 * simply pushes the commit below the fold — which is the exact fault the five
 * rows were introduced to fix. See `LIST_MAX_HEIGHT_COMPACT`, which is now a
 * phone's cap and not the list's.
 */
export const conveyorListBox = (stackedMax: string) => ({
  display: "flex",
  flexDirection: "column",
  maxHeight: stackedMax,
  // `none` and not "unset": this overrides the stacked declaration above, which
  // a shorthand-free reset has to say out loud.
  ...desktopShell({ flex: "0 1 auto", minHeight: 0, maxHeight: "none" }),
});

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

/** {@link RAIL_GIVES} on the conveyor's viewport condition. */
export const CONVEYOR_GIVES = {
  display: "flex",
  flexDirection: "column",
  [DESKTOP_SHELL]: { flex: "0 1 auto", minHeight: 0 },
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

/** Whether the reader has asked the system for less movement. */
function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Bring an element to the top of the screen — the main column after something
 * is picked in the rail, or the folder when the Deficient tick sends the reader
 * to it.
 *
 * STACKED ONLY for the rail's use — the caller checks the width, since on a
 * desktop the detail is already beside the list and nothing moved. Above the
 * fold there is no scrolling to do; there the rail sits ON TOP of what it opens,
 * so picking without this leaves the user looking at the list they just used.
 *
 * Through `scrollParentOf` rather than `scrollIntoView`, for the reason that
 * helper was written: the shell scrolls an inner container, not the window.
 * `scrollIntoView` does find that container — but only its INSTANT form does;
 * asked to animate inside this shell it silently does nothing at all.
 *
 * WHICH IS WHY `smooth` IS A FLAG HERE AND NOT A CALLER'S `scrollIntoView`
 * OPTION (user, 2026-09-14: "can we do that when scroll the page has animation
 * scroll"). `scrollBy` on the container DOES animate — it is the element's own
 * method rather than the one that walks up looking for a scrollport — so the
 * animation is one argument away as long as it goes through this helper.
 *
 * INSTANT BY DEFAULT, so the two callers that predate the flag are untouched:
 * a rail picking a detail is answering a tap that has already happened, and the
 * swap it belongs to hides the jump behind a placeholder — animating it would
 * be an animation nobody sees, running while a skeleton is on screen.
 */
export function scrollDetailIntoView(
  detail: HTMLElement | null,
  { smooth = false }: { smooth?: boolean } = {},
) {
  if (!detail) return;
  const scroller = scrollParentOf(detail);
  const offset = detail.getBoundingClientRect().top - visibleBandOf(scroller).top;
  scroller.scrollBy({
    top: offset - DETAIL_SCROLL_MARGIN,
    // The reader's own setting wins: `smooth` is a nicety, and somebody who has
    // turned animation off system-wide has said what they think of it.
    behavior: smooth && !reducedMotion() ? "smooth" : "auto",
  });
}

// A `FOLDER_SECTION_MIN` STOOD HERE FOR AN AFTERNOON, and this note is what is
// left of it — so that the next person to want "the folder and nothing else on
// screen" knows what was tried and why it is not here.
//
// THE PROBLEM IT ANSWERED IS REAL AND STILL UNSOLVED. A scroller stops at its
// end. The folder is the LAST card in the record column, so on a tall screen
// with a short folder there is not enough page underneath it to bring it to the
// top: the browser clamps, and the Deficient tick lands the reader with the
// folder at the foot of the screen and the form still above it. No amount of
// scrolling code fixes that — the page has to be long enough for the scroll to
// exist.
//
// SO THE FOLDER WAS GIVEN A SCREENFUL OF MINIMUM HEIGHT, which worked exactly as
// intended and was reverted the moment it was seen (user, 2026-09-14: "remove
// the white space at the bottom"). The space it bought was blank, it sat under
// the last card of every short folder, and it was there whether or not anybody
// had pressed the tick — a permanent void paying for one occasional jump.
//
// WHAT WE HAVE INSTEAD is the honest stop: `scrollDetailIntoView` goes as far as
// the page allows, which puts the folder as high as it can go and leaves
// whatever is above it visible. The deficiency list is fully on screen either
// way; it simply is not alone.
//
// IF IT IS WANTED AGAIN, the reserve is the wrong shape for it. The thing that
// shows one section and nothing else is an OVERLAY — `SectionPopup`, which this
// module's neighbours already use for exactly that — and it costs no layout at
// all when it is closed.
