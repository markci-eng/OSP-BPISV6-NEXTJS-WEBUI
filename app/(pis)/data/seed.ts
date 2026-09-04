// Seed data for the PIS mock database.
//
// One exported array per "table", using the raw record shapes from `models.ts`.
// Values follow the real system's conventions:
//
//   Planholder.LPANo        L + 2-digit year + 6-digit count + trailing letter
//                           (10 chars, starts with L, ends with a letter)
//                           e.g. L26000901M
//   ClaimRequest.RequestNo  CL + branch + year + claim code + 6-digit sequence
//                           e.g. CLQCITY2026CAB000001
//   ClaimsHdr.ClaimNo       territory + claim code + 2-digit year + sequence
//                           e.g. NCT1DC26009785
//   Status                  AP / DN / FA / FD / PE
//   Benefits                CAB / ECAB / ADB / USB
//
// Nothing here is derived — computed values (age, nature code, contestability,
// formatted name/address, …) live on the domain classes.

import {
  daysBefore,
  type AddressRecord,
  type BeneficiaryRecord,
  type BranchRecord,
  type ChapelBranchRecord,
  type ClaimRequestRecord,
  type ClaimsHdrDCRecord,
  type ClaimsPayeeRecord,
  type ContactInfoRecord,
  type DocumentRecord,
  type DocumentTypeRecord,
  type PaymentRecord,
  type PayoutAccountRecord,
  type PersonRecord,
  type PlanholderNoteRecord,
  type PlanholderRecord,
  type PlanholderRemarkRecord,
  type PlanTypeRecord,
  type RefAccountStatusRecord,
  type RefCreditOfServiceRecord,
  type RefMortuaryRecord,
  type RefPayClassRecord,
  type RefPayoutChannelRecord,
  type RefTermiStatRecord,
  type TerritoryRecord,
} from "./models";

const AUDIT = { user: "system", date: "2026-01-01T00:00:00" };
const PROCESSOR = "MARITES BELIESTA";

// Plan holder rows were loaded by the migration, not by a user, and say so.
// Declared up here with the other audit stamps rather than beside
// `planholderSeed`, because the bulk block below builds plan holders too and
// runs before that point in the file.
const PH_AUDIT = { auditUser: "migration", auditDate: "2026-01-01T00:00:00" };

/* ================================ PlanType ================================ */

export const planTypeSeed: PlanTypeRecord[] = [
  { planCode: "A5M", planDesc: "ST.ANNE", productCode: "LP", planClass: "RA", contractPrice: 56000, instAmt: 1027, term: 5 },
  { planCode: "RA5M5", planDesc: "ST.ANDREW", productCode: "RP", planClass: "CL", contractPrice: 165000, instAmt: 3135, term: 5 },
  { planCode: "B5M10", planDesc: "ST.BERNADETTE", productCode: "LP", planClass: "RA", contractPrice: 125000, instAmt: 2375, term: 5 },
  { planCode: "RC5M4", planDesc: "ST.CHRISTOPHER", productCode: "RP", planClass: "RA", contractPrice: 85000, instAmt: 1615, term: 5 },
  { planCode: "C5M8", planDesc: "ST.CLAIRE", productCode: "LP", planClass: "RA", contractPrice: 80000, instAmt: 1520, term: 5 },
  { planCode: "D5M9", planDesc: "ST.DOMINIQUE", productCode: "LP", planClass: "CL", contractPrice: 60000, instAmt: 1140, term: 5 },
  { planCode: "RD5M5", planDesc: "ST.DOROTHY", productCode: "RP", planClass: "CL", contractPrice: 60000, instAmt: 1140, term: 5 },
  { planCode: "NF5M4", planDesc: "ST.FERDINAND", productCode: "NR", planClass: "CL", contractPrice: 105000, instAmt: 1995, term: 5 },
  { planCode: "F5MDS", planDesc: "ST.FLAVIA", productCode: "LP", planClass: "RA", contractPrice: 12500, instAmt: 178.75, term: 5 },
  { planCode: "RF5M8", planDesc: "ST.FRANCIS", productCode: "NR", planClass: "RA", contractPrice: 100000, instAmt: 1900, term: 5 },
  { planCode: "LG7M13", planDesc: "ST.GEORGE", productCode: "SP", planClass: "RA", contractPrice: 57000, instAmt: 775, term: 5 },
];

/**
 * Derive a plan's ledger figures from its plan type so the Plan Detail panel
 * always adds up: TAP = installment × 12 × term, paid = installment × instNo.
 */
function planFigures(planCode: string, instNo: number) {
  const pt = planTypeSeed.find((p) => p.planCode === planCode);
  if (!pt) throw new Error(`Unknown plan code: ${planCode}`);
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const planTAP = round2(pt.instAmt * 12 * pt.term);
  const totalAmountPaid = round2(pt.instAmt * instNo);
  return {
    planCode,
    planClass: pt.planClass,
    planTAP,
    totalAmountPaid,
    balance: round2(planTAP - totalAmountPaid),
    instNo,
  };
}

/**
 * A plan settled in full — every installment of its term paid, nothing left on
 * the balance.
 *
 * What a DECEASED plan holder's account looks like by the time a chapel's
 * service payable is raised against it: the death benefit closes the account
 * out, and the service-payable rules will only let a plan be serviced once its
 * account status is `FP`. So the two go together, and every plan holder below
 * carrying `acctStatCode: "FP"` gets its ledger from here.
 */
function paidInFull(planCode: string) {
  const pt = planTypeSeed.find((p) => p.planCode === planCode);
  if (!pt) throw new Error(`Unknown plan code: ${planCode}`);
  return planFigures(planCode, pt.term * 12);
}

/* ============================ Bulk claim volume ============================ */
//
// Everything hand-written below has a story attached — a lapsed plan, a second
// plan, a contestable date, a specific payee. This block is the opposite: plain
// VOLUME behind those, so the queue dashboards can be looked at the length they
// will actually run at. A queue of six tells you nothing about whether a list
// pages, scrolls or fits the screen it is on.
//
// Every row is derived from its index — no randomness — so the same seed comes
// out of every reload and a screenshot of a queue means something tomorrow.
//
// These rows deliberately carry NO addresses, contacts, payees or documents.
// They exist to be counted, filtered and sorted in a list; a plan holder anyone
// actually opens should be one of the hand-written ones above, where the detail
// is real.

/** How many of each stage the bulk block adds. */
const BULK = { pending: 22, endorsed: 12, decided: 8 };

const BULK_FIRST = ["Emilio", "Corazon", "Ignacio", "Perlita", "Rufino", "Aurora", "Salvador", "Milagros", "Eduardo", "Natividad", "Feliciano", "Consuelo"];
const BULK_MIDDLE = ["Bautista", "Salvador", "Alcantara", "Gatchalian", "Escobar", "Bernardo", "Malabanan", "Cordero"];
const BULK_LAST = ["Marquez", "Escudero", "Buenaventura", "Fernandez", "Pascual", "Delfin", "Rosales", "Tolentino", "Abadilla", "Nicolas"];
const BULK_BIRTHPLACE = ["Pasig City", "Bacolod City", "Zamboanga City", "Dagupan City", "Roxas City", "Butuan City"];

/**
 * Branch + territory pairs, so a generated claim no matches its branch.
 *
 * Written out rather than looked up in `branchSeed`: this block runs at module
 * load and that array is declared further down the file. Keep the two in step —
 * a territory here that disagrees with the branch's own would put a claim in one
 * territory's queue under another territory's number.
 */
const BULK_BRANCH = [
  { code: "QCITY", territory: "NCT1" },
  { code: "CEBU", territory: "VCT" },
  { code: "DAVAO", territory: "MCET" },
  { code: "BAGUIO", territory: "CLT2" },
  { code: "ILOILO", territory: "VWT1" },
  { code: "NAGA", territory: "BT" },
  { code: "CDO", territory: "MCET" },
  { code: "MANILA", territory: "NCT2" },
];

const BULK_PLAN = ["A5M", "B5M10", "RC5M4", "C5M8", "D5M9", "RF5M8", "RD5M5", "NF5M4"];

/** Natural causes file late (nature RC); the accidental ones file fast (SC). */
const BULK_NATURAL = ["Natural Causes", "Cardiac Arrest", "Prolonged Illness", "Pneumonia"];
const BULK_ACCIDENT = ["Vehicular Accident", "Drowning", "Fire", "Electrocution", "Fall from Height"];

/**
 * One bulk claim, start to finish: the deceased, their plan, the beneficiary on
 * it, the request the branch filed, and — for anything past "pending" — the
 * header a processor opened.
 *
 * `stage` decides which queue it lands in:
 *   pending  → request status PE, no header      → For Process
 *   endorsed → request status FA, verified header → For Verification
 *   decided  → request status AP/DN, header       → For Endorsement, once the
 *              claims dashboard's activity feed names it
 */
function buildBulkClaim(index: number, stage: "pending" | "endorsed" | "decided") {
  const seq = index + 1;
  const pad = (n: number, width: number) => String(n).padStart(width, "0");

  const personId = `P-1${pad(seq, 2)}`;
  // L + 2-digit year + 6-digit count + trailing letter, as at the top of file.
  const lpaNo = `L26${pad(1000 + seq, 6)}${"ABCDEFGHJKLMNPQRSTUVWXYZ"[seq % 24]}`;
  const branch = BULK_BRANCH[seq % BULK_BRANCH.length];

  // Every third claim is accidental, which files inside the 7-day window and so
  // reads as a SPECIAL claim. That keeps both natures well represented in every
  // queue, which is what the Special / Regular filter is there to separate.
  const isAccident = seq % 3 === 0;
  const benefits = isAccident ? "ADB" : seq % 7 === 0 ? "ECAB" : seq % 11 === 0 ? "USB" : "CAB";
  const cause = isAccident
    ? BULK_ACCIDENT[seq % BULK_ACCIDENT.length]
    : BULK_NATURAL[seq % BULK_NATURAL.length];

  // Spread the filing dates across a couple of months so sorting by Filed has
  // something to do. Deterministic, and all inside the seed's 2026 window.
  const filedAt = `2026-0${5 + (seq % 3)}-${pad((seq % 27) + 1, 2)}T0${(seq % 8) + 1}:00:00`;

  const status = stage === "pending" ? "PE" : stage === "endorsed" ? "FA" : seq % 4 === 0 ? "DN" : "AP";
  const requestNo = `CL${branch.code}2026${benefits}${pad(100 + seq, 6)}`;
  const claimNo = `${branch.territory}DC26${pad(9900 + seq, 6)}`;

  const person: PersonRecord = {
    personId,
    lastName: BULK_LAST[seq % BULK_LAST.length],
    firstName: BULK_FIRST[seq % BULK_FIRST.length],
    middleName: BULK_MIDDLE[seq % BULK_MIDDLE.length],
    dateOfBirth: `19${45 + (seq % 40)}-${pad((seq % 12) + 1, 2)}-${pad((seq % 27) + 1, 2)}`,
    placeOfBirth: BULK_BIRTHPLACE[seq % BULK_BIRTHPLACE.length],
    genderAtBirth: seq % 2 === 0 ? "Female" : "Male",
    preferredGender: seq % 2 === 0 ? "Female" : "Male",
    civilStatus: seq % 3 === 0 ? "Widowed" : seq % 3 === 1 ? "Married" : "Single",
    height: String(150 + (seq % 25)),
    weight: String(50 + (seq % 30)),
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
    addresses: [],
  };

  // Every bulk plan holder is deceased, so the account behind each is the one a
  // chapel's service payable is raised against: settled in full, and not yet
  // terminated — the state the service-payable rules require before a plan can
  // be serviced at all. Two minorities break that up, and both exist so the
  // service-payables queue has something to catch:
  //
  //   ROP     the plan was returned as premium (FR / RP). Not serviceable, and
  //           the branch has to answer for it — this is the ROP discrepancy.
  //   LAPSED  the account never reached fully paid, so the plan is not ready.
  //
  // Checked ROP first so the two cannot both land on one row: `FR` reads FULLY
  // PAID ROP, and a lapsed account under it would be a row contradicting itself.
  const rop = seq % 13 === 0 ? "FR" : seq % 17 === 0 ? "RP" : null;
  const lapsed = !rop && seq % 9 === 0;
  const planCode = BULK_PLAN[seq % BULK_PLAN.length];

  const planholder: PlanholderRecord = {
    lpaNo,
    personId,
    ...(lapsed
      ? planFigures(planCode, 12 + (seq % 48))
      : paidInFull(planCode)),
    accountClass: "R",
    acctStatCode: lapsed ? "LP" : "FP",
    termiStatCode: rop ?? "NT",
    dueDate: "2026-08-01",
    effectivityDate: `20${20 + (seq % 6)}-${pad((seq % 12) + 1, 2)}-01`,
    isServiceOnly: false,
    riDate: null,
    lastPaymentDate: "2026-07-01",
    ...PH_AUDIT,
  };

  // The plan holder's own beneficiary. Points back at one of the hand-written
  // claimant persons rather than inventing more people — who is named matters
  // to the claim form, not to a queue, and this keeps the row valid.
  const beneficiary: BeneficiaryRecord = {
    beneficiaryId: `BF-001${pad(seq, 2)}`,
    lpaNo,
    personId: `P-0${pad(16 + (seq % 9), 2)}`,
    relation: seq % 2 === 0 ? "Spouse" : "Child",
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
  };

  const request: ClaimRequestRecord = {
    requestNo,
    requestingBranch: branch.code,
    lpaNo,
    claimType: "Death Claim",
    causeOfIncident: cause,
    incidentDate: daysBefore(filedAt, isAccident ? 6 : 8),
    status,
    auditUser: PROCESSOR,
    auditDate: filedAt,
  };

  const header: ClaimsHdrDCRecord | null =
    stage === "pending"
      ? null
      : {
          claimNo,
          claimRequest: requestNo,
          auditUser: PROCESSOR,
          auditDate: filedAt,
          isQuitClaim: false,
          isVerified: true,
          verifiedBy: PROCESSOR,
          verifiedDate: filedAt,
          benefits,
        };

  return { person, planholder, beneficiary, request, header, requestNo, stage };
}

const bulkClaims = [
  ...Array.from({ length: BULK.pending }, (_, i) => buildBulkClaim(i, "pending")),
  ...Array.from({ length: BULK.endorsed }, (_, i) =>
    buildBulkClaim(BULK.pending + i, "endorsed"),
  ),
  ...Array.from({ length: BULK.decided }, (_, i) =>
    buildBulkClaim(BULK.pending + BULK.endorsed + i, "decided"),
  ),
];

const bulkPersons = bulkClaims.map((c) => c.person);
const bulkPlanholders = bulkClaims.map((c) => c.planholder);
const bulkBeneficiaries = bulkClaims.map((c) => c.beneficiary);
const bulkRequests = bulkClaims.map((c) => c.request);
const bulkHeaders = bulkClaims
  .map((c) => c.header)
  .filter((h): h is ClaimsHdrDCRecord => h !== null);

/**
 * The bulk claims that have been decided — what the death-claim dashboard's
 * endorsement queue reads. Exported because that queue is driven by an activity
 * feed rather than by status alone, and the feed has to be able to name them.
 */
export const bulkDecidedClaimRefs = bulkClaims
  .filter((c) => c.stage === "decided")
  .map((c) => c.requestNo);

/* ========================= Assigned plans — `SA` ========================= */
//
// THE PLAN HOLDER IS USUALLY NOT THE DECEASED, and until now this seed said the
// opposite. Every plan above is held by the person it buries, so
// `TblICIS_Billing_Processed.DeceasedName` and the plan holder's name were the
// same string on every row in the file — and a processor whose job is to check
// one against the other had nothing to check, on any billing, ever.
//
// These are the other case: a plan bought by one person and used to bury
// another. The holder is alive; the plan's termination status is `SA` —
// SERVICED - ASSIGNED, which is the reference table's own word for it, and the
// only status that says the plan and the funeral belong to two different
// people. (`SP`, its neighbour, is serviced FOR the plan holder — the ordinary
// case, and what every other plan here would carry once terminated.)
//
// NO DEATH CLAIM IS FILED AGAINST ANY OF THEM, which is what keeps them out of
// the derived endorsement pass — these plans reach a billing only through
// `assignedEndorsements` in `billing-seed.ts`, which deals them across the
// billing codes so that every code has at least one. That is the point of
// generating a POOL rather than placing them by hand: the number of billing
// codes is not knowable here, it falls out of how the chapels' weeks divide up,
// so the pool is made comfortably larger than it and the billing seed spends
// all of it.
//
// The count is a supply, not a target. Every plan in it is used — the dealer
// goes round again rather than leaving one unspent, because a plan marked
// SERVICED with no service against it would be a row contradicting itself.
const ASSIGNED_PLANS = 48;

/**
 * First names for the DECEASED on an assigned plan.
 *
 * A pool of its own, sharing nothing with {@link BULK_FIRST}, and that is what
 * makes "the two names differ" true by construction rather than by luck: the
 * holder's first name comes from that list and the deceased's from this one, so
 * no arithmetic over the two can ever land them on the same full name.
 *
 * The surname and middle name come from the same pools as everybody else's,
 * because a dependant is usually family.
 */
const ASSIGNED_DECEASED_FIRST = ["Anastacio", "Benedicta", "Crisanto", "Dionisia", "Estanislao", "Fructuosa", "Gregorio", "Hilaria", "Isabelo", "Juanita", "Leoncio", "Maximina"];

/**
 * One assigned plan: the holder, their plan, and the name of the person the
 * plan was spent on.
 *
 * The deceased is a NAME AND NOT A PERSON, deliberately. The source column is a
 * name with no foreign key behind it — `IcisBillingProcessedRecord.deceasedName`
 * says as much — so seeding a `Person` for them would invent a link the real
 * table does not have.
 */
function buildAssignedPlan(index: number) {
  const seq = index + 1;
  const pad = (n: number, width: number) => String(n).padStart(width, "0");

  // `P-4…` and `L25 2…` are both untaken: the bulk block holds P-1xx, the
  // territory heads P-2xx and the chapel managers P-3xxx.
  const personId = `P-4${pad(seq, 3)}`;
  const lpaNo = `L25${pad(2000 + seq, 6)}${"ABCDEFGHJKLMNPQRSTUVWXYZ"[seq % 24]}`;
  const planCode = BULK_PLAN[(seq * 3) % BULK_PLAN.length];

  const person: PersonRecord = {
    personId,
    lastName: BULK_LAST[(seq * 7) % BULK_LAST.length],
    firstName: BULK_FIRST[(seq * 5) % BULK_FIRST.length],
    middleName: BULK_MIDDLE[(seq * 3) % BULK_MIDDLE.length],
    dateOfBirth: `19${50 + (seq % 30)}-${pad((seq % 12) + 1, 2)}-${pad((seq % 27) + 1, 2)}`,
    placeOfBirth: BULK_BIRTHPLACE[seq % BULK_BIRTHPLACE.length],
    genderAtBirth: seq % 2 === 0 ? "Male" : "Female",
    preferredGender: seq % 2 === 0 ? "Male" : "Female",
    civilStatus: seq % 3 === 0 ? "Widowed" : "Married",
    height: String(150 + (seq % 25)),
    weight: String(50 + (seq % 30)),
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
    addresses: [],
  };

  // FULLY PAID AND NOT AN ROP, every one of them. These rows exist to make the
  // deceased column mean something; a discrepancy on top would be a second
  // lesson taught over the first, and the queue already has its examples of
  // both kinds from the bulk block.
  const planholder: PlanholderRecord = {
    lpaNo,
    personId,
    ...paidInFull(planCode),
    accountClass: "R",
    acctStatCode: "FP",
    termiStatCode: "SA",
    dueDate: "2026-08-01",
    effectivityDate: `20${18 + (seq % 8)}-${pad((seq % 12) + 1, 2)}-01`,
    isServiceOnly: false,
    riDate: null,
    lastPaymentDate: "2026-07-01",
    ...PH_AUDIT,
  };

  const deceasedName = [
    ASSIGNED_DECEASED_FIRST[(seq * 5) % ASSIGNED_DECEASED_FIRST.length],
    BULK_MIDDLE[(seq * 11) % BULK_MIDDLE.length],
    BULK_LAST[(seq * 13) % BULK_LAST.length],
  ].join(" ");

  return { person, planholder, deceasedName };
}

const assignedPlans = Array.from({ length: ASSIGNED_PLANS }, (_, i) =>
  buildAssignedPlan(i),
);

const assignedPersons = assignedPlans.map((a) => a.person);
const assignedPlanholders = assignedPlans.map((a) => a.planholder);

/* ==================== Territories and chapel branches ==================== */
//
// Up here with the bulk block, and above `personSeed`, for the same reason it
// is: this block BUILDS people — a head per territory and a manager per chapel
// — and they have to exist before the array they are spread into is declared.
//
// A chapel is not a branch. A branch sells plans and collects on them; a chapel
// renders the service the plan was bought for. The two are grouped by the same
// territories and meet nowhere else, which is why they are separate tables that
// share one foreign key.
//
// The chapels come in two lists, and the split is the source data's own. The
// reference drop gives the company-owned network in full and says so ("all of
// this is not franchise"); the franchised chapels are not in it at all. They are
// reachable only through `RefMortuary`, whose FR rows name chapel codes that
// appear nowhere in the owned list — ROSARI, TAGUIG, SANPED, GENSAN and the rest
// of Mindanao. Those codes are the franchise network, and `FRANCHISE_CHAPELS`
// below is them. See that block for what is derived and what is given.

/** `[code, description]`, in the order the source system lists them. */
const TERRITORIES: [string, string][] = [
  ["BT", "BICOL TERRITORY"],
  ["CLBZT", "CALABARZON"],
  ["CLT1", "CENTRAL LUZON TERRITORY 1"],
  ["CLT2", "CENTRAL LUZON TERRITORY 2"],
  ["CVT", "CAGAYAN VALLEY TERRITORY"],
  ["GME", "GREATER MANILA EAST"],
  ["MCET", "MINDANAO CENTRAL EAST TERRITORY"],
  ["MMRPT", "MIMAROPA"],
  ["VET", "VISAYAS EAST TERRITORY"],
  ["VCT", "VISAYAS CENTRAL TERRITORY"],
  ["VWT1", "VISAYAS WEST TERRITORY1"],
  ["NCT1", "NATIONAL CAPITAL TERRITORY1"],
  ["NCT2", "NATIONAL CAPITAL TERRITORY2"],
];

/** `[chapelCode, chapelDesc, territoryCode, barangay, city, province, zipCode]`. */
type ChapelRow = [string, string, string, string, string, string, number];

/**
 * The company-owned chapels.
 *
 * The first three columns are the source system's own; the address is filled in
 * against the real place each chapel is named for. Barangay is the chapel's own
 * district where its NAME says which one it is ("IRIGA - SAN MIGUEL", "CUBAO",
 * "BOGO - PANDAN") and "Poblacion" for the provincial towns where it does not —
 * which is where a town's chapel usually stands anyway.
 *
 * GME, MCET and NCT2 have no chapels in this list. That is the source data, not
 * an omission: the company's OWN network has not reached them. GME and MCET are
 * covered by franchises instead — see {@link FRANCHISE_CHAPELS} — and NCT2 by
 * neither, so it stays the territory the dashboard has to show empty.
 */
