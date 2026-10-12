import type { RequestProps } from "@/components/plan-management/planholder-profile/sections/pending-requests";

/** The planholder's open and recent requests, until the API serves them. */
export const MOCK_REQUESTS: RequestProps[] = [
  {
    type: "Reinstatement",
    title: "Reinstatement",
    description: "2025-001234 · Annual Premium",
    transactionId: "RI-2025-001234",
    currentStep: 2,
    totalSteps: 4,
    status: "Pending",
    date: "May 20, 2026",
    hyperlink: "#",
  },
  {
    type: "Change of Mode",
    title: "Change of Mode",
    description: "2025-005678 · Quarterly to Monthly",
    transactionId: "COM-2025-005678",
    currentStep: 1,
    totalSteps: 3,
    status: "Pending",
    date: "May 24, 2026",
    hyperlink: "#",
  },
  {
    type: "Returned of Premium",
    title: "ROP Application",
    description: "2024-009876 · Maturity Benefit",
    transactionId: "ROP-2024-009876",
    currentStep: 3,
    totalSteps: 3,
    status: "Approved",
    date: "Nov 15, 2025",
    hyperlink: "#",
  },
  {
    type: "Transfer of Rights",
    title: "Transfer of Rights",
    description: "2024-003456 · Beneficiary Change",
    transactionId: "TF-2024-003456",
    currentStep: 2,
    totalSteps: 4,
    status: "Denied",
    date: "Sep 3, 2025",
    hyperlink: "#",
  },
];
