import type { RemarkHistoryEntry } from "../../reinstatement/data/types";
import type {
  PlanholderNote,
  RopHistory,
} from "../../return-of-premium/data/types";

/** The status views the Transfer list header steps through. */
export type TransferStatus =
  | "For Process"
  | "Pending"
  | "Approved"
  | "Denied"
  | "For Transmit"
  | "Cancelled";

/** One transfer request, as a row of the list. */
export interface TransferRecord {
  id: string;
  planholderName: string;
  lpaNo: string;
  /** ISO date (yyyy-mm-dd) the transfer was requested. */
  dateRequested: string;
  status: TransferStatus;
  requestingBranch: string;
  personId: string;
  transferor: TransferorDetails;
  /** The transferor's proofs of identity, in the order they were filed. */
  transferorSubmittedIds: TransferSubmittedId[];
  transferee: TransfereeDetails;
  /** The transferee's proofs of identity, in the order they were filed. */
  transfereeSubmittedIds: TransferSubmittedId[];
  /** Whether the transferor's identity has been checked against their IDs. */
  transferorIdVerified: boolean;
  /** Whether the transferee's identity has been checked against their IDs. */
  transfereeIdVerified: boolean;
  /** The papers filed with the request, for the Document Viewer. */
  documents: TransferDocument[];
  /**
   * The plan holder module's remarks trail, as one block of text — entries
   * separated by `; `, the way the module stores them. Read only here.
   */
  planholderRemarks: string;
  /** The plan's remarks trail, newest first, for the Remarks History dialog. */
  remarksHistory: RemarkHistoryEntry[];
  /** The processors' notes on the plan, newest first. May be empty. */
  planholderNotes: PlanholderNote[];
  /** The plan's ROP releases so far, oldest first. May be empty. */
  ropHistory: RopHistory[];
}

/** The person the plan is being transferred to. */
export interface TransfereeDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  /** ISO date (yyyy-mm-dd). The card works the age out from it. */
  dateOfBirth: string;
  /** Whether the transferee can be covered by the plan's insurance. */
  insurable: boolean;
  contactNumber: string;
  registeredAddress: string;
  beneficiaries: TransfereeBeneficiary[];
}

/** One beneficiary the transferee designates, in the order named. */
export interface TransfereeBeneficiary {
  name: string;
  relationship: string;
}

/** One proof of identity on file, named for what it is. */
export interface TransferSubmittedId {
  id: string;
  label: string;
  imageUrl: string;
  /**
   * What the ID itself says about its holder — the Valid ID card checks it
   * against the party's details ("Data Match").
   */
  holder: {
    lastName: string;
    firstName: string;
    middleName: string;
    /** ISO date (yyyy-mm-dd). */
    dateOfBirth: string;
  };
}

/** One paper filed with the request, page by page. */
export interface TransferDocument {
  id: string;
  /** "Transfer Form", "Waiver of Rights". */
  label: string;
  /** One image URL per page, in page order. */
  pages: string[];
  /** Whether the file has been checked; the processor can change it. */
  verified: boolean;
  /** The branch that uploaded it. */
  uploadedBy: string;
  /** ISO date (yyyy-mm-dd). */
  dateUploaded: string;
}

/**
 * The planholder giving up the plan, and the plan as it stands on the ledger.
 *
 * Dates are ISO (yyyy-mm-dd); an empty string is a date that has not happened
 * on this account (no death, no reinstatement, no ROP scheduled yet).
 */
export interface TransferorDetails {
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  /** Whether the transferor is still covered by the plan's insurance. */
  insurable: boolean;
  accountStatus: string;

  planType: string;
  terminationStatus: string;
  newEffectivityDate: string;
  dueDate: string;
  dateOfDeath: string;
  firstRopSchedule: string;
  lastRiDate: string;
  lastTfDate: string;
  accountVerified: string;

  originatingBranch: string;
  requestingBranch: string;
  salesAgent1: string;
  salesAgent2: string;
}
