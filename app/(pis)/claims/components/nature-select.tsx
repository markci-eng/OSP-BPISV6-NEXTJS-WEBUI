"use client";

// THE NATURE OF THE CLAIM — All, Death, WOI, Dismemberment.
//
// These are the three pages this screen replaces, plus the answer that covers
// them. They were three sidebar entries under one "Death Claim" group and three
// routes; the group was always the honest reading — they are three natures of a
// death claim, not three unrelated modules — and this control is that grouping
// made literal.
//
// IT IS A DROPDOWN ON THE FILTER ROW, where the branch picker used to be. It was
// a card of its own at the top of the rail first, and that was a card and a row
// of tabs spent on a question that is asked once a session and answered "all" —
// while the queue underneath, which is what the column is for, gave up fifty
// pixels for it. A dropdown states its answer in words, costs one slot on a row
// that already exists, and sits beside the other two questions asked of the same
// list.
//
// ALL IS THE DEFAULT, and it is the honest default: a processor opening the page
// has not yet decided which nature they are working, and every claim on the board
// is a claim they might. The three below it narrow to one.
//
// THE LABELS ARE THE SIDEBAR'S. "Death", "WOI", "Dismemberment" are what these
// have been called in the navigation all along, and a user arriving from there
// should not have to work out that "Waiver of Installment" is the thing they used
// to click "WOI" for. The full names still exist, in {@link NATURE_LABEL}, for the
// headings and empty states that have room.

import { NativeSelect } from "@chakra-ui/react";
import { CONTROL_HEIGHT } from "../death-claim/components/DeathClaimsFilter";

/**
 * What the queue is scoped to: one nature of a death claim, or all of them.
 *
 * "Nature" is the word the navigation and the business use for this three-way
 * split. Note it is NOT the `natureOfClaim` on a claim request, which is that
 * record's Special / Regular — a collision inherited from the source model, and
 * the reason nothing user-facing here says the word.
 */
export type ClaimNature = "all" | "death" | "woi" | "dismemberment";

interface NatureOption {
  value: ClaimNature;
  /** The option's own text — the sidebar's wording. */
  label: string;
}

/**
 * All first, as the default and the widest answer. Then Death, and not
 * alphabetically: it is the nature almost every claim is filed under, and the
 * only one with a queue behind it today.
 */
const NATURES: NatureOption[] = [
  { value: "all", label: "All Claims" },
  { value: "death", label: "Death" },
  { value: "woi", label: "WOI" },
  { value: "dismemberment", label: "Dismemberment" },
];

/**
 * The written-out name, for the places that have room for it — the rail's empty
 * state and the work column's.
 */
export const NATURE_LABEL: Record<ClaimNature, string> = {
  all: "All Claims",
  death: "Death Claim",
  woi: "Waiver of Installment",
  dismemberment: "Dismemberment",
};

/** Whether this nature has a module behind it yet. Only death does. */
export function isNatureBuilt(nature: ClaimNature): boolean {
  return nature === "all" || nature === "death";
}

interface NatureSelectProps {
  value: ClaimNature;
  onChange: (value: ClaimNature) => void;
}

export function NatureSelect({ value, onChange }: NatureSelectProps) {
  return (
    // Sized by whatever slot it is put in rather than by itself — in the rail
    // that is a third of a row it shares with the type filter and the funnel.
    // Height and corner match the controls beside it; they all read off
    // `CONTROL_HEIGHT`, which is what keeps the row level.
    <NativeSelect.Root size="sm" w="full">
      <NativeSelect.Field
        aria-label="Claim nature"
        h={CONTROL_HEIGHT}
        borderRadius="lg"
        bg="white"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value as ClaimNature)}
      >
        {NATURES.map((nature) => (
          <option key={nature.value} value={nature.value}>
            {nature.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export default NatureSelect;
