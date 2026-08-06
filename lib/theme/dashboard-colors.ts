/**
 * Shared accent palette for dashboard KPI/stat tiles. Each dashboard page
 * (bpis, accounts-management, claims, disbursement, payment, plan-management,
 * sales-force, accounts-maintenance) draws its own subset of these for its
 * specific metrics — this is a shared palette, not a fixed per-page tuple.
 */
export const DASHBOARD_ACCENT_COLORS = {
  positive: "#1B9E57",
  info: "#1976D2",
  warning: "#F57C00",
  purple: "#8E24AA",
  danger: "#E53E3E",
} as const;

/** Month-over-month trend indicator colors used on dashboard stat tiles. */
export const TREND_COLORS = {
  positiveText: "#1B9E57",
  negativeText: "#D32F2F",
  positiveBg: "#E8F5E9",
  negativeBg: "#FFEBEE",
} as const;
