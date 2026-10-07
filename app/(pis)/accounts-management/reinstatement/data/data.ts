// The Reinstatement records the list shows.
//
// Built from the planholder lookup, the same as the ROP records, so every row
// is a real planholder on file rather than an invented name.

import { planholderLookup } from "../../planholder-profile/data/planholder-lookup";
import { buildPlanholderNotes } from "../../return-of-premium/data/data";
import { idCardImageUrl, type IdCardKind } from "./id-card";
import { riFormImageUrl } from "./ri-form";
import { serviceInvoiceImageUrl } from "./service-invoice";
import type {
  PayClass,
  ReinstatementAccountDetails,
  ReinstatementPayment,
  ReinstatementPlanInfo,
  ReinstatementRecord,
  ReinstatementStatus,
  SubmittedDocument,
} from "./types";

export const REINSTATEMENT_STATUS_OPTIONS: ReinstatementStatus[] = [
  "For Process",
  "Pending",
  "Approved",
  "Denied",
];

/** How a status reads as a badge on the list rows. */
export const REINSTATEMENT_STATUS_BADGE: Record<
  ReinstatementStatus,
  "success" | "info" | "warning" | "danger"
> = {
  "For Process": "info",
  Pending: "warning",
  Approved: "success",
  Denied: "danger",
};

// Weighted so the queue is mostly work still to be done, and every one of the
// list's status views has rows in it.
const STATUS_CYCLE: ReinstatementStatus[] = [
  "For Process",
  "Pending",
  "For Process",
  "Approved",
  "For Process",
  "Denied",
  "Pending",
];

/** How many of the planholders on file have a reinstatement raised. */
const RECORD_COUNT = 28;

/** Local-calendar ISO date, so a midnight `Date` does not slip a day in UTC. */
function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

const PLAN_CODES: Record<string, string> = {
  "ST. GEORGE": "SGC",
  "ST. FRANCIS": "SFC",
  "ST. ANNE": "SAC",
  "ST. PETER": "SPC",
};

const BRANCHES = ["ZAMBOE", "CEBU", "DAVAO", "QUEZON", "ILOILO", "MAKATI"];

// Mock contract prices, stepped so the cards show a spread of amounts.
const CONTRACT_PRICES = [48000, 53000, 65000, 72000, 88000, 105000];

type Planholder = (typeof planholderLookup)[number];

function buildPlanInfo(
  planholder: Planholder,
  i: number,
): ReinstatementPlanInfo {
  const dueDate = new Date(planholder.dueDate);
  const contractPrice = CONTRACT_PRICES[i % CONTRACT_PRICES.length];
  const balance = planholder.balance;
  // One installment's worth, and a reinstatement fee on top of what is due.
  const amount = Math.round(contractPrice / 5);
  const reinstatementFee = 500;

  return {
    planDescription: planholder.planDescription,
    planCode: `${PLAN_CODES[planholder.planDescription] ?? "PLN"}-${String(
      (i % 9) + 1,
    ).padStart(2, "0")}`,
    newEffectivityDate: toIso(addMonths(dueDate, 13)),
    dueDate: toIso(dueDate),
    // Lapses a month after the missed due date; forfeits two years after that.
    lapsationDate: toIso(addMonths(dueDate, 1)),
    forfeitureDate: toIso(addMonths(dueDate, 25)),
    amount,
    balance,
    contractPrice,
    originatingBranch: planholder.branch,
    totalAmountPayable: amount + reinstatementFee,
  };
}

const PAY_CLASSES: PayClass[] = ["NS", "DC", "RI", "TF", "TI", "UP", "SV"];

/** Pay classes that post a flat fee rather than an installment's amount. */
const FEE_PAY_CLASSES: PayClass[] = ["RI", "TF"];

/**
 * Pay classes a reinstatement ledger must carry at least one of. The latest
 * line is always one of these, rotated by record, so every ledger shows one.
 * When that line is a TI, the one before it is an RI, so every ledger also
 * has the RI or TF payment its Service Invoice is issued for.
 */
const REINSTATEMENT_PAY_CLASSES: PayClass[] = ["TF", "TI", "RI"];

/**
 * The installments paid up to the due date that was missed, oldest first.
 * The count varies by record so the table's pager is exercised on some.
 */
