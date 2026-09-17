import type { ClaimKind } from "../../../data";

// The two things a claims supervisor approves.
//
// The page used to run on the BPIS approval set — reassignment of documents,
// DRS, movement of employees, SA2 — none of which is claims work; it was the
// shell copied over before the claims queues existed. What a claims supervisor
// actually signs off is a SERVICE PAYABLE a processor has verified, and a DEATH
// CLAIM a processor has endorsed with a recommendation.

/** Which approval queue the page is showing. */
export type ApprovalView = "service" | "death-claim";

/**
 * Where a request stands with the supervisor.
 *
 * Deliberately NOT the source vocabulary. A death claim arrives phased "For
 * Approval" or "For Denial" and a service billing arrives staged "verified", and
 * all three mean the same thing to this page: nobody has decided yet. The stat
 * cards, the badges and the row actions all key off this one word, so the
 * mapping happens once, where the rows are built.
 */
export type ApprovalStatus = "Pending" | "Approved" | "Denied";

/**
 * A service payable awaiting the supervisor — one BILLING, not one service.
 *
 * The billing is the unit that moves between stages and the unit that gets
 * approved; the services under it are what it is worth. So `serviceCount` and
 * `totalAmount` are carried flat rather than the row holding the service list:
 * the table shows how much and how many, and the drawer shows the same.
 */
export interface ServiceApproval {
  /** Chapel + cut + month + year. Always present, even before a number. */
  billingCode: string;
  /** Minted when the billing is created — the number the chapel is paid on. */
  billingNo: string;
  chapelCode: string;
  chapelDesc: string;
  territoryCode: string;
  /** "AUGUST 1-7, 2026". */
  periodLabel: string;
  /** Last day of the cut, ISO — what the row sorts its request date by. */
  periodEndISO: string;
  /** Last day of the cut, "Aug 7, 2026". */
  requestDate: string;
  /** Billable services on the billing. */
  serviceCount: number;
  /** Services still waiting on a requirement. */
  deficientCount: number;
  /** Sum of the billable services' CSP. */
  totalAmount: number;
  /** Who processed the billing — the person the supervisor is reviewing. */
  requester: string;
  /** The chapel is a franchise, so the billing follows the franchise process. */
  isFranchise: boolean;
  status: ApprovalStatus;
}

/** A verified death claim awaiting the approver. */
export interface DeathClaimApproval {
  /** Claim No. once opened, else the request number — see `claimIdentity`. */
  id: string;
  /** Claim No. — a claim in this queue has been opened, so it has one. */
  claimNo: string;
  /** The number the branch filed under. */
  reference: string;
  lpaNo: string;
  /**
   * WHICH NATURE of claim this is — "Death Claim", "Dismemberment", "Waiver of
   * Installment". What the stat cards count, and what clicking one filters by.
   *
   * Carried as the full `ClaimKind` string rather than the short `ClaimNature`
   * key, so the card's filter is a plain equality against the row and nothing
   * has to map between two spellings of the same three things.
   */
  kind: ClaimKind;
  /**
   * "Special" or "Regular" — and "" where the nature has no such split.
   *
   * A death claim filed within seven days of the incident is SPECIAL, and the
   * whole point of the category is that it overtakes: it is the primary key the
   * queue is ordered by, above the FIFO on the filing date. So the table shows
   * it — a row that has jumped the queue should say why on its own face.
   *
   * THE SEVEN-DAY RULE IS A DEATH CLAIM RULE. `DeathClaim.type` is derived for
   * every request, so a waiver or a dismemberment carries a value with nothing
   * behind it; that is what the blank is for, and it is the same question
   * `conveyor-card` asks before drawing its badge at all.
   */
  priority: "Special" | "Regular" | "";
  /** Surname-first, as the profile header renders it. */
  planholder: string;
  /** Benefit code filed for — CAB / ECAB / ADB / USB. */
  benefit: string;
  /** "Apr 18, 2026". */
  dateOfDeath: string;
  /**
   * "Apr 18, 2026" — the day the BRANCH FILED the claim.
   *
   * Named for what it is rather than "request date" (user, 2026-09-15). Every
   * screen in the claims area calls this the filed date, and the queues are
   * ordered by it; "request date" was the AMD table's wording carried over on a
   * column that holds a different module's fact.
   */
  filedDate: string;
  /** ISO filed date, so the queue can sort FIFO. */
  filedAt: string;
  /** The processor who worked the claim. */
  requester: string;
  requestingBranch: string;
  status: ApprovalStatus;
}
