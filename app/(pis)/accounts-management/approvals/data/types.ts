export type ApprovalStatus = "Pending" | "Approved" | "Denied";

export type ApprovalView =
  | "rop"
  | "reinstatement"
  | "transfer-of-rights"
  | "plan-termination"
  | "csv"
  | "cofp"
  | "credit-memo"
  | "debit-memo";

export interface BaseApproval {
  status: ApprovalStatus;
  requestDate: string;
  requester: string;
}

export interface ROPApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  ropDate: string;
  totalAmount: number;
}

export interface ReinstatementApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  mop: string;
  balance: number;
  reinstatementFee: number;
  dueDate: string;
}

export interface TransferOfRightsApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planType: string;
  fromPlanholder: string;
  toPlanholder: string;
  balance: number;
  installmentAmount: number;
}

export interface PlanTerminationApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  terminationReason: string;
  refundAmount: number;
  terminationDate: string;
}

export interface CSVApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  surrenderValue: number;
  surrenderDate: string;
  reason: string;
}

export interface COFPApproval extends BaseApproval {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  cfpNumber: string;
  cfpDate: string;
  totalAmountPaid: number;
}

export interface CreditMemoApproval extends BaseApproval {
  id: string;
  memoNo: string;
  planholderName: string;
  creditMemoType: "BANK_PAYMENT" | "UN_REMITTED" | "CORRECTION";
  amount: number;
  remarks: string;
}

export interface DebitMemoApproval extends BaseApproval {
  id: string;
  memoNo: string;
  planholderName: string;
  debitMemoType: string;
  amount: number;
  remarks: string;
}
