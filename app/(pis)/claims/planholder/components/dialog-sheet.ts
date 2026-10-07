// What a DRAWER has to be told when it is standing in for a dialog.
//
// The payee sheets are `Drawer` components. That is right where they belong to
// a claim drawer — but on `/claims/death-claim` they are asked to arrive as
// centred pop-ups instead (`asDialog`), and a drawer keeps two habits that a
// pop-up must not have. Both are corrected here, in one place, because three
// files were carrying the same override and a fourth would have copied it.

/**
 * The overrides a centred sheet needs, for the `css` prop on `Drawer.Content`.
 *
 * IT APPEARS AND DISAPPEARS; IT DOES NOT SLIDE. Sliding up from the bottom edge
 * is a phone's gesture — the sheet comes from the edge your thumb is at, and
 * goes back to it. Away from that edge the same motion is just a box flying in
 * from off-screen for no reason. A pop-up is already over the page; it should
 * fade onto it and fade off.
 *
 * AND IT IS HIDDEN WHEN CLOSED. `placement="bottom"` hides by translating the
 * content down its own height, which from the bottom edge puts it off-screen
 * and from the middle of the screen leaves a strip of it along the bottom — a
 * closed sheet visible at the foot of the page, which is exactly what it looked
 * like before this rule.
 *
 * `display: none` while closed also means the exit is a cut rather than a fade.
 * That is the trade, and it is the right way round: a sheet that vanishes reads
 * as closed, where one that parks half on screen reads as broken.
 */
export const DIALOG_SHEET_CSS = {
  '&[data-state="open"]': {
    // Chakra's own keyframes. If a future version renames them the rule is
    // simply dropped and the sheet appears instantly — still no slide, which is
    // the half that matters.
    animationName: "fade-in, scale-in",
    animationDuration: "160ms",
    animationTimingFunction: "ease-out",
  },
  '&[data-state="closed"]': { display: "none" },
} as const;

/**
 * A pop-up FROM `lg` ONLY — below it the drawer keeps its own slide up from the
 * bottom edge, which is right on a phone (user, 2026-10-02, on the payee
 * details: "do the pop-up in the bottom animation when mobile"). Pair it with
 * {@link POPUP_FROM_LG}, which places and shapes the sheet to match.
 */
export const DIALOG_SHEET_FROM_LG_CSS = {
  "@media screen and (min-width: 64rem)": DIALOG_SHEET_CSS,
} as const;

/**
 * Where a pop-up-from-`lg` sheet sits and how it is cut: a bottom sheet with a
 * rounded top on a phone, a centred 840px box from `lg`. Positioner props
 * first, content props second.
 */
export const POPUP_FROM_LG = {
  positioner: {
    alignItems: { base: "flex-end", lg: "center" },
    justifyContent: "center",
    p: { base: 0, lg: 3 },
  },
  content: {
    h: "auto",
    w: "full",
    maxW: { base: "100%", lg: "840px" },
    maxH: { base: "88dvh", lg: "82vh" },
    borderTopRadius: { base: "2xl", lg: "xl" },
    borderBottomRadius: { base: 0, lg: "xl" },
    pb: { base: "env(safe-area-inset-bottom, 0px)", lg: 0 },
  },
  /** The same content props when the sheet is NOT a pop-up: full height. */
  fullHeight: { h: "100dvh", maxH: "100dvh", borderRadius: 0 },
} as const;
