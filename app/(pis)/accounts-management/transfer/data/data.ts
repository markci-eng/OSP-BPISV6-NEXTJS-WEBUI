// The transfer requests the list shows.
//
// Built from the planholder lookup, the same way the ROP records are, so each
// row is a real planholder on file.

import { planholderLookup } from "../../planholder-profile/data/planholder-lookup";
import { idCardImageUrl, type IdCardKind } from "../../reinstatement/data/id-card";
import { buildPlanholderNotes } from "../../return-of-premium/data/data";
import type {
  RopHistory,
  RopScheduleNo,
} from "../../return-of-premium/data/types";
import type {
  TransfereeDetails,
  TransferRecord,
  TransferStatus,
  TransferSubmittedId,
} from "./types";

export const TRANSFER_STATUS_OPTIONS: TransferStatus[] = [
  "For Process",
  "Pending",
  "Approved",
  "Denied",
  "For Transmit",
  "Cancelled",
];

/** How a transfer status reads as a badge on the list rows. */
export const TRANSFER_STATUS_BADGE: Record<
  TransferStatus,
  "success" | "info" | "warning" | "danger"
> = {
  "For Process": "info",
  Pending: "warning",
  Approved: "success",
  Denied: "danger",
  "For Transmit": "info",
  Cancelled: "danger",
};

// Weighted so the queue is mostly work still to be done, and every status view
// has rows in it.
const STATUS_CYCLE: TransferStatus[] = [
  "For Process",
  "Pending",
  "For Process",
  "Approved",
  "For Transmit",
  "Pending",
  "Denied",
  "For Process",
  "Cancelled",
];

/** How many of the planholders on file have a transfer requested. */
const RECORD_COUNT = 30;

/** Branches a transfer can be requested to, other than the plan's own. */
const REQUESTING_BRANCHES = ["NAGA", "LEGASPI", "CEBU", "DAVAO", "ILOILO"];

const SALES_AGENTS = [
  "BLAIRE GUZMAN",
  "ANN CRUZ",
  "MARK REYES",
  "JOY SANTOS",
  "PAOLO DELA CRUZ",
];

/** The proofs of identity a transferor can submit, as ROP offers them. */
const SUBMITTED_ID_KINDS: { label: string; kind: IdCardKind }[] = [
  { label: "Passport", kind: "passport" },
  { label: "Driver's License", kind: "drivers-license" },
  { label: "National ID", kind: "national-id" },
  { label: "UMID", kind: "umid" },
  { label: "Postal ID", kind: "postal-id" },
];

/** A `Date` from the lookup as the ISO date the rest of the record uses. */
function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * One to three IDs, each drawn from the person's own name and birthdate so it
 * agrees with the details card beside it. `seed` picks which kinds, so records
 * do not all open on a passport.
 */
function buildSubmittedIds(
  person: {
    firstName: string;
    middleName: string;
    lastName: string;
    birthdate: string;
    idPrefix: string;
  },
  issuedDate: string,
  seed: number,
): TransferSubmittedId[] {
  return Array.from({ length: 1 + (seed % 3) }, (_, k) => {
    const { label, kind } =
      SUBMITTED_ID_KINDS[(seed + k) % SUBMITTED_ID_KINDS.length];
    return {
      id: `${person.idPrefix}-${kind}`,
      label,
      imageUrl: idCardImageUrl({
        kind,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        birthdate: person.birthdate,
        issuedDate,
        seed,
      }),
    };
  });
}

// The people plans are transferred to. Invented rather than drawn from the
// planholder lookup: a transferee need not hold a plan of their own.
const TRANSFEREE_LAST_NAMES = ["CHIU", "RAMOS", "VILLANUEVA", "TAN", "BAUTISTA"];
const TRANSFEREE_FIRST_NAMES = ["MEGAN", "ANTONIO", "CLARISSE", "RAFAEL", "LIZA"];
const TRANSFEREE_MIDDLE_NAMES = ["SY", "LOPEZ", "GARCIA", "LIM", "MENDOZA"];
const BENEFICIARY_FIRST_NAMES = ["KEITH", "KRIZ", "JOHN", "BEA", "MIGO"];
const BENEFICIARY_RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Sibling"];
const ADDRESSES = [
  "12 Rose St., Veterans Village, Quezon City",
  "45 Mabini Ave., Poblacion, Naga City",
  "8 Rizal St., Brgy. Old Albay, Legazpi City",
  "221 Osmeña Blvd., Cebu City",
  "17 Acacia Rd., Matina, Davao City",
];

