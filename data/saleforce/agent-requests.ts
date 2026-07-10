import { RequestProps } from "@/components/new-planholder-profile/sections/pending-requests";

export const MOCK_AGENT_REQUESTS: RequestProps[] = [
  {
    type: "Reinstatement",
    title: "Contract Renewal",
    description: "Waiting for approval.",
    transactionId: "RI-202-6311",
    currentStep: 3,
    totalSteps: 7,
    status: "Pending",
    date: "",
    hyperlink: "/transaction/CA-202-6311",
  },
  {
    type: "Transfer of Rights",
    title: "Transfer Approval",
    description: "Waiting for approval.",
    transactionId: "TR-202-6309",
    currentStep: 2,
    totalSteps: 3,
    status: "Pending",
    date: "",
    hyperlink: "/transaction/TR-202-6311",
  },
];
