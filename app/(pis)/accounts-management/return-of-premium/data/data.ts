// The ROP records the list shows.
//
// BUILT FROM THE PLANHOLDER LOOKUP, not from a pool of invented names. Every
// row has to open a real profile in the right panel — the whole point of the
// screen — so each record is a real person on file with a Return of Premium
// raised against the plan they actually hold. A generated name would give a
// list that looks right and a right panel that is empty.

import { planholderLookup } from "../../planholder-profile/data/planholder-lookup";
import { idCardImageUrl, type IdCardKind } from "../../reinstatement/data/id-card";
import { payoutProofImageUrl } from "./payout-proof";
import type {
  PlanholderNote,
  RopPayout,
  RopRecord,
  RopScheduleNo,
  RopScheduleRemarks,
  RopScheduleStatus,
  RopStatus,
} from "./types";

// Weighted so the list has more pending than settled, as the real queue does.
const STATUS_CYCLE: RopStatus[] = [
  "PENDING",
  "PENDING",
  "APPROVED",
  "PENDING",
  "DENIED",
  "APPROVED",
  "PENDING",
];

/** How many of the planholders on file have an ROP raised. */
const RECORD_COUNT = 28;

/** The pay classes a plan can have posted against it, in ledger order. */
const PAYCLASS_CODES = ["NS", "DC", "RI", "RF", "TF", "AF"];

/** Account status codes, weighted to the fully-paid ones an ROP follows. */
const ACCOUNT_STATUSES = ["FP", "FP", "AC", "FP", "LA"];

/** Termination status codes — "RP" is the returned-premium one. */
const TERMINATION_STATUSES = ["RP", "RP", "NT", "SU"];

/**
 * The channels a return can be released through.
 *
 * Exported because the payout card's dropdown is the one editable field on the
 * panel and has to offer the same list the request was filed against.
 */
export const PAYOUT_CHANNELS = [
  "BANCO DE ORO UNIBANK, INC.",
  "BANK OF THE PHILIPPINE ISLANDS",
  "LANDBANK OF THE PHILIPPINES",
  "METROPOLITAN BANK & TRUST CO.",
  "PHILIPPINE NATIONAL BANK",
  "GCASH",
  "MAYA",
];

/**
 * The cheque channel, which is NOT one of the above.
 *
 * A cheque is not something a planholder submits an account for — it is what a
 * processor falls back to when none of the submitted accounts can be paid
 * into. So it is never in the dropdown (user, 2026-09-24); the payout card
 * reaches it through its own button.
 */
export const CHEQUE_CHANNEL = "CHEQUE";

/**
 * How a payee may be related to the planholder, as the Edit Payee form offers
 * them (user, 2026-09-24). Exported because that form and this generator have
 * to agree — a generated value the form cannot offer is a select that opens on
 * a value it does not contain.
 */
export const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Brother",
  "Sister",
  "Spouse",
  "Son",
  "Daughter",
  "Legal Guardian",
  "Authorized representative",
  "Other",
];

/** Why a payee other than the planholder is collecting. */
export const MODIFIED_PAYEE_REASONS = [
  "Senior",
  "Abroad",
  "Deceased",
  "Medical Condition/Hospitalized",
  "Incarcerated",
  "Other",
];

/** The generator draws from the real options, less the catch-all. */
const RELATIONSHIPS = RELATIONSHIP_OPTIONS.filter((r) => r !== "Other");

/** The five releases a return is paid out in, in order. */
export const ROP_SCHEDULE_OPTIONS: RopScheduleNo[] = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
];

export const ROP_SCHEDULE_STATUS_OPTIONS: RopScheduleStatus[] = [
  "For Process",
  "For Approval",
  "Pending",
  "Denied",
];

/**
 * How a schedule status reads as a badge — on the list rows and on the
 * profile header alike, so a record shows the status its list view is named
 * for (user, 2026-09-24).
 */
export const ROP_SCHEDULE_STATUS_BADGE: Record<
  RopScheduleStatus,
  "success" | "info" | "warning" | "danger"
> = {
  "For Process": "info",
  "For Approval": "success",
  Pending: "warning",
  Denied: "danger",
};

// Weighted so the queue is mostly work still to be done, and every one of the
// list's status views has rows in it.
const SCHEDULE_STATUS_CYCLE: RopScheduleStatus[] = [
  "For Process",
  "For Approval",
  "For Process",
  "Pending",
  "For Process",
  "Denied",
  "For Approval",
];

export const ROP_SCHEDULE_REMARKS_OPTIONS: RopScheduleRemarks[] = [
  "Valid",
  "Invalid",
];

/** The most the ROP Schedule card's Notes field will take. */
export const ROP_NOTES_MAX_LENGTH = 1000;

/** The most a note added from the Planholder Remarks and Notes card will take. */
export const PLANHOLDER_NOTE_MAX_LENGTH = 500;

