// Which territories each member of staff holds, and in what order.
//
// THE LADDER IS AN ORDER, NOT A SET. Rank 1 is the primary — the territory a
// person is given work from at sign-in — and ranks 2, 3, 4 are tried in turn
// only when the one above them has nothing waiting. So every write here ends by
// renumbering the run: a ladder with a hole in it (1, 2, 4) would leave the
// routing walk with a rank to fall through, and the hole would be invisible on
// screen because the list still reads top to bottom.
//
// KEYED ON A DISPLAY NAME, WHICH IS WRONG, AND DELIBERATELY ISOLATED SO IT CAN
// STOP BEING WRONG IN ONE PLACE. There is no processor entity to point at:
// `PROCESSORS` in the payables seed is a list of names, `ServiceBilling`
// records a `processedBy` string, and `useCurrentUser()` returns a first name
// and a role — no person id anywhere. Two staff who share a name are therefore
// one person to this store. {@link ProcessorId} is the alias every signature
// below uses, so the day a PersonID reaches the session, that alias and the
// seed are the only things that change.
//
// IN MEMORY ONLY, like `service-payables-store`. Assignments live for the life
// of the tab; a reload is the seed again. The shape is the one the real table
// would have minus its history columns — `effectiveFrom`, `effectiveTo` and
// `assignedBy` are what make an assignment auditable, and they belong to a
// backend that can actually keep them.

import { useSyncExternalStore } from "react";

/**
 * Who an assignment belongs to.
 *
 * A name today. See the note above: this alias exists so that the change to a
 * real id is a change to this line, not to every function in the module.
 */
export type ProcessorId = string;

/**
 * Which queue a ladder applies to.
 *
 * Part of the key, not a filter over one shared ladder. Death claims and
 * service payables are separate queues fed by separate records — a claim's
 * territory comes from the branch that filed it, a payable's from the chapel
 * being billed — and in practice they are separate skills. Somebody can be
 * primary on Bicol for claims and hold nothing at all in payables.
 */
export type WorkType = "DEATH_CLAIM" | "SERVICE_PAYABLE";

export const WORK_TYPES: { label: string; value: WorkType }[] = [
  { label: "Service Payables", value: "SERVICE_PAYABLE" },
  { label: "Death Claims", value: "DEATH_CLAIM" },
];

export interface Assignment {
  processor: ProcessorId;
  territoryCode: string;
  workType: WorkType;
  /** 1 = primary. Contiguous within a (processor, workType) — see the note. */
  rank: number;
}

/* ------------------------------ roster ------------------------------ */

/**
 * The claims department, by team (user, 2026-09-14).
 *
 * NAMES ONLY, AND THAT IS THE WHOLE RECORD. A job title was carried here for a
 * moment and taken out again at the user's direction (2026-09-14) — worth a line
 * because the reason it could not simply stay is still true: no source in this
 * repo holds one. The session cookie carries a ROLE ("claims"), `processedBy` is
 * a bare name, and there is no staff table. Every title on the screen would have
 * been invented, so anything wanting one has to wait for the field rather than
 * seed around it.
 *
 * A PERSON BELONGS TO ONE TEAM, which is the fact that makes `workType` part of
 * the key rather than a filter over one shared ladder. Death claims and service
 * payables are not two views of the same desk — they are different people, and
 * assigning a death-claim processor to a payables territory is not a decision a
 * supervisor should be able to express here.
 *
 * UPPER-CASE to match `processedBy`, which is how a name reaches a billing.
 * Storing "Jackie Panes" here would leave the two unable to join the day these
 * assignments are matched against real work.
 *
 * AND THEY DO JOIN NOW, on the payables side (user, 2026-09-14). `PROCESSORS` in
 * `app/(pis)/data/billing-seed.ts` was five invented names; it is these three,
 * character for character, so a billing's `processedBy` and the holder of the
 * territory it came from are the same string. That is what makes the ladders on
 * this screen checkable against the queue next door instead of merely correct in
 * shape — and it is why a name here must not be edited on its own.
 *
 * THE DEATH CLAIM FOUR STILL JOIN TO NOTHING. No seed stamps them; the claim
 * records carry a branch, not a processor. Their ladders are the unenforceable
 * half, exactly as the note at the head of `utilities/page.tsx` describes.
 *
 * LIVES IN THE CLAIMS AREA, not in `app/(pis)/data`, because the roster is still
 * a stand-in for whatever staff table eventually gives a processor an id — real
 * names, no key.
 */
const ROSTER: Record<WorkType, ProcessorId[]> = {
  DEATH_CLAIM: [
    "MARITES BELIESTA",
    "EDWARDO III MACION",
    "JOANNE TATUMN CARUYAN",
    "NEIL ANDREI CASTILLO",
  ],
  SERVICE_PAYABLE: ["JACKIE PANES", "JOHN MICHAEL GAZA", "JOHN REY TAGADTAD"],
};

/* ------------------------------ seed ------------------------------ */

