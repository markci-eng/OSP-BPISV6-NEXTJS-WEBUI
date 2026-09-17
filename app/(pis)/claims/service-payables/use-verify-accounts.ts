"use client";

// Signing off accounts on a billing — the ask, the write and the toast, as one
// hook.
//
// `use-create-billing`'s shape one stage on, and deliberately: the write lives
// apart from whichever component draws the button, so the card that offers the
// action is not also the file that knows what the action IS.
//
// IT ASKS FIRST, where creating a billing does not. Creating opens a form, and a
// form is its own confirmation — you cannot fill one in by accident. Verifying
// is one click on a selection, and what it does is put a signature against
// somebody else's work: the dialog is where the verifier is told how many
// accounts and which billing, which are exactly the two things a mis-click gets
// wrong. The same reasoning `ServiceRecordView` gives for asking before it
// terminates.

import { useMessageDialog } from "osp-ui-kit";
import { toaster } from "../components/toaster";
import { formatCSP, type ServiceBilling, type ServiceRecord } from "./service-payables-data";
import {
  approveBilling,
  endorseBilling,
  getApprovedBilling,
  getEndorsedBilling,
  getVerifiedAccount,
  getVerifiedBilling,
  verifyBilling,
  verifyServices,
} from "./service-payables-store";

/**
 * The accounts on this billing that a verifier may still sign off.
 *
 * WHAT IS EXCLUDED, and why each: an account already verified (the signature is
 * written once — see `verifyServices`), and one held by a discrepancy. The
 * second is the load-bearing one. A discrepancy means the plan should never have
 * been serviced, so it is not on the billing and not in the money; verifying it
 * would sign for a payable that does not exist, and the billing's own
 * verification is derived from these accounts alone.
 */
export function verifiableAccounts(billing: ServiceBilling): ServiceRecord[] {
  return billing.services.filter((service) => !getVerifiedAccount(service.id));
}

/**
 * Whether the Verify action has anything to act on at all.
 *
 * Asked of the BILLING and not of the selection, because it decides whether the
 * button is drawn: a billing with every account already signed off has finished
 * and is on its way out of this queue, and one held entirely by discrepancies
 * has nothing to sign.
 */
export function canVerify(billing: ServiceBilling): boolean {
  return verifiableAccounts(billing).length > 0;
}

/**
 * Whether the BILLING ITSELF can be signed — every account on it read, and no
 * signature on it yet.
 *
 * THE RULE THAT USED TO BE A DERIVATION. Until 2026-08-27 a billing became
 * verified the moment its last account was, with no act in between; the two are
 * separate now, and this is what stands between them. Reading the accounts is
 * the CONDITION, not the deed.
 *
 * `billable.length > 0` for the reason every other rule here has it: a billing
 * whose every plan is held by a discrepancy has nothing to have verified, and
 * "all nought of them" must not read as done.
 */
export function canVerifyBilling(billing: ServiceBilling): boolean {
  return (
    billing.services.length > 0 &&
    verifiableAccounts(billing).length === 0 &&
    !getVerifiedBilling(billing.billingCode)
  );
}

/**
 * Returns a function that verifies the given accounts on a billing, after
 * asking.
 *
 * IT NAMES WHAT WILL HAPPEN rather than asking "are you sure", the rule every
 * dialog in this module follows — and the sentence changes when the answer
 * changes. Signing off the LAST outstanding account finishes the billing and
 * sends it on to For Approval, which is a different and larger thing than
 * ticking two of five off a list, so the verifier is told which one they are
 * about to do.
 *
 * Resolves to whether anything was written, so the caller can clear its
 * selection only when the action actually went through.
 */
