export type CofpStatus =
  | "FOR_PRINTING"
  | "PRINTED"
  | "RELEASED"
  | "CANCELLED"
  | "CONFISCATED"
  | "RETURNED";

/**
 * Printed certificates leave the office in a transmittal memo: one memo per
 * batch a branch is sent, carrying whether it has gone out and when.
 */
export interface CofpMemo {
  memoNo: string;
  branchCode: string;
  isTransmitted: boolean;
  /** "1900-01-01" while the memo is still waiting to be transmitted. */
  transmitDate: string;
  /** How many printed certificates the memo covers. */
  certificateCount: number;
}

export interface CofpRequest {
  /** Set once printed — the transmittal memo this certificate belongs to. */
  memoNo?: string;
  id: string;
  branchCode: string;
  lpaNo: string;
  planholderName: string;
  /** Printed under the planholder name on the certificate. */
  planholderAddress: string;
  planType: string;
  /** Plan name as printed on the certificate, e.g. "ST. GEORGE". */
  planName: string;
  /** Coverage line, e.g. "MEMORIAL SERVICE ONLY". */
  coverage: string;
  cfpNumber: string;
  cfpDate: string;
  totalAmountPaid: number;
  requestDate: string;
  requester: string;
  status: CofpStatus;
}
