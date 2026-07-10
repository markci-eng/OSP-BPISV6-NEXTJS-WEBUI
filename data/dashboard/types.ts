export interface ProcessOverview {
  newRequests: number;
  inProcess: number;
  completed: number;
  pendingApproval: number;
  prevNewRequests: number;
  prevInProcess: number;
  prevCompleted: number;
  prevPendingApproval: number;
}

export interface ProcessByType {
  type: string;
  pending: number;
  processing: number;
  completed: number;
}

export interface QuotaAndCollections {
  comQuota: number;
  comCollection: number;
  comAcctDue: number;
  comAcctCollection: number;
  nComQuota: number;
  nComCollection: number;
  nComAcctDue: number;
  nComAcctCollection: number;
}

export interface StaffLeaderboardEntry {
  name: string;
  ns: number;
}

export interface MonthlyProcessYear {
  year: string;
  data: { month: string; value: number }[];
}

export interface ProcessDashboardData {
  processOverview: ProcessOverview;
  processByType: ProcessByType[];
  quotaAndCollections: QuotaAndCollections;
  staffLeaderboard: StaffLeaderboardEntry[];
  monthlyProcesses: MonthlyProcessYear[];
}
