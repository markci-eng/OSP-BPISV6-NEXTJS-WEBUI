import type {
    ProcessOverview,
    ProcessByType,
    QuotaAndCollections,
    StaffLeaderboardEntry,
    MonthlyProcessYear,
} from "@/data/dashboard/types";

export const processOverview: ProcessOverview = {
    newRequests: 42,
    inProcess: 19,
    completed: 156,
    pendingApproval: 11,
    prevNewRequests: 37,
    prevInProcess: 24,
    prevCompleted: 142,
    prevPendingApproval: 15,
};

export const processByType: ProcessByType[] = [
    { type: "RITF", pending: 6, processing: 4, completed: 38 },
    { type: "ROP", pending: 3, processing: 5, completed: 29 },
    { type: "Plan Termination", pending: 2, processing: 3, completed: 21 },
    { type: "CSV", pending: 4, processing: 2, completed: 17 },
    { type: "COFP", pending: 5, processing: 3, completed: 25 },
    { type: "CMDM", pending: 1, processing: 2, completed: 26 },
];

export const quotaAndCollections: QuotaAndCollections = {
    comQuota: 81525,
    comCollection: 35000,
    comAcctDue: 60,
    comAcctCollection: 18,
    nComQuota: 311415,
    nComCollection: 267485,
    nComAcctDue: 126,
    nComAcctCollection: 77
}

export const staffLeaderboard: StaffLeaderboardEntry[] = [
    { name: "JOAN REYES", ns: 34 },
    { name: "ARMANDO DELA CRUZ", ns: 31 },
    { name: "PRECIOUS MAE ONG", ns: 29 },
    { name: "RICHARD BAUTISTA", ns: 27 },
    { name: "MA. THERESA GONZALES", ns: 24 },
    { name: "JOEL SANTIAGO", ns: 21 },
    { name: "KRISTINE JOY ABAD", ns: 19 },
    { name: "DANILO MERCADO", ns: 16 },
    { name: "FLORDELIZA PASCUAL", ns: 13 },
    { name: "RONALD ESPINOSA", ns: 9 },
];

export const monthlyProcesses: MonthlyProcessYear[] = [
    {
        year: "2026",
        data: [
            { month: "Jan", value: 142 },
            { month: "Feb", value: 156 },
            { month: "Mar", value: 131 },
            { month: "Apr", value: 148 },
            { month: "May", value: 137 },
            { month: "Jun", value: 162 },
            { month: "Jul", value: 0 },
            { month: "Aug", value: 0 },
            { month: "Sep", value: 0 },
            { month: "Oct", value: 0 },
            { month: "Nov", value: 0 },
            { month: "Dec", value: 0 },
        ]
    },
    {
        year: "2025",
        data: [
            { month: "Jan", value: 118 },
            { month: "Feb", value: 96 },
            { month: "Mar", value: 134 },
            { month: "Apr", value: 102 },
            { month: "May", value: 121 },
            { month: "Jun", value: 145 },
            { month: "Jul", value: 109 },
            { month: "Aug", value: 138 },
            { month: "Sep", value: 127 },
            { month: "Oct", value: 115 },
            { month: "Nov", value: 149 },
            { month: "Dec", value: 98 },
        ]
    },
    {
        year: "2024",
        data: [
            { month: "Jan", value: 88 },
            { month: "Feb", value: 76 },
            { month: "Mar", value: 92 },
            { month: "Apr", value: 84 },
            { month: "May", value: 101 },
            { month: "Jun", value: 97 },
            { month: "Jul", value: 110 },
            { month: "Aug", value: 105 },
            { month: "Sep", value: 93 },
            { month: "Oct", value: 87 },
            { month: "Nov", value: 116 },
            { month: "Dec", value: 122 },
        ]
    },
];