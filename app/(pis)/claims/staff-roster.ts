// The claims department, by team.
//
// LIFTED OUT OF THE TERRITORY ASSIGNMENT STORE when the Utilities page was
// archived (user, 2026-10-01: "the utilities are now implemented somewhere").
// The page went to `_archive/utilities/`; the roster could not, because the
// dashboard's leaderboard reads it and a live screen must not import from the
// archive. The archived store imports it from here, so the two cannot drift.
//
// KEYED ON A DISPLAY NAME, WHICH IS WRONG, AND DELIBERATELY ISOLATED SO IT CAN
// STOP BEING WRONG IN ONE PLACE. There is no processor entity to point at:
// `PROCESSORS` in the payables seed is a list of names, `ServiceBilling`
// records a `processedBy` string, and `useCurrentUser()` returns a first name
// and a role — no person id anywhere. {@link ProcessorId} is the alias every
// signature uses, so the day a PersonID reaches the session, that alias and the
// roster are the only things that change.

/**
 * Who a piece of work belongs to.
 *
 * A name today. See the note above: this alias exists so that the change to a
 * real id is a change to this line, not to every function that takes one.
 */
export type ProcessorId = string;

/**
 * Which queue a person works.
 *
 * Death claims and service payables are separate queues fed by separate
 * records — a claim's territory comes from the branch that filed it, a
 * payable's from the chapel being billed — and in practice they are separate
 * skills.
 */
export type WorkType = "DEATH_CLAIM" | "SERVICE_PAYABLE";

export const WORK_TYPES: { label: string; value: WorkType }[] = [
  { label: "Service Payables", value: "SERVICE_PAYABLE" },
  { label: "Death Claims", value: "DEATH_CLAIM" },
];

/**
 * The claims department, by team (user, 2026-09-14).
 *
 * NAMES ONLY, AND THAT IS THE WHOLE RECORD. A job title was carried here for a
 * moment and taken out again at the user's direction (2026-09-14) — no source in
 * this repo holds one. The session cookie carries a ROLE ("claims"),
 * `processedBy` is a bare name, and there is no staff table.
 *
 * A PERSON BELONGS TO ONE TEAM. Death claims and service payables are not two
 * views of the same desk — they are different people.
 *
 * UPPER-CASE to match `processedBy`, which is how a name reaches a billing.
 * `PROCESSORS` in `app/(pis)/data/billing-seed.ts` is the payables three,
 * character for character, so a name here must not be edited on its own.
 *
 * THE DEATH CLAIM FOUR JOIN TO NOTHING. No seed stamps them; the claim records
 * carry a branch, not a processor.
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

/**
 * One team's staff.
 *
 * Takes the team because the roster IS per team — see {@link ROSTER}. A flat
 * list would offer a payables clerk for a death-claim territory.
 */
export function getStaff(workType: WorkType): ProcessorId[] {
  return ROSTER[workType];
}
