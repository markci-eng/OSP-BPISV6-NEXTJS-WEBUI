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
  ns: number;
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
