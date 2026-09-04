"use client";

// Whose billings the Processed workspace is showing, and how to change it.
//
// {@link TerritoryPicker}'s counterpart, and built to the same recipe on
// purpose: same slot at the top of the rail, same label style, same "(n)" after
// each entry, same real "none" option that puts the filter down again. The two
// pages are the same shape one stage apart, and the only thing that should
// differ between their rails is WHAT is being picked.
//
// WHY A PERSON AND NOT A TERRITORY. Once a billing is processed, where it sits
// has stopped being the question — it has a number, its plans are terminated,
// and the fact worth carrying is who put it through. That is the same cut the
// dashboard makes on this stage ("Processed by"), so arriving here from one of
// those cards lands on a list already grouped the way it was chosen.
//
// LABELLED "STAFF" though everything under it says "processor". The model's word
// is `processedBy` and the dashboard's column header is "Processor"; the word
// the people who work this screen use for each other is staff. The label is for
// them, and the code keeps the model's term so there is no second vocabulary to
// keep in step.
//
// Every name is listed, not only the ones with work — see `getProcessorOptions`
// for why, which is the reason the territory picker lists empty territories.

import { NativeSelect } from "@chakra-ui/react";
import { CONTROL_HEIGHT } from "../../components/control-height";
import { FieldLabel } from "../../components/field-label";
import type { ProcessorOption } from "../service-payables-data";

export interface ProcessorPickerProps {
  /** The chosen person's name, or "" when none has been chosen yet. */
  value: string;
  options: ProcessorOption[];
  onChange: (processor: string) => void;
}

/** What the field reads before anything has been chosen. */
const NONE_LABEL = "Select a staff";

export function ProcessorPicker({
  value,
  options,
  onChange,
}: ProcessorPickerProps) {
  return (
    <>
      <FieldLabel htmlFor="processor-picker">Staff</FieldLabel>

      <NativeSelect.Root size="sm" w="full">
        <NativeSelect.Field
          id="processor-picker"
          aria-label="Staff"
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
            <option key={option.processor} value={option.processor}>
              {option.processor} ({option.billingCount})
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </>
  );
}

export default ProcessorPicker;