function buildPayments(
  plan: ReinstatementPlanInfo,
  i: number,
): ReinstatementPayment[] {
  const count = 3 + (i % 12);
  const dueDate = new Date(plan.dueDate);
  const latest = REINSTATEMENT_PAY_CLASSES[i % REINSTATEMENT_PAY_CLASSES.length];

  return Array.from({ length: count }, (_, n): ReinstatementPayment => {
    const siDate = addMonths(dueDate, n - count);
    const auditDate = new Date(siDate);
    auditDate.setDate(auditDate.getDate() + 2);
    const payClass: PayClass =
      n === count - 1
        ? latest
        : n === count - 2 && latest === "TI"
          ? "RI"
          : PAY_CLASSES[(i + n) % PAY_CLASSES.length];

    return {
      id: `${i}-${n}`,
      payClass,
      siNo: `SI-${String(100000 + i * 100 + n)}`,
      siDate: toIso(siDate),
      siAmount: FEE_PAY_CLASSES.includes(payClass) ? 500 : plan.amount,
      planCode: plan.planCode,
      auditDate: toIso(auditDate),
    };
  });
}

function buildAccountDetails(
  planholder: Planholder,
  i: number,
): ReinstatementAccountDetails {
  const dueDate = new Date(planholder.dueDate);
  const withCofp = i % 3 === 0;
  const deceased = i % 7 === 5;

  return {
    accountStatus: planholder.accountStatus,
    terminationStatus: planholder.terminationStatus,
    dateOfDeath: deceased ? toIso(addMonths(dueDate, 3)) : undefined,
    accountVerified: i % 5 !== 2,
    withCofp,
    cofpNo: withCofp ? `COFP-${String(20250 + i).padStart(6, "0")}` : undefined,
    lastRiPayment: i % 4 === 1 ? undefined : toIso(addMonths(dueDate, -1)),
    lastTfPayment: i % 6 === 4 ? undefined : toIso(addMonths(dueDate, -2)),
    requestingBranch: BRANCHES[i % BRANCHES.length],
  };
}

/** Supporting documents filed after the three required ones on some requests. */
const SUPPORTING_DOCUMENT_LABELS = ["Statement of Good Health"];

/**
 * The documents filed with the request.
 *
 * EVERY REQUEST CARRIES THE THREE REQUIRED DOCUMENTS, in this order: the RI
 * form, a valid ID with signature, and the Service Invoice for the RI or TF
 * payment. A reinstatement is not raised without all three. They are drawn
 * from the record itself (`ri-form.ts`, `id-card.ts`, `service-invoice.ts`),
 * so they show this planholder's name, birthdate and one shared address, and
 * the invoice is the latest RI or TF line in the ledger. The ID alternates
 * between a National ID and a Driver's License. A supporting document follows
 * on some requests; that is an external placeholder keyed by the document,
 * the same as ROP's submitted IDs.
 */
