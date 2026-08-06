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
//                           e.g. NCT2-2DC26009785
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
  type RefPayClassRecord,
  type RefPayoutChannelRecord,
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

/** Branch + territory pairs, so a generated claim no matches its branch. */
const BULK_BRANCH = [
  { code: "QCITY", territory: "NCT2-2" },
  { code: "CEBU", territory: "VW1-2" },
  { code: "DAVAO", territory: "MW1" },
  { code: "BAGUIO", territory: "NL1" },
  { code: "ILOILO", territory: "VW1-2" },
  { code: "NAGA", territory: "MIMAROPA2" },
  { code: "CDO", territory: "MW1" },
  { code: "MANILA", territory: "NCT2-2" },
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

  const planholder: PlanholderRecord = {
    lpaNo,
    personId,
    ...planFigures(BULK_PLAN[seq % BULK_PLAN.length], 12 + (seq % 48)),
    accountClass: "R",
    acctStatCode: seq % 5 === 0 ? "LP" : "AC",
    termiStatCode: "",
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
];

/* ============================== Planholder ============================== */

export const planholderSeed: PlanholderRecord[] = [
  { lpaNo: "L21000456B", personId: "P-001", ...planFigures("B5M10", 52), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2021-05-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L19000567C", personId: "P-002", ...planFigures("A5M", 40), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-03-15", effectivityDate: "2019-02-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-02-15", ...PH_AUDIT },
  { lpaNo: "L25000123I", personId: "P-003", ...planFigures("RA5M5", 9), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-10", effectivityDate: "2025-09-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L23000012H", personId: "P-004", ...planFigures("NF5M4", 30), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-04-20", effectivityDate: "2023-01-20", isServiceOnly: false, riDate: "2024-06-20", lastPaymentDate: "2026-03-20", ...PH_AUDIT },
  { lpaNo: "L26000901M", personId: "P-005", ...planFigures("C5M8", 5), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2026-02-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L20000234A", personId: "P-006", ...planFigures("RC5M4", 58), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-05", effectivityDate: "2020-08-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  { lpaNo: "L24000345D", personId: "P-007", ...planFigures("D5M9", 27), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-15", effectivityDate: "2024-03-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L25000678E", personId: "P-008", ...planFigures("RF5M8", 8), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-20", effectivityDate: "2025-11-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  { lpaNo: "L22000333L", personId: "P-009", ...planFigures("RD5M5", 38), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-05-10", effectivityDate: "2022-06-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-04-10", ...PH_AUDIT },
  { lpaNo: "L26000789F", personId: "P-010", ...planFigures("B5M10", 6), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-05", effectivityDate: "2026-01-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  { lpaNo: "L18000890G", personId: "P-011", ...planFigures("LG7M13", 60), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2018-04-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L21000111J", personId: "P-012", ...planFigures("A5M", 45), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-06-30", effectivityDate: "2021-09-30", isServiceOnly: false, riDate: "2023-01-30", lastPaymentDate: "2026-05-30", ...PH_AUDIT },
  { lpaNo: "L25000444M", personId: "P-013", ...planFigures("RA5M5", 6), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2025-12-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L20000222K", personId: "P-014", ...planFigures("RC5M4", 60), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-14", effectivityDate: "2020-02-14", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-14", ...PH_AUDIT },
  { lpaNo: "L26000555N", personId: "P-015", ...planFigures("F5MDS", 4), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-20", effectivityDate: "2026-03-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  // Plan holders behind the endorsed ("For Approval") death claims below.
  { lpaNo: "L26000601P", personId: "P-031", ...planFigures("A5M", 24), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2024-05-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L26000602Q", personId: "P-032", ...planFigures("RC5M4", 30), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-05", effectivityDate: "2023-06-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-05", ...PH_AUDIT },
  { lpaNo: "L26000603R", personId: "P-033", ...planFigures("B5M10", 40), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-10", effectivityDate: "2022-03-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L26000604S", personId: "P-034", ...planFigures("D5M9", 33), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-15", effectivityDate: "2023-09-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L26000605T", personId: "P-035", ...planFigures("RF5M8", 20), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-20", effectivityDate: "2024-11-20", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-20", ...PH_AUDIT },
  // Second plans — the same person on more than one LPA. A plan holder buying
  // another plan is ordinary, and these are what the "Other Plans" section on
  // the plan holder page lists.
  { lpaNo: "L22000777U", personId: "P-001", ...planFigures("A5M", 44), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2022-07-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  { lpaNo: "L24000888V", personId: "P-004", ...planFigures("C5M8", 26), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-10", effectivityDate: "2024-02-10", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-10", ...PH_AUDIT },
  { lpaNo: "L26000999W", personId: "P-011", ...planFigures("RA5M5", 7), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-06-05", effectivityDate: "2025-12-05", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-05-05", ...PH_AUDIT },
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
  { lpaNo: "L20000700X", personId: "P-041", ...planFigures("RA5M5", 58), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-15", effectivityDate: "2020-06-15", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-15", ...PH_AUDIT },
  { lpaNo: "L23000701Y", personId: "P-041", ...planFigures("C5M8", 41), accountClass: "R", acctStatCode: "AC", termiStatCode: "", dueDate: "2026-08-01", effectivityDate: "2023-03-01", isServiceOnly: false, riDate: null, lastPaymentDate: "2026-07-01", ...PH_AUDIT },
  // The third plan lapsed and was reinstated once before lapsing again — which
  // is why the death claim filed against it below was denied.
  { lpaNo: "L18000702Z", personId: "P-041", ...planFigures("A5M", 45), accountClass: "R", acctStatCode: "LP", termiStatCode: "", dueDate: "2026-02-01", effectivityDate: "2018-11-01", isServiceOnly: false, riDate: "2021-02-01", lastPaymentDate: "2026-01-01", ...PH_AUDIT },
  // The plans behind the bulk claims — see "Bulk claim volume" above.
  ...bulkPlanholders,
];

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
  { claimNo: "NCT2-2DC26009785", claimRequest: "CLQCITY2026CAB000001", auditUser: PROCESSOR, auditDate: "2026-04-18T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-04-19T09:00:00", benefits: "CAB" },
  { claimNo: "VW1-2DC26009786", claimRequest: "CLCEBU2026CAB000002", auditUser: PROCESSOR, auditDate: "2026-05-02T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT2-2DC26009787", claimRequest: "CLMANILA2026CAB000003", auditUser: PROCESSOR, auditDate: "2026-05-19T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "MIMAROPA2DC26009788", claimRequest: "CLBATANGAS2026ECAB000004", auditUser: PROCESSOR, auditDate: "2026-05-04T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ECAB" },
  { claimNo: "VW1-2DC26009789", claimRequest: "CLILOILO2026CAB000005", auditUser: PROCESSOR, auditDate: "2026-03-28T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NL1DC26009790", claimRequest: "CLSANFER2026CAB000006", auditUser: PROCESSOR, auditDate: "2026-04-05T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT2-2DC26009791", claimRequest: "CLMANILA2026CAB000007", auditUser: PROCESSOR, auditDate: "2026-04-22T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "MIMAROPA2DC26009792", claimRequest: "CLNAGA2026CAB000008", auditUser: PROCESSOR, auditDate: "2026-05-01T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "MIMAROPA2DC26009793", claimRequest: "CLLUCENA2026USB000009", auditUser: PROCESSOR, auditDate: "2026-05-08T09:00:00", isQuitClaim: false, isVerified: false, benefits: "USB" },
  { claimNo: "NL1DC26009794", claimRequest: "CLVIGAN2026CAB000010", auditUser: PROCESSOR, auditDate: "2026-05-11T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NL1DC26009795", claimRequest: "CLANGELES2026CAB000011", auditUser: PROCESSOR, auditDate: "2026-05-16T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "MW1DC26009796", claimRequest: "CLDAVAO2026ADB000012", auditUser: PROCESSOR, auditDate: "2026-05-13T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "NL1DC26009797", claimRequest: "CLBAGUIO2026ADB000013", auditUser: PROCESSOR, auditDate: "2026-04-27T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "MW1DC26009798", claimRequest: "CLCDO2026ADB000014", auditUser: PROCESSOR, auditDate: "2026-05-06T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  { claimNo: "VW1-2DC26009799", claimRequest: "CLTACLOBAN2026ADB000015", auditUser: PROCESSOR, auditDate: "2026-05-20T09:00:00", isQuitClaim: false, isVerified: false, benefits: "ADB" },
  // Verified & endorsed to the supervisor — awaiting approval (status FA on the request).
  { claimNo: "NCT2-2DC26009800", claimRequest: "CLQCITY2026CAB000016", auditUser: PROCESSOR, auditDate: "2026-06-10T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-11T09:00:00", benefits: "CAB" },
  { claimNo: "VW1-2DC26009801", claimRequest: "CLCEBU2026CAB000017", auditUser: PROCESSOR, auditDate: "2026-06-18T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-19T09:00:00", benefits: "CAB" },
  { claimNo: "NCT2-2DC26009802", claimRequest: "CLMANILA2026ECAB000018", auditUser: PROCESSOR, auditDate: "2026-06-25T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-06-26T09:00:00", benefits: "ECAB" },
  { claimNo: "MW1DC26009803", claimRequest: "CLDAVAO2026ADB000019", auditUser: PROCESSOR, auditDate: "2026-07-02T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-03T09:00:00", benefits: "ADB" },
  { claimNo: "VW1-2DC26009804", claimRequest: "CLILOILO2026CAB000020", auditUser: PROCESSOR, auditDate: "2026-07-08T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-09T09:00:00", benefits: "CAB" },
  // The showcase plan holder's three death claims. The pending one carries a
  // header too — not because a processor has opened it, but because that is
  // what joins the request to its payee (see `payeeRecordsForRequest`); it is
  // unverified, and the UI shows the reference until a claim no is issued.
  { claimNo: "NCT2-2DC26009810", claimRequest: "CLQCITY2026CAB000406", auditUser: PROCESSOR, auditDate: "2026-07-14T09:00:00", isQuitClaim: false, isVerified: false, benefits: "CAB" },
  { claimNo: "NCT2-2DC26009811", claimRequest: "CLQCITY2026CAB000407", auditUser: PROCESSOR, auditDate: "2026-07-15T09:00:00", isQuitClaim: false, isVerified: true, verifiedBy: PROCESSOR, verifiedDate: "2026-07-16T10:15:00", benefits: "CAB" },
  { claimNo: "NCT2-2DC26009812", claimRequest: "CLQCITY2026USB000409", auditUser: "Diana Lim", auditDate: "2026-07-16T09:30:00", isQuitClaim: false, isVerified: true, verifiedBy: "Diana Lim", verifiedDate: "2026-07-17T08:40:00", benefits: "USB" },
  // Headers for the bulk claims past "pending" — the ones with a claim no.
  ...bulkHeaders,
];

/* ============================== ClaimsPayee ============================== */

// One payee row per death claim — the person(s) claiming that ClaimNo. A claim
// can name a second (joint) payee via payeeTwoId.
export const claimsPayeeSeed: ClaimsPayeeRecord[] = [
  { idx: 1, claimNo: "NCT2-2DC26009785", payeeOneId: "P-016", payeeTwoId: "P-028", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 2, claimNo: "VW1-2DC26009786", payeeOneId: "P-018", amount: 56000, relation: "Child", isOnHold: false },
  { idx: 3, claimNo: "NCT2-2DC26009787", payeeOneId: "P-017", amount: 165000, relation: "Spouse", isOnHold: true, remarks: "Payment held — awaiting valid ID of claimant." },
  { idx: 4, claimNo: "MIMAROPA2DC26009788", payeeOneId: "P-019", amount: 105000, relation: "Child", isOnHold: false },
  { idx: 5, claimNo: "VW1-2DC26009789", payeeOneId: "P-020", amount: 85000, relation: "Spouse", isOnHold: false },
  { idx: 6, claimNo: "NL1DC26009790", payeeOneId: "P-021", amount: 60000, relation: "Child", isOnHold: false },
  { idx: 7, claimNo: "NCT2-2DC26009791", payeeOneId: "P-022", amount: 100000, relation: "Spouse", isOnHold: false },
  { idx: 8, claimNo: "MIMAROPA2DC26009792", payeeOneId: "P-023", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 9, claimNo: "MIMAROPA2DC26009793", payeeOneId: "P-024", amount: 57000, relation: "Child", isOnHold: false },
  { idx: 10, claimNo: "NL1DC26009794", payeeOneId: "P-025", amount: 56000, relation: "Child", isOnHold: false },
  { idx: 11, claimNo: "NL1DC26009795", payeeOneId: "P-026", amount: 85000, relation: "Spouse", isOnHold: false },
  { idx: 12, claimNo: "MW1DC26009796", payeeOneId: "P-027", payeeTwoId: "P-029", amount: 80000, relation: "Parent", isOnHold: true, remarks: "Payout on hold pending settlement of prior dismemberment claims." },
  { idx: 13, claimNo: "NL1DC26009797", payeeOneId: "P-028", amount: 60000, relation: "Child", isOnHold: false },
  { idx: 14, claimNo: "MW1DC26009798", payeeOneId: "P-029", amount: 165000, relation: "Parent", isOnHold: false },
  { idx: 15, claimNo: "VW1-2DC26009799", payeeOneId: "P-030", amount: 12500, relation: "Parent", isOnHold: false },
  // Payees on the endorsed (For Approval) death claims.
  { idx: 16, claimNo: "NCT2-2DC26009800", payeeOneId: "P-016", amount: 56000, relation: "Spouse", isOnHold: false },
  { idx: 17, claimNo: "VW1-2DC26009801", payeeOneId: "P-018", amount: 85000, relation: "Child", isOnHold: false },
  { idx: 18, claimNo: "NCT2-2DC26009802", payeeOneId: "P-022", amount: 125000, relation: "Spouse", isOnHold: false },
  { idx: 19, claimNo: "MW1DC26009803", payeeOneId: "P-027", amount: 60000, relation: "Parent", isOnHold: false },
  { idx: 20, claimNo: "VW1-2DC26009804", payeeOneId: "P-020", amount: 100000, relation: "Spouse", isOnHold: false },
  // The showcase plan holder's claims. The main plan is claimed JOINTLY by the
  // widower and the elder child — the two-payee case — and the denied claim on
  // the lapsed plan is on hold with the reason on the record.
  { idx: 21, claimNo: "NCT2-2DC26009810", payeeOneId: "P-042", payeeTwoId: "P-043", amount: 165000, relation: "Spouse", isOnHold: false },
  { idx: 22, claimNo: "NCT2-2DC26009811", payeeOneId: "P-042", amount: 80000, relation: "Spouse", isOnHold: false },
  { idx: 23, claimNo: "NCT2-2DC26009812", payeeOneId: "P-043", amount: 56000, relation: "Child", isOnHold: true, remarks: "Plan lapsed as of due date 01 Feb 2026 — claim denied, release suspended." },
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
  { idx: 12, lpaNo: "L20000700X", value: "Installment for Jul 2026 collected 15 Jul 2026. Account current, 58 of 60 installments paid.", auditUser: "Diana Lim", auditDate: "2026-07-15T11:05:00" },
  { idx: 13, lpaNo: "L20000700X", value: "Plan holder reported deceased 06 Jul 2026. Collection stopped pending the death claim.", auditUser: PROCESSOR, auditDate: "2026-07-14T08:10:00" },
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

export const branchSeed: BranchRecord[] = [
  { branchCode: "ESTORE", territoryCode: "NCT2", regionCode: "NCR", description: "E-Store Branch", address: "Makati City, Metro Manila", contactNo: "(02) 8888 0000", email: "estore@stpeter.com.ph" },
  { branchCode: "QCITY", territoryCode: "NCT2", regionCode: "NCR", description: "Quezon City Branch", address: "Quezon City, Metro Manila", contactNo: "(02) 8888 0001", email: "qcity@stpeter.com.ph" },
  { branchCode: "MANILA", territoryCode: "NCT1", regionCode: "NCR", description: "Manila Branch", address: "Manila, Metro Manila", contactNo: "(02) 8888 0002", email: "manila@stpeter.com.ph" },
  { branchCode: "CEBU", territoryCode: "VW1", regionCode: "R7", description: "Cebu City Branch", address: "Cebu City, Cebu", contactNo: "(032) 253 0003", email: "cebu@stpeter.com.ph" },
  { branchCode: "BATANGAS", territoryCode: "STL2", regionCode: "R4A", description: "Batangas City Branch", address: "Batangas City, Batangas", contactNo: "(043) 300 0004", email: "batangas@stpeter.com.ph" },
  { branchCode: "DAVAO", territoryCode: "MW1", regionCode: "R11", description: "Davao City Branch", address: "Davao City, Davao del Sur", contactNo: "(082) 300 0005", email: "davao@stpeter.com.ph" },
  { branchCode: "ILOILO", territoryCode: "VW1", regionCode: "R6", description: "Iloilo City Branch", address: "Iloilo City, Iloilo", contactNo: "(033) 300 0006", email: "iloilo@stpeter.com.ph" },
  { branchCode: "SANFER", territoryCode: "NL1", regionCode: "R3", description: "San Fernando Branch", address: "San Fernando, Pampanga", contactNo: "(045) 300 0007", email: "sanfer@stpeter.com.ph" },
  { branchCode: "BAGUIO", territoryCode: "NL1", regionCode: "CAR", description: "Baguio City Branch", address: "Baguio City, Benguet", contactNo: "(074) 300 0008", email: "baguio@stpeter.com.ph" },
  { branchCode: "NAGA", territoryCode: "STL3", regionCode: "R5", description: "Naga City Branch", address: "Naga City, Camarines Sur", contactNo: "(054) 300 0009", email: "naga@stpeter.com.ph" },
  { branchCode: "LUCENA", territoryCode: "STL2", regionCode: "R4A", description: "Lucena City Branch", address: "Lucena City, Quezon", contactNo: "(042) 300 0010", email: "lucena@stpeter.com.ph" },
  { branchCode: "VIGAN", territoryCode: "NL2", regionCode: "R1", description: "Vigan Branch", address: "Vigan, Ilocos Sur", contactNo: "(077) 300 0011", email: "vigan@stpeter.com.ph" },
  { branchCode: "CDO", territoryCode: "MW1", regionCode: "R10", description: "Cagayan de Oro Branch", address: "Cagayan de Oro, Misamis Oriental", contactNo: "(088) 300 0012", email: "cdo@stpeter.com.ph" },
  { branchCode: "ANGELES", territoryCode: "NL1", regionCode: "R3", description: "Angeles City Branch", address: "Angeles City, Pampanga", contactNo: "(045) 300 0013", email: "angeles@stpeter.com.ph" },
  { branchCode: "TACLOBAN", territoryCode: "VW2", regionCode: "R8", description: "Tacloban City Branch", address: "Tacloban City, Leyte", contactNo: "(053) 300 0014", email: "tacloban@stpeter.com.ph" },
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
