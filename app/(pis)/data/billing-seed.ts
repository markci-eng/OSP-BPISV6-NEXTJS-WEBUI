// The service-payable billing tables, DERIVED rather than seeded.
//
// `TblBillingHdr` and `TblICIS_Billing_Processed` are real tables and this file
// is not pretending otherwise — what it does is answer the question the drop
// left open: no rows came with the structure, and the rows cannot be invented
// freely either, because every one of them has to name a chapel, a plan and a
// death that the rest of the seed already agrees about.
//
// So they are built from what IS on file. A plan holder with a death claim is a
// plan holder who died; a death is what a chapel renders service for; a chapel's
// services in one period are one billing. Everything below is that sentence,
// with the stand-ins it needs marked as such.
//
// WHY IT IS HERE AND NOT IN `seed.ts`: the derivation needs the JOINS — the plan
// holder's name and plan, the branch behind a claim, the chapels of a territory
// — and those live on the mock DB. `database.ts` calls `buildBillingTables(this)`
// once, lazily, and hands itself in; nothing here imports the database at
// runtime, so there is no cycle.
//
// WHAT IS NOT BUILT HERE: `TblClaimsSP`. Those rows are written as a processor
// terminates each account, and for the billings this file marks as already
// billed there is no honest way to say which accounts were terminated — the
// deficiency that decides billability is a stand-in belonging to the read model
// (see `service-payables-data`), not a fact this layer holds. The table is
// written this session and read back, which is the half of it the rules
// describe.

import {
  billingCodeFor,
  cutRange,
  periodKey,
  periodLabel,
  periodOf,
  serviceDateFor,
  type BillingPeriod,
} from "./billing-period";
import { toFullName } from "./models";
import type {
  BillingHdrRecord,
  ChapelBranch,
  ClaimsBillingRecord,
  IcisBillingProcessedRecord,
  PersonName,
  Planholder,
} from "./models";
import type { PisDatabase } from "./database";
// The one value this file reads out of the seed rather than off the database:
// who each assigned plan was spent on. See `assignedEndorsements`.
import { assignedDeceasedByLpa } from "./seed";

/** The four tables, as one build. */
export interface BillingTables {
  billingHdr: BillingHdrRecord[];
  billingProcessed: IcisBillingProcessedRecord[];
  claimsBilling: ClaimsBillingRecord[];
}

/**
 * The company that owes a chapel service payable — `TblBillingHdr.Company` and
 * `TblClaimsBilling.Company`.
 *
 * Exported because a billing raised in the browser has to carry the same string
 * as one that was already on file, and there is only one company in this data.
 */
export const BILLING_COMPANY = "ST. PETER LIFE PLAN, INC.";

/**
 * Fewest services a chapel will endorse in one report.
 *
 * A chapel does not send in a billing for a single funeral if it can avoid it.
 * The rule it works to: report three or more, and if a transaction week comes
 * up short, carry those services into the next week and report them together.
 *
 * A report of one or two is therefore legitimate but rare — it means the chapel
 * had nothing left to add to it, which in this data is the tail of its history.
 * That is exactly how {@link assignReportPeriods} produces them: by carrying
 * forward until the count is reached, and letting whatever remains at the end
 * stand on its own.
 *
 * A service the chapel is still HOLDING gets no row in
 * `TblICIS_Billing_Processed` at all — it has not been endorsed, so the source
 * system has never heard of it.
 */
const MIN_SERVICES_PER_REPORT = 3;

/**
 * Roughly how many services one chapel handles across the whole file — the
 * number that decides how many chapels in a territory are ACTIVE.
 *
 * Without this, 65 services spread across 132 chapels gave nearly every chapel
 * exactly one, and a billing per chapel per week of one service each. Real
 * chapels are not evenly busy: a territory's funerals concentrate on the few
 * that serve its populated towns, and the rest report nothing most weeks.
 *
 * Four is chosen against {@link MIN_SERVICES_PER_REPORT}: it leaves a chapel
 * with enough services to make three-plus reports the normal case and one-off
 * reports the exception, which is the shape being modelled.
 */
const SERVICES_PER_ACTIVE_CHAPEL = 4;

/**
 * STAND-IN: how many plans that CANNOT BE SERVICED are endorsed for service
 * anyway. ONE.
 *
 * A branch does not endorse a plan it cannot claim on — returned as premium, or
 * never fully paid — so those plans do not normally reach a billing at all. When
 * one slips through it is the exception the For Process screen exists to catch,
 * and it is one half of what a discrepancy is (see `DiscrepancyKind` in
 * `service-payables-data`).
 *
 * Deriving a row for every one of them, which is what this did until the
 * 2026-08-24 rules, put a dozen unanswerable payables on a screen of fifty and
 * made the exception look like the rule. The plans themselves are untouched:
 * their ROP and lapsed states are real facts read by the rest of the claims
 * area.
 */
const UNSERVICEABLE_ENDORSED = 1;

/**
 * STAND-IN: how many endorsements carry a plan holder's name that does not match
 * the plan. ONE.
 *
 * A COUNT AND NOT A RATE. A discrepancy of any kind happens about once in a
 * thousand services, and with fewer than a hundred services on file the honest
 * figure here would be nought. It is one rather than nought because a path
 * nobody can reach is a path nobody can check — Resolve Discrepancy, the mark on
 * the row, the supplementary route for a correction after endorsement all need a
 * single example to stand on.
 *
 * ONLY FRANCHISES, which is the RULE rather than the stand-in (2026-08-25): an
 * owned chapel endorses through the system, so the name it sends is the plan's
 * and cannot disagree with it. A franchise sends paper, and paper carries
 * whatever the family said at the counter. What is invented here is only how
 * often and in what way.
 */
const NAME_MISMATCHES = 1;

/**
 * STAND-IN: how long after a period closes its billings are still unbilled.
 *
 * A chapel's period has to close before it can be billed, and the paperwork
 * takes a while after that — so recent periods are the ones sitting in "For
 * Process" (no `TblClaimsBilling` row at all) and older ones have been billed
 * and moved along.
 *
 * Measured against the LATEST service in the data rather than against the clock,
 * deliberately: the seed's dates do not move, so anchoring to today would
 * quietly empty the queue as the months passed, and would give the server and
 * the browser different answers either side of midnight.
 */
const BILLING_LAG_DAYS = 45;

/**
 * STAND-IN: the number an already-billed period carries.
 *
 * Numbered from a base high enough to leave room below it, so the numbers a user
 * mints this session (which continue from the highest of these) look like later
 * entries in the same year's run rather than starting from one.
 */
const SEEDED_BILLING_BASE = 4000;

