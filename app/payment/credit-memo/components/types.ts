export type CreditMemoType = "BANK_PAYMENT" | "UN_REMITTED" | "CORRECTION";
export type DepositStatus = "required" | "optional" | "none";

export interface BatchInfo {
  batchNo: string;
  type: CreditMemoType | "";
  subtype: string;
  description: string;
}

export interface Deposit {
  id: string;
  depositDate: string;
  remittanceDate: string;
  bankName: string;
  bankCode: string;
  bankBranch: string;
  account: string;
  checkbook: string;
  amount: number;
  depositedBy: string;
  depositType: string;
}

export interface Payment {
  id: string;
  depositId: string | null;
  planholderName: string;
  planholderId: string;
  siNumber: string;
  siDate: string;
  installments: number;
  amount: number;
  payClass: string;
  charges: number;
}

export interface Planholder {
  id: string;
  name: string;
  policyNo: string;
  plan: string;
  status: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  file: File;
}

export const CREDIT_MEMO_TYPES: {
  value: CreditMemoType;
  label: string;
  depositStatus: DepositStatus;
  helper: string;
}[] = [
  {
    value: "BANK_PAYMENT",
    label: "Bank Payment",
    depositStatus: "required",
    helper: "Requires at least one deposit record.",
  },
  {
    value: "UN_REMITTED",
    label: "Un-Remitted Collection",
    depositStatus: "optional",
    helper: "Deposit is optional for this type.",
  },
  {
    value: "CORRECTION",
    label: "Correction / Transfer",
    depositStatus: "none",
    helper: "No deposit required.",
  },
];

export function getDepositStatus(type: CreditMemoType | ""): DepositStatus {
  const found = CREDIT_MEMO_TYPES.find((t) => t.value === type);
  return found?.depositStatus ?? "none";
}
