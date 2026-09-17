"use client";

// Everything the two columns need to know about one claim, read once.
//
// THE COLUMNS ARE TWO VIEWS OF ONE THING, so they must not go and look it up
// separately: the review column names the payee and the evidence column counts
// the payees, and a claim where those two disagree is a claim nobody can act on.
// The page reads this once and hands the same object to both.
//
// It also settles who owns the deficiency list. The card used to work it out and
// hand it to the commit bar; now the page does, which is right — the page is
// what records the return, and the list is what the return is about.

import { useMemo } from "react";
import {
  getClaimPayeesForRequest,
  getOutstandingDocumentTypes,
  getPlanholder,
  getPlanholderDocuments,
  type ClaimPayee,
  type PlanholderDocument,
} from "../../claims-data";
import {
  planholderName,
  toSurnameFirst,
  type DeathClaim,
} from "../death-claims-data";

export interface ClaimEvidence {
  /** Surname-first, the way every claims screen writes a plan holder. */
  displayName: string;
  lpaNo: string;
  /** Contestability as the screens spell it — "Within" / "Over" / "—". */
  contestability: string;
  /** True while the plan is still inside its contestable year. */
  contestable: boolean;
  accountStatus: string;
  /** True when the plan is not in good standing. */
  lapsed: boolean;
  payees: ClaimPayee[];
  documents: PlanholderDocument[];
  /** Document types with no file against them — see `getOutstandingDocumentTypes`. */
  missing: string[];
}

/** What an empty queue reads as. Nothing renders it; it keeps the types honest. */
const NOTHING: ClaimEvidence = {
  displayName: "—",
  lpaNo: "—",
  contestability: "—",
  contestable: false,
  accountStatus: "—",
  lapsed: false,
  payees: [],
  documents: [],
  missing: [],
};

/**
 * TAKES AN OPTIONAL CLAIM, and that is about React rather than about claims:
 * the page returns early when the queue is empty, and a hook called after that
 * return would change the hook order between renders. So it is called
 * unconditionally with whatever the queue gave, and answers `NOTHING` when
 * there was no claim.
 */
export function useClaimEvidence(claim: DeathClaim | undefined): ClaimEvidence {
  return useMemo(() => {
    if (!claim) return NOTHING;

    const planholder = getPlanholder(claim.lpaNo);
    const name = planholderName(claim.lpaNo);
    const personId = planholder?.personId;

    // The model stores it lower-case; every screen that shows it capitalises
    // the same way — see `contestabilityLabel` on the create form.
    const contestable = planholder?.contestability === "within";

    return {
      displayName: name ? toSurnameFirst(name) : "—",
      lpaNo: claim.lpaNo,
      contestability: planholder ? (contestable ? "Within" : "Over") : "—",
      contestable,
      accountStatus: planholder?.accountStatusLabel ?? "—",
      lapsed: planholder?.accountStatusLabel === "Lapsed",
      payees: getClaimPayeesForRequest(claim.reference),
      documents: personId ? getPlanholderDocuments(personId) : [],
      missing: personId
        ? getOutstandingDocumentTypes(personId).map((type) => type.name)
        : [],
    };
  }, [claim]);
}
