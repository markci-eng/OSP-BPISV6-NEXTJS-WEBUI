"use client";

// Notes on the service record — the processor's own working notes, under their
// own heading between the record and its documents.
//
// THE DEATH CLAIM'S NOTES SECTION, one screen over (`PlanholderRemarks`, as the
// claim detail renders it): the same heading, the same subtitle, the same "Add
// Note" in the heading's action slot, the same read-only panel with "No notes on
// file." in it, and the same sheet to write one. A processor who has used that
// screen should not have to learn this one.
//
// THE SECTION ITSELF IS `RemarksPanel` NOW (2026-08-27), in the claims
// components folder, and this file is what is left once that is taken out: where
// the notes come from, the button that writes one, and the two overlays it opens
// in. It was drawn by hand here for a while — `SectionTitle` and a textarea
// carrying the claim's values, copied — because `PlanholderRemarks` renders
// REMARKS AND NOTES as a PAIR, which a service record cannot use: its remarks
// are the plan holder's and sit under their card, its notes are the processor's
// and sit here. The copy stopped being a copy the moment the Remarks section
// wanted the same panel — see the note on `RemarksPanel`, which that component
// now renders too.
//
// IT IS NOT INSIDE THE FORM, and that is deliberate rather than incidental. The
// service record is a real `<form>` whose submit button is Terminate; a
// `<button>` rendered inside it with no `type` submits it, so an "Add Note"
// control in there would be one careless prop away from terminating a plan.
// Notes are their own section, exactly as they are on the claim.
//
// WRITABLE AFTER TERMINATION, like the documents below it. Terminating closes
// the RECORD — the fields that made the `TblClaimsSP` row go read-only — and a
// note is not part of what was billed. It is most likely to be written after the
// fact, which is when somebody has finally found out why the amount had to be
// typed over.

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Textarea,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import {
  BottomQuickActions,
  ModalForm,
  ModalFormField,
  PrimaryMdButton,
  SecondaryMdButton,
  TertiarySmButton,
} from "osp-ui-kit";
import { RemarksPanel } from "../../components/remarks-panel";
import { toaster } from "../../components/toaster";
import {
  addServiceNote,
  getServiceNotes,
} from "../service-payables-store";
import type { ServiceRecord } from "../service-payables-data";

export interface ServiceRecordNotesProps {
  service: ServiceRecord;
}

