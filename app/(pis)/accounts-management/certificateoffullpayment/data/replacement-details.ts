// What the Replacement view's Branch panel shows for the request picked in the
// rail (user, 2026-10-06): the plan holder's facts for the card on the left,
// and the papers filed with the request for the viewer on the right.
//
// MOCK, all of it derived from the request row so a request shows the same
// status and the same scans on every render. The papers are drawn by the CSV
// module's generators (`csv-documents.ts`) — the same LPA contract and COFP
// sheet — so they carry this plan holder's name, LPA number and address.

import {
  cofpImageUrl,
  lpaContractImageUrl,
  type CsvDocumentData,
} from "../../csv/data/csv-documents";
import { idCardImageUrl, type IdCardKind } from "../../reinstatement/data/id-card";
import type { SubmittedDocument } from "../../reinstatement/data/types";
import { formatAddress } from "./regions";
import type { CofpReplacementRequest } from "./types";

/** Where a Replacement request stands. */
export type CofpReplacementStatus = "FOR PROCESS" | "PENDING";

/**
 * One line of the replacement's value comparison — what the certificate
 * printed, and what the replacement is to print instead.
 */
export interface CofpReplacementChange {
  field: string;
  oldValue: string;
  /** Unset when the field carries over unchanged. */
  newValue?: string;
}

/** The COFP Replacement Information block (user, 2026-10-06). View only. */
export interface CofpReplacementInfo {
  reason: string;
  changes: CofpReplacementChange[];
  notes: string;
  remarks: string;
}

export interface CofpReplacementDetails {
  status: CofpReplacementStatus;
  /** e.g. "NT - NOT TERMINATED". */
  terminationStatus: string;
  documents: SubmittedDocument[];
  info: CofpReplacementInfo;
}

const REASONS = [
  "SEVERELY DAMAGED CERTIFICATE",
  "LOST CERTIFICATE",
  "CHANGE OF NAME",
  "CORRECTION OF ENTRIES",
  "CHANGE OF ADDRESS",
];

const CIVIL_STATUSES = ["SINGLE", "MARRIED", "WIDOWED"];

const REMARKS = [
  "AWAITING NOTARIZED SURRENDER FORM FROM BRANCH",
  "AFFIDAVIT OF LOSS RECEIVED",
  "FOR VERIFICATION OF SUPPORTING DOCUMENTS",
  "",
];

/**
 * The comparison for one request — MOCK. What changes follows the reason, so
 * a change of name changes the name and a change of address the address; the
 * contact lines change on every few requests whatever the reason.
 */
function replacementInfoOf(
  request: CofpReplacementRequest,
  seed: number,
): CofpReplacementInfo {
  const reason = REASONS[seed % REASONS.length];
  const civilStatus = CIVIL_STATUSES[seed % CIVIL_STATUSES.length];
  const address = formatAddress(request.address);
  const email = `${request.firstName.charAt(0)}${request.lastName.replace(/\s/g, "")}@oldmail.com`.toLowerCase();
  const contact = `0917-${String(100 + (seed % 900))}-${String(1000 + (seed % 9000)).slice(0, 4)}`;

  const marriedName = reason === "CHANGE OF NAME";
  const changes: CofpReplacementChange[] = [
    {
      field: "Civil Status",
      oldValue: civilStatus,
      newValue: marriedName && civilStatus !== "MARRIED" ? "MARRIED" : undefined,
    },
    { field: "First Name", oldValue: request.firstName },
    {
      field: "Middle Name",
      oldValue: request.middleName,
      newValue: marriedName ? request.lastName : undefined,
    },
    {
      field: "Last Name",
      oldValue: request.lastName,
      newValue: marriedName ? "SANTIAGO" : undefined,
    },
    {
      field: "Address",
      oldValue: address,
      newValue:
        reason === "CHANGE OF ADDRESS"
          ? `${(seed % 200) + 1} MABINI ST., BRGY. SAN ROQUE, QUEZON CITY, METRO MANILA`
          : undefined,
    },
    {
      field: "Email Address",
      oldValue: email,
      newValue:
        seed % 2 === 0
          ? `${request.firstName}.${request.lastName.replace(/\s/g, "")}@email.com`.toLowerCase()
          : undefined,
    },
    {
      field: "Contact Details",
      oldValue: contact,
      newValue: seed % 3 === 0 ? `0918-${String(200 + (seed % 700))}-${String(5000 + (seed % 4000)).slice(0, 4)}` : undefined,
    },
  ];

  return {
    reason,
    changes,
    notes: `[${request.dateRequested}] REQUEST LOGGED`,
    remarks: REMARKS[seed % REMARKS.length],
  };
}

