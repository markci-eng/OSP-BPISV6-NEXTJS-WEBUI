"use client";

// The plan holder search at the head of a Service Payables rail.
//
// WHAT IT IS FOR. Every finding aid in this module works top-down — pick a
// territory, pick a billing, then read down its plan holders — and that is the
// wrong shape for the one question a processor arrives with a name in hand for:
// "which billing is this person on?" Answering it today means opening territories
// until the name turns up. The rail's other controls narrow the QUEUE; this one
// is meant to go straight to a PERSON.
//
// DISPLAY ONLY, DELIBERATELY (2026-08-26). It takes a query and holds it, and
// nothing downstream reads it yet — the lookup itself is a separate piece of
// work. It is in the rail now so the placement is settled and reviewed against
// the real layout rather than against a sketch, and so the seam the search will
// be wired into already exists.
//
// The seam is `value`/`onChange`: pass them and the field is controlled by the
// page, which is what the search will need in order to filter anything. Left
// off, it keeps the query itself and the field is inert but typeable — which is
// exactly what "for display" means here, rather than a dead box that eats
// keystrokes.
//
// IT IS THE AREA'S OWN FIELD (`SearchBar`), not a second one built to look like
// it — at `sm`, which is `CONTROL_HEIGHT`, so it stands level with the pickers
// underneath it. No magnifier BUTTON: `SearchBar`'s own note says a search with
// nothing to run should not draw a pressable one, and there is nothing to run.

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { FieldLabel } from "../../components/field-label";
import { SearchBar } from "../../components/search-bar";

/**
 * What the field asks for.
 *
 * BOTH KEYS, because a processor holds one or the other and not reliably the
 * same one: the name is what a chapel's paperwork carries, the LPA number is
 * what the system quotes back. A placeholder naming only one of them reads as a
 * rule about what may be typed.
 */
const PLACEHOLDER = "Search plan holder or LPA No.";

export interface PlanholderSearchFieldProps {
  /**
   * The query, when the PAGE owns it. Omitted, the field holds its own — see
   * the note at the top on the seam this pair is.
   */
  value?: string;
  onChange?: (value: string) => void;
  /** Space under the field. The rails' figure between stacked controls. */
  mb?: number;
}

export function PlanholderSearchField({
  value,
  onChange,
  mb = 4,
}: PlanholderSearchFieldProps) {
  // Only ever read when the page has not passed a value. Declared
  // unconditionally because hooks must be.
  const [query, setQuery] = useState("");
  const controlled = value !== undefined;

  return (
    // `flexShrink: 0` — the rail is a bounded flex column on a desktop and only
    // its list may give. A search field that squashed to fit a short screen
    // would be the one control in the column that cannot be read.
    <Box flexShrink={0} mb={mb}>
      {/* A CAPTION, not a `<label for>`. `SearchBar` spreads its rest props
          onto the bordered Flex around the input, not onto the input, so an
          `htmlFor` here would point at a div and associate nothing. The input
          carries its own `aria-label` — the same arrangement `FieldLabel`
          documents for the rails' listboxes. */}
      <FieldLabel>Plan Holder</FieldLabel>
      <SearchBar
        size="sm"
        placeholder={PLACEHOLDER}
        label="Search plan holder"
        value={controlled ? value : query}
        onChange={controlled ? (onChange ?? (() => {})) : setQuery}
      />
    </Box>
  );
}

export default PlanholderSearchField;
