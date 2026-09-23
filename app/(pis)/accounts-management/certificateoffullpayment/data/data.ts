import { COFP_MEMOS, COFP_REQUESTS } from "../../cofp/data/data";
import type { CofpRequest } from "../../cofp/data/types";
import type {
  CofpDeficiencyRequest,
  CofpPayment,
  CofpPlanholder,
  CofpView,
} from "./types";

/**
 * One plan holder to draw the card against while the screen has no source.
 *
 * A FULLY PAID account inside its contestable year, which is the state the COFP
 * screen is most often looking at: the balance is nil so the certificate can be
 * raised, and the contestability line is the one thing on the card still worth
 * stopping on. COFP Number is deliberately empty — the certificate has not been
 * numbered yet, and the dash is what that looks like.
 */
export const SAMPLE_COFP_PLANHOLDER: CofpPlanholder = {
  profile: {
    name: "Salazar, Bienvenido Cruz",
    lpaNo: "L25000678E",
    personId: "P25000678",
    isInsured: true,
    homeAddress: "101 Roxas Blvd., Brgy. Malate, Manila, Metro Manila",
    mobileNo: "0919 223 8877",
  },
  details: {
    birthdate: "1975-05-09",
    effectivityDate: "2025-11-20",
    terminationStatusCode: "NT",
    terminationStatusLabel: "Not Yet Terminated",
    accountStatusCode: "FP",
    accountStatusLabel: "Fully Paid",
    branchCode: "MANILA",
    branchName: "Manila Branch",
    planCode: "RF5M8",
    planDesc: "ST. FRANCIS",
    planClass: "RA",
    planValue: 100000,
    planTap: 114000,
    totalAmountPaid: 114000,
    balance: 0,
    contestability: "within",
  },
};

/**
 * How many rows a view hands the rail.
 *
 * Forty is what a rail can be scrolled through; the full set is branch-filtered
 * on the list screen, and this one takes the same treatment once it has a
 * branch picker.
 */
const RAIL_ROW_CAP = 40;

/** Transmittal memos still waiting to go out, by number. */
const PENDING_MEMO_NOS = new Set(
  COFP_MEMOS.filter((memo) => !memo.isTransmitted).map((memo) => memo.memoNo),
);

/**
 * Which of the COFP module's records belong under each action button.
 *
 * Drawn from the module's own records rather than a second generator, so both
 * screens list the same idea of a request. Each view is the set of certificates
 * its action can be taken on:
 *
 * - GENERATE is every request — the accounts a certificate can be raised for.
 *   Until the rail has a plan holder source of its own this is the whole list,
 *   which is what the screen showed before it had views.
 * - BATCH TRANSMITTAL is the printed certificates whose memo has not gone out.
 * - REPLACEMENT is the released ones: a certificate is only reissued once it has
 *   been handed over and then lost or damaged.
 * - The rest are the status of the same name.
 */
const VIEW_FILTERS: Record<CofpView, (request: CofpRequest) => boolean> = {
  GENERATE: () => true,
  FOR_PRINTING: (r) => r.status === "FOR_PRINTING",
  PRINTED: (r) => r.status === "PRINTED",
  BATCH_TRANSMITTAL: (r) =>
    r.status === "PRINTED" && !!r.memoNo && PENDING_MEMO_NOS.has(r.memoNo),
  RELEASED: (r) => r.status === "RELEASED",
  REPLACEMENT: (r) => r.status === "RELEASED",
  RETURN: (r) => r.status === "RETURNED",
  CONFISCATED: (r) => r.status === "CONFISCATED",
};

/** The requests the rail lists under a view. */
export function requestsFor(view: CofpView): CofpRequest[] {
  return COFP_REQUESTS.filter(VIEW_FILTERS[view]).slice(0, RAIL_ROW_CAP);
}

/**
 * Accounts a certificate was asked for that are still short (user, 2026-09-22).
 *
 * A SECOND LIST UNDER GENERATE, not rows mixed into the first: these are the
 * requests Generate cannot act on, and the whole reason to show them is that
 * somebody has to chase the balance before the certificate can be raised.
 *
 * Taken from the tail of the module's records so the two lists under Generate
 * are different accounts, and the amounts are spread across the small change a
 * final billing leaves behind up to a whole missed installment. `balance` on
 * the plan holder card is this figure, so a picked row explains itself.
 */
