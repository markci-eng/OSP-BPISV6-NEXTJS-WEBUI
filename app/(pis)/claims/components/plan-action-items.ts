// WHAT YOU CAN DO TO A PLAN — the list, with no opinion about where it is drawn
// or what the buttons do.
//
// The companion to `claim-action-items`, and extracted for the same reason: this
// set was already written out twice, once for the profile's button row and once
// for the header's "More" sheet, and a third screen was about to make it three.
// The row happened to drop the descriptions, which is how two copies of a list
// start to differ before anyone notices they are meant to be one.
//
// NO HANDLERS HERE. None of the three is wired to a back end yet, and what a
// caller does about that — a toast, a dialog, nothing — is the caller's.

import { LuClipboardCheck, LuPrinter, LuRotateCcw } from "react-icons/lu";
import type { ActionButtonItem } from "@/components/primitives/ActionButtons";

/** An entry in the "More" sheet, before its onClick is bound to the plan. */
export type PlanAction = Omit<
  Extract<ActionButtonItem, { type?: "action" }>,
  "onClick"
>;

/**
 * The whole-plan actions — the legacy PISv5 toolbar operations that apply to
 * the plan itself rather than to any one section down the page.
 */
export const PLAN_ACTIONS: PlanAction[] = [
  {
    label: "Print SOA",
    icon: LuPrinter,
    description: "Print the statement of account",
  },
  {
    label: "Cancel Plan Termination",
    icon: LuRotateCcw,
    description: "Reverse the termination filed on this plan",
  },
  {
    label: "Consider Plan",
    icon: LuClipboardCheck,
    description: "Consider this plan for the claim",
  },
];
