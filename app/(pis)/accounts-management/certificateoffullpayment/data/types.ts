// What the COFP screen needs to know about the plan holder a certificate is
// being raised for — the shape behind the profile card and the block of facts
// under it.
//
// It is a VIEW-MODEL, not a table row: every date is already an ISO string and
// every figure a plain number, so the card renders one without reaching into the
// PIS data layer. When a real source turns up, it maps onto this and the card
// does not change.

import type { CofpRequest } from "../../cofp/data/types";

/** Whether the plan is still inside its contestable year. */
export type CofpContestability = "within" | "over";

/**
 * An account a certificate was asked for that is NOT fully paid yet.
 *
 * It is the same request, plus what it is still short. A certificate cannot be
 * raised on one of these, which is why the Generate view lists them apart from
 * the accounts it can be raised on rather than mixed in with them.
 */
export interface CofpDeficiencyRequest extends CofpRequest {
  /** Pesos still owed before the certificate can go out. */
  deficiency: number;
}

/**
 * Which list the request rail is showing.
 *
 * THE ACTION BUTTONS ARE THE RAIL'S TABS (user, 2026-09-22): pressing one does
 * not run anything, it decides which requests the rows below are. One value per
 * button, in the order a certificate moves — raised, printed, transmitted,
 * released — then the three ways one comes back.
 */
export type CofpView =
  | "GENERATE"
  | "FOR_PRINTING"
  | "PRINTED"
  | "BATCH_TRANSMITTAL"
  | "RELEASED"
  | "REPLACEMENT"
  | "RETURN"
  | "CONFISCATED";

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