/** Findings a processor can tick against the payout, in the Validation card. */
export const PAYOUT_VALIDATION_ITEMS = [
  "Bank account name does not match planholder name",
  "Invalid or dormant bank account number provided",
  "Discrepancy in computed ROP schedule / benefit amount",
  "Outstanding loan or ledger balance not cleared",
  "Branch pickup authorization document missing",
  "Proof of payout account is unclear or cropped",
  "Payout channel not supported for this plan",
];

/** Findings a processor can tick against the IDs and signature. */
export const ID_SIGNATURE_VALIDATION_ITEMS = [
  "Specimen signature does not match submitted photo ID",
  "Submitted government ID is expired or illegible",
  "Missing secondary photo ID for modified payee",
  "Proof of relationship document unverified / not notarized",
  "OTP verification or digital signature specimen failed",
  "Name on ID does not match planholder record",
  "Birthdate on ID does not match planholder record",
];

/** Contract prices a plan is sold at, for the mock schedules. */
const CONTRACT_PRICES = [60000, 75000, 90000, 120000, 150000];

/** Given names for the relative collecting on the planholder's behalf. */
const FIRST_NAME_PROXIES = [
  "Maria Elena",
  "Jose Antonio",
  "Ana Lucia",
  "Carlos Miguel",
  "Teresa Isabel",
];

const PAYOUT_REASONS = MODIFIED_PAYEE_REASONS.filter((r) => r !== "Other");

/**
 * The proofs of identity a branch submits, in the order they are asked for,
 * each with the card `id-card.ts` draws for it.
 */
const SUBMITTED_ID_KINDS: { label: string; kind: IdCardKind }[] = [
  { label: "Passport", kind: "passport" },
  { label: "Driver's License", kind: "drivers-license" },
  { label: "National ID", kind: "national-id" },
  { label: "UMID", kind: "umid" },
  { label: "Postal ID", kind: "postal-id" },
];

/** Wallets are held against a mobile number rather than an account number. */
const WALLET_CHANNELS = new Set(["GCASH", "MAYA"]);

/**
 * One submitted payout, `k` submissions into planholder `i`'s request.
 *
 * The ACCOUNT depends on the channel, which is what makes switching channels
 * worth doing: a bank submission carries a grouped account number, a wallet
 * carries the mobile number it is registered to, and a cheque carries neither
 * because it is collected over a counter.
 *
 * Exported for the CSV screen, whose payout card is this module's.
 */
export function buildPayout(
  planholder: { firstName: string; lastName: string },
  i: number,
  k: number,
): RopPayout {
  // Stepped by a number coprime with the list length, so one request's
  // submissions land on different channels rather than adjacent ones.
  const channel = PAYOUT_CHANNELS[(i + k * 3) % PAYOUT_CHANNELS.length];
  const seed = i * 7 + k * 13;

  const accountNo = (() => {
    if (WALLET_CHANNELS.has(channel)) {
      return `0917 ${String(100 + (seed % 900))} ${String(
        1000 + (seed % 9000),
      )}`;
    }
    // Grouped the way an account number is read aloud and checked off a
    // passbook, rather than as one long run of digits.
    return `${String(1000 + seed).slice(0, 4)}-${String(2000 + seed * 7).slice(
      0,
      4,
    )}-${String(3000 + seed * 13).slice(0, 4)}`;
  })();

  // Most submissions are collected by the planholder themselves; the rest name
  // a relative, which is what the relationship and reason are asked for.
  const collectedBySelf = (i + k) % 3 === 0;
  const payeeName = collectedBySelf
    ? `${planholder.firstName} ${planholder.lastName}`
    : `${FIRST_NAME_PROXIES[(i + k) % FIRST_NAME_PROXIES.length]} ${
        planholder.lastName
      }`;

  return {
    channel,
    accountNo,
    // The account is held by whoever is collecting through it.
    accountName: payeeName,
    payeeName,
    relationship: collectedBySelf
      ? "Planholder"
      : RELATIONSHIPS[(i + k) % RELATIONSHIPS.length],
    reason: collectedBySelf
      ? "Self"
      : PAYOUT_REASONS[(i + k) % PAYOUT_REASONS.length],
    // One submission in five has no proof on file, so the Proof of Payout
    // card's empty state is something the screen actually reaches.
    // The rest draw a proof filled in from this payout — a verified wallet
    // screen or a bank statement — so its name and number match the rows.
    proofImageUrl:
      (i + k) % 5 === 4
        ? ""
        : payoutProofImageUrl({
            channel,
            accountNo,
            accountName: payeeName,
            seed,
          }),
  };
}