export const COFP_DEFICIENCY_REQUESTS: CofpDeficiencyRequest[] =
  COFP_REQUESTS.slice(-14).map((request, i) => ({
    ...request,
    // Still queued whatever the source record was: nothing has been printed
    // for one of these, so the card shows no COFP number against it.
    status: "FOR_PRINTING",
    memoNo: undefined,
    deficiency: 250 + (i % 7) * 675,
  }));

/**
 * The deficiency rows a view lists under its own.
 *
 * Only Generate has any: every other view is a certificate that has already
 * been raised, by which point the account was settled.
 */
export function deficienciesFor(view: CofpView): CofpDeficiencyRequest[] {
  return view === "GENERATE" ? COFP_DEFICIENCY_REQUESTS : [];
}

/** Pay classes a payment is collected under. */
const PAY_CLASSES = ["REGULAR", "ADVANCE", "CASH", "SPECIAL"] as const;

/**
 * The payments posted against a plan, newest first.
 *
 * DERIVED FROM THE LPA NUMBER, so a plan holder keeps the same ledger every
 * time their row is picked rather than being handed a fresh set of random
 * amounts on each render. The digits of the LPA seed it: same plan, same
 * payments, no store to hold them in.
 *
 * Twenty-four lines — two years of monthly installments, which is more than
 * the ten the card shows at once and so exercises its paging.
 */
export function paymentsFor(lpaNo: string): CofpPayment[] {
  const seed = Number(lpaNo.replace(/\D/g, "").slice(-4)) || 0;
  const count = 24;

  return Array.from({ length: count }, (_, i) => {
    // Installments run forward in time, so the newest is the highest number
    // and sits at the top of the list.
    const installment = count - i;
    const monthIndex = (seed + installment) % 24;
    const year = 2024 + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const day = ((seed + installment * 3) % 27) + 1;

    return {
      LPANo: lpaNo,
      Payclass: PAY_CLASSES[(seed + installment) % PAY_CLASSES.length],
      SINo: `SI-${String(100000 + seed * 24 + installment)}`,
      SIDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      // A steady monthly installment, with the odd larger one where a plan
      // holder paid two at once.
      SIAmount: installment % 7 === 0 ? 9500 : 4750,
      InstallmentNo: installment,
    };
  });
}

/** "Bienvenido Salazar" → "Salazar, Bienvenido" — how a certificate prints it. */
function surnameFirst(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts.pop() as string;
  return `${last}, ${parts.join(" ")}`;
}

/**
 * The plan holder card's view-model for a picked request.
 *
 * A request carries WHO and WHICH PLAN — name, LPA number, address, branch, plan
 * and what has been paid — and nothing about the underwriting. Those facts come
 * off {@link SAMPLE_COFP_PLANHOLDER} until there is a source to read them from,
 * so the card stays whole and only what the request actually knows changes with
 * the selection.
 */
export function planholderFor(
  request: CofpRequest | CofpDeficiencyRequest,
): CofpPlanholder {
  // A row off the deficiency list carries what it is short, and the card's own
  // Balance and Account Status are exactly where that belongs — the two fields
  // a processor reads to see why the certificate cannot go out.
  const deficiency = "deficiency" in request ? request.deficiency : 0;

  return {
    profile: {
      ...SAMPLE_COFP_PLANHOLDER.profile,
      name: surnameFirst(request.planholderName),
      lpaNo: request.lpaNo,
      // Keys the mock avatar — one face per plan holder, steady across renders.
      personId: request.lpaNo,
      homeAddress: request.planholderAddress,
    },
    details: {
      ...SAMPLE_COFP_PLANHOLDER.details,
      branchCode: request.branchCode,
      branchName: undefined,
      planCode: request.planType,
      planDesc: request.planName,
      totalAmountPaid: request.totalAmountPaid,
      balance: deficiency,
      // "FP" only while there is nothing left to pay. The card colours
      // anything else as a warning, which is the point: an account with a
      // deficiency is one the certificate cannot be raised on.
      accountStatusCode: deficiency ? "AC" : "FP",
      accountStatusLabel: deficiency ? "Active" : "Fully Paid",
      // Numbered only once the certificate has been printed; a request still
      // queued for printing has no number yet and shows the dash.
      cofpNumber:
        request.status === "FOR_PRINTING" ? undefined : request.cfpNumber,
    },
  };
}
