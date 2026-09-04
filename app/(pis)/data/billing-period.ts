// The billing period, and the code a chapel's period is known by.
//
// WHY THIS IS IN THE DATA LAYER rather than in service payables, where it was
// written. The billing code is a COLUMN — `TblBillingHdr.BillingCode`, and the
// key every `TblICIS_Billing_Processed` row carries — so the seed has to be able
// to write one, and the seed cannot reach into a feature module. The period
// arithmetic goes with it because the code is made of it.
//
// `service-payables-data` re-exports the whole of this file, so the screens that
// read a period still read one module.

/**
 * A month is cut into four billing periods, and the split is by half-month
 * rather than by seven-day weeks: the 1st–15th is broken into 1–7 and 8–15, and
 * the 16th–end-of-month into 16–22 and 23–EOM.
 *
 * Only the fourth cut varies in length — it absorbs the 6, 7, 8 or 9 days left
 * in the month — so the cut number is always 1 to 4, whatever the month, and
 * every day of the year falls in exactly one of them.
 */
const CUT_START_DAYS = [1, 8, 16, 23] as const;

/** How many cuts a month has. Always this many; see {@link CUT_START_DAYS}. */
export const CUTS_PER_MONTH = CUT_START_DAYS.length;

/** A billing period: one cut of one month. */
export interface BillingPeriod {
  year: number;
  /** 0-based, as `Date` counts them. */
  month: number;
  /** 1 to 4 — see {@link CUT_START_DAYS}. */
  cut: number;
}

const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAME = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

/** Days in a month, `month` 0-based. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Which cut a day of the month falls in. Total: every day lands in one. */
export function cutForDay(day: number): number {
  // Walked backwards so the LAST start day not after `day` wins, which is what
  // makes cut 4 open-ended without naming an end for it.
  for (let i = CUT_START_DAYS.length - 1; i >= 0; i--) {
    if (day >= CUT_START_DAYS[i]) return i + 1;
  }
  return 1;
}

/** The period an ISO date falls in. */
export function periodOf(iso: string): BillingPeriod {
  const d = new Date(iso);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    cut: cutForDay(d.getDate()),
  };
}

/** The first and last day of a period, as ISO dates. */
export function cutRange(period: BillingPeriod): { fromISO: string; toISO: string } {
  const { year, month, cut } = period;
  const from = CUT_START_DAYS[cut - 1];
  const to =
    cut === CUTS_PER_MONTH
      ? daysInMonth(year, month)
      : CUT_START_DAYS[cut] - 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    fromISO: `${year}-${pad(month + 1)}-${pad(from)}`,
    toISO: `${year}-${pad(month + 1)}-${pad(to)}`,
  };
}

/** "AUGUST 1-7, 2026" — how a period is written on the billing tables. */
export function periodLabel(period: BillingPeriod): string {
  const { fromISO, toISO } = cutRange(period);
  const from = Number(fromISO.slice(-2));
  const to = Number(toISO.slice(-2));
  return `${MONTH_NAME[period.month]} ${from}-${to}, ${period.year}`;
}

/** Sortable key for a period — chronological order is string order. */
export function periodKey(period: BillingPeriod): string {
  return `${period.year}${String(period.month + 1).padStart(2, "0")}${period.cut}`;
}

/**
 * STAND-IN: how long after the death the chapel renders the service.
 *
 * A wake runs a few days and the interment closes it, so the service date — the
 * one that decides which period the payable falls in — is a few days after the
 * date of death rather than the same day. Fixed rather than varied, because
 * nothing on file records it and a varying gap would only be noise.
 *
 * IT IS A STAND-IN BECAUSE THE COLUMN DOES NOT EXIST.
 * `TblICIS_Billing_Processed` carries the date of DEATH and no service date at
 * all, so every reader of that table has to answer this question the same way or
 * two screens will put one service in two periods. Answered here, once.
 */
export const SERVICE_DAYS_AFTER_DEATH = 3;

/** When the chapel rendered the service, from the date of death. */
export function serviceDateFor(dateOfDeathISO: string): string {
  const d = new Date(dateOfDeathISO);
  d.setDate(d.getDate() + SERVICE_DAYS_AFTER_DEATH);
  return d.toISOString().slice(0, 10);
}

