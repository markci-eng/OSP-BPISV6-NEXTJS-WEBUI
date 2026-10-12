import { OSPBadgeProps } from "osp-ui-kit";
import type { PlanholderLookup } from "@/components/plan-management/planholders/tables/planholder-list-table";

export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(date: Date | string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function statusBadgeType(status: string): OSPBadgeProps["type"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "LAPSED":
      return "warning";
    case "TERMINATED":
      return "danger";
    case "FULLY PAID":
      return "info";
    case "NEW SALES":
      return "info";
    case "REINSTATED":
      return "success";
    default:
      return undefined;
  }
}

export const NOT_TERMINATED = "NOT YET TERMINATED";

/** Installments paid against the plan's total, and the percentage that is. */
export function installmentProgress(
  ph: Pick<PlanholderLookup, "installmentNo" | "totalInstallment">,
) {
  const total = ph.totalInstallment;
  const progress =
    total > 0 ? Math.min(100, Math.round((ph.installmentNo / total) * 100)) : 0;

  return { total, progress };
}

/**
 * Query parameters the planholder list keeps its filters in, so that coming
 * back to it from a profile lands on the same status, search and termination
 * status rather than the defaults.
 */
export const LIST_PARAMS = {
  status: "status",
  search: "q",
  terminationStatus: "termiStat",
} as const;

/**
 * Records one filter in the current URL. replaceState rather than the router:
 * a filter change is not a navigation and should not add a history entry.
 * Next keeps useSearchParams in step with it. An empty value (or the default)
 * is dropped from the URL.
 */
export function replaceListParam(key: string, value: string, fallback = "") {
  const params = new URLSearchParams(window.location.search);
  if (!value || value === fallback) params.delete(key);
  else params.set(key, value);

  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`,
  );
}

export const planholderProfileHref = (ph: PlanholderLookup) =>
  `/plan-management/planholder/${encodeURIComponent(ph.personId)}` +
  `?lpaNumber=${encodeURIComponent(ph.lpaNumber)}`;
