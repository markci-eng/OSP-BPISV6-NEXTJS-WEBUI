"use client";

// The service record's paperwork — what has been submitted, and what is still
// wanting — as a session store.
//
// Same arrangement as `service-payables-store`, and its own file for the same
// reason that one is its own file: the shared PIS data layer is read-only, and
// the documents section needs writes it cannot make there. Nothing is
// persisted; a refresh clears it and the seed shows through again.
//
// WHY THIS IS NOT PART OF `service-payables-store`. That store holds the
// BILLING's writes — creating one, terminating a plan into it — and every
// component that reads it re-renders when a plan is terminated three chapels
// away. The paperwork changes far more often than that (a file added, a
// deficiency raised, a row removed) and nothing outside the documents section
// cares. Two stores, two version counters, two sets of subscribers.
//
// KEYED BY PLAN HOLDER, NOT BY SERVICE. A document belongs to the PERSON — one
// death certificate answers every plan they held — which is the rule the read
// side already follows in `db.getDocuments(personId)`. The deficiencies raised
// against them follow the document, so they are keyed the same way.
//
// THE DEFICIENCY LIST IS DERIVED, NOT STORED. What this holds is the two things
// that cannot be worked out: the deficiencies a user raised BY HAND, and the
// documents they have since submitted. Everything else — which requirements are
// still outstanding — falls out of those two against the requirement list, so
// submitting a document cannot leave a deficiency behind saying it is missing.

import { useSyncExternalStore } from "react";
import { db } from "../../data";
import {
  getRequiredDocuments,
  type ServiceRecord,
} from "./service-payables-data";

/* ------------------------------ model ------------------------------ */

/**
 * A document on file for a plan holder, whichever side it came from.
 *
 * `origin` is what tells a seeded document from one added this session. Both
 * are listed the same way and both can be removed; the difference is only in
 * how the removal is recorded — see {@link removeDocument}.
 */
export interface ServiceDocument {
  /** Stable across renders. Seeded documents use their `docId`. */
  id: string;
  documentCode: string;
  documentDesc: string;
  /**
   * The stored file's name. NEVER absent — a document is a file, and one
   * recorded without it is a claim that something was received with nothing to
   * show for it. The add form requires the attachment; see `AddDocumentDialog`.
   */
  fileName: string;
  /** Where the file can be read — a seed path, or a local `blob:` URL. */
  value: string;
  /** The browser's type for the file, when it came from a picker. */
  mimeType?: string;
  origin: "on-file" | "added";
  /** ISO. Only on documents added this session. */
  addedAtISO?: string;
  addedBy?: string;
}

/**
 * A deficiency raised by hand, for something the requirement list does not
 * cover.
 *
 * Two shapes in one type, which is deliberate. Most deficiencies name a
 * DOCUMENT — a requirement the list does not carry, asked for because this
 * particular service needs it — and those carry a `documentCode`, so submitting
 * that document clears them exactly as it clears a required one. The rest are
 * the special cases with no document behind them at all ("chapel to confirm the
 * date of interment"), and those carry no code and are cleared only by being
 * removed.
 */
export interface ManualDeficiency {
  id: string;
  /** The document being asked for. Empty when this is not about a document. */
  documentCode: string;
  /** What is wanting. The document's description, or free text. */
  description: string;
  /** Optional note from whoever raised it. */
  remarks?: string;
  raisedAtISO: string;
  raisedBy: string;
}

/** A row of the Deficiency list, whichever of the two it came from. */
export interface ServiceDeficiencyItem {
  id: string;
  documentCode: string;
  description: string;
  remarks?: string;
  /**
   * `required` — off the service's requirement list, and outstanding.
   * `manual`   — raised by hand for this plan holder.
   *
   * The list does not sort by this, but it does say which is which: a required
   * one cannot be removed (it is the company's rule, not this user's) and a
   * manual one can.
   */
  source: "required" | "manual";
  raisedAtISO?: string;
  raisedBy?: string;
}

