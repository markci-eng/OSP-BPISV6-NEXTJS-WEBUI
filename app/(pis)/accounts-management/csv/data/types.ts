import type { SubmittedDocument } from "../../reinstatement/data/types";
import type {
  PlanholderNote,
  RopPayout,
} from "../../return-of-premium/data/types";

/** The views the CSV list header steps through. */
export type CsvStatus = "SPFC" | "For Process" | "Pending";

export type CsvLoanStatus = "CLEARED" | "OUTSTANDING";

export type CsvDetailsRemarks = "Valid" | "Invalid";

/** The surrender being processed — what the CSV Details card shows and sets. */
export interface CsvDetails {
  planCode: string;
  contractPrice: number;
  /** ISO. */
  dateApplied: string;
  /** ISO. */
  dateReceived: string;
  terminationAmount: number;
  excessTerminationValue: number;
  remarks: CsvDetailsRemarks;
  status: CsvStatus;
}

/** One Cash Surrender Value request. */
export interface CsvRecord {
  id: string;
  /** Surname first, the way every other list in the module prints it. */
  planholderName: string;
  /** The name's parts, for the Edit PH Info form. */
  lastName: string;
  firstName: string;
  middleName: string;
  lpaNo: string;
  csvNo: string;
  branchCode: string;
  status: CsvStatus;
  personId: string;
  /** ISO. */
  birthdate: string;
  planDescription: string;
  /** ISO. */
  newEffectivityDate: string;
  accountStatus: string;
  terminationStatus: string;
  loanStatus: CsvLoanStatus;
  /** Unset when the plan has no Certificate of Full Payment. */
  cofpNo?: string;
  confiscated: boolean;
  /** The surrender itself, for the CSV Details card. */
  details: CsvDetails;
  /** The papers filed with the request — ID, CSV form, LPA contract, COFP. */
  submittedDocuments: SubmittedDocument[];
  /** The payouts the planholder submitted, one per channel. */
  payouts: RopPayout[];
  /** The plan holder module's remarks line, entries separated by `;`. */
  planholderRemarks: string;
  /** The processor's notes on the planholder. */
  planholderNotes: PlanholderNote[];
}
