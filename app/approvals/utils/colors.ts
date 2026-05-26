import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";
import {
  APPROVAL_STATUS_STYLES,
  DISPLAY_STATUS_STYLES,
  MOVEMENT_TYPE_STYLES,
  getDisplayStatusStyle,
  getMovementDisplayStyle,
  type DisplayStatusStyle,
} from "@/lib/theme/status-display-tokens";

export const APPROVAL_BRAND_COLORS = BRAND_COLORS;

export type ApprovalBadgeStyle = DisplayStatusStyle;
export const approvalStatusBadgeStyleMap = APPROVAL_STATUS_STYLES;
export const fallbackBadgeStyle = DISPLAY_STATUS_STYLES.fallback;
export const movementTypeBadgeStyleMap = MOVEMENT_TYPE_STYLES;

export const brandButtonStyle = {
  ...STANDARD_BUTTON_STYLES.md,
  bg: APPROVAL_BRAND_COLORS.primaryGreen,
  color: APPROVAL_BRAND_COLORS.white,
  borderColor: APPROVAL_BRAND_COLORS.primaryGreen,
  _hover: {
    bg: APPROVAL_BRAND_COLORS.darkGreen,
    borderColor: APPROVAL_BRAND_COLORS.darkGreen,
  },
  _active: {
    bg: APPROVAL_BRAND_COLORS.darkGreen,
    borderColor: APPROVAL_BRAND_COLORS.darkGreen,
  },
};

export const destructiveOutlineButtonStyle = {
  ...STANDARD_BUTTON_STYLES.md,
  color: APPROVAL_BRAND_COLORS.destructiveRed,
  borderColor: APPROVAL_BRAND_COLORS.destructiveRed,
  _hover: {
    bg: APPROVAL_BRAND_COLORS.errorBg,
    color: APPROVAL_BRAND_COLORS.destructiveRed,
    borderColor: APPROVAL_BRAND_COLORS.destructiveRed,
  },
  _active: {
    bg: APPROVAL_BRAND_COLORS.errorBg,
    color: APPROVAL_BRAND_COLORS.destructiveRed,
    borderColor: APPROVAL_BRAND_COLORS.destructiveRed,
  },
};

export const neutralOutlineButtonStyle = {
  ...STANDARD_BUTTON_STYLES.md,
  color: APPROVAL_BRAND_COLORS.neutralText,
  borderColor: APPROVAL_BRAND_COLORS.neutralBorder,
  _hover: {
    bg: APPROVAL_BRAND_COLORS.subtleBg,
    borderColor: APPROVAL_BRAND_COLORS.neutralBorder,
  },
};

export function getApprovalStatusBadgeStyle(status: string) {
  return getDisplayStatusStyle(status);
}

export function getMovementTypeBadgeStyle(movementType: string) {
  return getMovementDisplayStyle(movementType);
}
