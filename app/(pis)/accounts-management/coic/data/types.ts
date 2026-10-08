// The COIC screen's shapes — Certificate of Insurance Coverage, cloned from
// COFP's For Printing and Printed views (user, 2026-10-06).
//
// A COIC row IS a COFP row plus what the Confirmation of Cover prints that the
// COFP does not: its own number and the individual's effective date. Extending
// the COFP row keeps the shared pieces (the rail rows, the Edit PH Info dialog,
// the region card) taking it as they are.

import type { CofpForPrinting } from "../../certificateoffullpayment/data/types";

/** Which list the rail shows — only these two, unlike COFP. */
export type CoicView = "FOR_PRINTING" | "PRINTED";

/** One Confirmation of Cover queued for printing, or printed under a memo. */
export interface CoicForPrinting extends CofpForPrinting {
  /** The "No." printed top right, e.g. "CLT126-019341". */
  coicNo: string;
  /** ISO. The "Individual Effective Date". */
  effectiveDate: string;
  /** "YYYY-MM". The month the transaction was posted in (user, 2026-10-07). */
  transactionMonth: string;
}

/** A transmittal memo the Printed view lists under a branch. */
export interface CoicMemo {
  /** Unique across branches. */
  id: string;
  /** The branch code the memo went to. */
  branch: string;
  memoNo: string;
  /** ISO. When it went out — not shown while it is pending. */
  dateTransmitted: string;
  /**
   * Its certificates still for transmit (user, 2026-10-07) — the branch
   * combo box highlights a branch with one.
   */
  pendingTransmit?: boolean;
  /** The printed certificates the memo carried. */
  rows: CoicForPrinting[];
}
