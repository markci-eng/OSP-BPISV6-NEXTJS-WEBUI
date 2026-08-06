import type { CofpMemo, CofpRequest, CofpStatus } from "./types";

// Weighted so every status card has records to show, with the printing
// pipeline (for printing → printed → released) dominating the way it does in
// real certificate volume. The length is kept coprime with the branch list so
// statuses stay spread across branches instead of clustering in one.
const STATUS_CYCLE: CofpStatus[] = [
  "FOR_PRINTING",
  "PRINTED",
  "RELEASED",
  "FOR_PRINTING",
  "PRINTED",
  "CANCELLED",
  "RELEASED",
  "CONFISCATED",
  "FOR_PRINTING",
  "RETURNED",
  "PRINTED",
];

const REQUESTERS = [
  "Grae Sensano",
  "Bryan Dalagdag",
  "Mark Ibe",
  "Jerome Jardio",
  "Jimwell Ocsio",
];

// Names are combined from two pools of co-prime length so a few hundred rows
// keep producing fresh planholders instead of repeating every handful.
const FIRST_NAMES = [
  "Rosario",
  "Fernando",
  "Cristina",
  "Ramon",
  "Beatriz",
  "Emmanuel",
  "Leticia",
  "Alfredo",
  "Marisol",
  "Teodoro",
  "Milagros",
  "Rogelio",
  "Consuelo",
];

const LAST_NAMES = [
  "Villanueva",
  "Aquino",
  "Domingo",
  "Castillo",
  "Navarro",
  "Pascual",
  "Bautista",
  "Mercado",
  "Salazar",
  "Yumul",
  "Espiritu",
];

const PLAN_TYPES = ["G5M6", "G1A6", "LG5A10", "LG5M10", "A1A10", "G5Q6"];

const BRANCHES = ["NOVALI", "STA. ROSA", "IMUS", "DASMA", "BACOOR"];

const PLAN_NAMES = [
  "ST. GEORGE",
  "ST. ANNE",
  "ST. CLAIRE",
  "ST. DOMINIQUE",
  "ST. BERNADETTE",
];

const COVERAGES = ["MEMORIAL SERVICE ONLY", "MEMORIAL SERVICE WITH INTERMENT"];

const STREETS = [
  "P. BURGOS ST",
  "MCLL HIGHWAY",
  "RIZAL AVENUE",
  "MABINI ST",
  "QUEZON BLVD",
  "BONIFACIO ST",
  "ACACIA LANE",
];

const LOCALITIES = [
  { barangay: "SAN ROQUE", city: "TANAUAN", province: "LEYTE" },
  { barangay: "GUIWAN", city: "ZAMBOANGA", province: "ZAMBOANGA DEL SUR" },
  { barangay: "POBLACION", city: "ORMOC CITY", province: "LEYTE" },
  { barangay: "STA. CRUZ", city: "QUEZON CITY", province: "METRO MANILA" },
  { barangay: "MALIGAYA", city: "IMUS", province: "CAVITE" },
  { barangay: "BAGONG SILANG", city: "DASMARIÑAS", province: "CAVITE" },
];

function planholderAddress(i: number) {
  const { barangay, city, province } = LOCALITIES[i % LOCALITIES.length];
  return `${STREETS[i % STREETS.length]}, ${barangay}, ${city}, ${province}`;
}

function lpaNo(i: number) {
  return `L25${String(2000 + i).padStart(5, "0")}`;
}

// Spread across the whole of 2025-2026 so date sorting and filtering have
// something to chew on at this volume.
function dateOffset(i: number, base = 1) {
  const monthIndex = (i + base) % 24;
  const year = 2025 + Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  const day = (i % 27) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const RECORD_COUNT = 500;

export const COFP_REQUESTS: CofpRequest[] = Array.from(
  { length: RECORD_COUNT },
  (_, i) => ({
    id: `COFP-${String(i + 1).padStart(4, "0")}`,
    branchCode: BRANCHES[i % BRANCHES.length],
    lpaNo: lpaNo(i),
    planholderName: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
      LAST_NAMES[i % LAST_NAMES.length]
    }`,
    planholderAddress: planholderAddress(i),
    planType: PLAN_TYPES[i % PLAN_TYPES.length],
    planName: PLAN_NAMES[i % PLAN_NAMES.length],
    coverage: COVERAGES[i % COVERAGES.length],
    cfpNumber: `CFP-${String(2600 + i)}`,
    cfpDate: dateOffset(i, 2),
    totalAmountPaid: 45000 + (i % 41) * 1750,
    requestDate: dateOffset(i),
    requester: REQUESTERS[i % REQUESTERS.length],
    status: STATUS_CYCLE[i % STATUS_CYCLE.length],
  }),
);

/** Transmittal memos each branch has on file. */
const MEMOS_PER_BRANCH = 20;

/**
 * Group each branch's printed certificates into transmittal memos, stamping
 * the memo number back onto the requests so the Printed queue can drill from a
 * memo into the certificates it covers. Older memos are already transmitted;
 * the newest one per branch is still waiting.
 */
export const COFP_MEMOS: CofpMemo[] = (() => {
  const memos: CofpMemo[] = [];
  const printedByBranch = new Map<string, CofpRequest[]>();

  for (const request of COFP_REQUESTS) {
    if (request.status !== "PRINTED") continue;
    const rows = printedByBranch.get(request.branchCode) ?? [];
    rows.push(request);
    printedByBranch.set(request.branchCode, rows);
  }

  for (const [branchCode, rows] of printedByBranch) {
    const prefix = `TM-${branchCode.replace(/[^A-Z]/g, "").slice(0, 3)}`;
    const memoNoAt = (index: number) =>
      `${prefix}-${String(index + 1).padStart(3, "0")}`;

    // Dealt round-robin so every memo carries certificates, however many the
    // branch printed.
    rows.forEach((request, index) => {
      request.memoNo = memoNoAt(index % MEMOS_PER_BRANCH);
    });

    for (let memoIndex = 0; memoIndex < MEMOS_PER_BRANCH; memoIndex += 1) {
      const memoNo = memoNoAt(memoIndex);
      const certificateCount = rows.filter((r) => r.memoNo === memoNo).length;
      // The newest few are still waiting to go out.
      const isTransmitted = memoIndex < MEMOS_PER_BRANCH - 3;

      memos.push({
        memoNo,
        branchCode,
        isTransmitted,
        transmitDate: isTransmitted ? dateOffset(memoIndex, 4) : "1900-01-01",
        certificateCount,
      });
    }
  }

  return memos;
})();