/**
 * STAND-IN: how far along an already-billed period is — 0 processed (For
 * Verification), 1 verified (For Approval), 2 approved (For Endorsement).
 *
 * WEIGHTED, AND IT USED TO BE `index % 3` (2026-08-26). Nothing on file says
 * which of the three a billed period has reached, so something has to decide;
 * the flat cycle decided "a third each", which is the one shape a queue is
 * never in. Work ARRIVES at For Verification and DRAINS through the two behind
 * it, so the pile waiting to be verified is the deepest by a distance and the
 * approved one — already endorsed, on its way out of the module — is the
 * shallowest. Five, two and one of every eight.
 *
 * It matters more than a stand-in usually would because For Verification is the
 * only one of the three with a screen built: a third of the history was a
 * one-billing page (see the billed-history block above, which is the other half
 * of this repair).
 *
 * The ladder's own shape is the trick `CREDIT_OF_SERVICE_LADDER` uses — slots
 * rather than a rate, so the spread is exact and repeatable at any file size.
 */
const BILLED_STAGE_LADDER = [0, 0, 1, 0, 0, 2, 0, 1];

/**
 * The processors who put billings through — the REAL service payables desk
 * (user, 2026-09-14).
 *
 * IT WAS FIVE INVENTED NAMES until then: the signed-in user plus four stand-ins
 * that existed only so the dashboard's per-processor grouping had more than one
 * row to draw. These three are the actual team, and they are the same three the
 * territory ladders are assigned to — `ROSTER.SERVICE_PAYABLE` in
 * `app/(pis)/claims/utilities/territory-assignment-store.ts`. A name stamped on
 * a billing and a name holding the territory that billing came from are now the
 * same person, which is the whole reason to prefer the real list: the invented
 * one could never line up with an assignment.
 *
 * DEATH CLAIM STAFF ARE DELIBERATELY ABSENT. The roster splits the department in
 * two and a person belongs to one side of it; MARITES BELIESTA processed
 * billings here only because she was the one name this data layer had, and she
 * is on the claims team. The signed-in user moved with this list rather than
 * against it — see `PROCESSOR` in `seed.ts`.
 *
 * THE SIGNED-IN USER IS KEPT FIRST and kept in the pool, so a billing created
 * and completed this session lands in a group that already exists rather than
 * opening one of its own.
 *
 * THREE IS THE FLOOR, not a number with room under it: the deal below offsets
 * processor, verifier and approver by 0, 1 and 2 so that no billing is verified
 * or approved by the person who processed it. At three that is exact and every
 * role is a different name; at two the offsets would wrap onto each other and
 * the arrangement this data must not show would appear on every row.
 */
export const PROCESSORS = [
  "JACKIE PANES",
  "JOHN MICHAEL GAZA",
  "JOHN REY TAGADTAD",
];

/* ============================== demo overload ============================== */

/**
 * A TERRITORY SIZED TO FILL THE RAIL — twelve chapels, and twelve plan holders
 * on the first of them.
 *
 * It is here to make a layout decision possible, and for nothing else. The real
 * seed's busiest territory has three chapels with three plan holders between
 * them, so no screen in this module has ever been seen carrying a long list —
 * and "how many rows should the chapel list show" cannot be answered against
 * data that never produces more than three.
 *
 * WHY CLT1. Central Luzon Territory 1 has 22 chapels in the reference data and
 * no work at all in the seed — it is the "(0)" in the territory picker. Putting
 * the overload there means every territory that was already on the screen keeps
 * exactly the billings and totals it had.
 *
 * WHAT IS NOT REAL. The plan holders are borrowed: real people from the
 * reference data, given a death and a service they do not have in the seed, so
 * that opening a record shows a fully populated profile rather than the blanks a
 * made-up LPA number would give. Preference goes to people with no death claim
 * of their own; past that the list cycles, so one person can appear in two
 * chapels here. That is a tell, and it is deliberate.
 *
 * TO REMOVE IT: set {@link DEMO_OVERLOAD} to false.
 */
const DEMO_OVERLOAD = true;

/** The territory the overload is built in — 22 chapels, no work of its own. */
const DEMO_TERRITORY = "CLT1";

/** Chapels given a billing: two more than the ten a full list should show. */
const DEMO_CHAPELS = 12;

/** Plan holders on the first chapel — the long list, for the same reason. */
const DEMO_FIRST_CHAPEL_SERVICES = 12;

/**
 * Plan holders on each of the others. Three, which is
 * {@link MIN_SERVICES_PER_REPORT} — fewer and the chapel would be holding them
 * rather than reporting them, and it would not appear in the list at all.
 */
const DEMO_SERVICES_PER_CHAPEL = 3;

/* ------------------------- the billed-history block ------------------------- */

// A SECOND OVERLOAD, FOR THE QUEUES PAST FOR PROCESS (2026-08-26, user asked).
//
// The block above fills For Process. Everything after it was starving: the whole
// file produced THREE already-billed codes between them, and the cycle in
// `alreadyBilled` put one in each of For Verification, For Approval and For
// Endorsement. So For Verification was one billing by one member of staff — a
// screen whose entire subject is "read down what somebody put through" with
// nothing to read down, and a staff picker where four of the five names were
// "(0)".
//
// It is starved for a reason that is real rather than a bug: a period is only
// already-billed when it closed more than {@link BILLING_LAG_DAYS} before the
// newest service on file, and this seed's deaths are clustered in a few recent
// months. There simply is not much HISTORY behind them. So this block is
// history: chapel-periods old enough to have been billed long ago, in a
// territory that has no work of its own.
//
// WHY A DIFFERENT TERRITORY FROM THE ONE ABOVE. Same reason CLT1 was picked for
// that one — MIMAROPA has 17 company-owned chapels and no work at all in the
// seed, so every territory already on a screen keeps exactly the billings and
// totals it had. Using CLT1 for both would have put this history in the middle
// of the list the For Process demo exists to make long.
//
// WHAT IS NOT REAL is what was not real above: the plan holders are borrowed,
// and with two blocks drawing on one pool of about seventy the borrowing now
// cycles — a plan can carry a service here and another in CLT1. That is the same
// tell the block above documents, showing twice as often.

/** The territory the billed history is built in — 17 chapels, no work. */
const DEMO_BILLED_TERRITORY = "MMRPT";

/** Chapels billed in each historical period. */
const DEMO_BILLED_CHAPELS = 12;

/**
 * How many closed periods of history to build.
 *
 * Two, which with the ladder below lands about fifteen billings in For
 * Verification — the same order as the thirteen For Process shows, which is
 * what was asked for. A third period would deepen the pool cycling described
 * above without changing what any screen demonstrates.
 */
const DEMO_BILLED_PERIODS = 2;

/** Plan holders on the first chapel of each period — one long billing each. */
const DEMO_BILLED_FIRST_CHAPEL_SERVICES = 8;

/** Plan holders on each of the others — {@link MIN_SERVICES_PER_REPORT}. */
const DEMO_BILLED_SERVICES_PER_CHAPEL = 3;

