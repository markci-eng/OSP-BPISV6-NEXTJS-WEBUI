import { BadgeProps } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface OSPBadgeProps extends BadgeProps {
  type?: "success" | "info" | "warning" | "danger" | undefined;
}

interface OSPBadgeColorProps {
  type?: "success" | "info" | "warning" | "danger" | undefined;
  background: string;
  foreground: string;
  border: string;
}

export const OSPBadgeTypes: OSPBadgeColorProps[] = [
  {
    type: undefined,
    background: BRAND_COLORS.mutedBg,
    foreground: BRAND_COLORS.neutralText,
    border: BRAND_COLORS.neutralBorder,
  },
  {
    type: "success",
    background: BRAND_COLORS.successBg,
    foreground: BRAND_COLORS.primaryGreen,
    border: BRAND_COLORS.primaryGreen,
  },
  {
    type: "info",
    background: BRAND_COLORS.lightCyan,
    foreground: BRAND_COLORS.darkGreen,
    border: BRAND_COLORS.seafoamGreen,
  },
  {
    type: "warning",
    background: BRAND_COLORS.warningBg,
    foreground: BRAND_COLORS.warningText,
    border: BRAND_COLORS.warningBorder,
  },
  {
    type: "danger",
    background: BRAND_COLORS.errorBg,
    foreground: BRAND_COLORS.destructiveRed,
    border: BRAND_COLORS.destructiveRed,
  },
];
