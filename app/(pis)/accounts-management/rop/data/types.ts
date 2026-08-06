import type { DocumentRef } from "../../document-requirements";

export type RopStatus = "PENDING" | "APPROVED" | "DENIED";

export type RopPaymentStatus =
  | "FOR_PROCESS"
  | "PROCESSED"
  | "RELEASED"
  | "CANCELLED";

export interface RopHistoryEntry {
  idx: number;
  notes: string;
  auditUser: string;
  auditDate: string;
  editUser: string;
  editDate: string;
}

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

export interface RopRequest {
  /** Requirements the branch has already submitted for this request. */
  documents: DocumentRef[];
  id: string;
  ropNo: string;
  lpaNo: string;
  planholderName: string;
  branchCode: string;
  planType: string;
  maturityDate: string;
  ropAmount: number;
  mode: string;
  requestDate: string;
  requester: string;
  status: RopStatus;

  // Edit Payment — payment schedule fields
  schedule: string;
  amount: number;
  paymentStatus: RopPaymentStatus;
  dateApplied: string;
  dateReceived: string;
  daysProcessed: number;
  loanRemarks: string;
  notes: string;

  // Edit Payment — planholder / plan summary panel
  birthdate: string;
  age: string;
  effectivityDate: string;
  newEffectivityDate: string;
  moveDate: string;
  firstRopDate: string;
  terminationStatus: string;
  terminationStatusDate: string;
  accountStatus: string;
  payClass: string;
  contractPrice: number;
  remarks: string;

  history: RopHistoryEntry[];
  phUpdates: PhUpdateEntry[];
  payoutAccount: PayoutAccountDetails;
}
