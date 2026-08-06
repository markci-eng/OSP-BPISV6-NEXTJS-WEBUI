// Mock database for the PIS area.
//
// `PisDatabase` stands in for the real back-office database. It holds the seed
// rows in memory and exposes repository-style query methods that mirror the
// calls the app will make against the real API — resolving foreign keys and
// wrapping rows in the domain classes from `models.ts`.
//
// The methods are synchronous today (the data is local mock data). When the
// real API is wired in, each method becomes the place that awaits a network
// call — callers keep the same names and shapes.

import {
  Address,
  Beneficiary,
  ClaimRequest,
  ClaimsHdrDC,
  ContactInfo,
  Payment,
  PayoutAccount,
  Person,
  Planholder,
  type BeneficiaryRecord,
  type BranchRecord,
  type ClaimsPayeeRecord,
  type DocumentRecord,
  type DocumentTypeRecord,
  type PlanholderNoteRecord,
  type PlanholderRemarkRecord,
  type PlanTypeRecord,
  type RefPayClassRecord,
  type RefPayoutChannelRecord,
} from "./models";
import {
  addressSeed,
  beneficiarySeed,
  branchSeed,
  claimRequestSeed,
  claimsHdrDCSeed,
  claimsPayeeSeed,
  contactSeed,
  documentSeed,
  documentTypeSeed,
  paymentSeed,
  payoutAccountSeed,
  personSeed,
  planholderNoteSeed,
  planholderRemarkSeed,
  planholderSeed,
  planTypeSeed,
  refPayClassSeed,
  refPayoutChannelSeed,
} from "./seed";

export class PisDatabase {
  /* ------------------------------ Person ------------------------------ */

  /** Resolve a person with their addresses, contacts and payout accounts. */
  getPerson(personId: string): Person | undefined {
    const record = personSeed.find((p) => p.personId === personId);
    if (!record) return undefined;
    const addresses = addressSeed
      .filter((a) => a.personId === personId)
      .map((a) => new Address(a));
    const contacts = contactSeed
      .filter((c) => c.personId === personId)
      .map((c) => new ContactInfo(c));
    return new Person(record, addresses, contacts, this.getPayoutAccounts(personId));
  }

  getPersons(): Person[] {
    return personSeed
      .map((p) => this.getPerson(p.personId))
      .filter((p): p is Person => p !== undefined);
  }

  /* -------------------------- Payout channels -------------------------- */

  getPayoutChannels(): RefPayoutChannelRecord[] {
    return refPayoutChannelSeed;
  }

  getPayoutChannel(channelCode: string): RefPayoutChannelRecord | undefined {
    return refPayoutChannelSeed.find((c) => c.channelCode === channelCode);
  }

  /** Payout accounts owned by a person, each joined to its channel. */
  getPayoutAccounts(personId: string): PayoutAccount[] {
    return payoutAccountSeed
      .filter((a) => a.personId === personId)
      .map((a) => new PayoutAccount(a, this.getPayoutChannel(a.channelCode)));
  }

  /* ----------------------------- Plan type ----------------------------- */

  getPlanType(planCode: string): PlanTypeRecord | undefined {
    return planTypeSeed.find((p) => p.planCode === planCode);
  }

  getPlanTypes(): PlanTypeRecord[] {
    return planTypeSeed;
  }

  /* ---------------------------- Planholder ---------------------------- */

  /** Resolve a plan holder with its owner (Person) and plan type joined in. */
  getPlanholder(lpaNo: string): Planholder | undefined {
    const record = planholderSeed.find((p) => p.lpaNo === lpaNo);
    if (!record) return undefined;
    return new Planholder(
      record,
      this.getPerson(record.personId),
      this.getPlanType(record.planCode),
    );
  }

  getPlanholders(): Planholder[] {
    return planholderSeed.map(
      (p) =>
        new Planholder(p, this.getPerson(p.personId), this.getPlanType(p.planCode)),
    );
  }

  /**
   * Beneficiaries declared on a plan, each with its `Planholder` and `Person`
   * navigation properties resolved. Every plan has at least one.
   */
  getBeneficiaries(lpaNo: string): Beneficiary[] {
    return beneficiarySeed
      .filter((b) => b.lpaNo === lpaNo)
      .map((b) => this.toBeneficiary(b));
  }

  /** Resolve a single beneficiary by its primary key. */
  getBeneficiary(beneficiaryId: string): Beneficiary | undefined {
    const record = beneficiarySeed.find(
      (b) => b.beneficiaryId === beneficiaryId,
    );
    return record ? this.toBeneficiary(record) : undefined;
  }

