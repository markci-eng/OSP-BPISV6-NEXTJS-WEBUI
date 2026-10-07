import type { PlanholderNote } from "../../return-of-premium/data/types";

export type ReinstatementStatus = "For Process" | "Pending" | "Approved" | "Denied";

export type Insurability = "Insurable" | "Not Insurable";

export interface ReinstatementRecord {
  id: string;
  planholderName: string;
  lpaNo: string;
  /** ISO date (yyyy-mm-dd) the request was filed. */
  requestDate: string;
  branch: string;
  personId: string;
  /** ISO date (yyyy-mm-dd). */
  birthdate: string;
  insurability: Insurability;
  status: ReinstatementStatus;
  plan: ReinstatementPlanInfo;
  account: ReinstatementAccountDetails;
  payments: ReinstatementPayment[];
  /** The documents filed with the request, shown in the carousel. May be empty. */
  submittedDocuments: SubmittedDocument[];
  /**
   * The plan holder module's remarks trail, as one block of text — entries
   * separated by `; `, the way the module stores them. Read only here.
   */
  planholderRemarks: string;
  /** The same trail split into entries, newest first — the Remarks History. */
  remarksHistory: RemarkHistoryEntry[];
  /** The processors' notes on the plan, newest first. May be empty. */
  planholderNotes: PlanholderNote[];
}

/** One entry of the plan's remarks trail, as the Remarks History lists it. */
export interface RemarkHistoryEntry {
  id: string;
  lpaNo: string;
  remarks: string;
  /** ISO date-time. Formatted where it is shown. */
  dateAdded: string;
}

/** One document filed with a reinstatement request — a scan and what it is. */
export interface SubmittedDocument {
  id: string;
  label: string;
  imageUrl: string;
}

export type PayClass = "NS" | "DC" | "RI" | "TF" | "TI" | "UP" | "SV";

/** One line of the plan's payment ledger. Dates are ISO (yyyy-mm-dd). */
export interface ReinstatementPayment {
  id: string;
  payClass: PayClass;
  siNo: string;
  siDate: string;
  siAmount: number;
  planCode: string;
  auditDate: string;
}

/** The plan being reinstated — the "Info" card. Dates are ISO (yyyy-mm-dd). */
export interface ReinstatementPlanInfo {
  planDescription: string;
  planCode: string;
  newEffectivityDate: string;
  dueDate: string;
  lapsationDate: string;
  forfeitureDate: string;
  amount: number;
  balance: number;
  contractPrice: number;
  originatingBranch: string;
  totalAmountPayable: number;
}

/** The account's standing — the "Details" card. Dates are ISO (yyyy-mm-dd). */
export interface ReinstatementAccountDetails {
  accountStatus: string;
  terminationStatus: string;
  /** Absent while the planholder is living. */
  dateOfDeath?: string;
  accountVerified: boolean;
  withCofp: boolean;
  /** Only when `withCofp` is true. */
  cofpNo?: string;
  lastRiPayment?: string;
  lastTfPayment?: string;
  requestingBranch: string;
}
