"use client";

// POST FOR VERIFICATION — the page's one commit, for every changed row at once.
//
// ONLY THE ROWS THAT CHANGED ARE SENT (user, 2026-10-01: "it is much better
// that our front-end know which row has amount and changes"). A row is changed
// when what is typed differs from what is posted; a waiting billing posts and
// moves to For Verification, a posted one still unverified is updated and stays.
//
// THE BUTTON IS ALWAYS PRESSABLE, and the press decides: nothing changed says so,
// an invalid amount names the billing and sends the cursor there, anything else
// asks once and posts.

import { useMessageDialog } from "osp-ui-kit";
import { isValidRoyalty } from "../service-payables/service-payables-data";
import { postDeductions } from "../service-payables/service-payables-store";
import { toaster } from "../components/toaster";
import {
  formatAmount,
  getDeductionRows,
  parseAmount,
  type DeductionRow,
} from "./deductions-data";

/** What has been typed, by billing code. */
export type RoyaltyDrafts = Record<string, string>;

/** Whether the row's typed royalty differs from the posted one. */
export function isChanged(row: DeductionRow, drafts: RoyaltyDrafts): boolean {
  if (!row.editable || !(row.billingCode in drafts)) return false;
  return parseAmount(drafts[row.billingCode]) !== row.royalty;
}

/** The royalty the row stands at — typed if changed, else posted. */
export function royaltyOf(
  row: DeductionRow,
  drafts: RoyaltyDrafts,
): number | null {
  return row.billingCode in drafts
    ? parseAmount(drafts[row.billingCode])
    : row.royalty;
}

/** Whether a changed row would be refused — blank, zero, or over the gross. */
export function isInvalid(row: DeductionRow, drafts: RoyaltyDrafts): boolean {
  return !isValidRoyalty(royaltyOf(row, drafts), row.gross, row.loan);
}

export type PostResult =
  | { outcome: "posted"; codes: string[] }
  | { outcome: "nothing" | "cancelled" }
  /** A changed row can't be posted; `goTo` is the first one. */
  | { outcome: "invalid"; goTo: string };

export function usePostDeductions() {
  const { messageBox } = useMessageDialog();

  return async (drafts: RoyaltyDrafts): Promise<PostResult> => {
    const changed = getDeductionRows().filter((row) => isChanged(row, drafts));

    // A DIALOG, NOT A TOAST (user, 2026-10-01: a toast "the user wouldn't
    // notice sometimes"). Same box as the confirmation below.
    if (changed.length === 0) {
      await messageBox({
        title: "NO CHANGES MADE",
        message: "There is no royalty to post.",
        confirmText: "Close",
        showCancel: false,
        variant: "information",
      });
      return { outcome: "nothing" };
    }

    const bad = changed.find((row) => isInvalid(row, drafts));
    if (bad) {
      await messageBox({
        title: "CAN'T BE POSTED",
        message: `${bad.billingNo}: royalty must be more than 0 and no more than the gross less the loan.`,
        confirmText: "Go to billing",
        showCancel: false,
        variant: "error",
      });
      return { outcome: "invalid", goTo: bad.billingCode };
    }

    const posts = changed.filter((row) => row.stage === "for-deduction").length;
    const updates = changed.length - posts;
    const net = changed.reduce(
      (sum, row) => sum + row.gross - row.loan - (royaltyOf(row, drafts) ?? 0),
      0,
    );
    const what = [
      posts && `${posts} to post`,
      updates && `${updates} to update`,
    ]
      .filter(Boolean)
      .join(" and ");

    const proceed = await messageBox({
      title: "POST FOR VERIFICATION?",
      message: `${changed.length} ${
        changed.length === 1 ? "deduction" : "deductions"
      } (${what}), net Php ${formatAmount(net)}. They go to For Verification.`,
      confirmText: "Post",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return { outcome: "cancelled" };

    // RE-READ AT THE MOMENT OF POSTING. A verifier may have signed one of
    // these while the amounts were being typed; that row is no longer
    // editable and is left out, and the rest still post.
    const now = new Map(getDeductionRows().map((r) => [r.billingCode, r]));
    const writable = changed.filter((row) => now.get(row.billingCode)?.editable);
    const locked = changed.length - writable.length;

    postDeductions(
      writable.map((row) => ({
        billingCode: row.billingCode,
        royalty: royaltyOf(row, drafts)!,
        loan: now.get(row.billingCode)!.loan,
      })),
    );

    toaster.create({
      type: "success",
      title: `${writable.length} ${
        writable.length === 1 ? "deduction" : "deductions"
      } posted for verification`,
      description: locked
        ? `${locked} verified meanwhile and can no longer be changed.`
        : undefined,
    });
    return { outcome: "posted", codes: writable.map((r) => r.billingCode) };
  };
}