/** The plan holder module's remark lines, in the module's own format. */
const REMARK_ENTRIES: ((i: number) => string)[] = [
  () =>
    "AVS 11/29/2024 01:57:16 PM BM: Accounts Verification INQUIRY TYPE: EMAIL",
  (i) =>
    `ROP#ROPLUPON${24002491 + i} APPROVED BY JENNILYN 12/13/2024 8:29:04 am`,
  () => "ROP ENDORSED TO ACCTNG BY: JENNILYN 12/13/2024 8:29:04 am",
  () => "AVB:AAVS 08/21/2026 07:12:37 PM Chapel: MATI INQUIRY TYPE: EMAIL",
  () => "TERMINATED-SP BY:CLAIMSROSEMARIE ANN 09/02/2026",
];

const NOTE_ENTRIES = [
  "Called the planholder to confirm the payout account; no answer.",
  "Planholder confirmed the details over the phone.",
  "Waiting on a clearer copy of the submitted ID.",
  "Endorsed to the branch for follow-up.",
];

const NOTE_AUTHORS = ["JENNILYN", "ROSEMARIE ANN", "MARK ANTHONY"];

/**
 * The notes already on a plan, newest first — none to three of them, so the
 * notes list is seen both empty and with rows. Shared with Reinstatement.
 */
export function buildPlanholderNotes(
  lpaNo: string,
  i: number,
): PlanholderNote[] {
  const count = i % 4;
  return Array.from({ length: count }, (_, k): PlanholderNote => {
    const date = new Date(2026, 8, 20 - k * 3 - (i % 5), 9 + k, 15 + i);
    return {
      id: `${lpaNo}-note-${k}`,
      lpaNo,
      notes: NOTE_ENTRIES[(i + k) % NOTE_ENTRIES.length],
      createdBy: NOTE_AUTHORS[(i + k) % NOTE_AUTHORS.length],
      dateCreated: date.toISOString(),
    };
  });
}

