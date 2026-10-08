// The selected plan's COFP and ROP standing, for the profile's COFP and ROP
// Details card (user, 2026-10-07).
//
// STAND-IN DATA. The profile has no COFP or ROP source yet, so these are
// derived from the plan itself, seeded by its LPA number so one plan always
// shows the same values. Replace `buildCofpRopDetails` with the real lookup
// when there is one; the card only reads the shape below.

import type { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { getPlanStatement } from "@/components/plan-management/planholder-profile/data/plan-statement";

export interface CofpDetails {
  cofpNo: string;
  memoNo: string;
  requestingBranch: string;
  isPrinted: boolean;
  serviceOnly: boolean;
  dateIssued: Date;
  /** Who the certificate was handed to; "NA" while it has not been. */
  releasedTo: string;
  confiscated: boolean;
}

export interface RopDetails {
  /** How many of the five yearly returns the plan is entitled to, from 1. */
  scheduleCount: number;
  isAssignable: boolean;
  isTransferable: boolean;
  /** The latest return released; none before the first. */
  lastRopDate?: Date;
  /** The next return due; none once the last has been released. */
  nextRopDate?: Date;
}

export interface CofpRopDetails {
  /** Only a fully paid plan has a certificate. */
  cofp?: CofpDetails;
  /** Whether the plan carries Return of Premium at all. */
  withRop: boolean;
  /**
   * ONLY WITH BOTH A COFP AND ROP (user, 2026-10-07): a return is paid on a
   * fully paid plan, so there are ROP details when there are COFP details and
   * the plan is one with Return of Premium — never otherwise.
   */
  rop?: RopDetails;
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

/** "1st", "1st to 2nd" … "1st to 5th", as the PIS screen words a schedule. */
export function ropScheduleLabel(count: number): string {
  const last = ORDINALS[Math.min(Math.max(count, 1), 5) - 1];
  return count <= 1 ? last : `1st to ${last}`;
}

function seedOf(lpaNumber: string): number {
  return [...lpaNumber].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function buildCofpRopDetails(plan: PlanDetailType): CofpRopDetails {
  const seed = seedOf(plan.lpaNumber);
  const statement = getPlanStatement(plan);
  const effectivity = new Date(plan.effectivityDate);
  const yy = String(effectivity.getFullYear()).slice(-2);

  const lastPayment = statement.paymentRecords[0]?.siDate ?? effectivity;
  const isPrinted = seed % 3 !== 0;
  const cofp: CofpDetails | undefined =
    statement.balance <= 0
      ? {
          cofpNo: `CF${yy}-${String(seed % 1000000).padStart(6, "0")}`,
          memoNo: `CFPM${yy}_${String(seed % 10000).padStart(7, "0")}`,
          requestingBranch: plan.branch,
          isPrinted,
          serviceOnly: plan.isServiceOnly,
          dateIssued: addDays(lastPayment, 18),
          releasedTo: isPrinted
            ? seed % 2 === 0
              ? "PLANHOLDER"
              : "BRANCH"
            : "NA",
          confiscated: seed % 7 === 4,
        }
      : undefined;

  // Yearly returns from the end of the paying term; some already released.
  const scheduleCount = 1 + (seed % 5);
  const released = seed % (scheduleCount + 1);
  const firstRop = addYears(effectivity, Math.max(Math.round(plan.term), 1));
  // Stand-in for the plan's own ROP flag, which the plan data does not have:
  // most plans carry it, some do not, so both cases are seen.
  const withRop = seed % 5 !== 2;
  return {
    cofp,
    withRop,
    rop:
      cofp && withRop
        ? {
            scheduleCount,
            isAssignable: seed % 2 === 0,
            isTransferable: seed % 4 !== 1,
            lastRopDate:
              released > 0 ? addYears(firstRop, released - 1) : undefined,
            nextRopDate:
              released < scheduleCount
                ? addYears(firstRop, released)
                : undefined,
          }
        : undefined,
  };
}
