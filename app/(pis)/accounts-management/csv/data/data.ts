// The CSV records the list shows.
//
// Built from the planholder lookup, the same as the ROP and Reinstatement
// records, so every row is a real planholder on file rather than an invented
// name.

import { planholderLookup } from "../../planholder-profile/data/planholder-lookup";
import { idCardImageUrl, type IdCardKind } from "../../reinstatement/data/id-card";
import type { SubmittedDocument } from "../../reinstatement/data/types";
import {
  buildPayout,
  buildPlanholderNotes,
} from "../../return-of-premium/data/data";
import {
  cofpImageUrl,
  csvFormImageUrl,
  lpaContractImageUrl,
  type CsvDocumentData,
} from "./csv-documents";
import type { CsvDetailsRemarks, CsvRecord, CsvStatus } from "./types";

/** The IDs a planholder may file, each with the card `id-card.ts` draws. */
const SUBMITTED_ID_KINDS: { label: string; kind: IdCardKind }[] = [
  { label: "Passport", kind: "passport" },
  { label: "Driver's License", kind: "drivers-license" },
  { label: "National ID", kind: "national-id" },
  { label: "UMID", kind: "umid" },
  { label: "Postal ID", kind: "postal-id" },
];

/**
 * The papers filed with the surrender, in this order: a valid ID, the CSV form,
 * the LPA contract and — when the plan was paid in full — its COFP. All are
 * drawn from the record itself, so they carry this planholder's name, LPA
 * number and amounts. The ID kind rotates through the record list.
 */
function buildSubmittedDocuments(
  personId: string,
  data: CsvDocumentData,
): SubmittedDocument[] {
  const { label, kind } = SUBMITTED_ID_KINDS[data.seed % SUBMITTED_ID_KINDS.length];
  const documents: SubmittedDocument[] = [
    {
      id: `${personId}-CSV-${kind}`,
      label: `Valid ID — ${label}`,
      imageUrl: idCardImageUrl({
        kind,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        issuedDate: `2026-${String((data.seed % 9) + 1).padStart(2, "0")}-15`,
        seed: data.seed,
      }),
    },
    {
      id: `${personId}-${data.csvNo}-FORM`,
      label: "CSV Form",
      imageUrl: csvFormImageUrl(data),
    },
    {
      id: `${personId}-${data.lpaNo}-LPA`,
      label: "LPA Contract",
      imageUrl: lpaContractImageUrl(data),
    },
  ];

  if (data.cofpNo) {
    documents.push({
      id: `${personId}-${data.cofpNo}`,
      label: "Certificate of Full Payment (COFP)",
      imageUrl: cofpImageUrl({ ...data, cofpNo: data.cofpNo }),
    });
  }

  return documents;
}

export const CSV_STATUS_OPTIONS: CsvStatus[] = [
  "SPFC",
  "For Process",
  "Pending",
  "Denied",
];

/** Views kept above but hidden from the list header for now. */
export const CSV_HIDDEN_STATUSES: CsvStatus[] = ["SPFC"];

/** The views the list header steps through. */
export const CSV_LIST_STATUSES: CsvStatus[] = CSV_STATUS_OPTIONS.filter(
  (status) => !CSV_HIDDEN_STATUSES.includes(status),
);

/** What the processor can set in CSV Details. */
export const CSV_DETAILS_STATUS_OPTIONS: CsvStatus[] = [
  "For Process",
  "Pending",
  "Denied",
];

/** How a status reads as a badge. */
export const CSV_STATUS_BADGE: Record<
  CsvStatus,
  "success" | "info" | "warning" | "danger"
> = {
  SPFC: "success",
  "For Process": "info",
  Pending: "warning",
  Denied: "danger",
};

export const CSV_REMARKS_OPTIONS: CsvDetailsRemarks[] = ["Valid", "Invalid"];

/** Contract prices a plan is sold at, for the mock surrenders. */
const CONTRACT_PRICES = [30000, 45000, 60000, 75000, 90000];

// Weighted so every one of the list's status views has rows in it.
const STATUS_CYCLE: CsvStatus[] = [
  "SPFC",
  "For Process",
  "Pending",
  "Denied",
  "For Process",
  "SPFC",
  "Pending",
  "Denied",
];

