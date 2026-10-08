// What the COFP screen needs to know about the plan holder a certificate is
// being raised for — the shape behind the profile card and the block of facts
// under it.
//
// It is a VIEW-MODEL, not a table row: every date is already an ISO string and
// every figure a plain number, so the card renders one without reaching into the
// PIS data layer. When a real source turns up, it maps onto this and the card
// does not change.

/** Whether the plan is still inside its contestable year. */
export type CofpContestability = "within" | "over";

/**
 * Which list the request rail is showing.
 *
 * THE ACTION BUTTONS ARE THE RAIL'S TABS (user, 2026-09-22): pressing one does
 * not run anything, it decides which requests the rows below are. One value per
 * button, in the order a certificate moves — printed, transmitted, released —
 * then the three ways one comes back.
 */
export type CofpView =
  | "FOR_PRINTING"
  | "DEFICIENT"
  | "PRINTED"
  | "BATCH_TRANSMITTAL"
  | "RELEASED"
  | "REPLACEMENT"
  | "RETURN"
  | "CONFISCATED";

/**
 * Where a Replacement request came from (user, 2026-10-05) — the three
 * buttons under the Replacement view's title. SPFC and Confiscated are one
 * list each; Branch is picked from a combo box first.
 */
export type CofpReplacementSource = "SPFC" | "CONFISCATED" | "BRANCH";

/** A region the For Printing view lists — its code and the branches under it. */
export interface CofpRegion {
  /** e.g. "NCT1-1". */
  code: string;
  /** The region's branches, comma-separated, as the reference table has them. */
  description: string;
  /**
   * The Special Request queue (user, 2026-10-05) — not a region, but listed
   * like one, pinned above the regions and drawn to stand out from them.
   */
  special?: boolean;
}

/** A branch the Deficient view lists. */
export interface CofpBranch {
  /** e.g. "ABRA". */
  code: string;
  description: string;
}

/**
 * A transmittal memo the Printed view lists under a branch (user, 2026-10-05)
 * — the printed certificates that went out to the branch together.
 */
export interface CofpMemo {
  /** Unique across branches. */
  id: string;
  /** The branch code the memo went to. */
  branch: string;
  memoNo: string;
  /** ISO. When it went out — or, while pending, when it was printed. */
  dateTransmitted: string;
  /**
   * Printed but not yet transmitted to the branch (user, 2026-10-07) — the
   * branch combo box highlights a branch with one.
   */
  pendingTransmit?: boolean;
  /** The printed certificates the memo carried. */
  rows: CofpForPrinting[];
}

/** One certificate queued for printing under a region. */
export interface CofpForPrinting {
  /** Unique within the region. */
  id: string;
  branch: string;
  lpaNo: string;
  lastName: string;
  firstName: string;
  middleName: string;
  /**
   * Held in its parts — the Edit PH Info dialog edits each one — and joined
   * into one line only where it is shown.
   */
  address: CofpAddress;
  /** The number the certificate prints under, e.g. "CFPWT126-007077". */
  cofpNo: string;
  /** Plan name as the certificate prints it, before "LIFE PLAN". */
  planName: string;
  planValue: number;
  /** e.g. "MEMORIAL SERVICE ONLY". */
  coverage: string;
  /** ISO. The "Given this … day of …" date. */
  fullPaidDate: string;
  /** Why the certificate is deficient — set on Deficient's rows only. */
  reason?: string;
  /**
   * Who the printed certificate was released to — set on Printed's rows only,
   * and blank while its memo is still to be transmitted.
   */
  releasedTo?: string;
  /** ISO. When it was confiscated — Confiscated's rows only. */
  dateConfiscated?: string;
  /** The batch it came in under — Confiscated's SPFC rows. */
  batchNo?: string;
}

/**
 * Where a Branch replacement request stands (user, 2026-10-07) — the status
 * picked above the Branch combo box. For Process is the one on arrival.
 */
export type CofpReplacementStatus = "FOR_PROCESS" | "PENDING" | "DENIED";

/** A Replacement request — the certificate to reissue, and when it was asked for. */
export interface CofpReplacementRequest extends CofpForPrinting {
  /** ISO. */
  dateRequested: string;
  /** Set on Branch requests only. */
  status?: CofpReplacementStatus;
}

/** A plan holder's address as the Edit PH Info dialog edits it. */
export interface CofpAddress {
  province: string;
  /** Municipality or city. */
  city: string;
  district: string;
  barangay: string;
  street: string;
  /** Optional — blank when the address has none. */
  houseNo: string;
}

/** The person the certificate is printed for. */
export interface CofpPlanholderProfile {
  /** Surname-first, the way the certificate prints it. */
  name: string;
  lpaNo: string;
  /** Person the avatar is drawn for — the mock avatar keys off this. */
  personId: string;
  /** Insurable at effectivity. Drives the badge under the name. */
  isInsured: boolean;
  homeAddress?: string;
  officeAddress?: string;
  mobileNo?: string;
  landlineNo?: string;
  email?: string;
}

/**
 * The plan's own facts, in the order they are read on screen.
 *
 * Everything is optional: a field with nothing on file shows a dash rather than
 * dropping out of the grid, so it stays visible as something still owed.
 */
export interface CofpPlanDetails {
  /** ISO. Age is derived from it rather than stored. */
  birthdate?: string;
  effectivityDate?: string;
  newEffectivityDate?: string;
  moveDate?: string;
  /** The code, e.g. "NT" — the sentence it stands for goes in the tooltip. */
  terminationStatusCode?: string;
  terminationStatusLabel?: string;
  terminationDate?: string;
  ptStatus?: string;
  /** "FP" once the account is settled; anything else is why a COFP cannot go out. */
  accountStatusCode?: string;
  accountStatusLabel?: string;
  branchCode?: string;
  branchName?: string;
  planCode?: string;
  planDesc?: string;
  planClass?: string;
  planValue?: number;
  planTap?: number;
  totalAmountPaid?: number;
  balance?: number;
  riDate?: string;
  contestability?: CofpContestability;
  /** Set once the certificate is numbered — empty while it is still a request. */
  cofpNumber?: string;
}

/** A plan holder as the COFP screen shows them: who they are, and their plan. */
export interface CofpPlanholder {
  profile: CofpPlanholderProfile;
  details: CofpPlanDetails;
}

/**
 * One payment posted against a plan — a line of the account's own ledger.
 *
 * The field names are the ledger's, not a screen's: these come off the PIS
 * payment records, and renaming them here would mean two names for one column
 * the moment a real source arrives.
 */
export interface CofpPayment {
  /** The plan the payment was posted to. */
  LPANo: string;
  /** Pay class — how the installment was collected, e.g. "REGULAR". */
  Payclass: string;
  /** Statement of account / sales invoice number the payment was receipted on. */
  SINo: string;
  /** ISO. Formatted where it is shown. */
  SIDate: string;
  SIAmount: number;
  /** Which installment of the term this payment settled. */
  InstallmentNo: number;
}
