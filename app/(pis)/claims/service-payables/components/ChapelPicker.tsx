"use client";

// The chapel the open service record belongs to, and how to change it.
//
// It stands exactly where `TerritoryPicker` stands in the billing view — at the
// top of the rail, above the list it changes. Same place, one level down: there
// the rail lists a territory's chapels, here it lists a chapel's plan holders,
// and each is topped by the thing that decides what is under it.
//
// WHY THE TERRITORY IS NOT ALSO HERE. By the time a plan holder is open the
// territory is settled and the work is inside it — the only move left that is
// not "another plan holder" is "another chapel in the same territory". Changing
// territory is going back, and the way back is on screen.
//
// Each option is a BILLING, not a chapel: a chapel that reported late has two
// billings in the same territory at the same stage, holding different plan
// holders. Picking the chapel alone would leave which of them ambiguous — so an
// identifier leads, since it is the one string that says chapel AND period.
//
// WHICH IDENTIFIER DEPENDS ON THE STAGE (`lead`), exactly as it does on the
// cards and in the index — see the note at the top of `BillingAccordionCard`,
// which owns the reasoning. On For Process the CODE leads, because most billings
// in that queue have no number yet; past it the NUMBER does, because it is what
// the billing is quoted by everywhere outside this module. A verifier reading
// B26004004 off the card and then meeting BACOLO4MAY26 in the picker beside it
// has to work out that they are the same billing (user, 2026-08-27).
//
// THE VALUE IS THE CODE EITHER WAY. It is the key every part of this module
// identifies a billing by, and `onChange` hands it back unchanged — the lead
// decides what is READ, not what is picked.

import { NativeSelect } from "@chakra-ui/react";
import { CONTROL_HEIGHT } from "../../components/control-height";
import { FieldLabel } from "../../components/field-label";
import type { ServiceBilling } from "../service-payables-data";

export interface ChapelPickerProps {
  /** The open billing's code. */
  value: string;
  /** The billings selectable here — one territory, one stage. */
  options: ServiceBilling[];
  onChange: (billingCode: string) => void;
  /**
   * Which identifier the options are read by. `"code"` is For Process's and the
   * default; `"number"` is every stage after it.
   *
   * A billing asked to lead with a number it has not got falls back to its code,
   * the same fallback the card makes: an option is a thing you have to be able
   * to name, and half a pair is better than a blank.
   */
  lead?: "code" | "number";
}

export function ChapelPicker({
  value,
  options,
  onChange,
  lead = "code",
}: ChapelPickerProps) {
  /**
   * What one option reads as. The chapel follows the identifier in both cases —
   * it is how the billing is RECOGNISED, where the identifier is what it IS.
   */
  const optionLabel = (billing: ServiceBilling) =>
    `${
      lead === "number" && billing.billingNo
        ? billing.billingNo
        : billing.billingCode
    } — ${billing.chapelDesc}`;

  return (
    <>
      {/* THE LABEL NAMES WHAT THE OPTIONS LEAD WITH, and not "Chapel" either
          way. The control picks a BILLING: a chapel that reported a service late
          has two of them in the same month, and "Chapel" could not tell them
          apart. */}
      <FieldLabel htmlFor="chapel-picker">
        {lead === "number" ? "Billing No." : "Billing Code"}
      </FieldLabel>

      <NativeSelect.Root size="sm" w="full">
        <NativeSelect.Field
          id="chapel-picker"
          aria-label="Billing code"
          h={CONTROL_HEIGHT}
          borderRadius="lg"
          bg="white"
          fontSize="xs"
          fontWeight="600"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        >
          {/* No blank option, unlike the territory picker. There, "none chosen"
              is a real state the page can be in; here it is not — a service
              record is always OF a chapel, and un-choosing one would leave
              nothing on the page at all. */}
          {options.map((billing) => (
            <option key={billing.billingCode} value={billing.billingCode}>
              {optionLabel(billing)}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </>
  );
}

export default ChapelPicker;