export const ROP_RECORDS: RopRecord[] = planholderLookup
  .slice(0, RECORD_COUNT)
  .map((planholder, i) => {
    // Spread across two years so the dates sort into something worth reading.
    const monthIndex = i % 24;
    const year = 2025 + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const day = (i % 27) + 1;
    const ropDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    // Spread across working age — 34 to 61 — so the card's Age line varies
    // between records instead of every planholder reading the same.
    const birthdate = `${1965 + (i % 28)}-${String((i % 12) + 1).padStart(
      2,
      "0",
    )}-${String((i % 27) + 1).padStart(2, "0")}`;

    return {
      id: `ROP-${String(i + 1).padStart(4, "0")}`,
      ropNo: `ROP-${2026 - Math.floor(monthIndex / 12)}-${String(
        4200 + i,
      ).padStart(6, "0")}`,
      lpaNo: planholder.lpaNumber,
      // Surname first, the way every other list in the module prints it.
      planholderName: `${planholder.lastName}, ${planholder.firstName}`,
      ropDate,
      personId: planholder.personId,
      birthdate,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],

      // The plan was re-dated five years before the return was raised, which
      // is the shape of a matured five-year term.
      newEffectivityDate: `${year - 5}-${String(month).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`,
      accountStatus: ACCOUNT_STATUSES[i % ACCOUNT_STATUSES.length],
      loanStatus: i % 5 === 0 ? "OUTSTANDING" : "CLEARED",
      terminationStatus: TERMINATION_STATUSES[i % TERMINATION_STATUSES.length],
      // The ledger's own "never terminated" date, which the card prints as it
      // is stored rather than as a blank — see the note in the details card.
      terminationStatusDate: i % 3 === 0 ? "1900-01-01" : `${year}-01-01`,
      dateVerified: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String(
        (i % 27) + 1,
      ).padStart(2, "0")}`,
      // Every plan carries the first few classes; the last two are the ones
      // that turn up on some accounts and need looking at when they do.
      payclasses: PAYCLASS_CODES.slice(0, 4 + (i % 3)).map((code) => ({
        code,
        flagged: code === "TF" || code === "AF",
      })),
      // One record in seven has nothing on file, so the carousel's empty state
      // is a thing the screen actually reaches rather than a branch nobody
      // sees until a branch office submits a request without its documents.
      submittedIds:
        i % 7 === 3
          ? []
          : // A different starting ID per record, so all five kinds turn up
            // across the list rather than every request opening on a passport.
            Array.from({ length: 1 + (i % 3) }, (_, k) => {
              const { label, kind } =
                SUBMITTED_ID_KINDS[(i + k) % SUBMITTED_ID_KINDS.length];
              return {
                id: `${planholder.personId}-${kind}`,
                label,
                // Drawn from this planholder's own name and birthdate, so the
                // ID agrees with the profile beside it.
                imageUrl: idCardImageUrl({
                  kind,
                  firstName: planholder.firstName,
                  middleName: planholder.middleName,
                  lastName: planholder.lastName,
                  birthdate,
                  issuedDate: ropDate,
                  seed: i,
                }),
              };
            }),
      // ONE TO THREE SUBMITTED PAYOUTS, each on its own channel and each with
      // its own account and payee — which is the point of the panel's dropdown:
      // switching channel shows what was filed for that channel, not the same
      // account under a different name.
      payouts: Array.from({ length: 1 + (i % 3) }, (_, k) =>
        buildPayout(planholder, i, k),
      ),
      schedule: (() => {
        const contractPrice = CONTRACT_PRICES[i % CONTRACT_PRICES.length];
        return {
          mobileNo: `0917 ${String(200 + ((i * 37) % 800))} ${String(
            1000 + ((i * 131) % 9000),
          )}`,
          // Initials of the plan name, e.g. "ST. GEORGE" → "SG".
          planCode: planholder.planDescription
            .split(/[\s.]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join(""),
          contractPrice,
          dateApplied: `${year}-${String(month).padStart(2, "0")}-${String(
            day,
          ).padStart(2, "0")}`,
          amount: contractPrice / ROP_SCHEDULE_OPTIONS.length,
          scheduleNo: ROP_SCHEDULE_OPTIONS[i % ROP_SCHEDULE_OPTIONS.length],
          status: SCHEDULE_STATUS_CYCLE[i % SCHEDULE_STATUS_CYCLE.length],
          remarks: "Valid",
          notes: "",
        };
      })(),
      // THE RELEASES BEFORE THIS ONE, one a year, oldest first. One to four
      // of them — (1st), (1st, 2nd), up to (1st … 4th) — so the table is seen
      // both as a single row and as a run. Only the LATEST can still be
      // unclaimed (one record in four), which keeps the "No" badge and empty
      // Date Claimed reachable without an older release left hanging.
      history: (() => {
        const count = Math.max(1, i % ROP_SCHEDULE_OPTIONS.length);
        const payout = buildPayout(planholder, i, 0);
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        const claimedDd = String(Math.min(day + 7, 28)).padStart(2, "0");
        return Array.from({ length: count }, (_, k) => {
          const releaseYear = year - (count - k);
          const isClaimed = k < count - 1 || i % 4 !== 1;
          return {
            scheduleNo: ROP_SCHEDULE_OPTIONS[k],
            ropDate: `${releaseYear}-${mm}-${dd}`,
            isClaimed,
            dateClaimed: isClaimed ? `${releaseYear}-${mm}-${claimedDd}` : "",
            ropNo: `ROP-${releaseYear}-${String(4200 + i).padStart(4, "0")}`,
            batchNo: `BATCH-${releaseYear}-${String(100 + i + k).padStart(
              4,
              "0",
            )}`,
            payeeName: payout.payeeName,
            amount:
              CONTRACT_PRICES[i % CONTRACT_PRICES.length] /
              ROP_SCHEDULE_OPTIONS.length,
            channel: payout.channel,
          };
        });
      })(),
      // MONTHLY INSTALMENTS from the effectivity date, oldest first — six to
      // fifteen of them, so the dialog is seen both short and scrolling. The
      // pay class cycles through the ones posted on the account. One record in
      // eleven has none, so the dialog's empty state is reachable.
      payments: (() => {
        if (i % 11 === 10) return [];
        const count = 6 + (i % 10);
        const contractPrice = CONTRACT_PRICES[i % CONTRACT_PRICES.length];
        const payclassCount = 4 + (i % 3);
        return Array.from({ length: count }, (_, k) => {
          const monthsIn = month - 1 + k;
          const siYear = year - 5 + Math.floor(monthsIn / 12);
          const siMonth = (monthsIn % 12) + 1;
          return {
            siNo: `SI-${String(500000 + i * 100 + k).padStart(7, "0")}`,
            payclass: PAYCLASS_CODES[k % payclassCount],
            siDate: `${siYear}-${String(siMonth).padStart(2, "0")}-${String(
              Math.min(day, 28),
            ).padStart(2, "0")}`,
            siAmount: contractPrice / 60,
          };
        });
      })(),
      // A trail of one to five entries, so the remarks card is seen both
      // short and long enough to wrap over several lines.
      planholderRemarks: REMARK_ENTRIES.slice(0, 1 + (i % REMARK_ENTRIES.length))
        .map((entry) => entry(i))
        .join("; ")
        .concat(";"),
      planholderNotes: buildPlanholderNotes(planholder.lpaNumber, i),
    };
  });

/**
 * The records, as the screen would get them from an API.
 *
 * A PROMISE AND A DELAY, so the loading skeleton is a real state rather than a
 * branch nothing ever reaches. When this module gets a real endpoint, only the
 * inside of this function changes.
 */
export function fetchRopRecords(): Promise<RopRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ROP_RECORDS), 600);
  });
}
