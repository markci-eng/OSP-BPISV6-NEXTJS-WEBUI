"use client";

// PROCESS BILLING — For Process's one commit (user, 2026-09-25).
//
// THE ACCOUNTS ARE NO LONGER TERMINATED ONE BY ONE. The processor steps through
// every account on the billing, edits what needs editing (kept as drafts), and
// then processes the billing: every account is terminated in one press, and the
// billing moves to For Verification on the module's ordinary completion rule
// ("numbered, and every plan that can be terminated has been").
//
// ONE RESTRICTION, and it is a pop-up rather than a disabled button (user,
// 2026-09-25): every account must have been VIEWED first, discrepancies
// included, so nothing is processed unseen. The error names who is left and
// offers to take the processor to the first of them.
//
// DISCREPANT ACCOUNTS ARE VIEWED BUT NOT TERMINATED. They are held out of the
// billing's total and its completion count already; posting a `TblClaimsSP` row
// for one would pay an account the billing does not count — the live
// inconsistency the per-account Terminate had.

import { useMessageDialog } from "osp-ui-kit";
import { toaster } from "../components/toaster";
import { serviceRecordDetailsFor } from "./components/ServiceRecordForm";
import {
  deceasedName,
  formatCSP,
  isServiceTerminated,
  servicesOf,
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "./service-payables-data";
import {
  isAccountOpened,
  saveServiceRecord,
  verifyBilling,
  verifyServices,
} from "./service-payables-store";
import { verifiableAccounts } from "./use-verify-accounts";

/** Accounts this desk has not had on screen yet, in billing order. */
export function unviewedAccounts(
  billing: ServiceBilling,
  stage: BillingStage = "for-process",
): ServiceRecord[] {
  return servicesOf(billing).filter(
    (service) => !isAccountOpened(stage, service.id),
  );
}

/**
 * THE GATE BOTH BILLING COMMITS SHARE — Process Billing and Verify Billing
 * (user, 2026-09-25): every account on the billing viewed at this stage,
 * discrepancies included, or an error naming who is left.
 *
 * Resolves to `null` when the billing may go ahead; otherwise to the
 * "unviewed" result, carrying the first account left if the user asked to be
 * taken there.
 */
export function useViewAllGate() {
  const { messageBox } = useMessageDialog();

  return async (
    billing: ServiceBilling,
    stage: BillingStage,
    act: string,
  ): Promise<Extract<BillingCommitResult, { outcome: "unviewed" }> | null> => {
    const left = unviewedAccounts(billing, stage);
    if (left.length === 0) return null;

    const total = servicesOf(billing).length;
    const names = left.slice(0, NAMES_SHOWN).map(deceasedName).join(", ");
    const more =
      left.length > NAMES_SHOWN ? `, and ${left.length - NAMES_SHOWN} more` : "";
    const show = await messageBox({
      title: "VIEW EVERY ACCOUNT FIRST",
      message: `You haven't viewed ${left.length} of the ${total} accounts on ${
        billing.billingNo ?? billing.billingCode
      }: ${names}${more}. Open each one before ${act} the billing.`,
      confirmText: "Go to first unviewed",
      cancelText: "Close",
      variant: "error",
    });
    return { outcome: "unviewed", goTo: show ? left[0].id : undefined };
  };
}

/** The accounts Process Billing will terminate. */
function terminable(billing: ServiceBilling): ServiceRecord[] {
  return servicesOf(billing).filter(
    (service) => !service.discrepancy && !isServiceTerminated(billing, service),
  );
}

/** How many names the error lists before it says "and N more". */
const NAMES_SHOWN = 5;

/** What a billing commit (Process Billing, Verify Billing) came to. */
export type BillingCommitResult =
  | { outcome: "done" }
  | { outcome: "cancelled" }
  /** Not every account was viewed; `goTo` is the first one left, if asked. */
  | { outcome: "unviewed"; goTo?: string };

export function useProcessBilling() {
  const { messageBox } = useMessageDialog();
  const viewAllGate = useViewAllGate();

  return async (billing: ServiceBilling): Promise<BillingCommitResult> => {
    const blocked = await viewAllGate(billing, "for-process", "processing");
    if (blocked) return blocked;

    if (!billing.billingNo) {
      await messageBox({
        title: "NO BILLING NUMBER",
        message: `${billing.billingCode} has no billing number yet, so nothing can be terminated into it.`,
        confirmText: "Close",
        showCancel: false,
        variant: "error",
      });
      return { outcome: "cancelled" };
    }

    const accounts = terminable(billing);
    // A franchise billing waits for its deductions before verification.
    const sentTo = billing.isFranchise ? "For Deduction" : "For Verification";
    const proceed = await messageBox({
      title: "PROCESS THIS BILLING?",
      message: `All ${accounts.length} ${
        accounts.length === 1 ? "account" : "accounts"
      } on ${billing.billingNo} will be terminated (${formatCSP(
        billing.totalCSP,
      )}) and the billing sent to ${sentTo}.`,
      confirmText: "Process Billing",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return { outcome: "cancelled" };

    for (const service of accounts) {
      saveServiceRecord(
        {
          serviceId: service.id,
          lpaNo: service.lpaNo,
          billingNo: billing.billingNo,
          claimNo: service.claimNo,
          contractNo: service.contractNo,
          servicingChapel: service.chapelCode,
          natureCode: service.natureCode,
        },
        serviceRecordDetailsFor(service, billing),
        true,
      );
    }

    toaster.create({
      type: "success",
      title: `${billing.billingNo} processed`,
      description: `${accounts.length} ${
        accounts.length === 1 ? "account" : "accounts"
      } terminated · sent to ${sentTo}`,
    });
    return { outcome: "done" };
  };
}

/**
 * VERIFY BILLING — For Verification's one commit, Process Billing's twin (user,
 * 2026-09-25). No per-account signing any more: the verifier views every
 * account, then signs the billing, which signs every billable account on it in
 * the same write and sends the billing to For Approval.
 *
 * Discrepant accounts are viewed but not signed, for the reason
 * `verifiableAccounts` gives: they are not on the billing.
 */
export function useVerifyWholeBilling() {
  const { messageBox } = useMessageDialog();
  const viewAllGate = useViewAllGate();

  return async (billing: ServiceBilling): Promise<BillingCommitResult> => {
    const blocked = await viewAllGate(billing, "processed", "verifying");
    if (blocked) return blocked;

    const where = billing.billingNo ?? billing.billingCode;
    const count = billing.services.length;
    const proceed = await messageBox({
      title: "VERIFY THIS BILLING?",
      message: `All ${count} ${count === 1 ? "account" : "accounts"} on ${where} (${formatCSP(
        billing.totalCSP,
      )}) will be signed off as verified, and the billing sent to For Approval.`,
      confirmText: "Verify Billing",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return { outcome: "cancelled" };

    verifyServices(verifiableAccounts(billing).map((service) => service.id));
    verifyBilling(billing.billingCode);

    toaster.create({
      type: "success",
      title: `${where} verified`,
      description: `${count} ${count === 1 ? "account" : "accounts"} signed · sent to For Approval`,
    });
    return { outcome: "done" };
  };
}
