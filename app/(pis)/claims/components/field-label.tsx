"use client";

// The small uppercase caption that stands over a control in a claims rail —
// "TERRITORY", "STAFF", "BILLING CODES".
//
// ONE DEFINITION, because there were four identical ones. Every picker in the
// service-payables rails had declared its own `chakra("label")` and repeated the
// same seven style props under it, each copy annotated as being the previous
// one's. Four copies of a typography rule is four chances for one of them to
// drift, and the drift is invisible until two of them are on screen together —
// which in a rail they always are.
//
// IT IS NOT `SectionTitle`, and the difference is worth stating because both
// stand over a block of content. A section title NAMES A SECTION and is read as
// a heading: 16px, sentence case, room for a subtitle carrying state. This is a
// FIELD LABEL — the caption on a control, at the size a form label is, and it is
// what the rail's list wears now: the list is the second half of one picker
// (territory, then which billing inside it), so its caption should be the same
// size as the caption on the first half rather than a heading over it.
//
// LABELS A CONTROL WHEN THERE IS ONE TO LABEL. Given `htmlFor` this is a real
// `<label>`, so tapping the word focuses the field and a screen reader reads the
// two as one thing. Without it — over a listbox, which is labelled by its own
// `aria-label` — it renders as a paragraph instead, because a `<label>` pointing
// at nothing is worse than no label element at all.

import type { ReactNode } from "react";
import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

/**
 * A real `<label>` that takes style props.
 *
 * Not `<Text as="label">` or `<Box as="label">`: Chakra's `as` swaps the tag it
 * renders but not the PROPS it accepts, so neither of those will take `htmlFor`.
 * Without it the word and the field are not associated — tapping the label does
 * nothing and a screen reader reads an unlabelled select.
 */
const Label = chakra("label");

/** The same caption with no control under it — see the note at the top. */
const Caption = chakra("p");

/** The typography, in the one place that owns it. */
const STYLE = {
  display: "block",
  fontSize: "10px",
  fontWeight: "700",
  color: "gray.500",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
} as const;

export interface FieldLabelProps {
  children: ReactNode;
  /**
   * The `id` of the control this labels. Given, the element is a real `<label>`;
   * omitted, a paragraph.
   */
  htmlFor?: string;
  /** Space under the label. The pickers' figure, and the default. */
  mb?: HTMLChakraProps<"p">["mb"];
}

export function FieldLabel({ children, htmlFor, mb = 1.5 }: FieldLabelProps) {
  if (htmlFor) {
    return (
      <Label htmlFor={htmlFor} {...STYLE} mb={mb}>
        {children}
      </Label>
    );
  }

  return (
    <Caption {...STYLE} mb={mb}>
      {children}
    </Caption>
  );
}

export default FieldLabel;
