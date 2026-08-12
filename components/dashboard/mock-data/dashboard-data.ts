export const planholders = {
    newSales: 67,
    activeAccounts: 12136,
    lapsedAccounts: 7305,
    terminatedAccounts: 24739,
    prevNewSales: 83,
    prevActiveAccounts: 12125,
    prevLapsedAccounts: 7310,
    prevTerminatedAccounts: 24739,
};

export const quotaAndCollections = {
    comQuota: 81525,
    comCollection: 35000,
    comAcctDue: 60,
    comAcctCollection: 18,
    nComQuota: 311415,
    nComCollection: 267485,
    nComAcctDue: 126,
    nComAcctCollection: 77
}

export const monthlyNewSales = [
    {
        year: "2026",
        data: [
            { month: "Jan", value: 83 },
            { month: "Feb", value: 67 },
            { month: "Mar", value: 0 },
            { month: "Apr", value: 0 },
            { month: "May", value: 0 },
            { month: "Jun", value: 0 },
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
            { month: "Jan", value: 85 },
            { month: "Feb", value: 35 },
            { month: "Mar", value: 97 },
            { month: "Apr", value: 35 },
            { month: "May", value: 89 },
            { month: "Jun", value: 90 },
            { month: "Jul", value: 45 },
            { month: "Aug", value: 98 },
            { month: "Sep", value: 54 },
            { month: "Oct", value: 45 },
            { month: "Nov", value: 78 },
            { month: "Dec", value: 34 },
        ]
    },
    {
        year: "2024",
        data: [
            { month: "Jan", value: 67 },
            { month: "Feb", value: 32 },
            { month: "Mar", value: 34 },
            { month: "Apr", value: 45 },
            { month: "May", value: 65 },
            { month: "Jun", value: 76 },
            { month: "Jul", value: 77 },
            { month: "Aug", value: 78 },
            { month: "Sep", value: 65 },
            { month: "Oct", value: 66 },
            { month: "Nov", value: 87 },
            { month: "Dec", value: 89 },
        ]
    },
];

// Per-agent quota / collection / account figures sum to the `quotaAndCollections`
// totals above, so the leaderboard and the efficiency cards agree.
export const agentLeaderboards = [
    { name: "MARC NOEL SENIER", ns: 45, quota: 62400, collection: 55120, acctDue: 26, acctCollection: 17 },
    { name: "ELLA PALMERO", ns: 43, quota: 58150, collection: 42300, acctDue: 24, acctCollection: 11 },
    { name: "VICENTE LACATANGO", ns: 38, quota: 41800, collection: 38940, acctDue: 19, acctCollection: 13 },
    { name: "EREBERTO LACUESTA", ns: 37, quota: 47600, collection: 25180, acctDue: 21, acctCollection: 8 },
    { name: "CAROLINA VILLANUEVA", ns: 34, quota: 36250, collection: 33410, acctDue: 17, acctCollection: 12 },
    { name: "LUZVIMINDA ANGUE", ns: 26, quota: 39900, collection: 21650, acctDue: 18, acctCollection: 7 },
    { name: "SHEMINE COSARE", ns: 25, quota: 28700, collection: 26845, acctDue: 14, acctCollection: 10 },
    { name: "NORMA URO", ns: 22, quota: 33540, collection: 19220, acctDue: 16, acctCollection: 6 },
    { name: "MERCEDES JANOBAS", ns: 18, quota: 24900, collection: 23110, acctDue: 12, acctCollection: 8 },
    { name: "YOLANDA MACAPAGAL", ns: 14, quota: 19700, collection: 16710, acctDue: 19, acctCollection: 3 },
];