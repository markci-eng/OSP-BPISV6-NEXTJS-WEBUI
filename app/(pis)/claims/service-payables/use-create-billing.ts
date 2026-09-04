"use client";

// Creating a billing — the write and the toast — as one hook.
//
// What it no longer does is ASK. It used to raise a confirmation dialog; the
// question is now a form (`CreateBillingDialog`), because creating a billing
// takes a CV number, a date and a mortuary as well as a yes. The hook is what
// that form calls once it has them.
//
// It stays a hook rather than a plain function so the toast has somewhere to
// come from, and it stays in its own file so that whichever component opens the
// form is not also the component that owns the write.
//
// Note that this hook does NOT decide whether the action should be offered. That
// is {@link canCreateBilling}, which the caller asks before drawing anything.

import { toaster } from "../components/toaster";
import type { ServiceBilling } from "./service-payables-data";
import {
  createBilling,
  type BillingDetails,
} from "./service-payables-store";

/**
 * Whether this billing can be created.
 *
 * Not once it already has a number — the number is issued once and quoted
 * outside this system afterwards. And not when nothing under it is billable:
 * such a chapel is held entirely by its discrepancies, and a number raised
 * against zero pesos would only have to be voided.
 *
 * IT BRIEFLY HAD AN EXCEPTION FOR A PAPER FRANCHISE — an empty billing was
 * creatable there, because the system knows nothing of what such a chapel
 * serviced and its billing would otherwise be permanently uncreatable. The
 * exception is gone with the rows it was for: a franchise that submits on paper
 * has no billing code, so it has no billing on this screen to create. Its number
 * is minted in the franchise module, against a mortuary code, and the plan
 * holders are keyed in there afterwards. See the note at the top of "the
 * franchise path" in `service-payables-data`.
 *
 * A franchise that endorses THROUGH the system is not a special case at all and
 * never was — it bills exactly as a company-owned chapel does, and this rule
 * reads the same for both.
 */
export function canCreateBilling(billing: ServiceBilling): boolean {
  return !billing.billingNo && billing.services.length > 0;
}

/**
 * Returns a function that creates a billing from the details the form
 * collected, and announces it.
 *
 * WHAT IT WRITES is a `TblClaimsBilling` row, so everything on that row which is
 * not on the form is taken off the billing here — the chapel, the period in
 * words, how many accounts it covers. See `BillingTarget` in the store.
 *
 * The year comes off the billing's own period rather than the clock: the
 * sequence in a billing number counts that YEAR's services, and a period
 * reported in January for the December just gone belongs to the year it covers.
 */
export function useCreateBilling() {
  return (billing: ServiceBilling, details: BillingDetails) => {
    const created = createBilling(
      {
        billingCode: billing.billingCode,
        chapelCode: billing.chapelCode,
        periodLabel: billing.periodLabel,
        year: billing.period.year,
        // The accounts the billing is actually raised for: what is held by a
        // discrepancy or a deficiency is not on it and is not counted.
        accountCount: billing.services.length,
        company: billing.company,
      },
      details,
    );
    toaster.create({
      type: "success",
      title: `Billing ${created.billingNo} created`,
      description: `${billing.chapelDesc} · ${billing.periodLabel}`,
    });
    return created;
  };
}
