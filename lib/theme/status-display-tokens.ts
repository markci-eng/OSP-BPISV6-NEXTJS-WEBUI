import { BRAND_COLORS } from "./brand-colors";

export type DisplayStatusStyle = {
  bg: string;
  color: string;
  borderColor: string;
  borderWidth: string;
  fontWeight: string;
};

export const DISPLAY_STATUS_STYLES = {
  approved: {
    bg: BRAND_COLORS.successBg,
    color: BRAND_COLORS.primaryGreen,
    borderColor: BRAND_COLORS.primaryGreen,
    borderWidth: "1px",
    fontWeight: "700",
  },
  pending: {
    bg: BRAND_COLORS.warningBg,
    color: BRAND_COLORS.warningText,
    borderColor: BRAND_COLORS.warningBorder,
    borderWidth: "1px",
    fontWeight: "700",
  },
  denied: {
    bg: BRAND_COLORS.errorBg,
    color: BRAND_COLORS.destructiveRed,
    borderColor: BRAND_COLORS.destructiveRed,
    borderWidth: "1px",
    fontWeight: "700",
  },
  promotion: {
    bg: BRAND_COLORS.successBg,
    color: BRAND_COLORS.primaryGreen,
    borderColor: BRAND_COLORS.primaryGreen,
    borderWidth: "1px",
    fontWeight: "700",
  },
  transfer: {
    bg: BRAND_COLORS.warningBg,
    color: BRAND_COLORS.warningText,
    borderColor: BRAND_COLORS.warningBorder,
    borderWidth: "1px",
    fontWeight: "700",
  },
  fallback: {
    bg: BRAND_COLORS.mutedBg,
    color: BRAND_COLORS.neutralText,
    borderColor: BRAND_COLORS.neutralBorder,
    borderWidth: "1px",
    fontWeight: "700",
  },
} satisfies Record<string, DisplayStatusStyle>;

export const APPROVAL_STATUS_STYLES: Record<string, DisplayStatusStyle> = {
  Approved: DISPLAY_STATUS_STYLES.approved,
  Pending: DISPLAY_STATUS_STYLES.pending,
  Denied: DISPLAY_STATUS_STYLES.denied,
};

export const MOVEMENT_TYPE_STYLES: Record<string, DisplayStatusStyle> = {
  Promotion: DISPLAY_STATUS_STYLES.promotion,
  Transfer: DISPLAY_STATUS_STYLES.transfer,
};

export function getDisplayStatusStyle(status: string) {
  return APPROVAL_STATUS_STYLES[status] ?? DISPLAY_STATUS_STYLES.fallback;
}

export function getMovementDisplayStyle(movementType: string) {
  return MOVEMENT_TYPE_STYLES[movementType] ?? DISPLAY_STATUS_STYLES.fallback;
}
