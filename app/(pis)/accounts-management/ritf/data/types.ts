export type RitfStatus = "PENDING" | "APPROVED" | "DENIED";

export type RitfTransactionType = "REINSTATEMENT" | "TRANSFER";

export type RitfProcessingStatus =
  | "FOR PROCESS"
  | "PROCESSED"
  | "COMPLETED"
  | "CANCELLED";

export interface RitfPhUpdateEntry {
  idx: number;
  lpaNo: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  authorizedDate: string;
}

/** One row of the requirements / submitted-documents lists. */
export interface RitfDocument {
  refCode: string;
  refDesc: string;
}

export interface RitfRequest {
  id: string;
  lpaNo: string;
  planholderName: string;
  planType: string;
  transactionType: RitfTransactionType;
  balance: number;
  dueDate: string;
  requestDate: string;
  requester: string;
  status: RitfStatus;

  // Edit RITF — request details
  acctStatus: string;
  termiStatus: string;
  subType: string;
  trxMonth: string;
  reqBranch: string;
  processingStatus: RitfProcessingStatus;
  newPlanCode: string;
  tfLastName: string;
  tfFirstName: string;
  dateReceivedByOP: string;
  dateReceivedFrOP: string;
  dateInformed: string;
  dateComplied: string;
  daysProcessed: number;
  notes: string;
  completeDocuments: boolean;

  phUpdates: RitfPhUpdateEntry[];
  /** Requirements the branch has already submitted for this request. */
  documents: RitfDocument[];
}
