"use client";

// Notes on the service record — the processor's own working notes, under their
// own heading between the record and its documents.
//
// THE DEATH CLAIM'S NOTES SECTION, one screen over (`PlanholderRemarks`, as the
// claim column renders it): the same heading, the same "Add Note" in its action
// slot, the same read-only panel with "No notes on file." in it, and the same
// dialog to write one in. A processor who has used that screen should not have to
// learn this one.
//
// THE SECTION IS `PlanholderRemarks` ITSELF NOW (user, 2026-09-11: "same as the
// design of the component of the death claim"), and this file is what is left
// once that is taken out: where the notes come from, and what is said when one is
// written.
//
// IT WAS THE SAME DESIGN BY HAND BEFORE, WHICH IS THE PROBLEM. This file drew
// `RemarksPanel` with a Notes title and an Add Note button, and then owned two
// overlays to write the note in — a centred `ModalForm` on a desktop and the
// kit's sheet on a phone. The claim's section is the same panel and one centred
// dialog at every width. Two files, one design, and they had already drifted in
// the one place a user would notice: which box the form arrives in.
//
// WHAT `showRemarks={false}` IS FOR. `PlanholderRemarks` renders REMARKS AND
// NOTES as a pair, and a service record cannot use the pair — its remarks are the
// PLAN HOLDER's and sit under their card, its notes are the processor's and sit
// here. That flag is exactly the case the death claim's own column has, which is
// why this is a call to the claim's component rather than a copy of it.
//
// WHAT WAS GIVEN UP is the phone sheet, which came up from the bottom edge where
// a thumb is (user-confirmed 2026-08-26, when this section owned both overlays).
// `asDialog` is centred at every width; on a handset it is a box at
// `100dvw - 24px`, which is the box the claim's processors already write notes in
// on the same handsets. One design across the two screens was the ask, and this
// is the half of it that had to give.
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

import { toaster } from "../../components/toaster";
import { PlanholderRemarks } from "../../planholder/components/PlanholderRemarks";
import { addServiceNote, getServiceNotes } from "../service-payables-store";
import type { ServiceRecord } from "../service-payables-data";

export interface ServiceRecordNotesProps {
  service: ServiceRecord;
}

export function ServiceRecordNotes({ service }: ServiceRecordNotesProps) {
  // OLDEST FIRST, one to a line — the claim's own arrangement. A note is read
  // as a running log rather than a document, so the order it was written in is
  // the order it is read in.
  const notes = getServiceNotes(service.id);

  return (
    <PlanholderRemarks
      // Notes only. The remarks this record shows belong to the PLAN HOLDER and
      // are a section of their own above the form — see the note at the top.
      showRemarks={false}
      // NO SUBTITLE, which is the claim column's own call: "Notes" over
      // "Internal notes on record" is the same word twice, and the panel says
      // what it holds when it is empty.
      showSubtitles={false}
      // A centred dialog rather than the kit's sheet — the claim's gesture.
      asDialog
      // ONE TO A LINE, where remarks are separated by a blank one: a note is a
      // short line in a running log, and a blank line between each would make
      // five of them a page. The claim joins its own with a blank line because
      // a claim note is a paragraph; these are not.
      notes={notes.join("\n")}
      onAddNote={(text) => {
        addServiceNote(service.id, text);
        // THE MODULE'S OWN TOASTER, not the claim's `sonner` — this screen's
        // toasts are the claims toaster's, and the note that a write lives only
        // in this session is a fact about THIS store rather than about the
        // panel that collected the text.
        toaster.create({
          type: "success",
          title: "Note added",
          description: `${service.lpaNo} · recorded in this session only`,
        });
      }}
    />
  );
}

export default ServiceRecordNotes;
