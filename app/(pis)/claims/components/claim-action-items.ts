// WHAT YOU CAN DO TO A CLAIM — the list, with no opinion about where it is
// drawn or what the buttons do.
//
// Lifted out of the plan holder's claim detail so a second screen can show the
// same row without copying it. This is the same move `ActionButtonRow` was
// extracted for, one level up: that shared the button, this shares the set. Two
// screens each holding their own array is two screens that quietly disagree
// about whether "Denial Letter" is a claim action the first time somebody adds
// one — and the one that disagrees is always the one nobody was looking at.
//
// NO HANDLERS HERE, on purpose. `Verify` means the same thing on every screen;
// what happens when it is pressed does not, because each screen has its own
// sheets to open and its own idea of what to do afterwards. The caller binds
// `onClick` by label — which is why the three labels that DO something are
// exported as constants rather than written out at the comparison.

import {
  LuBadgeCheck,
  LuEye,
  LuFilePlus,
  LuFileX,
  LuPencil,
  LuPrinter,
  LuSend,
  LuTrash2,
} from "react-icons/lu";
import type { ActionButtonItem } from "@/components/primitives/ActionButtons";

/** An entry in the "More" sheet, before its onClick is bound to the claim. */
export type ClaimAction = Omit<
  Extract<ActionButtonItem, { type?: "action" }>,
  "onClick"
>;

export const ENDORSE_ACTION = "Endorse";
export const VERIFY_ACTION = "Verify";
export const EDIT_ACTION = "Edit";
/**
 * Named like the three above even though nothing handles it yet, because it is
 * the label CALLERS select on: the conveyor keeps Delete in its overflow menu
 * rather than on a button, and matching "Delete" as a string literal at the
 * place that decides is how a rename here silently stops matching there.
 */
export const DELETE_ACTION = "Delete";

/**
 * The most-used claim actions. They apply to the whole claim, not to any one
 * section, and appear twice: as the button row, and as the first entries in the
 * "More" sheet. Print and Delete are not wired yet; the rest are.
 */
export const PRIMARY_CLAIM_ACTIONS: ClaimAction[] = [
  { label: "Print", icon: LuPrinter, description: "Print this claim" },
  {
    label: EDIT_ACTION,
    icon: LuPencil,
    description: "Correct the claim's details",
  },
  {
    label: DELETE_ACTION,
    icon: LuTrash2,
    description: "Remove this claim",
    iconBg: "#fdeaea",
    iconColor: "#c53030",
  },
  {
    label: VERIFY_ACTION,
    icon: LuBadgeCheck,
    description: "Mark the claim verified",
  },
  {
    label: ENDORSE_ACTION,
    icon: LuSend,
    description: "Send the claim onward",
  },
];

/**
 * The remaining legacy PISv5 toolbar actions. They don't earn a button of their
 * own, so they only appear behind "More". None are wired to a back end yet, so
 * each one says so rather than failing silently.
 */
export const MORE_CLAIM_ACTIONS: ClaimAction[] = [
  { label: "Preview", icon: LuEye, description: "Open the claim as printed" },
  { label: "Reprint", icon: LuPrinter, description: "Print another copy" },
  // No "Notes" entry. It opened nothing the screens do not already have: the
  // Notes section writes a note from its own heading, which is the same action
  // arrived at by reading what is already on file first.
  {
    label: "Edit Nature of Claim",
    icon: LuPencil,
    description: "Change how this claim is classified",
  },
  {
    label: "Create QuitClaim",
    icon: LuFilePlus,
    description: "Draft the quit claim document",
  },
  {
    label: "Print QuitClaim",
    icon: LuPrinter,
    description: "Print the quit claim document",
  },
  {
    label: "Denial Letter",
    icon: LuFileX,
    description: "Issue a denial letter for this claim",
    iconBg: "#fdeaea",
    iconColor: "#c53030",
  },
];
