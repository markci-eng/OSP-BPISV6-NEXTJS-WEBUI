import type { DocumentRef } from "../../document-requirements";

export type CsvStatus = "PENDING" | "APPROVED" | "DENIED";

export interface PhUpdateEntry {
  idx: number;
  lpaNo: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
}

/** A file the requester submitted to prove the payout account. */
export interface PayoutAttachment {
  id: string;
  /** What the file shows, e.g. "E-Wallet Account Screenshot". */
  label: string;
  /** Served by the API; may be a short-lived signed URL. */
  url: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PayoutAccountDetails {
  paymentChannel: string;
  payoutAccountNo: string;
  payoutBranch: string;
  accountName: string;
  phBirthdate: string;
  /** Proof of account submitted with the request. */
  attachments: PayoutAttachment[];
}

export interface CsvRequest {
  /** Requirements the branch has already submitted for this request. */
  documents: DocumentRef[];
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  reason: string;
  surrenderValue: number;
  surrenderDate: string;
  requestDate: string;
  requester: string;
  status: CsvStatus;
  branchCode: string;

  phUpdates: PhUpdateEntry[];
  payoutAccount: PayoutAccountDetails;
}
