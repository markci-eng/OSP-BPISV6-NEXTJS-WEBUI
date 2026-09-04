"use client";

// A CODE as the value, with what it MEANS on hover — `InfoLabel` for the fields
// whose value is a reference-table key.
//
// WHY THIS EXISTS. Half the facts on a claims detail card are codes: `SA`,
// `FP`, `NAGA`, `B5M10`, `RA5M5`, `DC`. The code is the thing that gets QUOTED —
// written on the paperwork, read down a phone, typed into the source system —
// and the description is what says what it means to somebody who has not
// learned it yet. Showing both ("Serviced - Assigned", "ST.BERNADETTE (B5M10)")
// makes the code hard to pick out and sets the width of a grid column on the
// longest phrase in it; showing the code alone hides the meaning from everyone
// who needs it. The description goes a hover away rather than into the bin.
//
// IT REPLACED FOUR HAND-BUILT COPIES on the service payables plan holder panel
// — Termination Status, Account Status, Branch Code and Plan Code — which is
// what made it a component. Four tooltips written out four times is four places
// for the affordance to drift.
//
// REACHABLE WITHOUT A POINTER, which is most of what is here beyond the tooltip:
//
//   `tabIndex`     makes the value a focus stop, and a focused trigger is what
//                  opens the tooltip on a KEYBOARD and on a TAP. Without it the
//                  description is unreachable on a touch device, which is not a
//                  hover-less inconvenience — it is the fact being gone.
//   `aria-label`   carries BOTH halves, for a reader that will never see either.
//   the underline  a dotted rule and the help cursor. An unmarked two-letter
//                  value is not a thing anyone thinks to point at, and a hover
//                  nobody knows about is a hover nobody uses.
//
// THE COLOUR PASSES THROUGH. Some coded fields are read for whether they say one
// particular code — an account status that is not `FP` is why a plan cannot be
// serviced — and those carry a warning colour. Losing it on the way to a shorter
// value would cost more than the width it saved, so the trigger inherits rather
// than setting its own.
//
// It is the claims area's WHITE tooltip and not the kit's dark chip, the same as
// every other tooltip here — see `tooltip-surface`.

import { Text } from "@chakra-ui/react";
import { Tooltip } from "osp-ui-kit";
import { InfoLabel } from "./info-label";
import { TOOLTIP_SURFACE } from "./tooltip-surface";

export interface TooltipLabelProps {
  /** What the fact is called — `InfoLabel`'s own label. */
  label: string;
  /** The code. This is the VALUE the card shows. */
  code?: string;
  /** What the code means. This is the tooltip. */
  description?: string;
  /**
   * Colour for the value, when it carries one.
   *
   * Inherited by the trigger rather than set on it, so a coded value highlights
   * exactly as the plain `InfoLabel` beside it would.
   */
  color?: string;
}

/**
 * A labelled code whose description is a hover away.
 *
 * DEGRADES TO A PLAIN `InfoLabel` at both ends, and neither is a fallback so
 * much as the right answer for that row:
 *
 *   no code         show the DESCRIPTION plainly. A field with a meaning and no
 *                   key is not a thing to hide behind a hover with nothing to
 *                   hover on — it is a plan whose number did not resolve, where
 *                   the endorsement still names it and the table has no code.
 *   no description  show the CODE plainly. An empty tooltip is a promise the
 *                   underline made and cannot keep.
 *
 * Neither, and `InfoLabel` draws its own dash.
 */
export function TooltipLabel({
  label,
  code,
  description,
  color,
}: TooltipLabelProps) {
  if (!code) return <InfoLabel label={label} value={description} color={color} />;
  if (!description) return <InfoLabel label={label} value={code} color={color} />;

  return (
    <InfoLabel
      label={label}
      color={color}
      value={
        <Tooltip
          content={description}
          openDelay={100}
          closeDelay={100}
          positioning={{ placement: "top-start" }}
          contentProps={TOOLTIP_SURFACE}
        >
          <Text
            as="span"
            tabIndex={0}
            aria-label={`${code} — ${description}`}
            // Inherited throughout, so the value keeps the card's own type and
            // whatever colour the field was given — see the note at the top.
            fontSize="inherit"
            fontWeight="inherit"
            color="inherit"
            cursor="help"
            textDecoration="underline"
            textDecorationStyle="dotted"
            textUnderlineOffset="3px"
            textDecorationColor="gray.300"
          >
            {code}
          </Text>
        </Tooltip>
      }
    />
  );
}

export default TooltipLabel;
