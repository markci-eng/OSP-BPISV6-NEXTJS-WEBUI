"use client";

// THE PAPER FRANCHISE'S TWO ACTS — raising the billing, and closing its ENTRY.
//
// `use-verify-accounts`' shape, and in one file for the same reason that one
// holds four: these are the acts of a single path, they share its vocabulary,
// and a reader who needs one needs to know the other exists.
//
// WHY THERE ARE TWO. Every other billing in this module is brought into being by
// the data — it exists because an endorsement arrived — and its LIST OF ACCOUNTS
// arrives with it, complete, in the same breath. A franchise that submits on
// paper endorses nothing, so both of those have to be said by a person: somebody
// raises the billing against a mortuary, and somebody says the stack of hard
// copies has all been keyed in.
//
// WHAT NEITHER OF THEM IS, IS COMPLETION. That is still the module's ordinary
// rule — numbered, and every plan that can be terminated has been — and it is
// left exactly where it was. Closing the entry only makes it answerable, by
// freezing a list that would otherwise keep growing under it. The two were one
// act for a few hours and the user caught it immediately (2026-09-15): a button
// meaning both could only be offered after every account was terminated, which
// is after the last moment a lock can prevent anything.

import { useMessageDialog } from "osp-ui-kit";
import { BILLING_COMPANY, type BillingPeriod } from "../../data";
import { toaster } from "../components/toaster";
import {
  formatCSP,
  getMortuary,
  periodLabel,
  servicesOf,
  type ServiceBilling,
} from "./service-payables-data";
import {
  closeFranchiseEntry,
  createFranchiseBilling,
  getClosedFranchiseEntry,
  isPlanTerminated,
} from "./service-payables-store";

/** What the intake form collects. Everything else is read from the mortuary. */
export interface FranchiseIntake {
  mortCode: string;
  period: BillingPeriod;
  cvDateISO: string;
}

/**
 * Returns a function that raises a paper franchise's billing and announces it.
 *
 * NO CONFIRMATION DIALOG, unlike the three signatures in `use-verify-accounts`.
 * The intake IS a form, and a form is its own confirmation — you cannot fill one
 * in by accident. That is the same line `use-create-billing` draws, and it draws
 * it for the same act.
 *
 * THE TOAST NAMES THE NUMBER AND WHAT TO DO NEXT. A billing raised empty is the
 * one state in this module where the screen has nothing to show for the act
 * except a heading — there is no list, no money, no progress — so the answer the
 * processor is owed is the number they just minted and the fact that the plan
 * holders come next.
 *
 * Resolves to the billing code so the caller can put the conveyor on it.
 */
export function useCreateFranchiseBilling() {
  return (intake: FranchiseIntake): string => {
    const mortuary = getMortuary(intake.mortCode);

    const { franchise, billing } = createFranchiseBilling({
      mortCode: intake.mortCode,
      mortuaryName: mortuary?.mortuary ?? intake.mortCode,
      // The mortuary's own chapel, when `RefMortuary.branchCode` resolves — and
      // frequently it does not for a franchise row. Empty is a real answer and
      // the billing is built to carry it: what identifies a paper franchise's
      // billing is the mortuary, not a chapel it may not have.
      chapelCode: mortuary?.chapel?.chapelCode ?? "",
      period: intake.period,
      periodLabel: periodLabel(intake.period),
      cvDateISO: intake.cvDateISO,
      // Nothing was endorsed through the system, so there is no header row to
      // read a company off. There is one company.
      company: BILLING_COMPANY,
    });

    toaster.create({
      type: "success",
      title: `Billing ${billing.billingNo} raised`,
      description: `${franchise.mortuaryName} · ${franchise.periodLabel} — add the plan holders from the paperwork`,
    });

    return franchise.billingCode;
  };
}

