import { RESPONSIVE_LAYOUT_TOKENS } from "./layout-tokens";

export const STANDARD_SPACING = {
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "32px",
  xl: "48px",
  section: "64px",
  pageMobile: RESPONSIVE_LAYOUT_TOKENS.pagePadding.base,
  pageTablet: RESPONSIVE_LAYOUT_TOKENS.pagePadding.md,
  pageDesktop: RESPONSIVE_LAYOUT_TOKENS.pagePadding.lg,
  pageDesktopMax: RESPONSIVE_LAYOUT_TOKENS.pagePadding.xl,
  cardGap: RESPONSIVE_LAYOUT_TOKENS.card.gap.base,
  formFieldGap: RESPONSIVE_LAYOUT_TOKENS.form.fieldGap,
  labelValueGap: RESPONSIVE_LAYOUT_TOKENS.form.labelValueGapMin,
} as const;

export const STANDARD_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
  circle: "50%",
} as const;

export const STANDARD_SHADOWS = {
  level1: "0px 2px 8px rgba(0,0,0,0.06)",
  level2: "0px 4px 12px rgba(0,0,0,0.08)",
  level3: "0px 8px 24px rgba(0,0,0,0.10)",
  level4: "0px 12px 32px rgba(0,0,0,0.12)",
} as const;

export const STANDARD_SIZES = {
  iconButton: {
    sm: "32px",
    md: "40px",
    lg: "48px",
  },
  button: {
    sm: {
      height: "32px",
      minWidth: "72px",
      fontSize: "12px",
      fontWeight: "600",
      lineHeight: "20px",
      letterSpacing: "0.5px",
    },
    md: {
      height: "40px",
      minWidth: "96px",
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "20px",
      letterSpacing: "0.5px",
    },
    lg: {
      height: "48px",
      minWidth: "112px",
      fontSize: "16px",
      fontWeight: "600",
      lineHeight: "24px",
      letterSpacing: "1px",
    },
    xl: {
      height: "56px",
      minWidth: "128px",
      fontSize: "18px",
      fontWeight: "700",
      lineHeight: "28px",
      letterSpacing: "1px",
    },
  },
  searchInput: {
    height: "40px",
    maxHeight: "48px",
    desktopMinWidth: "240px",
    desktopMaxWidth: "320px",
    iconSize: "16px",
  },
  table: {
    dragColumnWidth: "32px",
    selectionColumnWidth: "40px",
    actionsColumnWidth: "44px",
    rowActionWidth: "32px",
    headerHeight: "40px",
  },
  card: {
    sm: "320px",
    md: "480px",
    lg: "800px",
    mobilePadding: RESPONSIVE_LAYOUT_TOKENS.card.padding.base,
    desktopPadding: RESPONSIVE_LAYOUT_TOKENS.card.padding.md,
  },
  modal: {
    minWidth: "320px",
    maxWidth: "480px",
    minHeight: "120px",
    maxHeight: "280px",
  },
  reportImage: {
    logoWidth: "250px",
    logoHeight: "150px",
  },
} as const;

export const STANDARD_BUTTON_STYLES = {
  sm: {
    h: STANDARD_SIZES.button.sm.height,
    minW: STANDARD_SIZES.button.sm.minWidth,
    px: STANDARD_SPACING.sm,
    borderRadius: STANDARD_RADIUS.md,
    fontSize: STANDARD_SIZES.button.sm.fontSize,
    fontWeight: STANDARD_SIZES.button.sm.fontWeight,
    lineHeight: STANDARD_SIZES.button.sm.lineHeight,
  },
  md: {
    h: STANDARD_SIZES.button.md.height,
    minW: STANDARD_SIZES.button.md.minWidth,
    px: STANDARD_SPACING.sm,
    borderRadius: STANDARD_RADIUS.md,
    fontSize: STANDARD_SIZES.button.md.fontSize,
    fontWeight: STANDARD_SIZES.button.md.fontWeight,
    lineHeight: STANDARD_SIZES.button.md.lineHeight,
  },
} as const;

export const STANDARD_ICON_BUTTON_STYLES = {
  sm: {
    boxSize: STANDARD_SIZES.iconButton.sm,
    minW: STANDARD_SIZES.iconButton.sm,
    borderRadius: STANDARD_RADIUS.md,
  },
  md: {
    boxSize: STANDARD_SIZES.iconButton.md,
    minW: STANDARD_SIZES.iconButton.md,
    borderRadius: STANDARD_RADIUS.md,
  },
} as const;