/** The transferee on request `i`. */
function buildTransferee(i: number): TransfereeDetails {
  const lastName = TRANSFEREE_LAST_NAMES[i % TRANSFEREE_LAST_NAMES.length];
  const middleName =
    TRANSFEREE_MIDDLE_NAMES[(i + 2) % TRANSFEREE_MIDDLE_NAMES.length];
  // Spread from 1950 to 1999, so the card's age runs from the late twenties
  // to the seventies — the older end is where insurability falls away.
  const birthYear = 1950 + ((i * 7) % 50);

  return {
    lastName,
    firstName: TRANSFEREE_FIRST_NAMES[(i + 1) % TRANSFEREE_FIRST_NAMES.length],
    middleName,
    dateOfBirth: `${birthYear}-${String((i % 12) + 1).padStart(
      2,
      "0",
    )}-${String((i % 27) + 1).padStart(2, "0")}`,
    // Insurability ends with age; past 65 the transferee is not covered.
    insurable: birthYear >= 1961,
    contactNumber: `0926 ${String(100 + ((i * 53) % 900))} ${String(
      1000 + ((i * 197) % 9000),
    )}`,
    registeredAddress: ADDRESSES[i % ADDRESSES.length],
    // None to three, so the list is seen empty as well as with rows. They
    // carry the transferee's surname and middle initial, as a family would.
    beneficiaries: Array.from({ length: i % 4 }, (_, k) => ({
      name: `${
        BENEFICIARY_FIRST_NAMES[(i + k) % BENEFICIARY_FIRST_NAMES.length]
      } ${middleName[0]}. ${lastName}`,
      relationship:
        BENEFICIARY_RELATIONSHIPS[(i + k) % BENEFICIARY_RELATIONSHIPS.length],
    })),
  };
}

/** The plan's remarks trail, oldest first, as the plan holder module logs it. */
const REMARK_ENTRIES: ((i: number) => { remarks: string; dateAdded: string })[] =
  [
    () => ({
      remarks:
        "AVS 11/29/2024 01:57:16 PM BM: Accounts Verification INQUIRY TYPE: EMAIL",
      dateAdded: "2024-11-29T13:57:16",
    }),
    (i) => ({
      remarks: `TRANSFER OF RIGHTS REQUESTED BY BRANCH: TRF-${String(
        i + 1,
      ).padStart(4, "0")}`,
      dateAdded: "2025-06-10T09:12:00",
    }),
    () => ({
      remarks: "TRANSFEREE IDS RECEIVED FOR VALIDATION BY: JENNILYN",
      dateAdded: "2025-06-12T14:30:45",
    }),
    () => ({
      remarks: "ENDORSED TO ACCOUNTS MANAGEMENT BY: ROSEMARIE ANN",
      dateAdded: "2025-06-15T08:05:10",
    }),
  ];

// For the ROP History dialog.
const ROP_SCHEDULES: RopScheduleNo[] = ["1st", "2nd", "3rd", "4th", "5th"];
const ROP_CHANNELS = [
  "BANCO DE ORO UNIBANK, INC.",
  "BANK OF THE PHILIPPINE ISLANDS",
  "LANDBANK OF THE PHILIPPINES",
  "GCASH",
  "MAYA",
];
const CONTRACT_PRICES = [60000, 75000, 90000, 120000, 150000];

/**
 * The plan's ROP releases before this transfer, one a year, oldest first.
 *
 * None to three: one plan in four has had no return yet, so the dialog's
 * empty state is reachable. Paid to the transferor, who held the plan when
 * they were released; only the latest can still be unclaimed.
 */
function buildRopHistory(
  planholder: { firstName: string; lastName: string },
  i: number,
  year: number,
  mm: string,
  dd: string,
): RopHistory[] {
  const count = i % 4;
  const amount =
    CONTRACT_PRICES[i % CONTRACT_PRICES.length] / ROP_SCHEDULES.length;
  const claimedDd = String(Math.min(Number(dd) + 7, 28)).padStart(2, "0");

  return Array.from({ length: count }, (_, k) => {
    const releaseYear = year - (count - k);
    const isClaimed = k < count - 1 || i % 5 !== 1;
    return {
      scheduleNo: ROP_SCHEDULES[k],
      ropDate: `${releaseYear}-${mm}-${dd}`,
      isClaimed,
      dateClaimed: isClaimed ? `${releaseYear}-${mm}-${claimedDd}` : "",
      ropNo: `ROP-${releaseYear}-${String(4200 + i).padStart(6, "0")}`,
      batchNo: `BATCH-${releaseYear}-${String(100 + i + k).padStart(4, "0")}`,
      payeeName: `${planholder.firstName} ${planholder.lastName}`,
      amount,
      channel: ROP_CHANNELS[(i + k) % ROP_CHANNELS.length],
    };
  });
}