/**
 * A deficiency that HOLDS this service — one that has been raised, as opposed
 * to a requirement that has simply not been met yet.
 *
 * The distinction is the whole point of this type, and it is what the record's
 * actions turn on. A service is held when somebody has said it is: either the
 * source record carries a deficiency against it, or a processor raised one by
 * hand. An unmet item on the requirement CHECKLIST is not that — see
 * {@link getRaisedDeficiencies} for why it deliberately does not count.
 *
 * NOTHING HERE IS EVER A DISCREPANCY. Two of these comments used to say
 * "discrepancy" where the code reads `service.deficiency`, which is the wrong
 * word for the fact and the wrong word for the buttons: everything in this file
 * is something that can be SENT FOR. A discrepancy cannot — see
 * `ServiceDiscrepancy` in `service-payables-data`.
 */
export interface RaisedDeficiency {
  id: string;
  /**
   * `on-record` — the deficiency the service itself carries.
   * `raised`    — put on the plan holder by hand, this session.
   */
  source: "on-record" | "raised";
  /** The document being asked for. Empty when this is not about a document. */
  documentCode: string;
  description: string;
  remarks?: string;
  raisedAtISO?: string;
  raisedBy?: string;
}

/**
 * A notice sent out to the branch that filed the claim.
 *
 * WHAT IT IS ABOUT CHANGED ON 2026-08-25: it is the DISCREPANCY that gets sent
 * now — an account that violates the rules is the one thing on this record
 * somebody outside this department has to be told about, and it is corrected in
 * a module that does not exist yet. A requirement not yet complied with is
 * chased through the documents on the record and interrupts nothing.
 *
 * The shape did not change, and neither did the store it lives in: this is still
 * "the notice sent about this service", one per service, whatever prompted it.
 */
export interface ServiceNotice {
  sentAtISO: string;
  sentBy: string;
  /** The branch it went to — the one that handled the claim. */
  toBranchCode: string;
  /** How many items were on it when it went. One, for a discrepancy. */
  count: number;
}

/**
 * Whoever is signed in. Hard-coded exactly as it is in
 * `service-payables-store` — the signed-in user is not wired into this area
 * yet, and inventing a second placeholder here would be worse than sharing the
 * one that is already wrong.
 */
const ACTING_USER = "JACKIE PANES";

/* ------------------------------ state ------------------------------ */

/** Documents added this session, by person id. */
const addedByPerson = new Map<string, ServiceDocument[]>();

/**
 * Documents removed this session, by person id, as a set of document ids.
 *
 * A tombstone rather than a mutated list, because the seeded ones cannot be
 * deleted — the data layer is read-only. Removing hides the row; a refresh
 * brings it back, which is the honest behaviour for a store that persists
 * nothing.
 */
const removedByPerson = new Map<string, Set<string>>();

/** Deficiencies raised by hand this session, by person id. */
const deficienciesByPerson = new Map<string, ManualDeficiency[]>();

/**
 * Deficiency notices sent this session, by SERVICE id.
 *
 * Keyed by service and not by person, unlike everything else here: a notice
 * goes out about one chapel's service on one billing, and a plan holder with
 * two services would have two of them to send.
 */
const noticeByService = new Map<string, ServiceNotice>();

/** Counter behind the ids this store mints. Never reset. */
let idSeq = 0;

const listeners = new Set<() => void>();

/** Bumped on every write — see the same field in `service-payables-store`. */
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVersion = () => version;
/** Nothing has been added on the server. */
const getServerVersion = () => 0;

/* ------------------------------ writes ------------------------------ */

