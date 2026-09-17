"use client";

// Keying a plan holder in by hand — the write and the toast — as one hook.
// `use-create-billing`'s shape, for the module's franchise write.
//
// It stays a hook so the toast has somewhere to come from, and it stays in its
// own file so that whichever component opens the form is not also the component
// that owns the write.
//
// THE TOAST REPORTS THE CHECK, not the save. A processor keying twenty plans in
// off a stack of paper does not need twenty confirmations that a row appeared —
// they can see the row. What they cannot see without opening it is whether the
// plan they just entered is one that can actually be paid, and that is the thing
// worth interrupting them for.

import { toaster } from "../components/toaster";
import { db, toFullName, type PersonName } from "../../data";
import {
  DISCREPANCY_KIND_LABELS,
  type ServiceBilling,
} from "./service-payables-data";
import { addManualService } from "./service-payables-store";
import { isFranchiseEntryOpen } from "./use-franchise-billing";

/**
 * Whether plan holders may be keyed into this billing by hand.
 *
 * REACHABLE AGAIN SINCE 2026-09-15 — this is what draws Add Planholder in the
 * conveyor's accounts card. It was written for the archived workspace, kept
 * unreferenced while a paper franchise had nowhere to exist, and adopted
 * unchanged by the intake: the order it describes is exactly the order that path
 * needed. See the franchise note in `service-payables-data`.
 *
 * ONLY A MANUAL FRANCHISE. Every other chapel endorses through the system, and
 * a service typed in beside services that arrived on their own is a service with
 * no endorsement behind it — a payable somebody invented. The rules put the
 * manual path exactly where the system cannot reach, and nowhere else.
 *
 * ONLY ONCE THE BILLING HAS BEEN CREATED, which is the order of the franchise
 * process rather than a precaution. Nothing arrives for these chapels through
 * the system, so the processor starts by choosing the mortuary and raising the
 * number — see `useCreateFranchiseBilling` — and only then works down the paper
 * keying LPAs against it. Offering the entry first would invite a stack of plan
 * holders onto a billing that does not exist yet: nothing to post them against,
 * and nothing to void if the billing is never raised.
 *
 * And only before the billing is endorsed to accounting: adding a plan to a
 * billing whose total accounting has already booked is the case the
 * supplementary module exists for, and it is not this.
 *
 * AND ONLY WHILE THE ENTRY IS OPEN (2026-09-15). This is the condition the whole
 * Close Entry act exists to create — the processor says the stack of hard copies
 * is finished, and from that moment the list is final. Without this line the lock
 * would lock nothing, which is what it did for a few hours: see
 * `isFranchiseEntryOpen`, which is the rule, and `canCloseFranchiseEntry`, which
 * is what turns it off.
 *
 * NOTE THE TWO CONDITIONS THAT NOW OVERLAP. `isManualFranchise` is read off the
 * CHAPEL and was the original gate; `isFranchiseEntryOpen` asks the billing,
 * which is what a paper franchise raised from the intake actually has — a
 * mortuary that may resolve to no chapel at all. Both are kept because they are
 * not the same question: one is "is this the manual path", the other "is it still
 * taking entries".
 */
export function canAddManualService(billing: ServiceBilling): boolean {
  return (
    billing.isManualFranchise &&
    Boolean(billing.billingNo) &&
    !billing.isEndorsed &&
    isFranchiseEntryOpen(billing)
  );
}

export interface ManualServiceInput {
  lpaNo: string;
  /** The deceased as the franchise wrote it, in the two parts it was typed in. */
  deceased: PersonName;
  serviceDateISO: string;
  dateOfDeathISO: string;
  remarks: string;
}

export function useAddManualService() {
  return (billing: ServiceBilling, input: ManualServiceInput) => {
    const service = addManualService({
      billingCode: billing.billingCode,
      chapelCode: billing.chapelCode,
      lpaNo: input.lpaNo,
      deceased: input.deceased,
      serviceDateISO: input.serviceDateISO,
      dateOfDeathISO: input.dateOfDeathISO,
      remarks: input.remarks || undefined,
    });

    // What was typed, read out for the comparison below and the toast. The
    // parts are what is stored — see `ManualService`.
    const endorsedName = toFullName(input.deceased);

    // Re-derived rather than read back off the billing: the caller's `billing`
    // is the one from before this write, and asking it about a service it does
    // not yet know about would always answer nothing.
    const planholder = db.getPlanholder(input.lpaNo);
    const onFile = planholder?.name ? toFullName(planholder.name) : undefined;

    // The unfound plan reads as what it is — a DEFICIENCY, the plan holder's ID
    // waiting to be confirmed — while the three below are discrepancies, which
    // is why only they carry a kind label. See `unresolvedPlanDeficiency`.
    const held = !planholder
      ? "plan holder's ID not confirmed"
      : planholder.serviceBlock === "rop"
        ? DISCREPANCY_KIND_LABELS.ROP
        : planholder.serviceBlock === "not-paid"
          ? DISCREPANCY_KIND_LABELS.UNPAID
          : onFile && onFile !== endorsedName
            ? DISCREPANCY_KIND_LABELS.NAME
            : undefined;

    toaster.create({
      // A held plan is not a failure — the row went in and the entry is kept —
      // but it is not done either, so it does not get the green tick.
      type: held ? "warning" : "success",
      title: held
        ? `${input.lpaNo} added — ${held.toLowerCase()}`
        : `${input.lpaNo} added`,
      description: held
        ? `${endorsedName} · held on ${billing.billingCode}`
        : `${endorsedName} · ${billing.billingCode}`,
    });

    return service;
  };
}
