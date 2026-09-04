/**
 * Colours for the three states a permission row can be in. The accent stays on
 * the app's `primary` token so the module inherits the St. Peter theme; only
 * the pending/granted/revoked semantics are pinned here, because they must
 * read the same whatever palette the app is themed with.
 */
export const ACCESS_COLORS = {
  /** Accent for checked boxes, progress bars and active filter chips. */
  accent: "var(--chakra-colors-primary)",

  /** Unsaved-edit amber. */
  pendingBg: "#FEF6E7",
  pendingRowBg: "#FEF9EF",
  pendingBorder: "#F5D9A8",
  pendingCardBorder: "#F0D6A4",
  pendingText: "#93540A",
  pendingDot: "#DC8A16",

  /** Newly granted. */
  grantText: "#0F7B4F",
  grantBg: "#E7F6EF",

  /** Newly revoked. */
  revokeText: "#B42318",
  revokeBg: "#FEECEA",
} as const;

/** Monospace treatment shared by every permission / member code chip. */
export const CODE_FONT =
  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
