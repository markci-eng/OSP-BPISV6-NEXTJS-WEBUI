import type {
    ProcessOverview,
    ProcessByType,
    QuotaAndCollections,
    StaffLeaderboardEntry,
    MonthlyProcessYear,
} from "@/data/dashboard/types";

export const processOverview: ProcessOverview = {
    newRequests: 28,
    inProcess: 14,
    completed: 97,
    pendingApproval: 8,
    prevNewRequests: 33,
    prevInProcess: 17,
    prevCompleted: 89,
    prevPendingApproval: 12,
};

export const processByType: ProcessByType[] = [
    { type: "Death", pending: 3, processing: 5, completed: 32 },
    { type: "WOI", pending: 2, processing: 3, completed: 21 },
    { type: "Dismemberment", pending: 1, processing: 2, completed: 14 },
    { type: "Service Payables", pending: 2, processing: 4, completed: 30 },
];

export const quotaAndCollections: QuotaAndCollections = {
    comQuota: 54200,
    comCollection: 31800,
    comAcctDue: 40,
    comAcctCollection: 26,
    nComQuota: 198750,
    nComCollection: 152300,
    nComAcctDue: 84,
    nComAcctCollection: 58
}

export const staffLeaderboard: StaffLeaderboardEntry[] = [
    { name: "GIL ANTHONY REYES", ns: 27 },
    { name: "MARJORIE CASTILLO", ns: 24 },
    { name: "EDUARDO NAVARRO", ns: 22 },
    { name: "IMELDA SORIANO", ns: 20 },
    { name: "ALVIN TORRES", ns: 17 },
    { name: "ROSEMARIE DAVID", ns: 15 },
    { name: "NESTOR AQUINO", ns: 12 },
    { name: "CHONA LIM", ns: 10 },
    { name: "BENEDICT FLORES", ns: 7 },
    { name: "ANALYN PADILLA", ns: 5 },
];

export const monthlyProcesses: MonthlyProcessYear[] = [
    {
        year: "2026",
        data: [
            { month: "Jan", value: 91 },
            { month: "Feb", value: 84 },
            { month: "Mar", value: 78 },
            { month: "Apr", value: 96 },
            { month: "May", value: 88 },
            { month: "Jun", value: 97 },
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
            { month: "Jan", value: 72 },
            { month: "Feb", value: 65 },
            { month: "Mar", value: 81 },
            { month: "Apr", value: 69 },
            { month: "May", value: 77 },
            { month: "Jun", value: 85 },
            { month: "Jul", value: 74 },
            { month: "Aug", value: 90 },
            { month: "Sep", value: 79 },
            { month: "Oct", value: 71 },
            { month: "Nov", value: 93 },
            { month: "Dec", value: 66 },
        ]
    },
    {
        year: "2024",
        data: [
            { month: "Jan", value: 54 },
            { month: "Feb", value: 48 },
            { month: "Mar", value: 61 },
            { month: "Apr", value: 57 },
            { month: "May", value: 63 },
            { month: "Jun", value: 59 },
            { month: "Jul", value: 68 },
            { month: "Aug", value: 64 },
            { month: "Sep", value: 58 },
            { month: "Oct", value: 55 },
            { month: "Nov", value: 71 },
            { month: "Dec", value: 76 },
        ]
    },
];
