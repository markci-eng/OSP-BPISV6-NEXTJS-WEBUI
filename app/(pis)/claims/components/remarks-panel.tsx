"use client";

// A run of recorded text under its own heading — Remarks, Notes, and anything
// else in claims that is READ as a trail rather than edited as a field.
//
// THE DEATH CLAIM'S SECTION, extracted (user, 2026-08-27). The claim detail has
// drawn Remarks and Notes this way since it was built — heading, subtitle, and
// one bordered read-only panel holding the whole trail — and every other place
// that wanted the same thing has been copying it. The service record had two
// such copies going in opposite directions: its Notes had been rebuilt by hand
// out of `SectionTitle` and a textarea, and its Remarks were not this shape at
// all, just a run of `<Text>` lines at the bottom of the plan holder's card.
//
// ONE COMPONENT, BECAUSE THEY ARE ONE DESIGN. Remarks and Notes differ in what
// they hold and who writes them, and in nothing a reader can see: same heading,
// same panel, same empty line, and the only chrome either has ever needed is a
// control in the heading's action slot for the one that can be written to. So
// what varies is passed in and what is shared is here.
//
// A TEXTAREA AND NOT A LIST, which is the claim's shape and worth keeping for
// the empty state alone: a bordered panel saying "No remarks on file." reads as
// somewhere remarks GO, where an empty list reads as a section that failed to
// load. It is read-only in every use so far — writing goes through a form
// somewhere else, and lands back here as another line — but nothing here would
// stop a caller making it live.
//
// WHY IT IS NOT `PlanholderRemarks`. That component renders Remarks and Notes as
// a PAIR, which is right on a claim, where both belong to the claim. It is wrong
// wherever the two belong to different things — on the service record the
// remarks are the PLAN's account history and the notes are the processor's own,
// so they sit in different places on the page and cannot be one block. So the
// SECTION is here and the pair stays there: `PlanholderRemarks` renders two of
// these and keeps the sheet that writes a note, which is all it ever was on top
// of them.
//
// THE THREE CALLERS AGREE TO THE PIXEL, and that was measured rather than
// assumed before they were pulled together — 5 rows, 114px, #fafafa on #e4e4e7,
// the heading a `SectionTitle` with a title and a subtitle in it. Anything that
// changes here changes the claim, the plan holder profile and the service record
// at once, which is the point.

import type { ReactNode } from "react";
import { Box, Textarea } from "@chakra-ui/react";
import { SectionTitle } from "./section-title";

export interface RemarksPanelProps {
  /** The heading — "Remarks", "Notes". */
  title: string;
  /** The line under it: what this trail IS, in a few words. */
  subtitle?: string;
  /**
   * The trail itself, as one block of text.
   *
   * A STRING AND NOT A LIST, so the caller decides what separates one entry from
   * the next — the claim joins its remarks with a blank line between them, a
   * running log of notes goes one to a line. Joining here would impose one of
   * those on both.
   */
  value: string;
  /** What stands in the empty panel. "No remarks on file." */
  empty: string;
  /**
   * A control in the heading, at the far right — "Add Note" and the like. The
   * panel is a reading; anything that WRITES to it belongs to the caller, which
   * is the only thing that knows what is being written against.
   */
  action?: ReactNode;
  /**
   * How tall the panel stands, in rows. Five is the claim's, and enough to show
   * that a trail continues below without giving a whole screen to a section that
   * is usually skimmed.
   */
  rows?: number;
}

export function RemarksPanel({
  title,
  subtitle,
  value,
  empty,
  action,
  rows = 5,
}: RemarksPanelProps) {
  return (
    <Box>
      <SectionTitle title={title} subtitle={subtitle} action={action} />

      {/* THE CLAIM'S PANEL, value for value. `cursor: default` and the tamed
          focus ring are what keep a read-only textarea from offering to be
          typed in: without them it takes a caret and a blue ring on click, and
          a reader who has just clicked into what looks like an input has to
          work out why nothing happens when they type. */}
      <Textarea
        value={value}
        readOnly
        placeholder={empty}
        rows={rows}
        resize="none"
        bg="gray.50"
        color="gray.700"
        borderColor="gray.200"
        cursor="default"
        _focusVisible={{ borderColor: "gray.300", boxShadow: "none" }}
      />
    </Box>
  );
}

export default RemarksPanel;
