export const RESPONSIVE_LAYOUT_TOKENS = {
  grid: {
    mobile: {
      columns: 4,
      gutter: "16px",
      marginMin: "16px",
      marginMax: "32px",
      minWidth: "320px",
      maxWidth: "768px",
    },
    tablet: {
      columns: 8,
      gutterMin: "16px",
      gutterMax: "24px",
      marginMin: "40px",
      marginMax: "80px",
      contentMinWidth: "600px",
      contentMaxWidth: "940px",
    },
    desktop: {
      columns: 12,
      gutterMin: "16px",
      gutterMax: "32px",
      marginMin: "80px",
      marginMax: "120px",
      contentMinWidth: "1200px",
      contentMaxWidth: "1440px",
    },
  },
  pagePadding: {
    base: "16px",
    md: "24px",
    lg: "32px",
    xl: "64px",
  },
  navigationOffset: {
    base: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
  },
  sectionGap: {
    base: "32px",
    md: "48px",
    lg: "64px",
  },
  card: {
    gap: {
      base: "16px",
      md: "24px",
    },
    padding: {
      base: "16px",
      md: "24px",
    },
    mobilePadding: {
      base: "16px",
      md: "20px",
    },
  },
  form: {
    fieldGap: "16px",
    labelValueGapMin: "8px",
    labelValueGapMax: "12px",
    containerMinWidth: "480px",
    containerMaxWidth: "720px",
  },
  search: {
    width: {
      base: "100%",
      mdMin: "240px",
      mdMax: "320px",
    },
    heightMin: "40px",
    heightMax: "48px",
  },
} as const;

export const PAGE_PADDING = RESPONSIVE_LAYOUT_TOKENS.pagePadding;
export const SECTION_GAP = RESPONSIVE_LAYOUT_TOKENS.sectionGap;
export const CARD_LAYOUT = RESPONSIVE_LAYOUT_TOKENS.card;
export const FORM_LAYOUT = RESPONSIVE_LAYOUT_TOKENS.form;
export const SEARCH_LAYOUT = RESPONSIVE_LAYOUT_TOKENS.search;
