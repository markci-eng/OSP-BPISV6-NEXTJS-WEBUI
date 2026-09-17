"use client";

// Saving a service record — the write, the termination and the toast — as one
// hook. `use-create-billing`'s shape, for the module's other write.
//
// It stays a hook so the toast has somewhere to come from, and it stays in its
// own file so that whichever component draws the form is not also the component
// that owns the write.

import { toaster } from "../components/toaster";
import {
  DISCREPANCY_HOLDS_TERMINATION,
  deceasedName,
  type ServiceBilling,
  type ServiceRecord,
} from "./service-payables-data";
import {
  saveServiceRecord,
  type ServiceRecordDetails,
} from "./service-payables-store";

/**
 * Whether saving this record may also terminate the plan into its billing.
 *
 * TWO conditions, and each fails for its own reason and is answered its own way
 * — which is why {@link terminationBlocker} exists beside this to say which one
 * it was:
 *
 *   no billing number  nothing for a terminated plan to be posted against.
 *                      Answered by creating the billing.
 *   a discrepancy      AN ACCOUNT THAT VIOLATES THE RULES AND SHOULD NOT HAVE
 *                      BEEN SERVED. Answered by correcting a record, somewhere
 *                      outside this module — nothing can be sent for.
 *
 * A DEFICIENCY WAS THE THIRD AND IS NOT ANY MORE (2026-08-25). A requirement not
 * yet complied with is a chase, not a verdict: the user's own example is that a
 * missing copy of the LPA is not grave, and it has no business stopping a plan
 * being terminated or keeping a chapel's payable out of the billing. The notice
 * still goes to the branch — see `RecordActions` — and the plan is terminated
 * meanwhile.
 *
 * Neither of the two holds up the OTHER plan holders on the billing either — the
 * rest are processed without waiting, which is what the billing's own completion
 * rule says. The record itself saves either way; only the termination waits.
 */
export function canTerminateInto(
  billing: ServiceBilling,
  service: ServiceRecord,
): boolean {
  return terminationBlocker(billing, service) === undefined;
}

/** Why the plan cannot be terminated yet, in the order it has to be answered. */
export function terminationBlocker(
  billing: ServiceBilling,
  service: ServiceRecord,
): string | undefined {
  if (!billing.billingNo) return "The billing has not been created yet";
  // A DISCREPANCY NO LONGER HOLDS THE TERMINATION (2026-09-15) — see
  // {@link DISCREPANCY_HOLDS_TERMINATION}, which is where the rule it suspends
  // and the reason are written down. The condition is kept behind the flag
  // rather than deleted: the rule was confirmed twice and is waiting on a module
  // that does not exist yet, not overturned.
  if (DISCREPANCY_HOLDS_TERMINATION && service.discrepancy) {
    return service.discrepancy.reason;
  }
  return undefined;
}

/**
 * Returns a function that saves the record the form collected, and announces
 * what happened.
 *
 * The two outcomes are announced as two different things, because they ARE two
 * different things — the button is called "Terminate", and when it could not
 * terminate a toast reading "terminated" would be the one place a user checks
 * telling them the opposite of the truth. So the headline is the outcome that
 * actually occurred, and the plan number is in it either way.
 */
export function useSaveServiceRecord() {
  return (
    billing: ServiceBilling,
    service: ServiceRecord,
    details: ServiceRecordDetails,
  ) => {
    const terminate = canTerminateInto(billing, service);
    // WHAT THE TERMINATION IS WRITTEN AGAINST — the identity half of the
    // `TblClaimsSP` row. The form supplies the rest; see `ServiceTarget`.
    const saved = saveServiceRecord(
      {
        serviceId: service.id,
        lpaNo: service.lpaNo,
        billingNo: billing.billingNo ?? "",
        claimNo: service.claimNo,
        contractNo: service.contractNo,
        servicingChapel: service.chapelCode,
        natureCode: service.natureCode,
      },
      details,
      terminate,
    );

    toaster.create({
      type: "success",
      title: terminate
        ? `Plan ${service.lpaNo} terminated`
        : `Service record saved for ${service.lpaNo}`,
      description: terminate
        ? `${deceasedName(service)} · into ${billing.billingNo}`
        : `${deceasedName(service)} · ${billing.billingCode} — not terminated`,
    });

    return saved;
  };
}
