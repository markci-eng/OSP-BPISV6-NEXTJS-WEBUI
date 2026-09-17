// What a territory looks like once the assignments are laid over it: who holds
// it, how much is waiting in it, and whether it can hold work at all.
//
// Reads the store, never the other way round — the same one-way dependency
// `service-payables-data` keeps with its own store.
//
// WAITING COUNTS COME FROM THE QUEUE THAT OWNS THEM, not from a count kept
// here. A death claim carries `territoryCode` on the claim itself, read off the
// branch that filed it; a payable carries none at all and is reached through
// its billing, which follows the chapel being serviced. Two different routes to
// the same question, so the two queues answer it separately and this module
// only picks which one to ask.

import { db } from "../../data";
import { getForProcessClaims } from "../death-claim/death-claims-data";
import { getTerritorySummaries } from "../service-payables/service-payables-data";
import {
  getHolders,
  getLadder,
  getStaff,
  type Assignment,
  type ProcessorId,
  type WorkType,
} from "./territory-assignment-store";

export interface TerritoryStanding {
  territoryCode: string;
  /** e.g. "BICOL TERRITORY". */
  description: string;
  /** Unworked items sitting in this territory for the chosen queue. */
  waitingCount: number;
  /**
   * Whether this territory can produce work for the chosen queue at all.
   *
   * DORMANT IS NOT UNCOVERED, and the difference is the whole reason this field
   * exists. Three of the thirteen — GME, MCET, NCT2 — have no chapels, so they
   * cannot raise a service payable however long you wait. Counting them as
   * coverage gaps would put three permanent warnings on a screen whose only job
   * is to make a real gap stand out.
   */
  isDormant: boolean;
  /** Staff holding this at rank 1. */
  primaries: ProcessorId[];
  /** Staff holding it anywhere below rank 1. */
  fallbacks: ProcessorId[];
}

/**
 * Unworked items per territory, keyed by territory code.
 *
 * "Unworked" is each queue's own first stage: claims that have reached nobody
 * yet, billings still `for-process`. Work already being handled by somebody is
 * not waiting, and counting it would make a busy territory look like a backlog.
 */
export function getWaitingByTerritory(workType: WorkType): Map<string, number> {
  const waiting = new Map<string, number>();

  if (workType === "DEATH_CLAIM") {
    for (const claim of getForProcessClaims()) {
      if (!claim.territoryCode) continue;
      waiting.set(
        claim.territoryCode,
        (waiting.get(claim.territoryCode) ?? 0) + 1,
      );
    }
    return waiting;
  }

  for (const summary of getTerritorySummaries("for-process")) {
    waiting.set(summary.territoryCode, summary.serviceCount);
  }
  return waiting;
}

/**
 * Whether a territory has anywhere for work to come from.
 *
 * Asked of a different table per queue, because the two are fed differently: a
 * payable is raised by a chapel, a claim is filed by a branch. A territory with
 * chapels but no branches is dormant for claims and live for payables, and
 * saying so is more useful than picking one table for both.
 */
function isDormant(territoryCode: string, workType: WorkType): boolean {
  return workType === "DEATH_CLAIM"
    ? db.getBranchesByTerritory(territoryCode).length === 0
    : db.getChapelsByTerritory(territoryCode).length === 0;
}

/**
 * Every territory, with its holders and its backlog.
 *
 * ALL THIRTEEN, including the ones nobody holds and the ones with nothing in
 * them — a territory missing from this list is indistinguishable from one that
 * does not exist, and the gaps are what the screen is for. Ordered by the size
 * of the problem: uncovered territories that have work waiting first, then the
 * rest by backlog, then the dormant ones at the foot.
 */
export function getTerritoryStandings(
  workType: WorkType,
): TerritoryStanding[] {
  const waiting = getWaitingByTerritory(workType);

  const standings = db
    .getTerritories()
    .filter((t) => t.isActive)
    .map<TerritoryStanding>((t) => {
      const holders = getHolders(t.territoryCode, workType);
      return {
        territoryCode: t.territoryCode,
        description: t.description,
        waitingCount: waiting.get(t.territoryCode) ?? 0,
        isDormant: isDormant(t.territoryCode, workType),
        primaries: holders.filter((h) => h.rank === 1).map((h) => h.processor),
        fallbacks: holders.filter((h) => h.rank > 1).map((h) => h.processor),
      };
    });

  return standings.sort((a, b) => {
    if (a.isDormant !== b.isDormant) return a.isDormant ? 1 : -1;
    const aGap = a.primaries.length === 0 && a.waitingCount > 0;
    const bGap = b.primaries.length === 0 && b.waitingCount > 0;
    if (aGap !== bGap) return aGap ? -1 : 1;
    if (b.waitingCount !== a.waitingCount) return b.waitingCount - a.waitingCount;
    return a.territoryCode.localeCompare(b.territoryCode);
  });
}

export interface StaffStanding {
  processor: ProcessorId;
  /** Their primary's description, or null when they hold nothing. */
  primary: string | null;
  /** How many territories they hold for this queue, primary included. */
  ladderLength: number;
}

/**
 * The staff list with enough on it to choose a name from.
 *
 * THE NUMBER IS HOW MANY TERRITORIES, NOT HOW MUCH WORK. Backlog moves every
 * few minutes and belongs to the queue screens; what this screen edits is the
 * assignment, so the count beside a name is the thing this screen is
 * responsible for and the thing that changes when you use it. It also makes the
 * row that reads 0 mean something precise — nobody has been given anything —
 * rather than "nothing happens to be waiting today".
 */
export function getStaffStandings(workType: WorkType): StaffStanding[] {
  return getStaff(workType).map((processor) => {
    const ladder = getLadder(processor, workType);
    return {
      processor,
      primary: ladder[0] ? db.getTerritoryName(ladder[0].territoryCode) : null,
      ladderLength: ladder.length,
    };
  });
}

/**
 * What the routing walk would hand this person right now, in words.
 *
 * The preview line on the ladder. A rank order does not say what it means on
 * its own — "BT, then CLT1, then CLBZT" is the ladder, but "Bicol is empty, so
 * they get Central Luzon 1" is the consequence, and the consequence is what a
 * supervisor is actually deciding.
 */
export function describeNextPull(
  processor: ProcessorId,
  workType: WorkType,
): string {
  const ladder: Assignment[] = getLadder(processor, workType);
  if (ladder.length === 0) {
    return "Holds no territory — signs in to an empty queue.";
  }

  const waiting = getWaitingByTerritory(workType);
  const hit = ladder.find((a) => (waiting.get(a.territoryCode) ?? 0) > 0);

  if (!hit) {
    return "Nothing waiting anywhere on this ladder — falls through to overflow.";
  }

  const name = db.getTerritoryName(hit.territoryCode);
  const count = waiting.get(hit.territoryCode) ?? 0;

  if (hit.rank === 1) {
    return `Next pull: ${name} — primary, ${count} waiting.`;
  }

  const skipped = ladder
    .slice(0, hit.rank - 1)
    .map((a) => db.getTerritoryName(a.territoryCode))
    .join(", ");

  return `Next pull: ${name} — rank ${hit.rank}, ${count} waiting. ${skipped} ${
    hit.rank === 2 ? "is" : "are"
  } empty.`;
}
