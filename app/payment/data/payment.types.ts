export interface DepositHdr {
  id: string;
  name: string;
  DepositDateTime: string; // e.g., "2026-03-02 14:01:53"
  AccountNo: string; // account number
  BankBranch: string; // branch name
  BankCode: string; // bank code
  Amount: string; // amount as string with currency symbol
  DepositedBy: string; // name of depositor
  isApproved: number; // 0 or 1
  SlipDate?: string; // remittance slip date, e.g. "2026-03-24"
  Planholders?: number; // number of planholders in the slip
  Status?: "Pending" | "Validated" | "For Deposit"; // remittance slip status
}

export type PaymentRecord = {
  LPANo: string;
  name: string;
  SI: string;
  SIDate: string;
  SIAmount: string;
  InstNo: string;
  PayClass: string;
  TEPCV: string;
  TEDue: string;
  COMPCV: string;
  GrossCom: string;
  TaxCom: string;
  ComDue: string;
  AuditDate: string;
  AuditUser: string;
  EditDate: string;
  EditUser: string;
};
export const tableItems: PaymentRecord[] = [];

export type DrsColumn<T> = {
  key: keyof T;
  header: React.ReactNode;
  align?: "start" | "end";
  render?: (row: T) => React.ReactNode;
};

export type DrsRowData = {
  LPANo: string;
  name: string;
  InstNo: string;
  SIDate: string;
  SI: string;
  PayClass: string;
  remarks: string;
  aging: string;
  GrossCom?: number;
  ncom?: number;
  others?: number;
  ComDue?: number;
  TEPCV?: number;
  COMPCV?: number;
  net?: number;
  cancelled?: boolean;
};

export type DrsTotals = {
  GrossCom: number;
  ncom: number;
  others: number;
  ComDue: number;
  TEPCV: number;
  COMPCV: number;
  net: number;
};

export type DrsProps<T> = {
  columns: DrsColumn<T>[]; // Use DrsColumn<T> consistently
  data: T[];
  totals?: DrsTotals; // Use DrsTotals here
  showFooter?: boolean;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyText?: string;
};
