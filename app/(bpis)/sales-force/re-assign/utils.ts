import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import type { SearchScope } from "./types";

/* ─── Small helpers ──────────────────────────────────────────────────────── */

export const initials = (a: SalesAgent) =>
  `${a.firstName.charAt(0)}${a.lastName.charAt(0)}`.toUpperCase();

export const fullName = (a: SalesAgent) => `${a.firstName} ${a.lastName}`;

export const normalize = (v: string) =>
  v.trim().replace(/\s+/g, "").toLowerCase();

export const matchesSuperior = (
  a: SalesAgent,
  query: string,
  scope: SearchScope,
) => {
  const q = normalize(query);
  if (!q) return true;
  const byName =
    normalize(a.name).includes(q) ||
    normalize(fullName(a)).includes(q) ||
    normalize(a.lastName + a.firstName).includes(q);
  const byCode = normalize(a.id).includes(q);
  const byBranch = normalize(a.branch).includes(q);
  const byArea = normalize(a.address.province).includes(q);

  switch (scope) {
    case "name":
      return byName;
    case "code":
      return byCode;
    case "branch":
      return byBranch;
    case "area":
      return byArea;
    default:
      return byName || byCode || byBranch || byArea;
  }
};
