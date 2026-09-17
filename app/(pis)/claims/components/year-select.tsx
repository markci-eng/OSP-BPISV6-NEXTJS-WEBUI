"use client";

// WHICH YEAR A LIST OF CLAIMS COVERS.
//
// A COUNT WITHOUT A PERIOD IS NOT AN ANSWER. "65 claims" invites exactly one
// question — since when? — and a number that cannot be reconciled against
// anything is worse than no number, because it looks authoritative. Every list
// that shows a total has to be able to say what it is a total OF.
//
// THE YEAR IS NOT AN INVENTED BOUNDARY. It is already in the claim's own
// reference — CLBAGUIO*2026*ADB000013 — so the business issues and cuts claims
// by year, and a processor's count lines up with a report's rather than being a
// second, private figure. A rolling window would read better for "what is live"
// and reconcile against nothing.
//
// MEASURED ON THE FILED DATE, which is the one date every claim has: the
// incident predates the filing, the decision may never come, and a claim still
// waiting has neither. See {@link claimFiledYear}.

import { NativeSelect } from "@chakra-ui/react";
import { CONTROL_HEIGHT } from "../death-claim/components/DeathClaimsFilter";

/** A year, or every year on file. */
export type ClaimYear = number | "all";

/** The year a claim was filed in — the field every list is cut by. */
export function claimFiledYear(filedAt: string): number {
  return new Date(filedAt).getFullYear();
}

/**
 * The years present in a set of claims, newest first.
 *
 * READ OFF THE DATA rather than counted back from today, for the same reason
 * the branch and territory pickers are: a year with no claim in it is an option
 * that can only ever empty the list.
 */
export function claimYears(filedDates: string[]): number[] {
  return Array.from(new Set(filedDates.map(claimFiledYear))).sort(
    (a, b) => b - a,
  );
}

/**
 * Which year a list should open on.
 *
 * THIS YEAR IF THERE IS ONE, otherwise the most recent year that has claims —
 * never an empty list on arrival. In January that matters: a year turns over
 * before the first claim of it is filed, and a screen that opened on a year
 * with nothing in it would read as broken rather than as early.
 */
export function defaultClaimYear(years: number[]): ClaimYear {
  const thisYear = new Date().getFullYear();
  if (years.includes(thisYear)) return thisYear;
  return years[0] ?? thisYear;
}

/** How the period reads where it is stated rather than chosen. */
export function claimYearLabel(year: ClaimYear): string {
  return year === "all" ? "All years" : `Filed in ${year}`;
}

export function YearSelect({
  value,
  years,
  onChange,
}: {
  value: ClaimYear;
  /** The years on offer, newest first — see {@link claimYears}. */
  years: number[];
  onChange: (value: ClaimYear) => void;
}) {
  return (
    // Sized by whatever slot it is put in, and matched to the controls beside
    // it through `CONTROL_HEIGHT` — the same arrangement `NatureSelect` uses,
    // since the two usually stand next to each other.
    <NativeSelect.Root size="sm" w="full">
      <NativeSelect.Field
        aria-label="Filed year"
        h={CONTROL_HEIGHT}
        borderRadius="lg"
        bg="white"
        value={String(value)}
        onChange={(event) => {
          const next = event.currentTarget.value;
          onChange(next === "all" ? "all" : Number(next));
        }}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
        {/* LAST, not first. The default is a single year, and "All years" is the
            widening a reader reaches for once the year they meant has not got
            what they are looking for. */}
        <option value="all">All years</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export default YearSelect;
