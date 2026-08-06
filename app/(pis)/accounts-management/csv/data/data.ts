import { buildSubmittedDocuments } from "../../document-requirements";
import type {
  CsvRequest,
  CsvStatus,
  PayoutAccountDetails,
  PayoutAttachment,
  PhUpdateEntry,
} from "./types";

// Length kept co-prime with the branch list so statuses stay spread across
// branches instead of clustering, with pending dominating as in real volume.
const STATUS_CYCLE: CsvStatus[] = [
  "PENDING",
  "PENDING",
  "APPROVED",
  "PENDING",
  "DENIED",
  "APPROVED",
  "PENDING",
];

const REASONS = ["Financial hardship", "Plan replacement"];

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

const BRANCHES = ["NOVALI", "STA. ROSA", "IMUS", "DASMA", "BACOOR"];

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

const PH_UPDATE_FIELDS: { field: string; oldValue: string; newValue: string }[] = [
  { field: "ZipCode", oldValue: "4232", newValue: "6502" },
  { field: "Province", oldValue: "LEYTE", newValue: "LEYTE" },
  { field: "City", oldValue: "TANAUAN CITY", newValue: "TANAUAN" },
  { field: "District", oldValue: "", newValue: "N/A" },
  { field: "Barangay", oldValue: "SAN ROQUE", newValue: "SAN ROQUE" },
  { field: "Street", oldValue: "9. BURGOS ST", newValue: "P BURGOS ST" },
  { field: "MobileNo", oldValue: "09171234567", newValue: "09179876543" },
  { field: "Email", oldValue: "juan.delacruz@old.ph", newValue: "juan.delacruz@new.ph" },
  { field: "CivilStatus", oldValue: "SINGLE", newValue: "MARRIED" },
];

function buildPhUpdates(i: number, lpa: string): PhUpdateEntry[] {
  const count = 3 + (i % (PH_UPDATE_FIELDS.length - 2));
  const startIdx = 19748600 + i * 20;

  return Array.from({ length: count }, (_, f) => {
    const { field, oldValue, newValue } = PH_UPDATE_FIELDS[f];
    return {
      idx: startIdx + count - f,
      lpaNo: lpa,
      fieldName: field,
      oldValue,
      newValue,
    };
  });
}

const PAYMENT_CHANNELS = [
  "METROPOLITAN BANK AND TRUST CO",
  "BDO UNIBANK",
  "BANK OF THE PHILIPPINE ISLANDS",
  "LANDBANK OF THE PHILIPPINES",
  "GCASH",
  "CHEQUE",
];

/** Cheque payouts go to a person, not an account — nothing to verify. */
export function isChequePayout(channel: string) {
  const value = channel.toUpperCase();
  return value.includes("CHEQUE") || value.includes("CHECK");
}

/** Wallet payouts are proven with an app screenshot rather than a statement. */
export function isWalletPayout(channel: string) {
  const value = channel.toUpperCase();
  return value.includes("GCASH") || value.includes("WALLET") || value.includes("MAYA");
}

const PAYOUT_BRANCHES = [
  "TACLOBAN NORTH",
  "ORMOC CITY",
  "CEBU MAIN",
  "DAVAO DOWNTOWN",
  "QUEZON AVENUE",
];

function payoutAccountNo(i: number) {
  const n = 1000000000 + i * 987654;
  const digits = String(n);
  return `1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
}

const PROOF_ROOT = "/documents/payout-proofs";

// Proof of account is whatever the payout channel calls for: a wallet
// screenshot for e-wallets, a statement for banks, nothing at all for cheque.
// Every fourth bank record submits its statement as a PDF so the non-image
// tile keeps a live case.
function buildAttachments(
  i: number,
  channel: string,
  requester: string,
  uploadedAt: string,
): PayoutAttachment[] {
  if (isChequePayout(channel)) return [];

  const wallet = isWalletPayout(channel);
  const asPdf = !wallet && i % 4 === 0;

  return [
    {
      id: `ATT-${String(i + 1).padStart(4, "0")}-1`,
      label: wallet ? "E-Wallet Account Screenshot" : "Bank Statement",
      url: wallet
        ? `${PROOF_ROOT}/ewallet-account.svg`
        : asPdf
          ? "/documents/sample-soa.pdf"
          : `${PROOF_ROOT}/bank-statement.svg`,
      mimeType: asPdf ? "application/pdf" : "image/svg+xml",
      uploadedAt,
      uploadedBy: requester,
    },
  ];
}

function buildPayoutAccount(i: number, planholderName: string, dob: string): PayoutAccountDetails {
  const channel = PAYMENT_CHANNELS[i % PAYMENT_CHANNELS.length];

  return {
    paymentChannel: channel,
    payoutAccountNo: payoutAccountNo(i),
    payoutBranch: PAYOUT_BRANCHES[i % PAYOUT_BRANCHES.length],
    accountName: planholderName.toUpperCase(),
    phBirthdate: dob,
    attachments: buildAttachments(
      i,
      channel,
      REQUESTERS[i % REQUESTERS.length],
      dateOffset(i),
    ),
  };
}

function birthDate(i: number) {
  const year = 1945 + (i % 30);
  const month = String((i % 12) + 1).padStart(2, "0");
  const day = String((i % 27) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const RECORD_COUNT = 500;

// PI10529 / Michelle De Sosa — matches the planholder-profile mock data, so
// this planholder's Quick Actions have a real RITF/ROP/CSV record to jump to.
const DEMO_PLANHOLDER = { lpaNo: "L25048596I", name: "Michelle De Sosa" };

export const CSV_REQUESTS: CsvRequest[] = Array.from(
  { length: RECORD_COUNT },
  (_, i) => {
    const lpa = i === 0 ? DEMO_PLANHOLDER.lpaNo : lpaNo(i);
    const planholderName =
      i === 0 ? DEMO_PLANHOLDER.name : planholderFor(i);

    return {
      id: `CSV-${String(i + 1).padStart(4, "0")}`,
      lpaNo: lpa,
      planholderName,
      planType: PLAN_TYPES[i % PLAN_TYPES.length],
      reason: REASONS[i % REASONS.length],
      surrenderValue: 6000 + i * 300,
      surrenderDate: dateOffset(i, 2),
      requestDate: dateOffset(i),
      requester: REQUESTERS[i % REQUESTERS.length],
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      branchCode: BRANCHES[i % BRANCHES.length],

      documents: buildSubmittedDocuments(i),
      phUpdates: buildPhUpdates(i, lpa),
      payoutAccount: buildPayoutAccount(i, planholderName, birthDate(i)),
    };
  },
);

export function getCsvRequestById(id: string): CsvRequest | undefined {
  return CSV_REQUESTS.find((r) => r.id === id);
}

export function updateCsvRequest(id: string, patch: Partial<CsvRequest>) {
  const target = getCsvRequestById(id);
  if (target) Object.assign(target, patch);
}
