// What a Return of Premium record is to this screen.
//
// FOUR FIELDS AND A PERSON. The list shows the four; the fifth is what the
// right panel is built from — a record with no planholder behind it would open
// an empty profile, so the link is part of the record rather than looked up
// from the name.

export type RopStatus = "PENDING" | "APPROVED" | "DENIED";

export interface RopRecord {
  id: string;
  ropNo: string;
  lpaNo: string;
  planholderName: string;
  /** ISO. Formatted where it is shown. */
  ropDate: string;
  /** The planholder whose profile the right panel loads. */
  personId: string;
  /** ISO. The age on the identity card is derived from it, not stored. */
  birthdate: string;
  /** Drawn as a badge on the row's second line. */
  status: RopStatus;

  // The account's own state, shown in the ROP details card under the profile.
  /** ISO. When the plan was re-dated, which an ROP is computed against. */
  newEffectivityDate: string;
  /** Short code, e.g. "FP" for fully paid. */
  accountStatus: string;
  /** Whether a loan against the plan is settled. */
  loanStatus: RopLoanStatus;
  /** Short code, e.g. "RP" for returned premium. */
  terminationStatus: string;
  /** ISO. "1900-01-01" where the account was never terminated. */
  terminationStatusDate: string;
  /** ISO. When the requirements were last checked. */
  dateVerified: string;
  /** The pay classes posted against the plan. */
  payclasses: RopPayclass[];
  /** Proof of identity submitted with the request; empty where none is on file. */
  submittedIds: RopSubmittedId[];
  /**
   * The payouts the planholder SUBMITTED, one per channel.
   *
   * A LIST, not a single account (user, 2026-09-24): a planholder can file
   * more than one way of being paid, and the panel's channel dropdown picks
   * between them — choosing a channel shows that submission's own account,
   * payee and reason rather than editing the fields of one.
   */
  payouts: RopPayout[];
  /** The schedule the return is being released on, shown in the ROP Schedule card. */
  schedule: RopSchedule;
  /**
   * The releases already on file, oldest first, shown in the ROP History table
   * on the schedule card. Never empty.
   */
  history: RopHistory[];
  /**
   * The sales invoices posted against the plan, oldest first, shown in the
   * Payment History dialog off the ROP Details card. May be empty.
   */
  payments: RopPayment[];
  /**
   * The plan holder module's remarks trail, as one block of text — entries
   * separated by `; `, the way the module stores them. Read only here.
   */
  planholderRemarks: string;
  /** The processors' notes on the plan, newest first. May be empty. */
  planholderNotes: PlanholderNote[];
}

/**
 * One note in the Planholder Remarks and Notes card's list. Shared with the
 * Reinstatement records, which show the same card.
 */
export interface PlanholderNote {
  id: string;
  lpaNo: string;
  /** Up to `ROP_NOTES_MAX_LENGTH` characters. */
  notes: string;
  createdBy: string;
  /** ISO date-time. Formatted where it is shown. */
  dateCreated: string;
}

/** Which of the five releases this return is. */
export type RopScheduleNo = "1st" | "2nd" | "3rd" | "4th" | "5th";

export type RopScheduleStatus =
  | "For Process"
  | "For Approval"
  | "Pending"
  | "Denied";

export type RopScheduleRemarks = "Valid" | "Invalid";

/**
 * The release being processed. The first four fields came off the request and
 * are only read; the rest are what the processor sets on the ROP Schedule card.
 */
export interface RopSchedule {
  mobileNo: string;
  planCode: string;
  contractPrice: number;
  /** ISO. */
  dateApplied: string;
  amount: number;
  scheduleNo: RopScheduleNo;
  status: RopScheduleStatus;
  remarks: RopScheduleRemarks;
  /** Up to `ROP_NOTES_MAX_LENGTH` characters. */
  notes: string;
}

/**
 * One row of the ROP History audit record: a release already on file for the
 * plan, read only. The table sits above the schedule so the processor can see
 * what was released before setting the next one.
 */
export interface RopHistory {
  scheduleNo: RopScheduleNo;
  /** ISO. */
  ropDate: string;
  isClaimed: boolean;
  /** ISO. Empty where the release has not been claimed. */
  dateClaimed: string;
  ropNo: string;
  batchNo: string;
  payeeName: string;
  amount: number;
  channel: string;
}

/** One payment on the plan's ledger, as the Payment History dialog lists it. */
export interface RopPayment {
  siNo: string;
  /** Pay class code the payment was posted to, e.g. "NS". */
  payclass: string;
  /** ISO. */
  siDate: string;
  siAmount: number;
}

/**
 * One submitted payout: the account, and the person being paid through it.
 *
 * NOTHING HERE IS EDITED ON THE SCREEN. It all came off the request the branch
 * filed and is shown for verification — a processor is checking that the
 * account belongs to the payee, not retyping what the branch sent.
 */
export interface RopPayout {
  /** Bank, wallet or cheque. What the panel's dropdown selects between. */
  channel: string;
  /** Empty for a cheque, which is collected rather than deposited. */
  accountNo: string;
  /** The name the account is held under. */
  accountName: string;
  /** Who is being paid — the same as the account name unless a proxy collects. */
  payeeName: string;
  /** The payee's relationship to the planholder, e.g. "Sister". */
  relationship: string;
  /** Why a proxy is collecting, e.g. "Senior". */
  reason: string;
  /**
   * The scan filed to prove the account is the payee's — a passbook page, a
   * wallet screenshot. Empty where none was submitted for this channel.
   */
  proofImageUrl: string;
}

export type RopLoanStatus = "CLEARED" | "OUTSTANDING";

/**
 * A proof-of-identity image the requester submitted with the return.
 *
 * `label` is what the document IS — "Passport", "Driver's License" — because
 * the image alone does not say, and a processor checking requirements is
 * looking for a named document rather than a picture.
 */
export interface RopSubmittedId {
  id: string;
  label: string;
  imageUrl: string;
}

/**
 * One pay class on the account.
 *
 * `flagged` is what the ledger prints in red — a class that needs looking at
 * before the return is computed, rather than one that is merely present.
 */
export interface RopPayclass {
  code: string;
  flagged: boolean;
}
