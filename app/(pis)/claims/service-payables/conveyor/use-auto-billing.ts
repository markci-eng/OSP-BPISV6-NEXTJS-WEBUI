"use client";

// CREATING THE BILLING, WITHOUT ANYBODY DOING IT.
//
// "There is no more create billing intervention since we are going to automate
// it. The user will only need to terminate the account" (user, 2026-09-11). So
// the Billing No is minted when the billing comes up on the conveyor, and the
// processor never sees a form, a button or a dialog for it. `BillingAction` and
// `CreateBillingDialog` are unreachable from this screen; they are kept for the
// archive, which still draws them.
//
// WHAT THE FORM USED TO ASK FOR, and where each answer comes from now:
//
//   CV date    today. Accounting raises the voucher afterwards and fills the
//              number in; the date the billing was created is all this row
//              wants, and that is not a decision anybody was making.
//   mortuary   the chapel's DESIGNATED one — `defaultMortCodeFor`, which is
//              what the form opened on anyway. The select existed because the
//              designated answer is the near-certain one rather than the only
//              one; automating it means the unusual case is corrected on the
//              record instead, where the service's own mortuary field already
//              lives and already overrides this.
//
// A CHAPEL THE REFERENCE DATA GIVES NO MORTUARY still gets its number, and its
// accounts price at nothing until somebody says which mortuary — exactly as
// they did before, since an unanswered select left the same hole. The record's
// mortuary field is where that is answered. Flagged rather than guessed: a rate
// is a term of a mortuary's contract, and picking one on the chapel's behalf
// would invent the amount the chapel is paid.
//
// IT RARELY FIRES ANY MORE (2026-09-17), and that is not a reason to remove it.
// The seed gives every chapel-period its number up front — see
// `ClaimsBillingRecord.dateProcessed`, which took over from the row's existence
// as the mark of a billing past For Process — so a billing arriving on the
// conveyor is already numbered and the guard below returns immediately.
//
// WHAT IS LEFT FOR IT is the billing with no `TblBillingHdr` row behind it: a
// paper franchise's, raised in this session. Those are minted by the intake
// today, so this is the safety net rather than the path — and it is the only
// thing standing between a billing with no number and a processor who cannot
// terminate into it.
//
// IT USED TO BE THE ONLY MINT, and the note here said minting the whole queue
// up front would empty For Process at a stroke. That was true of the rule as it
// stood, where a row on file WAS the proof of processing. The seed does mint the
// whole queue now, and For Process is intact, because that proof moved to a
// date.

import { useEffect, useLayoutEffect } from "react";
import {
  defaultMortCodeFor,
  getMortuary,
  type ServiceBilling,
} from "../service-payables-data";
import {
  createBilling,
  hasCreatedBilling,
} from "../service-payables-store";

/**
 * BEFORE THE PAINT, NOT AFTER IT — and this is not a micro-optimisation.
 *
 * With a plain `useEffect` the browser draws one frame of the billing as it
 * arrives, which is to say WITHOUT its number: the header reads "Billing No —",
 * and `RecordActions` — correctly, for the state it is handed — disables
 * Terminate and captions it *"nothing for a terminated plan to be posted
 * against. Create the billing first."* That sentence is the exact thing this
 * whole change removes, and flashing it on the arrival of every billing would
 * teach a processor to look for a control that no longer exists.
 *
 * A layout effect commits the number before anything is painted, so the first
 * frame a reader sees is already numbered. The work behind it is synchronous —
 * a map write against seed data — so there is nothing to block on.
 *
 * `useEffect` ON THE SERVER, because React warns about `useLayoutEffect` there
 * and is right to: nothing is painted, so it cannot run, and a server render of
 * this page has an empty store and nothing to mint into anyway. The client
 * picks it up on hydration.
 */
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Today, as the store wants it.
 *
 * Local rather than `toISOString()`, which converts to UTC first and so hands
 * back yesterday for anyone east of Greenwich for most of their working day —
 * this application runs at UTC+8. The create form had the same helper for the
 * same reason.
 */
function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Mint the served billing's number if it has none.
 *
 * IT IS AN EFFECT AND NOT A DERIVATION, because it WRITES: `createBilling` puts
 * a row in the store and bumps the version every subscriber re-reads on. Done
 * during render that would be a write inside a read.
 *
 * SAFE TO RUN AGAIN. `createBilling` returns the first result untouched for a
 * billing code it has already seen — a number is quoted outside this system
 * once issued, so it is issued once — and `hasCreatedBilling` keeps this from
 * even asking. The guard is not redundant: without it every render of a served
 * billing would call a function that emits, and the emit would cause the render.
 *
 * IT GOES STRAIGHT TO THE STORE rather than through `useCreateBilling`, and the
 * difference is the TOAST. That hook announces the billing because a person
 * pressed a button and is owed an answer; nobody pressed anything here, and a
 * toast on the arrival of every chapel would be the screen congratulating
 * itself several times a minute. What the automation has instead is the standing
 * line in `BillingHead` — quieter, permanent, and attached to the number it is
 * talking about. The hook stays as it is for the archived screen that still
 * draws the button.
 */
export function useAutoBilling(billing: ServiceBilling | undefined) {
  useBeforePaint(() => {
    if (!billing) return;
    // Already numbered — on file from before this session, or minted a moment
    // ago when this billing first came up.
    if (billing.billingNo || hasCreatedBilling(billing.billingCode)) return;
    // Nothing billable: every plan on it is held by a discrepancy, and a number
    // raised against zero pesos would only have to be voided. The rule
    // `canCreateBilling` enforced for the button, enforced here for its absence.
    if (billing.services.length === 0) return;

    const mortCode = defaultMortCodeFor(billing.chapelCode);
    createBilling(
      {
        billingCode: billing.billingCode,
        chapelCode: billing.chapelCode,
        periodLabel: billing.periodLabel,
        // The billing's own period and not the clock: a Billing No's sequence
        // counts that YEAR's services, and a period reported in January for the
        // December just gone belongs to the year it covers.
        year: billing.period.year,
        // What the billing is actually raised for — anything held by a
        // discrepancy is not on it and is not counted.
        accountCount: billing.services.length,
        company: billing.company,
      },
      {
        cvDateISO: todayISO(),
        mortuaryCode: mortCode,
        mortuaryName: getMortuary(mortCode)?.mortuary ?? "",
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing?.billingCode, billing?.billingNo, billing?.services.length]);
}