export function ServiceRecordNotes({ service }: ServiceRecordNotesProps) {
  // OLDEST FIRST, one to a line — the claim's own arrangement. A note is read
  // as a running log rather than a document, so the order it was written in is
  // the order it is read in.
  const notes = getServiceNotes(service.id);

  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState("");

  /**
   * WHERE THE ADD-NOTE FORM OPENS: a centred modal on anything that is not a
   * phone, the kit's sheet on a phone (user-confirmed 2026-08-26).
   *
   * A sheet is a phone pattern. `BottomQuickActions` comes up from the bottom
   * edge where a thumb is, which is exactly right on a handset and reads as a
   * drawer sliding in from the side on a desktop — a lot of travel, and the
   * focus landing at the far edge of a wide screen, for one textarea and two
   * buttons. A centred box puts the one thing being answered in the middle of
   * where the reader is already looking.
   *
   * MEASURED HERE RATHER THAN HANDED DOWN, which is the opposite of what
   * `ServiceRecordDocuments` does with its `isDesktop` — and for a reason. That
   * prop answers "page or drawer", which turns over at the WORKSPACE's `xl`;
   * this asks "phone or not", which is `md`. A tablet is the case that separates
   * them: it reads the drawer layout and it is not a phone, so it gets the
   * centred box. Borrowing the other flag would have given it the sheet.
   *
   * `?? false` because the hook answers `undefined` on the server and on the
   * first client render. Falling back to the sheet costs nothing here — both
   * overlays start closed, so nothing is on screen to flash.
   */
  const isPhone = !(useBreakpointValue({ base: false, md: true }) ?? false);

  const closeAdd = () => {
    setAddOpen(false);
    setDraft("");
  };

  const saveNote = () => {
    const note = draft.trim();
    if (!note) return;
    addServiceNote(service.id, note);
    closeAdd();
    toaster.create({
      type: "success",
      title: "Note added",
      description: `${service.lpaNo} · recorded in this session only`,
    });
  };

  return (
    <Box>
      {/* THE SHARED PANEL — see `RemarksPanel`, which is this section's heading
          and its bordered read-only body, and the Remarks section above the
          form as well. It was built by hand here first, out of `SectionTitle`
          and a textarea with the claim's own values copied onto it; the moment
          the Remarks section wanted the same thing, the copy became the second
          of three and went into the claims components folder. */}
      <RemarksPanel
        title="Notes"
        subtitle="Internal notes on record"
        // ONE TO A LINE, where remarks are separated by a blank one: a note is
        // a short line in a running log, and a blank line between each would
        // make five of them a page.
        value={notes.join("\n")}
        empty="No notes on file."
        action={
          // Ghost, not solid: a heading control should stay quiet next to the
          // section's own content — the claim's Notes heading uses this one.
          //
          // `type="button"` even out here. This section sits outside the record
          // form today, and the day somebody moves it inside is the day an
          // untyped button starts terminating plans. It costs one attribute.
          <TertiarySmButton type="button" onClick={() => setAddOpen(true)}>
            <LuPlus /> Add Note
          </TertiarySmButton>
        }
      />

      {/* TWO OVERLAYS, BOTH ALWAYS MOUNTED, and at most one of them open — see
          {@link isPhone} for which.

          NEITHER IS MOUNTED CONDITIONALLY, which is the part that matters. An
          overlay unmounted while it is closing can leave `pointer-events: none`
          on <body> and strand the whole page unclickable; rendering one or the
          other on a breakpoint would do exactly that to anyone who resizes with
          the form open. Both stand, `open` decides, and crossing the breakpoint
          mid-write is an ordinary close on one and an ordinary open on the
          other. THE DRAFT IS SHARED STATE, so what was typed survives that. */}

      {/* Not a phone: a centred box. `ModalForm` is this module's own — the
          create-billing dialog is the same component — so a processor meets one
          kind of modal here and not two.

          `confirmation={false}`: the kit otherwise asks "discard?" on the way
          out. That guard is worth it for a billing, which mints a number quoted
          outside this system; for one textarea it is a second dialog in front of
          a decision nobody agonises over, and the note can be typed again. */}
      <ModalForm
        open={addOpen && !isPhone}
        onOpenChange={(details) => {
          if (!details.open) closeAdd();
        }}
        title="Add Note"
        description="Kept with this service record — not part of the billing."
        confirmation={false}
        footer={
          // The create-billing dialog's footer exactly: reversed from `sm` so
          // the primary sits on the right, stacked full-width below that.
          <Flex
            w="full"
            gap={3}
            gridColumn={{ base: "span 2", sm: "span 1" }}
            direction={{ base: "column", sm: "row-reverse" }}
          >
            <Button
              type="button"
              onClick={saveNote}
              disabled={draft.trim().length === 0}
              w={{ base: "full", sm: "auto" }}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeAdd}
              w={{ base: "full", sm: "auto" }}
            >
              Cancel
            </Button>
          </Flex>
        }
      >
        <ModalFormField fullWidth>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write the note…"
            rows={6}
            resize="none"
            bg="white"
            autoFocus
          />
        </ModalFormField>
      </ModalForm>

      {/* A phone: the kit's sheet, which is what the claim's Add Note opens —
          up from the bottom edge where a thumb is, drag to dismiss. Passing
          children puts this form in its body in place of the usual action
          list. */}
      <BottomQuickActions
        open={addOpen && isPhone}
        onOpenChange={(next) => {
          if (!next) closeAdd();
        }}
        title="Add Note"
        subtitle="Kept with this service record — not part of the billing."
      >
        <VStack align="stretch" gap={3}>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write the note…"
            rows={6}
            resize="none"
            bg="white"
            autoFocus
          />
          {/* One row at every width — Cancel on the left, Add on the right. */}
          <Flex align="center" justify="space-between" gap={3}>
            <SecondaryMdButton type="button" onClick={closeAdd}>
              Cancel
            </SecondaryMdButton>
            <PrimaryMdButton
              type="button"
              onClick={saveNote}
              disabled={draft.trim().length === 0}
            >
              Add
            </PrimaryMdButton>
          </Flex>
        </VStack>
      </BottomQuickActions>
    </Box>
  );
}

export default ServiceRecordNotes;