/**
 * Put a document on file for a plan holder.
 *
 * THE FILE IS REQUIRED, and the type says so. A document type with no file
 * against it is not a document received, it is a deficiency — that distinction
 * is the whole axis this section is organised on, and letting one be recorded
 * without an attachment would put a row in the left-hand column that the right
 * -hand column had every right to still be asking for.
 *
 * The description is looked up rather than passed, so a document added from the
 * Deficiency side and one added from the Documents side cannot end up named two
 * different ways. An ad-hoc code — one with no document type behind it — keeps
 * whatever it was given.
 *
 * Adding a document is also what CLEARS a deficiency: nothing is done here to
 * make that happen, because the deficiency list is derived from the documents
 * on file. See {@link getServiceDeficiencies}.
 */
export function addDocument(
  personId: string,
  input: { documentCode: string; documentDesc?: string; file: File },
): ServiceDocument {
  idSeq += 1;
  const document: ServiceDocument = {
    id: `doc-added-${idSeq}`,
    documentCode: input.documentCode,
    documentDesc:
      db.getDocumentType(input.documentCode)?.documentDesc ??
      input.documentDesc ??
      input.documentCode,
    fileName: input.file.name,
    // Local-only, and only for this tab's lifetime — there is no upload path to
    // the data layer yet. It IS a real URL though, which is what lets the
    // preview show the actual file rather than a description of one. Revoked
    // when the document is removed; see {@link removeDocument}.
    value: URL.createObjectURL(input.file),
    mimeType: input.file.type,
    origin: "added",
    addedAtISO: new Date().toISOString(),
    addedBy: ACTING_USER,
  };

  const list = addedByPerson.get(personId) ?? [];
  addedByPerson.set(personId, [document, ...list]);

  // A document submitted against a hand-raised deficiency answers it, so that
  // deficiency goes rather than being listed beside the file that satisfies it.
  // Derived removal would not do here: a manual deficiency is a row a user
  // created, and leaving it in the store to be filtered out on read would bring
  // it back the moment the document was removed again.
  const raised = deficienciesByPerson.get(personId);
  if (raised) {
    deficienciesByPerson.set(
      personId,
      raised.filter((d) => d.documentCode !== document.documentCode),
    );
  }

  emit();
  return document;
}

/**
 * Take a document off the list.
 *
 * Idempotent, and it works for both origins: one added this session is dropped
 * outright, one off the seed is tombstoned. Either way the requirement it
 * answered goes back to being outstanding, because the Deficiency list is
 * derived from what is left.
 */
export function removeDocument(personId: string, documentId: string) {
  const added = addedByPerson.get(personId);
  const dropped = added?.find((d) => d.id === documentId);
  if (added && dropped) {
    // The object URL is the only thing here the browser holds outside this
    // module, and nothing points at it once the row is gone. Left alone it
    // would pin the file's bytes in memory for the tab's lifetime.
    if (dropped.value.startsWith("blob:")) URL.revokeObjectURL(dropped.value);
    addedByPerson.set(
      personId,
      added.filter((d) => d.id !== documentId),
    );
    emit();
    return;
  }

  const removed = removedByPerson.get(personId) ?? new Set<string>();
  if (removed.has(documentId)) return;
  removed.add(documentId);
  removedByPerson.set(personId, removed);
  emit();
}

/**
 * Raise a deficiency by hand — the special cases the requirement list does not
 * carry.
 *
 * Refuses a duplicate: a code already outstanding, whether required or raised
 * earlier, is not raised twice. Two rows asking for the same document is not a
 * stronger request, it is a list that cannot be cleared in one action.
 *
 * Returns the deficiency, or `null` when it was refused as a duplicate — the
 * caller says so rather than this reporting a success that did not happen.
 */
