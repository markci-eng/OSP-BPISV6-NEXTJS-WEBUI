const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Large counts read better abbreviated: 12,100 → "12.1k", 3,400,000 → "3.4m",
 * 2,000,000,000 → "2b". Intl spells the suffix in capitals and leaves anything
 * under a thousand alone, so 67 new sales stays 67.
 */
export const formatCompact = (value: number) =>
  compactFormat.format(value).toLowerCase();
