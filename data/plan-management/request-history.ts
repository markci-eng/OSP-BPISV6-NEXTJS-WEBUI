export interface RequestHistoryItem {
  type:
    | "Reinstatement"
    | "Change of Mode"
    | "Transfer of Rights"
    | "Returned of Premium";
  description: string;
  transactionId: string;
  date: string;
}

export const mockRequestHistory: RequestHistoryItem[] = [
  {
    type: "Reinstatement",
    description: "Approved — Account has been reinstated.",
    transactionId: "RI-202-5821",
    date: "2025-12-18",
  },
  {
    type: "Reinstatement",
    description: "Approved — Account has been reinstated.",
    transactionId: "RI-202-5190",
    date: "2025-09-02",
  },
  {
    type: "Change of Mode",
    description: "Approved — Change of mode from Monthly to Quarterly.",
    transactionId: "CH-202-4602",
    date: "2025-06-11",
  },
  {
    type: "Transfer of Rights",
    description: "Approved — Plan has been transferred.",
    transactionId: "TR-202-3910",
    date: "2024-12-20",
  },
  {
    type: "Reinstatement",
    description: "Denied - Insufficient documentation.",
    transactionId: "RI-202-3301",
    date: "2024-03-05",
  },
];
