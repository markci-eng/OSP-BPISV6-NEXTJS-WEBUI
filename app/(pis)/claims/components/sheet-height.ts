// HOW TALL THE CLAIMS AREA'S SHEETS ARE — one place, so the phone's bottom
// sheets and the list pop-ups cannot drift apart.
//
// THE RULE (user, 2026-10-01): a sheet whose NUMBER OF ITEMS changes with what
// the user selects — a filter, a tab, a search — must not resize as they do it.
// It is sized for its LARGEST selection, never shorter than the History sheet,
// never taller than the cap. A sheet whose items do not change simply fits them,
// under the same cap ("no need for a little white-space at the bottom").

/**
 * The tallest a phone sheet may be. Past it the sheet's body scrolls.
 */
export const SHEET_HEIGHT = "85dvh";

/**
 * THE SHORTEST A SHEET WITH A CHANGING LIST MAY BE — the History sheet's own
 * height (416px, measured at 375 wide), so a list of one opens a sheet the size
 * of the one beside it rather than a sliver (user, 2026-10-01: "even though the
 * item is one the height should be similar with the history").
 */
export const SHEET_MIN_HEIGHT = 416;