/** The plan holder module's remark lines, in its own format, oldest first. */
const REMARK_ENTRIES: ((i: number) => string)[] = [
  () => "AVS 11/29/2024 01:57:16 PM BM: Accounts Verification INQUIRY TYPE: EMAIL",
  (i) => `CSV#CSVLUPON${26001310 + i} FILED BY BRANCH 08/14/2026 10:22:41 am`,
  () => "AVB:AAVS 08/21/2026 07:12:37 PM Chapel: MATI INQUIRY TYPE: EMAIL",
  () => "CSV ENDORSED FOR PROCESSING BY: JENNILYN 09/02/2026 8:29:04 am",
];

/** How many of the planholders on file have a CSV raised. */
const RECORD_COUNT = 24;

/** Local-calendar ISO date, so a midnight `Date` does not slip a day in UTC. */
function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export const CSV_RECORDS: CsvRecord[] = planholderLookup
  .slice(0, RECORD_COUNT)
  .map((planholder, i): CsvRecord => {
    const withCofp = i % 3 !== 1;
    // Same spread as the ROP records, so the Age line varies.
    const birthdate = `${1965 + (i % 28)}-${String((i % 12) + 1).padStart(
      2,
      "0",
    )}-${String((i % 27) + 1).padStart(2, "0")}`;
    const csvNo = `CSV-2026-${String(10001 + i * 7).padStart(6, "0")}`;
    const effectivityDate = toIso(new Date(planholder.effectivityDate));
    const cofpNo = withCofp
      ? `COFP-${2023 + (i % 3)}-${String(99182 - i * 13).padStart(5, "0")}`
      : undefined;

    const details = (() => {
      const contractPrice = CONTRACT_PRICES[i % CONTRACT_PRICES.length];
      const applied = new Date(2024, i % 12, (i % 26) + 1);
      // Received a day to three after it was filed.
      const received = new Date(applied);
      received.setDate(applied.getDate() + 1 + (i % 3));
      return {
        // Initials of the plan name, e.g. "ST. GEORGE" → "SG", as on ROP.
        planCode: planholder.planDescription
          .split(/[\s.]+/)
          .filter(Boolean)
          .map((word) => word[0])
          .join(""),
        contractPrice,
        dateApplied: toIso(applied),
        dateReceived: toIso(received),
        terminationAmount: Math.round(contractPrice * (0.18 + (i % 5) * 0.04)),
        // Most surrenders have no excess; one in four does.
        excessTerminationValue: i % 4 === 1 ? 500 * (1 + (i % 3)) : 0,
        remarks: "Valid" as const,
        status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      };
    })();

    return {
      id: `CSV-${String(i + 1).padStart(4, "0")}`,
      planholderName: `${planholder.lastName}, ${planholder.firstName}`,
      lastName: planholder.lastName,
      firstName: planholder.firstName,
      middleName: planholder.middleName,
      lpaNo: planholder.lpaNumber,
      csvNo,
      branchCode: planholder.branch,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      personId: planholder.personId,
      birthdate,
      planDescription: planholder.planDescription,
      newEffectivityDate: effectivityDate,
      accountStatus: planholder.accountStatus,
      terminationStatus: planholder.terminationStatus,
      loanStatus: i % 4 === 2 ? "OUTSTANDING" : "CLEARED",
      cofpNo,
      confiscated: i % 7 === 4,
      details,
      submittedDocuments: buildSubmittedDocuments(planholder.personId, {
        lpaNo: planholder.lpaNumber,
        csvNo,
        firstName: planholder.firstName,
        middleName: planholder.middleName,
        lastName: planholder.lastName,
        planDescription: planholder.planDescription,
        planCode: details.planCode,
        contractPrice: details.contractPrice,
        birthdate,
        effectivityDate,
        dateApplied: details.dateApplied,
        branch: planholder.branch,
        cofpNo,
        seed: i,
      }),
      // One to three submissions, each on its own channel with its own
      // account and proof — built the way ROP builds its own.
      payouts: Array.from({ length: 1 + (i % 3) }, (_, k) =>
        buildPayout(planholder, i, k),
      ),
      // One to four entries, so the remarks card is seen short and long.
      planholderRemarks: REMARK_ENTRIES.slice(0, 1 + (i % REMARK_ENTRIES.length))
        .map((entry) => entry(i))
        .join("; ")
        .concat(";"),
      planholderNotes: buildPlanholderNotes(planholder.lpaNumber, i),
    };
  });

/**
 * The records, as the screen would get them from an API — a promise and a
 * delay so the loading skeleton is a real state.
 */
export function fetchCsvRecords(): Promise<CsvRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(CSV_RECORDS), 600);
  });
}