  private toBeneficiary(record: BeneficiaryRecord): Beneficiary {
    return new Beneficiary(
      record,
      this.getPlanholder(record.lpaNo),
      this.getPerson(record.personId),
    );
  }

  /* ------------------------ Remarks / notes ------------------------ */

  /** Remarks recorded against a plan, oldest first. */
  getPlanholderRemarks(lpaNo: string): PlanholderRemarkRecord[] {
    return planholderRemarkSeed.filter((r) => r.lpaNo === lpaNo);
  }

  /** Notes recorded against a plan, oldest first. */
  getPlanholderNotes(lpaNo: string): PlanholderNoteRecord[] {
    return planholderNoteSeed.filter((n) => n.lpaNo === lpaNo);
  }

  /* ---------------------------- Documents ---------------------------- */

  getDocumentTypes(): DocumentTypeRecord[] {
    return documentTypeSeed;
  }

  getDocumentType(documentCode: string): DocumentTypeRecord | undefined {
    return documentTypeSeed.find((d) => d.documentCode === documentCode);
  }

  /** Documents owned by a person. */
  getDocuments(personId: string): DocumentRecord[] {
    return documentSeed.filter((d) => d.personId === personId);
  }

  /* -------------------------- Claim requests -------------------------- */

  getClaimRequest(requestNo: string): ClaimRequest | undefined {
    const record = claimRequestSeed.find((r) => r.requestNo === requestNo);
    return record ? new ClaimRequest(record) : undefined;
  }

  /** All claim requests filed against a plan, most recent (file date) first. */
  getClaimRequestsByLpa(lpaNo: string): ClaimRequest[] {
    return claimRequestSeed
      .filter((r) => r.lpaNo === lpaNo)
      .sort((a, b) => b.auditDate.localeCompare(a.auditDate))
      .map((r) => new ClaimRequest(r));
  }

  /* --------------------------- Death claims --------------------------- */

  private buildDeathClaim(
    record: (typeof claimsHdrDCSeed)[number],
  ): ClaimsHdrDC | undefined {
    const request = this.getClaimRequest(record.claimRequest);
    if (!request) return undefined;
    const planholder = this.getPlanholder(request.lpaNo);
    return new ClaimsHdrDC(record, request, planholder);
  }

  /** Every death-claim header, each joined to its request and deceased. */
  getDeathClaims(): ClaimsHdrDC[] {
    return claimsHdrDCSeed
      .map((r) => this.buildDeathClaim(r))
      .filter((c): c is ClaimsHdrDC => c !== undefined);
  }

  getDeathClaim(claimNo: string): ClaimsHdrDC | undefined {
    const record = claimsHdrDCSeed.find((r) => r.claimNo === claimNo);
    return record ? this.buildDeathClaim(record) : undefined;
  }

  /** Look up the death claim opened against a given request number. */
  getDeathClaimByRequest(requestNo: string): ClaimsHdrDC | undefined {
    const record = claimsHdrDCSeed.find((r) => r.claimRequest === requestNo);
    return record ? this.buildDeathClaim(record) : undefined;
  }

  /** Payees named on a death claim. */
  getPayees(claimNo: string): ClaimsPayeeRecord[] {
    return claimsPayeeSeed.filter((p) => p.claimNo === claimNo);
  }

  /* ------------------------------ Branches ------------------------------ */

  getBranches(): BranchRecord[] {
    return branchSeed;
  }

  getBranch(branchCode: string): BranchRecord | undefined {
    return branchSeed.find((b) => b.branchCode === branchCode);
  }

  /* ----------------------------- Pay classes ----------------------------- */

  getPayClasses(): RefPayClassRecord[] {
    return refPayClassSeed;
  }

  getPayClass(payClassCode: string): RefPayClassRecord | undefined {
    return refPayClassSeed.find((c) => c.payClassCode === payClassCode);
  }

  /* ------------------------------ Payments ------------------------------ */

  /** A plan's payment ledger (oldest first), each joined to its pay class. */
  getPayments(lpaNo: string): Payment[] {
    return paymentSeed
      .filter((p) => p.lpaNo === lpaNo)
      .map((p) => new Payment(p, this.getPayClass(p.payClassId)));
  }
}

/** Shared singleton — the app's handle on the mock database. */
export const db = new PisDatabase();
