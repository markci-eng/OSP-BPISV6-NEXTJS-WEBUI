"use client";

// The compact shape of `ModalForm`, in one place.
//
// `ModalForm` comes out of `osp-ui-kit` sized for a long form: a 56rem shell,
// 24px between its columns, a rule drawn above the footer and a second helping
// of side padding under it. A short form — three or four fields that fit on one
// screen — reads as something rattling around inside a box built for a bigger
// one.
//
// THIS IS A COMPONENT AND NOT A SET OF PROPS. Two dialogs in this module now
// want the same shape, and the moment that was true the answer stopped being a
// style rule copied into each of them. One file owns the measurements; a dialog
// either has this shape or it does not, and there is nothing at a call site to
// set differently from the one beside it.
//
// WHY STYLE RULES AT ALL. `ModalForm` takes no prop for any of it — not the
// width, not the gaps, not the divider, not the footer's padding — and it lives
// in a package, so the only side left to change them from is this one. Every
// other modal form in the app keeps the wide shell and the divider; nothing here
// touches the shared component.

import { Button, Flex } from "@chakra-ui/react";

/**
 * The attribute the rules key on.
 *
 * `CompactModalFormChrome` renders it on the `<style>` tag itself, so the marker
 * and the rules that need it can never be separated — and a dialog that does not
 * render the chrome simply never matches.
 */
const MARKER = "data-compact-modal-form";

/**
 * The measurements. Named because each one is answering something.
 *
 * `WIDTH` — 40rem. Sized off the longest thing a select in one of these has to
 * show closed, which is a mortuary's full name and class, not off the fields,
 * which would fit in far less.
 *
 * `STACK_GAP` — 16px between the fields and the buttons. `ModalForm` uses 24px
 * plus 8px of footer padding, which was sized for the rule that used to be drawn
 * in that space. With the rule gone there is nothing in the gap to justify its
 * width.
 *
 * `COLUMN_GAP` — 12px. 24px reads as two separate groups of fields; these forms
 * pair their columns deliberately (a date beside a date, a period beside a
 * date), and 12px says they belong together while keeping them from touching.
 * The ROW gap is left alone — that one separates things that really are
 * unrelated.
 */
const WIDTH = "40rem";
const STACK_GAP = "1rem";
const COLUMN_GAP = "0.75rem";

/**
 * Drop this inside a `ModalForm` to give it the compact shape.
 *
 * `<style>` is `display: none`, so it is not laid out as a grid item and costs
 * no cell. If a future `ModalForm` changes its DOM and these selectors stop
 * matching, the dialog goes back to the kit's own proportions — the failure is
 * the old look, not a broken one.
 *
 * The mobile fullscreen layout is untouched: a phone is narrower than the width
 * cap, so it never binds there.
 */
export function CompactModalFormChrome() {
  return (
    <style {...{ [MARKER]: "" }}>{`
      .chakra-dialog__content:has([${MARKER}]) { max-width: ${WIDTH}; }
      .chakra-dialog__content:has([${MARKER}])
        .chakra-dialog__body { gap: ${STACK_GAP}; }
      .chakra-dialog__content:has([${MARKER}])
        .chakra-dialog__body > :first-child { column-gap: ${COLUMN_GAP}; }
      .chakra-dialog__content:has([${MARKER}])
        .chakra-dialog__body > .chakra-separator { display: none; }
      .chakra-dialog__content:has([${MARKER}])
        .chakra-dialog__footer { padding-inline: 0; padding-block-start: 0; }
    `}</style>
  );
}

export interface CompactModalFormActionsProps {
  /** The verb on the green button — "Add", "Create Billing". */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The footer for a compact modal form: cancel at one end, the commit at the
 * other.
 *
 * PUSHED TO THE TWO ENDS. `row-reverse` means the FIRST child sits at the right,
 * so the commit keeps the corner it has always had and cancel goes to the far
 * left — the two stop being adjacent buttons one can hit by mistake for the
 * other. On mobile the column stacks and `space-between` has nothing to spread,
 * which is the layout that already shipped.
 *
 * The side padding that used to inset this row lives in
 * `CompactModalFormChrome`: the body already insets everything by 24px and the
 * footer was insetting itself by 24px again, so the buttons stood a full gutter
 * inside the fields. Flush, cancel starts where the first field starts and the
 * commit ends where it ends.
 *
 * `onClick` rather than `type="submit"`: `ModalForm` takes an `onSubmit` prop and
 * does not fire it. Validation still runs — `onConfirm` is react-hook-form's
 * `handleSubmit`. Same call as every other modal form in this app.
 */
export function CompactModalFormActions({
  confirmLabel,
  onConfirm,
  onCancel,
}: CompactModalFormActionsProps) {
  return (
    <Flex
      w="full"
      gap={3}
      justify={{ base: "flex-start", sm: "space-between" }}
      gridColumn={{ base: "span 2", sm: "span 1" }}
      direction={{ base: "column", sm: "row-reverse" }}
    >
      <Button type="button" onClick={onConfirm} w={{ base: "full", sm: "auto" }}>
        {confirmLabel}
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        w={{ base: "full", sm: "auto" }}
      >
        Cancel
      </Button>
    </Flex>
  );
}