const CHAPELS: ChapelRow[] = [
  ["ALABAT", "ALABAT", "CLBZT", "Poblacion", "Alabat", "Quezon", 4333],
  ["ALAMIN", "ALAMINOS", "CLT2", "Poblacion", "Alaminos City", "Pangasinan", 2404],
  ["ANGELE", "ANGELES", "CLT1", "Balibago", "Angeles City", "Pampanga", 2009],
  ["ANTIPO", "ANTIPOLO", "NCT1", "San Roque", "Antipolo City", "Rizal", 1870],
  ["APARRI", "APARRI", "CVT", "Poblacion", "Aparri", "Cagayan", 3515],
  ["ARANET", "ARANETA", "NCT1", "Cubao", "Quezon City", "Metro Manila", 1109],
  ["ATIMON", "ATIMONAN", "CLBZT", "Poblacion", "Atimonan", "Quezon", 4331],
  ["BACOLO", "BACOLOD", "VWT1", "Villamonte", "Bacolod City", "Negros Occidental", 6100],
  ["BAIS", "BAIS", "VWT1", "Poblacion", "Bais City", "Negros Oriental", 6206],
  ["BALANG", "BALANGA", "CLT1", "Poblacion", "Balanga City", "Bataan", 2100],
  ["BANTAY", "BANTAYAN", "VCT", "Poblacion", "Bantayan", "Cebu", 6052],
  ["BATANG", "SAN JOSE, BATANGAS", "CLBZT", "Poblacion", "San Jose", "Batangas", 4227],
  ["BAYAMB", "BAYAMBANG", "CLT2", "Poblacion", "Bayambang", "Pangasinan", 2423],
  ["BAYAWA", "BAYAWAN", "VWT1", "Poblacion", "Bayawan City", "Negros Oriental", 6221],
  ["BAYBAY", "BAYBAY", "VET", "Poblacion", "Baybay City", "Leyte", 6521],
  ["BAYOMB", "BAYOMBONG", "CVT", "Poblacion", "Bayombong", "Nueva Vizcaya", 3700],
  ["BINAN", "BIÑAN", "MMRPT", "Poblacion", "Biñan City", "Laguna", 4024],
  ["BINANC", "BIÑAN CANLALAY", "MMRPT", "Canlalay", "Biñan City", "Laguna", 4024],
  ["BINANG", "BINANGONAN", "NCT1", "Calumpang", "Binangonan", "Rizal", 1940],
  ["BOAC", "BOAC", "CLBZT", "Poblacion", "Boac", "Marinduque", 4900],
  ["BOGO", "BOGO", "VCT", "Poblacion", "Bogo City", "Cebu", 6010],
  ["BOGOPA", "BOGO - PANDAN", "VCT", "Pandan", "Bogo City", "Cebu", 6010],
  ["BORONG", "BORONGAN", "VET", "Poblacion", "Borongan City", "Eastern Samar", 6800],
  ["BROOKE", "BROOKE`S POINT", "MMRPT", "Poblacion", "Brooke's Point", "Palawan", 5303],
  ["BULAN", "BULAN", "BT", "Poblacion", "Bulan", "Sorsogon", 4706],
  ["CABANA", "CABANATUAN", "CLT1", "Poblacion", "Cabanatuan City", "Nueva Ecija", 3100],
  ["CABARR", "CABARROGUIS", "CVT", "Poblacion", "Cabarroguis", "Quirino", 3400],
  ["CABUYA", "CABUYAO", "MMRPT", "Poblacion", "Cabuyao City", "Laguna", 4025],
  ["CADIZ", "CADIZ", "VWT1", "Poblacion", "Cadiz City", "Negros Occidental", 6121],
  ["CALAML", "CALAMBA", "MMRPT", "Poblacion", "Calamba City", "Laguna", 4027],
  ["CALAPA", "CALAPAN", "MMRPT", "Poblacion", "Calapan City", "Oriental Mindoro", 5200],
  ["CALAPB", "CALAPAN, BAYANAN", "MMRPT", "Bayanan", "Calapan City", "Oriental Mindoro", 5200],
  ["CALBAY", "CALBAYOG", "VET", "Poblacion", "Calbayog City", "Samar", 6710],
  ["CAMILI", "CAMILING", "CLT2", "Poblacion", "Camiling", "Tarlac", 2306],
  ["CARLNO", "SAN CARLOS, NEGROS OCCIDENTAL", "VWT1", "Poblacion", "San Carlos City", "Negros Occidental", 6127],
  ["CARMEN", "CARMEN", "VCT", "Poblacion", "Carmen", "Cebu", 6005],
  ["CATARM", "CATARMAN", "VET", "Poblacion", "Catarman", "Northern Samar", 6400],
  ["CATBAL", "CATBALOGAN", "VET", "Poblacion", "Catbalogan City", "Samar", 6700],
  ["CAUAYA", "CAUAYAN", "CVT", "Poblacion", "Cauayan City", "Isabela", 3305],
  ["CEBUMG", "CEBU MEGA", "VCT", "Mabolo", "Cebu City", "Cebu", 6000],
  ["CEBUS", "CEBU LARGE", "VCT", "Guadalupe", "Cebu City", "Cebu", 6000],
  ["CENBUL", "BALIUAG", "CLT1", "Poblacion", "Baliuag", "Bulacan", 3006],
  ["COGEO", "COGEO", "NCT1", "San Jose", "Antipolo City", "Rizal", 1870],
  ["COMMON", "COMMONWEALTH", "NCT1", "Commonwealth", "Quezon City", "Metro Manila", 1121],
  ["CRUZMA", "STA. CRUZ, MARINDUQUE", "CLBZT", "Poblacion", "Sta. Cruz", "Marinduque", 4902],
  ["CRUZZA", "STA. CRUZ, ZAMBALES", "CLT1", "Poblacion", "Sta. Cruz", "Zambales", 2213],
  ["CUBAO", "CUBAO", "NCT1", "Cubao", "Quezon City", "Metro Manila", 1109],
  ["DALAGU", "DALAGUETE", "VCT", "Poblacion", "Dalaguete", "Cebu", 6022],
  ["DANAO", "DANAO", "VCT", "Poblacion", "Danao City", "Cebu", 6004],
  ["DINALU", "DINALUPIHAN", "CLT1", "Poblacion", "Dinalupihan", "Bataan", 2110],
  ["DONSOL", "DONSOL", "BT", "Poblacion", "Donsol", "Sorsogon", 4715],
  ["DUMAGU", "DUMAGUETE", "VWT1", "Poblacion", "Dumaguete City", "Negros Oriental", 6200],
  ["ESCALA", "ESCALANTE", "VWT1", "Poblacion", "Escalante City", "Negros Occidental", 6124],
  ["GAPAN", "GAPAN", "CLT1", "Poblacion", "Gapan City", "Nueva Ecija", 3105],
  ["GATTAR", "GATTARAN", "CVT", "Poblacion", "Gattaran", "Cagayan", 3508],
  ["GUAGUA", "GUAGUA", "CLT1", "Poblacion", "Guagua", "Pampanga", 2003],
  ["GUIHUL", "GUIHULNGAN", "VWT1", "Poblacion", "Guihulngan City", "Negros Oriental", 6214],
  ["GUIMBA", "GUIMBA", "CLT1", "Poblacion", "Guimba", "Nueva Ecija", 3115],
  ["GUINTO", "GUIGUINTO", "CLT1", "Poblacion", "Guiguinto", "Bulacan", 3015],
  ["GUMACA", "GUMACA", "CLBZT", "Poblacion", "Gumaca", "Quezon", 4307],
  ["HILONG", "HILONGOS", "VET", "Poblacion", "Hilongos", "Leyte", 6524],
  ["IBAZAM", "IBA ZAMBALES", "CLT1", "Poblacion", "Iba", "Zambales", 2201],
  ["ILAGAN", "ILAGAN", "CVT", "Poblacion", "Ilagan City", "Isabela", 3300],
  ["ILDEFO", "SAN ILDEFONSO", "CLT1", "Poblacion", "San Ildefonso", "Bulacan", 3010],
  ["INFANT", "INFANTA", "MMRPT", "Poblacion", "Infanta", "Quezon", 4336],
  ["IRIGAS", "IRIGA - SAN MIGUEL", "BT", "San Miguel", "Iriga City", "Camarines Sur", 4431],
  ["JAGNA", "JAGNA", "VCT", "Poblacion", "Jagna", "Bohol", 6308],
  ["JOSEDE", "SAN JOSE, DEL MONTE", "CLT1", "Tungkong Mangga", "San Jose del Monte City", "Bulacan", 3023],
  ["JOSENU", "SAN JOSE, NUEVA ECIJA", "CLT1", "Poblacion", "San Jose City", "Nueva Ecija", 3121],
  ["KABANK", "KABANKALAN", "VWT1", "Poblacion", "Kabankalan City", "Negros Occidental", 6111],
  ["LALOMA", "LA LOMA", "NCT1", "La Loma", "Quezon City", "Metro Manila", 1114],
  ["LEGASP", "LEGASPI", "BT", "Poblacion", "Legazpi City", "Albay", 4500],
  ["LIPA", "LIPA", "CLBZT", "Poblacion", "Lipa City", "Batangas", 4217],
  ["LOPEZ", "LOPEZ", "CLBZT", "Poblacion", "Lopez", "Quezon", 4316],
  ["MAASIN", "MAASIN", "VET", "Poblacion", "Maasin City", "Southern Leyte", 6600],
  ["MABALA", "MABALACAT", "CLT1", "Poblacion", "Mabalacat City", "Pampanga", 2010],
  ["MALABO", "MALABON", "NCT1", "Concepcion", "Malabon City", "Metro Manila", 1470],
  ["MAMBUR", "MAMBURAO, OCCIDENTAL MINDORO", "MMRPT", "Poblacion", "Mamburao", "Occidental Mindoro", 5106],
  ["MANDAU", "MANDAUE", "VCT", "Centro", "Mandaue City", "Cebu", 6014],
  ["MANGAL", "DAGUPAN", "CLT2", "Poblacion Oeste", "Dagupan City", "Pangasinan", 2400],
  ["MARIKI", "MARIKINA", "NCT1", "Sto. Niño", "Marikina City", "Metro Manila", 1800],
  ["MASBAT", "MASBATE", "BT", "Poblacion", "Masbate City", "Masbate", 5400],
  ["MAYON", "MAYON", "NCT1", "Sta. Teresita", "Quezon City", "Metro Manila", 1114],
  ["MEXICO", "MEXICO", "CLT1", "Poblacion", "Mexico", "Pampanga", 2021],
  ["MEYCAU", "MEYCAUAYAN", "CLT1", "Poblacion", "Meycauayan City", "Bulacan", 3020],
  ["MOALBO", "MOALBOAL", "VCT", "Poblacion", "Moalboal", "Cebu", 6032],
  ["MONTAL", "MONTALBAN", "NCT1", "San Jose", "Rodriguez", "Rizal", 1860],
  ["NAGA", "NAGA TABUCO", "BT", "Tabuco", "Naga City", "Camarines Sur", 4400],
  ["NARRA", "NARRA", "MMRPT", "Poblacion", "Narra", "Palawan", 5303],
  ["NAVAL", "NAVAL", "VET", "Poblacion", "Naval", "Biliran", 6560],
  ["NOVALI", "NOVALICHES", "NCT1", "Novaliches", "Quezon City", "Metro Manila", 1123],
  ["OLONGA", "OLONGAPO", "CLT1", "East Tapinac", "Olongapo City", "Zambales", 2200],
  ["ORMOC", "ORMOC", "VET", "Poblacion", "Ormoc City", "Leyte", 6541],
  ["PALAWA", "PUERTO PRINCESA", "MMRPT", "San Pedro", "Puerto Princesa City", "Palawan", 5300],
  ["PALOMP", "PALOMPON", "VET", "Poblacion", "Palompon", "Leyte", 6538],
  ["PANIQU", "PANIQUI", "CLT2", "Poblacion", "Paniqui", "Tarlac", 2307],
  ["PINAPA", "PINAMALAYAN, PAPANDAYAN", "MMRPT", "Papandayan", "Pinamalayan", "Oriental Mindoro", 5208],
  ["POLANG", "POLANGUI", "BT", "Poblacion", "Polangui", "Albay", 4506],
  ["PONTEV", "PONTEVEDRA", "VWT1", "Poblacion", "Pontevedra", "Negros Occidental", 6105],
  ["PUERTO", "PUERTO PRINCESA- BALTAN", "MMRPT", "Bancao-Bancao", "Puerto Princesa City", "Palawan", 5300],
  ["QUEZAV", "QUEZON  AVE.", "NCT1", "Paligsahan", "Quezon City", "Metro Manila", 1103],
  ["ROMBLO", "ROMBLON", "CLBZT", "Poblacion", "Romblon", "Romblon", 5500],
  ["ROOSEV", "ROOSEVELT", "NCT1", "San Antonio", "Quezon City", "Metro Manila", 1105],
  ["ROXMIN", "ROXAS, OR. MINDORO", "MMRPT", "Poblacion", "Roxas", "Oriental Mindoro", 5203],
  ["SAMPAL", "SAMPALOC", "NCT1", "Sampaloc", "Manila", "Metro Manila", 1008],
  ["SANCAR", "SAN CARLOS, PANGASINAN", "CLT2", "Poblacion", "San Carlos City", "Pangasinan", 2420],
  ["SANJOS", "SAN JOSE OCCIDENTAL", "MMRPT", "Poblacion", "San Jose", "Occidental Mindoro", 5100],
  ["SANMIG", "SAN MIGUEL", "CLT1", "Poblacion", "San Miguel", "Bulacan", 3011],
  ["SCOUTC", "SCOUT CHUATOCO", "NCT1", "Roxas", "Quezon City", "Metro Manila", 1103],
  ["SIPALA", "SIPALAY", "VWT1", "Poblacion", "Sipalay City", "Negros Occidental", 6113],
  ["SOGOD", "SOGOD", "VET", "Poblacion", "Sogod", "Southern Leyte", 6606],
  ["SORSOG", "SORSOGON", "BT", "Poblacion", "Sorsogon City", "Sorsogon", 4700],
  ["STACRU", "STA. CRUZ, LAGUNA", "MMRPT", "Poblacion", "Sta. Cruz", "Laguna", 4009],
  ["STAMAR", "STA. MARIA BULACAN", "CLT1", "Poblacion", "Sta. Maria", "Bulacan", 3022],
  ["STOMAS", "STO. TOMAS PAMPANGA", "CLT1", "Poblacion", "Sto. Tomas", "Pampanga", 2020],
  ["SUBIC", "SUBIC", "CLT1", "Poblacion", "Subic", "Zambales", 2209],
  ["TACLOB", "TACLOBAN MEGA", "VET", "Marasbaras", "Tacloban City", "Leyte", 6500],
  ["TACLOS", "TACLOBAN LARGE", "VET", "Sagkahan", "Tacloban City", "Leyte", 6500],
  ["TAGBIL", "TAGBILARAN", "VCT", "Cogon", "Tagbilaran City", "Bohol", 6300],
  ["TAGBIM", "TAGBILARAN MEGA", "VCT", "Dao", "Tagbilaran City", "Bohol", 6300],
  ["TAGKAW", "TAGKAWAYAN", "CLBZT", "Poblacion", "Tagkawayan", "Quezon", 4321],
  ["TALIBO", "TALIBON", "VCT", "Poblacion", "Talibon", "Bohol", 6325],
  ["TALISA", "TALISAY", "VCT", "Poblacion", "Talisay City", "Cebu", 6045],
  ["TANAY", "TANAY", "NCT1", "Poblacion", "Tanay", "Rizal", 1980],
  ["TARLAC", "TARLAC", "CLT2", "San Nicolas", "Tarlac City", "Tarlac", 2300],
  ["TAYABA", "TAYABAS", "CLBZT", "Poblacion", "Tayabas City", "Quezon", 4327],
  ["TOLEDO", "TOLEDO", "VCT", "Poblacion", "Toledo City", "Cebu", 6038],
  ["TUBIGO", "TUBIGON", "VCT", "Poblacion", "Tubigon", "Bohol", 6329],
  ["TUGUEG", "TUGUEGARAO", "CVT", "Centro", "Tuguegarao City", "Cagayan", 3500],
  ["URDANE", "URDANETA", "CLT2", "Poblacion", "Urdaneta City", "Pangasinan", 2428],
  ["VALENZ", "VALENZUELA", "NCT1", "Malinta", "Valenzuela City", "Metro Manila", 1440],
  ["VICTOR", "VICTORIA", "MMRPT", "Poblacion", "Victoria", "Oriental Mindoro", 5205],
];

/**
 * The franchised chapels — `[…ChapelRow, isSystemCapable]`.
 *
 * WHERE THESE COME FROM, because none of them is in the chapel reference list.
 * The `RefMortuary` drop has two classes of row, and its FR rows point at chapel
 * codes the owned list does not carry: ROSARI, TAGUIG, SANPED, GENSAN, TACURO,
 * LUPON, CAGAYA, MALAYB, GINGOO. A franchised funeral home has to operate out of
 * somewhere, the owned list is explicitly the not-franchise one, and these codes
 * are what is left — so they are the franchise network, and each row below
 * exists because a mortuary names it.
 *
 * WHAT IS GIVEN AND WHAT IS DERIVED. The codes are the source's. The names and
 * addresses are read off the mortuaries that name them — "SAN GUILLERMO FUNERAL
 * PARLOR - CDO" against CAGAYA, "VILLANUEVA FUNERAL HOMES - MALAYBALAY" against
 * MALAYB — which is why every one of them lands on a real Philippine city rather
 * than a guess.
 *
 * THE TERRITORY IS THE ONE JUDGEMENT CALL. Mortuary codes carry a territory
 * prefix (MC / MD / MET are Mindanao, CLBZ is Calabarzon, GMW is Greater Manila
 * West) and most of them map straight onto a territory that exists. GMW does
 * NOT: there is no Greater Manila West in the territory table. TAGUIG and SANPED
 * are put under GME, which is the nearest thing to it and was itself carrying no
 * chapels at all. If a GMWT territory turns up, those two rows move and nothing
 * else does.
 *
 * `isSystemCapable` is the flag with no source column behind it — see
 * `ChapelBranchRecord.isSystemCapable`. Four of the nine are marked false, which
 * is the point of having them: those are the franchises whose plan holders a
 * processor has to key in by hand.
 */
const FRANCHISE_CHAPELS: [...ChapelRow, boolean][] = [
  ["ROSARI", "ROSARIO", "CLBZT", "Poblacion", "Rosario", "Batangas", 4225, true],
  ["TAGUIG", "TAGUIG", "GME", "Ususan", "Taguig City", "Metro Manila", 1630, true],
  ["SANPED", "SAN PEDRO", "GME", "Poblacion", "San Pedro City", "Laguna", 4023, false],
  ["GENSAN", "GENERAL SANTOS", "MCET", "Lagao", "General Santos City", "South Cotabato", 9500, true],
  ["TACURO", "TACURONG", "MCET", "Poblacion", "Tacurong City", "Sultan Kudarat", 9800, false],
  ["LUPON", "LUPON", "MCET", "Poblacion", "Lupon", "Davao Oriental", 8207, false],
  ["CAGAYA", "CAGAYAN DE ORO", "MCET", "Carmen", "Cagayan de Oro City", "Misamis Oriental", 9000, true],
  ["MALAYB", "MALAYBALAY", "MCET", "Poblacion", "Malaybalay City", "Bukidnon", 8700, false],
  ["GINGOO", "GINGOOG", "MCET", "Poblacion", "Gingoog City", "Misamis Oriental", 9014, true],
];

/** Streets a chapel stands on, cycled by index — every town has one of these. */
const CHAPEL_STREET = ["Rizal St.", "Bonifacio St.", "Mabini St.", "Quezon Ave.", "Magsaysay Ave.", "Del Pilar St.", "Burgos St.", "National Highway"];

// Deliberately different pools from the bulk claims' — the people who RUN the
// chapels should not read as the same cast as the people being buried by them.
// Lengths are mutually prime with 132 so the three parts do not fall into step.
const STAFF_FIRST = ["Alfonso", "Belinda", "Cesar", "Dolores", "Eduardo", "Fe", "Gerardo", "Herminia", "Isagani", "Josefa", "Leonardo", "Marissa", "Norberto", "Olivia", "Prospero", "Rosalinda", "Teodoro"];
const STAFF_MIDDLE = ["Abad", "Bituin", "Custodio", "Dimayuga", "Espino", "Fajardo", "Guzman", "Hidalgo", "Ilagan", "Javier"];
const STAFF_LAST = ["Bagtas", "Caluag", "Dizon", "Eusebio", "Fortich", "Gabriel", "Hernandez", "Isidro", "Jacinto", "Kalaw", "Lagman", "Montano", "Nepomuceno"];

const pad = (n: number, width: number) => String(n).padStart(width, "0");

/**
 * One member of chapel/territory staff. `seed` drives every varying field, so
 * the same person comes back on every reload.
 */
function buildStaffPerson(
  personId: string,
  seed: number,
  placeOfBirth: string,
): PersonRecord {
  const female = seed % 2 === 0;
  return {
    personId,
    lastName: STAFF_LAST[seed % STAFF_LAST.length],
    firstName: STAFF_FIRST[seed % STAFF_FIRST.length],
    middleName: STAFF_MIDDLE[seed % STAFF_MIDDLE.length],
    dateOfBirth: `19${60 + (seed % 20)}-${pad((seed % 12) + 1, 2)}-${pad((seed % 28) + 1, 2)}`,
    placeOfBirth,
    genderAtBirth: female ? "Female" : "Male",
    preferredGender: female ? "Female" : "Male",
    civilStatus: seed % 3 === 0 ? "Married" : seed % 3 === 1 ? "Widowed" : "Single",
    height: String(155 + (seed % 22)),
    weight: String(52 + (seed % 28)),
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
    addresses: [],
  };
}

/** The territory heads — one person per territory, `Territory.TerritoryHead`. */
const territoryPersons: PersonRecord[] = TERRITORIES.map(([, description], i) =>
  // Named after the territory they head rather than a city, since a territory
  // is a region and not a place anyone is born in.
  buildStaffPerson(`P-2${pad(i + 1, 2)}`, i * 5 + 3, description),
);

export const territorySeed: TerritoryRecord[] = TERRITORIES.map(
  ([territoryCode, description], i) => ({
    territoryCode,
    description,
    territoryHead: `P-2${pad(i + 1, 2)}`,
    isActive: true,
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
  }),
);

/**
 * A chapel and everything it owns: its address, its contact number and the
 * person managing it. Built together because the chapel row is only three
 * foreign keys and a name — the rest of what the UI shows lives in these.
 */
function buildChapel(
  [chapelCode, chapelDesc, territoryCode, barangay, city, province, zipCode]: ChapelRow,
  index: number,
  franchise?: { isSystemCapable: boolean },
) {
  const seq = index + 1;
  const addressId = 2000 + seq;
  const contactId = `CT-2${pad(seq, 3)}`;
  const chapelMngr = `P-3${pad(seq, 3)}`;

  const chapel: ChapelBranchRecord = {
    chapelCode,
    chapelDesc,
    addressId,
    chapelMngr,
    contactId,
    territoryCode,
    isFranchise: franchise !== undefined,
    // Only ever written on a franchise. An owned chapel is on the system by
    // definition, and a column that says so on all 132 of them says nothing.
    ...(franchise && !franchise.isSystemCapable
      ? { isSystemCapable: false }
      : {}),
    isActive: true,
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
  };

  // No `personId`: this address belongs to the chapel, and is reached through
  // `ChapelBranch.addressId` rather than through anybody's person record.
  const address: AddressRecord = {
    addressId,
    addressType: "Chapel",
    addressNo: String(10 + (seq % 90)),
    street: CHAPEL_STREET[seq % CHAPEL_STREET.length],
    barangay,
    city,
    province,
    zipCode,
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
  };

  // Held against the manager, who is the person the number reaches — the source
  // `ContactInfo` row is owned by a person, never by a place.
  const contact: ContactInfoRecord = {
    contactId,
    personId: chapelMngr,
    contactType: "mobile",
    contactDetails: `09${17 + (seq % 5)} ${pad(200 + (seq % 700), 3)} ${pad((seq * 37) % 10000, 4)}`,
    isActive: true,
    auditUser: AUDIT.user,
    auditDate: AUDIT.date,
  };

  return {
    chapel,
    address,
    contact,
    manager: buildStaffPerson(chapelMngr, seq, city),
  };
}

// The franchises are numbered on from the owned ones rather than in a range of
// their own, so a chapel's manager, address and contact ids stay one unbroken
// run — the ids mean nothing beyond being unique, and two schemes would only
// invite someone to read something into which range a chapel fell in.
const chapels = [
  ...CHAPELS.map((row, i) => buildChapel(row, i)),
  ...FRANCHISE_CHAPELS.map(
    ([code, desc, territory, barangay, city, province, zip, isSystemCapable], i) =>
      buildChapel(
        [code, desc, territory, barangay, city, province, zip],
        CHAPELS.length + i,
        { isSystemCapable },
      ),
  ),
];

export const chapelBranchSeed: ChapelBranchRecord[] = chapels.map((c) => c.chapel);
const chapelPersons = chapels.map((c) => c.manager);
const chapelAddresses = chapels.map((c) => c.address);
const chapelContacts = chapels.map((c) => c.contact);

