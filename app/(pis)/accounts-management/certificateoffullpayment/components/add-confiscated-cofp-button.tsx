"use client";

// Add Confiscated COFP — the toolbar button of the Confiscated Replacement
// list (user, 2026-10-06), in the kit DataTable's `headerActions` slot. ICON
// ONLY, IN A BOX (user, 2026-10-06): the kit's outline icon button with a +,
// squared off — the kit's AddIconButton is locked to a circle. Opens the Add Special COFP dialog without its Preferred
// Branch: finding the planholder is all a confiscated certificate needs.

import { useState, type ReactNode } from "react";
// The kit's own add icon — the one its AddIconButton draws.
import { FiPlus } from "react-icons/fi";
import { SecondaryMdIconButton } from "osp-ui-kit";
import { toast } from "sonner";

import type { CofpSpecialCandidate } from "../data/branches";
import { CofpAddSpecialDialog } from "./add-special-cofp-dialog";

/** What the toolbar button adds — named on the button, dialog and toast. */
export interface CofpAddReplacementCopy {
  /** e.g. "Add Confiscated COFP". */
  title: string;
  subtitle: string;
  /** e.g. "Confiscated COFP" — "… added for <name>". */
  noun: string;
}

const CONFISCATED_COPY: CofpAddReplacementCopy = {
  title: "Add Confiscated COFP",
  subtitle: "Find the planholder whose certificate was confiscated",
  noun: "Confiscated COFP",
};

/** SPFC Replacement's "+" (user, 2026-10-07) — the same button and dialog. */
export const SPFC_REPLACEMENT_COPY: CofpAddReplacementCopy = {
  title: "Add SPFC Replacement",
  subtitle: "Find the planholder whose certificate SPFC is replacing",
  noun: "SPFC replacement",
};

/**
 * The Add Confiscated COFP toolbar button, and the dialog it opens — render
 * `dialog` anywhere on the page. `copy` names it for another list — SPFC
 * Replacement's (user, 2026-10-07).
 */
export function useAddConfiscatedCofp(
  onAdd: (planholder: CofpSpecialCandidate) => void,
  copy: CofpAddReplacementCopy = CONFISCATED_COPY,
): { button: ReactNode; dialog: ReactNode } {
  const [open, setOpen] = useState(false);

  return {
    button: (
      <SecondaryMdIconButton
        aria-label={copy.title}
        title={copy.title}
        // A box, not a circle (user, 2026-10-06).
        rounded="md"
        onClick={() => setOpen(true)}
      >
        <FiPlus />
      </SecondaryMdIconButton>
    ),
    dialog: (
      <CofpAddSpecialDialog
        open={open}
        onOpenChange={setOpen}
        title={copy.title}
        subtitle={copy.subtitle}
        askPreferredBranch={false}
        askRemarks={false}
        onAdd={({ planholder }) => {
          onAdd(planholder);
          toast.success(
            `${copy.noun} added for ${planholder.name} (${planholder.lpaNo}).`,
          );
        }}
      />
    ),
  };
}
