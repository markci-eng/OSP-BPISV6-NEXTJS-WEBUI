/**
 * A request that has finished, as the history drawer lists it.
 *
 * THE KINDS ARE NO LONGER PLAN-MANAGEMENT'S ALONE (2026-09-16). The four below
 * the rule were the whole union while the drawer was only ever opened from the
 * plan-management profile; the CLAIMS profile opens it too now, and what it has
 * to list there is a death claim or a service payable. Widening is additive —
 * every existing caller passes one of the original four and is untouched — and
 * it is the alternative to a second drawer that does the same thing in the same
 * place with two of the strings changed.
 *
 * ADD A KIND HERE AND GIVE IT AN ICON in `request-history-drawer`'s `typeIcon`.
 * That switch has a `default`, so a kind without one degrades to a document
 * glyph rather than breaking — but it degrades silently, which is the reason to
 * say so here.
 */
export interface RequestHistoryItem {
  type:
    | "Reinstatement"
    | "Change of Mode"
    | "Transfer of Rights"
    | "Returned of Premium"
    // Claims
    | "Death Claim"
    | "Service Payable";
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
