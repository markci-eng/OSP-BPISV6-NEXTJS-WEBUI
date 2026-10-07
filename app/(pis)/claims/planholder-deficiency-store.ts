// THE DEATH CLAIM'S DEFICIENCY EDITS — what a processor removed from the
// derived list, and what they raised by hand on top of it (user, 2026-10-01:
// "make the deficiencies removable in death claim too", and a way to add one).
//
// The list itself stays DERIVED — every document type with no file against it,
// see `getOutstandingDocumentTypes`. This store holds only the two edits laid
// over it, the same pair the service record keeps in `service-documents-store`:
//
//   waived   a derived requirement withdrawn — a tombstone by document code,
//            because the derived list cannot be deleted from.
//   raised   a deficiency added by hand — a document type, or a special case
//            with no document behind it.
//
// PER PERSON, like the list it edits — see the note on
// `getOutstandingDocumentTypes` for why it is not per claim yet. Session-only:
// there is no write path to the data layer.

import { useSyncExternalStore } from "react";

/** Whoever is signed in — hard-coded, as in `service-documents-store`. */
const ACTING_USER = "JACKIE PANES";

export interface RaisedDeficiency {
  id: string;
  /** Empty for a special case with no document behind it. */
  code: string;
  description: string;
  remarks?: string;
  raisedAtISO: string;
  raisedBy: string;
}

const waivedByPerson = new Map<string, Set<string>>();
const raisedByPerson = new Map<string, RaisedDeficiency[]>();

let idSeq = 0;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ writes ------------------------------ */

/** Withdraw a derived requirement for this person. */
export function waiveDocumentType(personId: string, code: string) {
  const waived = waivedByPerson.get(personId) ?? new Set<string>();
  if (waived.has(code)) return;
  waived.add(code);
  waivedByPerson.set(personId, waived);
  emit();
}

/**
 * Raise a deficiency by hand. A type that was waived comes back this way, as a
 * hand-raised row — the service record's rule. Returns `null` for a duplicate
 * of one already raised.
 */
export function raiseDeficiency(
  personId: string,
  input: { code: string; description: string; remarks?: string },
): RaisedDeficiency | null {
  const list = raisedByPerson.get(personId) ?? [];
  if (input.code && list.some((d) => d.code === input.code)) return null;

  idSeq += 1;
  const raised: RaisedDeficiency = {
    id: `raised-${idSeq}`,
    code: input.code,
    description: input.description,
    remarks: input.remarks?.trim() || undefined,
    raisedAtISO: new Date().toISOString(),
    raisedBy: ACTING_USER,
  };
  raisedByPerson.set(personId, [...list, raised]);
  emit();
  return raised;
}

/** Withdraw a hand-raised deficiency. */
export function withdrawRaisedDeficiency(personId: string, id: string) {
  const list = raisedByPerson.get(personId);
  if (!list?.some((d) => d.id === id)) return;
  raisedByPerson.set(
    personId,
    list.filter((d) => d.id !== id),
  );
  emit();
}

/* ------------------------------ reads ------------------------------ */

export function getWaivedDocumentCodes(personId: string): ReadonlySet<string> {
  return waivedByPerson.get(personId) ?? new Set<string>();
}

export function getRaisedDeficiencies(personId: string): RaisedDeficiency[] {
  return raisedByPerson.get(personId) ?? [];
}

/** Subscribe a component — the version is what re-renders it. */
export function usePlanholderDeficiencyStore(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}
