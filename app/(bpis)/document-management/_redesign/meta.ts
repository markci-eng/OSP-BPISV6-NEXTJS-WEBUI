import type { DocStatus, DocType } from "./data";

/** Chakra colorPalette + short code per document type (drives badges, theme-aware). */
export const TYPE_META: Record<DocType, { code: string; palette: string }> = {
  "Service Invoice": { code: "SI", palette: "white" },
  "Acknowledgement Receipt": { code: "AR", palette: "white" },
  "Life Plan Application Form": { code: "LPAF", palette: "white" },
  "Official Receipt": { code: "OR", palette: "white" },
  "Collection Receipt": { code: "CR", palette: "white" },
};

export const STATUS_META: Record<DocStatus, { palette: string }> = {
  Assigned: { palette: "green" },
  "Partially Assigned": { palette: "blue" },
  "Fully Used": { palette: "gray" },
  Blocked: { palette: "red" },
  Expired: { palette: "orange" },
};

export function typePalette(type: string): string {
  return TYPE_META[type as DocType]?.palette ?? "gray";
}

export function statusPalette(status: string): string {
  return STATUS_META[status as DocStatus]?.palette ?? "gray";
}

/** All selectable document types (order matters for the UI). */
export const DOC_TYPES = Object.keys(TYPE_META) as DocType[];

export const BLOCK_REASONS = [
  "Damaged",
  "Lost",
  "Voided",
  "Expired",
  "Administrative Hold",
  "Other",
];