const TERMINATION_STATUSES = [
  "NT - NOT TERMINATED",
  "NT - NOT TERMINATED",
  "NT - NOT TERMINATED",
  "DC - DECEASED",
];

const ID_KINDS: { label: string; kind: IdCardKind }[] = [
  { label: "National ID", kind: "national-id" },
  { label: "Driver's License", kind: "drivers-license" },
  { label: "UMID", kind: "umid" },
  { label: "Passport", kind: "passport" },
  { label: "Postal ID", kind: "postal-id" },
];

/** The plan codes the mock plans print under, by plan name. */
const PLAN_CODES: Record<string, string> = {
  "ST. GREGORY": "SGR",
  "ST. ANNE": "SAN",
  "ST. FRANCIS": "SFR",
  "ST. GEORGE": "SGE",
  "ST. CLAIRE": "SCL",
};

/** The running number in the LPA number, which every mock field is seeded by. */
function seedOf(request: CofpReplacementRequest): number {
  return Number(request.lpaNo.replace(/\D/g, "")) || 0;
}

/** `iso` moved by whole years. */
function yearsFrom(iso: string, years: number): string {
  const [y, m, d] = iso.split("-");
  return `${Number(y) + years}-${m}-${d}`;
}

/**
 * The details for one Replacement request — memoize on the request, since
 * drawing the scans is not free.
 */
export function replacementDetailsOf(
  request: CofpReplacementRequest,
): CofpReplacementDetails {
  const seed = seedOf(request);
  const birthdate = `${1950 + (seed % 30)}-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 28) + 1).padStart(2, "0")}`;
  const data: CsvDocumentData = {
    lpaNo: request.lpaNo,
    csvNo: "",
    firstName: request.firstName,
    middleName: request.middleName,
    lastName: request.lastName,
    planDescription: request.planName,
    planCode: PLAN_CODES[request.planName] ?? "LPA",
    contractPrice: request.planValue,
    birthdate,
    // A five-year term ending the day the plan was paid off.
    effectivityDate: yearsFrom(request.fullPaidDate, -5),
    dateApplied: request.dateRequested,
    branch: request.branch,
    cofpNo: request.cofpNo,
    address: formatAddress(request.address),
    seed,
  };
  const id = ID_KINDS[seed % ID_KINDS.length];

  return {
    status: seed % 4 === 1 ? "PENDING" : "FOR PROCESS",
    terminationStatus: TERMINATION_STATUSES[seed % TERMINATION_STATUSES.length],
    info: replacementInfoOf(request, seed),
    // The ID, the contract, and the certificate being replaced.
    documents: [
      {
        id: `${request.id}-ID`,
        label: `Valid ID — ${id.label}`,
        imageUrl: idCardImageUrl({
          kind: id.kind,
          firstName: request.firstName,
          middleName: request.middleName,
          lastName: request.lastName,
          birthdate,
          issuedDate: request.dateRequested,
          seed,
        }),
      },
      {
        id: `${request.id}-LPA`,
        label: "LPA Contract",
        imageUrl: lpaContractImageUrl(data),
      },
      {
        id: `${request.id}-COFP`,
        label: "Certificate of Full Payment (COFP)",
        imageUrl: cofpImageUrl({ ...data, cofpNo: request.cofpNo }),
      },
    ],
  };
}