export function addDeficiency(
  personId: string,
  input: { documentCode: string; description: string; remarks?: string },
): ManualDeficiency | null {
  const list = deficienciesByPerson.get(personId) ?? [];

  // Only codes are checked. A free-text deficiency has no code, and two
  // differently worded special cases are two different things.
  if (
    input.documentCode &&
    list.some((d) => d.documentCode === input.documentCode)
  ) {
    return null;
  }

  idSeq += 1;
  const deficiency: ManualDeficiency = {
    id: `def-${idSeq}`,
    documentCode: input.documentCode,
    description: input.description,
    remarks: input.remarks?.trim() || undefined,
    raisedAtISO: new Date().toISOString(),
    raisedBy: ACTING_USER,
  };

  deficienciesByPerson.set(personId, [...list, deficiency]);
  emit();
  return deficiency;
}

/**
 * Withdraw a hand-raised deficiency.
 *
 * Only the hand-raised ones can go this way. A required document that is still
 * missing is cleared by SUBMITTING it, not by deleting the line that says it is
 * missing — the requirement is the company's, and a list a processor can edit
 * their way out of is not a checklist.
 */
export function removeDeficiency(personId: string, deficiencyId: string) {
  const list = deficienciesByPerson.get(personId);
  if (!list?.some((d) => d.id === deficiencyId)) return;
  deficienciesByPerson.set(
    personId,
    list.filter((d) => d.id !== deficiencyId),
  );
  emit();
}

/**
 * Record that the notice for this service has gone out.
 *
 * Re-sending overwrites, deliberately: a notice is chased, and the useful fact
 * is when it last went rather than when it first did. Nothing actually leaves
 * the system — there is no outbound channel wired into this area — so this is
 * the record of the ACTION, and the UI says so where it reports it.
 */
export function markNoticeSent(
  serviceId: string,
  toBranchCode: string,
  count: number,
): ServiceNotice {
  const notice: ServiceNotice = {
    sentAtISO: new Date().toISOString(),
    sentBy: ACTING_USER,
    toBranchCode,
    count,
  };
  noticeByService.set(serviceId, notice);
  emit();
  return notice;
}

/* ------------------------------ reads ------------------------------ */

/** The last notice sent for this service, if any. */
export function getServiceNotice(
  serviceId: string,
): ServiceNotice | undefined {
  return noticeByService.get(serviceId);
}

/**
 * Every document on file for a plan holder: the seeded ones that have not been
 * removed, then the ones added this session, newest first.
 *
 * Added ones lead because they are what just happened — a user who has this
 * second attached a file looks at the top of the list for it.
 */
export function getServiceDocuments(personId: string): ServiceDocument[] {
  const removed = removedByPerson.get(personId);

  const onFile: ServiceDocument[] = db
    .getDocuments(personId)
    .map((doc) => ({
      id: `doc-${doc.docId}`,
      documentCode: doc.documentCode,
      documentDesc:
        db.getDocumentType(doc.documentCode)?.documentDesc ?? doc.documentCode,
      // The seed stores a path; its last segment is the file as filed.
      fileName: doc.value.split("/").pop() || doc.value,
      value: doc.value,
      origin: "on-file" as const,
    }))
    .filter((doc) => !removed?.has(doc.id));

  return [...(addedByPerson.get(personId) ?? []), ...onFile];
}

/**
 * What is still wanting for this service — the Deficiency list.
 *
 * DERIVED, in this order:
 *
 *   1. the service's required documents with nothing on file against them, and
 *   2. the deficiencies raised by hand for this plan holder.
 *
 * Required first because they are the checklist, and the hand-raised ones are
 * the exceptions hung off the end of it. Submitting a document removes it from
 * (1) on the next read, which is the whole reason this is derived rather than
 * kept: the two lists cannot disagree if only one of them is written down.
 *
 * A hand-raised deficiency naming a document that IS on file is filtered out
 * as well. `addDocument` already clears those, but a document added and then
 * a deficiency raised against it in the other order would otherwise show a row
 * asking for a file that is listed directly above it.
 */
