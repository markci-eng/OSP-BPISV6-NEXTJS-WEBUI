"use client";

// `/claims/death-claim` — the Conveyor, and the death-claim screen.
//
// THE PAGE SERVES THE CLAIM; the processor does not go and find one. It takes
// the head of the priority queue — specials first, then whoever waited longest
// — puts it on screen, and brings the next one the moment this one is answered.
//
// WHY THERE IS NO LIST. A list is an invitation to choose, and choosing is what
// breaks a priority queue: given thirty claims on screen, people take the short
// ones, and the branch that has been waiting since March goes on waiting. Serve
// one and the order holds by construction. The override — taking a claim out of
// turn, which is a real need — belongs in the bar above the card, is deliberate,
// and is logged; it is being designed separately.
//
// WHAT IS DELIBERATELY NOT HERE YET, because the bar above the card is a
// separate piece of design: the queue counters, find-a-claim, and the lease
// timer. The lease in particular is not a UI feature — it is the server-side
// checkout that stops two processors opening one claim, and a timer drawn
// before that exists would be a decoration that lies.
//
// IT WON. This was one of three answers to the same brief, built beside the
// others at `/claims/death-claim` while they were compared: v1 was a
// dashboard of queues, v2 was queue-first — a pinned list and whatever you
// picked — and this is claim-first. It is the screen now, so it stands where the
// sidebar's "Death" has always pointed.
//
// THE OTHER TWO ARE KEPT, in `../../_archive`. A folder whose name begins with
// an underscore is private to Next's router: the files are there to read and to
// lift from, and no route is served for either of them. See the note in that
// folder for what each one was arguing.

import { useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import {
  Page,
  PrimarySmButton,
  SecondarySmButton,
  useMessageDialog,
} from "osp-ui-kit";
import { toast } from "sonner";
import {
  LuClipboardList,
  LuHistory,
  LuInbox,
  LuLayoutGrid,
  LuSearch,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { formatFiledDate, type ClaimPhase } from "../../data";
import {
  addClaimNote,
  CLAIM_AUDIT_USER,
  COMPLIANCE_REASONS,
  CORRECTABLE_PLANHOLDER_FIELDS,
  correctPlanholder,
  decideClaim,
  getPlanholderCorrections,
  planholderValueLabel,
  revertPlanholderCorrections,
  type CorrectionStage,
  type PlanholderCorrection,
  type PlanholderField,
  DENIAL_REASONS,
  getClaimActionBy,
  getClaimDecision,
  getClaimNotes,
  getClaimRework,
  getClaimVerdict,
  recordVerdict,
  type ClaimAction,
  type ClaimActionKind,
  returnClaimForCompliance,
  returnToProcessor,
  REWORK_REASONS,
  useClaimStore,
} from "../claim-store";
import {
  getOutstandingDeficiencyNames,
  getPlanholder,
  getPlanholderBeneficiaries,
  getPlanholderRemarks,
} from "../claims-data";
import {
  compareByQueueOrder,
  deathClaims,
  getDeathClaim,
  getForProcessClaims,
  getForVerificationClaims,
  type DeathClaim,
} from "./death-claims-data";

/** The edit form's values when a claim has no planholder record to correct. */
const NO_PLANHOLDER_VALUES = {
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  dateOfBirthISO: "",
};

/** The queues this page can serve. See `STAGES` below for who owns which. */
type StageKey = "process" | "verification";

/**
 * Where a claim on file sits in its processor's history, by its status.
 * "Pending" is absent: nobody has answered it, so it is not history.
 */
const PHASE_TO_HISTORY: Partial<Record<ClaimPhase, ClaimActionKind>> = {
  "For Approval": "approval",
  "For Denial": "denial",
  Approved: "approved",
  Denied: "denied",
};
import { KitCardShape, SectionCard } from "../components/section-card";
import {
  currentRange,
  inRange,
  rangeFor,
  rangeSteps,
  type HistoryRange,
} from "./conveyor/history-range";
import { LookupRow, PaymentsLookup } from "../components/lookup-row";
import {
  BottomOnPhonePopup,
  SectionLauncher,
} from "../components/section-popup";
import { ClaimPayees } from "../components/claim-payees";
import { PlanholderInfoCard } from "../planholder/components/PlanholderInfoCard";
import { PlanholderRemarks } from "../planholder/components/PlanholderRemarks";
import { PlanholderBeneficiaries } from "../planholder/components/PlanholderBeneficiaries";
import { PlanholderDocuments } from "../planholder/components/PlanholderDocuments";
import { ConveyorCard } from "./conveyor/conveyor-card";
import { ClaimActionList, ClaimActions } from "./conveyor/claim-actions";
import { ClaimListPopup } from "./conveyor/claim-list-popup";
import { ReasonDialog } from "./conveyor/reason-dialog";
import {
  WorkLists,
  WORK_LISTS,
  type WorkListKey,
} from "./conveyor/work-lists";
import { StageCard } from "./conveyor/stage-card";
import {
  CountBubble,
  MobileQuickAccess,
  QUICK_BAR_ROOM,
} from "./conveyor/mobile-quick-access";
import {
  SHELL_NAV_HEIGHT,
  SHELL_NAV_HIDE_EASE,
  SHELL_NAV_SHOW_EASE,
  useShellNavHidden,
} from "../components/use-shell-nav-hidden";
import {
  CONVEYOR_GAP,
  CONVEYOR_TRACK,
  CONVEYOR_TRACK_COLLAPSED,
} from "../components/conveyor-columns";
import { useRailCollapsed } from "../components/use-rail-collapsed";
import {
  RAIL_FADE_IN,
  RAIL_TRACK_TRANSITION,
  RailCount,
  RailFlyout,
  RailHint,
  RailSpine,
  RailStagePair,
  RailStrip,
  RailStripButton,
  RailStripDivider,
} from "../components/rail-strip";
import { ClaimSwapSkeleton } from "./conveyor/claim-swap-skeleton";
import { useClaimSwap } from "./conveyor/use-claim-swap";
import {
  CorrectionLabel,
  type CorrectionLine,
} from "./conveyor/correction-label";
import { PlanholderEditDialog } from "./conveyor/planholder-edit-dialog";
import {
  PlanholderChangesDialog,
  type ChangesReader,
} from "./conveyor/planholder-changes-dialog";
import {
  ageAtDeathOf,
  ageOf,
  correctedValues,
  planholderValuesOnFile,
  withValues,
} from "./conveyor/planholder-corrections";
import type { LabelMarks } from "../planholder/components/PlanholderInfoCard";
import { EditedFieldsButton, type EditedItem } from "../components/edit-mark";
import { useClaimEvidence } from "./conveyor/use-claim-evidence";

export default function DeathClaimV3Page() {
  // Answering a claim writes to the store, so the queue is re-read whenever it
  // changes — the same subscription every other claims screen uses.
  const storeVersion = useClaimStore();

  // THE AREA'S OWN CONFIRMATION, not a dialog of this page's own — the same
  // `messageBox` the plan holder's claim detail asks with before it removes a
  // payee, and the one this codebase says to use rather than hand-rolling a
  // modal. See its use on Approve below.
  const { messageBox } = useMessageDialog();

  /**
   * The queue, in the order it is worked.
   *
   * FOR PROCESS ONLY. The other two queues are somebody else's step, and the
   * Conveyor serves exactly one: the claims waiting on a processor's answer.
   *
   * Sorted with the shared comparator rather than a copy of the rule — see
   * `compareByQueueOrder`. This screen and the v2 rail agree about what "next"
   * means because they ask the same function.
   */
  const processQueue = useMemo(
    () => [...getForProcessClaims()].sort(compareByQueueOrder),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  /**
   * The SUPERVISOR'S queue — claims a processor has finished and endorsed.
   *
   * ASSEMBLED HERE RATHER THAN TAKEN WHOLE from `getForVerificationClaims`,
   * which answers a different question than this screen asks. That selector
   * reads claims with a HEADER — endorsed in the seed, or created through v1's
   * form — and knows nothing about `decideClaim`, which is how a claim leaves
   * the conveyor. Without the second half a supervisor would never see the work
   * a processor just did on this page, which is the whole flow being designed.
   *
   * Minus what has already been answered: a claim with a verdict is finished,
   * and one sent back for rework has returned to the processor's queue.
   */
  const verificationQueue = useMemo(() => {
    const endorsedHere = processQueue.filter((item) =>
      getClaimDecision(item.reference),
    );
    const seen = new Set(endorsedHere.map((item) => item.reference));
    const rest = getForVerificationClaims().filter(
      (item) => !seen.has(item.reference),
    );
    return [...endorsedHere, ...rest]
      .filter(
        (item) =>
          !getClaimVerdict(item.reference) && !getClaimRework(item.reference),
      )
      .sort(compareByQueueOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeVersion, processQueue]);

  /**
   * How far down the queue this session has worked.
   *
   * AN INDEX AND NOT A FILTER, deliberately, and only until there is a server
   * behind this. A real conveyor asks the API for the next unleased claim and
   * the answered one simply stops coming back; here the seed is immutable, so a
   * claim answered a moment ago is still in `queue` and something has to
   * remember that it has been dealt with. The index is that memory, and it is
   * honest about being local: reload and the queue starts again.
   *
   * What it must NOT become is a way to browse. There is no back.
   */
  /**
   * Which queue the page is serving, and how far into EACH one this session has
   * worked.
   *
   * A POSITION PER STAGE, not one shared index. Switching to verification and
   * back should find the process queue where it was left; a single index would
   * carry the supervisor's position into the processor's queue and skip whatever
   * happened to sit under it.
   */
  const [stage, setStage] = useState<StageKey>("process");
  const [servedByStage, setServedByStage] = useState<Record<StageKey, number>>({
    process: 0,
    verification: 0,
  });

  const served = servedByStage[stage];
  const setServed = (next: number | ((current: number) => number)) =>
    setServedByStage((all) => ({
      ...all,
      [stage]: typeof next === "function" ? next(all[stage]) : next,
    }));

  const verifying = stage === "verification";
  const queue = verifying ? verificationQueue : processQueue;

  /**
   * EVERY PATH THAT PUTS A DIFFERENT CLAIM ON SCREEN GOES THROUGH `swap`.
   *
   * Answering one, picking one out of the queue, changing stage. A path that did
   * not would be the one that flickers — and it would be the one nobody tests,
   * because the other three look right. See `useClaimSwap` for what it does.
   *
   * The anchor is the page's own top; the hook walks up from it to find the
   * element that actually scrolls, which in this shell is a div rather than the
   * window.
   */
  const topRef = useRef<HTMLDivElement>(null);
  const { swapping, swap } = useClaimSwap(topRef);

  /**
   * Which look-up is open over the page — the two plan-scoped records that
   * are consulted rather than read on the way past. Same pair, and the same
   * reasoning, as the v2 dashboard.
   */
  // PAYMENTS IS NOT IN HERE ANY MORE — `PaymentsLookup` holds its own, so the
  // service record's copy of the card behaves identically without this page's
  // wiring being reproduced there.
  const [popup, setPopup] = useState<"beneficiaries" | null>(null);

  /**
   * The rail's search box, and whether the queue is open over the page.
   *
   * HELD BY THE PAGE rather than by either control, because they are two halves
   * of one gesture: the query is typed in the rail and run in the pop-up, and a
   * field that forgot what it was asked the moment the list opened would make
   * the second half unreadable.
   *
   * THE QUEUE IS THE ONE PLACE `served` MOVES BACKWARDS — see the note above it
   * about there being no back. That still holds for the conveyor itself, which
   * only ever advances; this is the deliberate override, and it is deliberate in
   * the literal sense that somebody had to open a list and pick.
   */
  const [query, setQuery] = useState("");

  /** The rail folded to its icon strip — desktop only; see `RailStrip`. */
  const [railCollapsed, setRailCollapsed] = useRailCollapsed();
  const [browseOpen, setBrowseOpen] = useState(false);

  /** Which of the reference lists is open over the page, if any. */
  const [workList, setWorkList] = useState<WorkListKey | null>(null);

  /**
   * A claim taken out of a reference list that belongs to NO queue this screen
   * serves — held in front of the conveyor until it is let go.
   *
   * THE CONVEYOR CANNOT HOLD IT, which is why this exists at all. The claim on
   * screen is normally `queue[served]`, and half of what the reference lists
   * contain is not in a queue: approved, denied, or sent back to a branch. There
   * is no index to jump to, so the claim is carried beside the position rather
   * than as one — see {@link openFromList}, which only reaches for this once
   * both queues have been asked.
   *
   * BY REFERENCE, not as the record. A stored row would be a snapshot taken when
   * it was picked; the reference is resolved on every render, so what is drawn is
   * whatever the claim says now. Same reasoning as `selected` on the v2 dashboard.
   *
   * `from` is the list it was taken out of, and it is carried because the pop-up
   * closes on the pick: without it the bar above the claim could not say where
   * the reader had come from, which is the one thing it is there to answer.
   */
  const [held, setHeld] = useState<{ reference: string; from: string } | null>(
    null,
  );

  /**
   * Whether a reason is being collected for one of the two negative answers.
   *
   * TWO FLAGS AND NOT ONE ENUM, because they drive two separately mounted
   * dialogs — see `ReasonDialog`. An enum would mean one dialog whose reason
   * list changed under the reader on the frame it opened.
   */
  const [denyOpen, setDenyOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [reworkOpen, setReworkOpen] = useState(false);
  // Whether the shell's bottom navigation is tucked away — the column's foot
  // only reserves room for it while it is up.
  const navHidden = useShellNavHidden();

  /**
   * The planholder's correction — the form, and the list of changes the rail's
   * Edit opens once there are some. Two dialogs, mounted always, for the same
   * reason as the pair above.
   */
  const [editOpen, setEditOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);

  /**
   * THE USER'S HISTORY — every claim connected to them, most recent first, with
   * where it stands and when they acted.
   *
   * NOT THE FILE. The claims still waiting are the queue, and the queue is
   * reached through the search at the top of the rail (user, 2026-09-29).
   *
   * TWO SOURCES. What this session did (`getClaimActionBy`) wins, being the
   * later fact; otherwise a claim on file this user processed — its header's
   * processor — sits under its status on the record, dated when the header was
   * opened. A claim on file still "Pending" was not answered by anyone, so it
   * is not history.
   *
   * UNCUT HERE: the arrows need every date the user has, whatever period is on
   * screen. See `rangeSteps`.
   *
   * Re-derived on `storeVersion`: every answer writes to the store, and a count
   * that did not follow would be wrong from the first one.
   */
  const history = useMemo(() => {
    const fromRecord = (item: DeathClaim): ClaimAction | undefined => {
      if (item.processor.name !== CLAIM_AUDIT_USER) return undefined;
      const kind = PHASE_TO_HISTORY[item.phase];
      return kind ? { kind, atISO: item.processedAt ?? item.filedAt } : undefined;
    };

    return deathClaims
      .map((item) => ({
        item,
        action: getClaimActionBy(item.reference) ?? fromRecord(item),
      }))
      .filter(
        (entry): entry is { item: DeathClaim; action: ClaimAction } =>
          entry.action !== undefined,
      )
      .sort((a, b) => b.action.atISO.localeCompare(a.action.atISO));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeVersion]);

  const historyDates = useMemo(
    () => history.map((entry) => entry.action.atISO),
    [history],
  );

  /**
   * The period the card counts — WEEKLY, ON THE CURRENT WEEK, by default
   * (user, 2026-09-29). See `history-range` for where the arrows may go.
   */
  const [range, setRange] = useState<HistoryRange>(() => currentRange("week"));
  const steps = rangeSteps(range, historyDates);

  const workLists = useMemo(() => {
    const mine = history.filter((entry) => inRange(range, entry.action.atISO));
    const of = (kind: ClaimActionKind) =>
      mine.filter((entry) => entry.action.kind === kind).map((e) => e.item);

    return {
      all: mine.map((entry) => entry.item),
      approval: of("approval"),
      denial: of("denial"),
      approved: of("approved"),
      denied: of("denied"),
      compliance: of("compliance"),
    };
  }, [history, range]);

  const workListCounts: Record<WorkListKey, number> = {
    all: workLists.all.length,
    approval: workLists.approval.length,
    denial: workLists.denial.length,
    approved: workLists.approved.length,
    denied: workLists.denied.length,
    compliance: workLists.compliance.length,
  };

  /**
   * The claim on screen: whatever is being held, else the conveyor's own.
   *
   * The held claim wins because it was asked for by name. It is also the only
   * claim this page shows that it cannot be answered — see the bar above the
   * conveyor card, and the foot of the column where the verdict row gives way to
   * what the record already says.
   */
  const claim = held
    ? (getDeathClaim(held.reference) ?? queue[served])
    : queue[served];

  // Called before the empty-queue return below, so the hook order never changes
  // between renders — see the note on `useClaimEvidence`.
  const evidence = useClaimEvidence(claim);

  /** Answer this claim and bring the next. */
  const advance = (message: string, description: string) => {
    swap(() => setServed((n) => n + 1));
    toast.success(message, { description });
  };

  /**
   * PUT A CLAIM PICKED OUT OF A LIST ON SCREEN — the one way in, for all five
   * reference lists and for the queue browser.
   *
   * IT ASKS THE QUEUES FIRST, and that order is the whole of it. A claim still
   * waiting on somebody is a POSITION: moving the conveyor to it leaves the
   * screen exactly as it would have been had the claim come up in turn, with
   * every answer on offer. Holding such a claim instead would strand a workable
   * claim behind a read-only bar.
   *
   *   1. THIS stage's queue — move the conveyor to it.
   *   2. THE OTHER stage's queue — switch stage and move that one. A claim a
   *      processor endorsed this morning is in the supervisor's queue, not
   *      theirs, and refusing to follow it there would be the page pretending it
   *      has no second queue while a tab for it sits in the rail.
   *   3. NEITHER — hold it. Approved, denied, or sent back to a branch: there is
   *      no position to take, so the claim stands in front of the conveyor
   *      instead of on it. See {@link held}.
   *
   * The conveyor's position is not spent on a held claim, so letting go returns
   * the reader to exactly the claim they left.
   */
  const openFromList = (picked: DeathClaim, from: string) => {
    const positionIn = (key: StageKey) =>
      (key === "verification" ? verificationQueue : processQueue).findIndex(
        (item) => item.reference === picked.reference,
      );

    const here = positionIn(stage);
    if (here >= 0) {
      swap(() => {
        setHeld(null);
        setServed(here);
      });
      return;
    }

    const other: StageKey = stage === "process" ? "verification" : "process";
    const there = positionIn(other);
    if (there >= 0) {
      swap(() => {
        setHeld(null);
        setStage(other);
        // WRITTEN AGAINST `other` RATHER THAN THROUGH `setServed`, which writes
        // to whichever stage is current — and this runs in the same batch as the
        // change of stage, so "current" is still the one being left.
        setServedByStage((all) => ({ ...all, [other]: there }));
      });
      return;
    }

    swap(() => setHeld({ reference: picked.reference, from }));
  };

  if (!claim) {
    return (
      <Page.Root subtitle="Claims" title="Death Claim" headerButton="menu">
        <Page.MainContent>
          <Page.Row>
            <Flex
              direction="column"
              align="center"
              justify="center"
              textAlign="center"
              gap={3}
              py={{ base: 16, md: 28 }}
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="gray.200"
              borderRadius="xl"
              bg="white"
            >
              <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
                <LuInbox size={26} />
              </Box>
              <Text fontSize="lg" fontWeight="700" color="gray.800">
                {queue.length ? "Queue clear" : "Nothing waiting"}
              </Text>
              <Text fontSize="sm" color="gray.500" maxW="380px">
                {queue.length
                  ? `You have worked through all ${queue.length} claims waiting for a processor.`
                  : "No claim is waiting on a processor right now."}
              </Text>
              {queue.length > 0 && (
                <Box mt={1}>
                  <PrimarySmButton onClick={() => setServed(0)}>
                    Start again
                  </PrimarySmButton>
                </Box>
              )}
            </Flex>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>
    );
  }

  /**
   * The queues this user owns.
   *
   * BOTH, TO EVERYONE, AND THAT IS NOT THE FINISHED STATE. The card renders a
   * heading for one stage and tabs for two without being told who is looking, so
   * the only thing between this and a correct build is the ROLE: `UserRole` in
   * `lib/access-control` has a single `claims` value covering this whole area,
   * with no processor / supervisor split, so there is nothing to read that would
   * decide whether Verify belongs to this person.
   *
   * Showing both is the deliberate stand-in while the design is being reviewed —
   * a supervisor holds every privilege a processor does, so their view is the
   * superset and it is the one worth looking at. Gate this array on the role the
   * day there is one, and a processor's card goes back to a heading on its own
   * with nothing else on the page changing.
   *
   * The count is what is LEFT rather than what the queue holds, because `served`
   * is this session's local memory of what has been answered — see its note. A
   * server-backed queue simply stops returning the answered ones and the two
   * numbers become the same.
   */
  const STAGES = [
    {
      key: "process",
      label: "For Process",
      count: processQueue.length - servedByStage.process,
    },
    {
      key: "verification",
      label: "Verify",
      count: verificationQueue.length - servedByStage.verification,
    },
  ];

  const label = claim.claimNo ?? claim.reference;

  /**
   * Who a supervisor's return goes back to.
   *
   * THE PERSON WHO ENDORSED IT, not the claim's audit user — that is the BRANCH
   * that filed it, and sending rework to the filer is sending it to the wrong
   * desk entirely. A claim with no endorsement on file (one seeded as already
   * endorsed, which this session never saw worked) has nobody to name, and the
   * fallback says so rather than inventing a name.
   */
  const returnsTo =
    getClaimDecision(claim.reference)?.decidedBy ?? "the processor";
  const planholder = getPlanholder(claim.lpaNo);
  // NO `paymentCount` HERE ANY MORE: `PaymentsLookup` counts the receipts
  // itself, off the plan number, so the claim and the service record cannot end
  // up counting the same thing two ways. See `lookup-row`.
  const beneficiaryCount = getPlanholderBeneficiaries(claim.lpaNo).length;

  /**
   * WHETHER THE FOLDER IS SHORT ANYTHING — the Deficient line on the plan
   * holder's card.
   *
   * READ OFF THE SAME EXPRESSION THE FOLDER USES, not off `claim.isDeficient`.
   * That field is `DEFICIENT_UNTIL_RECORDED` — hard `true` on every claim until
   * a real requirement table exists — so a card drawn from it would say Yes
   * about everything, including a claim whose Deficiencies tab reads 0. This is
   * `getOutstandingDeficiencyNames`, which is exactly what that tab counts, so the
   * word here and the number a few sections down can never disagree.
   */
  // Raised and withdrawn deficiencies count too — see
  // `planholder-deficiency-store`, which this page subscribes to.
  const deficient = planholder
    ? getOutstandingDeficiencyNames(planholder.personId).length > 0
    : undefined;

  /**
   * THE PLANHOLDER AS THIS CLAIM READS IT — the record, with the processor's
   * corrections laid over (see `planholder-corrections`). Re-read on every
   * render; the page is subscribed to the store, so a save or a revert redraws
   * the card at once.
   *
   * WHO IS READING decides what they may do with them: the processor and the
   * verifier both correct and revert — the verifier overrides by editing, with
   * no accept or reject (user, 2026-10-01) — and a held claim, one taken out of
   * a list rather than a queue this desk works, is only read.
   */
  const corrections = getPlanholderCorrections(claim.reference);
  const onFile = planholder ? planholderValuesOnFile(planholder) : undefined;
  const shown = onFile ? correctedValues(onFile, corrections) : undefined;
  const shownPlanholder =
    planholder && shown ? withValues(planholder, shown) : planholder;
  const reader: ChangesReader = held
    ? "reader"
    : verifying
      ? "verifier"
      : "processor";
  const dobCorrection = corrections.find((c) => c.field === "dateOfBirthISO");

  /**
   * WHO MAY TAKE A CHANGE BACK: whoever has the claim — the processor, or the
   * verifier on any change, the processor's included (user, 2026-10-01).
   */
  const canRevert = reader !== "reader";

  /** Both of the asks below say exactly what goes back, field by field. */
  const describeReverts = (list: PlanholderCorrection[]) =>
    list
      .map(
        (c) =>
          `${CORRECTABLE_PLANHOLDER_FIELDS[c.field]}: ${planholderValueLabel(c.field, c.to)} → ${planholderValueLabel(c.field, c.from)}`,
      )
      .join("; ");

  /**
   * EVERY UNDO ASKS FIRST (user, 2026-09-29) — one field from its label's
   * tooltip, or all of them from the change list. A correction may have taken a
   * death certificate to work out; it should not vanish on a stray click.
   */
  const revert = async (fields: PlanholderField[]) => {
    const list = corrections.filter((c) => fields.includes(c.field));
    if (list.length === 0) return;
    const confirmed = await messageBox({
      title: list.length > 1 ? "REVERT CHANGES" : "REVERT CHANGE",
      message: `Revert ${list.length > 1 ? `all ${list.length} changes` : CORRECTABLE_PLANHOLDER_FIELDS[list[0].field]} to what the record says? ${describeReverts(list)}.`,
      confirmText: "Revert",
      cancelText: "Keep change",
      variant: "confirmation",
    });
    if (!confirmed) return;
    revertPlanholderCorrections(
      claim.reference,
      list.map((c) => c.field),
    );
    toast.success(list.length > 1 ? "Changes reverted" : "Change reverted", {
      description: list
        .map((c) => CORRECTABLE_PLANHOLDER_FIELDS[c.field])
        .join(", "),
    });
  };

  /**
   * The corrected labels, for the card — see `CorrectionLabel`. The name's parts
   * and the birth date are marked where they were changed; the two ages follow
   * the birth date, so they are marked with it and say so.
   */
  const byline = (c: PlanholderCorrection) =>
    `by ${c.editedBy} · ${formatFiledDate(c.editedAtISO)}`;
  // OVERRIDE IS THE FORM (user, 2026-10-02: "verifier or user can revert or
  // override changes"). Editing a change again makes it the editor's.
  const ownStage: CorrectionStage | undefined =
    reader === "processor" ? "process" : reader === "verifier" ? "verification" : undefined;
  const override = canRevert ? () => setEditOpen(true) : undefined;
  const labelMarks: LabelMarks = {};
  for (const c of corrections) {
    const label = CORRECTABLE_PLANHOLDER_FIELDS[c.field];
    labelMarks[label] = (
      <CorrectionLabel
        label={label}
        stage={c.stage}
        byline={byline(c)}
        markKey={c.field}
        lines={[
          {
            title: label,
            from: c.from ? planholderValueLabel(c.field, c.from) : "",
            to: planholderValueLabel(c.field, c.to),
            field: c.field,
          },
        ]}
        onRevert={canRevert ? (f) => revert([f]) : undefined}
        onOverride={override}
        ownStage={ownStage}
      />
    );
  }
  if (dobCorrection && onFile) {
    const derived = (label: string, line: CorrectionLine) => (
      <CorrectionLabel
        label={label}
        stage={dobCorrection.stage}
        byline={byline(dobCorrection)}
        markKey={label}
        lines={[line]}
      />
    );
    labelMarks.Age = derived("Age", {
      title: "Follows Date of Birth",
      from: ageOf(onFile.dateOfBirthISO),
      to: ageOf(dobCorrection.to),
    });
    labelMarks["Age at Death"] = derived("Age at Death", {
      title: "Follows Date of Birth",
      from:
        ageAtDeathOf(onFile.dateOfBirthISO, claim.dateOfDeath) ??
        claim.ageOfDeath,
      to: ageAtDeathOf(dobCorrection.to, claim.dateOfDeath) ?? "—",
    });
  }

  /**
   * THE HEADER'S EDIT LIST — the pencil beside the contact icon (see
   * `EditedFieldsButton`). A part of the name rings the header's name when its
   * own label is not on screen, which on a phone it never is.
   */
  const editedItems: EditedItem[] = corrections.map((c) => ({
    key: c.field,
    label: CORRECTABLE_PLANHOLDER_FIELDS[c.field],
    from: c.from ? planholderValueLabel(c.field, c.from) : "",
    to: planholderValueLabel(c.field, c.to),
    by: `${c.stage === "process" ? "Processor" : "Verifier"} · ${c.editedBy} · ${formatFiledDate(c.editedAtISO)}`,
    fallbackKey: c.field === "dateOfBirthISO" ? undefined : "name",
  }));

  /**
   * THE RAIL'S EDIT. With changes on the claim it opens the list of them — for
   * everybody, since the list is where each reader acts on them. Without, the
   * processor and the verifier both get the form; a held claim is only read.
   */
  const openEdit = () => {
    if (corrections.length > 0) return setChangesOpen(true);
    if (reader !== "reader") return setEditOpen(true);
    toast.info("No planholder changes on this claim", { description: label });
  };

  /**
   * A STAGE CHANGE IS A CLAIM CHANGE. The other queue's head is a different
   * claim, a different plan holder and a different set of answers — everything
   * a swap exists for, including the scroll back to the top.
   *
   * AND IT LETS GO OF A HELD CLAIM. Asking for a queue is asking for the work in
   * it; leaving a claim from the Denied list standing in front of the stage just
   * picked would answer a question nobody asked. See {@link held}.
   */
  const changeStage = (key: string) =>
    swap(() => {
      setHeld(null);
      setStage(key as StageKey);
    });

  // Every change on the claim, for whoever is reading it.
  const editCount = corrections.length;

  // THE THREE ANSWERS, once — the desktop row and the phone's two rows both
  // call these, so the two layouts cannot drift into two behaviours. What each
  // one does and why is told where the desktop row draws them.
  const openReturn = () =>
    verifying ? setReworkOpen(true) : setComplianceOpen(true);
  const openDeny = () => setDenyOpen(true);
  const endorse = async () => {
    const confirmed = await messageBox({
      title: verifying ? "VERIFY CLAIM" : "ENDORSE CLAIM",
      message: verifying
        ? `Verify ${label}? It leaves your queue and goes for approval.`
        : `Endorse ${label} for approval? It leaves your queue and a supervisor rules on it next.`,
      confirmText: verifying ? "Verify" : "Endorse",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!confirmed) return;

    if (verifying) {
      recordVerdict(claim.reference, "approval");
      advance("Verified for approval", `${label} — approval rules next.`);
    } else {
      decideClaim(claim.reference, "approval");
      advance("Endorsed for approval", `${label} — a supervisor rules next.`);
    }
  };

  // The History card, once for the rail and once for the phone's sheet — only
  // what a tapped row does differs, since the sheet has to close first.
  const historyCard = (onOpen: (key: WorkListKey) => void) => (
    <WorkLists
      rows={WORK_LISTS}
      counts={workListCounts}
      range={range}
      steps={steps}
      onRangeChange={setRange}
      onKindChange={(kind) => setRange(rangeFor(kind, historyDates))}
      onOpen={onOpen}
    />
  );

  return (
    <Page.Root
      subtitle="Claims"
      title="Death Claim"
      headerButton="menu"
      /*
       * THE SHELL'S 96px RESERVE, HANDED BACK — and it is the evidence column's
       * pinning that needs it, not a matter of taste.
       *
       * `Page.Root` pads every page for the mobile bottom navigation unless it
       * is given a value, and that padding lands OUTSIDE the grid row. A sticky
       * element stays pinned only while its containing block — the row — is
       * still passing the viewport, so those 96 pixels are 96 pixels of
       * scrolling with nothing left to pin against: the evidence would drift up
       * and out of view over the last stretch of every long claim.
       *
       * Zero, not a smaller number, because the reserve has MOVED rather than
       * gone — the claim column carries it now, inside the row. Same finding,
       * and the same fix, as the v2 dashboard's rail.
       */
      paddingBottom={0}
    >
      <Page.MainContent>
        <Page.Row>
          {/* TWO COLUMNS, bounded. The record stands on the left and the claim
              being judged against it takes the wide column — see
              `EvidencePanel` for why they are two cards and not one.

              1600, RAISED FROM 1200 AND THEN FROM 1440. The cap is there because
              the wide column is a thing to READ, and past a point the review
              grid's lines get long enough that the eye loses the start of the
              next one — but 1200 was far stricter than that point and 1440 was
              still short of it.

              WHAT THE NUMBER HAS TO CLEAR IS THE COLLAPSED SIDEBAR, which is the
              case the earlier figures kept missing. The shell spends about 420px
              of the window before the content starts — a 300px sidebar, 16px of
              shell padding and 44px of gutter a side — but the sidebar COLLAPSES
              to an icon rail, and that hands roughly 240px back. On a 1900px
              window that is about 1480px of content with the sidebar out and
              about 1790 with it in, and 1440 was leaving 175 a side unused in the
              second case while binding by 38px in the first.

              A viewport breakpoint cannot see that difference, which is why this
              is one number rather than a responsive object: the cap only ever
              binds where there is room to bind, so 1600 fills the expanded case
              completely and leaves a modest margin in the collapsed one, which is
              the reading bound doing its job rather than the layout failing.

              It only ever binds where there is room to bind: below this the
              available width is the smaller number and the page fills it,
              exactly as it did before, so nothing under 1440 of content changes.

              WHAT THE EXTRA WIDTH REACHES is almost all grid — the review grid,
              the payee rows, the folder — which gains a column rather than a
              longer line. The one thing here that is genuinely prose is the
              remarks box, and it is worth watching: if the cap is ever raised
              again, that is the section that will want a measure of its own
              before the rest of the column does. */}
          {/* LEFT-ALIGNED, NOT CENTRED. The cap bounds the WIDTH; it should not
              also move the content. Centred, the grid sat inset from the page
              title above it by half the leftover — 59px on a wide window, and a
              different number on every other — so the heading and the first card
              under it started at two different places and the page read as two
              columns that had not been lined up.

              Left-aligned, the grid's leading edge is the row's own gutter, which
              is exactly where `Page.Root` puts the title. The leftover falls on
              the right, where there is nothing to line up against. */}
          <Box maxW="1600px" ref={topRef}>
            {/* NO STANDING LINE ABOVE THE COLUMNS. There was one — "Next in
                queue · special claims are worked first · 36 left" — and it said
                three things the page already says better. The claim card states
                Special or Regular on a badge; the queue's order is the queue's
                own business and is visible in it; and the count is a number a
                processor cannot act on from here. What it mostly did was put a
                line of chrome between the page title and the work. */}
            <Box
              display="grid"
              // SERVICE'S COLUMNS (user, 2026-10-05: "used the length of the
              // service payable") — one track for both conveyors; see
              // `conveyor-columns`. It was a fixed 320px rail and a 20px gap.
              gridTemplateColumns={{
                base: "1fr",
                lg: railCollapsed ? CONVEYOR_TRACK_COLLAPSED : CONVEYOR_TRACK,
              }}
              css={RAIL_TRACK_TRANSITION}
              gap={{ base: 4, lg: CONVEYOR_GAP }}
              // THE LINE THE PINNING HANGS ON. Grid items stretch to the row by
              // default, which would make the evidence as tall as the claim
              // stack — and a sticky box the height of its scroll container
              // never travels, so it would never stick at all.
              alignItems="start"
            >
              {/* THE RECORD, PINNED. Written FIRST so that stacked — every
                  phone, and every window under `lg` — it is what you meet
                  before the claim: who this is and whether the folder backs the
                  filing up is the frame for everything below it.

                  Sticky from `lg`, where it becomes a column beside the claim
                  rather than a section above it. The claim stack runs to two
                  thousand pixels on a full record, and the evidence is what
                  every one of those sections is checked against — scrolled
                  away it is a panel you have to leave the claim to consult. */}
              <Box
                alignSelf="start"
                position={{ lg: "sticky" }}
                top={{ lg: "16px" }}
                display="flex"
                flexDirection="column"
                gap={3}
              >
                {/* THE WAY OFF THE CONVEYOR, above everything about the claim
                    being served — navigation sits over content, and a processor
                    who has decided to leave this claim should not have to read
                    past it to get out.

                    THE FIELD ALONE, with no card around it and nothing beside
                    it. It briefly carried a queue count and a "Browse" button in
                    a card of their own, and the search itself made both
                    redundant: the magnifier opens the kit's full table — every
                    plan holder, sorted, filtered, paged — which is what Browse
                    was going to be. A second control opening a worse version of
                    the same thing is a second thing to explain.

                    And with the button gone the card went with it. A field
                    standing on its own is a control, not a block, and an edge
                    drawn around one control makes furniture out of it.

                    WHICH QUEUE, OVER THE FIELD THAT SEARCHES IT — and with one
                    stage that row is a heading rather than a switch. See
                    `StageCard`; the stages a user owns is what decides it. */}
                {/* FOLDED, THE RAIL IS AN ICON STRIP (user, 2026-10-05) — each
                    block one icon, opening beside it; see `RailStrip`. The
                    actions open as the phone's list, every one shown, with no
                    "More" behind them. Desktop only: below `lg` the stage card
                    and the quick access below stay exactly as they are. */}
                {/* THE SPINE — the line in the gap between this column and the
                    record, a screen tall, the fold's button at its middle.
                    Inside the sticky rail so it pins with it. */}
                <RailSpine
                  collapsed={railCollapsed}
                  onToggle={() => setRailCollapsed(!railCollapsed)}
                />
                {railCollapsed && (
                  <Box hideBelow="lg">
                    <RailStrip>
                      {/* THE QUEUE AS ICONS, and the search goes straight to
                          the list (user, 2026-10-05) — no flyout between. */}
                      <RailStagePair
                        stages={STAGES.map((s) => ({
                          ...s,
                          icon:
                            s.key === "process" ? LuClipboardList : LuShieldCheck,
                        }))}
                        active={stage}
                        onChange={changeStage}
                      />
                      <RailHint label="Search the queue">
                        <RailStripButton
                          icon={LuSearch}
                          label="Search the queue"
                          onClick={() => setBrowseOpen(true)}
                        />
                      </RailHint>
                      <RailStripDivider />
                      <RailFlyout
                        icon={LuLayoutGrid}
                        label="Actions"
                        badge={
                          editCount > 0 ? (
                            <CountBubble count={editCount} />
                          ) : undefined
                        }
                      >
                        {(close) => (
                          <ClaimActionList
                            claim={claim}
                            onEdit={() => {
                              close();
                              openEdit();
                            }}
                            editCount={editCount}
                          />
                        )}
                      </RailFlyout>
                      <RailFlyout
                        icon={LuHistory}
                        label="History"
                        badge={<RailCount count={workListCounts.all} />}
                      >
                        {(close) =>
                          historyCard((key) => {
                            close();
                            setWorkList(key);
                          })
                        }
                      </RailFlyout>
                    </RailStrip>
                  </Box>
                )}

                <Box hideFrom={railCollapsed ? "lg" : undefined}>
                  <StageCard
                    stages={STAGES}
                    active={stage}
                    onStageChange={changeStage}
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={() => setBrowseOpen(true)}
                  />
                </Box>

                {/* NO PLAN HOLDER CARD IN THE RAIL ANY MORE. It named whose plan
                    this is, and that name is now the title of the plan holder's
                    card in the claim column, so the claim
                    is read in one column without a look to the left.

                    THE ACTIONS UNDER THE STAGE CARD. See `ClaimActions`.

                    Bare, with no card around it: nine labelled buttons say what
                    they are, and a border would only frame what is already a
                    block of controls. */}
                {!railCollapsed && (
                  <>
                    <Box hideBelow="lg" css={RAIL_FADE_IN}>
                      <ClaimActions
                        claim={claim}
                        onEdit={openEdit}
                        editCount={editCount}
                      />
                    </Box>

                    {/* THE LISTS THAT ARE NOT THE QUEUE, last in the rail. They
                        are consulted rather than worked from, so they sit under
                        the actions rather than over them — see `WorkLists`. */}
                    <Box hideBelow="lg" css={RAIL_FADE_IN}>
                      {historyCard((key) => setWorkList(key))}
                    </Box>
                  </>
                )}

                {/* THE SAME TWO ON A PHONE, behind a strip of two buttons so
                    the claim starts on the first screen — see
                    `MobileQuickAccess`. Hidden from `lg`, where the pair above
                    is the rail. */}
                <MobileQuickAccess
                  // The same stage switch and search the stage card above
                  // runs, for the bar that pins once this is scrolled past.
                  stages={STAGES}
                  stage={stage}
                  onStageChange={changeStage}
                  onSearch={() => setBrowseOpen(true)}
                  primary={{
                    icon: LuLayoutGrid,
                    label: "Actions",
                    title: "Actions",
                    ariaLabel:
                      editCount > 0
                        ? `Actions, ${editCount} planholder change${editCount === 1 ? "" : "s"}`
                        : "Actions",
                    badge:
                      editCount > 0 ? <CountBubble count={editCount} /> : undefined,
                    render: (close) => (
                      <ClaimActions
                        claim={claim}
                        onEdit={() => {
                          close();
                          openEdit();
                        }}
                        editCount={editCount}
                      />
                    ),
                  }}
                  historyCount={workListCounts.all}
                  renderHistory={(close) =>
                    historyCard((key) => {
                      close();
                      setWorkList(key);
                    })
                  }
                />
              </Box>

              {/* THE CLAIM, and everything filed against it. The same stack the
                  v2 dashboard puts in its work column, less the plan holder's
                  own two cards: the profile header and the plan details are the
                  RECORD, and the record is the column beside this one.

                  It carries the shell's bottom reserve — see `paddingBottom` on
                  `Page.Root`. Inside the row, where it keeps the evidence
                  pinned for the whole scroll instead of costing it its anchor. */}
              <Flex
                direction="column"
                gap={4}
                minW={0}
                // The quick bar's room on a phone — see `QUICK_BAR_ROOM` — and
                // the shell's navigation's ONLY WHILE IT IS UP (user,
                // 2026-10-02: "too much white space in the bottom"). The nav
                // hides on a downward scroll, which is how this page is read to
                // its end, so a fixed 62px for it sat empty under Endorse.
                // Service's foot does the same — see `AccountStepperBar`.
                pb={{
                  base: navHidden
                    ? QUICK_BAR_ROOM
                    : `calc(${SHELL_NAV_HEIGHT} + ${QUICK_BAR_ROOM})`,
                  lg: "40px",
                }}
                transition={`padding-bottom ${navHidden ? SHELL_NAV_HIDE_EASE : SHELL_NAV_SHOW_EASE}`}
              >
                {swapping ? (
                  /* THE WHOLE COLUMN, not a spinner over it — see
                     `ClaimSwapSkeleton`. Returned early rather than wrapped
                     around each section, because every one of them belongs to
                     the claim being replaced and none should linger. */
                  <ClaimSwapSkeleton />
                ) : (
                  <>
                {/* THE WAY BACK, and the reason the answers are missing.
                    A held claim is on screen because somebody named it, not
                    because the queue offered it — so the bar says which list it
                    came out of and gives the conveyor back in one press.
                    IT IS NOT A WARNING. Nothing has gone wrong: this is a claim
                    being read rather than worked, which is what the reference
                    lists are for. Hence a hairline and grey rather than the
                    amber the return button hovers to. */}
                {held && (
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={3}
                    wrap="wrap"
                    px={3}
                    py={2}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="lg"
                    bg={BRAND_COLORS.subtleBg}
                  >
                    <Text fontSize="xs" color="gray.600">
                      Opened from{" "}
                      <Text as="span" fontWeight="600" color="gray.800">
                        {held.from}
                      </Text>{" "}
                      — not in a queue you are working, so it can be read but not
                      answered.
                    </Text>

                    <Box
                      as="button"
                      onClick={() => swap(() => setHeld(null))}
                      fontSize="13px"
                      fontWeight="600"
                      color={BRAND_COLORS.darkGreen}
                      px={2}
                      py={1}
                      borderRadius="md"
                      cursor="pointer"
                      flexShrink={0}
                      transition="background 0.15s ease"
                      _hover={{ bg: "#f4faf6" }}
                      _focusVisible={{
                        outline: "2px solid",
                        outlineColor: BRAND_COLORS.primaryGreen,
                        outlineOffset: "2px",
                      }}
                    >
                      Back to queue
                    </Box>
                  </Flex>
                )}

                <ConveyorCard claim={claim} />

                {/* THE PLAN HOLDER'S OWN CARD, the one v1 and v2 show — not a
                    version of it. It already carries the two facts that decide
                    whether a claim can be paid at all, Contestability and
                    Account Status, which is why the claim card above no longer
                    does.

                    `KitCardShape` because it is the KIT's card: 5px corners and
                    no hairline, where every other card in this column turns at
                    12 over one. */}
                {shownPlanholder && (
                  <KitCardShape>
                    <PlanholderInfoCard
                      // As this claim reads it — the corrections laid over the
                      // record. See `shownPlanholder`.
                      planholder={shownPlanholder}
                      labelMarks={labelMarks}
                      headerEdits={<EditedFieldsButton items={editedItems} />}
                      // The death is filed on the CLAIM, not on the plan
                      // holder — see `DeceasedFacts`. Handed over so the
                      // summary reads born / aged / died / aged at death in
                      // one run, instead of the claim card repeating two
                      // facts about the same person.
                      deceased={{
                        dateOfDeath: claim.dateOfDeath,
                        // Worked out again from a corrected birth date; the
                        // claim's own figure was taken from the record's.
                        ageAtDeath: dobCorrection
                          ? (ageAtDeathOf(dobCorrection.to, claim.dateOfDeath) ??
                            claim.ageOfDeath)
                          : claim.ageOfDeath,
                      }}
                      // WHETHER THE FOLDER IS SHORT ANYTHING (user,
                      // 2026-09-14), as a Yes / No at the end of the summary —
                      // service payables' Deficient tick, in this grid's own
                      // voice. See the prop, and `deficient` above for why it
                      // is not read off `claim.isDeficient`.
                      deficient={deficient}
                      asDetails
                      // WHO, as the heading of the card that says what about
                      // them — the same header Service Payables' planholder
                      // card carries (user, 2026-10-02). It reads the name off
                      // `shownPlanholder`, so a corrected name shows corrected.
                      identity
                    />
                  </KitCardShape>
                )}

                {/* The PLAN's remarks, not the claim's — its account history,
                    which is why it reads the same whichever claim is served.
                    Read before the payee (user, 2026-10-07). */}
                <SectionCard>
                  <PlanholderRemarks
                    remarks={getPlanholderRemarks(claim.lpaNo)}
                    showNotes={false}
                    showSubtitles={false}
                  />
                </SectionCard>

                {/* WHO IS PAID — the decision the rest are evidence for. */}
                <SectionCard>
                  <ClaimPayees claim={claim} />
                </SectionCard>

                {/* THE TWO LOOK-UPS. Neither is what a claim is decided on —
                    they are consulted, occasionally — and inline they would
                    cost more column than every section that IS.

                    THE ROW AND THE PAYMENTS CARD ARE SHARED with the service
                    record, which carries the same pair in the same place (user,
                    2026-09-17) — see `lookup-row`. Beneficiaries stays here:
                    that half differs by screen, and the service record's
                    neighbour is Loan Details. */}
                <LookupRow>
                  {/* Card and dialog in one — see `PaymentsLookup`. This screen
                      used to hold the open state and mount the pop-up itself;
                      both now travel with the card, which is what makes it the
                      same lookup on the service record. */}
                  <PaymentsLookup lpaNo={claim.lpaNo} />
                  <SectionLauncher
                    Icon={LuUsers}
                    title="Beneficiaries"
                    subtitle="Declared on this plan"
                    count={beneficiaryCount}
                    onClick={() => setPopup("beneficiaries")}
                  />
                </LookupRow>

                {/* THE CLAIM'S NOTES, above the folder they belong beside —
                    the only two things in this column that are written to. */}
                <SectionCard>
                  <PlanholderRemarks
                    showRemarks={false}
                    showSubtitles={false}
                    asDialog
                    noteSubtitle={label}
                    notes={getClaimNotes(claim.reference).join("\n\n")}
                    onAddNote={(text) => {
                      addClaimNote(claim.reference, text);
                      toast.success("Note added", { description: label });
                    }}
                  />
                </SectionCard>

                {/* THE FOLDER. Capped and scrolling inside that cap: the
                    section reads the VIEWPORT to decide whether it is in a
                    rail, and from `xl` it believes it is — it then lists every
                    document rather than five and a "View all", expecting a
                    bound a rail would have given it. */}
                <SectionCard>
                  <Box
                    display={{ xl: "flex" }}
                    flexDirection="column"
                    maxH={{ xl: "420px" }}
                    minH={{ xl: 0 }}
                  >
                    <PlanholderDocuments
                      key={claim.reference}
                      personId={planholder?.personId}
                      withDeficiencies
                      asDialog
                    />
                  </Box>
                </SectionCard>

                {/* THE ANSWER, LAST — after everything it is an answer to.
                    Return sits on the far left and quiet: it is the one that
                    sends work back to a branch, so it should be easy to reach
                    and hard to hit.

                    ONLY FOR A CLAIM THE QUEUE HANDED OVER. A held claim is one
                    no queue is waiting on — it has been approved, denied, or
                    sent back to a branch — and offering Endorse or Deny on it
                    would let a finished claim be answered a second time, with
                    `decideClaim` writing a contradictory line into a trail that
                    already has one. The row gives way to what the record says
                    instead, which is the same discipline the v2 dashboard's
                    decision bar follows once a claim has been decided. */}
                {held ? (
                  <Flex align="center" gap={2} pt={1} px={1}>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {claim.phase}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      — not waiting on this desk, so there is nothing to answer
                      here.
                    </Text>
                  </Flex>
                ) : (
                <>
                {/* ON A PHONE, TWO ROWS AND THE PRIMARY LAST — option A of the
                    mock-up (user, 2026-10-02). The desktop row's three buttons
                    are 28–32px tall and the two that matter sit in the corner;
                    here every target is 44px or more and at least half the
                    screen wide, and Endorse is the full-width one nearest the
                    thumb and the quick bar under it.

                    "FOR COMPLIANCE" ON A PHONE (user, 2026-10-02), so the two
                    halves can be EQUAL: "Return for compliance" needed a 3:2
                    split to fit. The sheet it opens still reads "Return for
                    compliance", so the full name is one tap away.

                    Outline for both, as on the desktop: Return stays the quiet
                    exit by being a secondary, not by being small. */}
                <Box hideFrom="lg" pt={1}>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap="10px">
                    <SecondarySmButton
                      onClick={openReturn}
                      h="44px"
                      minH="44px"
                      fontSize="13px"
                    >
                      For Compliance
                    </SecondarySmButton>
                    <SecondarySmButton
                      onClick={openDeny}
                      h="44px"
                      minH="44px"
                      fontSize="13px"
                    >
                      Deny
                    </SecondarySmButton>
                  </Box>
                  <PrimarySmButton
                    onClick={endorse}
                    w="full"
                    h="48px"
                    minH="48px"
                    mt="10px"
                    fontSize="14px"
                  >
                    {verifying ? "Verify" : "Endorse"}
                  </PrimarySmButton>
                </Box>

                <Flex align="center" gap={3} wrap="wrap" pt={1} hideBelow="lg">
                  {/* THE QUIET EXIT. ONE NAME, AND THE DESTINATION IS DATA.
                      "Return for compliance" at both stages, because it is the
                      same act to the person doing it: this cannot be settled as
                      it stands, send it back. Where back IS differs — a
                      processor's goes to the BRANCH for a document, a
                      supervisor's to the PROCESSOR who worked it — and that is
                      recorded on the return rather than spelled into the button.
                      See `returnedTo` on `ClaimRework`: a return with a name on
                      it is work assigned to someone who already knows the file;
                      one without is a claim waiting for whoever notices.

                      Both ask for a reason first, for the same reason: a return
                      that does not say what it wants is a round trip that
                      changes nothing. */}
                  <Box
                    as="button"
                    onClick={openReturn}
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.600"
                    px={3}
                    py={2}
                    borderRadius="md"
                    cursor="pointer"
                    transition="all 0.15s ease"
                    _hover={{ bg: "#FBF0DE", color: BRAND_COLORS.warningText }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: BRAND_COLORS.primaryGreen,
                      outlineOffset: "2px",
                    }}
                  >
                    Return for compliance
                  </Box>

                  <Box flex="1" />

                  {/* DENY ASKS FIRST. It opens the reason dialog rather than
                      deciding, because a denial is the one verdict somebody has
                      to justify later — see `DenyDialog`. Approve stays one
                      press: it explains itself. */}
                  <SecondarySmButton onClick={openDeny}>
                    Deny
                  </SecondarySmButton>
                  {/* "ENDORSE", NOT "APPROVE", and the word is the accurate one
                      rather than a softer one. A processor cannot approve a
                      claim — see `ClaimOutcome`, which is explicit that Approved
                      and Denied are the SUPERVISOR'S verdicts and that what a
                      processor decides is which of the two a claim is sent for.
                      A button reading "Approve" claimed an authority this user
                      does not have, and the two screens that list Approved
                      claims would never have contained anything they pressed.

                      The outcome underneath is unchanged: `decideClaim` still
                      records "approval", because that is what the claim is being
                      endorsed FOR.

                      IT ASKS ONCE. Deny and Return collect a reason and confirm
                      in the same dialog; this one has nothing to collect, so it
                      is the area's plain confirmation rather than a form. It
                      asks at all because the conveyor makes it irreversible in
                      practice: the answer sends the claim on and the next one
                      takes the screen, with no way back to the one just left. */}
                  <PrimarySmButton onClick={endorse}>
                    {/* THE WORD IS THE STEP, and neither of these is Approval.
                        The pipeline runs Review → Verification → Approval: a
                        processor ENDORSES a recommendation, a supervisor
                        VERIFIES it, and approval is a third desk after both.
                        Naming either button "Approve" would claim an authority
                        the person pressing it does not have. */}
                    {verifying ? "Verify" : "Endorse"}
                  </PrimarySmButton>
                </Flex>
                </>
                )}
                  </>
                )}
              </Flex>

              {/* THE PLANHOLDER'S CORRECTION — the form, and the list of what
                  it changed. Mounted always, `open` driving them. */}
              <PlanholderEditDialog
                  open={editOpen && !!onFile}
                  onClose={() => setEditOpen(false)}
                  subtitle={`LPA No. ${claim.lpaNo}`}
                  values={shown ?? NO_PLANHOLDER_VALUES}
                  onSave={(values) => {
                    if (!onFile) return;
                    const changed = correctPlanholder(
                      claim.reference,
                      onFile,
                      values,
                      // A verifier's save overrides — see `CorrectionStage`.
                      verifying ? "verification" : "process",
                    );
                    setEditOpen(false);
                    if (changed.length === 0) {
                      toast.info("Nothing to save", {
                        description: "No planholder details were changed.",
                      });
                      return;
                    }
                    // THE NOTIFICATION IN THE CORNER names every field and the
                    // value it now reads (user, 2026-09-29).
                    toast.success("Planholder updated", {
                      description: changed
                        .map(
                          (field) =>
                            `${CORRECTABLE_PLANHOLDER_FIELDS[field]}: ${planholderValueLabel(field, values[field])}`,
                        )
                        .join(" · "),
                    });
                  }}
                />
              <PlanholderChangesDialog
                open={changesOpen && corrections.length > 0}
                onClose={() => setChangesOpen(false)}
                subtitle={`LPA No. ${claim.lpaNo}`}
                corrections={corrections}
                reader={reader}
                onEdit={() => {
                  setChangesOpen(false);
                  setEditOpen(true);
                }}
                onRevertAll={() => revert(corrections.map((c) => c.field))}
              />

              {/* THE TWO NEGATIVE ANSWERS, both through one dialog — see
                  `ReasonDialog`. Mounted always, `open` driving them, like every
                  other dialog on this page. */}
              <ReasonDialog
                open={denyOpen}
                onClose={() => setDenyOpen(false)}
                title={verifying ? "Deny claim" : "Endorse for denial"}
                subtitle={label}
                reasons={DENIAL_REASONS}
                confirmText={verifying ? "Deny claim" : "Endorse for denial"}
                destructive
                onConfirm={(reason) => {
                  setDenyOpen(false);
                  // THE SAME GROUNDS, TWO DIFFERENT ACTS. A processor recommends
                  // a denial on them; a supervisor denies. The list is shared
                  // because the reasons a claim fails do not change with who is
                  // reading it — only the authority to act on them does.
                  if (verifying) {
                    recordVerdict(claim.reference, "denial", reason);
                    advance("Claim denied", `${label} — ${reason}`);
                  } else {
                    decideClaim(claim.reference, "denial", reason);
                    advance("Endorsed for denial", `${label} — ${reason}`);
                  }
                }}
              />

              {/* THE SUPERVISOR'S RETURN. Same name on the button as the
                  processor's, different destination and different grounds — the
                  reasons here are about the PROCESSING, which is what is being
                  sent back. Not destructive: the claim is not being ended, it is
                  being worked again, and red would spend the warning on the
                  wrong button. */}
              <ReasonDialog
                open={reworkOpen}
                onClose={() => setReworkOpen(false)}
                title="Return for compliance"
                subtitle={label}
                reasons={REWORK_REASONS}
                confirmText="Return claim"
                onConfirm={(reason) => {
                  returnToProcessor(claim.reference, reason, returnsTo);
                  setReworkOpen(false);
                  advance(
                    "Returned for compliance",
                    `${label} — back to ${returnsTo}`,
                  );
                }}
              />

              <ReasonDialog
                open={complianceOpen}
                onClose={() => setComplianceOpen(false)}
                title="Return for compliance"
                subtitle={label}
                reasons={COMPLIANCE_REASONS}
                confirmText="Return claim"
                onConfirm={(reason) => {
                  // BOTH THE REASON AND THE LIST. The reason is what the branch
                  // is being asked; `missing` is what the folder was short of on
                  // the day, which the store records rather than re-deriving
                  // later — see `returnClaimForCompliance`.
                  returnClaimForCompliance(
                    claim.reference,
                    evidence.missing,
                    reason,
                  );
                  setComplianceOpen(false);
                  advance("Returned for compliance", `${label} — ${reason}`);
                }}
              />

              {/* THE QUEUE, opened from the rail's search. Picking a row moves
                  `served` to it — the one override on a screen that otherwise
                  only ever advances. */}
              <ClaimListPopup
                title={verifying ? "Verify queue" : "For Process queue"}
                open={browseOpen}
                onClose={() => setBrowseOpen(false)}
                claims={queue}
                query={query}
                // THE SAME ONE WAY IN the reference lists use. This browser is
                // handed `queue`, so the first of its three cases always wins
                // and the conveyor simply moves — but routing it through the
                // shared path means a miss cannot put `served` at -1 and render
                // an empty queue, which is what the old guard here was for.
                onOpenClaim={(picked) => openFromList(picked, "the queue")}
              />

              {/* THE REFERENCE LISTS, one dialog driven by which row was tapped
                  rather than three mounted side by side. `open` is still what
                  drives it — never `{workList && <ClaimListPopup/>}` — for the
                  reason written on `SectionPopup`.

                  A PICK HERE STAYS ON THIS SCREEN. It used to leave for the
                  plan holder's page, on the reasoning that half these claims are
                  not in a queue and so have no position to jump to — which is
                  true, and is not a reason to change pages. A processor who
                  opens a claim out of the Denied list wants to read the claim,
                  and everything that answers them is here: the record beside it,
                  the folder, the payees, the trail. Sending them to the profile
                  answered a narrower question than they asked and cost them the
                  screen they were working on.
                  So the pick lands on the conveyor either way — moved to, if the
                  claim is in a queue; held in front of it, if it is not. See
                  {@link openFromList}. */}
              <ClaimListPopup
                title={
                  WORK_LISTS.find((list) => list.key === workList)?.title ??
                  "Claims"
                }
                open={workList !== null}
                onClose={() => setWorkList(null)}
                claims={workList ? workLists[workList] : []}
                // NO YEAR CONTROL IN HERE ANY MORE. The history lists are cut by
                // the card's range, which is changed on the card beside the
                // counts — a second period control in the list would be a second
                // answer to the same question.
                onOpenClaim={(picked) =>
                  openFromList(
                    picked,
                    WORK_LISTS.find((list) => list.key === workList)?.title ??
                      "a list",
                  )
                }
              />

              {/* THE BENEFICIARIES POP-UP, always mounted with `open` driving
                  it — never `{popup === "beneficiaries" && <SectionPopup/>}`. A
                  dialog mounted at the moment it opens has left this app with
                  the page behind it unclickable.

                  PAYMENTS NO LONGER HAS ONE HERE: its dialog travels with its
                  card, so that the service record gets the same one. See
                  `PaymentsLookup`. */}
              <BottomOnPhonePopup
                title="Beneficiaries"
                open={popup === "beneficiaries"}
                onClose={() => setPopup(null)}
              >
                <PlanholderBeneficiaries lpaNo={claim.lpaNo} />
              </BottomOnPhonePopup>
            </Box>
          </Box>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