export function useVerifyAccounts() {
  const { messageBox } = useMessageDialog();

  return async (
    billing: ServiceBilling,
    services: ServiceRecord[],
  ): Promise<boolean> => {
    // Already-signed rows are dropped before anything is counted, so the
    // dialog's figures describe what the click will actually change. A
    // selection of nothing but verified accounts asks nothing and does nothing.
    const pending = services.filter(
      (service) => !getVerifiedAccount(service.id),
    );
    if (!pending.length) return false;

    const outstanding = verifiableAccounts(billing).length;
    const finishes = pending.length === outstanding;
    const count = `${pending.length} ${
      pending.length === 1 ? "account" : "accounts"
    }`;
    const where = billing.billingNo ?? billing.billingCode;

    // WHAT "THE LAST ONE" NOW MEANS. It used to close the billing and send it on
    // in the same click; the billing's own signature is a second act since
    // 2026-08-27, so the last account finishes the READING and leaves the
    // billing here with one thing left to do. The dialog says which of those two
    // it is about to do, as it always has — only the second sentence changed.
    const proceed = await messageBox({
      title: finishes ? "VERIFY THE LAST ACCOUNTS?" : "VERIFY THESE ACCOUNTS?",
      message: finishes
        ? `${count} on ${where} will be signed off — the last of them. ` +
          `${where} then waits on Verify Billing No., which is what sends it to For Approval.`
        : `${count} on ${where} will be signed off. ` +
          `${outstanding - pending.length} left after this.`,
      confirmText: "Verify",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    verifyServices(pending.map((service) => service.id));

    toaster.create({
      type: "success",
      title: `${count} verified on ${where}`,
      description: finishes
        ? `${billing.chapelDesc} · every account read — verify the billing to send it on`
        : `${billing.chapelDesc} · ${outstanding - pending.length} still to check`,
    });

    return true;
  };
}

/**
 * Returns a function that signs the BILLING, after asking.
 *
 * THE SECOND ACT, and the one that moves the billing: signing every account is
 * reading the work, this is putting the document through to accounting. It is
 * the heavier of the two — the billing leaves the queue and the next person to
 * see it is an approver — so the dialog names the number, the money and where it
 * goes, which are the three things somebody checks before letting that happen.
 *
 * Resolves to whether anything was written, matching {@link useVerifyAccounts}.
 */
export function useVerifyBilling() {
  const { messageBox } = useMessageDialog();

  return async (billing: ServiceBilling): Promise<boolean> => {
    if (!canVerifyBilling(billing)) return false;

    const where = billing.billingNo ?? billing.billingCode;
    const accounts = `${billing.services.length} ${
      billing.services.length === 1 ? "account" : "accounts"
    }`;

    const proceed = await messageBox({
      title: "VERIFY THIS BILLING?",
      message:
        `${where} — ${accounts}, ${formatCSP(billing.totalCSP)} — will be signed off as verified. ` +
        `It leaves For Verification and goes on to For Approval.`,
      confirmText: "Verify Billing",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    verifyBilling(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${where} verified`,
      description: `${billing.chapelDesc} · on to For Approval`,
    });

    return true;
  };
}

/**
 * Whether a billing can be APPROVED — it is at the approval stage and carries no
 * approval yet.
 *
 * SHORTER THAN {@link canVerifyBilling} BY THE ACCOUNTS, and that is the whole
 * difference between the two queues. Verification asks whether every account has
 * been read, because verifying IS reading them; approval asks nothing of the
 * accounts at all — they were read and signed by somebody else one stage back,
 * and an approver is not being asked to do it again. What reaches this queue is
 * by definition a billing whose accounts are done.
 */
export function canApproveBilling(billing: ServiceBilling): boolean {
  return (
    billing.stage === "verified" && !getApprovedBilling(billing.billingCode)
  );
}

/**
 * Returns a function that approves a billing, after asking.
 *
 * THE HEAVIEST OF THE THREE SIGNATURES in this file. Verifying an account says a
 * family's paperwork reads right; verifying a billing says the document is ready
 * to be approved; this says it is APPROVED — the payable is settled as far as
 * this module is concerned and the next stop is endorsement to accounting. So
 * the dialog names the number, the money and where it goes, and the confirm
 * button says Approve rather than OK.
 */
export function useApproveBilling() {
  const { messageBox } = useMessageDialog();

  return async (billing: ServiceBilling): Promise<boolean> => {
    if (!canApproveBilling(billing)) return false;

    const where = billing.billingNo ?? billing.billingCode;
    const accounts = `${billing.services.length} ${
      billing.services.length === 1 ? "account" : "accounts"
    }`;

    const proceed = await messageBox({
      title: "APPROVE THIS BILLING?",
      message:
        `${where} — ${accounts}, ${formatCSP(billing.totalCSP)} — will be approved for payment. ` +
        `It leaves For Approval and goes on to For Endorsement.`,
      confirmText: "Approve",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    approveBilling(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${where} approved`,
      description: `${billing.chapelDesc} · on to For Endorsement`,
    });

    return true;
  };
}

/**
 * Returns a function that approves SEVERAL billings at once, after asking.
 *
 * THE OLD SCREEN'S BULK APPROVAL (user, 2026-08-27): a processor reads down the
 * list of billing numbers, ticks the ones that are good and puts them through
 * together. The ticks live on the rail's index — see `BillingIndex` — and this
 * is what they act with.
 *
 * IT IS THE SAME WRITE AS THE SINGLE ONE, in a loop. That is the whole reason
 * the two can coexist without a rule between them: `approveBilling` is written
 * once per billing and refuses to re-stamp, so approving five at once and
 * approving five one at a time leave the file in the same state. What differs is
 * how many decisions the person is expressing at once, which is a matter for the
 * DIALOG rather than for the store.
 *
 * SO THE DIALOG COUNTS AND TOTALS. A single approval names one billing and one
 * amount; this one is a page of them, and the two figures somebody checks before
 * releasing a batch are how many and how much. Anything already approved is
 * dropped first, so the figures describe what the click will actually change.
 */
export function useApproveBillings() {
  const { messageBox } = useMessageDialog();

  return async (billings: ServiceBilling[]): Promise<boolean> => {
    const pending = billings.filter(canApproveBilling);
    if (!pending.length) return false;

    const count = `${pending.length} ${
      pending.length === 1 ? "billing" : "billings"
    }`;
    const total = pending.reduce((sum, billing) => sum + billing.totalCSP, 0);

    const proceed = await messageBox({
      title: "APPROVE THESE BILLINGS?",
      message:
        `${count} — ${formatCSP(total)} in all — will be approved for payment. ` +
        `They leave For Approval and go on to For Endorsement.`,
      confirmText: `Approve ${count}`,
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    for (const billing of pending) approveBilling(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${count} approved`,
      description: `${formatCSP(total)} · on to For Endorsement`,
    });

    return true;
  };
}

/**
 * Whether a billing can be ENDORSED — it is at the endorsement stage and carries
 * no endorsement yet.
 *
 * {@link canApproveBilling}'s shape one stage on, and short for the same reason:
 * the accounts were read and signed two stages back, and an endorser is not
 * being asked to do any of it again. What reaches this queue is a billing an
 * approver has already passed.
 */
export function canEndorseBilling(billing: ServiceBilling): boolean {
  return (
    billing.stage === "approved" && !getEndorsedBilling(billing.billingCode)
  );
}

/**
 * Returns a function that endorses a billing, after asking.
 *
 * THE LAST OF THE FOUR SIGNATURES, and the only one whose billing does not go
 * anywhere next: verifying sends it to For Approval, approving sends it to For
 * Endorsement, and this sends it OUT — to accounting, and off this module's
 * desks. So the dialog says where it goes and that it will not come back, which
 * is the fact a mis-click here gets wrong.
 *
 * IT REPLACED A BUTTON THAT WROTE NOTHING (user, 2026-09-14: "instead of Next
 * billing, Endorse is the name of the button"). For Endorsement had no act
 * described, so the conveyor offered "Next billing" — a pager that stepped over
 * the billing and left it exactly where it was, to be served again on the next
 * restart. A button named after an act has to perform it, and the act it is
 * named after is this one.
 */
export function useEndorseBilling() {
  const { messageBox } = useMessageDialog();

  return async (billing: ServiceBilling): Promise<boolean> => {
    if (!canEndorseBilling(billing)) return false;

    const where = billing.billingNo ?? billing.billingCode;
    const accounts = `${billing.services.length} ${
      billing.services.length === 1 ? "account" : "accounts"
    }`;

    const proceed = await messageBox({
      title: "ENDORSE THIS BILLING?",
      message:
        `${where} — ${accounts}, ${formatCSP(billing.totalCSP)} — will be endorsed to accounting. ` +
        `It leaves For Endorsement, and this is the last stage it passes through here.`,
      confirmText: "Endorse",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return false;

    endorseBilling(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${where} endorsed`,
      description: `${billing.chapelDesc} · endorsed to accounting`,
    });

    return true;
  };
}

/**
 * How far through a billing's accounts the verifier has got.
 *
 * Counted over what CAN be verified rather than over every row, for the reason
 * `verifiableAccounts` gives — a discrepancy is not part of the billing, so it
 * must not be part of the denominator that says whether the billing is done.
 */
export function verificationProgress(billing: ServiceBilling): {
  verified: number;
  total: number;
} {
  const total = billing.services.length;
  return {
    verified: total - verifiableAccounts(billing).length,
    total,
  };
}