export function getServiceDeficiencies(
  personId: string,
  service?: ServiceRecord,
): ServiceDeficiencyItem[] {
  const onFile = new Set(
    getServiceDocuments(personId).map((doc) => doc.documentCode),
  );

  const required: ServiceDeficiencyItem[] = getRequiredDocuments(service)
    .filter((req) => !onFile.has(req.documentCode))
    .map((req) => ({
      id: `req-${req.documentCode}`,
      documentCode: req.documentCode,
      description: req.documentDesc,
      source: "required" as const,
    }));

  const manual: ServiceDeficiencyItem[] = (
    deficienciesByPerson.get(personId) ?? []
  )
    .filter((d) => !d.documentCode || !onFile.has(d.documentCode))
    .map((d) => ({
      id: d.id,
      documentCode: d.documentCode,
      description: d.description,
      remarks: d.remarks,
      source: "manual" as const,
      raisedAtISO: d.raisedAtISO,
      raisedBy: d.raisedBy,
    }));

  return [...required, ...manual];
}

/**
 * The deficiencies that HOLD this service — what the record's actions turn on.
 *
 * Two sources, and deliberately NOT a third:
 *
 *   1. the deficiency the service carries on record, and
 *   2. the deficiencies raised by hand against this plan holder.
 *
 * THE REQUIREMENT CHECKLIST IS NOT IN HERE, and that is the one judgement call
 * in this function. An outstanding required document is a box not yet ticked;
 * a raised deficiency is somebody saying this cannot be paid. They are
 * different facts and only the second one holds a service.
 *
 * It also could not be the first without breaking the screen: the requirement
 * list is a STAND-IN that starts every service at six outstanding, so counting
 * it would put every service on the queue into a held state and leave the
 * Terminate button unreachable. When a real per-service requirement table
 * lands, whether an unmet requirement holds the service is a rule that comes
 * WITH it — and this is the one line that changes.
 *
 * The service is optional so a caller with only a person can ask for the
 * hand-raised half.
 */
export function getRaisedDeficiencies(
  personId: string,
  service?: ServiceRecord,
): RaisedDeficiency[] {
  const onRecord: RaisedDeficiency[] = service?.deficiency
    ? [
        {
          id: `svc-${service.id}`,
          source: "on-record",
          documentCode: "",
          description: service.deficiency.reason,
          raisedAtISO: service.deficiency.raisedAtISO,
        },
      ]
    : [];

  // Cleared by the document arriving, exactly as they are on the list itself —
  // read through `getServiceDeficiencies` rather than off the map, so the two
  // views of the same rows cannot disagree about which are still outstanding.
  const raised: RaisedDeficiency[] = getServiceDeficiencies(personId, service)
    .filter((d) => d.source === "manual")
    .map((d) => ({
      id: d.id,
      source: "raised" as const,
      documentCode: d.documentCode,
      description: d.description,
      remarks: d.remarks,
      raisedAtISO: d.raisedAtISO,
      raisedBy: d.raisedBy,
    }));

  return [...onRecord, ...raised];
}

/**
 * The document types that can still be added for this person — everything on
 * file already has one, and a type is submitted once.
 */
export function getAddableDocumentTypes(personId: string) {
  const onFile = new Set(
    getServiceDocuments(personId).map((doc) => doc.documentCode),
  );
  return db.getDocumentTypes().filter((t) => !onFile.has(t.documentCode));
}

/**
 * The document types a deficiency can still be raised against: not on file, and
 * not already outstanding on either list.
 *
 * The free-text option is not in here — it is always available, because a
 * special case is by definition not one of these.
 */
export function getRaisableDocumentTypes(
  personId: string,
  service?: ServiceRecord,
) {
  const outstanding = new Set(
    getServiceDeficiencies(personId, service).map((d) => d.documentCode),
  );
  return getAddableDocumentTypes(personId).filter(
    (t) => !outstanding.has(t.documentCode),
  );
}

/**
 * Subscribe a component to this store — the version, which is what re-renders
 * it. Read the lists themselves through the getters above.
 */
export function useServiceDocumentsStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getServerVersion);
}
