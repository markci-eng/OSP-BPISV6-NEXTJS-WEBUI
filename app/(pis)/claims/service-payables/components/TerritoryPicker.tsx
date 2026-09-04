"use client";

// The territory the workspace is showing, and how to change it.
//
// It sits at the top of the chapel rail rather than in the page header, because
// it belongs to the list underneath it: changing the territory changes which
// chapels are on screen, and a control that does that should stand on top of
// what it changes.
//
// LABELLED "TERRITORY". The screen this replaces labelled the same dropdown
// "Select Chapel" while listing territories in it — the chapels were the table
// below. That is worth stating plainly rather than quietly copying: the label
// was wrong, and someone comparing the two screens should be able to see that
// the change was deliberate.
//
// Every territory is listed, not only the ones with work. A user who has just
// finished a territory needs to see that the next one is empty; leaving it out
// of the list makes an empty territory indistinguishable from one that does not
// exist, and the count beside each name says which is which before they choose.

import { NativeSelect } from "@chakra-ui/react";
import { CONTROL_HEIGHT } from "../../components/control-height";
import { FieldLabel } from "../../components/field-label";

export interface TerritoryOption {
  territoryCode: string;
  /** e.g. "BICOL TERRITORY". */
  description: string;
  /** Chapels with a billing at the stage being worked. */
  chapelCount: number;
}

export interface TerritoryPickerProps {
  /** The chosen territory's code, or "" when none has been chosen yet. */
  value: string;
  options: TerritoryOption[];
  onChange: (territoryCode: string) => void;
}

/**
 * What the field reads before anything has been chosen.
 *
 * It is a real option rather than a disabled placeholder, so choosing it is a
 * way BACK to the unfiltered page — the same way an "All branches" entry works
 * in the claims queue. A user who opened a territory to look at it should be
 * able to put it down again without editing the URL.
 */
const NONE_LABEL = "Select a territory";

export function TerritoryPicker({
  value,
  options,
  onChange,
}: TerritoryPickerProps) {
  return (
    <>
      <FieldLabel htmlFor="territory-picker">Territory</FieldLabel>

      <NativeSelect.Root size="sm" w="full">
        <NativeSelect.Field
          id="territory-picker"
          aria-label="Territory"
          h={CONTROL_HEIGHT}
          borderRadius="lg"
          bg="white"
          fontSize="xs"
          fontWeight="600"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        >
          <option value="">{NONE_LABEL}</option>
          {options.map((option) => (
            <option key={option.territoryCode} value={option.territoryCode}>
              {option.description} ({option.chapelCount})
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </>
  );
}

export default TerritoryPicker;
