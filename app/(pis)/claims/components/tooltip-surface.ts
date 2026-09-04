// The claims area's tooltip surface: a white card, not the kit's dark chip.
//
// WHY WHITE. The kit's tooltip is a dark slab with white type, which is right
// for a one-line hint — "Copy", "Sort ascending" — and wrong for everything
// this area puts in one. A discrepancy tooltip carries a heading and a reason,
// sometimes a list of them, and the second line is the whole point of opening
// it; at 10px, muted, on near-black, it is the line that disappears. Every
// other surface in this area that holds two levels of type is white with a hair
// of border, and reading them is not a matter of angle and screen brightness.
//
// The figures are the DASHBOARD'S, taken from the chart tooltips on the claims
// dashboard — 10px radius, a #F3F4F6 hairline, a soft 16px shadow. Those were
// already the one white tooltip in this area, so this is not a new look being
// introduced; it is the existing one being reused where the kit's default had
// been left in place.
//
// It carries no colour of its own for the CONTENT. A tooltip on a white card
// inherits nothing useful, so whatever is put inside must set its own type
// colours — see the discrepancy marks in `ChapelBillingList` and
// `PlanholderServiceList`, which is the only thing that renders into it today.

import type { TooltipProps } from "osp-ui-kit";

/**
 * Spread into a `Tooltip`'s `contentProps`, with whatever else that particular
 * tooltip needs after it:
 *
 * ```tsx
 * contentProps={{ ...TOOLTIP_SURFACE, maxW: "240px" }}
 * ```
 */
export const TOOLTIP_SURFACE: TooltipProps["contentProps"] = {
  bg: "white",
  // Explicit, because the kit's dark default sets a light one and a tooltip
  // that inherited it would be white on white.
  color: "gray.800",
  borderWidth: "1px",
  borderColor: "#F3F4F6",
  borderRadius: "10px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  px: 3,
  py: 2.5,
};

export default TOOLTIP_SURFACE;
