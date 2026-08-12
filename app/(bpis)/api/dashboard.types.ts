export type AccountOverview = {
  newSales: number;
  prevNewSales: number;
  activeAccounts: number;
  prevActiveAccounts: number;
  lapsedAccounts: number;
  prevLapsedAccounts: number;
  terminatedAccounts: number;
  prevTerminatedAccounts: number;
};

export type QuotaAndCollections = {
  comQuota: number;
  comCollection: number;
  comAcctDue: number;
  comAcctCollection: number;
  nComQuota: number;
  nComCollection: number;
  nComAcctDue: number;
  nComAcctCollection: number;
};

export type AgentLeaderboardEntry = {
  name: string;
  /** New sales — plans enrolled this month. */
  ns: number;
  /** Collection target for the month, in pesos. */
  quota: number;
  /** Amount actually collected this month, in pesos. */
  collection: number;
  /** Number of accounts falling due this month. */
  acctDue: number;
  /** Number of those due accounts that were collected. */
  acctCollection: number;
};

export type DashboardOverview = {
  accountOverview: AccountOverview;
  quotaAndCollections: QuotaAndCollections;
  agentLeaderboard: AgentLeaderboardEntry[];
};

export type MonthlySalesPoint = {
  month: string;
  value: number;
};

export type MonthlySalesYear = "2026" | "2025" | "2024";
