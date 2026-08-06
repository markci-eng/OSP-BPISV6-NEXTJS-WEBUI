import type {
  ApprovalStatus,
  COFPApproval,
  CSVApproval,
  CreditMemoApproval,
  DebitMemoApproval,
  PlanTerminationApproval,
  ROPApproval,
  ReinstatementApproval,
  TransferOfRightsApproval,
} from "./types";

export const APPROVAL_STATUSES: ApprovalStatus[] = [
  "Pending",
  "Pending",
  "Approved",
  "Denied",
];

export const EMPLOYEES = [
  "Grae Sensano",
  "Bryan Breezy Dalagdag",
  "Mark Ibe",
  "Jerome Jardio",
  "Jimwell Ocsio",
];

export const PLANHOLDERS = [
  "Juan Dela Cruz",
  "Maria Santos",
  "Pedro Reyes",
  "Ana Bautista",
  "Jose Mercado",
  "Liza Fernandez",
];

export const PLAN_TYPES = ["G5M6", "G1A6", "LG5A10", "LG5M10", "A1A10", "G5Q6"];

function lpaNo(i: number) {
  return `L26${String(1000 + i).padStart(5, "0")}`;
}

function requestDate(i: number) {
  return `2026-04-${String((i % 30) + 1).padStart(2, "0")}`;
}

export const ROP_DATA: ROPApproval[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ROP-${String(i + 1).padStart(4, "0")}`,
  lpaNo: lpaNo(i),
  planholderName: PLANHOLDERS[i % PLANHOLDERS.length],
  planType: PLAN_TYPES[i % PLAN_TYPES.length],
  ropDate: requestDate(i),
  totalAmount: 5000 + i * 250,
  status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
  requestDate: requestDate(i),
  requester: EMPLOYEES[i % EMPLOYEES.length],
}));

export const REINSTATEMENT_DATA: ReinstatementApproval[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: `RI-${String(i + 1).padStart(4, "0")}`,
    lpaNo: lpaNo(i),
    planholderName: PLANHOLDERS[(i + 1) % PLANHOLDERS.length],
    planType: PLAN_TYPES[(i + 1) % PLAN_TYPES.length],
    mop: i % 2 === 0 ? "MONTHLY" : "QUARTERLY",
    balance: 3000 + i * 150,
    reinstatementFee: 200 + i * 10,
    dueDate: requestDate(i),
    status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    requestDate: requestDate(i),
    requester: EMPLOYEES[(i + 1) % EMPLOYEES.length],
  }),
);

export const TRANSFER_OF_RIGHTS_DATA: TransferOfRightsApproval[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: `TOR-${String(i + 1).padStart(4, "0")}`,
    lpaNo: lpaNo(i),
    planType: PLAN_TYPES[(i + 2) % PLAN_TYPES.length],
    fromPlanholder: PLANHOLDERS[i % PLANHOLDERS.length],
    toPlanholder: PLANHOLDERS[(i + 2) % PLANHOLDERS.length],
    balance: 4000 + i * 200,
    installmentAmount: 800 + i * 25,
    status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    requestDate: requestDate(i),
    requester: EMPLOYEES[(i + 2) % EMPLOYEES.length],
  }),
);

export const PLAN_TERMINATION_DATA: PlanTerminationApproval[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: `PT-${String(i + 1).padStart(4, "0")}`,
    lpaNo: lpaNo(i),
    planholderName: PLANHOLDERS[(i + 3) % PLANHOLDERS.length],
    planType: PLAN_TYPES[(i + 3) % PLAN_TYPES.length],
    terminationReason: i % 2 === 0 ? "Non-payment" : "Planholder request",
    refundAmount: 1000 + i * 100,
    terminationDate: requestDate(i),
    status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    requestDate: requestDate(i),
    requester: EMPLOYEES[(i + 3) % EMPLOYEES.length],
  }),
);

export const CSV_DATA: CSVApproval[] = Array.from({ length: 15 }, (_, i) => ({
  id: `CSV-${String(i + 1).padStart(4, "0")}`,
  lpaNo: lpaNo(i),
  planholderName: PLANHOLDERS[(i + 4) % PLANHOLDERS.length],
  planType: PLAN_TYPES[(i + 4) % PLAN_TYPES.length],
  surrenderValue: 6000 + i * 300,
  surrenderDate: requestDate(i),
  reason: i % 2 === 0 ? "Financial hardship" : "Plan replacement",
  status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
  requestDate: requestDate(i),
  requester: EMPLOYEES[(i + 4) % EMPLOYEES.length],
}));

export const COFP_DATA: COFPApproval[] = Array.from({ length: 15 }, (_, i) => ({
  id: `COFP-${String(i + 1).padStart(4, "0")}`,
  lpaNo: lpaNo(i),
  planholderName: PLANHOLDERS[i % PLANHOLDERS.length],
  planType: PLAN_TYPES[i % PLAN_TYPES.length],
  cfpNumber: `CFP-${String(2600 + i)}`,
  cfpDate: requestDate(i),
  totalAmountPaid: 60000 + i * 500,
  status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
  requestDate: requestDate(i),
  requester: EMPLOYEES[i % EMPLOYEES.length],
}));

export const CREDIT_MEMO_DATA: CreditMemoApproval[] = Array.from(
  { length: 15 },
  (_, i) => {
    const types: CreditMemoApproval["creditMemoType"][] = [
      "BANK_PAYMENT",
      "UN_REMITTED",
      "CORRECTION",
    ];

    return {
      id: `CM-${String(i + 1).padStart(4, "0")}`,
      memoNo: `CRM-${String(3000 + i)}`,
      planholderName: PLANHOLDERS[(i + 1) % PLANHOLDERS.length],
      creditMemoType: types[i % types.length],
      amount: 1500 + i * 100,
      remarks: "Overpayment adjustment",
      status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
      requestDate: requestDate(i),
      requester: EMPLOYEES[(i + 1) % EMPLOYEES.length],
    };
  },
);

export const DEBIT_MEMO_DATA: DebitMemoApproval[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: `DM-${String(i + 1).padStart(4, "0")}`,
    memoNo: `DBM-${String(4000 + i)}`,
    planholderName: PLANHOLDERS[(i + 2) % PLANHOLDERS.length],
    debitMemoType: i % 2 === 0 ? "Underpayment" : "Charge back",
    amount: 1000 + i * 80,
    remarks: "Shortage on remittance",
    status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    requestDate: requestDate(i),
    requester: EMPLOYEES[(i + 2) % EMPLOYEES.length],
  }),
);