function buildSubmittedDocuments(
  planholder: Planholder,
  i: number,
  record: {
    lpaNo: string;
    plan: ReinstatementPlanInfo;
    payments: ReinstatementPayment[];
    birthdate: string;
    requestDate: string;
    insurability: ReinstatementRecord["insurability"];
  },
): SubmittedDocument[] {
  const riForm: SubmittedDocument = {
    id: `${planholder.personId}-${record.lpaNo}-RI-FORM`,
    label: "Application for Reinstatement (RI Form)",
    imageUrl: riFormImageUrl({
      formNo: String(593379 + i * 17),
      lpaNo: record.lpaNo,
      firstName: planholder.firstName,
      middleName: planholder.middleName,
      lastName: planholder.lastName,
      planType: record.plan.planDescription,
      contractPrice: record.plan.contractPrice,
      installment: record.plan.amount,
      dueDate: record.plan.dueDate,
      birthdate: record.birthdate,
      signedDate: record.requestDate,
      mode: planholder.mode,
      insurable: record.insurability === "Insurable",
      branch: planholder.branch,
      seed: i,
    }),
  };

  const idKind: IdCardKind = i % 2 === 0 ? "national-id" : "drivers-license";
  const validId: SubmittedDocument = {
    id: `${planholder.personId}-${record.lpaNo}-${idKind}`,
    label:
      idKind === "national-id"
        ? "Valid ID with Signature — Philippine National ID"
        : "Valid ID with Signature — Driver's License",
    imageUrl: idCardImageUrl({
      kind: idKind,
      firstName: planholder.firstName,
      middleName: planholder.middleName,
      lastName: planholder.lastName,
      birthdate: record.birthdate,
      issuedDate: record.requestDate,
      seed: i,
    }),
  };

  // `buildPayments` guarantees an RI or TF line; the fallback only keeps the
  // type narrow.
  const feePayment =
    [...record.payments]
      .reverse()
      .find((payment) => FEE_PAY_CLASSES.includes(payment.payClass)) ??
    record.payments[record.payments.length - 1];
  const serviceInvoice: SubmittedDocument = {
    id: `${planholder.personId}-${record.lpaNo}-SI-${feePayment.siNo}`,
    label: `Service Invoice — ${feePayment.payClass} Payment`,
    imageUrl: serviceInvoiceImageUrl({
      siNo: feePayment.siNo,
      siDate: feePayment.siDate,
      lpaNo: record.lpaNo,
      firstName: planholder.firstName,
      middleName: planholder.middleName,
      lastName: planholder.lastName,
      planType: record.plan.planDescription,
      payClass: feePayment.payClass,
      amount: feePayment.siAmount,
      branch: planholder.branch,
      seed: i,
    }),
  };

  const supporting = SUPPORTING_DOCUMENT_LABELS.slice(
    0,
    i % (SUPPORTING_DOCUMENT_LABELS.length + 1),
  ).map((label): SubmittedDocument => {
    const id = `${planholder.personId}-RI-${label}`;
    return {
      id,
      label,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(id)}/960/600`,
    };
  });

  return [riForm, validId, serviceInvoice, ...supporting];
}

/**
 * The plan holder module's remark lines, in the module's own format, oldest
 * first, each with the moment it was added (the time its text carries).
 */
const REMARK_ENTRIES: ((i: number) => { remarks: string; dateAdded: string })[] = [
  () => ({
    remarks:
      "AVS 11/29/2024 01:57:16 PM BM: Accounts Verification INQUIRY TYPE: EMAIL",
    dateAdded: "2024-11-29T13:57:16",
  }),
  () => ({
    remarks: "LAPSED BY: SYSTEM 01/05/2025 12:00:00 AM",
    dateAdded: "2025-01-05T00:00:00",
  }),
  (i) => ({
    remarks: `RI#RILUPON${25001310 + i} FILED BY BRANCH 08/14/2026 10:22:41 am`,
    dateAdded: "2026-08-14T10:22:41",
  }),
  () => ({
    remarks: "AVB:AAVS 08/21/2026 07:12:37 PM Chapel: MATI INQUIRY TYPE: EMAIL",
    dateAdded: "2026-08-21T19:12:37",
  }),
  () => ({
    remarks: "RI ENDORSED FOR APPROVAL BY: JENNILYN 09/02/2026 8:29:04 am",
    dateAdded: "2026-09-02T08:29:04",
  }),
];

export const REINSTATEMENT_RECORDS: ReinstatementRecord[] = planholderLookup
  .slice(0, RECORD_COUNT)
  .map((planholder, i): ReinstatementRecord => {
    const monthIndex = i % 24;
    const year = 2025 + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const day = (i % 27) + 1;
    const plan = buildPlanInfo(planholder, i);
    const payments = buildPayments(plan, i);
    const lpaNo = planholder.lpaNumber;
    const requestDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    // Same spread as the ROP records — 34 to 61 — so the Age line varies.
    const birthdate = `${1965 + (i % 28)}-${String((i % 12) + 1).padStart(
      2,
      "0",
    )}-${String((i % 27) + 1).padStart(2, "0")}`;
    // Roughly one in four comes back not insurable.
    const insurability: ReinstatementRecord["insurability"] =
      i % 4 === 3 ? "Not Insurable" : "Insurable";
    // A trail of one to five entries, so the remarks card is seen both short
    // and long enough to wrap over several lines.
    const remarkEntries = REMARK_ENTRIES.slice(
      0,
      1 + (i % REMARK_ENTRIES.length),
    ).map((entry) => entry(i));

    return {
      id: `RI-${String(i + 1).padStart(4, "0")}`,
      // Surname first, the way every other list in the module prints it.
      planholderName: `${planholder.lastName}, ${planholder.firstName}`,
      lpaNo,
      requestDate,
      branch: planholder.branch,
      personId: planholder.personId,
      birthdate,
      insurability,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      plan,
      account: buildAccountDetails(planholder, i),
      payments,
      submittedDocuments: buildSubmittedDocuments(planholder, i, {
        lpaNo,
        plan,
        payments,
        birthdate,
        requestDate,
        insurability,
      }),
      planholderRemarks: remarkEntries
        .map((entry) => entry.remarks)
        .join("; ")
        .concat(";"),
      remarksHistory: remarkEntries
        .map((entry, n) => ({ id: `${lpaNo}-RM-${n + 1}`, lpaNo, ...entry }))
        .reverse(),
      planholderNotes: buildPlanholderNotes(planholder.lpaNumber, i),
    };
  });

/**
 * The records, as the screen would get them from an API — a promise and a
 * delay so the loading skeleton is a real state.
 */
export function fetchReinstatementRecords(): Promise<ReinstatementRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(REINSTATEMENT_RECORDS), 600);
  });
}
