import type { SearchScope } from "./types";

/* ─── Design tokens (local, so this module reads as one system) ──────────── */

export const ACCENT = "#109448";
export const ACCENT_DARK = "#0B7A3B";
export const ACCENT_BG = "#EAF7EF";
export const CARD_RADIUS = "16px";
export const SOFT_SHADOW =
  "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.05)";

export const SCOPES: { id: SearchScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "name", label: "Name" },
  { id: "code", label: "Agent Code" },
  { id: "branch", label: "Branch" },
  { id: "area", label: "Area" },
];

export const TRANSACTION_ID = "RA-0000001";
