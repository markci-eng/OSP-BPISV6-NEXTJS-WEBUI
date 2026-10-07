// How the planholder list prints its cells — shared by the desktop table and
// the phone's rows, so the two draw the same planholder the same way.

import type { OSPBadgeProps } from "osp-ui-kit";
import { db } from "../../../data";

/**
 * Which badge an account status gets — the BPIS list's own mapping, on the
 * labels this area uses.
 *
 * THE LABELS DIFFER FROM BPIS'S BY CASE AND WORDING, which is why the compare is
 * upper-cased and covers both spellings where they part: `Planholder`'s
 * `accountStatusLabel` says "Fully Paid" where the BPIS data says "FULLY PAID",
 * and this area has statuses that one does not. Anything unrecognised gets no
 * badge type rather than a wrong one.
 */
export function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "REINSTATED":
      return "success";
    case "LAPSED":
      return "warning";
    case "TERMINATED":
    case "CANCELLED":
      return "danger";
    case "FULLY PAID":
    case "NEW SALES":
      return "info";
    default:
      return undefined;
  }
}

export function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Sep 16, 2026" — the BPIS list's date, which is shorter than ours. */
export function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * THE BRANCH'S NAME, FALLING BACK TO ITS CODE — and to a dash where the plan
 * has no payment on file to read one off. See `PlanholderSearchResult.branch`.
 */
export function branchName(code: string): string {
  return code ? db.getBranch(code)?.description || code : "—";
}
