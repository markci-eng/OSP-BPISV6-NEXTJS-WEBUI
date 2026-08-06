import {
  buildSubmittedDocuments,
} from "../../document-requirements";
import type {
  RitfPhUpdateEntry,
  RitfProcessingStatus,
  RitfRequest,
  RitfStatus,
  RitfTransactionType,
} from "./types";

// Length kept co-prime with the branch list so statuses stay spread across
// branches instead of clustering, with pending dominating as in real volume.
const STATUS_CYCLE: RitfStatus[] = [
  "PENDING",
  "PENDING",
  "APPROVED",
  "PENDING",
  "DENIED",
  "APPROVED",
  "PENDING",
];

const TRANSACTION_TYPES: RitfTransactionType[] = ["REINSTATEMENT", "TRANSFER"];

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

function planholderFor(i: number) {
  return `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
    LAST_NAMES[i % LAST_NAMES.length]
  }`;
}

const PLAN_TYPES = ["G5M6", "G1A6", "LG5A10", "LG5M10", "A1A10", "G5Q6"];

const ACCT_STATUSES = ["ACTIVE", "LAPSED", "FULLY PAID"];

const REQ_BRANCHES = ["HO", "NOVALI", "STA. ROSA", "IMUS", "DASMA", "BACOOR"];

const SUB_TYPES = [
  "RI-NEW SAME LPA",
  "RI-NEW DIFF LPA",
  "TRANSFER SAME LPA",
  "TRANSFER DIFF LPA",
];

const PROCESSING_STATUS_CYCLE: RitfProcessingStatus[] = [
  "FOR PROCESS",
  "PROCESSED",
  "COMPLETED",
  "CANCELLED",
];

const TRANSFEREES = [
  { lastName: "Reyes", firstName: "Andrea" },
  { lastName: "Santos", firstName: "Miguel" },
  { lastName: "Cruz", firstName: "Bianca" },
];

const PH_UPDATE_FIELDS: {
  field: string;
  oldValue: string;
  newValue: string;
}[] = [
  { field: "ZipCode", oldValue: "4232", newValue: "6502" },
  { field: "Province", oldValue: "LEYTE", newValue: "LEYTE" },
  { field: "City", oldValue: "TANAUAN CITY", newValue: "TANAUAN" },
  { field: "Barangay", oldValue: "SAN ROQUE", newValue: "SAN ROQUE" },
  { field: "Street", oldValue: "9. BURGOS ST", newValue: "P BURGOS ST" },
];

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

function trxMonth(i: number) {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[i % months.length]}26`;
}

function buildPhUpdates(i: number, lpa: string): RitfPhUpdateEntry[] {
  if (i % 4 !== 0) return [];

  const count = 1 + (i % (PH_UPDATE_FIELDS.length - 1));
  const startIdx = 19748600 + i * 20;

  return Array.from({ length: count }, (_, f) => {
    const { field, oldValue, newValue } = PH_UPDATE_FIELDS[f];
    return {
      idx: startIdx + count - f,
      lpaNo: lpa,
      fieldName: field,
      oldValue,
      newValue,
      authorizedDate: dateOffset(i, f),
    };
  });
}

const RECORD_COUNT = 500;

// PI10529 / Michelle De Sosa — matches the planholder-profile mock data, so
// this planholder's Quick Actions have a real RITF/ROP/CSV record to jump to.
const DEMO_PLANHOLDER = { lpaNo: "L25048596I", name: "Michelle De Sosa" };

export const RITF_REQUESTS: RitfRequest[] = Array.from(
  { length: RECORD_COUNT },
  (_, i) => {
    const lpa = i === 0 ? DEMO_PLANHOLDER.lpaNo : lpaNo(i);
    const transactionType = TRANSACTION_TYPES[i % TRANSACTION_TYPES.length];
    const isTransfer = transactionType === "TRANSFER";
    const transferee = TRANSFEREES[i % TRANSFEREES.length];

    return {
      id: `RITF-${String(i + 1).padStart(4, "0")}`,
      lpaNo: lpa,
      planholderName:
        i === 0 ? DEMO_PLANHOLDER.name : planholderFor(i),
      planType: PLAN_TYPES[i % PLAN_TYPES.length],
      transactionType,
      balance: 3000 + i * 150,
      dueDate: dateOffset(i, 2),
      requestDate: dateOffset(i),
      requester: REQUESTERS[i % REQUESTERS.length],
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],

      acctStatus: ACCT_STATUSES[i % ACCT_STATUSES.length],
      termiStatus: i % 5 === 0 ? "T" : "NT",
      subType: SUB_TYPES[i % SUB_TYPES.length],
      trxMonth: trxMonth(i),
      reqBranch: REQ_BRANCHES[i % REQ_BRANCHES.length],
      processingStatus:
        PROCESSING_STATUS_CYCLE[i % PROCESSING_STATUS_CYCLE.length],
      newPlanCode: PLAN_TYPES[(i + 1) % PLAN_TYPES.length],
      tfLastName: isTransfer ? transferee.lastName : "",
      tfFirstName: isTransfer ? transferee.firstName : "",
      dateReceivedByOP: "1900-01-01",
      dateReceivedFrOP: "1900-01-01",
      dateInformed: dateOffset(i),
      dateComplied: dateOffset(i),
      daysProcessed: i % 4 === 0 ? (i % 10) + 1 : 0,
      notes: "",
      completeDocuments: i % 3 === 0,

      phUpdates: buildPhUpdates(i, lpa),
      documents: buildSubmittedDocuments(i),
    };
  },
);

export function getRitfRequestById(id: string): RitfRequest | undefined {
  return RITF_REQUESTS.find((r) => r.id === id);
}

export function updateRitfRequest(id: string, patch: Partial<RitfRequest>) {
  const target = getRitfRequestById(id);
  if (target) Object.assign(target, patch);
}