/* ================================ Person ================================ */

export const personSeed: PersonRecord[] = [
  { personId: "P-001", lastName: "Santos", firstName: "Maria", middleName: "Reyes", dateOfBirth: "1968-03-12", placeOfBirth: "Manila", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "158", weight: "55", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [1] },
  { personId: "P-002", lastName: "Reyes", firstName: "Pedro", middleName: "Lim", suffix: "Jr.", dateOfBirth: "1955-08-20", placeOfBirth: "Cebu City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Widowed", height: "170", weight: "72", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [2] },
  { personId: "P-003", lastName: "Dela Cruz", firstName: "Juan", middleName: "Santos", dateOfBirth: "1979-11-05", placeOfBirth: "Binondo, Manila", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "168", weight: "68", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [3] },
  { personId: "P-004", lastName: "Aquino", firstName: "Ramon", middleName: "Villanueva", suffix: "Sr.", dateOfBirth: "1949-06-30", placeOfBirth: "Batangas City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "172", weight: "75", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [4] },
  { personId: "P-005", lastName: "Santos", firstName: "Maria", middleName: "Reyes", dateOfBirth: "1990-07-22", placeOfBirth: "Davao City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Single", height: "162", weight: "58", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [5] },
  { personId: "P-006", lastName: "Del Rosario", firstName: "Gregorio", middleName: "Ramos", dateOfBirth: "1962-04-18", placeOfBirth: "Iloilo City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "169", weight: "70", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [6] },
  { personId: "P-007", lastName: "Ocampo", firstName: "Teresita", middleName: "Bautista", dateOfBirth: "1958-12-01", placeOfBirth: "San Fernando, Pampanga", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "156", weight: "60", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [7] },
  { personId: "P-008", lastName: "Salazar", firstName: "Bienvenido", middleName: "Cruz", dateOfBirth: "1975-05-09", placeOfBirth: "Malate, Manila", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "175", weight: "80", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [8] },
  { personId: "P-009", lastName: "Reyes", firstName: "Josefina", middleName: "Domingo", dateOfBirth: "1983-09-14", placeOfBirth: "Baguio City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Separated", height: "160", weight: "57", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [9] },
  { personId: "P-010", lastName: "Villar", firstName: "Lourdes", middleName: "Mercado", dateOfBirth: "1971-02-27", placeOfBirth: "Naga City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "159", weight: "62", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [10] },
  { personId: "P-011", lastName: "Panganiban", firstName: "Alfredo", middleName: "Gutierrez", dateOfBirth: "1953-10-11", placeOfBirth: "Lucena City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Widowed", height: "167", weight: "69", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [11] },
  { personId: "P-012", lastName: "Aguilar", firstName: "Remedios", middleName: "Castro", dateOfBirth: "1946-01-25", placeOfBirth: "Vigan, Ilocos Sur", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "154", weight: "53", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [12] },
  { personId: "P-013", lastName: "Ramirez", firstName: "Manuel", middleName: "Torres", dateOfBirth: "1988-06-17", placeOfBirth: "Cagayan de Oro", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Single", height: "173", weight: "74", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [13] },
  { personId: "P-014", lastName: "Bautista", firstName: "Rodolfo", middleName: "Mendoza", dateOfBirth: "1966-03-03", placeOfBirth: "Angeles City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "171", weight: "73", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [14] },
  { personId: "P-015", lastName: "Navarro", firstName: "Andres", middleName: "Flores", dateOfBirth: "1995-08-08", placeOfBirth: "Tacloban City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Single", height: "176", weight: "66", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [15] },
  // Claimants / beneficiaries who are not plan holders themselves — these are
  // the people who file (and are paid on) a claim. No address rows of their own.
  { personId: "P-016", lastName: "Santos", firstName: "Rogelio", middleName: "Cruz", dateOfBirth: "1965-01-19", placeOfBirth: "Quezon City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "170", weight: "71", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [16] },
  { personId: "P-017", lastName: "Dela Cruz", firstName: "Anabelle", middleName: "Reyes", dateOfBirth: "1982-04-07", placeOfBirth: "Manila", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "161", weight: "56", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [17] },
  { personId: "P-018", lastName: "Reyes", firstName: "Marisol", middleName: "Lim", dateOfBirth: "1985-06-12", placeOfBirth: "Cebu City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "160", weight: "58", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-019", lastName: "Aquino", firstName: "Cristina", middleName: "Villanueva", dateOfBirth: "1978-02-20", placeOfBirth: "Batangas City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "159", weight: "60", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-020", lastName: "Del Rosario", firstName: "Elena", middleName: "Ramos", dateOfBirth: "1965-09-03", placeOfBirth: "Iloilo City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "157", weight: "62", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-021", lastName: "Ocampo", firstName: "Ferdinand", middleName: "Bautista", dateOfBirth: "1984-11-11", placeOfBirth: "San Fernando, Pampanga", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "172", weight: "74", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-022", lastName: "Salazar", firstName: "Corazon", middleName: "Cruz", dateOfBirth: "1978-07-25", placeOfBirth: "Manila", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "162", weight: "59", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-023", lastName: "Villar", firstName: "Antonio", middleName: "Mercado", dateOfBirth: "1969-03-30", placeOfBirth: "Naga City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Widowed", height: "173", weight: "76", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-024", lastName: "Panganiban", firstName: "Grace", middleName: "Gutierrez", dateOfBirth: "1980-05-19", placeOfBirth: "Lucena City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "158", weight: "57", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-025", lastName: "Aguilar", firstName: "Ricardo", middleName: "Castro", dateOfBirth: "1972-08-08", placeOfBirth: "Vigan, Ilocos Sur", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "171", weight: "73", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-026", lastName: "Bautista", firstName: "Lydia", middleName: "Mendoza", dateOfBirth: "1968-12-01", placeOfBirth: "Angeles City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "160", weight: "61", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-027", lastName: "Santos", firstName: "Herminia", middleName: "Reyes", dateOfBirth: "1962-04-14", placeOfBirth: "Davao City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "156", weight: "58", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-028", lastName: "Reyes", firstName: "Paolo", middleName: "Domingo", dateOfBirth: "2005-01-22", placeOfBirth: "Baguio City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Single", height: "174", weight: "65", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-029", lastName: "Ramirez", firstName: "Lucia", middleName: "Torres", dateOfBirth: "1960-10-05", placeOfBirth: "Cagayan de Oro", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "155", weight: "56", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-030", lastName: "Navarro", firstName: "Efren", middleName: "Flores", dateOfBirth: "1968-06-17", placeOfBirth: "Tacloban City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "170", weight: "72", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  // Deceased plan holders whose death claims have been verified and endorsed to
  // the supervisor (status "For Approval"). New persons — the plan holders above
  // each already have a pending claim, and a person can only die once.
  { personId: "P-031", lastName: "Robles", firstName: "Fernando", middleName: "Aguilar", dateOfBirth: "1959-04-10", placeOfBirth: "Quezon City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "169", weight: "71", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [18] },
  { personId: "P-032", lastName: "Ventura", firstName: "Lucila", middleName: "Ramos", dateOfBirth: "1963-07-19", placeOfBirth: "Cebu City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "157", weight: "59", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [19] },
  { personId: "P-033", lastName: "Aguilar", firstName: "Ernesto", middleName: "Bautista", dateOfBirth: "1957-11-02", placeOfBirth: "Manila", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "172", weight: "77", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [20] },
  { personId: "P-034", lastName: "Mercado", firstName: "Corazon", middleName: "Flores", dateOfBirth: "1961-02-14", placeOfBirth: "Davao City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "158", weight: "60", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [21] },
  { personId: "P-035", lastName: "Lim", firstName: "Rodrigo", middleName: "Castro", dateOfBirth: "1954-09-25", placeOfBirth: "Iloilo City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Widowed", height: "170", weight: "70", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [22] },
  // Beneficiaries declared on the five plans above. The plan holders P-031..P-035
  // are deceased, so their beneficiaries are new persons — everyone else's
  // beneficiary is already in the P-016..P-030 block. No address rows of their own.
  { personId: "P-036", lastName: "Robles", firstName: "Amparo", middleName: "Sison", dateOfBirth: "1961-08-03", placeOfBirth: "Quezon City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "158", weight: "57", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-037", lastName: "Ventura", firstName: "Danilo", middleName: "Ramos", dateOfBirth: "1989-01-17", placeOfBirth: "Cebu City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "173", weight: "75", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-038", lastName: "Aguilar", firstName: "Nenita", middleName: "Bautista", dateOfBirth: "1959-05-28", placeOfBirth: "Manila", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "156", weight: "58", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-039", lastName: "Mercado", firstName: "Alberto", middleName: "Flores", dateOfBirth: "1958-10-09", placeOfBirth: "Davao City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Widowed", height: "171", weight: "74", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-040", lastName: "Lim", firstName: "Sheila", middleName: "Castro", dateOfBirth: "1987-03-21", placeOfBirth: "Iloilo City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "160", weight: "59", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  // ── The showcase record — see "A plan holder worth opening" below. ──
  // Corazon and her family. She is the one plan holder in this seed who has
  // EVERYTHING at once: three plans, four beneficiaries, nine claims across
  // every phase, and a folder of documents. P-042..P-045 are her survivors.
  { personId: "P-041", lastName: "Almeda", firstName: "Corazon", middleName: "Villaflor", dateOfBirth: "1966-09-14", placeOfBirth: "Quezon City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Married", height: "158", weight: "61", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [23, 24] },
  { personId: "P-042", lastName: "Almeda", firstName: "Rodolfo", middleName: "Santiago", dateOfBirth: "1963-02-08", placeOfBirth: "Manila", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Married", height: "172", weight: "78", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [25] },
  { personId: "P-043", lastName: "Almeda", firstName: "Katrina", middleName: "Villaflor", dateOfBirth: "1992-11-30", placeOfBirth: "Quezon City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Single", height: "161", weight: "55", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-044", lastName: "Almeda", firstName: "Miguel", middleName: "Villaflor", dateOfBirth: "1996-04-25", placeOfBirth: "Quezon City", genderAtBirth: "Male", preferredGender: "Male", civilStatus: "Single", height: "175", weight: "70", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  { personId: "P-045", lastName: "Villaflor", firstName: "Purificacion", middleName: "Reyes", dateOfBirth: "1941-06-02", placeOfBirth: "Tarlac City", genderAtBirth: "Female", preferredGender: "Female", civilStatus: "Widowed", height: "152", weight: "50", auditUser: AUDIT.user, auditDate: AUDIT.date, addresses: [] },
  // The deceased behind the bulk claims — see "Bulk claim volume" above.
  ...bulkPersons,
  // The holders of the assigned plans — alive, and not the ones being buried.
  ...assignedPersons,
  // The people who run the network: a head per territory, a manager per chapel.
  ...territoryPersons,
  ...chapelPersons,
];

/* ================================ Address ================================ */

export const addressSeed: AddressRecord[] = [
  { addressId: 1, personId: "P-001", addressType: "Home", addressNo: "12", street: "Sampaguita St.", barangay: "Malaya", city: "Quezon City", province: "Metro Manila", zipCode: 1101, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 2, personId: "P-002", addressType: "Home", addressNo: "8", street: "Mabini Ave.", barangay: "Lahug", city: "Cebu City", province: "Cebu", zipCode: 6000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 3, personId: "P-003", addressType: "Home", addressNo: "27", street: "Ongpin St.", barangay: "Binondo", city: "Manila", province: "Metro Manila", zipCode: 1006, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 4, personId: "P-004", addressType: "Home", addressNo: "5", street: "Rizal St.", barangay: "Poblacion", city: "Batangas City", province: "Batangas", zipCode: 4200, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 5, personId: "P-005", addressType: "Home", addressNo: "44", street: "Bonifacio St.", barangay: "Buhangin", city: "Davao City", province: "Davao del Sur", zipCode: 8000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 6, personId: "P-006", addressType: "Home", addressNo: "19", street: "Luna St.", barangay: "Molo", city: "Iloilo City", province: "Iloilo", zipCode: 5000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 7, personId: "P-007", addressType: "Home", addressNo: "3", street: "Del Pilar St.", barangay: "Sto. Rosario", city: "San Fernando", province: "Pampanga", zipCode: 2000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 8, personId: "P-008", addressType: "Home", addressNo: "101", street: "Roxas Blvd.", barangay: "Malate", city: "Manila", province: "Metro Manila", zipCode: 1004, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 9, personId: "P-009", addressType: "Home", addressNo: "22", street: "Session Rd.", barangay: "Burnham", city: "Baguio City", province: "Benguet", zipCode: 2600, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 10, personId: "P-010", addressType: "Home", addressNo: "7", street: "Peñafrancia Ave.", barangay: "Sta. Cruz", city: "Naga City", province: "Camarines Sur", zipCode: 4400, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 11, personId: "P-011", addressType: "Home", addressNo: "14", street: "Quezon Ave.", barangay: "Ibabang Iyam", city: "Lucena City", province: "Quezon", zipCode: 4301, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 12, personId: "P-012", addressType: "Home", addressNo: "9", street: "Crisologo St.", barangay: "I", city: "Vigan", province: "Ilocos Sur", zipCode: 2700, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 13, personId: "P-013", addressType: "Home", addressNo: "31", street: "Corrales Ave.", barangay: "Carmen", city: "Cagayan de Oro", province: "Misamis Oriental", zipCode: 9000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 14, personId: "P-014", addressType: "Home", addressNo: "6", street: "MacArthur Hwy.", barangay: "Balibago", city: "Angeles City", province: "Pampanga", zipCode: 2009, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 15, personId: "P-015", addressType: "Home", addressNo: "18", street: "Real St.", barangay: "12", city: "Tacloban City", province: "Leyte", zipCode: 6500, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 16, personId: "P-016", addressType: "Home", addressNo: "12", street: "Sampaguita St.", barangay: "Malaya", city: "Quezon City", province: "Metro Manila", zipCode: 1101, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 17, personId: "P-017", addressType: "Home", addressNo: "27", street: "Ongpin St.", barangay: "Binondo", city: "Manila", province: "Metro Manila", zipCode: 1006, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 18, personId: "P-031", addressType: "Home", addressNo: "24", street: "Kalayaan Ave.", barangay: "Diliman", city: "Quezon City", province: "Metro Manila", zipCode: 1101, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 19, personId: "P-032", addressType: "Home", addressNo: "11", street: "Osmeña Blvd.", barangay: "Capitol Site", city: "Cebu City", province: "Cebu", zipCode: 6000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 20, personId: "P-033", addressType: "Home", addressNo: "9", street: "Taft Ave.", barangay: "Ermita", city: "Manila", province: "Metro Manila", zipCode: 1000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 21, personId: "P-034", addressType: "Home", addressNo: "37", street: "Quimpo Blvd.", barangay: "Talomo", city: "Davao City", province: "Davao del Sur", zipCode: 8000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 22, personId: "P-035", addressType: "Home", addressNo: "6", street: "Iznart St.", barangay: "City Proper", city: "Iloilo City", province: "Iloilo", zipCode: 5000, auditUser: AUDIT.user, auditDate: AUDIT.date },
  // The showcase record. The only person in the seed with an OFFICE address as
  // well as a home one — the profile header keeps a slot for it, and until now
  // nothing filled it.
  { addressId: 23, personId: "P-041", addressType: "Home", addressNo: "88", street: "Kalayaan Ave.", barangay: "Central", city: "Quezon City", province: "Metro Manila", zipCode: 1100, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 24, personId: "P-041", addressType: "Office", addressNo: "21F One Corporate Center", street: "Julia Vargas Ave.", barangay: "San Antonio", city: "Pasig City", province: "Metro Manila", zipCode: 1605, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { addressId: 25, personId: "P-042", addressType: "Home", addressNo: "88", street: "Kalayaan Ave.", barangay: "Central", city: "Quezon City", province: "Metro Manila", zipCode: 1100, auditUser: AUDIT.user, auditDate: AUDIT.date },
  // Where each chapel stands. Numbered from 2001 so the block stays clear of
  // the hand-written rows above, and owned by no one — see `buildChapel`.
  ...chapelAddresses,
];

/* ============================== ContactInfo ============================== */

export const contactSeed: ContactInfoRecord[] = [
  { contactId: "CT-0001", personId: "P-001", contactType: "mobile", contactDetails: "0917 812 4455", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0002", personId: "P-001", contactType: "email", contactDetails: "maria.santos@gmail.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0003", personId: "P-002", contactType: "mobile", contactDetails: "0918 233 7788", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0004", personId: "P-002", contactType: "phone", contactDetails: "(032) 253 1144", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0005", personId: "P-003", contactType: "mobile", contactDetails: "0919 444 1212", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0006", personId: "P-003", contactType: "email", contactDetails: "juan.delacruz@yahoo.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0007", personId: "P-004", contactType: "mobile", contactDetails: "0920 556 3344", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0008", personId: "P-005", contactType: "mobile", contactDetails: "0921 667 9900", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0009", personId: "P-005", contactType: "email", contactDetails: "maria.santos05@gmail.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0010", personId: "P-006", contactType: "mobile", contactDetails: "0917 990 2211", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0011", personId: "P-007", contactType: "mobile", contactDetails: "0918 334 5566", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0012", personId: "P-007", contactType: "phone", contactDetails: "(045) 961 2233", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0013", personId: "P-008", contactType: "mobile", contactDetails: "0919 223 8877", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0014", personId: "P-009", contactType: "mobile", contactDetails: "0920 118 4433", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0015", personId: "P-010", contactType: "mobile", contactDetails: "0921 776 5522", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0016", personId: "P-010", contactType: "email", contactDetails: "lourdes.villar@gmail.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0017", personId: "P-011", contactType: "mobile", contactDetails: "0917 445 6633", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0018", personId: "P-012", contactType: "mobile", contactDetails: "0918 667 1199", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0019", personId: "P-013", contactType: "mobile", contactDetails: "0919 552 3311", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0020", personId: "P-014", contactType: "mobile", contactDetails: "0920 883 7744", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0021", personId: "P-015", contactType: "mobile", contactDetails: "0921 990 6677", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0022", personId: "P-016", contactType: "mobile", contactDetails: "0917 300 1188", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0023", personId: "P-017", contactType: "mobile", contactDetails: "0918 411 2299", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0024", personId: "P-031", contactType: "mobile", contactDetails: "0917 221 3355", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0025", personId: "P-032", contactType: "mobile", contactDetails: "0918 552 6677", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0026", personId: "P-033", contactType: "mobile", contactDetails: "0919 883 9911", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0027", personId: "P-034", contactType: "mobile", contactDetails: "0920 114 2266", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0028", personId: "P-035", contactType: "mobile", contactDetails: "0921 447 5588", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  // The showcase record — all three channels, so the header's contact block is
  // filled rather than half empty.
  { contactId: "CT-0029", personId: "P-041", contactType: "mobile", contactDetails: "0917 555 0141", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0030", personId: "P-041", contactType: "phone", contactDetails: "(02) 8721 4455", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0031", personId: "P-041", contactType: "email", contactDetails: "corazon.almeda@gmail.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0032", personId: "P-042", contactType: "mobile", contactDetails: "0918 555 0142", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  { contactId: "CT-0033", personId: "P-042", contactType: "email", contactDetails: "rodolfo.almeda@gmail.com", isActive: true, auditUser: AUDIT.user, auditDate: AUDIT.date },
  // One number per chapel, held against its manager.
  ...chapelContacts,
];

/* ============================== Planholder ============================== */

// ACCOUNT AND TERMINATION STATUS, and why most of these read `FP` / `NT`.
//
// A plan may only be serviced and terminated once its account is fully paid and
// its termination status is neither FR nor RP — the service-payable rule, which
// `Planholder.canBeServiced` enforces. Nearly every plan holder here is
// deceased, and by the time a chapel's payable is raised the death benefit has
// closed their account out: `FP`, ledger paid in full, nothing terminated yet.
//
// The exceptions are the interesting rows, and each is one on purpose:
//
//   LP  the account lapsed and never reached fully paid — the plan is not ready
//       to be serviced at all. These are the same rows that lapsed before, so
//       every story told in the comments below still holds.
//   FR  fully paid ROP, and RP return of premium — the plan was handed back.
//       Not serviceable either, and this is the ROP DISCREPANCY the branch has
//       to answer for. L20000234A and L18000890G carry them.
//   DC  denied claim, on the one plan whose death claim was in fact denied.
//
// `dueDate` is left where it was on the fully-paid rows. A settled account has
// no next due date, but the column is the last one that was billed rather than
// one that is still owed, and blanking it would lose that.
export const planholderSeed: PlanholderRecord[] = [
  { lpaNo: "L21000456B", personId: "P-001", ...paidInFull("B5M10"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2021-05-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L19000567C", personId: "P-002", ...planFigures("A5M", 40), accountClass: "R", acctStatCode: "LP", termiStatCode: "NT", dueDate: "2026-03-15", effectivityDate: "2019-02-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-02-15", ...PH_AUDIT },
  { lpaNo: "L25000123I", personId: "P-003", ...paidInFull("RA5M5"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-10", effectivityDate: "2025-09-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L23000012H", personId: "P-004", ...planFigures("NF5M4", 30), accountClass: "R", acctStatCode: "LP", termiStatCode: "NT", dueDate: "2026-04-20", effectivityDate: "2023-01-20", isServiceOnly: false, riDate: "2024-06-20", lastPaymentDate: "2026-03-20", ...PH_AUDIT },
  { lpaNo: "L26000901M", personId: "P-005", ...paidInFull("C5M8"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2026-02-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  // Returned as premium — fully paid ROP. Not serviceable; the chapel's payable
  // against it is held as an ROP discrepancy.
  { lpaNo: "L20000234A", personId: "P-006", ...paidInFull("RC5M4"), accountClass: "R", acctStatCode: "FP", termiStatCode: "FR", dueDate: "2026-08-05", effectivityDate: "2020-08-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  { lpaNo: "L24000345D", personId: "P-007", ...paidInFull("D5M9"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-15", effectivityDate: "2024-03-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L25000678E", personId: "P-008", ...paidInFull("RF5M8"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-20", effectivityDate: "2025-11-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  { lpaNo: "L22000333L", personId: "P-009", ...planFigures("RD5M5", 38), accountClass: "R", acctStatCode: "LP", termiStatCode: "NT", dueDate: "2026-05-10", effectivityDate: "2022-06-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-04-10", ...PH_AUDIT },
  { lpaNo: "L26000789F", personId: "P-010", ...paidInFull("B5M10"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-05", effectivityDate: "2026-01-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  // The second ROP, this one a straight return of premium.
  { lpaNo: "L18000890G", personId: "P-011", ...paidInFull("LG7M13"), accountClass: "R", acctStatCode: "FP", termiStatCode: "RP", dueDate: "2026-08-01", effectivityDate: "2018-04-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L21000111J", personId: "P-012", ...planFigures("A5M", 45), accountClass: "R", acctStatCode: "LP", termiStatCode: "NT", dueDate: "2026-06-30", effectivityDate: "2021-09-30", isServiceOnly: false, riDate: "2023-01-30", lastPaymentDate: "2026-05-30", ...PH_AUDIT },
  { lpaNo: "L25000444M", personId: "P-013", ...paidInFull("RA5M5"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2025-12-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L20000222K", personId: "P-014", ...paidInFull("RC5M4"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-14", effectivityDate: "2020-02-14", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-14", ...PH_AUDIT },
  { lpaNo: "L26000555N", personId: "P-015", ...paidInFull("F5MDS"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-20", effectivityDate: "2026-03-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  // Plan holders behind the endorsed ("For Approval") death claims below.
  { lpaNo: "L26000601P", personId: "P-031", ...paidInFull("A5M"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2024-05-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L26000602Q", personId: "P-032", ...paidInFull("RC5M4"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-05", effectivityDate: "2023-06-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  { lpaNo: "L26000603R", personId: "P-033", ...paidInFull("B5M10"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-10", effectivityDate: "2022-03-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L26000604S", personId: "P-034", ...paidInFull("D5M9"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-15", effectivityDate: "2023-09-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L26000605T", personId: "P-035", ...paidInFull("RF5M8"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-20", effectivityDate: "2024-11-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  // Second plans — the same person on more than one LPA. A plan holder buying
  // another plan is ordinary, and these are what the "Other Plans" section on
  // the plan holder page lists.
  //
  // NO DEATH CLAIM ON ANY OF THE THREE, which is why they alone are still being
  // collected on: their holders died, but only the plans WITH a claim filed
  // against them have been settled and become serviceable.
  { lpaNo: "L22000777U", personId: "P-001", ...planFigures("A5M", 44), accountClass: "R", acctStatCode: "AC", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2022-07-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L24000888V", personId: "P-004", ...planFigures("C5M8", 26), accountClass: "R", acctStatCode: "AC", termiStatCode: "NT", dueDate: "2026-08-10", effectivityDate: "2024-02-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L26000999W", personId: "P-011", ...planFigures("RA5M5", 7), accountClass: "R", acctStatCode: "LP", termiStatCode: "NT", dueDate: "2026-06-05", effectivityDate: "2025-12-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-05-05", ...PH_AUDIT },
  // ── A plan holder worth opening ──
  //
  // Every other hand-written plan holder demonstrates ONE thing: a lapsed
  // account, a second plan, a contestable date. Opening any of them shows a
  // page that is mostly empty states, which is the wrong thing to look at when
  // the question is how the profile reads when it is full.
  //
  // Corazon Almeda (P-041) is the one that is full. She holds THREE plans; her
  // main plan carries four beneficiaries and six claims spanning all five
  // phases; she died on 06 Jul 2026, so a death claim is open on each plan —
  // pending, endorsed and denied, one apiece. Start at L20000700X.
  { lpaNo: "L20000700X", personId: "P-041", ...paidInFull("RA5M5"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-15", effectivityDate: "2020-06-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L23000701Y", personId: "P-041", ...paidInFull("C5M8"), accountClass: "R", acctStatCode: "FP", termiStatCode: "NT", dueDate: "2026-08-01", effectivityDate: "2023-03-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  // The third plan lapsed and was reinstated once before lapsing again — which
  // is why the death claim filed against it below was denied, and why its
  // termination status is `DC` where her other two read `NT`. Nothing will be
  // serviced against this plan: the account never reached fully paid.
  { lpaNo: "L18000702Z", personId: "P-041", ...planFigures("A5M", 45), accountClass: "R", acctStatCode: "LP", termiStatCode: "DC", dueDate: "2026-02-01", effectivityDate: "2018-11-01", isServiceOnly: false, riDate: "2021-02-01", lastPaymentDate: "2026-01-01", ...PH_AUDIT },
  // ── The hand-written ASSIGNED plan — `SA` ──
  //
  // Rodolfo Almeda (P-042) is alive and holds this plan. It was used to bury
  // somebody else: his mother-in-law Purificacion Villaflor (P-045), who held no
  // plan of her own. That is what `SA` — SERVICED - ASSIGNED — means.
  //
  // THE REST OF THE ASSIGNED PLANS ARE GENERATED, in the `SA` block further
  // down, and this one is kept among them because it is the only one made of
  // people who already exist here: two persons, a relationship on file, and an
  // address behind each. It is the row to open when the question is what an
  // assigned service looks like when everything around it is real.
  //
  // FULLY PAID AND NOT AN ROP, like the generated ones and for the same reason:
  // the only thing unusual about it should be who was buried.
  { lpaNo: "L24000703A", personId: "P-042", ...paidInFull("C5M8"), accountClass: "R", acctStatCode: "FP", termiStatCode: "SA", dueDate: "2026-08-01", effectivityDate: "2024-02-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  // The plans behind the bulk claims — see "Bulk claim volume" above.
  ...bulkPlanholders,
  // The assigned plans — `SA`, one per billing code and then some. See the
  // block that builds them.
  ...assignedPlanholders,
];

/**
 * Who each assigned plan was spent on — LPA to the name on the endorsement.
 *
 * The map `billing-seed` reads when it puts these plans onto billings. Declared
 * down here rather than beside the block that builds them because of the one
 * hand-written entry: Rodolfo's plan names a person who is already in this seed,
 * and `personSeed` has to exist before their name can be read out of it.
 *
 * A NAME AND NOT A PERSON ID, because that is the shape of the column it ends up
 * in — see `IcisBillingProcessedRecord.deceasedName`.
 */
export const assignedDeceasedByLpa: Record<string, string> = {
  // The hand-written one, and the reason it is worth keeping among the
  // generated: two people who already exist here, with a relationship on file.
  // Rodolfo Almeda's plan, used to bury his mother-in-law Purificacion — the
  // same Purificacion who is Corazon's mother on the showcase record.
  L24000703A: (() => {
    const p = personSeed.find((x) => x.personId === "P-045");
    return p ? [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") : "";
  })(),
  ...Object.fromEntries(
    assignedPlans.map((a) => [a.planholder.lpaNo, a.deceasedName]),
  ),
};

/* ============================== Beneficiary ============================== */

// A plan is never sold without a beneficiary, so EVERY row in `planholderSeed`
// has at least one row here. L23000012H carries two — the case the UI has to
// handle when a plan holder declares more than one.
export const beneficiarySeed: BeneficiaryRecord[] = [
  { beneficiaryId: "BF-000001", lpaNo: "L21000456B", personId: "P-016", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000002", lpaNo: "L25000123I", personId: "P-017", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000003", lpaNo: "L23000012H", personId: "P-007", relation: "Sibling", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000004", lpaNo: "L23000012H", personId: "P-019", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000005", lpaNo: "L19000567C", personId: "P-018", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000006", lpaNo: "L26000901M", personId: "P-027", relation: "Parent", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000007", lpaNo: "L20000234A", personId: "P-020", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000008", lpaNo: "L24000345D", personId: "P-021", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000009", lpaNo: "L25000678E", personId: "P-022", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000010", lpaNo: "L22000333L", personId: "P-028", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000011", lpaNo: "L26000789F", personId: "P-023", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000012", lpaNo: "L18000890G", personId: "P-024", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000013", lpaNo: "L21000111J", personId: "P-025", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000014", lpaNo: "L25000444M", personId: "P-029", relation: "Parent", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000015", lpaNo: "L20000222K", personId: "P-026", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000016", lpaNo: "L26000555N", personId: "P-030", relation: "Parent", auditUser: AUDIT.user, auditDate: AUDIT.date },
  // The endorsed ("For Approval") death claims — the plan holders are deceased,
  // so these are the survivors the benefit is released to.
  { beneficiaryId: "BF-000017", lpaNo: "L26000601P", personId: "P-036", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000018", lpaNo: "L26000602Q", personId: "P-037", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000019", lpaNo: "L26000603R", personId: "P-038", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000020", lpaNo: "L26000604S", personId: "P-039", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000021", lpaNo: "L26000605T", personId: "P-040", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  // The second plans. A plan holder normally names the same family on both, so
  // these repeat the beneficiary declared on their first plan.
  { beneficiaryId: "BF-000022", lpaNo: "L22000777U", personId: "P-016", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000023", lpaNo: "L24000888V", personId: "P-019", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000024", lpaNo: "L26000999W", personId: "P-024", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  // The showcase plan (see "A plan holder worth opening"). Four beneficiaries
  // on one plan — a spouse, two children and a surviving parent — which is the
  // case the Beneficiaries section is sized for and nothing else here reaches.
  { beneficiaryId: "BF-000025", lpaNo: "L20000700X", personId: "P-042", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000026", lpaNo: "L20000700X", personId: "P-043", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000027", lpaNo: "L20000700X", personId: "P-044", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date, editUser: "Carla Uy", editDate: "2024-08-12T10:20:00" },
  { beneficiaryId: "BF-000028", lpaNo: "L20000700X", personId: "P-045", relation: "Parent", auditUser: AUDIT.user, auditDate: AUDIT.date },
  // Her other two plans name the immediate family only.
  { beneficiaryId: "BF-000029", lpaNo: "L23000701Y", personId: "P-042", relation: "Spouse", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { beneficiaryId: "BF-000030", lpaNo: "L18000702Z", personId: "P-043", relation: "Child", auditUser: AUDIT.user, auditDate: AUDIT.date },
  // One per bulk plan, so the "every plan has a beneficiary" rule above still
  // holds across the whole seed and not just the hand-written part of it.
  ...bulkBeneficiaries,
];

/* ============================ Claim requests ============================ */
//
// RequestNo = CL + branch code + year + claim code + 6-digit sequence.
// For a death claim the claim code is the benefit (CAB / ECAB / ADB / USB);
// dismemberment uses DM and waiver of installment uses WOI.

export const claimRequestSeed: ClaimRequestRecord[] = [
  // ── Death claims — natural causes, filed 8 days after (nature code RC) ──
  { requestNo: "CLQCITY2026CAB000001", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-04-18T08:00:00", 8), status: "FA", auditUser: PROCESSOR, auditDate: "2026-04-18T08:00:00" },
  { requestNo: "CLCEBU2026CAB000002", requestingBranch: "CEBU", lpaNo: "L19000567C", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-02T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-02T08:00:00" },
  { requestNo: "CLMANILA2026CAB000003", requestingBranch: "MANILA", lpaNo: "L25000123I", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-19T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-19T08:00:00" },
  { requestNo: "CLBATANGAS2026ECAB000004", requestingBranch: "BATANGAS", lpaNo: "L23000012H", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-04T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-04T08:00:00" },
  { requestNo: "CLILOILO2026CAB000005", requestingBranch: "ILOILO", lpaNo: "L20000234A", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-03-28T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-03-28T08:00:00" },
  { requestNo: "CLSANFER2026CAB000006", requestingBranch: "SANFER", lpaNo: "L24000345D", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-04-05T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-04-05T08:00:00" },
  { requestNo: "CLMANILA2026CAB000007", requestingBranch: "MANILA", lpaNo: "L25000678E", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-04-22T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-04-22T08:00:00" },
  { requestNo: "CLNAGA2026CAB000008", requestingBranch: "NAGA", lpaNo: "L26000789F", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-01T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-01T08:00:00" },
  { requestNo: "CLLUCENA2026USB000009", requestingBranch: "LUCENA", lpaNo: "L18000890G", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-08T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-08T08:00:00" },
  { requestNo: "CLVIGAN2026CAB000010", requestingBranch: "VIGAN", lpaNo: "L21000111J", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-11T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-11T08:00:00" },
  { requestNo: "CLANGELES2026CAB000011", requestingBranch: "ANGELES", lpaNo: "L20000222K", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-05-16T08:00:00", 8), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-16T08:00:00" },
  // ── Death claims — accidental, filed within 6 days (nature code SC) ──
  { requestNo: "CLDAVAO2026ADB000012", requestingBranch: "DAVAO", lpaNo: "L26000901M", claimType: "Death Claim", causeOfIncident: "Drowning", incidentDate: daysBefore("2026-05-13T08:00:00", 6), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-13T08:00:00" },
  { requestNo: "CLBAGUIO2026ADB000013", requestingBranch: "BAGUIO", lpaNo: "L22000333L", claimType: "Death Claim", causeOfIncident: "Electrocution", incidentDate: daysBefore("2026-04-27T08:00:00", 6), status: "PE", auditUser: PROCESSOR, auditDate: "2026-04-27T08:00:00" },
  { requestNo: "CLCDO2026ADB000014", requestingBranch: "CDO", lpaNo: "L25000444M", claimType: "Death Claim", causeOfIncident: "Vehicular Accident", incidentDate: daysBefore("2026-05-06T08:00:00", 6), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-06T08:00:00" },
  { requestNo: "CLTACLOBAN2026ADB000015", requestingBranch: "TACLOBAN", lpaNo: "L26000555N", claimType: "Death Claim", causeOfIncident: "Fire", incidentDate: daysBefore("2026-05-20T08:00:00", 6), status: "PE", auditUser: PROCESSOR, auditDate: "2026-05-20T08:00:00" },
  // ── Death claims — verified & endorsed to the supervisor (status FA) ──
  { requestNo: "CLQCITY2026CAB000016", requestingBranch: "QCITY", lpaNo: "L26000601P", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-06-10T08:00:00", 8), status: "FA", auditUser: PROCESSOR, auditDate: "2026-06-10T08:00:00" },
  { requestNo: "CLCEBU2026CAB000017", requestingBranch: "CEBU", lpaNo: "L26000602Q", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-06-18T08:00:00", 8), status: "FA", auditUser: PROCESSOR, auditDate: "2026-06-18T08:00:00" },
  { requestNo: "CLMANILA2026ECAB000018", requestingBranch: "MANILA", lpaNo: "L26000603R", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-06-25T08:00:00", 8), status: "FA", auditUser: PROCESSOR, auditDate: "2026-06-25T08:00:00" },
  { requestNo: "CLDAVAO2026ADB000019", requestingBranch: "DAVAO", lpaNo: "L26000604S", claimType: "Death Claim", causeOfIncident: "Vehicular Accident", incidentDate: daysBefore("2026-07-02T08:00:00", 6), status: "FA", auditUser: PROCESSOR, auditDate: "2026-07-02T08:00:00" },
  { requestNo: "CLILOILO2026CAB000020", requestingBranch: "ILOILO", lpaNo: "L26000605T", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: daysBefore("2026-07-08T08:00:00", 8), status: "FA", auditUser: PROCESSOR, auditDate: "2026-07-08T08:00:00" },

  // ── Non-death claims — round out the plan holders' history ──
  { requestNo: "CLQCITY2025DM000112", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Dismemberment", causeOfIncident: "Loss of Left Hand", incidentDate: "2025-10-24", status: "AP", auditUser: "Benjie Ramos", auditDate: "2025-11-03T09:30:00" },
  { requestNo: "CLQCITY2025WOI000098", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Waiver of Installment", causeOfIncident: "Total Disability", incidentDate: "2025-08-05", status: "FD", auditUser: "Carla Uy", auditDate: "2025-08-21T10:15:00" },
  { requestNo: "CLQCITY2025DM000067", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Dismemberment", causeOfIncident: "Loss of Sight (One Eye)", incidentDate: "2025-04-30", status: "AP", auditUser: "Benjie Ramos", auditDate: "2025-05-12T14:00:00" },
  { requestNo: "CLQCITY2025WOI000041", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Waiver of Installment", causeOfIncident: "Prolonged Illness", incidentDate: "2025-02-10", status: "DN", auditUser: "Diana Lim", auditDate: "2025-02-27T11:45:00" },
  { requestNo: "CLQCITY2024DM000305", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Dismemberment", causeOfIncident: "Loss of Hearing", incidentDate: "2024-11-25", status: "AP", auditUser: "Benjie Ramos", auditDate: "2024-12-09T08:30:00" },
  { requestNo: "CLQCITY2024WOI000254", requestingBranch: "QCITY", lpaNo: "L21000456B", claimType: "Waiver of Installment", causeOfIncident: "Total Disability", incidentDate: "2024-09-02", status: "AP", auditUser: PROCESSOR, auditDate: "2024-09-18T13:20:00" },
  { requestNo: "CLMANILA2026WOI000022", requestingBranch: "MANILA", lpaNo: "L25000123I", claimType: "Waiver of Installment", causeOfIncident: "Total Disability", incidentDate: "2025-12-28", status: "AP", auditUser: "Benjie Ramos", auditDate: "2026-01-14T09:10:00" },
  { requestNo: "CLMANILA2025DM000187", requestingBranch: "MANILA", lpaNo: "L25000123I", claimType: "Dismemberment", causeOfIncident: "Loss of Right Foot", incidentDate: "2025-08-19", status: "AP", auditUser: "Carla Uy", auditDate: "2025-09-02T10:00:00" },
  { requestNo: "CLBATANGAS2025WOI000143", requestingBranch: "BATANGAS", lpaNo: "L23000012H", claimType: "Waiver of Installment", causeOfIncident: "Prolonged Illness", incidentDate: "2025-06-02", status: "DN", auditUser: "Diana Lim", auditDate: "2025-06-20T14:30:00" },
  // ── The showcase plan holder's history (see "A plan holder worth opening") ──
  //
  // Six claims on the main plan, one in each of the five phases the UI colours
  // differently — Approved, Denied, For Denial, For Approval and the Pending
  // death claim a processor would pick up today. Living-benefit claims first,
  // over six years, then the death claim that closes the record.
  { requestNo: "CLQCITY2023DM000401", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Dismemberment", causeOfIncident: "Loss of Left Foot", incidentDate: "2023-05-02", status: "AP", auditUser: "Benjie Ramos", auditDate: "2023-05-20T09:15:00" },
  { requestNo: "CLQCITY2024WOI000402", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Waiver of Installment", causeOfIncident: "Prolonged Illness", incidentDate: "2024-02-11", status: "DN", auditUser: "Diana Lim", auditDate: "2024-03-01T13:40:00" },
  { requestNo: "CLQCITY2024DM000403", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Dismemberment", causeOfIncident: "Loss of Sight (One Eye)", incidentDate: "2024-09-18", status: "AP", auditUser: "Benjie Ramos", auditDate: "2024-10-05T10:30:00" },
  { requestNo: "CLQCITY2025WOI000404", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Waiver of Installment", causeOfIncident: "Total Disability", incidentDate: "2025-06-14", status: "FD", auditUser: "Carla Uy", auditDate: "2025-07-02T14:05:00" },
  { requestNo: "CLQCITY2026DM000405", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Dismemberment", causeOfIncident: "Loss of Hearing", incidentDate: "2026-01-20", status: "FA", auditUser: PROCESSOR, auditDate: "2026-02-06T08:45:00" },
  { requestNo: "CLQCITY2026CAB000406", requestingBranch: "QCITY", lpaNo: "L20000700X", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: "2026-07-06", status: "PE", auditUser: PROCESSOR, auditDate: "2026-07-14T08:00:00" },
  // She held three plans, so her death is claimed on each of them. The same
  // date of death, three different outcomes — which is the point: the third
  // plan had lapsed by then and its claim was denied.
  { requestNo: "CLQCITY2026CAB000407", requestingBranch: "QCITY", lpaNo: "L23000701Y", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: "2026-07-06", status: "FA", auditUser: PROCESSOR, auditDate: "2026-07-15T08:30:00" },
  { requestNo: "CLQCITY2025DM000408", requestingBranch: "QCITY", lpaNo: "L23000701Y", claimType: "Dismemberment", causeOfIncident: "Loss of Right Hand", incidentDate: "2025-03-09", status: "AP", auditUser: "Benjie Ramos", auditDate: "2025-03-27T11:00:00" },
  { requestNo: "CLQCITY2026USB000409", requestingBranch: "QCITY", lpaNo: "L18000702Z", claimType: "Death Claim", causeOfIncident: "Natural Causes", incidentDate: "2026-07-06", status: "DN", auditUser: "Diana Lim", auditDate: "2026-07-16T09:20:00" },
  // Bulk death claims — what gives the queue dashboards their length.
  ...bulkRequests,
];

/* ============================== Claims (DC) ============================== */
//
// ClaimNo = territory + claim code (DC) + 2-digit year + 6-digit sequence.

export const claimsHdrDCSeed: ClaimsHdrDCRecord[] = [
  { claimNo: "NCT1DC26009785", claimRequest: "CLQCITY2026CAB000001", auditUser: PROCESSOR, auditDate: "2026-04-18T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-04-19T09:00:00", benefits: "CAB" },
  { claimNo: "VCTDC26009786", claimRequest: "CLCEBU2026CAB000002", auditUser: PROCESSOR, auditDate: "2026-05-02T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT2DC26009787", claimRequest: "CLMANILA2026CAB000003", auditUser: PROCESSOR, auditDate: "2026-05-19T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "CLBZTDC26009788", claimRequest: "CLBATANGAS2026ECAB000004", auditUser: PROCESSOR, auditDate: "2026-05-04T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ECAB" },
  { claimNo: "VWT1DC26009789", claimRequest: "CLILOILO2026CAB000005", auditUser: PROCESSOR, auditDate: "2026-03-28T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "CLT1DC26009790", claimRequest: "CLSANFER2026CAB000006", auditUser: PROCESSOR, auditDate: "2026-04-05T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT2DC26009791", claimRequest: "CLMANILA2026CAB000007", auditUser: PROCESSOR, auditDate: "2026-04-22T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "BTDC26009792", claimRequest: "CLNAGA2026CAB000008", auditUser: PROCESSOR, auditDate: "2026-05-01T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "CLBZTDC26009793", claimRequest: "CLLUCENA2026USB000009", auditUser: PROCESSOR, auditDate: "2026-05-08T09:00:00", isQuitClaim: false, isVerified: false, benefits: "USB" },
  { claimNo: "CLT2DC26009794", claimRequest: "CLVIGAN2026CAB000010", auditUser: PROCESSOR, auditDate: "2026-05-11T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "CLT1DC26009795", claimRequest: "CLANGELES2026CAB000011", auditUser: PROCESSOR, auditDate: "2026-05-16T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "MCETDC26009796", claimRequest: "CLDAVAO2026ADB000012", auditUser: PROCESSOR, auditDate: "2026-05-13T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "CLT2DC26009797", claimRequest: "CLBAGUIO2026ADB000013", auditUser: PROCESSOR, auditDate: "2026-04-27T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "MCETDC26009798", claimRequest: "CLCDO2026ADB000014", auditUser: PROCESSOR, auditDate: "2026-05-06T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "VETDC26009799", claimRequest: "CLTACLOBAN2026ADB000015", auditUser: PROCESSOR, auditDate: "2026-05-20T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  // Verified & endorsed to the supervisor — awaiting approval (status FA on the request).
  { claimNo: "NCT1DC26009800", claimRequest: "CLQCITY2026CAB000016", auditUser: PROCESSOR, auditDate: "2026-06-10T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-11T09:00:00", benefits: "CAB" },
  { claimNo: "VCTDC26009801", claimRequest: "CLCEBU2026CAB000017", auditUser: PROCESSOR, auditDate: "2026-06-18T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-19T09:00:00", benefits: "CAB" },
  { claimNo: "NCT2DC26009802", claimRequest: "CLMANILA2026ECAB000018", auditUser: PROCESSOR, auditDate: "2026-06-25T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-26T09:00:00", benefits: "ECAB" },
  { claimNo: "MCETDC26009803", claimRequest: "CLDAVAO2026ADB000019", auditUser: PROCESSOR, auditDate: "2026-07-02T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-03T09:00:00", benefits: "ADB" },
  { claimNo: "VWT1DC26009804", claimRequest: "CLILOILO2026CAB000020", auditUser: PROCESSOR, auditDate: "2026-07-08T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-09T09:00:00", benefits: "CAB" },
  // The showcase plan holder's three death claims. The pending one carries a
  // header too — not because a processor has opened it, but because that is
  // what joins the request to its payee (see `payeeRecordsForRequest`); it is
  // unverified, and the UI shows the reference until a claim no is issued.
  { claimNo: "NCT1DC26009810", claimRequest: "CLQCITY2026CAB000406", auditUser: PROCESSOR, auditDate: "2026-07-14T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT1DC26009811", claimRequest: "CLQCITY2026CAB000407", auditUser: PROCESSOR, auditDate: "2026-07-15T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-16T10:15:00", benefits: "CAB" },
  { claimNo: "NCT1DC26009812", claimRequest: "CLQCITY2026USB000409", auditUser: "Diana Lim", auditDate: "2026-07-16T09:30:00", isQuitClaim: false, isVerified: true, verifiedBy: "Diana Lim", verifiedDate: "2026-07-17T08:40:00", benefits: "USB" },
  // Headers for the bulk claims past "pending" — the ones with a claim no.
  ...bulkHeaders,
];

/* ============================== ClaimsPayee ============================== */

// One payee row per death claim — the person(s) claiming that ClaimNo. A claim
// can name a second (joint) payee via payeeTwoId.
export const claimsPayeeSeed: ClaimsPayeeRecord[] = [
  { idx: 1, claimNo: "NCT1DC26009785", payeeOneId: "P-016", payeeTwoId: "P-028", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 2, claimNo: "VCTDC26009786", payeeOneId: "P-018", amount: 56000, relation: "Child", isOnHold: false },
  { idx: 3, claimNo: "NCT2DC26009787", payeeOneId: "P-017", amount: 165000, relation: "Spouse", isOnHold: true, remarks: "Payment held — awaiting valid ID of claimant." },
  { idx: 4, claimNo: "CLBZTDC26009788", payeeOneId: "P-019", amount: 105000, relation: "Child", isOnHold: false },
  { idx: 5, claimNo: "VWT1DC26009789", payeeOneId: "P-020", amount: 85000, relation: "Spouse", isOnHold: false },
  { idx: 6, claimNo: "CLT1DC26009790", payeeOneId: "P-021", amount: 60000, relation: "Child", isOnHold: false },
  { idx: 7, claimNo: "NCT2DC26009791", payeeOneId: "P-022", amount: 100000, relation: "Spouse", isOnHold: false },
  { idx: 8, claimNo: "BTDC26009792", payeeOneId: "P-023", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 9, claimNo: "CLBZTDC26009793", payeeOneId: "P-024", amount: 57000, relation: "Child", isOnHold: false },
  { idx: 10, claimNo: "CLT2DC26009794", payeeOneId: "P-025", amount: 56000, relation: "Child", isOnHold: false },
  { idx: 11, claimNo: "CLT1DC26009795", payeeOneId: "P-026", amount: 85000, relation: "Spouse", isOnHold: false },
  { idx: 12, claimNo: "MCETDC26009796", payeeOneId: "P-027", payeeTwoId: "P-029", amount: 80000, relation: "Parent", isOnHold: true, remarks: "Payout on hold pending settlement of prior dismemberment claims." },
  { idx: 13, claimNo: "CLT2DC26009797", payeeOneId: "P-028", amount: 60000, relation: "Child", isOnHold: false },
  { idx: 14, claimNo: "MCETDC26009798", payeeOneId: "P-029", amount: 165000, relation: "Parent", isOnHold: false },
  { idx: 15, claimNo: "VETDC26009799", payeeOneId: "P-030", amount: 12500, relation: "Parent", isOnHold: false },
  // Payees on the endorsed (For Approval) death claims.
  { idx: 16, claimNo: "NCT1DC26009800", payeeOneId: "P-016", amount: 56000, relation: "Spouse", isOnHold: false },
  { idx: 17, claimNo: "VCTDC26009801", payeeOneId: "P-018", amount: 85000, relation: "Child", isOnHold: false },
  { idx: 18, claimNo: "NCT2DC26009802", payeeOneId: "P-022", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 19, claimNo: "MCETDC26009803", payeeOneId: "P-027", amount: 60000, relation: "Parent", isOnHold: false },
  { idx: 20, claimNo: "VWT1DC26009804", payeeOneId: "P-020", amount: 100000, relation: "Spouse", isOnHold: false },
  // The showcase plan holder's claims. The main plan is claimed JOINTLY by the
  // widower and the elder child — the two-payee case — and the denied claim on
  // the lapsed plan is on hold with the reason on the record.
  { idx: 21, claimNo: "NCT1DC26009810", payeeOneId: "P-042", payeeTwoId: "P-043", amount: 165000, relation: "Spouse", isOnHold: false },
  { idx: 22, claimNo: "NCT1DC26009811", payeeOneId: "P-042", amount: 80000, relation: "Spouse", isOnHold: false },
  { idx: 23, claimNo: "NCT1DC26009812", payeeOneId: "P-043", amount: 56000, relation: "Child", isOnHold: true, remarks: "Plan lapsed as of due date 01 Feb 2026 — claim denied, release suspended." },
];

/* ========================= RefPayoutChannel ========================= */

export const refPayoutChannelSeed: RefPayoutChannelRecord[] = [
  { channelCode: "0", channelDesc: "PHILIPPINE NATIONAL BANK", channelType: "BANK ACCOUNT", isActive: true, orderBy: 1 },
  { channelCode: "4", channelDesc: "BANK OF THE PHILIPPINE ISLANDS", channelType: "BANK ACCOUNT", isActive: true, orderBy: 2 },
  { channelCode: "10", channelDesc: "CHINA BANKING CORPORATION", channelType: "BANK ACCOUNT", isActive: true, orderBy: 3 },
  { channelCode: "14", channelDesc: "SECURITY BANK CORPORATION", channelType: "BANK ACCOUNT", isActive: true, orderBy: 4 },
  { channelCode: "26", channelDesc: "METOPOLITAN BANK AND TRUST CO", channelType: "BANK ACCOUNT", isActive: true, orderBy: 5 },
  { channelCode: "93", channelDesc: "GCASH", channelType: "EWALLET", isActive: true, orderBy: 6 },
  { channelCode: "104", channelDesc: "CHECK", channelType: "LIFEPLAN BRANCH", isActive: true, orderBy: 7 },
  { channelCode: "118", channelDesc: "BDO NETWORK BANK", channelType: "BANK ACCOUNT", isActive: true, orderBy: 8 },
  { channelCode: "190", channelDesc: "GOTYME BANK CORPORATION", channelType: "BANK ACCOUNT", isActive: true, orderBy: 9 },
];

/* ============================ PayoutAccount ============================ */

// One payout destination per claimant (P-016..P-030) — where the claim's
// benefit is released. A mix of bank account, e-wallet and branch check.
export const payoutAccountSeed: PayoutAccountRecord[] = [
  { payoutId: "PA-000001", personId: "P-016", channelCode: "118", accountNo: "001234567890", payoutBranch: "BDO Network Bank Quezon Ave.", isActive: true },
  { payoutId: "PA-000002", personId: "P-017", channelCode: "93", accountNo: "09184112299", payoutBranch: "—", isActive: true },
  { payoutId: "PA-000003", personId: "P-018", channelCode: "4", accountNo: "459081223344", payoutBranch: "BPI Cebu Lahug", isActive: true },
  { payoutId: "PA-000004", personId: "P-019", channelCode: "26", accountNo: "770155667788", payoutBranch: "Metrobank Batangas", isActive: true },
  { payoutId: "PA-000005", personId: "P-020", channelCode: "104", accountNo: "L20000234A", payoutBranch: "Iloilo City Branch", isActive: true },
  { payoutId: "PA-000006", personId: "P-021", channelCode: "93", accountNo: "09173005566", payoutBranch: "—", isActive: true },
  { payoutId: "PA-000007", personId: "P-022", channelCode: "0", accountNo: "008877665544", payoutBranch: "PNB Roxas Blvd.", isActive: true },
  { payoutId: "PA-000008", personId: "P-023", channelCode: "190", accountNo: "700112233445", payoutBranch: "—", isActive: true },
  { payoutId: "PA-000009", personId: "P-024", channelCode: "4", accountNo: "459022113344", payoutBranch: "BPI Lucena", isActive: true },
  { payoutId: "PA-000010", personId: "P-025", channelCode: "104", accountNo: "L21000111J", payoutBranch: "Vigan Branch", isActive: true },
  { payoutId: "PA-000011", personId: "P-026", channelCode: "93", accountNo: "09188837744", payoutBranch: "—", isActive: true },
  { payoutId: "PA-000012", personId: "P-027", channelCode: "10", accountNo: "770199002211", payoutBranch: "China Bank Davao", isActive: true },
  { payoutId: "PA-000013", personId: "P-028", channelCode: "14", accountNo: "445566778899", payoutBranch: "Security Bank Baguio", isActive: true },
  { payoutId: "PA-000014", personId: "P-029", channelCode: "118", accountNo: "003344556677", payoutBranch: "BDO Network Bank Cagayan de Oro", isActive: true },
  { payoutId: "PA-000015", personId: "P-030", channelCode: "104", accountNo: "L26000555N", payoutBranch: "Tacloban City Branch", isActive: true },
  // The showcase claim's payees. The widower keeps a closed account on file
  // beside his current one — the case the payout picker has to not offer.
  { payoutId: "PA-000016", personId: "P-042", channelCode: "4", accountNo: "459077881122", payoutBranch: "BPI Quezon Ave.", isActive: true },
  { payoutId: "PA-000017", personId: "P-042", channelCode: "0", accountNo: "008811224466", payoutBranch: "PNB Cubao", isActive: false },
  { payoutId: "PA-000018", personId: "P-043", channelCode: "93", accountNo: "09175550143", payoutBranch: "—", isActive: true },
];

/* ============================== DocumentType ============================== */

export const documentTypeSeed: DocumentTypeRecord[] = [
  { documentCode: "C000001", documentDesc: "BIRTH CERTIFICATE" },
  { documentCode: "C000008", documentDesc: "DEATH CERTIFICATE" },
  { documentCode: "C000014", documentDesc: "STATEMENT OF CLAIMANT" },
  { documentCode: "C000015", documentDesc: "BIRTH CERTIFICATE OF CLAIMANT" },
  { documentCode: "CS000126", documentDesc: "LPA" },
  { documentCode: "CS000140", documentDesc: "COFP" },
  { documentCode: "CS000312", documentDesc: "BIRTH CERTIFICATE OF PH" },
  { documentCode: "CS000414", documentDesc: "VALID ID OF CLAIMANT" },
  { documentCode: "CS000415", documentDesc: "VALID ID OF PH" },
  { documentCode: "CS000456", documentDesc: "REGISTERED DEATH CERTIFICATE" },
];

/* ================================ Document ================================ */

export const documentSeed: DocumentRecord[] = [
  { docId: 1, documentCode: "CS000126", personId: "P-001", value: "/docs/L21000456B/lpa.pdf" },
  { docId: 2, documentCode: "CS000140", personId: "P-001", value: "/docs/L21000456B/cofp.pdf" },
  { docId: 3, documentCode: "CS000312", personId: "P-001", value: "/docs/L21000456B/birth-cert-ph.pdf" },
  { docId: 4, documentCode: "CS000456", personId: "P-001", value: "/docs/L21000456B/death-cert.pdf" },
  { docId: 5, documentCode: "CS000415", personId: "P-001", value: "/docs/L21000456B/valid-id-ph.pdf" },
  { docId: 6, documentCode: "C000014", personId: "P-016", value: "/docs/L21000456B/statement-of-claimant.pdf" },
  { docId: 7, documentCode: "CS000414", personId: "P-016", value: "/docs/L21000456B/valid-id-claimant.pdf" },
  { docId: 8, documentCode: "CS000126", personId: "P-003", value: "/docs/L25000123I/lpa.pdf" },
  { docId: 9, documentCode: "CS000456", personId: "P-003", value: "/docs/L25000123I/death-cert.pdf" },
  { docId: 10, documentCode: "C000015", personId: "P-017", value: "/docs/L25000123I/birth-cert-claimant.pdf" },
  { docId: 11, documentCode: "CS000126", personId: "P-005", value: "/docs/L26000901M/lpa.pdf" },
  { docId: 12, documentCode: "CS000140", personId: "P-005", value: "/docs/L26000901M/cofp.pdf" },
  { docId: 13, documentCode: "CS000312", personId: "P-005", value: "/docs/L26000901M/birth-cert-ph.pdf" },
  { docId: 14, documentCode: "CS000415", personId: "P-005", value: "/docs/L26000901M/valid-id-ph.jpg" },
  { docId: 15, documentCode: "CS000126", personId: "P-002", value: "/docs/L19000567C/lpa.pdf" },
  { docId: 16, documentCode: "CS000456", personId: "P-002", value: "/docs/L19000567C/death-cert.pdf" },
  { docId: 17, documentCode: "CS000415", personId: "P-002", value: "/docs/L19000567C/valid-id-ph.jpg" },
  { docId: 18, documentCode: "CS000126", personId: "P-004", value: "/docs/L23000012H/lpa.pdf" },
  { docId: 19, documentCode: "CS000140", personId: "P-004", value: "/docs/L23000012H/cofp.pdf" },
  { docId: 20, documentCode: "C000001", personId: "P-004", value: "/docs/L23000012H/birth-cert.pdf" },
  { docId: 21, documentCode: "CS000414", personId: "P-004", value: "/docs/L23000012H/valid-id-claimant.jpg" },
  { docId: 22, documentCode: "CS000456", personId: "P-004", value: "/docs/L23000012H/death-cert.pdf" },
  { docId: 23, documentCode: "C000014", personId: "P-004", value: "/docs/L23000012H/statement-of-claimant.pdf" },
  { docId: 24, documentCode: "CS000126", personId: "P-006", value: "/docs/L20000234A/lpa.pdf" },
  { docId: 25, documentCode: "CS000456", personId: "P-006", value: "/docs/L20000234A/death-cert.pdf" },
  { docId: 26, documentCode: "CS000126", personId: "P-013", value: "/docs/L25000444M/lpa.pdf" },
  // The showcase plan holder's folder — one plan's paperwork per group, plus
  // the claimant's own. Documents hang off the PERSON, so all ten show on her
  // profile whichever of her three plans is open.
  { docId: 27, documentCode: "CS000126", personId: "P-041", value: "/docs/L20000700X/lpa.pdf" },
  { docId: 28, documentCode: "CS000140", personId: "P-041", value: "/docs/L20000700X/cofp.pdf" },
  { docId: 29, documentCode: "CS000312", personId: "P-041", value: "/docs/L20000700X/birth-cert-ph.pdf" },
  { docId: 30, documentCode: "CS000415", personId: "P-041", value: "/docs/L20000700X/valid-id-ph.jpg" },
  { docId: 31, documentCode: "CS000456", personId: "P-041", value: "/docs/L20000700X/registered-death-cert.pdf" },
  { docId: 32, documentCode: "C000008", personId: "P-041", value: "/docs/L20000700X/death-cert.pdf" },
  { docId: 33, documentCode: "CS000126", personId: "P-041", value: "/docs/L23000701Y/lpa.pdf" },
  { docId: 34, documentCode: "CS000140", personId: "P-041", value: "/docs/L23000701Y/cofp.pdf" },
  { docId: 35, documentCode: "CS000126", personId: "P-041", value: "/docs/L18000702Z/lpa.pdf" },
  { docId: 36, documentCode: "C000001", personId: "P-041", value: "/docs/L18000702Z/birth-cert.pdf" },
  { docId: 37, documentCode: "C000014", personId: "P-042", value: "/docs/L20000700X/statement-of-claimant.pdf" },
  { docId: 38, documentCode: "CS000414", personId: "P-042", value: "/docs/L20000700X/valid-id-claimant.jpg" },
  { docId: 39, documentCode: "C000015", personId: "P-043", value: "/docs/L20000700X/birth-cert-claimant.pdf" },
];

/* ==================== PlanholderRemarks / PlanholderNotes ==================== */

// Remarks are the plan's own transaction history — what has happened to the
// ACCOUNT: issuance, collections, lapse and reinstatement, transfers, changes
// to the plan holder's details. Anything about a claim (documents received,
// claimant checks, endorsements) belongs on the claim, not here.
export const planholderRemarkSeed: PlanholderRemarkRecord[] = [
  { idx: 1, lpaNo: "L21000456B", value: "Plan issued 01 May 2021 under B5M10. First installment collected on the same day.", auditUser: "Benjie Ramos", auditDate: "2021-05-01T09:00:00" },
  { idx: 2, lpaNo: "L21000456B", value: "Account transferred from Manila Branch to Quezon City Branch, 14 Jul 2024.", auditUser: "Carla Uy", auditDate: "2024-07-14T10:30:00" },
  { idx: 3, lpaNo: "L21000456B", value: "Contact number and mailing address updated 02 Mar 2026.", auditUser: "Benjie Ramos", auditDate: "2026-03-02T14:20:00" },
  { idx: 4, lpaNo: "L21000456B", value: "Installment for Jul 2026 collected 01 Jul 2026. Account current, 52 installments paid.", auditUser: "Diana Lim", auditDate: "2026-07-01T11:15:00" },
  { idx: 5, lpaNo: "L25000123I", value: "New sale encoded 10 Sep 2025; first installment collected on issue.", auditUser: "Carla Uy", auditDate: "2025-09-10T09:45:00" },
  { idx: 6, lpaNo: "L25000123I", value: "Installment for Jul 2026 collected 10 Jul 2026. Account current.", auditUser: "Diana Lim", auditDate: "2026-07-10T10:05:00" },
  { idx: 7, lpaNo: "L23000012H", value: "Account lapsed for non-payment; reinstated 20 Jun 2024 after arrears were settled in full.", auditUser: "Diana Lim", auditDate: "2024-06-20T13:40:00" },
  { idx: 8, lpaNo: "L23000012H", value: "No collection posted since 20 Mar 2026. Account lapsed again as of due date 20 Apr 2026.", auditUser: "Benjie Ramos", auditDate: "2026-04-21T08:50:00" },
  // The showcase plan holder — six years of account history on the main plan,
  // so the Remarks section is read at the length it will actually run at.
  { idx: 9, lpaNo: "L20000700X", value: "Plan issued 15 Jun 2020 under RA5M5. First installment collected on the same day.", auditUser: "Carla Uy", auditDate: "2020-06-15T09:20:00" },
  { idx: 10, lpaNo: "L20000700X", value: "Beneficiary added: Miguel V. Almeda (Child), 12 Aug 2024. Plan now carries four beneficiaries.", auditUser: "Carla Uy", auditDate: "2024-08-12T10:20:00" },
  { idx: 11, lpaNo: "L20000700X", value: "Mailing address changed to the office address on file, 03 Feb 2025, at the plan holder's request.", auditUser: "Benjie Ramos", auditDate: "2025-02-03T15:10:00" },
  { idx: 12, lpaNo: "L20000700X", value: "Installment for Jul 2026 collected 15 Jul 2026. Account current, 58 of 60 installments paid at that date.", auditUser: "Diana Lim", auditDate: "2026-07-15T11:05:00" },
  { idx: 13, lpaNo: "L20000700X", value: "Plan holder reported deceased 06 Jul 2026. Collection stopped and the remaining balance closed out against the death benefit; account now fully paid.", auditUser: PROCESSOR, auditDate: "2026-07-14T08:10:00" },
  { idx: 14, lpaNo: "L23000701Y", value: "Second plan issued 01 Mar 2023 under C5M8, same plan holder as L20000700X.", auditUser: "Carla Uy", auditDate: "2023-03-01T09:00:00" },
  { idx: 15, lpaNo: "L18000702Z", value: "Account lapsed for non-payment; reinstated 01 Feb 2021 after arrears were settled.", auditUser: "Diana Lim", auditDate: "2021-02-01T14:00:00" },
  { idx: 16, lpaNo: "L18000702Z", value: "No collection posted since 01 Jan 2026. Account lapsed again as of due date 01 Feb 2026.", auditUser: "Benjie Ramos", auditDate: "2026-02-02T08:30:00" },
];

// Notes are standing observations about servicing the plan — preferences and
// handling instructions that are not themselves transactions. Like remarks,
// they are about the ACCOUNT: claim reasoning belongs on the claim.
export const planholderNoteSeed: PlanholderNoteRecord[] = [
  { idx: 1, lpaNo: "L21000456B", value: "Prefers to be contacted by SMS; phone is often unattended during the day.", auditUser: "Benjie Ramos", auditDate: "2026-03-02T14:25:00" },
  { idx: 2, lpaNo: "L21000456B", value: "Any release is to be picked up at the branch — do not schedule for delivery.", auditUser: "Carla Uy", auditDate: "2024-07-14T10:45:00" },
  { idx: 3, lpaNo: "L23000012H", value: "Collections for this account are handled by the Batangas City area team.", auditUser: "Diana Lim", auditDate: "2024-06-20T13:55:00" },
  { idx: 4, lpaNo: "L20000700X", value: "Plan holder holds three plans — check all three before acting on any one of them.", auditUser: "Carla Uy", auditDate: "2023-03-01T09:15:00" },
  { idx: 5, lpaNo: "L20000700X", value: "Correspondence goes to the office address; the home address is unattended on weekdays.", auditUser: "Benjie Ramos", auditDate: "2025-02-03T15:15:00" },
];

/* ================================ Branch ================================ */
//
// `territoryCode` points at `territorySeed`, which is declared with the chapel
// branches near the top of this file. Every branch is placed in the territory
// its city actually falls under — a branch and a chapel in the same province
// answer to the same territory, and the service-payables screens read both.

export const branchSeed: BranchRecord[] = [
  { branchCode: "ESTORE", territoryCode: "NCT2", regionCode: "NCR", description: "E-Store Branch", address: "Makati City, Metro Manila", contactNo: "(02) 8888 0000", email: "estore@stpeter.com.ph" },
  { branchCode: "QCITY", territoryCode: "NCT1", regionCode: "NCR", description: "Quezon City Branch", address: "Quezon City, Metro Manila", contactNo: "(02) 8888 0001", email: "qcity@stpeter.com.ph" },
  { branchCode: "MANILA", territoryCode: "NCT2", regionCode: "NCR", description: "Manila Branch", address: "Manila, Metro Manila", contactNo: "(02) 8888 0002", email: "manila@stpeter.com.ph" },
  { branchCode: "CEBU", territoryCode: "VCT", regionCode: "R7", description: "Cebu City Branch", address: "Cebu City, Cebu", contactNo: "(032) 253 0003", email: "cebu@stpeter.com.ph" },
  { branchCode: "BATANGAS", territoryCode: "CLBZT", regionCode: "R4A", description: "Batangas City Branch", address: "Batangas City, Batangas", contactNo: "(043) 300 0004", email: "batangas@stpeter.com.ph" },
  { branchCode: "DAVAO", territoryCode: "MCET", regionCode: "R11", description: "Davao City Branch", address: "Davao City, Davao del Sur", contactNo: "(082) 300 0005", email: "davao@stpeter.com.ph" },
  { branchCode: "ILOILO", territoryCode: "VWT1", regionCode: "R6", description: "Iloilo City Branch", address: "Iloilo City, Iloilo", contactNo: "(033) 300 0006", email: "iloilo@stpeter.com.ph" },
  { branchCode: "SANFER", territoryCode: "CLT1", regionCode: "R3", description: "San Fernando Branch", address: "San Fernando, Pampanga", contactNo: "(045) 300 0007", email: "sanfer@stpeter.com.ph" },
  { branchCode: "BAGUIO", territoryCode: "CLT2", regionCode: "CAR", description: "Baguio City Branch", address: "Baguio City, Benguet", contactNo: "(074) 300 0008", email: "baguio@stpeter.com.ph" },
  { branchCode: "NAGA", territoryCode: "BT", regionCode: "R5", description: "Naga City Branch", address: "Naga City, Camarines Sur", contactNo: "(054) 300 0009", email: "naga@stpeter.com.ph" },
  { branchCode: "LUCENA", territoryCode: "CLBZT", regionCode: "R4A", description: "Lucena City Branch", address: "Lucena City, Quezon", contactNo: "(042) 300 0010", email: "lucena@stpeter.com.ph" },
  { branchCode: "VIGAN", territoryCode: "CLT2", regionCode: "R1", description: "Vigan Branch", address: "Vigan, Ilocos Sur", contactNo: "(077) 300 0011", email: "vigan@stpeter.com.ph" },
  { branchCode: "CDO", territoryCode: "MCET", regionCode: "R10", description: "Cagayan de Oro Branch", address: "Cagayan de Oro, Misamis Oriental", contactNo: "(088) 300 0012", email: "cdo@stpeter.com.ph" },
  { branchCode: "ANGELES", territoryCode: "CLT1", regionCode: "R3", description: "Angeles City Branch", address: "Angeles City, Pampanga", contactNo: "(045) 300 0013", email: "angeles@stpeter.com.ph" },
  { branchCode: "TACLOBAN", territoryCode: "VET", regionCode: "R8", description: "Tacloban City Branch", address: "Tacloban City, Leyte", contactNo: "(053) 300 0014", email: "tacloban@stpeter.com.ph" },
];

/* =========================== RefAccountStatus =========================== */
//
// Where a plan's ACCOUNT stands. Verbatim from the reference data; the sentence
// -case labels the UI prints live on `ACCOUNT_STATUS_LABELS` in `models.ts`.

export const refAccountStatusSeed: RefAccountStatusRecord[] = [
  { acctStatCode: "AC", description: "ACTIVE" },
  { acctStatCode: "DN", description: "DENIED" },
  { acctStatCode: "FP", description: "FULLY PAID" },
  { acctStatCode: "LA", description: "LE APPLICATION" },
  { acctStatCode: "LP", description: "LAPSED" },
  { acctStatCode: "NS", description: "NEW SALES" },
  { acctStatCode: "RI", description: "REINSTATED" },
];

/* ============================= RefTermiStat ============================= */
//
// What became of the PLAN. Verbatim from the reference data — including the two
// oddities it carries, which are left exactly as given rather than tidied: "UF"
// is written "USB- ONE FULLY PAID PLAN FROM FP ACCOUNT" with the space on the
// wrong side of the dash, and "CT" runs two things together with a slash.

export const refTermiStatSeed: RefTermiStatRecord[] = [
  { termiStatCode: "AR", description: "ACTIVE ROP" },
  { termiStatCode: "CA", description: "CASH SURRENDER FROM AC ACCOUNT" },
  { termiStatCode: "CB", description: "CASH BENEFIT" },
  { termiStatCode: "CF", description: "CASH SURRENDER FROM FP ACCOUNT" },
  { termiStatCode: "CT", description: "CANCELLED/FORFEITED PLAN TERMINATION VALUE" },
  { termiStatCode: "CU", description: "CANCELLED LOAN" },
  { termiStatCode: "DC", description: "DENIED CLAIM" },
  { termiStatCode: "FR", description: "FULLY PAID ROP" },
  { termiStatCode: "NT", description: "NOT YET TERMINATED" },
  { termiStatCode: "RD", description: "ST. PETER ACE PROGRAM" },
  { termiStatCode: "RP", description: "RETURN OF PREMIUM" },
  { termiStatCode: "SA", description: "SERVICED - ASSIGNED" },
  { termiStatCode: "SP", description: "SERVICED - PLANHOLDER" },
  { termiStatCode: "TP", description: "TERMINATED PLAN" },
  { termiStatCode: "TR", description: "TRANSFERRED ROP" },
  { termiStatCode: "UA", description: "USB - ONE FULLY PAID PLAN FROM AC ACCOUNT" },
  { termiStatCode: "UC", description: "USB - CONTINUE PAYMENT" },
  { termiStatCode: "UF", description: "USB- ONE FULLY PAID PLAN FROM FP ACCOUNT" },
  { termiStatCode: "UP", description: "USB - ONE FULLY PAID PLAN" },
  { termiStatCode: "UR", description: "USB - CREMATION PLAN" },
  { termiStatCode: "UT", description: "USB - TERMINATION VALUE OR 70%" },
];

/* ============================== RefMortuary ============================== */
//
// The funeral homes a service payable is raised against — the WHOLE table this
// time: 424 rows, 206 company-owned and 218 franchised, in the source's own
// order rather than split into two blocks. The 2026-08-25 drop replaced the
// thirty-seven-row extract this seed was built on, and it is loaded verbatim:
// nothing below is normalised, corrected or inferred, down to the spelling
// ("ST. PETER CHAPEL - …" with the space that the earlier extract did not have).
//
// THE `branchCode` COLUMN HOLDS CHAPEL CODES. See `RefMortuaryRecord` — every
// value in it is a `ChapelBranch.chapelCode`, under the source's own column
// name.
//
// THE TWO ODD ROWS OF THE OLD EXTRACT ARE ANSWERED BY THIS ONE, which is the
// argument for taking a reference table whole rather than in pieces:
//
//   BT1-1   "ADEA MEMORIAL HOMES - CAPALONGA" came with no chapel column at all
//           and its `branchCode` was left empty. It names JOSEPA here.
//   SLI1-02 was listed twice, once for VICTORIA and once for PINAMALAYAN, and a
//           primary key cannot name two rows — PINAMALAYAN was left out rather
//           than given an invented code. It has its own row now, SLI1-07.
//
// 116 OF THE CHAPEL CODES STILL DO NOT RESOLVE, and they are left exactly as
// they are. Two kinds, the same two as before: NEAR MISSES of a chapel that is
// on file (IRIGA against IRIGAS, STA.MA against STAMAR), where one side of the
// pair is a typing slip and which one is not this layer's call; and PLACES WITH
// NO CHAPEL ROW AT ALL — BAGUIO, CEBU, ILOILO, DAVAO, LUPON, GENSAN and the rest
// of the franchise network. The chapel reference drop is explicitly the
// company-OWNED list ("all of this is not franchise"), so the mortuary table was
// always going to cover ground the chapel table does not.
// `db.getUnresolvedMortuaryChapels` computes that list rather than repeating it
// here.
//
// WHAT DID NOT FOLLOW FROM THE BIGGER TABLE: the chapel network. The nine
// franchise chapels in `FRANCHISE_CHAPELS` were derived from the fourteen FR
// rows the old extract carried, and deriving one for each of the 218 FR rows
// here would nearly double the network off inference rather than off data —
// see that block. The unresolved codes stay unresolved until a chapel drop
// names them.

export const refMortuarySeed: RefMortuaryRecord[] = [
  { mortCode: "BT1-00", mortuary: "Z.R. BUFETE MEMORIAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "BT1-01", mortuary: "ST. PETER CHAPEL - IRIGA SAN MIGUEL", branchCode: "IRIGA", mortClass: "OW" },
  { mortCode: "BT1-02", mortuary: "CARAMOAN FUNERAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "BT1-03", mortuary: "T. SALLES MEMORIAL HOME - OCAMPO", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "BT1-1", mortuary: "ADEA MEMORIAL HOMES - CAPALONGA", branchCode: "JOSEPA", mortClass: "FR" },
  { mortCode: "BT2-02", mortuary: "ST. PETER CHAPEL - POLANGUI", branchCode: "POLANG", mortClass: "OW" },
  { mortCode: "BT2-03", mortuary: "CATAYTAY FUNERAL SERVICES (TICAO)", branchCode: "MASBAT", mortClass: "FR" },
  { mortCode: "BT2-1", mortuary: "ST. PETER CHAPEL - LEGASPI", branchCode: "LEGASP", mortClass: "OW" },
  { mortCode: "BT3-00", mortuary: "ST. PETER CHAPEL - SORSOGON", branchCode: "SORSOG", mortClass: "OW" },
  { mortCode: "BT3-01", mortuary: "ST. PETER CHAPEL - MASBATE", branchCode: "MASBAT", mortClass: "OW" },
  { mortCode: "BT3-1", mortuary: "ST. PETER CHAPEL - BULAN", branchCode: "BULAN", mortClass: "OW" },
  { mortCode: "CL1-1-1", mortuary: "ST. PETER CHAPEL - STA. MARIA", branchCode: "STA.MA", mortClass: "OW" },
  { mortCode: "CL1-1-2", mortuary: "ST. PETER CHAPEL - MABALACAT", branchCode: "ANGELE", mortClass: "OW" },
  { mortCode: "CL1-2-00", mortuary: "ST. PETER CHAPEL - GUAGUA", branchCode: "LUBAO", mortClass: "OW" },
  { mortCode: "CL1-2-01", mortuary: "ST. PETER CHAPEL - STO. TOMAS, PAMPANGA", branchCode: "SANFER", mortClass: "OW" },
  { mortCode: "CL1-2-02", mortuary: "ST. PETER CHAPEL - IBA ZAMBALES", branchCode: "CRUZZA", mortClass: "OW" },
  { mortCode: "CL1-2-1", mortuary: "ST. PETER CHAPEL - MEXICO", branchCode: "SANFER", mortClass: "OW" },
  { mortCode: "CL1-3-00", mortuary: "ST. PETER CHAPEL - SUBIC", branchCode: "CRUZZA", mortClass: "OW" },
  { mortCode: "CL1-3-02", mortuary: "ST. PETER CHAPEL - OLONGAPO", branchCode: "CRUZZA", mortClass: "OW" },
  { mortCode: "CL1-3-1", mortuary: "ST. PETER CHAPEL - DINALUPIHAN", branchCode: "DINALU", mortClass: "OW" },
  { mortCode: "CL1-4-00", mortuary: "ST. PETER CHAPEL - CABANATUAN", branchCode: "CABANA", mortClass: "OW" },
  { mortCode: "CL1-4-00A", mortuary: "ST. PETER CHAPEL - CABANATUAN", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "CL1-4-01", mortuary: "ST. PETER CHAPEL - GAPAN", branchCode: "CABANA", mortClass: "OW" },
  { mortCode: "CL1-4-1", mortuary: "ST. PETER CHAPEL - GUIMBA", branchCode: "TALAVE", mortClass: "OW" },
  { mortCode: "CL2-1-00", mortuary: "ST. PETER CHAPEL - PANIQUI", branchCode: "PANIQU", mortClass: "OW" },
  { mortCode: "CL2-1-1", mortuary: "ST. PETER CHAPEL - CAMILING", branchCode: "CAMILI", mortClass: "OW" },
  { mortCode: "CL2-2-00", mortuary: "ST. PETER CHAPEL - URDANETA", branchCode: "URDANE", mortClass: "OW" },
  { mortCode: "CL2-2-1", mortuary: "ST. PETER CHAPEL - BAYAMBANG", branchCode: "SNCARL", mortClass: "OW" },
  { mortCode: "CLAIMS-00", mortuary: "NO BILLING MORTUARY", branchCode: "MAIN O", mortClass: "OW" },
  { mortCode: "CLBZ1-01", mortuary: "ST. PETER CHAPEL - TAYABAS", branchCode: "LUCBAN", mortClass: "OW" },
  { mortCode: "CLBZ3-00", mortuary: "PNA HOLY ROSARY FUNERAL HOMES", branchCode: "ROSARI", mortClass: "FR" },
  { mortCode: "CLBZ3-03", mortuary: "ST. PETER CHAPEL - LIPA", branchCode: "LIPA", mortClass: "OW" },
  { mortCode: "CLBZ3-04", mortuary: "ROMY`S FUNERAL SERVICES", branchCode: "NASUGB", mortClass: "FR" },
  { mortCode: "CLBZ3-1", mortuary: "ASERON FUNERAL PARLOR", branchCode: "BATANG", mortClass: "FR" },
  { mortCode: "CV1-1", mortuary: "ST. PETER CHAPEL - APARRI", branchCode: "APARRI", mortClass: "OW" },
  { mortCode: "CV2-1", mortuary: "ST. PETER CHAPEL - CABARROGUIS", branchCode: "DIFFUN", mortClass: "OW" },
  { mortCode: "GM1-05", mortuary: "FUNERARIA L. A. VASQUEZ", branchCode: "LAS PI", mortClass: "FR" },
  { mortCode: "GM2-18", mortuary: "ST. PETER CHAPEL - ANTIPOLO", branchCode: "ANTIPO", mortClass: "OW" },
  { mortCode: "GM2-19", mortuary: "ST. PETER CHAPEL - TANAY", branchCode: "TANAY", mortClass: "OW" },
  { mortCode: "GM3-04", mortuary: "ST. BARTOLOME FUNERAL HOMES", branchCode: "DASMAR", mortClass: "FR" },
  { mortCode: "GM3-31", mortuary: "TOLENTINO PARADISE FUNERAL SERVICES", branchCode: "IMUS", mortClass: "FR" },
  { mortCode: "GM3-47", mortuary: "ST. PETER CHAPEL - GMA", branchCode: "GMA", mortClass: "OW" },
  { mortCode: "GM3-52", mortuary: "ST. PETER CHAPEL - TRECE", branchCode: "TRECE", mortClass: "OW" },
  { mortCode: "GM3-57", mortuary: "ST. PETER CHAPEL - TRECE(INDANG)", branchCode: "TRECE", mortClass: "OW" },
  { mortCode: "GM4-05", mortuary: "ST. PETER CHAPEL - BALIUAG", branchCode: "CENBUL", mortClass: "OW" },
  { mortCode: "GM4-06", mortuary: "ST. PETER CHAPEL - MEYCAUAYAN", branchCode: "MEYCAU", mortClass: "OW" },
  { mortCode: "GM4-07", mortuary: "ST. PETER CHAPEL - SAN MIGUEL", branchCode: "SANMIG", mortClass: "OW" },
  { mortCode: "GM4-08", mortuary: "ST. PETER CHAPEL - PUERTO PRINCESA", branchCode: "ROXAPA", mortClass: "OW" },
  { mortCode: "GME1-1", mortuary: "ST. PETER CHAPEL - VALENZUELA", branchCode: "VALENZ", mortClass: "OW" },
  { mortCode: "GME2-00", mortuary: "ST. PETER CHAPEL - BINANGONAN", branchCode: "BINANG", mortClass: "OW" },
  { mortCode: "GME2-01", mortuary: "ST. PETER CHAPEL - MARIKINA", branchCode: "MARIKI", mortClass: "OW" },
  { mortCode: "GME2-1", mortuary: "ST. PETER CHAPEL - MONTALBAN", branchCode: "MONTAL", mortClass: "OW" },
  { mortCode: "GME3-00", mortuary: "BERNADETTE MEMORIAL CHAPEL & FUNERAL SERVICES", branchCode: "MANDAL", mortClass: "FR" },
  { mortCode: "GME3-02", mortuary: "ST. PETER CHAPEL - SAN JOSE DEL MONTE", branchCode: "KALOO3", mortClass: "OW" },
  { mortCode: "GME3-03", mortuary: "ST. PETER CHAPEL - COMMONWEALTH", branchCode: "COMMON", mortClass: "OW" },
  { mortCode: "GME3-04", mortuary: "ST. PETER CHAPEL - MAYON", branchCode: "QUEZAV", mortClass: "OW" },
  { mortCode: "GME3-05", mortuary: "FOREST HILL FUNERAL HOMES AND SERVICES, INC.", branchCode: "NOVALI", mortClass: "OW" },
  { mortCode: "GME3-1", mortuary: "PAGULAYAN MEMORIAL HOMES", branchCode: "CAUAYA", mortClass: "FR" },
  { mortCode: "GME4-00", mortuary: "E. SOLIVIO FUNERAL HOMES - SAN VICENTE", branchCode: "ROXAPA", mortClass: "FR" },
  { mortCode: "GME4-01", mortuary: "VPS FUNERAL HOMES", branchCode: "ROXPAL", mortClass: "FR" },
  { mortCode: "GME4-02", mortuary: "ST. PETER CHAPEL - NARRA PALAWAN", branchCode: "NARRA", mortClass: "OW" },
  { mortCode: "GME4-03", mortuary: "E. SOLIVIO FUNERAL HOMES - TAYTAY", branchCode: "ROXAPA", mortClass: "FR" },
  { mortCode: "GMW1-01", mortuary: "NCI LA FUNERARIA REAL INC.", branchCode: "TAGUIG", mortClass: "FR" },
  { mortCode: "GMW1-03", mortuary: "EL JEN MEMORIAL SERVICES (FORMERLY SYMPATHY)", branchCode: "BACOOR", mortClass: "FR" },
  { mortCode: "GMW1-04", mortuary: "ST. PETER CHAPEL - NAIA3", branchCode: "TAGUIG", mortClass: "OW" },
  { mortCode: "GMW1-1", mortuary: "OUR LADY OF LORETO FUNERAL SERVICE", branchCode: "TAGUIG", mortClass: "FR" },
  { mortCode: "GMW2-01", mortuary: "AOC-ROSARIO FUNERAL HOMES", branchCode: "SANPED", mortClass: "FR" },
  { mortCode: "GMW2-03", mortuary: "LA FUNERARIA TOTIE", branchCode: "BACOWE", mortClass: "FR" },
  { mortCode: "GMW2-04", mortuary: "VILLA-BABAS FUNERAL HOMES", branchCode: "IPIL", mortClass: "FR" },
  { mortCode: "GMW2-1", mortuary: "FUNERARIA MALAYA", branchCode: "PASAY", mortClass: "FR" },
  { mortCode: "GMW3-00", mortuary: "SUGATAN-GARCES FUNERAL SERVICE", branchCode: "CAVITE", mortClass: "FR" },
  { mortCode: "GMW3-01", mortuary: "FUNERARIA C. ROCILLO", branchCode: "ALFONS", mortClass: "FR" },
  { mortCode: "GMW3-05", mortuary: "JULIUS LIMJUCO FUNERAL HOMES", branchCode: "CRUZLA", mortClass: "FR" },
  { mortCode: "GMW3-06", mortuary: "HILL VALLEY FUNERAL HOME", branchCode: "ALFONS", mortClass: "FR" },
  { mortCode: "GMW3-07", mortuary: "ST. PETER CHAPEL - BIÑAN, CANLALAY", branchCode: "BINANL", mortClass: "OW" },
  { mortCode: "GMW3-1", mortuary: "JOHN PAUL II FUNERAL HOMES", branchCode: "STAROS", mortClass: "FR" },
  { mortCode: "GMW4-00", mortuary: "ST. PETER CHAPEL - GEN. TRIAS", branchCode: "TRECE", mortClass: "OW" },
  { mortCode: "GMW4-1", mortuary: "REVELATION'S FUNERAL PARLOR", branchCode: "ALFONS", mortClass: "FR" },
  { mortCode: "HOM", mortuary: "ST. PETER MEMORIAL CHAPEL", branchCode: "SPMCQA", mortClass: "OW" },
  { mortCode: "HOMA", mortuary: "ST. PETER MEMORIAL CHAPEL", branchCode: "SPMCQA", mortClass: "FR" },
  { mortCode: "IR2-00", mortuary: "ST. PETER CHAPEL - VIGAN", branchCode: "VIGAN", mortClass: "OW" },
  { mortCode: "IR2-1", mortuary: "ST. PETER CHAPEL - LAOAG", branchCode: "LAOAG", mortClass: "OW" },
  { mortCode: "IR3-00", mortuary: "ST. PETER CHAPEL - BAGUIO MEGA", branchCode: "BAGUIO", mortClass: "OW" },
  { mortCode: "IR3-1", mortuary: "ST. PETER CHAPEL - BAGUIO", branchCode: "BAGUIO", mortClass: "OW" },
  { mortCode: "MC2-1", mortuary: "ST. PETER CHAPEL - DIGOS SAN JOSE", branchCode: "DIGOS", mortClass: "OW" },
  { mortCode: "MC3-01", mortuary: "FUNERARIA VILLA HAGORILES - GLAN", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MC3-02", mortuary: "ST. PETER CHAPEL - GENSAN MEGA", branchCode: "GENSAN", mortClass: "OW" },
  { mortCode: "MC3-03", mortuary: "IAN TORREDA FUNERAL HOMES - ANTIPAS", branchCode: "KABACA", mortClass: "FR" },
  { mortCode: "MC3-04", mortuary: "ABAO FUNERAL PARLOR", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MC3-1", mortuary: "ST. PETER CHAPEL - GENSAN", branchCode: "GSCPIO", mortClass: "OW" },
  { mortCode: "MC4-01", mortuary: "ST. PETER CHAPELS PANABO", branchCode: "PANABO", mortClass: "OW" },
  { mortCode: "MD1-09", mortuary: "PADILLA FUNERAL HOME", branchCode: "LUPON", mortClass: "FR" },
  { mortCode: "MD1-17", mortuary: "SAINT TOMAS FUNERAL HOME (FORMERLY ST. THOMAS FUNERAL HOMES)", branchCode: "LUPON", mortClass: "FR" },
  { mortCode: "MD1-20", mortuary: "PABILONA FUNERAL PARLOR - MONTEVISTA", branchCode: "NABUNT", mortClass: "FR" },
  { mortCode: "MD1-22", mortuary: "MANGAGOY FUNERAL  HOMES", branchCode: "MANGAG", mortClass: "FR" },
  { mortCode: "MD1-25", mortuary: "PADILLA PAMONGCALES FUNERAL", branchCode: "LUPON", mortClass: "FR" },
  { mortCode: "MD1-26", mortuary: "ST. PETER CHAPEL - BUTUAN", branchCode: "BUTUAN", mortClass: "OW" },
  { mortCode: "MD1-27", mortuary: "ST. PETER CHAPEL - TAGUM", branchCode: "TAGUM", mortClass: "OW" },
  { mortCode: "MD1-29", mortuary: "ST. PETER CHAPEL - TANDAG", branchCode: "TANDAG", mortClass: "OW" },
  { mortCode: "MD1-33", mortuary: "ST. PETER CHAPEL - MATI", branchCode: "LUPON", mortClass: "OW" },
  { mortCode: "MD1-36", mortuary: "PADILLA FUNERAL HOME", branchCode: "LUPON", mortClass: "FR" },
  { mortCode: "MD1-38", mortuary: "PABILONA FUNERAL PARLOR - NABUNTURAN", branchCode: "NABUNT", mortClass: "FR" },
  { mortCode: "MD1-39", mortuary: "TORREDA FUNERAL CHAPEL - BAGANGA", branchCode: "LUPON", mortClass: "FR" },
  { mortCode: "MD2-05", mortuary: "TORREDA FUNERAL HOMES - KIDAPAWAN", branchCode: "KIDAPA", mortClass: "FR" },
  { mortCode: "MD2-07", mortuary: "ELISA FUNERAL HOME", branchCode: "MIDSAY", mortClass: "FR" },
  { mortCode: "MD2-11", mortuary: "ALLEN FUNERAL HOME", branchCode: "KORONA", mortClass: "FR" },
  { mortCode: "MD2-12", mortuary: "FUNERARIA VILLA HAGORILES - ISULAN", branchCode: "TACURO", mortClass: "FR" },
  { mortCode: "MD2-13", mortuary: "FUNERARIA VILLA HAGORILES - TACURONG", branchCode: "TACURO", mortClass: "FR" },
  { mortCode: "MD2-14", mortuary: "VILLA FUNERAL HOMES - PANABO", branchCode: "PANABO", mortClass: "FR" },
  { mortCode: "MD2-20", mortuary: "STA. MARIA FUNERAL HOME", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MD2-29", mortuary: "AMOROSO FUNERAL PARLOR", branchCode: "KORONA", mortClass: "FR" },
  { mortCode: "MD2-41", mortuary: "VILLA SIASON FUNERAL HOME", branchCode: "MIDSAY", mortClass: "FR" },
  { mortCode: "MD2-53", mortuary: "ST. PETER CHAPEL - MIDSAYAP", branchCode: "MIDSAY", mortClass: "OW" },
  { mortCode: "MD2-55", mortuary: "VILLA JUSA FUNERAL HOMES", branchCode: "MARAMA", mortClass: "FR" },
  { mortCode: "MD2-56", mortuary: "MONTANO FUNERAL PARLOR", branchCode: "PANABO", mortClass: "FR" },
  { mortCode: "MD2-60", mortuary: "ANITA V. FUNERAL HOMES", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MD2-65", mortuary: "ST. PETER CHAPEL - DIGOS RIZAL", branchCode: "DIGOS", mortClass: "OW" },
  { mortCode: "MD2-68", mortuary: "PALMES FUNERAL HOMES", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MD2-72", mortuary: "ST. PETER CHAPEL - TORIL", branchCode: "TORIL", mortClass: "OW" },
  { mortCode: "MD2-73", mortuary: "ST. PETER CHAPEL - GENSAN", branchCode: "GENSAN", mortClass: "OW" },
  { mortCode: "MD2-84", mortuary: "ST. PETER CHAPEL - CALINAN", branchCode: "CALINA", mortClass: "OW" },
  { mortCode: "MD2-86", mortuary: "ST. PETER CHAPEL - DAVAO, PANACAN", branchCode: "DAVAO", mortClass: "OW" },
  { mortCode: "MD3-01", mortuary: "EVERLASTING PEACE FUNERAL HOMES", branchCode: "CAGAYA", mortClass: "FR" },
  { mortCode: "MD3-02", mortuary: "EVERLASTING PEACE FUNERAL CHAPEL - MANOLO", branchCode: "MALAYB", mortClass: "FR" },
  { mortCode: "MD3-06", mortuary: "PADILLA FUNERAL HOME", branchCode: "BALING", mortClass: "FR" },
  { mortCode: "MD3-10", mortuary: "SAN GUILLERMO FUNERAL PARLOR - CDO", branchCode: "CAGAYA", mortClass: "FR" },
  { mortCode: "MD3-19", mortuary: "SAN GUILLERMO FUNERAL PARLOR - ILIGAN", branchCode: "ILIGAN", mortClass: "FR" },
  { mortCode: "MD3-23", mortuary: "VILLANUEVA FUNERAL HOMES - MALAYBALAY", branchCode: "MALAYB", mortClass: "FR" },
  { mortCode: "MD3-24", mortuary: "EVERLASTING PEACE FUNERAL HOMES", branchCode: "GINGOO", mortClass: "FR" },
  { mortCode: "MD3-26", mortuary: "VILLANUEVA FUNERAL HOMES - VALENCIA", branchCode: "VALENC", mortClass: "FR" },
  { mortCode: "MD3-27", mortuary: "LOPEZ FUNERAL HOMES", branchCode: "CAGAYE", mortClass: "FR" },
  { mortCode: "MD3-28", mortuary: "SAN GUILLERMO FUNERAL PARLOR - GINGOOG", branchCode: "GINGOO", mortClass: "FR" },
  { mortCode: "MD4-06", mortuary: "FUNERARIA CELERIAN - AURORA", branchCode: "PAGADI", mortClass: "FR" },
  { mortCode: "MD4-08", mortuary: "RIVERA FUNERAL HOMES - OZAMIS", branchCode: "OZAMIS", mortClass: "FR" },
  { mortCode: "MD4-19", mortuary: "BASILAN MEMORIAL HOMES", branchCode: "ZAMBOA", mortClass: "FR" },
  { mortCode: "MD4-28", mortuary: "GAMALINDA HAMOY FUNERAL HOMES", branchCode: "DIPOLO", mortClass: "FR" },
  { mortCode: "MD4-36", mortuary: "ST. PETER CHAPEL - PAGADIAN", branchCode: "PAGADI", mortClass: "OW" },
  { mortCode: "MD4-38", mortuary: "R. VILLA-BABAS FUNERAL HOMES", branchCode: "IPIL", mortClass: "FR" },
  { mortCode: "MD4-44", mortuary: "RIVERA FUNERAL HOMES", branchCode: "PAGADI", mortClass: "FR" },
  { mortCode: "MD4-47", mortuary: "SOL YU GAMALINDA FUNERAL HOME - LILOY", branchCode: "IPIL", mortClass: "FR" },
  { mortCode: "MD4-48", mortuary: "CELERIAN FUNERAL HOMES", branchCode: "OZAMIS", mortClass: "FR" },
  { mortCode: "MD4-50", mortuary: "ST. PETER CHAPEL - ZAMBOANGA", branchCode: "ZAMBOA", mortClass: "OW" },
  { mortCode: "MD4-51", mortuary: "RIVERA FUNERAL HOMES - DIPOLOG", branchCode: "DIPOLO", mortClass: "FR" },
  { mortCode: "MD4-60", mortuary: "ST. PETER CHAPEL - IPIL", branchCode: "IPIL", mortClass: "OW" },
  { mortCode: "ME1-00", mortuary: "ST. PETER CHAPEL - BUTUAN", branchCode: "BUTUWE", mortClass: "OW" },
  { mortCode: "ME1-1", mortuary: "ST. PETER CHAPEL - BUTUAN MEGA", branchCode: "BUTUWE", mortClass: "OW" },
  { mortCode: "MET1-00", mortuary: "ST. PETER CHAPEL - SAN FRANCISCO", branchCode: "SANFRA", mortClass: "OW" },
  { mortCode: "MET1-03", mortuary: "ST. PETER CHAPEL - SURIGAO", branchCode: "SURIGA", mortClass: "OW" },
  { mortCode: "MET1-04", mortuary: "ST. PETER CHAPEL - BUTUAN MEGA", branchCode: "BUTUAN", mortClass: "OW" },
  { mortCode: "MET1-04A", mortuary: "ST. PETER CHAPEL - BUTUAN MEGA", branchCode: "BUTUAN", mortClass: "FR" },
  { mortCode: "MET2-1", mortuary: "ST. PETER CHAPEL - LUPON", branchCode: "LUPON", mortClass: "OW" },
  { mortCode: "MET3-00", mortuary: "ST. PETER CHAPEL - KORONADAL", branchCode: "KORONA", mortClass: "OW" },
  { mortCode: "MET3-02", mortuary: "IAN TORREDA FUNERAL HOMES - KABACAN", branchCode: "KABACA", mortClass: "FR" },
  { mortCode: "MET3-03", mortuary: "JUANICO FUNERAL PARLOR", branchCode: "GENSAN", mortClass: "FR" },
  { mortCode: "MET3-04", mortuary: "TORREDA FUNERAL HOMES - MAKILALA", branchCode: "KIDAPA", mortClass: "FR" },
  { mortCode: "MET3-05", mortuary: "ST. PETER CHAPEL - MALITA", branchCode: "MALITA", mortClass: "OW" },
  { mortCode: "MET3-1", mortuary: "VILLA ELISA FUNERAL HOME", branchCode: "MIDSAY", mortClass: "FR" },
  { mortCode: "MET4-01", mortuary: "FUNERARIA VILLA HAGORILES - KULAMAN", branchCode: "TACURO", mortClass: "FR" },
  { mortCode: "MET4-02", mortuary: "FUNERARIA VILLA HAGORILES - LEBAK", branchCode: "MIDSAY", mortClass: "FR" },
  { mortCode: "MET4-03", mortuary: "VILLA ALADINA CASKET FACTORY AND FUNERAL SERVICES", branchCode: "TACURO", mortClass: "FR" },
  { mortCode: "MET4-1", mortuary: "PARANG FUNERAL SERVICES", branchCode: "COTABA", mortClass: "FR" },
  { mortCode: "MIMAROPA1-00", mortuary: "ST. PETER CHAPEL - SAN JOSE, OCC. MINDORO", branchCode: "JOSEOM", mortClass: "OW" },
  { mortCode: "MIMAROPA1-01", mortuary: "ST. PETER CHAPEL - PINAMALAYAN PAPANDAYAN", branchCode: "PINAMA", mortClass: "OW" },
  { mortCode: "MIMAROPA1-1", mortuary: "ST. PETER CHAPEL - MAMBURAO", branchCode: "MAMBUR", mortClass: "OW" },
  { mortCode: "MIMAROPA2-00", mortuary: "ST. PETER CHAPEL - BROOKES POINT", branchCode: "NARRA", mortClass: "OW" },
  { mortCode: "MIMAROPA2-01", mortuary: "ST. PETER CHAPEL - PUERTO PRINCESA BALTAN", branchCode: "ROXAPA", mortClass: "OW" },
  { mortCode: "MIMAROPA2-3", mortuary: "ABELYN SOLIVIO FUNERAL HOMES", branchCode: "ROXAPA", mortClass: "FR" },
  { mortCode: "MIMAROPA3-00", mortuary: "ST. PETER CHAPEL - CABUYAO", branchCode: "STAROS", mortClass: "OW" },
  { mortCode: "MIMAROPA3-1", mortuary: "ST. PETER CHAPEL - CALAMBA", branchCode: "CALAML", mortClass: "OW" },
  { mortCode: "MIMAROPA4-00", mortuary: "ST. PETER CHAPEL - STA. CRUZ, LAGUNA", branchCode: "CRUZLA", mortClass: "OW" },
  { mortCode: "MIMAROPA4-01", mortuary: "RODOLFO SUTAREZ FUNERAL SERVICES", branchCode: "INFANT", mortClass: "FR" },
  { mortCode: "MN2-1", mortuary: "ST. PETER CHAPEL - CDO", branchCode: "CAGAYA", mortClass: "OW" },
  { mortCode: "MO-00", mortuary: "ST. PETER MEMORIAL CHAPEL HO - CREMATION", branchCode: "HO", mortClass: "FR" },
  { mortCode: "MW3-1", mortuary: "ST. PETER CHAPEL - ZAMBOANGA", branchCode: "ZAMBOE", mortClass: "OW" },
  { mortCode: "MWT1-00", mortuary: "SAN GUILLERMO FUNERAL PARLOR - MEDINA", branchCode: "GINGOO", mortClass: "FR" },
  { mortCode: "MWT1-01", mortuary: "ST. PETER CHAPEL - CAMIGUIN", branchCode: "GINGOO", mortClass: "OW" },
  { mortCode: "MWT1-03", mortuary: "ST. PETER CHAPEL - MARAMAG", branchCode: "MARAMA", mortClass: "OW" },
  { mortCode: "MWT1-1", mortuary: "EVERLASTING PEACE FUNERAL CHAPEL - TAGOLOAN", branchCode: "CAGAYE", mortClass: "FR" },
  { mortCode: "MWT2-00", mortuary: "ST. PETER CHAPEL - ALUBIJID", branchCode: "CAGAYA", mortClass: "OW" },
  { mortCode: "MWT2-01", mortuary: "ST. PETER CHAPEL - MARANDING", branchCode: "OZAMIS", mortClass: "OW" },
  { mortCode: "MWT2-02", mortuary: "ST. PETER CHAPEL - ILIGAN MEGA", branchCode: "ILIGAN", mortClass: "OW" },
  { mortCode: "MWT2-1", mortuary: "ST. PETER CHAPEL - OROQUIETA", branchCode: "OROQUI", mortClass: "OW" },
  { mortCode: "MWT3-02", mortuary: "ST. PETER CHAPEL - TANGUB", branchCode: "OZAMIS", mortClass: "OW" },
  { mortCode: "MWT3-03", mortuary: "FUNERARIA CELERIAN - MOLAVE", branchCode: "PAGADI", mortClass: "FR" },
  { mortCode: "MWT3-04", mortuary: "FUNERARIA CELERIAN - SAN MIGUEL", branchCode: "PAGADI", mortClass: "FR" },
  { mortCode: "MWT3-05", mortuary: "FUNERARIA CELERIAN - MARGOSATUBIG", branchCode: "PAGADI", mortClass: "FR" },
  { mortCode: "MWT3-1", mortuary: "ST. PETER CHAPEL - BUUG", branchCode: "CAGAYE", mortClass: "OW" },
  { mortCode: "NCT1-1-1", mortuary: "ST. PETER CHAPEL - ARANETA", branchCode: "STA.ME", mortClass: "OW" },
  { mortCode: "NCT1-1-2", mortuary: "ST. PETER CHAPEL - SAMPALOC", branchCode: "SAMPAL", mortClass: "OW" },
  { mortCode: "NCT1-1-2A", mortuary: "ST. PETER CHAPEL - SAMPALOC", branchCode: "SAMPAL", mortClass: "FR" },
  { mortCode: "NCT1-3-00", mortuary: "ST. PETER CHAPEL - CUBAO", branchCode: "CUBAO", mortClass: "OW" },
  { mortCode: "NCT1-3-1", mortuary: "ST. PETER CHAPEL - LA LOMA", branchCode: "QUEZAV", mortClass: "OW" },
  { mortCode: "NCT1-3-2", mortuary: "ST. PETER CHAPEL - ROOSEVELT", branchCode: "ROOSEV", mortClass: "OW" },
  { mortCode: "NCT1-3-3", mortuary: "ST. PETER MEMORIAL CHAPELS - SCOUTC", branchCode: "SPMCQA", mortClass: "OW" },
  { mortCode: "NCT1-4-1", mortuary: "ST. PETER CHAPEL - COGEO", branchCode: "COGEO", mortClass: "OW" },
  { mortCode: "NCT2-1-01", mortuary: "ST. PETER CHAPEL - MALABON", branchCode: "KALOOK", mortClass: "OW" },
  { mortCode: "NCT2-2-1", mortuary: "ST. PETER CHAPEL - LAS PIÑAS", branchCode: "LAS PI", mortClass: "OW" },
  { mortCode: "NCT2-3-00", mortuary: "ST. PETER CHAPEL - BACOOR", branchCode: "BACOWE", mortClass: "OW" },
  { mortCode: "NCT2-4-00", mortuary: "ST. PETER CHAPEL - KAWIT", branchCode: "CAVITE", mortClass: "OW" },
  { mortCode: "NCT2-4-01", mortuary: "ST. PETER CHAPEL - DASMARIÑAS", branchCode: "DASMAR", mortClass: "OW" },
  { mortCode: "NCT2-4-02", mortuary: "ST. PETER CHAPEL - SILANG", branchCode: "ALFONS", mortClass: "OW" },
  { mortCode: "NCT3-1-0", mortuary: "ST. PETER MEMORIAL CHAPELS - PARANAQUE", branchCode: "PARANA", mortClass: "OW" },
  { mortCode: "NCT3-2-00", mortuary: "ST. PETER CHAPEL - IMUS", branchCode: "IMUS", mortClass: "OW" },
  { mortCode: "NL1-63", mortuary: "NEW FUNERARIA CARINO", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NL1-68", mortuary: "PIMENTEL FUNERAL HOMES", branchCode: "SFLU", mortClass: "FR" },
  { mortCode: "NL1-69", mortuary: "FUNERARIA LLAMAS", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NL1-79", mortuary: "FUNERARIA ROSARIO", branchCode: "SFLU", mortClass: "FR" },
  { mortCode: "NL1-81", mortuary: "ST. PETER CHAPEL - CANDON", branchCode: "CANDON", mortClass: "OW" },
  { mortCode: "NL2-29", mortuary: "LABRADOR FUNERAL PARLOR", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NL2-30", mortuary: "FUNERARIA OANDASAN", branchCode: "TUGUEG", mortClass: "FR" },
  { mortCode: "NL2-31", mortuary: "ST. PETER CHAPEL - TUGUEGARAO", branchCode: "TUGUEG", mortClass: "OW" },
  { mortCode: "NL3-33", mortuary: "STA. TERESA FUNERAL HOME", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NL3-43", mortuary: "FUNERARIA BALUYOT - SUBIC", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NL3-46", mortuary: "OLONGAPO MEMORIAL CHAPEL", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NL3-47", mortuary: "ST. PETER CHAPEL - TARLAC", branchCode: "TARLAC", mortClass: "OW" },
  { mortCode: "NL3-53", mortuary: "ST. PETER CHAPEL - MANGALDAN", branchCode: "DAGUPA", mortClass: "OW" },
  { mortCode: "NL3-54", mortuary: "ST. PETER CHAPEL - BALANGA", branchCode: "BALANG", mortClass: "OW" },
  { mortCode: "NL3-55", mortuary: "ST. PETER CHAPEL - ANGELES", branchCode: "ANGELE", mortClass: "OW" },
  { mortCode: "NL3-56", mortuary: "ST. PETER CHAPEL - ZAMBALES", branchCode: "IBAZAM", mortClass: "OW" },
  { mortCode: "NLC1-00", mortuary: "RPM GOOD SHEPHERD MEMORIAL SERVICES", branchCode: "MALOLO", mortClass: "FR" },
  { mortCode: "NLC1-01", mortuary: "LA CONSOLACION FUNERAL HOMES", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC1-03", mortuary: "ST. PETER CHAPEL - SAN JOSE, NUEVA ECIJA", branchCode: "JOSNUE", mortClass: "OW" },
  { mortCode: "NLC1-05", mortuary: "LADORES FUNERAL SERVICE", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC1-06", mortuary: "RBN FUNERAL CHAPELS & SERVICES-STA. ROSA BRANCH", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC1-09", mortuary: "ST. PETER CHAPEL - SAN ILDEFONSO", branchCode: "SANMIG", mortClass: "OW" },
  { mortCode: "NLC1-1", mortuary: "CALUAG FUNERAL HOMES", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC1-11", mortuary: "ST. PETER CHAPEL - GUIGUINTO", branchCode: "MALOLO", mortClass: "OW" },
  { mortCode: "NLC1-13", mortuary: "ESTRELLA - FAUSTINO FUNERAL SERVICES", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC1-14", mortuary: "RBN FUNERAL AND CHAPEL SERVICES - CABANATUAN", branchCode: "CABANA", mortClass: "FR" },
  { mortCode: "NLC2-00", mortuary: "728 FUNERAL SERVICES", branchCode: "ANGELE", mortClass: "FR" },
  { mortCode: "NLC2-01", mortuary: "HILLSIDE CHAPEL AND MEMORIAL SERVICES (FORMERLY GREENHILLS)", branchCode: "MARIVE", mortClass: "FR" },
  { mortCode: "NLC2-02", mortuary: "FUNERARIA BALUYOT - MORONG", branchCode: "BALANG", mortClass: "FR" },
  { mortCode: "NLC2-03", mortuary: "FUNERARIA BALUYOT - ORANI", branchCode: "BALANG", mortClass: "FR" },
  { mortCode: "NLC2-04", mortuary: "SJB FUNERAL HOME - SAN MARCELINO", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NLC2-05", mortuary: "SJB FUNERAL HOME - SAN FELIPE", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NLC2-06", mortuary: "STA. TERESA FUNERAL HOME", branchCode: "ANGELE", mortClass: "FR" },
  { mortCode: "NLC2-07", mortuary: "STA. MONICA MEMORIAL SERVICE-BABO SACAN PORAC BRANCH", branchCode: "ANGELE", mortClass: "FR" },
  { mortCode: "NLC2-08", mortuary: "PANDACAQUI FUNERAL SERVICES", branchCode: "ANGELE", mortClass: "FR" },
  { mortCode: "NLC2-10", mortuary: "RODRIGUEZ FUNERAL SERVICE", branchCode: "SANFER", mortClass: "FR" },
  { mortCode: "NLC2-11", mortuary: "BLUE CROSS FUNERAL SERVICES", branchCode: "TALAVE", mortClass: "FR" },
  { mortCode: "NLC2-12", mortuary: "CARLO MEMORIAL HOMES", branchCode: "JOSNUE", mortClass: "FR" },
  { mortCode: "NLC4-1", mortuary: "FUNERARIA BALUYOT - OLONGAPO", branchCode: "CRUZZA", mortClass: "FR" },
  { mortCode: "NLE1-00", mortuary: "ST. PETER CHAPEL - BAYOMBONG", branchCode: "SOLANO", mortClass: "OW" },
  { mortCode: "NLE1-02", mortuary: "Funeraria Managuelod", branchCode: "CAUAYA", mortClass: "FR" },
  { mortCode: "NLE1-03", mortuary: "ST. PETER CHAPEL - CAUAYAN", branchCode: "CAUAYA", mortClass: "OW" },
  { mortCode: "NLE1-04", mortuary: "ST. PETER CHAPEL - GATTARAN", branchCode: "GATTAR", mortClass: "OW" },
  { mortCode: "NLE1-06", mortuary: "EDGAR V. CADIZ FUNERAL HOMES - SANTIAGO", branchCode: "SANTIA", mortClass: "FR" },
  { mortCode: "NLE1-1", mortuary: "RM RONDON FUNERAL SERVICES", branchCode: "TUGUEG", mortClass: "FR" },
  { mortCode: "NLE2-00", mortuary: "ST. BERNABE FUNERAL HOMES", branchCode: "SANTIA", mortClass: "FR" },
  { mortCode: "NLE2-01", mortuary: "ST. ANN FUNERAL HOMES", branchCode: "SANTIA", mortClass: "FR" },
  { mortCode: "NLE2-02", mortuary: "ST. PETER CHAPEL - ILAGAN", branchCode: "ILAGAN", mortClass: "OW" },
  { mortCode: "NLE2-1", mortuary: "EDGAR V. CADIZ FUNERAL HOMES - JONES", branchCode: "SANTIA", mortClass: "FR" },
  { mortCode: "NLW1-01", mortuary: "BOBOT FELIX FUNERAL HOMES", branchCode: "CANDON", mortClass: "FR" },
  { mortCode: "NLW1-02", mortuary: "VERA DIOS MEMORIAL HOMES", branchCode: "LAOAG", mortClass: "FR" },
  { mortCode: "NLW1-03", mortuary: "ST. PETER CHAPEL - ABRA", branchCode: "ABRA", mortClass: "OW" },
  { mortCode: "NLW2-00", mortuary: "ST. PETER CHAPEL - SAN FERNANDO, LA UNION", branchCode: "SFLU", mortClass: "OW" },
  { mortCode: "NLW2-1", mortuary: "ST. PETER CHAPEL - BAUANG", branchCode: "SFLU", mortClass: "OW" },
  { mortCode: "NLW3-00", mortuary: "FUNERARIA SAGUN-RIVERA", branchCode: "ALAMIN", mortClass: "FR" },
  { mortCode: "NLW3-02", mortuary: "ST. PETER CHAPEL - SAN CARLOS, PANGASINAN", branchCode: "SNCARL", mortClass: "OW" },
  { mortCode: "NLW3-03", mortuary: "FUNERARIA JESS - BUGALLON", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NLW3-04", mortuary: "ST. PETER CHAPEL - ALAMINOS", branchCode: "ALAMIN", mortClass: "OW" },
  { mortCode: "NLW3-05", mortuary: "BALLIGI FUNERAL HOMES", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NLW3-06", mortuary: "NITO FUNERAL HOMES", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NLW3-07", mortuary: "FUNERARIA JESS - STA. BARBARA", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "NLW3-1", mortuary: "FUNERARIA ESCAÑO", branchCode: "DAGUPA", mortClass: "FR" },
  { mortCode: "SL1-09", mortuary: "SUTAREZ FUNERAL HOMES - SAN PABLO", branchCode: "SANPAB", mortClass: "FR" },
  { mortCode: "SL1-44", mortuary: "KINGSOLOMON FUNERAL INC.", branchCode: "NASUGB", mortClass: "FR" },
  { mortCode: "SL1-46", mortuary: "ST. PETER CHAPEL - INFANTA", branchCode: "INFANT", mortClass: "OW" },
  { mortCode: "SL1-48", mortuary: "ST. PETER CHAPEL - BATANGAS", branchCode: "BATANG", mortClass: "OW" },
  { mortCode: "SL1-49", mortuary: "ST. PETER CHAPEL - TANAUAN", branchCode: "TANAUA", mortClass: "OW" },
  { mortCode: "SL1-49A", mortuary: "ST. PETER CHAPEL - TANAUAN", branchCode: "TANAUA", mortClass: "FR" },
  { mortCode: "SL2-01", mortuary: "FUNERARIA MINDORO", branchCode: "CALAPA", mortClass: "FR" },
  { mortCode: "SL2-03", mortuary: "FUNERARIA MINDORO", branchCode: "PINAMA", mortClass: "FR" },
  { mortCode: "SL2-08", mortuary: "FUNERARIA SAN JOSE", branchCode: "SNJOSE", mortClass: "FR" },
  { mortCode: "SL2-09", mortuary: "OCCIDENTAL MINDORO FUNERAL SERVICES - SABLAYAN", branchCode: "MAMBUR", mortClass: "FR" },
  { mortCode: "SL2-10", mortuary: "OCCIDENTAL MINDORO FUNERAL SERVICES - MAMBURAO", branchCode: "MAMBUR", mortClass: "FR" },
  { mortCode: "SL2-12", mortuary: "S. MARASIGAN JR. FUNERAL SERVICES", branchCode: "PINAMA", mortClass: "FR" },
  { mortCode: "SL2-43", mortuary: "MT. CARMEL FUNERAL SERVICE", branchCode: "ODIONG", mortClass: "FR" },
  { mortCode: "SL2-48", mortuary: "Little Angel Funeral Homes", branchCode: "ODIONG", mortClass: "FR" },
  { mortCode: "SL2-51", mortuary: "FUNERARIA SOLIVIO (FORMERLY J. SOLIVIO FUNERAL HOMES)", branchCode: "ROXAPA", mortClass: "FR" },
  { mortCode: "SL2-52", mortuary: "ST. PETER CHAPEL - CALAPAN", branchCode: "CALAPA", mortClass: "OW" },
  { mortCode: "SL2-53", mortuary: "ST. PETER CHAPEL - BOAC", branchCode: "BOAC", mortClass: "OW" },
  { mortCode: "SL2-54", mortuary: "ST. PETER CHAPEL - ROXAS, OR. MINDORO", branchCode: "BONGAB", mortClass: "OW" },
  { mortCode: "SL3-03", mortuary: "ABELLA FUNERAL HOMES - LUCENA", branchCode: "LUCENA", mortClass: "FR" },
  { mortCode: "SL3-07", mortuary: "FUNERARIA MACALELON", branchCode: "LUCENA", mortClass: "FR" },
  { mortCode: "SL3-08", mortuary: "FUNERARIA GEN. LUNA", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SL3-09", mortuary: "S. SUTAREZ FUNERAL HOMES", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SL3-11", mortuary: "FUNERARIA SUTAREZ", branchCode: "ATIMON", mortClass: "FR" },
  { mortCode: "SL3-12", mortuary: "FUNERARIA ABELLA", branchCode: "GUMACA", mortClass: "FR" },
  { mortCode: "SL3-15", mortuary: "SUTAREZ FUNERAL HOMES - CALAUAG", branchCode: "LOPEZ", mortClass: "FR" },
  { mortCode: "SL3-18", mortuary: "ADEA MEMORIAL HOMES - TALOBATIB", branchCode: "LABO", mortClass: "FR" },
  { mortCode: "SL3-19", mortuary: "DIVINE MEMORIAL SERVICES", branchCode: "DAET", mortClass: "FR" },
  { mortCode: "SL3-20", mortuary: "ST. PETER CHAPEL - GUMACA", branchCode: "GUMACA", mortClass: "OW" },
  { mortCode: "SL3-30", mortuary: "M.B. BECINA FUNERAL HOMES OPC", branchCode: "CANDEL", mortClass: "FR" },
  { mortCode: "SL3-41", mortuary: "ST. PETER CHAPEL - ATIMONAN", branchCode: "ATIMON", mortClass: "OW" },
  { mortCode: "SL3-45", mortuary: "ST. PETER CHAPEL - LOPEZ", branchCode: "LOPEZ", mortClass: "OW" },
  { mortCode: "SL3-49", mortuary: "ABELLA FUNERAL HOMES - AGDANGAN", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SL3-50", mortuary: "ABELLA FUNERAL HOMES - GUMACA", branchCode: "GUMACA", mortClass: "FR" },
  { mortCode: "SL3-53", mortuary: "FUNERARIA MACALELON - MACALELON", branchCode: "ATIMON", mortClass: "FR" },
  { mortCode: "SL3-57", mortuary: "ST. PETER CHAPEL - MAUBAN", branchCode: "LUCBAN", mortClass: "OW" },
  { mortCode: "SL4-01", mortuary: "ST. PETER CHAPEL - NAGA", branchCode: "NAGA", mortClass: "OW" },
  { mortCode: "SL4A-03", mortuary: "T. SALLES MEMORIAL HOME - SIPOCOT", branchCode: "SIPOCO", mortClass: "FR" },
  { mortCode: "SL4A-05", mortuary: "ST. PHILIP AND JAMES FUNERAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "SL4A-06", mortuary: "MARY-MAR FUNERAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "SL4A-07", mortuary: "ST. PETER CHAPEL - IRIGA", branchCode: "IRIGA", mortClass: "OW" },
  { mortCode: "SL4B-03", mortuary: "ST. PETER CHAPEL - TABACO", branchCode: "TABACO", mortClass: "OW" },
  { mortCode: "SL4B-06", mortuary: "FUNERARIA BUGTONG-BORBE", branchCode: "VIRAC", mortClass: "FR" },
  { mortCode: "SL4B-08", mortuary: "ABIOG FUNERAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "SLB1-00", mortuary: "SAAVEDRA MEMORIAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "SLB1-04", mortuary: "NUESTRA SEÑORA DE SALVACION - SORSOGON", branchCode: "SORSOG", mortClass: "FR" },
  { mortCode: "SLB1-05", mortuary: "TRES VIRTUDES FUNERARIA", branchCode: "MASBAT", mortClass: "FR" },
  { mortCode: "SLB1-06", mortuary: "ST. PETER CHAPEL - DONSOL", branchCode: "GUINOB", mortClass: "OW" },
  { mortCode: "SLB1-07", mortuary: "ST. PETER CHAPEL - PILAR", branchCode: "GUINOB", mortClass: "OW" },
  { mortCode: "SLB1-08", mortuary: "J. L. ESPIRITU FUNERAL SERVICE - SAN FERNANDO", branchCode: "LIBMAN", mortClass: "FR" },
  { mortCode: "SLB1-09", mortuary: "PILI MEMORIAL HOMES", branchCode: "NAGA", mortClass: "FR" },
  { mortCode: "SLB1-1", mortuary: "ADEA MEMORIAL HOMES - J. PANGANIBAN", branchCode: "JOSEPA", mortClass: "FR" },
  { mortCode: "SLB1-11", mortuary: "CATAYTAY FUNERAL SERVICES (AROROY)", branchCode: "MASBAT", mortClass: "FR" },
  { mortCode: "SLB2-01", mortuary: "J. L. ESPIRITU FUNERAL SERVICE - PASACAO", branchCode: "LIBMAN", mortClass: "FR" },
  { mortCode: "SLB2-02", mortuary: "ADEA MEMORIAL HOMES - STA. ELENA", branchCode: "JOSEPA", mortClass: "FR" },
  { mortCode: "SLB2-03", mortuary: "ST. PETER CHAPEL - TABUCO NAGA", branchCode: "NAGA", mortClass: "OW" },
  { mortCode: "SLB2-04", mortuary: "T. SALLES MEMORIAL HOME - LIBMANAN", branchCode: "LIBMAN", mortClass: "FR" },
  { mortCode: "SLI1-00", mortuary: "F. MARASIGAN FUNERAL SERVICES", branchCode: "BONGAB", mortClass: "FR" },
  { mortCode: "SLI1-02", mortuary: "ST. PETER CHAPEL - VICTORIA", branchCode: "VICTOR", mortClass: "OW" },
  { mortCode: "SLI1-03", mortuary: "FUNERARIA  R. DIMATULAC", branchCode: "BONGAB", mortClass: "FR" },
  { mortCode: "SLI1-05", mortuary: "OCCIDENTAL MINDORO FUNERAL SERVICES - SAN JOSE", branchCode: "JOSEOM", mortClass: "FR" },
  { mortCode: "SLI1-06", mortuary: "FUNERARIA MINDORO - GLORIA", branchCode: "PINAMA", mortClass: "FR" },
  { mortCode: "SLI1-07", mortuary: "ST. PETER CHAPEL - PINAMALAYAN", branchCode: "PINAMA", mortClass: "OW" },
  { mortCode: "SLI1-1", mortuary: "ST. PETER CHAPEL - STA. CRUZ, MARINDUQUE", branchCode: "BOAC", mortClass: "OW" },
  { mortCode: "SLM1-00", mortuary: "CAGUIMBAL FUNERAL SERVICES", branchCode: "ROSARI", mortClass: "FR" },
  { mortCode: "SLM1-01", mortuary: "DULCE FUNERAL HOME", branchCode: "TANAUA", mortClass: "FR" },
  { mortCode: "SLM1-02", mortuary: "ST. PETER CHAPEL - ROMBLON", branchCode: "ODIONG", mortClass: "OW" },
  { mortCode: "SLM1-03", mortuary: "TRIPLE J FUNERAL SERVICES", branchCode: "ODIONG", mortClass: "FR" },
  { mortCode: "SLM1-04", mortuary: "KING SOLOMON FUNERAL PARLOR - LEMERY", branchCode: "BATANG", mortClass: "FR" },
  { mortCode: "SLM1-05", mortuary: "TDIG FUNERAL HOMES", branchCode: "ODIONG", mortClass: "FR" },
  { mortCode: "SLM1-07", mortuary: "ST. BARTOLOME FUNERAL HOMES", branchCode: "ODIONG", mortClass: "FR" },
  { mortCode: "SLM1-1", mortuary: "HOLY ROSARY FUNERAL HOMES", branchCode: "ROSARI", mortClass: "FR" },
  { mortCode: "SLM2-00", mortuary: "JORIE BALUBAYAN BECINA MEMORIAL SERVICES", branchCode: "CRUZLA", mortClass: "FR" },
  { mortCode: "SLM2-01", mortuary: "BANTING FUNERAL HOMES", branchCode: "CRUZLA", mortClass: "FR" },
  { mortCode: "SLM2-02", mortuary: "TANARTE FUNERAL HOMES", branchCode: "SANPAB", mortClass: "FR" },
  { mortCode: "SLM2-04", mortuary: "FUNERARIA TAYABAS", branchCode: "CRUZLA", mortClass: "FR" },
  { mortCode: "SLM2-1", mortuary: "CORONADO-MONREAL FUNERAL CHAPEL", branchCode: "SANPAB", mortClass: "FR" },
  { mortCode: "SLM3-01", mortuary: "M. F. BARRIOS FUNERAL HOME", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SLM3-03", mortuary: "M.G. SUTAREZ FUNERAL HOMES", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SLM3-04", mortuary: "SUTAREZ - PEÑAFLORIDA FUNERAL HOMES", branchCode: "CATANA", mortClass: "FR" },
  { mortCode: "SLM3-05", mortuary: "FUNERARIA MACALELON - PITOGO", branchCode: "AGDANG", mortClass: "FR" },
  { mortCode: "SLM3-06", mortuary: "LESCANO FUNERAL HOMES", branchCode: "CANDEL", mortClass: "FR" },
  { mortCode: "SLM4-01", mortuary: "ST. PETER CHAPEL - TAGKAWAYAN", branchCode: "LOPEZ", mortClass: "OW" },
  { mortCode: "SLM4-02", mortuary: "SUTAREZ FUNERAL HOMES - GUINAYANGAN", branchCode: "LOPEZ", mortClass: "FR" },
  { mortCode: "SLM4-03", mortuary: "ABELLA FUNERAL HOMES - PAGBILAO", branchCode: "ATIMON", mortClass: "FR" },
  { mortCode: "SLM4-1", mortuary: "ST. PETER CHAPEL - ALABAT", branchCode: "ATIMON", mortClass: "OW" },
  { mortCode: "VC1-1", mortuary: "ST. PETER CHAPEL - MANDAUE MEGA", branchCode: "LAPU-L", mortClass: "OW" },
  { mortCode: "VC1-1A", mortuary: "ST. PETER CHAPEL - MANDAUE MEGA", branchCode: "LAPU-L", mortClass: "FR" },
  { mortCode: "VC2-00", mortuary: "ST. PETER CHAPEL - TALISAY", branchCode: "TALISA", mortClass: "OW" },
  { mortCode: "VC2-1", mortuary: "ST. PETER CHAPEL - DALAGUETE", branchCode: "CARCAR", mortClass: "OW" },
  { mortCode: "VE1-00", mortuary: "ST. PETER CHAPEL - TACLOBAN", branchCode: "TACLOS", mortClass: "OW" },
  { mortCode: "VE1-1", mortuary: "ST. PETER CHAPEL - TACLOBAN MEGA", branchCode: "TACLOS", mortClass: "OW" },
  { mortCode: "VE2-1", mortuary: "ST. PETER CHAPEL - BAYBAY", branchCode: "BAYBAY", mortClass: "OW" },
  { mortCode: "VER1-01", mortuary: "ST. PETER CHAPEL-BORONGAN", branchCode: "BORONG", mortClass: "OW" },
  { mortCode: "VER1-02", mortuary: "SALVACION FUNERAL SERVICES", branchCode: "CALBAY", mortClass: "FR" },
  { mortCode: "VER1-03", mortuary: "FUNERARIA DEL ROSARIO - TAFT", branchCode: "BORONG", mortClass: "FR" },
  { mortCode: "VER1-04", mortuary: "J BONIFES FUNERAL SERVICES", branchCode: "BORONG", mortClass: "FR" },
  { mortCode: "VER2-01", mortuary: "DODONG AMORA FUNERAL HOMES", branchCode: "SOGOD", mortClass: "FR" },
  { mortCode: "VET1-00", mortuary: "GUIUAN FUNERAL SERVICES", branchCode: "BORONG", mortClass: "FR" },
  { mortCode: "VET1-1", mortuary: "ST. PETER CHAPEL - CADIZ", branchCode: "ESCALA", mortClass: "OW" },
  { mortCode: "VET2-00", mortuary: "ST. PETER CHAPEL - PALOMPON", branchCode: "PALOMP", mortClass: "OW" },
  { mortCode: "VET2-01", mortuary: "ST. PETER CHAPEL - TACLOBAN MEGA", branchCode: "TACLOB", mortClass: "OW" },
  { mortCode: "VET2-02", mortuary: "ST. PETER CHAPEL - HILONGOS", branchCode: "BAYBAY", mortClass: "OW" },
  { mortCode: "VET2-1", mortuary: "BABAC FUNERAL HOME - SAN DIONISIO", branchCode: "PASSI", mortClass: "FR" },
  { mortCode: "VET3-00", mortuary: "MOTHER OF PERPETUAL HELP FUNERAL HOMES", branchCode: "CARCAR", mortClass: "FR" },
  { mortCode: "VET3-01", mortuary: "ST. PETER CHAPEL - CEBU MEGA", branchCode: "CEBU", mortClass: "OW" },
  { mortCode: "VS1-02", mortuary: "MANTILLA FUNERAL HOMES", branchCode: "SOGOD", mortClass: "FR" },
  { mortCode: "VS1-41", mortuary: "FUNERARIA DEL ROSARIO - PALAPAG", branchCode: "CATARM", mortClass: "FR" },
  { mortCode: "VS1-49", mortuary: "BARCELO FUNERAL HOMES", branchCode: "TACLOB", mortClass: "FR" },
  { mortCode: "VS1-52", mortuary: "ST. PETER CHAPEL - TACLOBAN", branchCode: "TACLOB", mortClass: "OW" },
  { mortCode: "VS1-55", mortuary: "ST. PETER CHAPEL - ORMOC", branchCode: "ORMOC", mortClass: "OW" },
  { mortCode: "VS1-56", mortuary: "ST. PETER CHAPEL - MAASIN", branchCode: "MAASIN", mortClass: "OW" },
  { mortCode: "VS1-59", mortuary: "ST. PETER CHAPEL - NAVAL", branchCode: "NAVAL", mortClass: "OW" },
  { mortCode: "VS1-60", mortuary: "ST. PETER CHAPEL - CATBALOGAN", branchCode: "CATBAL", mortClass: "OW" },
  { mortCode: "VS1-61", mortuary: "ST. PETER CHAPEL - SOGOD", branchCode: "SOGOD", mortClass: "OW" },
  { mortCode: "VS1-62", mortuary: "ST. PETER CHAPEL - CALBAYOG", branchCode: "CALBAY", mortClass: "OW" },
  { mortCode: "VS1-63", mortuary: "SAN JOSE FUNERALS", branchCode: "SOGOD", mortClass: "FR" },
  { mortCode: "VS2-01", mortuary: "ST. PETER CHAPEL - CEBU", branchCode: "CEBU", mortClass: "OW" },
  { mortCode: "VS2-03", mortuary: "ST. PETER CHAPEL - TOLEDO", branchCode: "TOLEDO", mortClass: "OW" },
  { mortCode: "VS2-05", mortuary: "ST. PETER CHAPEL - CARCAR", branchCode: "CARCAR", mortClass: "OW" },
  { mortCode: "VS2-07", mortuary: "ST. PETER CHAPEL - BOGO", branchCode: "BOGO", mortClass: "OW" },
  { mortCode: "VS2-08", mortuary: "ST. PETER CHAPEL - BANTAYAN", branchCode: "BOGO", mortClass: "OW" },
  { mortCode: "VS2-10", mortuary: "HOLY FUNERAL HOMES", branchCode: "TOLEDO", mortClass: "FR" },
  { mortCode: "VS2-14", mortuary: "MANIPIS FUNERAL HOMES", branchCode: "DANAO", mortClass: "FR" },
  { mortCode: "VS2-20", mortuary: "ST. PETER CHAPEL - DANAO", branchCode: "DANAO", mortClass: "OW" },
  { mortCode: "VS2-22", mortuary: "ST. PETER CHAPEL - MOALBOAL", branchCode: "TOLEDO", mortClass: "OW" },
  { mortCode: "VS2-23", mortuary: "ST. PETER CHAPEL - DAAN BANTAYAN", branchCode: "DANAO", mortClass: "OW" },
  { mortCode: "VS2-24", mortuary: "ST. PETER CHAPEL - CARCAR MEGA", branchCode: "CARCAR", mortClass: "OW" },
  { mortCode: "VS3-07", mortuary: "FUNERARIA DE AGNOBIS", branchCode: "DUMAGU", mortClass: "FR" },
  { mortCode: "VS3-19", mortuary: "SIATON FUNERAL HOMES", branchCode: "DUMAGU", mortClass: "FR" },
  { mortCode: "VS3-20", mortuary: "ST. PETER CHAPEL - DUMAGUETE", branchCode: "DUMAGU", mortClass: "OW" },
  { mortCode: "VS3-21", mortuary: "ST. PETER CHAPEL - TAGBILARAN", branchCode: "TAGBIL", mortClass: "OW" },
  { mortCode: "VS3-22", mortuary: "ST. PETER CHAPEL - CARMEN", branchCode: "TUBIGO", mortClass: "OW" },
  { mortCode: "VS3-24", mortuary: "ST. PETER CHAPEL - TALIBON", branchCode: "TALIBO", mortClass: "OW" },
  { mortCode: "VS3-25", mortuary: "ST. PETER CHAPEL - JAGNA", branchCode: "TAGBIL", mortClass: "OW" },
  { mortCode: "VS3-25A", mortuary: "ST. PETER CHAPEL - JAGNA", branchCode: "TAGBIL", mortClass: "FR" },
  { mortCode: "VS3-26", mortuary: "ST. PETER CHAPEL - BAYAWAN", branchCode: "DUMAGU", mortClass: "OW" },
  { mortCode: "VS3-27", mortuary: "ST. PETER CHAPEL - TUBIGON", branchCode: "TUBIGO", mortClass: "OW" },
  { mortCode: "VS3-28", mortuary: "AYA MEMORIAL CHAPELS, INC.", branchCode: "ESCALA", mortClass: "FR" },
  { mortCode: "VS4-18", mortuary: "JOSE DE OTOY SOLIVIO, JR. FUNERAL HOMES", branchCode: "ILOILO", mortClass: "FR" },
  { mortCode: "VS4-61", mortuary: "BABAC FUNERAL HOME - BAROTAC VIEJO", branchCode: "SARA", mortClass: "FR" },
  { mortCode: "VS4-63", mortuary: "ST. PETER CHAPEL - KABANKALAN", branchCode: "KABANK", mortClass: "OW" },
  { mortCode: "VS4-64", mortuary: "ST. PETER CHAPEL - BACOLOD", branchCode: "BACOLO", mortClass: "OW" },
  { mortCode: "VS4-66", mortuary: "ST. PETER CHAPEL - ANTIQUE", branchCode: "JOSEAN", mortClass: "OW" },
  { mortCode: "VS4-67", mortuary: "ST. PETER CHAPEL - ILOILO", branchCode: "ILOILO", mortClass: "OW" },
  { mortCode: "VS4-68", mortuary: "ST. PETER CHAPEL - ROXAS", branchCode: "ROXAKA", mortClass: "OW" },
  { mortCode: "VS4-70", mortuary: "ST. PETER CHAPEL - KALIBO", branchCode: "KALIBO", mortClass: "OW" },
  { mortCode: "VW1-1-00", mortuary: "ST. PETER CHAPEL - PONTEVEDRA", branchCode: "HINIGA", mortClass: "OW" },
  { mortCode: "VW1-1-1", mortuary: "ST. PETER CHAPEL - BACOLOD", branchCode: "BACALI", mortClass: "OW" },
  { mortCode: "VW1-2-1", mortuary: "ST. PETER CHAPEL - BAIS", branchCode: "TANJAY", mortClass: "OW" },
  { mortCode: "VW2-1-00", mortuary: "ST. PETER CHAPEL - ILOILO MANDURIAO", branchCode: "ILOILO", mortClass: "OW" },
  { mortCode: "VW2-1-1", mortuary: "ST. PETER CHAPEL - BALASAN", branchCode: "SARA", mortClass: "OW" },
  { mortCode: "VWT1-00", mortuary: "ST. PETER CHAPEL - ESCALANTE", branchCode: "ESCALA", mortClass: "OW" },
  { mortCode: "VWT1-01", mortuary: "ST. PETER CHAPEL - SAN CARLOS, NEGROS", branchCode: "CARLNO", mortClass: "OW" },
  { mortCode: "VWT1-02", mortuary: "ST. PETER CHAPEL - GUIHULNGAN", branchCode: "CARLNO", mortClass: "OW" },
  { mortCode: "VWT1-03", mortuary: "ST. PETER CHAPEL - SIPALAY", branchCode: "KABANK", mortClass: "OW" },
  { mortCode: "VWT1-1", mortuary: "ST. PETER CHAPEL - CATARMAN", branchCode: "CATARM", mortClass: "OW" },
  { mortCode: "VWT3-00", mortuary: "ST. PETER CHAPEL - GUIMARAS", branchCode: "ILOILO", mortClass: "OW" },
  { mortCode: "VWT3-1", mortuary: "ST. PETER CHAPEL - PASSI", branchCode: "PASSI", mortClass: "OW" },
  { mortCode: "VWT4-1", mortuary: "ST. PETER CHAPEL - IBAJAY", branchCode: "KALIBO", mortClass: "OW" },
];

/* ========================== RefCreditOfService ========================== */
//
// THE ROWS LANDED ON 2026-08-25, and there are four of them. This table was
// empty from the 2026-08-17 structure drop until then — the table was known, its
// values were not, and this layer does not invent codes for a reference list
// whose values are quoted back at the source system.
//
// THE VALUE IS ITS OWN ID, and that is the one judgement call. The drop gives
// four VALUES and no codes, and `RefCreditOfService` has both columns; putting
// "1"/"2"/"3"/"4" in the key would be exactly the invention the empty seed was
// avoiding. So the id is the value — which is also what gets written to
// `TblClaimsSP.CreditOfService`, a text column, so nothing is lost. If real
// codes turn up, this is the one place they go in.

export const refCreditOfServiceSeed: RefCreditOfServiceRecord[] = [
  { creditOfServiceId: "1ST POINT", creditOfServiceDesc: "1ST POINT", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { creditOfServiceId: "2ND POINT", creditOfServiceDesc: "2ND POINT", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { creditOfServiceId: "CREM ONLY", creditOfServiceDesc: "CREM ONLY", auditUser: AUDIT.user, auditDate: AUDIT.date },
  { creditOfServiceId: "REGULAR", creditOfServiceDesc: "REGULAR", auditUser: AUDIT.user, auditDate: AUDIT.date },
];

/* ============================== RefPayClass ============================== */

export const refPayClassSeed: RefPayClassRecord[] = [
  { payClassCode: "DC", description: "DEFFERED COLLECTION", payFor: "PLAN", minAmount: 0, isActive: true },
  { payClassCode: "NS", description: "NEW SALE", payFor: "PLAN", minAmount: 0, isActive: true },
  { payClassCode: "OC", description: "OTHER COLLECTION", payFor: "", minAmount: 0, isActive: true },
  { payClassCode: "PF", description: "PROCESSING FEE", payFor: "", minAmount: 50, isActive: true },
];

/* ================================ Payment ================================ */
//
// A plan's payment ledger is always 1 New Sale (NS) followed by Deferred
// Collections (DC), one per installment paid. Each OR is exactly the plan's
// installment amount, and the count matches the plan holder's InstNo — so the
// payments sum to the plan's TotalAmountPaid. ORNo = 8-digit sequence + branch.

/** The servicing branch that collects each plan's payments (by LPA number). */
const PLAN_BRANCH: Record<string, string> = {
  L21000456B: "QCITY",
  L19000567C: "CEBU",
  L25000123I: "MANILA",
  L23000012H: "BATANGAS",
  L26000901M: "DAVAO",
  L20000234A: "ILOILO",
  L24000345D: "SANFER",
  L25000678E: "MANILA",
  L22000333L: "BAGUIO",
  L26000789F: "NAGA",
  L18000890G: "LUCENA",
  L21000111J: "VIGAN",
  L25000444M: "CDO",
  L20000222K: "ANGELES",
  L26000555N: "TACLOBAN",
  // The showcase plan holder's three plans, all serviced by her home branch.
  L20000700X: "QCITY",
  L23000701Y: "QCITY",
  L18000702Z: "QCITY",
};

/** ISO date `n` whole months after `iso`, computed in UTC to avoid TZ drift. */
function addMonthsISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}

let orCounter = 0;

/** Build a plan's payment ledger: 1 NS then (InstNo − 1) DC, monthly. */
function buildPayments(ph: PlanholderRecord): PaymentRecord[] {
  const pt = planTypeSeed.find((p) => p.planCode === ph.planCode);
  if (!pt) throw new Error(`Unknown plan code: ${ph.planCode}`);
  const branchCode = PLAN_BRANCH[ph.lpaNo] ?? "QCITY";
  const rows: PaymentRecord[] = [];
  for (let i = 0; i < ph.instNo; i++) {
    orCounter += 1;
    rows.push({
      orNo: String(orCounter).padStart(8, "0") + branchCode,
      lpaNo: ph.lpaNo,
      payClassId: i === 0 ? "NS" : "DC",
      orDate: addMonthsISO(ph.effectivityDate.slice(0, 10), i),
      amount: pt.instAmt,
      branchCode,
    });
  }
  return rows;
}

export const paymentSeed: PaymentRecord[] = planholderSeed.flatMap(buildPayments);