/**
 * How far back the newest of these periods sits, in days before the file's
 * latest service.
 *
 * Comfortably past {@link BILLING_LAG_DAYS}, which is the test `alreadyBilled`
 * applies — the whole point of this block is that every period in it fails that
 * test and so gets a `TblClaimsBilling` row. 60 rather than 46: a period is
 * dated by the day it CLOSED, which can be up to a week after the date used to
 * find it, so the margin has to cover a cut's own length.
 */
const DEMO_BILLED_LAG_DAYS = 60;

/**
 * How many services in the billed history are HELD BY A DISCREPANCY. ONE
 * (user asked, 2026-08-27).
 *
 * The block draws from serviceable plans only — see the parameter note on
 * {@link borrowablePlans}, and the measurement behind it: letting the pool fall
 * through to unserviceable plans while it CYCLES made three of one processor's
 * seven billings held, which is the exception becoming the rule on the one
 * screen this block exists to fill.
 *
 * So the discrepancy is placed rather than sampled. One plan is drawn from the
 * tail deliberately, onto a known billing, which gives For Verification the case
 * it could not otherwise reach: a billing carrying a service that should never
 * have been rendered, so a verifier meets the held group, the tinted rows and
 * the account that cannot be signed.
 *
 * ONE for the reason `ALREADY_CLAIMED` is one: a discrepancy happens about once
 * in a thousand services, and one is the smallest number that keeps the path on
 * screen.
 */
const DEMO_BILLED_DISCREPANCIES = 1;

/**
 * WHICH CHAPEL OF THE NEWEST BILLED PERIOD CARRIES IT — the position that lands
 * the held service in For Verification.
 *
 * A POSITION AND NOT A STAGE, because the stage cannot be asked for from here.
 * `alreadyBilled` deals {@link BILLED_STAGE_LADDER} out over every already-billed
 * code in the file — this block's and the three the real endorsements produce —
 * sorted by period, so which slot a given chapel-period lands on depends on what
 * else is in that list. It is not knowable at the point the endorsements are
 * built, and computing it here would mean reimplementing that sort.
 *
 * So it is a number, chosen by looking: chapel 0 fell on a stage-1 slot and put
 * the discrepancy in For Approval, which has no screen to show it on. Chapel 1
 * is the next slot along, and the ladder's shape — five stage-0 slots in eight —
 * means the neighbour of a miss is usually a hit.
 *
 * IF THE SEED'S DATES OR CHAPEL COUNTS MOVE, this may need looking at again. The
 * check is one line on the For Verification page: a processor card carrying a
 * "1 discrepancy" mark. If it has moved to For Approval or For Endorsement,
 * step this by one.
 */
const DEMO_BILLED_HELD_CHAPEL = 1;

/* =============================== the build =============================== */

