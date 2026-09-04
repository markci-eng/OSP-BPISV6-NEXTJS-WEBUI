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
import { db, toFullName } from "../../data";
import {
  DISCREPANCY_KIND_LABELS,
  type ServiceBilling,
} from "./service-payables-data";
import { addManualService } from "./service-payables-store";

/**
 * Whether plan holders may be keyed into this billing by hand.
 *
 * NOT REACHABLE FROM THE WORKSPACE ANY MORE, and the rule is kept for the
 * franchise module rather than for this screen: a franchise that submits on
 * paper has no billing code, so it has no billing in For Process to key anything
 * into. See the franchise note in `service-payables-data`. Every condition below
 * still holds where that module lands.
 *
 * ONLY A MANUAL FRANCHISE. Every other chapel endorses through the system, and
 * a service typed in beside services that arrived on their own is a service with
 * no endorsement behind it — a payable somebody invented. The rules put the
 * manual path exactly where the system cannot reach, and nowhere else.
 *
 * ONLY ONCE THE BILLING HAS BEEN CREATED, which is the order of the franchise
 * process rather than a precaution. Nothing arrives for these chapels through
 * the system, so the processor starts by choosing the mortuary and raising the
 * number — see {@link canCreateBilling} — and only then works down the paper
 * keying LPAs against it. Offering the entry first would invite a stack of plan
 * holders onto a billing that does not exist yet: nothing to post them against,
 * and nothing to void if the billing is never raised.
 *
 * And only before the billing is endorsed to accounting: adding a plan to a
 * billing whose total accounting has already booked is the case the
 * supplementary module exists for, and it is not this.
 */
export function canAddManualService(billing: ServiceBilling): boolean {
  return (
    billing.isManualFranchise && Boolean(billing.billingNo) && !billing.isEndorsed
  );
}

export interface ManualServiceInput {
  lpaNo: string;
  endorsedName: string;
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
      endorsedName: input.endorsedName,
      serviceDateISO: input.serviceDateISO,
      dateOfDeathISO: input.dateOfDeathISO,
      remarks: input.remarks || undefined,
    });

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
          : onFile && onFile !== input.endorsedName
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
        ? `${input.endorsedName} · held on ${billing.billingCode}`
        : `${input.endorsedName} · ${billing.billingCode}`,
    });

    return service;
  };
}