/**
 * Whether plan holders may still be keyed into this billing — a paper franchise
 * at For Process whose entry the processor has not closed.
 *
 * THE ONE STATE THE FRANCHISE CONTROLS BELONG TO. Add Planholder is drawn while
 * this is true and gone the moment it is not, and Close Entry is what makes it
 * false. After that the billing is an ordinary For Process billing with an
 * ordinary list of accounts to terminate.
 */
export function isFranchiseEntryOpen(billing: ServiceBilling): boolean {
  return (
    billing.isPaperFranchise &&
    billing.stage === "for-process" &&
    !getClosedFranchiseEntry(billing.billingCode)
  );
}

/**
 * Whether the entry can be closed — there is something on the billing, and it
 * has not been closed already.
 *
 * IT DOES NOT ASK WHETHER THE ACCOUNTS ARE TERMINATED, and that is the whole
 * correction (user, 2026-09-15: "it should be clickable if that was the locking
 * of billing in order not allowed to be added"). It did, while this act meant
 * completion as well as locking — so the control that stops anything else being
 * added only became pressable once every account had been dealt with, which is
 * long after the last moment it could have prevented anything. A lock offered
 * only when there is nothing left to lock out is not a lock.
 *
 * SO THE ONE CONDITION IS THAT THERE IS SOMETHING TO CLOSE. An empty billing
 * cannot be: a numbered document for no funerals at all would have to be voided,
 * and a processor who raised the wrong franchisee wants to leave it rather than
 * seal it.
 *
 * WHAT HAPPENS TO THE UN-TERMINATED ACCOUNTS is nothing — they are still there
 * and still have to be worked. Closing the entry freezes the LIST; the module's
 * ordinary completion rule then finishes the billing when the last of them is
 * terminated. See `getServiceBillings`.
 */
export function canCloseFranchiseEntry(billing: ServiceBilling): boolean {
  return isFranchiseEntryOpen(billing) && servicesOf(billing).length > 0;
}

/**
 * Returns a function that closes a paper franchise's entry, after asking.
 *
 * IT ASKS, where raising the billing does not, and the asymmetry is the module's
 * own: raising opens a form, and a form is its own confirmation. This is one
 * press that cannot be undone — there is no re-opening an entry, by design — so
 * the processor is told what it seals and what it does not.
 *
 * THE DIALOG SAYS WHAT IS LEFT TO DO, and that is the sentence this act lives or
 * dies by. Closing the entry is not finishing the billing, and a processor who
 * reads it as "sent to verification" will press it, see the billing still on
 * screen with three plans to terminate, and conclude the button is broken. So
 * the unterminated count is named out loud when there is one.
 *
 * Resolves to whether anything was written, matching the signature hooks.
 */
export function useCloseFranchiseEntry() {
  const { messageBox } = useMessageDialog();

  return async (billing: ServiceBilling): Promise<boolean> => {
    if (!canCloseFranchiseEntry(billing)) return false;

    const accounts = servicesOf(billing);
    const outstanding = accounts.filter(
      (service) => !service.discrepancy && !isPlanTerminated(service.id),
    ).length;

    const count = `${accounts.length} ${
      accounts.length === 1 ? "account" : "accounts"
    }`;

    const proceed = await messageBox({
      title: "CLOSE THE ENTRY?",
      message:
        `${billing.billingNo} — ${count}, ${formatCSP(billing.totalCSP)} — will be sealed: ` +
        `no further plan holders can be keyed into it. Close it only when the franchise's paperwork is finished. ` +
        (outstanding > 0
          ? `The billing STAYS here — ${outstanding} ${
              outstanding === 1 ? "account is" : "accounts are"
            } still to terminate, and it goes to For Verification when the last of them is done.`
          : `Every account on it is already dealt with, so it goes on to For Verification.`),
      confirmText: "Close Entry",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    closeFranchiseEntry(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${billing.billingNo} — entry closed`,
      description:
        outstanding > 0
          ? `${billing.chapelDesc} · ${outstanding} still to terminate`
          : `${billing.chapelDesc} · on to For Verification`,
    });

    return true;
  };
}