/** ISO date `n` days after the given one. */
function daysAfter(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * A small, stable hash of a string — used only to spread derived values evenly
 * and repeatably. Never for identity.
 */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * STAND-IN: the name a franchise wrote instead of the one on the plan.
 *
 * Two shapes, both of them what actually goes wrong at a funeral parlour's
 * counter rather than random corruption — a name nobody would write is a name
 * nobody has to reconcile, and reconciling is the work the screen exists for:
 *
 *   the MARRIED SURNAME — the family gives the name she was known by, which is
 *     her husband's; the plan is in her maiden name. Taken from the spouse named
 *     on the plan, so the wrong name is a name that is genuinely in the file.
 *   the GIVEN NAME ALONE — first name and surname, no middle name, which is how
 *     a name gets written on a form with three boxes and no fourth.
 *
 * Falls back to the second when the plan names no spouse.
 */
function mismatchedName(
  db: PisDatabase,
  lpaNo: string,
  onFile: PersonName,
): string {
  const spouse = db
    .getBeneficiaries(lpaNo)
    .find((b) => b.relation === "Spouse" && b.name);

  if (spouse?.name && spouse.name.lastName !== onFile.lastName) {
    return toFullName({ ...onFile, lastName: spouse.name.lastName });
  }
  return toFullName({
    firstName: onFile.firstName,
    lastName: onFile.lastName,
  });
}

/**
 * STAND-IN: which chapels in a territory are actually taking funerals.
 *
 * Spread across the territory's list rather than taken off the front, so the
 * active ones are not all alphabetically adjacent — "the first three chapels"
 * reads as a bug in a way that "three chapels spread through the territory"
 * does not.
 *
 * Territories with branches but no chapels (MCET and NCT2, in the current
 * reference data) fall back to the network at large rather than dropping the
 * service — a family that buries out of territory is ordinary, and losing the
 * payable entirely would be a worse lie than placing it somewhere plausible.
 */
function activeChapels(
  db: PisDatabase,
  territoryCode: string,
  serviceCount: number,
): ChapelBranch[] {
  const local = territoryCode ? db.getChapelsByTerritory(territoryCode) : [];
  // A franchise that cannot use the system endorses NOTHING through it, so
  // nothing can be derived onto one — that is what "cannot use the system"
  // means. Their work arrives by hand, in a module of its own; see the note on
  // the franchise path in `service-payables-data`.
  const pool = (local.length ? local : db.getChapels()).filter(
    (chapel) => !chapel.isManualFranchise,
  );
  if (!pool.length) return [];

  const wanted = Math.min(
    pool.length,
    Math.max(1, Math.round(serviceCount / SERVICES_PER_ACTIVE_CHAPEL)),
  );
  const step = Math.max(1, Math.floor(pool.length / wanted));

  const picked: ChapelBranch[] = [];
  for (let i = 0; picked.length < wanted && i < pool.length; i += step) {
    picked.push(pool[i]);
  }
  return picked;
}

/**
 * STAND-IN: how the endorsement credits the service.
 *
 * THE VALUE ARRIVES WITH THE REQUEST — `TblICIS_Billing_Processed` carries a
 * credit of service on every row, which is why the record's field opens on
 * something rather than empty. What is invented here is only WHICH: nothing on
 * file says whether a given funeral was a first point, a second point or a
 * cremation, so the four values are spread by a hash of the plan number.
 *
 * WEIGHTED, not even. REGULAR is the ordinary case by a distance — most
 * services are a chapel's own, in one place, with a body to bury — so it takes
 * five of the eight slots and the other three share what is left. An even split
 * would have said a quarter of the network's funerals are cremations.
 *
 * The processor can change it on the record whatever this says: the value is a
 * default, not a verdict. See `ServiceRecordForm`.
 */
const CREDIT_OF_SERVICE_LADDER = [
  "REGULAR",
  "REGULAR",
  "1ST POINT",
  "REGULAR",
  "2ND POINT",
  "REGULAR",
  "CREM ONLY",
  "REGULAR",
];

function creditOfServiceFor(row: Endorsement): string {
  return CREDIT_OF_SERVICE_LADDER[
    hash(row.planholder.lpaNo) % CREDIT_OF_SERVICE_LADDER.length
  ];
}

/** One endorsed service, before its report period has been settled. */
interface Endorsement {
  chapel: ChapelBranch;
  planholder: Planholder;
  endorsedName: string;
  deceasedName: string;
  dateOfDeathISO: string;
  serviceDateISO: string;
  /** The cut the service was RENDERED in. */
  period: BillingPeriod;
  /** The cut the chapel REPORTED it in — settled by {@link assignReportPeriods}. */
  reportPeriod: BillingPeriod;
  /** Still being held for a fuller report: no row reaches the source table. */
  isHeld: boolean;
  phBranchCode: string;
  servicingBranchCode: string;
}

/**
 * Decide which week each of a chapel's services was REPORTED in.
 *
 * Walks the chapel's services oldest first, a transaction week at a time,
 * accumulating until the week's running total reaches
 * {@link MIN_SERVICES_PER_REPORT} — at which point everything held is reported
 * in the week that tipped it over. Whatever is still held at the end of the
 * chapel's history is reported where it stands: there is no later week to carry
 * it into, which is the one case a report of fewer than three is allowed.
 *
 * A chapel that has NEVER reported is the exception — with no earlier report to
 * have carried these into, they stand as a short report of their own.
 */
function assignReportPeriods(rows: Endorsement[]) {
  const byChapel = new Map<string, Endorsement[]>();
  for (const row of rows) {
    const list = byChapel.get(row.chapel.chapelCode);
    if (list) list.push(row);
    else byChapel.set(row.chapel.chapelCode, [row]);
  }

  for (const list of byChapel.values()) {
    list.sort((a, b) => a.serviceDateISO.localeCompare(b.serviceDateISO));

    let held: Endorsement[] = [];
    let reports = 0;
    let index = 0;

    while (index < list.length) {
      // One transaction week's worth.
      const key = periodKey(list[index].period);
      const week: Endorsement[] = [];
      while (index < list.length && periodKey(list[index].period) === key) {
        week.push(list[index++]);
      }

      held.push(...week);
      if (held.length >= MIN_SERVICES_PER_REPORT) {
        // Reported in the week that completed it, not the week each service
        // happened in — the report is what carries the date.
        const reportPeriod = week[week.length - 1].period;
        for (const service of held) {
          service.reportPeriod = reportPeriod;
          service.isHeld = false;
        }
        held = [];
        reports += 1;
      }
    }

    for (const service of held) {
      service.isHeld = reports > 0;
      if (!service.isHeld) {
        service.reportPeriod = held[held.length - 1].period;
      }
    }
  }
}

/** Every endorsement the chapels have made — the two passes, then the demo. */
function endorsements(db: PisDatabase): Endorsement[] {
  /** A death, and the territory it happened in, before it has a chapel. */
  interface Draft {
    planholder: Planholder;
    name: PersonName;
    dateOfDeathISO: string;
    serviceDateISO: string;
    phBranchCode: string;
    servicingBranchCode: string;
    territoryCode: string;
  }

  // ── Pass 1: every death, and which territory it happened in ──
  const drafts: Draft[] = [];
  let unserviceableEndorsed = 0;

  for (const planholder of db.getPlanholders()) {
    const requests = db
      .getClaimRequestsByLpa(planholder.lpaNo)
      .filter((r) => r.claimType === "Death Claim");
    if (!requests.length) continue;

    // A plan that cannot be serviced is not normally endorsed for service —
    // see {@link UNSERVICEABLE_ENDORSED}.
    if (planholder.serviceBlock) {
      if (unserviceableEndorsed >= UNSERVICEABLE_ENDORSED) continue;
      unserviceableEndorsed += 1;
    }

    // A plan is serviced once. Where a plan carries more than one death-claim
    // request, the earliest filing is the one the service belongs to.
    const request = requests.reduce((earliest, r) =>
      r.fileDateISO < earliest.fileDateISO ? r : earliest,
    );

    const name = planholder.name;
    if (!name) continue;

    drafts.push({
      planholder,
      name,
      dateOfDeathISO: request.incidentDateISO,
      serviceDateISO: serviceDateFor(request.incidentDateISO),
      // The branch collecting on the plan, read off its payment ledger — which
      // is where the source system records it. Falls back to the branch that
      // filed the claim for a plan with no payments on file.
      phBranchCode:
        db.getPayments(planholder.lpaNo)[0]?.branchCode ??
        request.requestingBranchCode,
      servicingBranchCode: request.requestingBranchCode,
      territoryCode:
        db.getBranch(request.requestingBranchCode)?.territoryCode ?? "",
    });
  }

  // ── Pass 2: hand each territory's deaths to its active chapels ──
  //
  // Territory-at-a-time, because how many chapels are active depends on how
  // many services the territory has — which is not knowable one death at a
  // time. Round-robin within the territory rather than hashed: the point of
  // this pass is an EVEN load across the chosen chapels, and a hash over a
  // handful of items clumps.
  const byTerritory = new Map<string, Draft[]>();
  for (const draft of drafts) {
    const list = byTerritory.get(draft.territoryCode);
    if (list) list.push(draft);
    else byTerritory.set(draft.territoryCode, [draft]);
  }

  const rows: Endorsement[] = [];
  let nameMismatches = 0;

  for (const [territoryCode, list] of byTerritory) {
    const chapels = activeChapels(db, territoryCode, list.length);
    if (!chapels.length) continue;

    list.sort((a, b) => a.serviceDateISO.localeCompare(b.serviceDateISO));

    list.forEach((draft, i) => {
      const chapel = chapels[i % chapels.length];
      const onFileName = toFullName(draft.name);

      // WHAT THE CHAPEL ENDORSED. An owned chapel endorses through the system,
      // so its name is the plan's by construction and can never disagree. A
      // franchise sends paper, and once in a long while that paper carries the
      // name the family gave at the counter instead — see
      // {@link NAME_MISMATCHES}.
      const mismatch = chapel.isFranchise && nameMismatches < NAME_MISMATCHES;
      if (mismatch) nameMismatches += 1;

      const period = periodOf(draft.serviceDateISO);
      rows.push({
        chapel,
        planholder: draft.planholder,
        endorsedName: mismatch
          ? mismatchedName(db, draft.planholder.lpaNo, draft.name)
          : onFileName,
        deceasedName: onFileName,
        dateOfDeathISO: draft.dateOfDeathISO,
        serviceDateISO: draft.serviceDateISO,
        period,
        // Settled by `assignReportPeriods` below; every service starts out
        // reported in the week it happened, which is the common case anyway.
        reportPeriod: period,
        isHeld: false,
        phBranchCode: draft.phBranchCode,
        servicingBranchCode: draft.servicingBranchCode,
      });
    });
  }

  // ── Pass 3: carry short weeks forward into the next report ──
  assignReportPeriods(rows);

  // ── Pass 4: the demo overload, if it is switched on ──
  //
  // AFTER `assignReportPeriods`, deliberately. Every demo service is dated into
  // one week and reported in it, which is the answer that pass would reach
  // anyway — running it over them as well would only give it the chance to carry
  // a chapel's three into a week that does not exist here.
  if (DEMO_OVERLOAD) rows.push(...demoEndorsements(db, rows));

  // ── Pass 5: the assigned plans, DEALT NOW AND PUSHED LAST ──
  //
  // The dealing and the pushing are two separate things here, and they have to
  // be. `assignedEndorsements` spreads its plans evenly across every billing
  // code it is shown, so what it is shown decides where they land — and when the
  // billed-history block below was first added inside this same array, it
  // doubled the number of codes and quietly took HALF the assigned services off
  // the For Process queue with it. Measured: For Process fell from 119 services
  // to 99, and Php 3,231,000 to Php 2,731,000, on a change that was supposed to
  // add data to another screen and touch nothing here.
  //
  // So the deal happens against the REAL endorsements plus the For Process
  // overload, exactly the set it was written against, and the history that
  // follows cannot dilute it.
  const assigned = assignedEndorsements(db, rows);

  // ── Pass 6: the billed history — the queues past For Process ──
  //
  // Handed the array the first block has already pushed into, so it sees those
  // borrowings as taken and reaches for fresh plans before it starts cycling. It
  // cannot move the file's latest service date (every row in it is dated months
  // back), so the staging of every real billing behind it is untouched.
  if (DEMO_OVERLOAD) rows.push(...demoBilledEndorsements(db, rows));

  // ── Pass 7: the assigned plans go in, at the end ──
  //
  // LAST, so they take the last rows of `TblICIS_Billing_Processed` and every
  // index before them is the one it was. The service-payables module invents a
  // document deficiency from a row's POSITION in that table (see
  // `DEFICIENT_EVERY`), so a row inserted anywhere else would quietly move which
  // services are short a document. It used to decide the CSP AMOUNT too, which
  // made the same insertion re-price everything after it; that is off
  // `RefMortuaryCSPRate` since 2026-08-26 and only the deficiency still turns on
  // position.
  //
  // WHICH BILLINGS THEY LAND ON was settled back in pass 5 — see the note there
  // for why that had to happen before the history was added rather than here.
  rows.push(...assigned);

  return rows;
}

/* -------------------------- the assigned plans -------------------------- */

/**
 * The services where the DECEASED and the PLAN HOLDER are two different people
 * — at least one on every billing code in the file.
 *
 * `TblICIS_Billing_Processed` has carried both columns all along, and the source
 * system's own note calls the pair "independent for checking". Until now this
 * seed made them the same string on every row: every plan in it was held by the
 * person it buried, so a processor whose job is to check one against the other
 * had nothing to check on any billing. In the real file it is the other way
 * round — a plan is more often spent on somebody other than its holder — and
 * every one of these rows carries the status that says so, `SA`.
 *
 * ONE PER BILLING CODE IS THE REQUIREMENT, and it is what the dealing below is
 * for. The plans come as a pool (see the `SA` block in `seed.ts`) because the
 * number of billing codes is not knowable when that pool is written — it falls
 * out of how each chapel's weeks divide into reports. So the pool is made larger
 * than any plausible count and handed out IN ROUNDS: every code takes one before
 * any code takes a second, and the rounds continue until the pool is empty.
 *
 * That gives both halves at once. Every code gets an assigned service as long as
 * the pool outnumbers the codes, and no plan is left marked SERVICED with no
 * service against it — which would be a row contradicting itself.
 *
 * EACH ONE RIDES ON A ROW ALREADY ON ITS BILLING rather than being dated
 * independently: it takes that row's chapel, cut, dates and branches, so it is a
 * service the same billing can carry and it sits among its neighbours in the
 * table instead of standing out as a curiosity. What it does NOT take is the
 * name.
 */
function assignedEndorsements(
  db: PisDatabase,
  derived: Endorsement[],
): Endorsement[] {
  // THE POOL IS DEFINED BY THE STATUS, not by a list of LPAs kept in step with
  // one. A plan marked serviced is a plan that was spent on somebody, and this
  // is the pass that says who — so `isServiced` is exactly the right question,
  // and adding a plan to the seed with `SA` on it is the whole of adding one
  // here. Ordered by the seed so the dealing is deterministic.
  const pool = db
    .getPlanholders()
    .filter((p) => p.isServiced && p.name)
    .filter((p) => assignedDeceasedByLpa[p.lpaNo]);
  if (!pool.length) return [];

  // Group the rows already endorsed by the billing code they will land on —
  // `billingCodeFor` is the same call `buildBillingTables` makes below, so a
  // code here is a code there. A held row has no billing at all.
  const hostByCode = new Map<string, Endorsement>();
  for (const row of derived) {
    if (row.isHeld) continue;
    const code = billingCodeFor(
      row.chapel.chapelCode,
      row.reportPeriod,
      row.chapel.isFranchise,
    );
    // The FIRST row of each code is the host, so the assigned service inherits
    // the cut its billing is coded by rather than whichever row happened to be
    // latest. Any row of the code would do — they share all four of the fields
    // borrowed below — and taking the first keeps it stable as rows are added.
    if (!hostByCode.has(code)) hostByCode.set(code, row);
  }
  if (!hostByCode.size) return [];

  const hosts = [...hostByCode.values()];
  const rows: Endorsement[] = [];

  pool.forEach((planholder, i) => {
    const host = hosts[i % hosts.length];
    const name = planholder.name;
    const deceasedName = assignedDeceasedByLpa[planholder.lpaNo];
    // Both are guaranteed by the filter above; narrowed again for the compiler,
    // and because data should never be able to break the build.
    if (!name || !deceasedName) return;

    rows.push({
      chapel: host.chapel,
      planholder,
      // WHAT THE CHAPEL ENDORSED is the PLAN HOLDER's name. That column is the
      // plan's own name as the paperwork spells it, and it is what the
      // discrepancy check compares against the plan on file — putting the
      // deceased here instead would raise a name-mismatch discrepancy on every
      // one of these rows, which is the opposite of the point.
      endorsedName: toFullName(name),
      deceasedName,
      dateOfDeathISO: host.dateOfDeathISO,
      serviceDateISO: host.serviceDateISO,
      period: host.period,
      reportPeriod: host.reportPeriod,
      isHeld: false,
      phBranchCode: host.phBranchCode,
      servicingBranchCode: host.servicingBranchCode,
    });
  });

  return rows;
}

/** The overload rows — see {@link DEMO_OVERLOAD}. */
function demoEndorsements(
  db: PisDatabase,
  derived: Endorsement[],
): Endorsement[] {
  const chapels = db.getChapelsByTerritory(DEMO_TERRITORY).slice(0, DEMO_CHAPELS);
  if (!chapels.length) return [];

  // Dated to the LATEST service already on file rather than to today, so the
  // demo billings land in the newest period — which is what puts them in For
  // Process — without moving the file's latest date and re-staging every real
  // billing behind it.
  const anchorISO = derived.reduce(
    (latest, s) => (s.serviceDateISO > latest ? s.serviceDateISO : latest),
    "",
  );
  if (!anchorISO) return [];

  const branchCode =
    db.getBranchesByTerritory(DEMO_TERRITORY)[0]?.branchCode ?? "";

  // WHO IS BORROWED, in order of preference:
  //
  //   1. plans that could actually be serviced and are not already on a service
  //      somewhere — the light borrowing, and the ordinary case,
  //   2. any other serviceable plan,
  //   3. everyone.
  //
  // SERVICEABILITY LEADS, and it did not have to. Preferring plans with no death
  // of their own used to be the whole rule, which quietly selected FOR the plans
  // still being collected on — the ones whose accounts are not fully paid — and
  // turned a third of this block into held services. The rule is right and it
  // should bite, but a demo built to answer "how long does this list run" should
  // not be two thirds a demonstration of something else. The tail still reaches
  // the unserviceable plans, so the mark is still there.
  //
  // The pool itself is built by {@link borrowablePlans}, which the billed-history
  // block draws on too — one rule, so the two cannot disagree about what may be
  // borrowed.
  const pool = borrowablePlans(db, derived);
  if (!pool.length) return [];

  const rows: Endorsement[] = [];
  const period = periodOf(anchorISO);
  let next = 0;

  chapels.forEach((chapel, chapelIndex) => {
    const count =
      chapelIndex === 0 ? DEMO_FIRST_CHAPEL_SERVICES : DEMO_SERVICES_PER_CHAPEL;

    for (let i = 0; i < count; i++) {
      const planholder = pool[next++ % pool.length];
      // Filtered for above, and narrowed here — a plan holder with no person
      // behind them has no name to put on a service.
      const name = planholder.name;
      if (!name) continue;
      const onFileName = toFullName(name);

      rows.push({
        chapel,
        planholder,
        // CLT1 is company-owned throughout, so nothing here is ever endorsed
        // under a different name. See the franchise rule above.
        endorsedName: onFileName,
        deceasedName: onFileName,
        dateOfDeathISO: daysAfter(anchorISO, -3),
        serviceDateISO: anchorISO,
        period,
        reportPeriod: period,
        isHeld: false,
        phBranchCode: branchCode,
        servicingBranchCode: branchCode,
      });
    }
  });

  return rows;
}

/**
 * The plans the demo blocks borrow, in order of preference.
 *
 * LIFTED OUT OF {@link demoEndorsements} when the billed-history block arrived,
 * because both need the same pool built by the same rule and a second copy of
 * that rule is a second thing to get wrong. The preference order, and why
 * serviceability leads it, is documented at the call site it came from.
 *
 * `taken` is every plan already spoken for — the real endorsements for the first
 * caller, and those plus the first block's borrowings for the second.
 *
 * `includeUnserviceable` is the TAIL, and whether a block wants one depends on
 * what the block is FOR. See the parameter's own note.
 */
function borrowablePlans(
  db: PisDatabase,
  taken: Endorsement[],
  /**
   * Whether the pool may fall through to plans that CANNOT be serviced — an ROP,
   * an account never fully paid. Every one of those becomes a discrepancy on the
   * billing that borrows it.
   *
   * TRUE for the For Process block, where reaching the tail is how that screen
   * gets its held rows to show. FALSE for the billed history, and that is not a
   * detail: that block borrows more plans than the pool holds, so it cycles —
   * and a tail on a cycling draw is not a tail at all, it is a share. Measured
   * with it left on: three of ARNEL's seven billings held a discrepancy and one
   * was worth Php 0.00, on a file whose own notes put a discrepancy at about one
   * service in a thousand. The exception was the rule on the one screen that
   * block exists to fill.
   *
   * Nothing is lost by refusing it. The discrepancy path is demonstrated on For
   * Process, where the real seed puts its three, and this stage can reach one
   * the way a real one does — a billing that carried a discrepancy through from
   * there.
   */
  includeUnserviceable = true,
): Planholder[] {
  const used = new Set(taken.map((s) => s.planholder.lpaNo));
  // A PLAN THAT HAS ALREADY BEEN SERVICED IS OUT OF THE POOL ENTIRELY — `SA` and
  // `SP` mean the plan has been spent on a funeral, and a demo that borrowed one
  // would be endorsing a second service against it.
  const all = db.getPlanholders().filter((p) => p.name && !p.isServiced);
  const serviceable = all.filter((p) => p.canBeServiced);
  return [
    ...serviceable.filter((p) => !used.has(p.lpaNo)),
    ...serviceable,
    ...(includeUnserviceable ? all : []),
  ];
}

/**
 * The billed-history rows — see {@link DEMO_BILLED_TERRITORY} and the block of
 * notes above it.
 *
 * Built exactly like {@link demoEndorsements}, one period at a time and dated
 * far enough back that {@link alreadyBilled} gives every code it produces a
 * billing number.
 */
function demoBilledEndorsements(
  db: PisDatabase,
  derived: Endorsement[],
): Endorsement[] {
  // COMPANY-OWNED ONLY, and a franchise on paper endorses nothing through the
  // system at all — the same two filters the real pass applies. MIMAROPA happens
  // to be owned throughout, so those two take nothing out today; they are here
  // so the block does not quietly start inventing franchise endorsements if the
  // territory constant is ever pointed somewhere else.
  //
  // AND ONLY CHAPELS THAT CAN BE PRICED (2026-08-26, user-confirmed: no billing
  // in this block may total nothing). A service is priced by the MORTUARY the
  // billing is raised against, and a handful of chapels in the reference data
  // resolve to none — their description differs from any mortuary's by a whole
  // word, which is a gap this data layer refuses to guess across (see
  // `namesTheChapel`). In MIMAROPA that is CALAPB, "CALAPAN, BAYANAN". A billing
  // built on one of them is a card of dashes footed with ₱0.00.
  //
  // THAT IS THE RIGHT ANSWER FOR REAL DATA AND THE WRONG ONE FOR A DEMO. Those
  // chapels are not being hidden — a real endorsement for one still bills, still
  // shows its dashes, and For Process still demonstrates it. This block invents
  // its own work, and work it invents should not invent an unanswerable payable
  // along with it.
  const chapels = db
    .getChapelsByTerritory(DEMO_BILLED_TERRITORY)
    .filter(
      (chapel) =>
        !chapel.isFranchise &&
        !chapel.isManualFranchise &&
        Boolean(db.getDesignatedMortCode(chapel.chapelCode)),
    )
    .slice(0, DEMO_BILLED_CHAPELS);
  if (!chapels.length) return [];

  // Dated against the file's latest service rather than today, for the reason
  // {@link BILLING_LAG_DAYS} gives: the seed's dates do not move, so anchoring
  // to the clock would re-stage every billing here as the months passed.
  const anchorISO = derived.reduce(
    (latest, s) => (s.serviceDateISO > latest ? s.serviceDateISO : latest),
    "",
  );
  if (!anchorISO) return [];

  const branchCode =
    db.getBranchesByTerritory(DEMO_BILLED_TERRITORY)[0]?.branchCode ?? "";

  /**
   * The closed periods, newest first.
   *
   * Walked by stepping to the day BEFORE a period starts, which lands in the
   * previous cut whatever length either of them happens to be — the cuts are
   * 1-7, 8-15, 16-22 and 23-EOM, so only arithmetic on the boundaries is safe.
   */
  const periods: BillingPeriod[] = [];
  let cursorISO = daysAfter(anchorISO, -DEMO_BILLED_LAG_DAYS);
  for (let i = 0; i < DEMO_BILLED_PERIODS; i++) {
    const period = periodOf(cursorISO);
    periods.push(period);
    cursorISO = daysAfter(cutRange(period).fromISO, -1);
  }

  // SERVICEABLE PLANS ONLY — see the parameter's note on `borrowablePlans`.
  // This block cycles, and a fall-through tail on a cycling draw would make a
  // discrepancy the ordinary case on the screen it fills.
  const pool = borrowablePlans(db, derived, false);
  if (!pool.length) return [];

  /**
   * The plans that CANNOT be serviced, for the one held service this block
   * places by hand — see {@link DEMO_BILLED_DISCREPANCIES}.
   *
   * A pool of its own rather than the tail of the one above, which is the whole
   * point: drawn separately it can be spent exactly once, on a billing chosen
   * for the queue it lands in, instead of being dealt round by a cycling
   * counter.
   *
   * Already-serviced plans are out of it for the reason they are out of the
   * other: `SA`/`SP` means the plan has been spent on a funeral, and borrowing
   * one would endorse a second service against it — which is a different
   * discrepancy from the one being demonstrated, and a real one.
   */
  const heldPool = db
    .getPlanholders()
    .filter((p) => p.name && !p.isServiced && !p.canBeServiced);

  const rows: Endorsement[] = [];
  let next = 0;
  let held = 0;

  for (const [periodIndex, period] of periods.entries()) {
    // The last day of the cut — inside the period by construction, whichever of
    // the four it is, so the code derived from it is the code intended.
    const serviceISO = cutRange(period).toISO;

    chapels.forEach((chapel, chapelIndex) => {
      const count =
        chapelIndex === 0
          ? DEMO_BILLED_FIRST_CHAPEL_SERVICES
          : DEMO_BILLED_SERVICES_PER_CHAPEL;

      for (let i = 0; i < count; i++) {
        // THE ONE HELD SERVICE, placed rather than sampled — the last row of the
        // first chapel of the newest period, which is the billing
        // {@link BILLED_STAGE_LADDER} leaves at stage 0. See
        // {@link DEMO_BILLED_DISCREPANCIES}.
        //
        // LAST OF THE EIGHT, not first: the rows above it are ordinary, so the
        // billing reads as a normal one with a single account held at the end of
        // it — which is what a real one looks like, and what puts the held group
        // under a table that has something in it.
        const takeHeld =
          held < DEMO_BILLED_DISCREPANCIES &&
          heldPool.length > 0 &&
          periodIndex === 0 &&
          chapelIndex === DEMO_BILLED_HELD_CHAPEL &&
          i === count - 1;

        const planholder = takeHeld
          ? heldPool[0]
          : pool[next++ % pool.length];
        const name = planholder.name;
        if (!name) continue;
        if (takeHeld) held += 1;
        const onFileName = toFullName(name);

        rows.push({
          chapel,
          planholder,
          // Owned chapels throughout, so the endorsed name is the plan's by
          // construction and can never disagree — see the franchise rule above.
          endorsedName: onFileName,
          deceasedName: onFileName,
          dateOfDeathISO: daysAfter(serviceISO, -3),
          serviceDateISO: serviceISO,
          period,
          reportPeriod: period,
          isHeld: false,
          phBranchCode: branchCode,
          servicingBranchCode: branchCode,
        });
      }
    });
  }

  return rows;
}

/**
 * Build the billing tables from the rest of the seed. Called once by the mock
 * DB, which passes itself in for the joins.
 */
export function buildBillingTables(db: PisDatabase): BillingTables {
  const rows = endorsements(db);

  const billingProcessed: IcisBillingProcessedRecord[] = [];
  const hdrByCode = new Map<string, BillingHdrRecord>();
  const countByCode = new Map<string, number>();
  const periodByCode = new Map<string, BillingPeriod>();

  for (const row of rows) {
    // A service the chapel is still holding has not been endorsed, so the
    // source system has never heard of it — no row, and no billing code either.
    if (row.isHeld) continue;

    const billingCode = billingCodeFor(
      row.chapel.chapelCode,
      row.reportPeriod,
      row.chapel.isFranchise,
    );

    if (!hdrByCode.has(billingCode)) {
      hdrByCode.set(billingCode, {
        billingCode,
        chapelCode: row.chapel.chapelCode,
        chapel: row.chapel.chapelDesc,
        company: BILLING_COMPANY,
        status: "PROCESSED",
      });
      periodByCode.set(billingCode, row.reportPeriod);
    }
    countByCode.set(billingCode, (countByCode.get(billingCode) ?? 0) + 1);

    billingProcessed.push({
      billingCode,
      chapelCode: row.chapel.chapelCode,
      dateOfDeath: row.dateOfDeathISO,
      deceasedName: row.deceasedName,
      planholder: row.endorsedName,
      phBranch: row.phBranchCode,
      servicingBranch: row.servicingBranchCode,
      policyNo: row.planholder.lpaNo,
      plan: row.planholder.planDesc,
      // Still waiting on the source system — see the record's own note.
      contractNo: "",
      creditOfService: creditOfServiceFor(row),
    });
  }

  return {
    billingHdr: [...hdrByCode.values()],
    billingProcessed,
    claimsBilling: alreadyBilled(db, rows, hdrByCode, periodByCode, countByCode),
  };
}

/**
 * EVERY billing on file, each with its number — `TblClaimsBilling`, one row per
 * chapel-period, carrying whatever the billing has collected so far.
 *
 * ALL OF THEM ARE NUMBERED NOW (user, 2026-09-17: "our data would now has a
 * billing number"). It used to write rows ONLY for periods old enough to have
 * been billed, and the absence of a row WAS the For Process queue — so a
 * processor looking down the list of billings saw a column of billing codes with
 * the occasional number in it, because most of the file had no number to show.
 *
 * WHAT CARRIES THE QUEUE INSTEAD IS {@link ClaimsBillingRecord.dateProcessed},
 * which is blank here for anything still to be worked. That is the honest shape
 * anyway: a billing is NUMBERED before it is processed, because terminating a
 * plan has to post it against a number. The row's mere existence never meant
 * "finished" in the business, only in this seed.
 *
 * THE THREE SIGNED STATES are dealt from {@link BILLED_STAGE_LADDER} rather than
 * being drawn from anything: a billed period is processed, verified or approved,
 * and there is nothing on file that decides which.
 *
 * WHAT FEEDS IT. The seed's own deaths are clustered in a few recent months, so
 * on their own they produce barely a handful of periods old enough to have been
 * billed. Most of what this function numbers is the billed-history block — see
 * {@link DEMO_BILLED_TERRITORY}.
 */
function alreadyBilled(
  db: PisDatabase,
  rows: Endorsement[],
  hdrByCode: Map<string, BillingHdrRecord>,
  periodByCode: Map<string, BillingPeriod>,
  countByCode: Map<string, number>,
): ClaimsBillingRecord[] {
  const latestServiceDate = rows.reduce(
    (latest, s) => (s.serviceDateISO > latest ? s.serviceDateISO : latest),
    "",
  );

  /** Whether a period is recent enough to still be waiting to be billed. */
  const isRecent = (period: BillingPeriod): boolean => {
    if (!latestServiceDate) return true;
    const closedAt = new Date(cutRange(period).toISO).getTime();
    const latest = new Date(latestServiceDate).getTime();
    return (latest - closedAt) / 86_400_000 <= BILLING_LAG_DAYS;
  };

  // OLDEST PERIODS FIRST FOR NUMBERING, so a billing's number says when it was
  // raised: the oldest billing in the file carries the lowest number, and the
  // one still waiting to be worked carries the highest. Sorting the other way
  // — which is what this did while only billed periods were numbered — now
  // reads backwards, because the unworked periods would take the low numbers.
  //
  // THE LADDER STILL COUNTS OVER THE BILLED ONES ONLY, so which historical
  // billings are verified or approved does not shift when an unworked period is
  // added to the file. `billedIndex` is that separate count.
  const codes = [...hdrByCode.keys()].sort((a, b) =>
    periodKey(periodByCode.get(a)!).localeCompare(
      periodKey(periodByCode.get(b)!),
    ),
  );

  let billedIndex = -1;

  return codes.map((billingCode, index) => {
    const period = periodByCode.get(billingCode)!;
    const hdr = hdrByCode.get(billingCode)!;
    const sequence = SEEDED_BILLING_BASE + index + 1;
    const billingNo = `B${String(period.year).slice(-2)}${String(sequence).padStart(6, "0")}`;

    /**
     * STILL TO BE WORKED — the For Process queue, and the rows that are new to
     * this table. They carry their NUMBER and the date the CIS upload put them
     * here, and nothing else: no processor, no processed date, no signatures.
     * Everything after the number is something somebody has yet to do.
     */
    const worked = !isRecent(period);
    if (worked) billedIndex += 1;

    // Where this billing has got to — see {@link BILLED_STAGE_LADDER}, which
    // also has why the three are not evenly spread.
    const stage = worked
      ? BILLED_STAGE_LADDER[billedIndex % BILLED_STAGE_LADDER.length]
      : -1;

    // WHO PUT IT THROUGH — dealt round the list rather than hashed off the code
    // (2026-08-26). It was `hash(billingCode) % PROCESSORS.length`, and a hash
    // over a couple of dozen items clumps: on the file as it stands it gave one
    // name eight billings and the signed-in user NONE, so For Verification —
    // whose whole rail is a staff picker — opened on a list with a "(0)" in it
    // and a screen nobody could reach through it.
    //
    // This is the correction `endorsements` already made one pass up, in the
    // same words: round-robin where the point is an EVEN load and the population
    // is small enough for a hash to lump. Nothing is lost — the name on a billed
    // period is a stand-in either way (there is no user table), and dealing it
    // round is the more honest of the two shapes for a queue that is worked by a
    // team.
    //
    // The three roles are offset from one deal so they can never collide: a
    // billing verified or approved by the person who processed it is the one
    // arrangement this data must not show.
    //
    // DEALT OVER THE WORKED BILLINGS, not over every row in the table. The
    // unworked ones have nobody on them at all — nobody has processed them —
    // and counting them in the deal would skip names and put the load back out
    // of balance, which is the thing this replaced a hash to fix.
    const processedBy = worked ? PROCESSORS[billedIndex % PROCESSORS.length] : "";
    const verifier = PROCESSORS[(billedIndex + 1) % PROCESSORS.length];
    const approver = PROCESSORS[(billedIndex + 2) % PROCESSORS.length];

    // The chapel's designated mortuary, which is the one a billing for it is
    // raised against.
    //
    // THE DESIGNATION AND NOT "THE FIRST ROW THE COLUMN RETURNS", which is what
    // this was until 2026-08-26 and which was wrong in two ways at once. It took
    // `getMortuariesByChapel` — the raw `BranchCode` filter — in SOURCE ORDER,
    // with none of the ranking the screen applies, so a billing on file could be
    // raised against a franchise parlour that merely happened to sort first
    // under an owned chapel's code. And it disagreed with the create-billing
    // dialog, which meant a seeded billing and one raised in the browser for the
    // same chapel named different mortuaries. Both are `getDesignatedMortCode`
    // now; there is one rule and it lives on the database.
    const mortCode = db.getDesignatedMortCode(hdr.chapelCode);

    // The day the period closed — every date on the billing hangs off it.
    const closedISO = cutRange(period).toISO;

    return {
      billingNo,
      // Accounting raises the voucher, and it has not been modelled — the
      // column is here because the table has it.
      cvNo: "",
      cvDate: "",
      mortCode,
      period: periodLabel(period),
      verifiedBy: stage >= 1 ? verifier : "",
      dateVerified: stage >= 1 ? daysAfter(closedISO, 5) : "",
      approvedBy: stage >= 2 ? approver : "",
      dateApproved: stage >= 2 ? daysAfter(closedISO, 8) : "",
      // FINISHED, OR NOT YET — the line between For Process and everything past
      // it. Three days after the cut closed, which puts it between the upload
      // that raised the billing and the verification that follows it.
      dateProcessed: worked ? daysAfter(closedISO, 3) : "",
      cisBillingNo: billingCode,
      cisUploadDate: daysAfter(closedISO, 2),
      company: BILLING_COMPANY,
      chapel: hdr.chapelCode,
      noOfAccount: String(countByCode.get(billingCode) ?? 0),
      processedBy,
    };
  });
}