/**
 * The mark a franchise's billing code carries — see {@link billingCodeFor}.
 *
 * A SUFFIX and not a prefix, so the chapel handle still leads: codes sort into
 * chapel order either way a list is sorted, and the six characters a reader
 * scans for are in the same place on every row.
 */
export const FRANCHISE_CODE_SUFFIX = "-FR";

/**
 * The billing code for a chapel's period: chapel code, cut number, month, and
 * the 2-digit year — "DONSOL1AUG26", "NAGA1AUG26", "LEGASP1JUN20".
 *
 * The chapel code is whatever length it is (4 to 6 characters), which is why
 * nothing here is padded or fixed-width.
 *
 * A FRANCHISE'S CODE SAYS SO: "ROSARI1JUN26-FR". A franchise is not a chapel
 * with a different owner — it is a different PROCESS. Its billing may have to be
 * raised before it has a single plan holder on it, its plan holders may be keyed
 * in by hand from paper, and its endorsements are the ones whose names disagree
 * with the plan. That distinction is drawn on the card and on the row as a chip,
 * but a chip only exists on this screen: the code is what gets written on a
 * voucher, read down a phone and pasted into an email, and it should carry the
 * one fact that changes how the billing is worked.
 *
 * `isFranchise` is a PARAMETER rather than a lookup so this stays pure and the
 * seed can call it while it is still building the chapels. The one answer per
 * chapel is guaranteed one level up instead: the codes are written onto the
 * `TblICIS_Billing_Processed` rows once, at seed time, and every reader takes
 * the code off the row rather than deriving its own.
 */
export function billingCodeFor(
  chapelCode: string,
  period: BillingPeriod,
  isFranchise = false,
): string {
  const code = `${chapelCode}${period.cut}${MONTH_ABBR[period.month]}${String(period.year).slice(-2)}`;
  return isFranchise ? `${code}${FRANCHISE_CODE_SUFFIX}` : code;
}

/**
 * The period a billing code encodes — the inverse of {@link billingCodeFor}.
 *
 * WHY A READER NEEDS IT. The code is written onto every `TblBillingHdr` row and
 * the period is not a column beside it, so anything that groups, sorts or dates
 * a billing has to get the period back out of the code. Reading it is exact:
 * the code is made of the period, not merely stamped with it.
 *
 * The chapel code is taken rather than guessed at, because a chapel handle is 4
 * to 6 characters and nothing in the code says where it ends. Returns nothing
 * for a code that is not this chapel's, or whose tail is not a cut, a month and
 * a year — a caller that gets nothing has a code from somewhere else.
 */
export function periodFromBillingCode(
  billingCode: string,
  chapelCode: string,
): BillingPeriod | undefined {
  const { period: tail } = splitBillingCode(billingCode, chapelCode);
  const match = /^([1-4])([A-Z]{3})(\d{2})/.exec(tail);
  if (!match) return undefined;

  const month = MONTH_ABBR.indexOf(match[2]);
  if (month < 0) return undefined;

  return {
    year: 2000 + Number(match[3]),
    month,
    cut: Number(match[1]),
  };
}

/**
 * A billing code split into the half that identifies it and the half that does
 * not — the chapel handle, then the period (and the franchise mark).
 *
 * WHY A LIST OF CODES NEEDS THIS. Every billing in a territory is usually the
 * same cut of the same month, so the tail is IDENTICAL down the whole stack:
 * twelve of Central Luzon 1's thirteen read "…3JUL26". Drawn at one weight, a
 * code is twelve characters of which only the first six carry the difference,
 * and the eye has to find them again on every row. Split here, the tail can be
 * dimmed wherever a list of codes is drawn — the difference leads, and nothing
 * is taken away from someone reading the code to quote it.
 *
 * The inverse of {@link billingCodeFor}, and next to it deliberately: the two
 * agree about where the chapel handle ends because they are read together.
 *
 * The handle is never assumed to fit — a code that does not start with its own
 * chapel's is returned whole, with an empty tail, rather than cut at a length
 * that would land mid-word.
 */
export function splitBillingCode(
  billingCode: string,
  chapelCode: string,
): { handle: string; period: string } {
  if (!chapelCode || !billingCode.startsWith(chapelCode)) {
    return { handle: billingCode, period: "" };
  }
  return {
    handle: chapelCode,
    period: billingCode.slice(chapelCode.length),
  };
}
