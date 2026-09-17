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
  buildBillingTables,
  PROCESSORS,
  type BillingTables,
} from "./billing-seed";
import { refMortuaryCSPRateSeed, refMortuaryCSPSeed } from "./csp-seed";
import {
  Address,
  Beneficiary,
  BillingProcessed,
  ChapelBranch,
  ClaimRequest,
  ClaimsHdrDC,
  ContactInfo,
  Mortuary,
  Payment,
  PayoutAccount,
  Person,
  Planholder,
  type AccountStatus,
  type BillingHdrRecord,
  type ClaimsBillingRecord,
  type BeneficiaryRecord,
  type BranchRecord,
  type ChapelBranchRecord,
  type ClaimsPayeeRecord,
  type DocumentRecord,
  type DocumentTypeRecord,
  type PlanholderNoteRecord,
  type PlanholderRecord,
  type PlanholderRemarkRecord,
  type PlanTypeRecord,
  type RefAccountStatusRecord,
  type RefCreditOfServiceRecord,
  type RefMortuaryCSPRateRecord,
  type RefMortuaryCSPRecord,
  type RefMortuaryRecord,
  type RefPayClassRecord,
  type RefPayoutChannelRecord,
  type RefTermiStatRecord,
  type TerminationStatus,
  type TerritoryRecord,
} from "./models";
import {
  addressSeed,
  beneficiarySeed,
  branchSeed,
  chapelBranchSeed,
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
  refAccountStatusSeed,
  refCreditOfServiceSeed,
  refMortuarySeed,
  refPayClassSeed,
  refPayoutChannelSeed,
  refTermiStatSeed,
  territorySeed,
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

  /**
   * Termination statuses set THIS SESSION — the one column of the one table
   * this otherwise read-only layer lets anything write.
   *
   * BECAUSE TERMINATING A PLAN REALLY DOES UPDATE THE ROW. Every other write in
   * the service-payables module is an INSERT into a table of its own —
   * `TblClaimsBilling` when a billing is created, `TblClaimsSP` when a plan is
   * terminated into it — and those live in that module's own store, in front of
   * this layer. This one is different in kind: it changes a plan holder that was
   * already on file, from `NT` to `SP` or `SA`, and every screen that reads a
   * plan has to see it. Held here rather than overlaid in the feature store so
   * that a reader gets the truth from `getPlanholder` without knowing a
   * service-payables session exists — the plan holder profile, the claim views,
   * the manual-service lookup, all of them.
   *
   * NOT PERSISTED, like everything else written in the browser: a refresh puts
   * the seed's own status back.
   *
   * THE BILLING TABLES DO NOT SEE IT, and that is not a bug. `billing-seed`
   * reads `isServiced` and `canBeServiced` to decide which plans a chapel has
   * endorsed, and it runs ONCE, lazily, the first time the tables are asked for
   * — which is at import of the service-payables read model, long before anyone
   * can press Terminate. A plan terminated in the browser therefore does not
   * rewrite the queue it was terminated from, which is what anyone would expect.
   */
  private termiStatOverrides = new Map<string, TerminationStatus>();

  /** Join a plan holder to its owner and plan type, over this session's writes. */
  private toPlanholder(record: PlanholderRecord): Planholder {
    const override = this.termiStatOverrides.get(record.lpaNo);
    return new Planholder(
      override === undefined ? record : { ...record, termiStatCode: override },
      this.getPerson(record.personId),
      this.getPlanType(record.planCode),
    );
  }

  /** Resolve a plan holder with its owner (Person) and plan type joined in. */
  getPlanholder(lpaNo: string): Planholder | undefined {
    const record = planholderSeed.find((p) => p.lpaNo === lpaNo);
    return record ? this.toPlanholder(record) : undefined;
  }

  getPlanholders(): Planholder[] {
    return planholderSeed.map((p) => this.toPlanholder(p));
  }

  /**
   * Set a plan's termination status — what terminating it into a billing does
   * to the plan itself.
   *
   * ONE PLAN AND NOT ONE PERSON: the key is the LPA number, because a plan
   * holder with three plans has three rows and terminating one service
   * terminates one of them.
   *
   * IT OVERRIDES WHATEVER WAS THERE, including a status that was already `SP` or
   * `SA` (user-confirmed 2026-08-26). A plan on file as serviced that is
   * serviced again is not a contradiction to resolve here — the termination
   * being put through now is the one that is true, and which of `SP`/`SA` it is
   * depends on the nature of service the processor just recorded. See
   * `terminationStatusFor` in the service-payables store for that rule.
   */
  setTerminationStatus(lpaNo: string, termiStatCode: TerminationStatus): void {
    this.termiStatOverrides.set(lpaNo, termiStatCode);
  }

  /**
   * Put a plan's termination status back to the seed's.
   *
   * For the one thing that UNDOES a termination: taking back a plan holder that
   * was keyed in by hand against a franchise's billing. Nothing else in the
   * module reverses one.
   */
  clearTerminationStatus(lpaNo: string): void {
    this.termiStatOverrides.delete(lpaNo);
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

  /** Every branch in a territory. */
  getBranchesByTerritory(territoryCode: string): BranchRecord[] {
    return branchSeed.filter((b) => b.territoryCode === territoryCode);
  }

  /* ----------------------------- Territories ----------------------------- */

  /** Every territory, in the order the source system lists them. */
  getTerritories(): TerritoryRecord[] {
    return territorySeed;
  }

  getTerritory(territoryCode: string): TerritoryRecord | undefined {
    return territorySeed.find((t) => t.territoryCode === territoryCode);
  }

  /**
   * A territory's name, e.g. "BICOL TERRITORY" — falling back to the code, so a
   * territory that has fallen out of the reference table still labels itself
   * rather than rendering blank.
   */
  getTerritoryName(territoryCode: string): string {
    return this.getTerritory(territoryCode)?.description ?? territoryCode;
  }

  /* --------------------------- Chapel branches --------------------------- */

  private toChapelBranch(record: ChapelBranchRecord): ChapelBranch {
    const address = addressSeed.find((a) => a.addressId === record.addressId);
    const contact = contactSeed.find((c) => c.contactId === record.contactId);
    return new ChapelBranch(
      record,
      this.getTerritory(record.territoryCode),
      address ? new Address(address) : undefined,
      contact ? new ContactInfo(contact) : undefined,
      this.getPerson(record.chapelMngr),
    );
  }

  /** Every chapel branch, each joined to its territory, address and manager. */
  getChapels(): ChapelBranch[] {
    return chapelBranchSeed.map((c) => this.toChapelBranch(c));
  }

  /**
   * The chapels of one territory — the list a service-payables billing run is
   * built from. Alphabetical by code, which is the order the billing codes
   * derived from them come out in.
   */
  getChapelsByTerritory(territoryCode: string): ChapelBranch[] {
    return chapelBranchSeed
      .filter((c) => c.territoryCode === territoryCode)
      .map((c) => this.toChapelBranch(c));
  }

  getChapel(chapelCode: string): ChapelBranch | undefined {
    const record = chapelBranchSeed.find((c) => c.chapelCode === chapelCode);
    return record ? this.toChapelBranch(record) : undefined;
  }

  /** The franchised chapels — the ones that bill under the other process. */
  getFranchiseChapels(): ChapelBranch[] {
    return chapelBranchSeed
      .filter((c) => c.isFranchise)
      .map((c) => this.toChapelBranch(c));
  }

  /* ------------------------------ Mortuaries ------------------------------ */

  private toMortuary(record: RefMortuaryRecord): Mortuary {
    const address =
      record.addressId === undefined
        ? undefined
        : addressSeed.find((a) => a.addressId === record.addressId);
    return new Mortuary(
      record,
      // May be nothing: the reference data's chapel codes do not all resolve.
      // See `getUnresolvedMortuaryChapels`.
      record.branchCode ? this.getChapel(record.branchCode) : undefined,
      address ? new Address(address) : undefined,
    );
  }

  /** Every mortuary, in the order the reference data lists them. */
  getMortuaries(): Mortuary[] {
    return refMortuarySeed.map((m) => this.toMortuary(m));
  }

  getMortuary(mortCode: string): Mortuary | undefined {
    const record = refMortuarySeed.find((m) => m.mortCode === mortCode);
    return record ? this.toMortuary(record) : undefined;
  }

  /**
   * The mortuaries operating out of one chapel — the ones a billing raised
   * against it would normally name.
   */
  getMortuariesByChapel(chapelCode: string): Mortuary[] {
    return refMortuarySeed
      .filter((m) => m.branchCode === chapelCode)
      .map((m) => this.toMortuary(m));
  }

  /**
   * The chapel codes in `RefMortuary` that no `ChapelBranch` row answers to —
   * COMPUTED, not listed, so it cannot go stale as either table changes.
   *
   * Nine of them at the time of writing, in two kinds: near misses of a chapel
   * that IS on file (IRIGA against IRIGAS, STA.MA against STAMAR) and places
   * with no chapel row at all (VIGAN, LAOAG, BAGUIO, …). Neither is guessed at
   * — the code is carried exactly as the reference data gives it and the lookup
   * simply returns nothing, so a correction on either side fixes this without
   * touching code. See the note on `refMortuarySeed`.
   *
   * The one row with an EMPTY chapel code is not in here. Nothing dangles: the
   * source gives it no chapel to resolve in the first place.
   */
  getUnresolvedMortuaryChapels(): string[] {
    return [
      ...new Set(
        refMortuarySeed
          .map((m) => m.branchCode)
          .filter((code) => code && !this.getChapel(code)),
      ),
    ];
  }

  /* ------------------------ The chapel's mortuary ------------------------ */
  //
  // HOW A CHAPEL FINDS ITS MORTUARY, which is a question about `RefMortuary` and
  // therefore lives here — it was in `service-payables-data` for as long as that
  // screen was the only caller, and moved on 2026-08-26 when the billing seed
  // turned out to need the same answer and was quietly giving itself a different
  // one.
  //
  // IT IS THE DESCRIPTION, NOT THE COLUMN (user-confirmed 2026-08-26). The source
  // system runs a LIKE against the mortuary description: the funeral home a
  // chapel bills against is the one NAMED for it. `RefMortuary.BranchCode` looks
  // like the foreign key and is not one — it is a loosely-kept note of which
  // chapel a mortuary works out of, filed against a NEIGHBOUR often enough to
  // matter ("ST. PETER CHAPEL - ALABAT" carries ATIMON). Leading with it left
  // fifty chapels with no mortuary at all.
  //
  // See {@link getMortuariesForChapel} for the ranking and what it costs.

  /**
   * Whether a mortuary's NAME names the chapel — the description match.
   *
   * WORD BY WORD RATHER THAN AS A STRING, because the two sides write the same
   * place in different orders: the chapel "NAGA TABUCO" is the mortuary "ST.
   * PETER CHAPEL - TABUCO NAGA", and a LIKE between them literally finds
   * nothing. Every word of the chapel's name has to appear, which is what keeps
   * "STA. CRUZ, LAGUNA" from matching a Sta. Cruz in Zambales — and single words
   * are safe because they are place names, not qualifiers.
   *
   * AN APOSTROPHE IS DELETED, NOT SPACED (2026-08-26), and that distinction is
   * the whole of one chapel's pricing. Every separator used to become a space,
   * which splits a possessive into two tokens on the side that writes one and
   * leaves it whole on the side that does not:
   *
   *   chapel   "BROOKE`S POINT"                   -> BROOKE · S · POINT
   *   mortuary "ST. PETER CHAPEL - BROOKES POINT" -> … · BROOKES · POINT
   *
   * Neither BROOKE nor S is in the mortuary's set, so every-word-present was
   * false and Brooke's Point matched its own parlour by neither name nor column
   * — that row is filed under NARRA. With no mortuary it had no rate, so every
   * service on it priced at nothing and its billing totalled ₱0.00.
   *
   * This is the SAME repair `cspKey` documents one join over: the two sides
   * spell a name differently, and it is the comparison that is loosened rather
   * than either table corrected. Deleting rather than spacing is what makes the
   * two spellings the same token, which spacing cannot do.
   *
   * WHAT IT COSTS, measured over all 141 chapels: 140 unchanged, none changes
   * hands, none loses a mortuary, and BROOKE gains the parlour named after it.
   * The other seven with no mortuary — BOGOPA, CALAPB, CEBUS, MANGAL, SCOUTC,
   * STAMAR, TAGBIM — are unaffected: their descriptions differ from any
   * mortuary's by a word, not by punctuation, and guessing across that gap is
   * what this rule is careful not to do.
   */
  private static namesTheChapel(mortuary: Mortuary, chapelDesc: string): boolean {
    const words = (value: string) =>
      value
        .toUpperCase()
        // Deleted, so a possessive is one token on both sides — see above.
        .replace(/[`']/g, "")
        .replace(/[.,-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    const inName = new Set(words(mortuary.mortuary));
    const chapelWords = words(chapelDesc);
    return chapelWords.length > 0 && chapelWords.every((w) => inName.has(w));
  }

  /**
   * How likely a mortuary is to be the one a chapel's billing is raised against.
   * Lower is likelier; the order within a rank is the reference data's own.
   *
   * THE RIGHT KIND, THEN THE NAME, THEN THE COLUMN. The middle two are the source
   * system's rule — the LIKE finds it, the chapel code settles a LIKE that comes
   * back with several.
   *
   * CLASS SITS ABOVE BOTH, and that part is this layer's, kept because dropping
   * it broke two chapels the old rule had right. An owned chapel bills against
   * the company's own mortuary and a franchise against a franchised one; it is
   * what separates JAGNA's two identically-named rows, VS3-25 and VS3-25A, and it
   * is the ONLY thing that separates the pairs the chapel code cannot:
   *
   *   MAMBUR  "ST. PETER CHAPEL - MAMBURAO" and "OCCIDENTAL MINDORO FUNERAL
   *           SERVICES - MAMBURAO" are BOTH filed under MAMBUR, and the chapel is
   *           called "MAMBURAO, OCCIDENTAL MINDORO" — so the franchise's trade
   *           name matches the description word for word and the St. Peter
   *           chapel's does not. Name first hands an owned chapel a franchise.
   *   LUPON   "PADILLA FUNERAL HOME" and "ST. PETER CHAPEL - LUPON" are both
   *           filed under LUPON, and the chapel is a franchise. The same trap
   *           mirrored.
   */
  private static designationRank(
    mortuary: Mortuary,
    chapel: ChapelBranch,
  ): number {
    const named = PisDatabase.namesTheChapel(mortuary, chapel.chapelDesc);
    const coded = mortuary.chapelCode === chapel.chapelCode;
    const classMatches = mortuary.isFranchise === chapel.isFranchise;

    if (classMatches && named && coded) return 0;
    if (classMatches && named) return 1;
    // Named by nothing but the column, and still this chapel's: the note is
    // evidence where the name is silent, and a franchise parlour with a trade
    // name of its own ("FUNERARIA MALAYA") is never going to match a town.
    if (classMatches && coded) return 2;
    if (named && coded) return 3;
    if (named) return 4;
    return 5;
  }

  /** `chapelCode` → the ranked list, built once per chapel. */
  private mortuariesByChapel = new Map<string, Mortuary[]>();

  /**
   * The mortuaries of one chapel, the likeliest first — and the first of them is
   * the one a billing for that chapel is raised against.
   *
   * TWO WAYS IN, ONE LIST OUT. A mortuary belongs to this chapel if its NAME says
   * so — the description LIKE — or if its `BranchCode` column says so. The union
   * rather than either alone: the name is the real relationship and catches the
   * rows the column files under a neighbour, and the column catches the franchise
   * parlours whose names ("FUNERARIA MALAYA", "728 FUNERAL SERVICES") could never
   * match a town. {@link designationRank} then puts them in the order the source
   * system would have picked them in.
   *
   * WHAT THE RULE COSTS, in full: fifty chapels that had no mortuary at all now
   * have the one named after them, nothing that had a mortuary loses it, and
   * exactly two change hands. IBA ZAMBALES trades "ST. PETER CHAPEL - ZAMBALES"
   * for "ST. PETER CHAPEL - IBA ZAMBALES", which is the point of the whole rule.
   * ROSARIO trades "PNA HOLY ROSARY FUNERAL HOMES", filed under its own code, for
   * "AOC-ROSARIO FUNERAL HOMES", filed under San Pedro — and that one is the LIKE
   * overreaching: a franchise's trade name happens to contain the town and the
   * column that knew better is outranked. Left standing rather than special-
   * cased, because it is what the source query would return too, and because
   * ROSARIO is one of the nine chapels this seed DERIVED rather than received.
   *
   * 133 OF THE 141 CHAPELS have one, against 83 when the column was the only way
   * in. The eight left over are the ones whose description no mortuary spells the
   * same way — CEBU LARGE against a mortuary called CEBU, BOGO - PANDAN, SCOUT
   * CHUATOCO — and they get an EMPTY LIST, which is the right answer: a form then
   * opens on its prompt rather than on a guess.
   *
   * THE LAST TIE-BREAK IS THE RATE CARD, below all three of those. Eleven
   * chapels have several mortuaries that class, name and code cannot separate at
   * all — CAGAYAN DE ORO has two franchise parlours both filed under CAGAYA,
   * LUPON has five — and until 2026-08-26 the winner was simply whichever sorted
   * first in `RefMortuary`, which is no rule at all. `RefMortuaryCSPRate` is the
   * record of which funeral homes the company actually has terms with, and how
   * many: a mortuary with a 17-code rate card does business the company priced,
   * one with 8 does less of it, and one with NONE cannot be billed at all
   * (LUPON's list contains such a row). So among candidates nothing else
   * separates, the billing goes to the one with the broader card.
   *
   * It reads a second reference table to answer a question about this one, which
   * is worth being uneasy about — but the alternative is alphabetical order, and
   * the arbitrariness showed: CAGAYAN DE ORO was billing "EVERLASTING PEACE
   * FUNERAL HOMES", whose card has no ST.ANDREW, ST.CHRISTOPHER or ST.FRANCIS,
   * while "SAN GUILLERMO FUNERAL PARLOR - CDO" sat next to it with all three and
   * with the town's own abbreviation in its name.
   *
   * CACHED, because it is on the hot path — once per service as the payables
   * table is built and once per billing on every render — and the answer is a
   * fact about reference tables that do not change while the app is running.
   */
  getMortuariesForChapel(chapelCode: string): Mortuary[] {
    const cached = this.mortuariesByChapel.get(chapelCode);
    if (cached) return cached;

    const chapel = this.getChapel(chapelCode);
    // No chapel row, so no description to match on: the column is all there is.
    const ranked = !chapel
      ? this.getMortuariesByChapel(chapelCode)
      : this.getMortuaries()
          .filter(
            (m) =>
              m.chapelCode === chapelCode ||
              PisDatabase.namesTheChapel(m, chapel.chapelDesc),
          )
          .map((mortuary, index) => ({
            mortuary,
            index,
            rank: PisDatabase.designationRank(mortuary, chapel),
            rates: this.getCSPRateCount(mortuary.mortCode),
          }))
          // Rank, then the RATE CARD, then the reference data's own order.
          .sort(
            (a, b) => a.rank - b.rank || b.rates - a.rates || a.index - b.index,
          )
          .map((entry) => entry.mortuary);

    this.mortuariesByChapel.set(chapelCode, ranked);
    return ranked;
  }

  /**
   * The mortuary a chapel's billing is raised against — the head of
   * {@link getMortuariesForChapel}, and empty for the eight chapels that have
   * none.
   *
   * THE ONE ANSWER, and it has to be: it is what the billing seed writes into
   * `TblClaimsBilling.MortCode`, what the create-billing dialog opens on, and
   * what a service is priced at before its billing exists. Those three said
   * different things for a day — the seed took the first mortuary the chapel-code
   * column returned, unranked — and a billing on file was therefore raised
   * against a mortuary the screen would never have chosen.
   */
  getDesignatedMortCode(chapelCode: string): string {
    return this.getMortuariesForChapel(chapelCode)[0]?.mortCode ?? "";
  }

  /* --------------------------- CSP codes and rates --------------------------- */
  //
  // `RefMortuaryCSP` and `RefMortuaryCSPRate` — what prices a service payable.
  // See the block above `RefMortuaryCSPRecord` in `models.ts` for the two-step
  // rule these three lookups are the halves of.

  /** The CSP code list, in the reference table's own order. */
  getCSPTypes(): RefMortuaryCSPRecord[] {
    return refMortuaryCSPSeed;
  }

  getCSPType(cspCode: string): RefMortuaryCSPRecord | undefined {
    return refMortuaryCSPSeed.find((c) => c.cspCode === cspCode);
  }

  /**
   * How a description is compared — case, spacing and punctuation removed.
   *
   * BECAUSE THE JOIN IS ON TEXT AND THE TWO SIDES SPELL IT DIFFERENTLY.
   * `PlanType.planDesc` is "ST.CLAIRE" and `RefMortuaryCSP.cspDesc` is
   * "ST. CLAIRE": same name, one written by a system that had no room for the
   * space. Neither side is corrected — the comparison is loosened instead, which
   * is the only one of the two that survives the next drop of either table.
   *
   * Not so loose that it collides: "ST. ANDREW (CORP SALES OF PHILNABANK)" keeps
   * its parenthesis and stays a different key from "ST. ANDREW".
   */
  private static cspKey(desc: string): string {
    return desc.toUpperCase().replace(/[.,`'-]/g, " ").replace(/\s+/g, " ").trim();
  }

  /** `cspDesc` → `cspCode`, built once. */
  private cspByDesc?: Map<string, string>;

  /**
   * The CSP code a plan is charged under — step one of the pricing rule.
   *
   * Takes the PLAN DESCRIPTION ("ST.CLAIRE"), not the plan code: the CSP table
   * has no plan code on it, so the description is the only thing the two share.
   *
   * NOTHING BACK IS A REAL ANSWER. A plan whose description names no CSP row has
   * no code and therefore no rate, and the processor picks one — which is what
   * the form's dropdown is for. Guessing a near miss here would put a price on a
   * plan nobody priced.
   */
  getCSPCodeForPlan(planDesc: string): string | undefined {
    this.cspByDesc ??= new Map(
      refMortuaryCSPSeed.map((c) => [PisDatabase.cspKey(c.cspDesc), c.cspCode]),
    );
    return this.cspByDesc.get(PisDatabase.cspKey(planDesc));
  }

  /** `mortCode|cspCode` → amount, built once. */
  private cspRates?: Map<string, number>;

  /**
   * What a CSP code is worth at one mortuary, in pesos — step two of the rule.
   *
   * UNDEFINED WHERE THERE IS NO ROW, and that is not the same as zero: the
   * mortuary has no rate on file for that plan, which is a thing a processor has
   * to answer rather than a payable of nothing. See
   * `RefMortuaryCSPRateRecord` on why the table is sparse.
   */
  getCSPRate(mortCode: string, cspCode: string): number | undefined {
    this.cspRates ??= new Map(
      refMortuaryCSPRateSeed.map((r) => [`${r.mortCode}|${r.cspCode}`, r.cspAmount]),
    );
    return this.cspRates.get(`${mortCode}|${cspCode}`);
  }

  /** One mortuary's whole rate card — every code it has a rate for. */
  getCSPRatesByMortuary(mortCode: string): RefMortuaryCSPRateRecord[] {
    return refMortuaryCSPRateSeed.filter((r) => r.mortCode === mortCode);
  }

  /** `mortCode` → how many rates it carries, built once. */
  private cspRateCounts?: Map<string, number>;

  /**
   * HOW BROAD A MORTUARY'S RATE CARD IS — how many CSP codes it has terms for,
   * out of the 23 the rate table uses.
   *
   * A COUNT AND NOT A LIST, because the only question asked of it is comparative:
   * it breaks the designation tie between mortuaries nothing else separates. See
   * {@link getMortuariesForChapel}. Zero is a real answer and four mortuaries on
   * file give it — a funeral home the company has no terms with at all.
   */
  getCSPRateCount(mortCode: string): number {
    if (!this.cspRateCounts) {
      this.cspRateCounts = new Map();
      for (const r of refMortuaryCSPRateSeed) {
        this.cspRateCounts.set(r.mortCode, (this.cspRateCounts.get(r.mortCode) ?? 0) + 1);
      }
    }
    return this.cspRateCounts.get(mortCode) ?? 0;
  }

  /* --------------------------- Status reference --------------------------- */

  getAccountStatuses(): RefAccountStatusRecord[] {
    return refAccountStatusSeed;
  }

  getAccountStatus(
    acctStatCode: AccountStatus,
  ): RefAccountStatusRecord | undefined {
    return refAccountStatusSeed.find((s) => s.acctStatCode === acctStatCode);
  }

  getTerminationStatuses(): RefTermiStatRecord[] {
    return refTermiStatSeed;
  }

  getTerminationStatus(
    termiStatCode: TerminationStatus,
  ): RefTermiStatRecord | undefined {
    return refTermiStatSeed.find((s) => s.termiStatCode === termiStatCode);
  }

  /**
   * How a service is credited to the chapel — four values, in source order:
   * 1ST POINT, 2ND POINT, CREM ONLY, REGULAR.
   */
  getCreditOfServiceOptions(): RefCreditOfServiceRecord[] {
    return refCreditOfServiceSeed;
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

  /* -------------------------- Service payables -------------------------- */
  //
  // `TblBillingHdr`, `TblICIS_Billing_Processed` and `TblClaimsBilling`. See
  // `billing-seed.ts` for where the rows come from and `models.ts` for what the
  // four tables are between them.

  /**
   * The billing tables, built once on first use.
   *
   * LAZY, and that is the whole reason this is a field rather than an import:
   * the build reads chapels, plan holders, claims and payments back off THIS
   * object, so it cannot run while the module is still being evaluated. Nothing
   * in `billing-seed` imports the database at runtime — it is handed `this` —
   * so there is no cycle either way.
   */
  private billingTables?: BillingTables;

  private tables(): BillingTables {
    return (this.billingTables ??= buildBillingTables(this));
  }

  /** Every billing code on file — one per chapel per period. */
  getBillingHdrs(): BillingHdrRecord[] {
    return this.tables().billingHdr;
  }

  getBillingHdr(billingCode: string): BillingHdrRecord | undefined {
    return this.getBillingHdrs().find((b) => b.billingCode === billingCode);
  }

  /**
   * Every serviced account on file, each joined to its chapel and its plan —
   * the rows the For Process queue is made of.
   */
  getBillingProcessed(): BillingProcessed[] {
    return this.tables().billingProcessed.map(
      (r) =>
        new BillingProcessed(
          r,
          this.getChapel(r.chapelCode),
          // May be nothing: `PolicyNo` is a plan number in text, with no
          // foreign key behind it, so it can name a plan that is not on file.
          this.getPlanholder(r.policyNo),
        ),
    );
  }

  /** The serviced accounts under one billing code. */
  getBillingProcessedByCode(billingCode: string): BillingProcessed[] {
    return this.getBillingProcessed().filter(
      (r) => r.billingCode === billingCode,
    );
  }

  /**
   * The billings that have been CREATED — the rows carrying a Billing No.
   *
   * A billing code with no row here has not been billed yet, which is exactly
   * what the For Process queue is. Billings created in the browser this session
   * are the service-payables store's, not these.
   */
  getClaimsBillings(): ClaimsBillingRecord[] {
    return this.tables().claimsBilling;
  }

  /** The created billing for a billing CODE, if it has one. */
  getClaimsBillingByCode(billingCode: string): ClaimsBillingRecord | undefined {
    return this.getClaimsBillings().find((b) => b.cisBillingNo === billingCode);
  }

  /**
   * The people who put billings through.
   *
   * THE REAL SERVICE PAYABLES DESK since 2026-09-14, though still not a TABLE:
   * this layer has no users, so the three are a list rather than rows with ids.
   * It is exposed all the same because a picker has to be able to list a
   * processor who has nothing at the stage being looked at, and that cannot be
   * read off the billings. See `PROCESSORS`.
   */
  getProcessors(): string[] {
    return PROCESSORS;
  }
}

/** Shared singleton — the app's handle on the mock database. */
export const db = new PisDatabase();