/**
 * An opening state with the three interesting cases already in it, because a
 * blank grid teaches nobody what the screen is for: somebody holding a full
 * ladder, somebody holding a single territory, somebody holding none at all,
 * and territories left uncovered on purpose.
 *
 * Deliberately does not cover all thirteen. The coverage panel's job is to
 * report gaps, and it can only be seen doing that if there are gaps to report.
 */
const SEED: Record<WorkType, [ProcessorId, string[]][]> = {
  DEATH_CLAIM: [
    ["MARITES BELIESTA", ["BT", "CLBZT"]],
    ["EDWARDO III MACION", ["CLT1", "CLT2"]],
    ["JOANNE TATUMN CARUYAN", ["NCT1", "NCT2"]],
    ["NEIL ANDREI CASTILLO", ["VCT", "VET", "VWT1"]],
  ],
  SERVICE_PAYABLE: [
    ["JACKIE PANES", ["BT", "CLBZT", "MMRPT"]],
    ["JOHN MICHAEL GAZA", ["CLT1", "CLT2", "CVT"]],
    ["JOHN REY TAGADTAD", ["NCT1", "VCT", "MCET"]],
  ],
};

function seedAssignments(): Assignment[] {
  const rows: Assignment[] = [];
  for (const workType of Object.keys(SEED) as WorkType[]) {
    for (const [processor, codes] of SEED[workType]) {
      codes.forEach((territoryCode, i) => {
        rows.push({ processor, territoryCode, workType, rank: i + 1 });
      });
    }
  }
  return rows;
}

let assignments: Assignment[] = seedAssignments();

/* ------------------------------ plumbing ------------------------------ */

const listeners = new Set<() => void>();

/** Bumped on every write, so `useSyncExternalStore` never compares arrays. */
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVersion = () => version;
/** Nothing has been assigned on the server — the seed is a client fact. */
const getServerVersion = () => 0;

/**
 * Subscribe a component to assignment writes.
 *
 * Same split as the payables store: this subscribes, the `get*` functions read.
 *
 *   useTerritoryAssignmentStore();
 *   const ladder = getLadder(processor, workType);
 */
export function useTerritoryAssignmentStore(): number {
  return useSyncExternalStore(subscribe, getVersion, getServerVersion);
}

/* ------------------------------ reads ------------------------------ */

/**
 * One team's staff, whether or not they hold a territory.
 *
 * Takes the team because the roster IS per team — see {@link ROSTER}. A flat
 * list would offer a payables clerk for a death-claim territory, which is not a
 * real assignment.
 */
export function getStaff(workType: WorkType): ProcessorId[] {
  return ROSTER[workType];
}

export function getAssignments(): readonly Assignment[] {
  return assignments;
}

/** One person's ladder for one queue, already in rank order. */
export function getLadder(
  processor: ProcessorId,
  workType: WorkType,
): Assignment[] {
  return assignments
    .filter((a) => a.processor === processor && a.workType === workType)
    .sort((a, b) => a.rank - b.rank);
}

/** Everyone holding `territoryCode`, primaries first. The inverse question. */
export function getHolders(
  territoryCode: string,
  workType: WorkType,
): Assignment[] {
  return assignments
    .filter((a) => a.territoryCode === territoryCode && a.workType === workType)
    .sort((a, b) => a.rank - b.rank);
}

/* ------------------------------ writes ------------------------------ */

/**
 * Rewrites one person's ranks to 1..n in their current order.
 *
 * Called at the end of every write rather than trusted to each one. Removing
 * rank 2 from a ladder of four leaves 1, 3, 4 if nobody renumbers, and the
 * screen cannot show the difference — which is exactly the kind of gap that
 * survives until the routing walk trips over it.
 */
function renumber(processor: ProcessorId, workType: WorkType) {
  getLadder(processor, workType).forEach((a, i) => {
    a.rank = i + 1;
  });
}

/** Adds a territory to the foot of a ladder. A no-op if it is already on it. */
export function addTerritory(
  processor: ProcessorId,
  workType: WorkType,
  territoryCode: string,
) {
  const ladder = getLadder(processor, workType);
  if (ladder.some((a) => a.territoryCode === territoryCode)) return;

  assignments = [
    ...assignments,
    { processor, territoryCode, workType, rank: ladder.length + 1 },
  ];
  renumber(processor, workType);
  emit();
}

export function removeTerritory(
  processor: ProcessorId,
  workType: WorkType,
  territoryCode: string,
) {
  assignments = assignments.filter(
    (a) =>
      !(
        a.processor === processor &&
        a.workType === workType &&
        a.territoryCode === territoryCode
      ),
  );
  renumber(processor, workType);
  emit();
}

/**
 * Moves a territory one place up or down its ladder.
 *
 * `direction` is -1 for up. Silently does nothing at either end, so the caller
 * can leave the buttons mounted and disable them on looks alone.
 */
export function moveTerritory(
  processor: ProcessorId,
  workType: WorkType,
  territoryCode: string,
  direction: -1 | 1,
) {
  const ladder = getLadder(processor, workType);
  const from = ladder.findIndex((a) => a.territoryCode === territoryCode);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ladder.length) return;

  const reordered = [...ladder];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);
  reordered.forEach((a, i) => {
    a.rank = i + 1;
  });

  assignments = [...assignments];
  emit();
}

