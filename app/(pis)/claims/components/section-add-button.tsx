"use client";

// A SECTION'S "+ ADD …" CONTROL, in the two places it lives — option A of the
// mock-up (user, 2026-10-02, for Notes and Payee's Information).
//
// ON A DESKTOP it is the quiet ghost button in the heading's action slot, as it
// always was. ON A PHONE that button sat at the far right of the screen, about
// 90 × 32px, exactly where a thumb has to aim — so below `lg` it moves to the
// FOOT of the section as a full-width 44px outline button, reached after
// reading what is already there, and anywhere across the screen counts.
//
// TWO EXPORTS, ONE CONTROL. A section renders both: `SectionAddAction` in its
// heading and `SectionAddFoot` after its content. CSS picks which one shows,
// not `useBreakpointValue` — that hook answers `undefined` on the first render
// and can go stale after a viewport change, and a button that is briefly in
// neither place is worse than either.
//
// The kit's own buttons, geometry only: `TertiarySmButton` is the heading
// control every claims section uses, `SecondarySmButton` the outline the rail
// uses for an entry beside a commit. Never their colours.

import { Box } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { SecondarySmButton, TertiarySmButton } from "osp-ui-kit";

export interface SectionAddButtonProps {
  /** The words after the plus — "Add Note", "Add Payee". */
  label: string;
  onClick: () => void;
}

/** The heading's control. Desktop only — see the note at the top. */
export function SectionAddAction({ label, onClick }: SectionAddButtonProps) {
  return (
    <Box display={{ base: "none", lg: "inline-flex" }}>
      <TertiarySmButton onClick={onClick}>
        <LuPlus /> {label}
      </TertiarySmButton>
    </Box>
  );
}

/** The phone's control, at the section's foot. Phone only. */
export function SectionAddFoot({ label, onClick }: SectionAddButtonProps) {
  return (
    <Box display={{ base: "block", lg: "none" }} mt={3}>
      <SecondarySmButton w="full" h="44px" minH="44px" onClick={onClick}>
        <LuPlus /> {label}
      </SecondarySmButton>
    </Box>
  );
}