export const TRANSFER_RECORDS: TransferRecord[] = planholderLookup
  .slice(0, RECORD_COUNT)
  .map((planholder, i) => {
    const monthIndex = i % 24;
    const year = 2025 + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const day = (i % 27) + 1;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const requestingBranch =
      REQUESTING_BRANCHES.find((b) => b !== planholder.branch) ?? "NAGA";
    // Spread across working age so the card varies between records.
    const birthYear = 1965 + (i % 28);
    const birthdate = `${birthYear}-${mm}-${dd}`;
    const dateRequested = `${year}-${mm}-${dd}`;
    const transferee = buildTransferee(i);
    // One to four entries, so the trail is seen both short and with a run.
    const remarkEntries = REMARK_ENTRIES.slice(
      0,
      1 + (i % REMARK_ENTRIES.length),
    ).map((entry) => entry(i));

    return {
      id: `TRF-${String(i + 1).padStart(4, "0")}`,
      planholderName: `${planholder.lastName}, ${planholder.firstName}`,
      lpaNo: planholder.lpaNumber,
      dateRequested,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      requestingBranch,
      personId: planholder.personId,
      transferor: {
        lastName: planholder.lastName,
        firstName: planholder.firstName,
        middleName: planholder.middleName,
        dateOfBirth: birthdate,
        // The transferee's rule: past 65 the planholder is not covered.
        insurable: birthYear >= 1961,
        accountStatus: planholder.accountStatus,

        planType: planholder.planDescription,
        terminationStatus: planholder.terminationStatus,
        newEffectivityDate: isoDate(planholder.effectivityDate),
        dueDate: isoDate(planholder.dueDate),
        // Most transferors are living; the dates below are ones only some
        // accounts have, so the card's empty rows are seen as well as filled.
        dateOfDeath: i % 6 === 5 ? `${year}-${mm}-${dd}` : "",
        firstRopSchedule: i % 3 === 0 ? `${year + 5}-${mm}-01` : "",
        lastRiDate: i % 4 === 1 ? `${year - 1}-${mm}-${dd}` : "",
        lastTfDate: i % 5 === 2 ? `${year - 1}-${mm}-${dd}` : "",
        accountVerified: i % 2 === 0 ? "VERIFIED" : "",

        originatingBranch: planholder.branch,
        requestingBranch,
        salesAgent1: SALES_AGENTS[i % SALES_AGENTS.length],
        salesAgent2: i % 3 === 2 ? "" : SALES_AGENTS[(i + 1) % SALES_AGENTS.length],
      },
      // One record in seven has none, so the card's empty state is reachable.
      transferorSubmittedIds:
        i % 7 === 3
          ? []
          : buildSubmittedIds(
              { ...planholder, birthdate, idPrefix: planholder.personId },
              dateRequested,
              i,
            ),
      transferee,
      // A different record in seven has none, so a request can be seen with
      // one party's IDs on file and the other's missing.
      transfereeSubmittedIds:
        i % 7 === 5
          ? []
          : buildSubmittedIds(
              {
                ...transferee,
                birthdate: transferee.dateOfBirth,
                idPrefix: `TRF-${i + 1}-transferee`,
              },
              dateRequested,
              // Offset, so the transferee does not open on the same kind of ID
              // as the transferor.
              i + 2,
            ),
      // The same trail as the Remarks History dialog, oldest first, as the
      // plan holder module stores it.
      planholderRemarks: remarkEntries
        .map((entry) => entry.remarks)
        .join("; ")
        .concat(";"),
      remarksHistory: remarkEntries
        .map((entry, n) => ({
          id: `${planholder.lpaNumber}-RM-${n + 1}`,
          lpaNo: planholder.lpaNumber,
          ...entry,
        }))
        .reverse(),
      planholderNotes: buildPlanholderNotes(planholder.lpaNumber, i),
      ropHistory: buildRopHistory(planholder, i, year, mm, dd),
    };
  });

/** Stands in for the transfer list endpoint. */
export function fetchTransferRecords(): Promise<TransferRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(TRANSFER_RECORDS), 600);
  });
}
