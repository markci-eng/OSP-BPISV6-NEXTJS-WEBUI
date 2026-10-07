// THE PERIOD THE HISTORY CARD COUNTS — a day, a week, a month or a year, and
// which one. DAILY ADDED 2026-10-01 (user: "add also the per day").
//
// CUT BY WHEN THE USER ACTED, not when the claim was filed: the card answers
// "what did I do this week", and a claim filed in May and worked this morning
// is this week's work. See `ClaimAction.atISO`.
//
// WEEKLY BY DEFAULT, ON THE CURRENT WEEK (user, 2026-09-29). Weeks start on
// Monday.
//
// THE ARROWS NEVER GO WHERE THERE IS NOTHING (user, 2026-09-29):
//   - never past the current period — there is no future work to count;
//   - days, weeks and months stop at the first one holding any of the user's
//     work;
//   - years step only through years that hold some, skipping empty ones, so a
//     user whose work is all in this year cannot move at all.

export type HistoryRangeKind = "day" | "week" | "month" | "year";

export interface HistoryRange {
  kind: HistoryRangeKind;
  /** The first moment of the period, local time. */
  start: Date;
}

export const HISTORY_RANGE_OPTIONS: { value: HistoryRangeKind; label: string }[] =
  [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
    { value: "year", label: "Yearly" },
  ];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The start of the period of `kind` that holds `date`. */
export function periodStart(kind: HistoryRangeKind, date: Date): Date {
  if (kind === "year") return new Date(date.getFullYear(), 0, 1);
  if (kind === "month") return new Date(date.getFullYear(), date.getMonth(), 1);
  if (kind === "day")
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (date.getDay() + 6) % 7; // Monday = 0
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
}

/** The start of the period after this one. */
function nextStart(range: HistoryRange): Date {
  const { kind, start } = range;
  if (kind === "year") return new Date(start.getFullYear() + 1, 0, 1);
  if (kind === "month") return new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const days = kind === "day" ? 1 : 7;
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + days);
}

/** The current period of `kind`. */
export function currentRange(kind: HistoryRangeKind, today = new Date()): HistoryRange {
  return { kind, start: periodStart(kind, today) };
}

/** Whether an ISO timestamp falls inside the range. */
export function inRange(range: HistoryRange, iso: string): boolean {
  const at = new Date(iso);
  return at >= range.start && at < nextStart(range);
}

/**
 * Where each arrow goes, or `null` where it may not.
 *
 * `dates` are the user's action dates — every claim in their history, whatever
 * the period on screen.
 */
export function rangeSteps(
  range: HistoryRange,
  dates: string[],
  today = new Date(),
): { prev: HistoryRange | null; next: HistoryRange | null } {
  const { kind, start } = range;
  const current = periodStart(kind, today);

  if (kind === "year") {
    const years = Array.from(
      new Set(dates.map((iso) => new Date(iso).getFullYear())),
    ).sort((a, b) => a - b);
    const year = start.getFullYear();
    const before = years.filter((y) => y < year).pop();
    const after = years.find((y) => y > year && y <= current.getFullYear());
    return {
      prev: before === undefined ? null : { kind, start: new Date(before, 0, 1) },
      next: after === undefined ? null : { kind, start: new Date(after, 0, 1) },
    };
  }

  const earliest = dates.length
    ? periodStart(kind, new Date(dates.reduce((a, b) => (a < b ? a : b))))
    : current;

  const prevStart =
    kind === "month"
      ? new Date(start.getFullYear(), start.getMonth() - 1, 1)
      : new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() - (kind === "day" ? 1 : 7),
        );
  const after = nextStart(range);

  return {
    prev: prevStart >= earliest ? { kind, start: prevStart } : null,
    next: after <= current ? { kind, start: after } : null,
  };
}

/**
 * Where the history opens when the user switches to `kind`.
 *
 * The current period — except a YEAR with none of their work in it, which
 * cannot be shown (see the note at the top): the latest year that has some.
 */
export function rangeFor(
  kind: HistoryRangeKind,
  dates: string[],
  today = new Date(),
): HistoryRange {
  const current = currentRange(kind, today);
  if (kind !== "year" || dates.length === 0) return current;
  const years = dates.map((iso) => new Date(iso).getFullYear());
  if (years.includes(today.getFullYear())) return current;
  return { kind, start: new Date(Math.max(...years), 0, 1) };
}

/** The period as it reads on the stepper — "Sep 28 – Oct 4, 2026". */
export function rangeLabel(range: HistoryRange): string {
  const { kind, start } = range;
  if (kind === "year") return String(start.getFullYear());
  if (kind === "month") return `${MONTHS_FULL[start.getMonth()]} ${start.getFullYear()}`;
  // "Thu, Oct 1, 2026".
  if (kind === "day")
    return `${WEEKDAYS[start.getDay()]}, ${MONTHS[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`;
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

/**
 * Under the label: "Today", "This week", "Last month", "3 weeks ago" — none
 * for a past year.
 */
export function rangeHint(range: HistoryRange, today = new Date()): string | undefined {
  const { kind, start } = range;
  if (kind === "year") {
    return start.getFullYear() === today.getFullYear() ? "This year" : undefined;
  }
  const current = periodStart(kind, today);
  // Rounded, not floored: a day across a daylight-saving change is not 24h.
  const days = Math.round((current.getTime() - start.getTime()) / 86_400_000);
  if (kind === "day") {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }
  const back =
    kind === "month"
      ? (current.getFullYear() - start.getFullYear()) * 12 +
        current.getMonth() -
        start.getMonth()
      : Math.round(days / 7);
  const unit = kind === "month" ? "month" : "week";
  if (back === 0) return `This ${unit}`;
  if (back === 1) return `Last ${unit}`;
  return `${back} ${unit}s ago`;
}
