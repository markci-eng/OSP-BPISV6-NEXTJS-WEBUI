// THE CONVEYOR'S TWO COLUMNS — the rail on the left, the record on the right —
// for BOTH conveyors (user, 2026-10-05: "Death and service should have the same
// size of left and right layout … used the length of the service payable").
//
// Death Claim had its own fixed 320px rail and a 20px gap; Service Payables had
// this fluid one and 24px. One constant now, so the two cannot drift again.
//
// FLUID RATHER THAN FIXED: 32% with a 280 floor hands the record column room on
// a narrow desktop with the sidebar out, and on a wide monitor the 360 ceiling
// holds the rail where a list of accounts or claims reads comfortably. See
// `workspace-layout.ts` for the history of the figures.

/** `grid-template-columns` from `lg` up. */
export const CONVEYOR_TRACK = "clamp(280px, 32%, 360px) minmax(0, 1fr)";

/** The gutter between the two. */
export const CONVEYOR_GAP = "24px";

/**
 * The tracks with the rail folded to its icon strip (user, 2026-10-05) — see
 * `RailStrip`. The record column takes back everything the rail gave up.
 */
export const CONVEYOR_TRACK_COLLAPSED = "56px minmax(0, 1fr)";

/**
 * How far left of the rail the spine sits — the line the fold's button is on
 * (see `RailSpine`): its 26px, and 8px of air before the rail.
 *
 * IN THE PAGE'S GUTTER, NOT THE CONVEYOR'S WIDTH (user, 2026-10-05: "the
 * conveyor is still align with the title"). The page row pads its content
 * 44px and the shell 16px more, so there are 60px between the sidebar and the
 * title — measured at 1440 — and the spine hangs into them. Nothing between
 * clips: the first box that does is the shell's scroller, at the sidebar edge.
 */
export const CONVEYOR_SPINE_ROOM = "34px";

/**
 * A screenful, less everything above the conveyor — the rail's bound, and the
 * spine's. Measured in the shell: the header and the page heading put the
 * conveyor's top at 155px on the view a record arrives in. See
 * `CONVEYOR_RAIL_MAX` in `workspace-layout.ts` for the history of the figure.
 */
export const CONVEYOR_VIEW_MAX = "calc(100vh - 156px)";
