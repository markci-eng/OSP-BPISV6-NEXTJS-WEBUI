"use client";

// `/claims/service-payables` — the Conveyor, and the whole of Service Payables.
//
// THE PAGE SERVES THE BILLING; the processor does not go and find one. It takes
// the head of the queue — the chapel that has been waiting longest at this stage
// — opens the first account on it, and brings the next the moment this one is
// answered. When the last account on a billing is done the billing leaves, and
// the one behind it slides into the slot.
//
// WHAT THIS REPLACED was five pages and three choices. A dashboard, then a
// workspace per queue; on For Process you picked a TERRITORY, then a billing off
// an accordion, then an account out of its table, and only then did any work
// begin. The three choices are gone (user, 2026-09-11): the queue decides which
// billing, the billing decides which account, and the processor decides what
// happens to it. The old screens are kept, unrouted, in
// `../_archive/service-payables-queues` — see the README there.
//
// TWO CONVEYORS, NESTED:
//
//   BILLING   the head of `billingQueue(stage)`, first in first out on the date
//             it entered THIS stage. See `conveyor/billing-queue`.
//   ACCOUNT   already open when the billing is served — the first one not yet
//             done. Terminating brings the next; the rail lets any be taken out
//             of turn, because a processor with the chapel's paperwork in front
//             of them sometimes works it in the order the folder is in.
//
// BILLING CREATION IS AUTOMATED. There is no Create Billing button, dialog or
// step: the number is minted when the billing comes up. See
// `conveyor/use-auto-billing` for what the form used to ask and where each
// answer comes from now.
//
// CONTROLS LEFT, CONTENT RIGHT (user, 2026-09-11). The module's older rule put
// the list being worked through on the RIGHT, and that rule was about a PICKER:
// a rail you chose from stood beside the thing you had chosen. This rail is not
// a picker any more — it is the queue's control surface, and controls are read
// before the content they act on. So the two columns swapped.
//
// THE BILLING IS NAMED ONCE, AT THE TOP OF THE RAIL'S ACCOUNTS CARD. It had a
// display heading over the record column for a day — `conveyor/billing-head`,
// now deleted — and the heading lost to the rail on one argument: IT SCROLLED
// AWAY. A full account runs some two thousand pixels, so a processor half-way
// down the folder had nothing on screen naming the billing they were posting
// into, while the rail is pinned and always has. Carrying both was the
// intermediate state and it said the same thing twice.
//
// So the record column starts with the PLAN HOLDER, which is what the form
// under it is checked against, and the rail's card carries the identity: the
// billing NO over its CODE on the left, the MONEY over the territory code and
// the period on the right, and the processor's name beside the progress.

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { Page, SecondarySmButton, useMessageDialog } from "osp-ui-kit";
import { LuInbox, LuPlus, LuUndo2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../data";
import { scrollParentOf } from "../components/scroll-parent";
import { CARD_SHAPE, SectionCard } from "../components/section-card";
import { ClaimsToaster } from "../components/toaster";
import { PlanholderRemarks } from "../planholder/components/PlanholderRemarks";
import { useClaimSwap } from "../death-claim/conveyor/use-claim-swap";
import { AddManualServiceDialog } from "./components/AddManualServiceDialog";
import { EmptyPanel } from "./components/EmptyPanel";
import { FranchiseIntakeDialog } from "./components/FranchiseIntakeDialog";
import { PlanholderPanel } from "./components/PlanholderPanel";
import {
  LIST_MAX_HEIGHT_COMPACT,
  PlanholderServiceList,
} from "./components/PlanholderServiceList";
import { RecordActions } from "./components/RecordActions";
import { RecordLookups } from "./components/RecordLookups";
import { type DocumentTab } from "../components/document-folder";
import { ServiceRecordDocuments } from "./components/ServiceRecordDocuments";
import { ServiceRecordForm } from "./components/ServiceRecordForm";
import { ServiceRecordNotes } from "./components/ServiceRecordNotes";
import { SoaDrawer } from "./components/SoaDrawer";
import {
  billingQueue,
  firstUndoneAccount,
  isAccountDone,
  stageProgress,
  worksAccountByAccount,
  STAGE_DONE_WORD,
} from "./conveyor/billing-queue";
import {
  BillingListPopup,
  type BillingScope,
} from "./conveyor/billing-list-popup";
import { StageSwitch } from "./conveyor/stage-switch";
import {
  AccountsCardSkeleton,
  RecordColumnSkeleton,
} from "./conveyor/swap-skeleton";
import { useDesktopShell } from "./conveyor/use-desktop-shell";
import { useRecordSwap } from "./conveyor/use-record-swap";
import { useAutoBilling } from "./conveyor/use-auto-billing";
import {
  BILLING_QUEUE_LABELS,
  BILLING_STAGES,
  CONVEYOR_STAGES,
  deceasedName,
  defaultMortCodeFor,
  getBilling,
  getBillingMortCode,
  getMortuary,
  formatCSP,
  isServiceTerminated,
  servicesOf,
  type BillingStage,
  type ServiceBilling,
  type ServiceRecord,
} from "./service-payables-data";
import {
  getSavedServiceRecord,
  hasCreatedBilling,
  getVerifiedAccount,
  useServicePayablesStore,
  type ServiceRecordDetails,
} from "./service-payables-store";
import {
  canAddManualService,
  useAddManualService,
} from "./use-add-manual-service";
import {
  canCloseFranchiseEntry,
  isFranchiseEntryOpen,
  useCloseFranchiseEntry,
  useCreateFranchiseBilling,
} from "./use-franchise-billing";
import {
  canTerminateInto,
  terminationBlocker,
  useSaveServiceRecord,
} from "./use-save-service-record";
import {
  canEndorseBilling,
  canVerifyBilling,
  useEndorseBilling,
  useVerifyBilling,
  verifiableAccounts,
} from "./use-verify-accounts";
import {
  CONVEYOR_GIVES,
  CONVEYOR_GRID,
  CONVEYOR_MAIN_TAIL,
  CONVEYOR_RAIL_MAX,
  STACKED_ITEM,
  WORKSPACE_ROOT,
  conveyorListBox,
  conveyorRail,
  scrollDetailIntoView,
} from "./workspace-layout";

/**
 * What this screen can DO to a record at each stage — `RecordActions`' own
 * vocabulary, which is why the map reads one word per queue.
 *
 * The offset is the one `BILLING_QUEUE_LABELS` explains: a billing that IS
 * `processed` is sitting in the For VERIFICATION queue, so its accounts are
 * verified.
 */
const STAGE_ACTION: Record<
  BillingStage,
  "terminate" | "verify" | "approve" | "endorse"
> = {
  "for-process": "terminate",
  processed: "verify",
  verified: "approve",
  approved: "endorse",
};

/**
 * The rail as a page — bounded so its foot, which is the commit, is on screen
 * whether or not the page has been scrolled. See {@link CONVEYOR_RAIL_MAX},
 * where the two candidate figures are measured against each other.
 */
const CONVEYOR_RAIL = conveyorRail(CONVEYOR_RAIL_MAX);

/** Fades the arriving billing in behind the placeholder rather than cutting. */
const SWAP_FADE = {
  "@keyframes conveyorSwapIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  animation: "conveyorSwapIn 0.22s ease-out",
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

const EMPTY_POSITIONS: Record<BillingStage, number> = {
  "for-process": 0,
  processed: 0,
  verified: 0,
  approved: 0,
};

export default function ServicePayablesPage() {
  // Every act on this page writes to the store, and the queues are derived from
  // it — so everything is re-read whenever it changes.
  const storeVersion = useServicePayablesStore();
  const { messageBox } = useMessageDialog();
  const saveRecord = useSaveServiceRecord();
  const verifyBilling = useVerifyBilling();
  const endorseBilling = useEndorseBilling();
  const createFranchiseBilling = useCreateFranchiseBilling();
  const closeFranchiseEntry = useCloseFranchiseEntry();
  const addManualService = useAddManualService();

  /**
   * Which queue is being served, and how far into EACH one this session has
   * worked.
   *
   * A POSITION PER STAGE, not one shared index — the death claim's rule, and it
   * is right for the same reason: switching to For Verification and back should
   * find For Process where it was left, and a single index would carry a
   * verifier's position into a processor's queue and skip whatever sat under it.
   *
   * IT MOSTLY DOES NOT MOVE. A billing that is finished LEAVES its queue, so the
   * array shrinks under the index and the next billing arrives in the slot
   * without anything being incremented. What the index is actually for is the
   * two cases where nothing leaves: a reading queue being paged through, and a
   * billing taken out of turn from the pop-up.
   */
  const [stage, setStage] = useState<BillingStage>("for-process");
  const [servedByStage, setServedByStage] =
    useState<Record<BillingStage, number>>(EMPTY_POSITIONS);

  /**
   * Which account is open, PER BILLING — and only for as long as that billing
   * is the one being served.
   *
   * Keyed by billing code rather than held as one id so a stale id can never be
   * looked up against the wrong chapel's accounts.
   *
   * IT USED TO SURVIVE A STAGE CHANGE, AND THAT WAS THE BUG (user, 2026-09-14:
   * "why does it choose the one in the bottom instead of in the top. always
   * start at the top"). A BILLING KEEPS ITS CODE ALL THE WAY THROUGH THE FOUR
   * QUEUES — B26004015 is B26004015 whether it is being processed, verified,
   * approved or endorsed — so the entry a PROCESSOR left behind on the last
   * account they terminated was still here when the same chapel came up for a
   * VERIFIER, who was handed the bottom of the list to start on.
   *
   * The place was worth keeping for its own reason, and it is kept: stepping out
   * to another billing and back inside one visit lands where you were. What is
   * cleared is the crossing — see the swaps, every one of which now empties
   * this. A billing arriving on a different desk is a different reading, and a
   * reading starts at the top.
   */
  const [openByBilling, setOpenByBilling] = useState<Record<string, string>>({});

  /** The verifier's ticks. See the effect below that seeds them. */
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  /**
   * THE PAGE OWNS THE QUERY, and both fields that show it are views of this one
   * string — the rail's, which runs the search by opening the sheet, and the
   * sheet's own, which narrows what is already on it.
   *
   * That is what keeps "one search" true with a field in two places (user,
   * 2026-09-14: "instead of another search bar"): type in the rail and arrive
   * pre-filled, type in the sheet and the rail says the same thing behind it.
   */
  const [query, setQuery] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  /**
   * WHICH LIST THE SHEET OPENS ON.
   *
   * ALWAYS THE QUEUE BEING SERVED, because the only door is the rail's field:
   * it sits under the stage tabs and says "this queue", so the sheet it opens
   * has to be that queue or the gesture lies. Every other list is a pill away
   * once the sheet is up, and the pills write back here — so a reader who left
   * off on Endorsed and reopens from the rail lands on the queue again, which is
   * the door's promise rather than a lost place.
   *
   * Held by the page rather than seeded inside the sheet from `stage`, so it
   * does not depend on an effect firing at the moment the dialog mounts.
   */
  const [scope, setScope] = useState<BillingScope>("for-process");
  /**
   * A billing opened out of a list that NO queue on this page serves — held in
   * front of the conveyor until it is let go.
   *
   * THE CONVEYOR CANNOT HOLD IT, which is why this exists. The billing on screen
   * is normally `queue[served]`, and the sheet's Endorsed tab is full of
   * billings that are in no queue at all: `billingQueue` filters an endorsed
   * billing out so the conveyor does not serve it twice. There is no index to
   * jump to, so it is carried beside the position rather than as one. The death
   * claim's `held` makes the same move for an approved or denied claim.
   *
   * BY CODE, not as the record — a stored row would be a snapshot taken when it
   * was picked, where the code is resolved on every render and draws whatever
   * the billing says now.
   *
   * `from` is the list it came out of, carried because the sheet closes on the
   * pick: without it the bar over the record could not say where the reader has
   * come from, which is the one thing it is there to answer.
   */
  const [held, setHeld] = useState<{ billingCode: string; from: string } | null>(
    null,
  );
  const [soaOpen, setSoaOpen] = useState(false);

  /**
   * THE FRANCHISE PATH'S TWO DOORS — the intake, which raises a billing, and
   * the entry, which puts a plan holder on the one being served.
   *
   * TWO FLAGS AND NOT ONE STEP COUNTER, because they are not steps of a wizard:
   * the intake is opened once at the start of a sitting and the entry is opened
   * once per sheet of paper, twenty times in a row. What connects them is the
   * conveyor, which the intake puts on the billing it just raised — after that
   * the entry is simply the rail's button, exactly as Terminate is.
   */
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  /**
   * WHERE FOR PROCESS WAS BEFORE THE INTAKE JUMPED IT FORWARD — put back when
   * the franchise billing it jumped to is closed.
   *
   * THE QUEUE IS ORDERED BY WAIT, and a billing raised this morning for last
   * week's cut has waited the least of anything in it: it sorts to the BACK.
   * `goToBilling` moves the conveyor there, which is right — the processor has
   * the paperwork in their hand — but the position it moves THROUGH is twenty
   * chapels somebody still has to work. Left there, closing the franchise
   * billing would land on "queue clear — you have worked through all 22", which
   * they have not.
   *
   * SO THE JUMP IS A ROUND TRIP, and this is the return leg. Only for the
   * intake: `openFromList` moves the position and keeps it, because a billing
   * picked by name out of the sheet is a place the reader ASKED to be, where
   * this one is a detour the page took on their behalf.
   *
   * Cleared by anything that makes the return meaningless — changing stage, or
   * picking another billing out of a list.
   */
  const [resumeAt, setResumeAt] = useState<number | null>(null);

  /**
   * WHICH LIST THE FOLDER IS SHOWING, held here rather than inside the section
   * — because the Deficient tick on the form is what switches it (user,
   * 2026-09-14), and the two are in different components.
   *
   * The folder still owns the pills; this is the state they read and write.
   * See `DocumentFolder`, which keeps its own when nobody drives it.
   */
  const [docsTab, setDocsTab] = useState<DocumentTab>("documents");

  /** The folder's card, which is what the tick scrolls to. */
  const documentsRef = useRef<HTMLDivElement>(null);

  /**
   * The record column — where a stacked layout goes when another plan holder is
   * picked. See `openAccount`, which is the only thing that reads it.
   */
  const recordRef = useRef<HTMLDivElement>(null);

  /**
   * EVERY PATH THAT PUTS A DIFFERENT BILLING ON SCREEN GOES THROUGH `swap` —
   * finishing one, changing stage, taking one out of turn. A path that did not
   * would be the one that flickers, and it would be the one nobody notices
   * because the other three look right. The death claim's hook, unchanged: it
   * takes an anchor and a state change and is not claim-shaped at all.
   */
  const topRef = useRef<HTMLDivElement>(null);
  const { swapping, swap } = useClaimSwap(topRef);

  /**
   * The workspace — what the two-column split is measured against, and the
   * container the record's own layout queries are asked of. See the note at the
   * top of `workspace-layout` on why it is this element and not the viewport.
   */
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isDesktop = useDesktopShell();

  /* ------------------------------ the queues ------------------------------ */

  const queues = useMemo(
    () =>
      ({
        "for-process": billingQueue("for-process"),
        processed: billingQueue("processed"),
        verified: billingQueue("verified"),
        approved: billingQueue("approved"),
      }) as Record<BillingStage, ServiceBilling[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  const queue = queues[stage];
  const served = servedByStage[stage];

  /**
   * The billing on screen: whatever is being held, else the conveyor's own.
   *
   * The held one wins because it was asked for by name. It is also the only
   * billing this page shows that it cannot act on — see {@link reading}, the bar
   * over the record, and the commit that stands down for it.
   *
   * Falls back to the queue if the code no longer resolves, which is the guard
   * rather than a case that happens: a billing is not deleted, and the sheet
   * only ever hands over one it has just listed.
   */
  const billing: ServiceBilling | undefined = held
    ? (getBilling(held.billingCode) ?? queue[served])
    : queue[served];

  /**
   * THE BILLING IS BEING READ, NOT WORKED — it came out of a list rather than
   * off the queue, and this page has no act to offer it.
   *
   * WHY IT IS READ-ONLY AT ALL, given that the record beside it is the same
   * record. Because every act on this screen is the STAGE's act, and a held
   * billing is not at the stage the rail is showing: the queue tabs say For
   * Process while the billing on screen was endorsed to accounting in July. A
   * Terminate there would post a plan into a document that has been paid, and a
   * Verify would sign an account somebody already approved.
   *
   * NOTHING THAT READS IS TOUCHED. The record, the plan holder, the folder, the
   * SOA and the loan lookup all work exactly as they do on a served billing —
   * reading is the entire reason the reader came.
   */
  const reading = held !== null;

  /** What is LEFT in each queue — see `StageSwitch`. */
  const counts = useMemo(() => {
    const out = {} as Record<BillingStage, number>;
    for (const key of BILLING_STAGES) {
      out[key] = Math.max(0, queues[key].length - servedByStage[key]);
    }
    return out;
  }, [queues, servedByStage]);

  // MINTS THE NUMBER. Called unconditionally, before any early return, so the
  // hook order never changes between renders.
  //
  // NOT FOR A HELD BILLING. Minting is what the conveyor does to the billing it
  // is about to serve; a billing being read out of a list is not being served,
  // and raising a number against one that left this desk months ago would be
  // this page writing to a document it has just declared it cannot act on. The
  // argument goes `undefined` rather than the call going conditional — the hook
  // already takes an absent billing, because the queue can be empty.
  useAutoBilling(reading ? undefined : billing);

  /* ----------------------------- the account ----------------------------- */

  const services = useMemo(
    () => (billing ? servicesOf(billing) : []),
    [billing],
  );

  const service: ServiceRecord | undefined = useMemo(() => {
    if (!billing) return undefined;
    const held = openByBilling[billing.billingCode];
    return (
      services.find((s) => s.id === held) ?? firstUndoneAccount(billing, stage)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing, services, openByBilling, stage, storeVersion]);

  /**
   * Open another plan holder's record — and GO BACK TO THE TOP OF IT (user,
   * 2026-09-14: "when changing the plan selection it should move back to the
   * top").
   *
   * A DIFFERENT PERSON IS READ FROM THE START. The conveyor's own rule for a new
   * billing, which `useClaimSwap` applies on every swap — "arriving mid-folder
   * is arriving in the wrong place" — and it was never applied to the account,
   * because picking one is not a swap: the state changes, the column repaints,
   * and the scroll position stays wherever the LAST record left it. Two thousand
   * pixels down somebody else's documents, in the case that made this obvious:
   * the Deficient tick takes the reader to the folder, and the next account they
   * picked opened at the folder too — a stranger's, with the name and the form
   * that identify it off the top of the screen.
   *
   * WHERE "THE TOP" IS DEPENDS ON THE LAYOUT, which is the whole of the
   * complication:
   *
   *   TWO COLUMNS  the page's own top. The record column starts level with the
   *                rail, so putting the page at 0 puts the record at its start.
   *   STACKED      the top of the RECORD, not of the page. The rail sits above
   *                it there, so scrolling to 0 would answer a tap on the list by
   *                showing the list — and the record picked would be the thing
   *                below the fold.
   *
   * INSTANT, AND UNDER A PLACEHOLDER (user, 2026-09-14). The jump itself is not
   * animated — it happens where nobody can see it, behind the record column's
   * own skeleton — which is the arrangement `useClaimSwap` argues for the
   * billing and `useRecordSwap` argues again for the account. An animated scroll
   * up through 2,000px would make every pick wait on it, and what it would
   * travel through is the record of the person who has just ARRIVED, read
   * backwards.
   *
   * It is deliberately unlike the Deficient tick's jump, which IS animated:
   * that one moves the reader within a record they are still reading, so the
   * travel is what tells them where they went. Here the record is replaced.
   */
  const goToRecordTop = () => {
    // Measured against the CURRENT layout, before the repaint — which is safe
    // because neither target moves: the page's top is 0, and the record
    // column's own top is set by the rail above it, which this does not touch.
    if (isDesktop) {
      const anchor = topRef.current;
      if (anchor) scrollParentOf(anchor).scrollTo({ top: 0, behavior: "auto" });
    } else {
      scrollDetailIntoView(recordRef.current);
    }
  };

  const { swapping: recordSwapping, swap: swapRecord } =
    useRecordSwap(goToRecordTop);

  const openAccount = (serviceId: string) => {
    if (!billing) return;
    swapRecord(() =>
      setOpenByBilling((all) => ({ ...all, [billing.billingCode]: serviceId })),
    );
  };

  /**
   * The record column is being replaced — by a new billing OR by a new plan
   * holder on the one already served.
   *
   * THE RAIL DOES NOT READ THIS, and that is the distinction the two flags
   * exist for. A billing swap replaces the accounts card as well; an account
   * swap must leave it exactly where it is, because the row just clicked is the
   * only thing on screen saying the click landed.
   */
  const recordBusy = swapping || recordSwapping;

  /* ------------------------- the verifier's ticks ------------------------- */

  // A HELD BILLING IS NEVER "VERIFYING", whatever the rail's tab says. This one
  // flag draws the tick boxes, the Check all, the selection and the Verify
  // Billing button — so reading it off the stage alone would offer a verifier's
  // controls over a billing opened out of the Endorsed list. See {@link reading}.
  const verifying = stage === "processed" && !reading;

  /**
   * The accounts still signable. An account is signed once — `verifyServices`
   * refuses to re-stamp — so a signed one drops out of the box, the Check all
   * and the count alike.
   */
  const verifiable = useMemo(
    () => (billing && verifying ? verifiableAccounts(billing) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [billing, verifying, storeVersion],
  );

  /** A selection belongs to ONE billing — see the swap that clears it. */
  useEffect(() => setCheckedIds([]), [billing?.billingCode]);

  /**
   * A NEW BILLING OPENS ON THE DOCUMENTS TAB, whatever the last one was left
   * on. The folder's own reasoning, now that the page holds the state: the tab
   * a processor left the previous record on is not where they want the next
   * one, and what is on FILE is the question the folder answers first.
   */
  useEffect(() => setDocsTab("documents"), [billing?.billingCode]);

  /**
   * Open the deficiency list and go to it — the Deficient tick's press.
   *
   * BOTH HALVES MATTER. Switching the tab without scrolling leaves the change
   * happening off screen on a long record, and scrolling without switching
   * lands the reader on the documents list, which is the other half of the
   * folder. `scrollDetailIntoView` is the module's own — it scrolls the shell's
   * inner container rather than the window, which is the distinction that makes
   * it work at all here.
   */
  const showDeficiencies = () => {
    setDocsTab("deficiencies");
    // ANIMATED (user, 2026-09-14). This jump is different in kind from the
    // rail's: nothing is being replaced, the record stays exactly as it was,
    // and the reader is being MOVED within it — so the travel is the thing that
    // says where they went. An instant jump from the form to the folder reads
    // as the page having changed rather than as the page having scrolled.
    scrollDetailIntoView(documentsRef.current, { smooth: true });
  };

  /**
   * THE ACCOUNT BEING READ IS IN THE LIST TO BE SIGNED — opening one ticks it,
   * so working down the rail builds the selection behind you and nothing has to
   * be gathered as a separate pass. On the open account CHANGING, not on every
   * render: unticking the row you are reading has to stick.
   */
  useEffect(() => {
    if (!verifying || !service || getVerifiedAccount(service.id)) return;
    if (service.discrepancy) return;
    setCheckedIds((prev) =>
      prev.includes(service.id) ? prev : [...prev, service.id],
    );
  }, [verifying, service]);

  /** The ticks that are still real — filtered on read, never pruned. */
  const checked = useMemo(
    () => checkedIds.filter((id) => verifiable.some((s) => s.id === id)),
    [checkedIds, verifiable],
  );
  const selection = useMemo(
    () => verifiable.filter((s) => checked.includes(s.id)),
    [verifiable, checked],
  );
  const allChecked =
    verifiable.length > 0 && checked.length === verifiable.length;

  const toggleChecked = (serviceId: string) =>
    setCheckedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );

  const toggleAll = () =>
    setCheckedIds(allChecked ? [] : verifiable.map((s) => s.id));

  /* ------------------------------- the acts ------------------------------- */

  /**
   * Let go of the billing — it has left this queue, so bring the next.
   *
   * NOTHING INCREMENTS THE POSITION. The act that finished the billing also
   * moved it out of this stage, so the queue array is one shorter on the next
   * derivation and `served` already points at what was behind it. Incrementing
   * as well would skip a chapel.
   */
  const releaseBilling = () =>
    swap(() => {
      // AND THE INTAKE'S WAY BACK IS TAKEN HERE, because this is the moment the
      // billing actually leaves — whichever act ended it. `resumeAt` is only
      // ever set by `goToBilling`, so on every other billing this does nothing;
      // on a franchise billing raised from the intake it puts For Process back
      // where the jump forward found it. See {@link resumeAt}.
      //
      // The index is exact rather than approximate: the billing leaving sits
      // BEHIND the position being restored, which is what "jumped forward"
      // means, so the array shrinking under it moves nothing in front of it.
      if (resumeAt !== null) {
        setServedByStage((all) => ({ ...all, "for-process": resumeAt }));
        setResumeAt(null);
      }
      // EVERY ENTRY, NOT JUST THIS BILLING'S — which is why the function no
      // longer needs to be told which billing it is letting go. The one being
      // released has moved to the NEXT stage, where it keeps the same code, so
      // an entry left under it is exactly the one that hands the next desk the
      // bottom of the list. See {@link openByBilling}.
      setOpenByBilling({});
      setCheckedIds([]);
    });

  /**
   * The account is answered: open the next one that is not.
   *
   * WHETHER RUNNING OUT OF ACCOUNTS ALSO ENDS THE BILLING DEPENDS ON THE STAGE,
   * and getting that wrong cost a verifier their own signature.
   *
   *   FOR PROCESS   terminating the last plan IS the billing's completion — the
   *                 rule in `getServiceBillings` is exactly "numbered, and every
   *                 plan that can be terminated has been" — so the billing moves
   *                 to Processed on its own and there is nothing left to look
   *                 at. Let it go.
   *
   *   FOR VERIFICATION   signing the last ACCOUNT does not sign the BILLING.
   *                 Those are two acts on purpose (user, 2026-08-27): the last
   *                 tick must not post the document out from under the person
   *                 taking the decision, who wants to look at the whole thing —
   *                 or print it — before putting it through. So the billing
   *                 STAYS, and what changes is that Verify Billing comes alive
   *                 under the list. It leaves when that is pressed.
   *
   * This advanced unconditionally at first, and the verification queue then
   * swapped the chapel away on the last tick — the one button that stage exists
   * for never became reachable.
   */
  const advance = (from: ServiceBilling) => {
    const next = servicesOf(from).find((s) => !isAccountDone(from, s, stage));
    if (next) {
      openAccount(next.id);
      return;
    }
    // A PAPER FRANCHISE STILL TAKING ENTRIES IS NEVER FINISHED BY RUNNING OUT
    // OF ACCOUNTS, which is the third thing the manual path had to correct here.
    //
    // For every other billing, no account left is the end of the work: they
    // arrived together with the endorsement, so the last termination is the last
    // there will be. A paper franchise's accounts come into being one at a time
    // as they are typed — running out means the processor has caught up with
    // their own typing, not that the stack is done — so releasing here would
    // swap the billing away after the FIRST sheet and take the Add Planholder
    // button with it.
    //
    // ONCE THE ENTRY IS CLOSED IT IS AN ORDINARY BILLING AGAIN, and this falls
    // through to the ordinary release: the list is final, so running out of
    // accounts means exactly what it means everywhere else. That is the whole
    // point of the lock being its own act — see `isFranchiseEntryOpen`.
    if (isFranchiseEntryOpen(from)) return;
    if (stage === "for-process") releaseBilling();
  };

  /**
   * Terminate — which is the same act as committing the record, and the button
   * is named after the half that matters to the business.
   *
   * THE QUESTION IS RAISED HERE and not on the button, because this runs
   * downstream of the form's own validation: `RecordActions` submits the form
   * by id, react-hook-form validates, and only then is this called. Asking from
   * an `onClick` would put the question before the fields are known to be good,
   * which is how a dialog gets trained into noise.
   */
  const handleSave = async (details: ServiceRecordDetails) => {
    if (!billing || !service) return;
    const terminates = canTerminateInto(billing, service);
    const who = `${deceasedName(service)} · ${service.lpaNo}`;

    const proceed = await messageBox({
      title: terminates ? "TERMINATE THIS PLAN?" : "SAVE WITHOUT TERMINATING?",
      message: terminates
        ? `${who} will be terminated into billing ${billing.billingNo}, and this service record saved against it.`
        : `${who} — the record will be saved, but the plan will NOT be terminated: ${terminationBlocker(
            billing,
            service,
          )}.`,
      confirmText: terminates ? "Terminate" : "Save",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!proceed) return;

    saveRecord(billing, service, details);
    // Only a termination advances. A record saved WITHOUT terminating has not
    // answered the account — it is still waiting on whatever blocked it, and
    // moving on would bury the one thing the processor has to deal with.
    if (terminates) advance(billing);
  };

  /* ------------------------------ navigation ------------------------------ */

  const changeStage = (next: BillingStage) => {
    if (next === stage) return;
    swap(() => {
      // AND THE INTAKE'S WAY BACK GOES WITH IT. `resumeAt` is a detour this
      // page took inside For Process; asking for another queue ends the
      // errand, and a stale index would send the conveyor somewhere nobody
      // asked to be the next time a franchise billing is closed.
      setResumeAt(null);
      setStage(next);
      // AND IT LETS GO OF A HELD BILLING. Asking for a queue is asking for the
      // work in it; leaving a billing read out of the Endorsed list standing in
      // front of the stage just picked would answer a question nobody asked.
      setHeld(null);
      // THE CROSSING THAT CAUSED IT (user, 2026-09-14). A billing carries its
      // code through all four queues, so an account left open by the processor
      // was still open when the verifier met the same chapel — and the verifier
      // started at the bottom of the list. Every queue reads from the top. See
      // {@link openByBilling}.
      setOpenByBilling({});
      setCheckedIds([]);
    });
  };

  /**
   * PUT A BILLING PICKED OUT OF THE SHEET ON SCREEN — the one way in, for all
   * six lists.
   *
   * IT ASKS THE QUEUES FIRST, and that order is the whole of it. A billing still
   * waiting on somebody is a POSITION: moving the conveyor to it leaves the
   * screen exactly as it would have been had the billing come up in turn, with
   * the stage's act on offer. Holding such a billing instead would strand
   * workable work behind a read-only bar.
   *
   *   1. THIS stage's queue — move the conveyor to it.
   *   2. ANOTHER stage's queue — switch stage and move that one. A billing the
   *      processor put through this morning is in the verifier's queue, not
   *      theirs, and refusing to follow it there would be the page pretending it
   *      has no other queues while four tabs for them sit in the rail.
   *   3. NONE OF THEM — hold it. Endorsed, and therefore filtered out of every
   *      queue by `billingQueue`: there is no position to take, so it stands in
   *      front of the conveyor instead of on it. See {@link held}.
   *
   * THE CONVEYOR'S POSITION IS NOT SPENT ON A HELD BILLING, so letting go
   * returns the reader to exactly the billing they left.
   *
   * THE ONE IT REFUSES is the billing already on screen — the pick is answered
   * by closing the sheet, which has already happened. Swapping the page for
   * itself would be a placeholder, a fade and the same chapel.
   */
  const openFromList = (picked: ServiceBilling, from: string) => {
    setBrowseOpen(false);
    if (picked.billingCode === billing?.billingCode) return;

    // A BILLING ASKED FOR BY NAME ENDS THE INTAKE'S ERRAND. `resumeAt` is the
    // way back from a detour the page took on the processor's behalf; choosing
    // a billing out of the sheet is the processor saying where they want to be,
    // and returning them somewhere else afterwards would overrule it.
    setResumeAt(null);

    const positionIn = (key: BillingStage) =>
      queues[key].findIndex((b) => b.billingCode === picked.billingCode);

    const here = positionIn(stage);
    if (here >= 0) {
      swap(() => {
        setHeld(null);
        setServedByStage((all) => ({ ...all, [stage]: here }));
        // A billing taken out of turn is a fresh reading too, and it may well be
        // one this session has already been in and left part-way down.
        setOpenByBilling({});
        setCheckedIds([]);
      });
      return;
    }

    // THE STAGES THIS SCREEN WORKS, so a verified billing is NOT followed into
    // its queue: approval is made on the Approvals page now, and switching the
    // conveyor to a stage the strip no longer offers would strand the reader on
    // a tab that is not there. It falls through to case 3 and is held — which is
    // the honest answer for it, because this page has no act for it either.
    const elsewhere = CONVEYOR_STAGES.find(
      (key) => key !== stage && positionIn(key) >= 0,
    );
    if (elsewhere) {
      const there = positionIn(elsewhere);
      swap(() => {
        setHeld(null);
        setStage(elsewhere);
        // WRITTEN AGAINST `elsewhere` RATHER THAN THROUGH THE CURRENT STAGE,
        // which is what `setServedByStage((all) => ({...all, [stage]: …}))`
        // would do: this runs in the same batch as the change of stage, so
        // `stage` is still the one being left.
        setServedByStage((all) => ({ ...all, [elsewhere]: there }));
        setOpenByBilling({});
        setCheckedIds([]);
      });
      return;
    }

    swap(() => {
      setHeld({ billingCode: picked.billingCode, from });
      setOpenByBilling({});
      setCheckedIds([]);
    });
  };

  /** Back to the queue the conveyor was on — the held bar's one control. */
  const letGo = () => swap(() => setHeld(null));

  /**
   * Put the conveyor on a billing NAMED BY CODE — what the intake does with the
   * billing it has just raised.
   *
   * IT IS `openFromList`'S FIRST CASE, and deliberately not a second mechanism
   * for the same thing: a billing raised by the intake is in For Process by
   * construction, so there is a position in that queue to move to and nothing to
   * hold. What it does not share is the sheet — there is no list to close and no
   * "opened from" to carry, because nobody browsed to this billing. They made
   * it.
   *
   * IT ALSO SWITCHES STAGE, for the case a processor raises a franchise billing
   * while standing in For Verification. The alternative is raising a number and
   * leaving the screen on somebody else's queue, which is the intake quietly
   * doing nothing.
   */
  const goToBilling = (billingCode: string) => {
    // THE QUEUE IS RE-DERIVED HERE AND NOT READ OFF `queues`, which is the one
    // thing about this function that is not obvious. `queues` is memoised on the
    // store's version, and the store was written a line ago in the same handler
    // — React has not re-rendered yet, so the memo cannot possibly contain the
    // billing this is being asked to find. Asking the store directly is the
    // whole fix, and it is cheap: the derivation is what every render does.
    const at = billingQueue("for-process").findIndex(
      (b) => b.billingCode === billingCode,
    );
    if (at < 0) return;
    swap(() => {
      setHeld(null);
      // THE WAY BACK, recorded before the position is spent — see
      // {@link resumeAt}. Taken from For Process's own index whatever stage the
      // intake was opened from: that is the queue being jumped forward in.
      setResumeAt(servedByStage["for-process"]);
      setStage("for-process");
      // Written against the stage being moved TO rather than through `stage`,
      // which is still the one being left inside this batch — the same
      // correction `openFromList` makes.
      setServedByStage((all) => ({ ...all, "for-process": at }));
      setOpenByBilling({});
      setCheckedIds([]);
    });
  };

  // THE PAGER IS GONE (2026-09-14). `nextBilling` incremented `served` by hand
  // so that For Endorsement — the one queue with nothing to commit — could move
  // at all. It has a commit now, and endorsing takes the billing out of the
  // queue the way the other three acts do, so the array shrinks under the index
  // and the next billing arrives without anything being counted past. See
  // `releaseBilling`, which is the same mechanism the other stages use.

  /* ------------------------------- rendering ------------------------------- */

  const planholder = service ? db.getPlanholder(service.lpaNo) : undefined;

  /**
   * The plan's own transaction history — issuance, collections, lapse and
   * reinstatement, transfers. ONE TO A LINE, the density the record view reads
   * them at: this panel is a few rows, and paragraph spacing would put two
   * remarks in it.
   */
  const planRemarks = service
    ? db
        .getPlanholderRemarks(service.lpaNo)
        .map((remark) => remark.value)
        .join("\n")
    : "";

  /**
   * THE RECORD IS CLOSED. Decided once and handed to both halves — the form
   * locks its fields, the rail disables the commit — because a screen that
   * half-locks is worse than one that does not lock at all.
   *
   * Asked of the BILLING as well as the store: `isPlanTerminated` knows only
   * what this session wrote, so every account posted before it would read as
   * open and a billing from July would offer a live Terminate.
   */
  //
  // A HELD BILLING IS CLOSED BY DEFINITION — it is off the conveyor and there is
  // no act on offer, so the form must not invite one. In practice every billing
  // that can be held is endorsed and every account on it is long terminated, so
  // this flag rarely decides anything; it is stated because "read-only" must not
  // depend on that happening to stay true.
  const locked =
    reading || (billing && service ? isServiceTerminated(billing, service) : false);

  const progress = billing ? stageProgress(billing, stage) : { done: 0, total: 0 };

  /**
   * Whether this queue works the billing ACCOUNT BY ACCOUNT — which decides
   * whether the rail draws a progress bar at all, and which of the two
   * sentences goes under it.
   *
   * It is also the type guard that lets `STAGE_DONE_WORD[stage]` compile: that
   * map is typed to the two stages that have a per-account act, so the branch
   * below cannot reach for a word that does not exist. See
   * `worksAccountByAccount`.
   */
  // OFF WHILE READING, for the reason the bar is off on the two reading queues:
  // "3 of 8 terminated" is a fraction of the STAGE's act, and a held billing is
  // not at this stage. On an endorsed billing the bar would read full, always,
  // over a queue the reader is not working.
  const counting = worksAccountByAccount(stage) && !reading;

  /**
   * What the bolt beside the number says on hover, when this session raised it.
   *
   * THE MORTUARY IS THE POINT of the sentence, not the fact of the automation:
   * a rate is a term of the mortuary's contract, so which one the billing was
   * raised against is what every amount under it was priced by. A chapel the
   * reference data gives none is the case worth naming out loud — its accounts
   * price at nothing until somebody sets one on the record.
   */
  const autoMintNote = useMemo(() => {
    if (!billing) return undefined;
    const mortCode =
      getBillingMortCode(billing.billingCode) ||
      defaultMortCodeFor(billing.chapelCode);
    const mortuary = getMortuary(mortCode)?.mortuary;
    return mortuary
      ? `Raised automatically against ${mortuary} when this chapel came up`
      : "Raised automatically — no mortuary is designated for this chapel, so its accounts are unpriced until one is set on the record";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing?.billingCode, billing?.chapelCode, storeVersion]);

  return (
    // A fragment: the toaster cannot live INSIDE `Page.Root`, which keeps only
    // its tool and main content children and silently drops the rest.
    <>
      {/*
       * THE PAGE KEEPS ITS OWN HEADING, and it did not for a day.
       *
       * It was hidden with a `css` override while `BillingHead` stood at the top
       * of the record column: that block named what was being worked and carried
       * the money, so a second title reading "Service Payables" over it would
       * have named the module rather than the work and cost a whole row doing
       * it.
       *
       * The billing moved to the rail (see the note at the top of this file) and
       * the reason went with it. Without the title the record column opened
       * straight onto a plan holder's name with nothing above it saying what
       * screen this is — the override outliving the thing it was for, which is
       * how a page ends up headless for no stated reason.
       */}
      <Page.Root
        title="Service Payables"
        headerButton="menu"
        /*
         * ZERO, AND THE RESERVE IS INSIDE THE GRID INSTEAD — see
         * `CONVEYOR_MAIN_TAIL`, which carries it on the record column.
         *
         * `Page.Root` pads every page for the mobile bottom navigation unless it
         * is given a value, and that padding lands OUTSIDE the grid row. The
         * rail is `position: sticky` and may not leave its row, so the reserve
         * came straight off its pinning range: measured at 1440x620 the rail
         * held at 108px for the whole scroll and then lurched to 48 over the
         * last tenth — the head of the column, and the billing it names, shoved
         * off the top of a element that cannot be scrolled to.
         *
         * Zero rather than a smaller number, because the reserve has MOVED
         * rather than gone. The death claim's own `Page.Root` says the same.
         */
        paddingBottom={0}
      >
        {/* NOTHING IN `Page.ToolContent`, AND THERE WAS FOR AN HOUR (user,
            2026-09-14: "remove the search bar in the tool content").

            An "All billings" button stood on the title row — the page-level door
            to the lists, put there because the header costs no vertical space
            while the rail is bounded. What it looked like on the row was a
            SECOND SEARCH FIELD: an outlined pill with a magnifier and a label,
            eighteen pixels from the rail's actual search field, which is the one
            thing this whole change was asked not to become ("instead of another
            search bar").

            THE DOOR IS THE RAIL'S FIELD, and one door is enough now that the
            sheet has tabs. It opens on the queue it stands in and every other
            list is one pill away — where before the sheet WAS the queue and a
            second entrance was the only way to reach anything else. */}
        <Page.MainContent>
          <Page.Row>
            <Box ref={workspaceRef} css={WORKSPACE_ROOT}>
              <Box ref={topRef}>
                {/* THE SWAP NO LONGER REPLACES THE PAGE (user, 2026-09-14:
                    "only do the skeleton loading with the component that are
                    changing"). A `swapping ?` branch stood here and rendered a
                    placeholder INSTEAD of the whole grid, so the queue tabs, the
                    search field and the commit all went off screen for 380ms to
                    announce that a different billing had arrived — including on
                    a stage change, where the tabs are the control that was just
                    clicked.

                    The beat is now inside the grid, on the two blocks a new
                    billing actually replaces: the accounts card and the record
                    column. Everything else stays mounted, so the rail keeps its
                    height and its pinning across the swap. See
                    `conveyor/swap-skeleton`. */}
                {/* THE GUARD ASKS FOR A BILLING AND NO LONGER FOR AN ACCOUNT
                    (2026-09-15), which is the first of the three things the
                    paper franchise corrected here.

                    It read `!billing || !service`, and the second half was true
                    of every billing this module could produce — accounts arrive
                    with the endorsement, so a billing with none did not exist.
                    A franchise billing is RAISED EMPTY: the number is minted
                    before a single plan holder is keyed in, because a terminated
                    plan has to be posted against something. Read the old way,
                    the processor raised a billing and the page answered "queue
                    clear" over the billing they had just made.

                    So the grid draws whenever there is a billing, and the two
                    places that need an account — the commit, and the record
                    column — say so themselves. */}
                {!billing ? (
                  <QueueClear
                    stage={stage}
                    worked={queue.length}
                    counts={counts}
                    onChangeStage={changeStage}
                    query={query}
                    onQueryChange={setQuery}
                    // ON THE QUEUE THAT IS EMPTY, which is not a wasted door:
                    // the sheet's tabs are where a reader goes from a clear
                    // queue to find what they worked, and the count on each one
                    // says where it went.
                    onSearch={() => {
                      setScope(stage);
                      setBrowseOpen(true);
                    }}
                    onRestart={() =>
                      swap(() =>
                        setServedByStage((all) => ({ ...all, [stage]: 0 })),
                      )
                    }
                    // AND THE INTAKE IS HERE TOO, which is not a second door in
                    // the sense the header's button was. It is the SAME control
                    // in the rail's own card — `QueueClear` draws `StageSwitch`,
                    // and the button belongs to that card wherever it is drawn.
                    // A clear For Process queue is also exactly when somebody
                    // sits down with a stack of a franchise's paperwork: there
                    // is nothing waiting because nothing was endorsed.
                    onFranchiseEntry={() => setIntakeOpen(true)}
                  />
                ) : (
                  <Grid css={CONVEYOR_GRID}>
                    {/* THE RAIL, and it is the LEFT column now — written
                        first so that stacked it still comes above the record,
                        which is the order of the task either way: what am I
                        working, then work it. `CONVEYOR_GRID` puts the rail
                        track first, so nothing has to be re-ordered. */}
                    <GridItem css={isDesktop ? CONVEYOR_RAIL : STACKED_ITEM}>
                      {/* WHICH QUEUE, OVER THE FIELD THAT SEARCHES IT — one
                          card, the death claim's `StageCard` exactly.

                          THE QUERY IS HELD BY THE PAGE and not by the field,
                          because the two are halves of one gesture: it is
                          typed here and RUN in the pop-up, and a field that
                          forgot what it was asked the moment the list opened
                          would make the second half unreadable. */}
                      <Box flexShrink={0} mb={4}>
                        <StageSwitch
                          active={stage}
                          counts={counts}
                          onChange={changeStage}
                          query={query}
                          onQueryChange={setQuery}
                          // THE FIELD UNDER THE QUEUE TABS OPENS THE QUEUE IT
                          // STANDS IN. The sheet can show any of six lists now,
                          // and the tabs on it are one click from here — but the
                          // door a reader came through has to land where its
                          // label promised. "All billings" is the header's
                          // button, a column away.
                          onSearch={() => {
                            setScope(stage);
                            setBrowseOpen(true);
                          }}
                          // THE FRANCHISE INTAKE, at the end of the tab row —
                          // see `StageSwitch`, which owns the placement and the
                          // widths behind it.
                          onFranchiseEntry={() => setIntakeOpen(true)}
                        />
                      </Box>

                      {/* THE ACCOUNTS, AS ONE CARD (user, 2026-09-11).
                          The label, the progress and the list were three
                          loose pieces in a rail where every other block has
                          an edge — the same complaint the stage card above
                          answered. One card, and it holds the list the way
                          that one holds its search field.

                          `RAIL_GIVES`, so the card is the flex child that
                          SHRINKS: the rail is bounded and sticky, and the
                          list inside is the only thing in the column allowed
                          to give up height so the card stays inside the
                          rail's bound rather than running off the bottom of a
                          sticky column that cannot be scrolled to.

                          ONE OF THE TWO BLOCKS THE SWAP STANDS IN FOR. The
                          placeholder takes the same slot in the same flex
                          column, and clips rather than grows — a beat that
                          pushed the commit down and pulled it back would be a
                          worse flicker than the one it is there to prevent.

                          `key` on the billing code so the arriving card is a
                          NEW element: that is what replays the fade. Without it
                          React updates the card in place and the animation,
                          having already run once, never runs again. */}
                      {swapping ? (
                        <Box css={CONVEYOR_GIVES} overflow="hidden">
                          <AccountsCardSkeleton withProgress={counting} />
                        </Box>
                      ) : (
                      <Box
                        key={billing.billingCode}
                        {...CARD_SHAPE}
                        bg="white"
                        px={4}
                        py={3}
                        css={{ ...CONVEYOR_GIVES, ...SWAP_FADE }}
                      >
                        {/* WHICH BILLING THESE ACCOUNTS BELONG TO — AND THE
                            ONLY PLACE IT IS SAID (user, 2026-09-11).
                            `BillingHead` stood over the record column and is
                            gone; this is what is left of it.

                            TWO IDENTIFIERS AND THE MONEY, and nothing else
                            (user, 2026-09-11). It briefly carried the chapel,
                            the period, the wait and the processor as well,
                            which made a five-line block at the head of a
                            bounded column — every line of it height the
                            account list underneath does not get. Each was cut
                            on its own merits:

                            · the CHAPEL — `ALABAT1JUN26` opens with it, and
                              the chapel name spelled out beneath its own code
                              was the same fact twice in two notations.
                            · the WAIT explained the queue's ORDER, and the
                              queue pop-up — where the order is actually read —
                              still carries it on every row.
                            · the auto-mint BOLT, whose sentence is now on the
                              number's own `title`. A mark that needs a second
                              mark to explain it is two things where the
                              tooltip was already enough.

                            TWO COLUMNS, AND EACH IS ONE KIND OF FACT: what
                            this billing IS on the left — the two identifiers,
                            the number over the code — and what it AMOUNTS TO
                            on the right, the money over where and when it was
                            earned.

                            THE NUMBER LEADS, falling back to the code on a
                            billing that has none — every account held by a
                            discrepancy, so `useAutoBilling` raised nothing.
                            Then the code is not repeated underneath. */}
                        <Flex
                          align="flex-start"
                          justify="space-between"
                          gap={3}
                          flexShrink={0}
                        >
                          <Box minW={0}>
                            <Text
                              fontSize="15px"
                              fontWeight="700"
                              fontFamily="mono"
                              lineHeight="1.2"
                              color="gray.900"
                              truncate
                              // WHAT THE AUTOMATION DID, on hover and nowhere
                              // else. Only where this session minted it: an
                              // on-file billing was raised weeks ago by a
                              // person, and claiming it would be a lie.
                              // NOT ON A BILLING THE PROCESSOR RAISED
                              // THEMSELVES. `hasCreatedBilling` is true for a
                              // franchise billing too — the intake writes the
                              // same row — and "raised automatically when this
                              // chapel came up" over a number somebody minted by
                              // hand two minutes ago is the automation taking
                              // credit for a person's work.
                              title={
                                hasCreatedBilling(billing.billingCode) &&
                                !billing.isPaperFranchise
                                  ? autoMintNote
                                  : undefined
                              }
                            >
                              {billing.billingNo ?? billing.billingCode}
                            </Text>

                            {/* THE CODE, DIRECTLY UNDER THE NUMBER. The two
                                identifiers belong together: one is what the
                                billing is quoted by outside this module, the
                                other what the CIS source keys it on, and a
                                processor matching a paper report reads them
                                as a pair. */}
                            {/* A PAPER FRANCHISE HAS NO CIS CODE, so this line
                                says so instead of printing the local key that
                                stands in for one. `FR:BT1-01:1SEP26` is a handle
                                the module holds the billing under — see
                                `franchiseBillingCode` — and a processor matching
                                a paper report against the screen must never be
                                shown it in the slot where the CIS number goes.
                                The line is kept rather than dropped: it is what
                                answers "why is there no code here". */}
                            {billing.isPaperFranchise ? (
                              <Text
                                mt="2px"
                                fontSize="11.5px"
                                color="#b45309"
                                truncate
                                title="This franchise submits on paper — it endorses nothing through CIS, so the billing has no CIS billing code."
                              >
                                Franchise · on paper
                              </Text>
                            ) : (
                              billing.billingNo && (
                                <Text
                                  mt="2px"
                                  fontSize="11.5px"
                                  fontFamily="mono"
                                  color="gray.500"
                                  truncate
                                >
                                  {billing.billingCode}
                                </Text>
                              )
                            )}
                          </Box>

                          {/* THE MONEY, AND WHAT IT IS FOR — territory and
                              period under it (user, 2026-09-11), right-aligned
                              so the two lines read as one column. The period
                              is the WEEK being billed, which is the other half
                              of "what am I paying for"; the territory is the
                              only thing on this card that says where in the
                              country this chapel is, now that the record
                              column's heading has gone.

                              THE TERRITORY AS ITS CODE, NOT ITS DESCRIPTION
                              (user, 2026-09-11) — and that is what lets the
                              two share a line. "CENTRAL LUZON TERRITORY 1" is
                              254px of a 300px card on its own; `CLT1` is four
                              characters, so the period fits beside it and the
                              card is a line shorter. It reads as a code
                              because it is one — the same string the billing
                              code, the chapel record and the old territory
                              picker were all keyed on — and anyone working
                              this queue knows their own patch by it. The full
                              name is a hover away. */}
                          <Flex
                            direction="column"
                            align="flex-end"
                            gap="2px"
                            flexShrink={0}
                            textAlign="right"
                          >
                            <Text
                              fontSize="14px"
                              fontWeight="700"
                              fontVariantNumeric="tabular-nums"
                              color="gray.800"
                              whiteSpace="nowrap"
                            >
                              {formatCSP(billing.totalCSP)}
                            </Text>
                            <Text
                              fontSize="10.5px"
                              color="gray.500"
                              whiteSpace="nowrap"
                              title={db.getTerritoryName(
                                billing.territoryCode,
                              )}
                            >
                              {billing.territoryCode && (
                                <>
                                  <Text as="span" fontFamily="mono">
                                    {billing.territoryCode}
                                  </Text>
                                  {" · "}
                                </>
                              )}
                              {billing.periodLabel}
                            </Text>
                          </Flex>
                        </Flex>

                        <Box
                          my={3}
                          borderTopWidth="1px"
                          borderColor="gray.200"
                          flexShrink={0}
                        />

                        {/* HOW FAR THROUGH, directly over the list it counts.
                            THE "PLANHOLDERS" LABEL ABOVE IT IS GONE (user,
                            2026-09-11) and nothing is lost: a list of people's
                            names under a count of terminations does not need
                            to be told it is a list of people. The label was
                            the last thing in this card that named a thing
                            rather than said something about it.

                            Check all takes the row's right, which is where the
                            label's own row used to put it. */}
                        <Box mb={2.5} flexShrink={0}>
                          {/* NO BAR ON THE READING QUEUES (user, 2026-09-14:
                              "when in approved and endorsement remove the
                              counter bar. since it is not needed").

                              A progress bar answers "how far through am I",
                              and For Approval and For Endorsement have no
                              "through": the accounts are read and the BILLING
                              is signed, so `isAccountDone` returns true for
                              every row the moment the billing arrives. The bar
                              was therefore full, always, on every billing at
                              those two stages — a control that can only ever
                              report 100% is not reporting anything, and a
                              finished green bar over a queue where nothing has
                              been done yet actively says the wrong thing.

                              WHAT IT LEAVES IS THE COUNT, which is worth
                              keeping: how many accounts this billing carries is
                              the first thing an approver sizes it up by. See
                              the sentence below. */}
                          {counting && (
                            <Box
                              h="4px"
                              borderRadius="full"
                              bg="gray.200"
                              overflow="hidden"
                            >
                              <Box
                                h="full"
                                borderRadius="full"
                                bg={BRAND_COLORS.primaryGreen}
                                transition="width 0.3s ease"
                                w={
                                  progress.total
                                    ? `${(progress.done / progress.total) * 100}%`
                                    : "0%"
                                }
                              />
                            </Box>
                          )}
                          <Flex
                            mt={counting ? 1.5 : 0}
                            align="center"
                            justify="space-between"
                            gap={2}
                            fontSize="11px"
                            color="gray.500"
                          >
                            {/* TWO SENTENCES, BECAUSE THERE ARE TWO FACTS.
                                Where the accounts are worked one at a time the
                                line is a fraction of an act — "3 of 8
                                terminated". Where they are not, it is a plain
                                count of what is on the billing — "8 accounts"
                                (user, 2026-09-14: "make it number of accounts
                                instead of num of num accounts"), because "8 of
                                8 accounts" is a fraction whose numerator can
                                never be anything but its denominator. */}
                            {counting ? (
                              <Text>
                                <Text
                                  as="span"
                                  fontWeight="600"
                                  color="gray.700"
                                >
                                  {progress.done} of {progress.total}
                                </Text>{" "}
                                {STAGE_DONE_WORD[stage]}
                              </Text>
                            ) : (
                              <Text>
                                <Text
                                  as="span"
                                  fontWeight="600"
                                  color="gray.700"
                                >
                                  {progress.total}
                                </Text>{" "}
                                {progress.total === 1 ? "account" : "accounts"}
                              </Text>
                            )}
                            {/* ONE SLOT, AND THE WORK WINS IT.
                                Check all is drawn while there is a selection
                                to gather; otherwise the slot names WHO PUT
                                THE BILLING THROUGH.

                                They share it rather than stacking because a
                                bounded sticky rail spends every line on the
                                account list, and the two are wanted at
                                different moments: the control while a verifier
                                is working down the rows, the name when reading
                                a billing somebody else processed. The name is
                                on every row of the queue pop-up as well, so
                                nothing is out of reach while Check all has the
                                slot.

                                "PROCESSOR", NOT "BY" (user, 2026-09-11). "by
                                JACKIE PANES" beside a count of
                                terminations reads as though they did the
                                terminating — which on a billing being worked
                                right now by somebody else is exactly wrong.
                                The label names the ROLE on the billing. */}
                            {verifying && verifiable.length > 0 ? (
                              <Box
                                as="button"
                                onClick={toggleAll}
                                fontSize="11px"
                                fontWeight="600"
                                color="gray.600"
                                px={1}
                                borderRadius="md"
                                cursor="pointer"
                                flexShrink={0}
                                _hover={{ color: "gray.800" }}
                              >
                                {allChecked ? "Clear" : "Check all"}
                              </Box>
                            ) : (
                              billing.processedBy && (
                                <Text truncate maxW="170px">
                                  <Text as="span" color="gray.400">
                                    Processor{" "}
                                  </Text>
                                  <Text as="span" color="gray.600">
                                    {billing.processedBy}
                                  </Text>
                                </Text>
                              )
                            )}
                          </Flex>
                        </Box>

                        {/* THE ONE THING IN THE CARD THAT GIVES — `0 1 auto`
                            with `minH: 0`, so it takes every row a long screen
                            has room for and is shrunk by the browser, alone
                            among the rail's blocks, the moment the column
                            would outrun the screen. The controls below it
                            never move. The cap it is passed is the PHONE's,
                            where there is no bounded column to be shrunk
                            inside of; see `conveyorListBox`. */}
                        {services.length === 0 ? (
                          /* NOTHING KEYED IN YET — the first state of a paper
                             franchise's billing, and the only empty account list
                             this module can produce.

                             IT IS NOT AN ERROR AND MUST NOT LOOK LIKE ONE. The
                             billing was raised a moment ago by the person
                             reading this; what they need is not a warning but
                             the next instruction, which is the button directly
                             under it.

                             SO IT IS QUIET. It was drawn in the module's
                             franchise amber for a day and read as a caution
                             sitting over a green control — the rail says one
                             thing at a time, and the thing this state has to say
                             is on the button.

                             IN THE LIST'S OWN SLOT, so the card keeps its
                             shape: the block above it still says what the
                             billing is and the controls below it are where they
                             always are. */
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            textAlign="center"
                            gap={1}
                            px={3}
                            py={5}
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor="gray.200"
                            borderRadius="lg"
                            bg="gray.50"
                          >
                            <Text fontSize="12px" fontWeight="600" color="gray.700">
                              No accounts yet
                            </Text>
                            <Text fontSize="11px" color="gray.500" lineHeight="1.5">
                              {billing.isPaperFranchise
                                ? "Key the plan holders in from the franchise's paperwork, one at a time."
                                : "Nothing has been endorsed against this billing."}
                            </Text>
                          </Flex>
                        ) : (
                        <Box css={conveyorListBox(LIST_MAX_HEIGHT_COMPACT)}>
                          <PlanholderServiceList
                            services={services}
                            selected={service?.id ?? ""}
                            onSelect={openAccount}
                            isSaved={(id) =>
                              Boolean(getSavedServiceRecord(id))
                            }
                            selectable={verifying}
                            checkedIds={checked}
                            onToggle={toggleChecked}
                            isVerified={(id) =>
                              Boolean(getVerifiedAccount(id))
                            }
                            // THE DECEASED HEADS EACH ROW (user,
                            // 2026-09-11). What this chapel is being paid for
                            // is a funeral, and the funeral was for the
                            // deceased — which is also the name on the report
                            // the processor is matching the rail against. It
                            // takes the labelled "Deceased" third line off an
                            // assigned plan's row, because that line existed
                            // to name the person now on top. See
                            // `ServiceRowLead`.
                            lead="deceased"
                            // TIGHTER ROWS, because this rail has more in it
                            // than the workspaces the row was drawn for and
                            // now splits at a narrower shell. See `compact`.
                            compact
                            fills
                          />
                        </Box>
                        )}

                        {/* ADD PLANHOLDER — the paper franchise's entry, and
                            the last thing INSIDE the accounts card because it
                            adds to the list directly above it (user,
                            2026-09-15).

                            DRAWN ONLY WHERE THE RULES ALLOW IT, and that rule
                            was written months before there was anywhere to draw
                            it: `canAddManualService` — a manual franchise, with
                            a number already minted, not yet endorsed. A service
                            typed in beside services that arrived on their own
                            would be a payable somebody invented, so the button
                            appears exactly where the system cannot reach and
                            nowhere else.

                            THE KIT'S SECONDARY BUTTON (user, 2026-09-15: "make
                            it an outline button instead of dash button... the
                            color should be the same as the osp-ui theme"). It
                            was dashed and amber, saying "this is an entry, not a
                            commit" in a vocabulary the design system does not
                            have — where what the kit calls a secondary action is
                            precisely what this is. The rail now has one
                            grammar: the kit's outline for the acts that are not
                            the primary one, the kit's fill for the one that is.

                            THE RAIL'S HEIGHT, THE KIT'S COLOURS. `h` and the
                            type size are overridden because this column is built
                            to the death claim's 26px button and the kit's own is
                            40 — a control that set the card's height would move
                            the account list every time it appeared. Nothing
                            about the colour is touched. */}
                        {canAddManualService(billing) && !reading && (
                          <SecondarySmButton
                            onClick={() => setAddOpen(true)}
                            mt={2.5}
                            w="full"
                            h="30px"
                            minH="30px"
                            fontSize="12px"
                            borderRadius="lg"
                            flexShrink={0}
                          >
                            <LuPlus size={13} />
                            Add Planholder
                          </SecondarySmButton>
                        )}
                      </Box>
                      )}

                      {/* WHAT CAN BE DONE, AT THE FOOT OF THE RAIL — the
                          lookups that inform the decision and the commit that
                          takes it, back in one block (user, 2026-09-11).

                          IT WENT TO THE RECORD AND CAME BACK. The move was
                          made because on a phone the rail spent 711px before
                          the button while the record ran to 3,648, so the
                          commit was a page-scroll away from the reading that
                          justified it. The account list answers that at the
                          root instead — five rows on a phone, and beside the
                          record whatever the bounded column leaves it — so the
                          whole rail (stage, billing, accounts and these
                          controls) ends inside one screen either way, and the
                          record never has to carry the button.

                          NO RULE ABOVE IT. There was a hairline here, to say
                          the list had finished and something else had begun.
                          With the list bounded to five the card's own edge
                          already draws that line, and a second one directly
                          under it was two borders saying one thing.

                          NO PLACEHOLDER OVER THE CONTROLS, and they are inert
                          for the beat instead. The block is the same two
                          lookups and the same commit before and after a swap —
                          only the button's label and its enabled state can
                          differ — so a skeleton here would be a flicker with
                          nothing behind it, and a moving one at that, since the
                          commit's height is what the rail is bounded around.

                          INERT BECAUSE THE FORM IT SUBMITS IS THE THING BEING
                          REPLACED. Terminate carries `form={SERVICE_RECORD_FORM_ID}`
                          and that form lives in the record column, which is a
                          placeholder for these 380ms — so a press landing in the
                          beat would find no form and do nothing at all. A
                          control that silently declines is worse than one that
                          plainly cannot be pressed. */}
                      <Box
                        mt={4}
                        flexShrink={0}
                        opacity={recordBusy ? 0.5 : 1}
                        pointerEvents={recordBusy ? "none" : undefined}
                        aria-hidden={recordBusy || undefined}
                        transition="opacity 0.18s ease"
                      >
                        {/* NO ACCOUNT, NO RECORD COMMIT. Every control in this
                            block acts on the open record — Terminate submits its
                            form, the lookups read its plan — and a franchise
                            billing raised a moment ago has no record open. The
                            billing's own act below is what is on offer instead,
                            which is exactly right: with nothing keyed in, the
                            only things to do are add a plan holder or close the
                            billing, and both are elsewhere in this rail. */}
                        {service && (
                        <RecordActions
                          service={service}
                          billing={billing}
                          onOpenSoa={() => setSoaOpen(true)}
                          locked={locked}
                          // COMMIT ONLY (user, 2026-09-17: "we will remove
                          // this. We move it in the right section"). Loan
                          // Details and SOA are cards in the record column now
                          // — see `RecordLookups`. What is left in the rail is
                          // the one thing that ACTS on the record, which is
                          // what the column was for.
                          show="commit"
                          // A HELD BILLING HAS NO ACT — it is not at the stage
                          // the rail is showing, so the stage's own commit would
                          // be applied to a document that left this queue. See
                          // {@link reading}.
                          action={reading ? "read" : STAGE_ACTION[stage]}
                          // NO CAPTIONS UNDER THE COMMIT — they change with
                          // the account, and a sticky rail that changes height
                          // re-pins while you work. See `captions`.
                          captions={false}
                          // The death claim's button size — see `compact`.
                          compact
                          // THE ACCOUNT'S SIGNATURE IS THE SMALLER OF THE TWO
                          // ACTS IN THIS COLUMN (user, 2026-09-11), so on For
                          // Verification it is drawn as an outline and the
                          // solid fill goes to Verify Billing below. See
                          // `subordinate`, which is ignored on every other
                          // stage because no other stage has two commits.
                          subordinate={verifying}
                          selection={selection}
                          onVerified={() => {
                            setCheckedIds([]);
                            // Moves to the next unread account. It does NOT
                            // let go of the billing when they run out — that
                            // is Verify Billing's job, below.
                            advance(billing);
                          }}
                          // Approving DOES end the visit: there is no second
                          // act at that stage, and the billing has left the
                          // queue by the time this fires.
                          onApproved={() => releaseBilling()}
                        />
                        )}

                        {/* CLOSE ENTRY — the paper franchise's LOCK, in the slot
                            Terminate and Verify Billing occupy.

                            IT SEALS THE LIST, IT DOES NOT FINISH THE BILLING
                            (user, 2026-09-15: "what the close billing does? it
                            should be clickable if that was the locking of
                            billing in order not allowed to be added"). It was
                            called Close Billing and meant both, which is why it
                            sat greyed out: a control that also completes the
                            billing cannot be offered until every account is
                            terminated, and by then there is nothing left to lock
                            out. Now it means one thing — no more plan holders —
                            and it is live from the first account onwards.

                            WHAT FINISHES THE BILLING is the module's ordinary
                            rule, unchanged: every plan that can be terminated
                            has been. Closing the entry is what makes that rule
                            answerable, by freezing a list that would otherwise
                            keep growing under it. See `getServiceBillings`.

                            DRAWN ONLY WHILE THE ENTRY IS OPEN, and gone once it
                            is closed — at which point this is an ordinary For
                            Process billing and Terminate takes back the fill.
                            The rail changes height once, on a press the
                            processor made; what it must never do is change under
                            somebody who is still working, which is why Verify
                            Billing one queue along is drawn throughout instead.

                            AN OUTLINE, NOT THE FILL, and that is what the lock
                            being a lock actually looks like. It shares the
                            column with Terminate, and Terminate is the COMMIT —
                            the thing that posts a plan onto the billing. This
                            says which accounts exist. Giving it the fill made
                            Terminate the quiet one on a screen whose whole
                            purpose is terminating, and made the two read as
                            rival commits when only one of them is one.

                            THE SAME OUTLINE AS ADD PLANHOLDER, deliberately: the
                            rail now has one grammar, and these two are the pair
                            it applies to. One opens the list, the other closes
                            it; between them sits the green button that works
                            through it. */}
                        {/* NOT DRAWN AT ALL UNTIL IT CAN BE PRESSED, where every
                            other commit in this rail is drawn throughout and
                            disabled. Two reasons, and the second is the reason:

                            THE EMPTY STATE ALREADY SAYS IT. A billing with no
                            accounts shows "No accounts yet — key the plan
                            holders in", six lines above. A greyed Close Entry
                            under that is the same instruction in a weaker voice.

                            AND THE KIT'S BUTTON DOES NOT RESTYLE IN PLACE. This
                            one mounts on an empty billing and comes alive the
                            moment the first account lands — and rendered that
                            way it kept its disabled colouring, a pale green
                            label on a live control. The same failure the
                            `subordinate` flag hit on Terminate. Mounting it
                            already-live sidesteps it, and the moment the height
                            changes is the same moment the empty panel becomes a
                            list, so nothing shifts under a working hand. */}
                        {canCloseFranchiseEntry(billing) && !reading && (
                          <SecondarySmButton
                            mt={2.5}
                            w="full"
                            h="30px"
                            minH="30px"
                            fontSize="12px"
                            borderRadius="lg"
                            onClick={async () => {
                              if (!(await closeFranchiseEntry(billing))) return;

                              // CLOSING THE ENTRY USUALLY CHANGES NOTHING ABOUT
                              // WHICH BILLING IS ON SCREEN, and that is the
                              // whole of what it means for this to be a lock
                              // rather than a completion. The accounts are still
                              // there and still have to be terminated; swapping
                              // away would abandon the processor's own work
                              // mid-sitting, which is exactly what it did for
                              // one run.
                              //
                              // THE EXCEPTION IS AN ENTRY CLOSED WITH EVERYTHING
                              // ALREADY DONE — the ordinary path, where a
                              // processor terminates each sheet as they key it
                              // in and closes the entry last. The ordinary
                              // completion rule then fires on the same write and
                              // the billing leaves; nothing else would notice,
                              // because no per-account act ran.
                              //
                              // ASKED OF THE STORE AND NOT OF `queues`, for the
                              // reason `goToBilling` gives: the write happened a
                              // line ago and React has not re-rendered, so the
                              // memo cannot know about it yet.
                              const stillHere = billingQueue("for-process").some(
                                (b) => b.billingCode === billing.billingCode,
                              );
                              if (!stillHere) releaseBilling();
                            }}
                            title={`Seals ${billing.billingNo}: no further plan holders can be keyed into it. The accounts already on it are still terminated here.`}
                          >
                            Close Entry
                          </SecondarySmButton>
                        )}

                        {/* THE BILLING'S OWN SIGNATURE, under the accounts'.
                            Reading the accounts and putting the billing
                            through are two acts (user, 2026-08-27) — the last
                            tick must not post the document out from under the
                            person taking the decision — so this is a second
                            control and deliberately so. It is NOT a second way
                            to write the same fact: one signs accounts, this
                            signs the billing.

                            For Approval's equivalent is inside `RecordActions`
                            already, because approval has no per-account act to
                            share the slot with.

                            AND IT IS THE PRIMARY BUTTON OF THE COLUMN (user,
                            2026-09-11: "the verified account would be a outline
                            button then the verified billing would be the
                            primary button"). It was the quiet one — a white
                            outline under a filled green Verify Account — which
                            had the two acts the wrong way round: this is the
                            one that ends the visit and sends the document to
                            For Approval, where the button above it signs one
                            plan holder out of five. Worse, the filled one was
                            usually DEAD by the time a verifier looked at it,
                            reading "Verified" in past tense over the live
                            control they actually wanted next.

                            The two swapped rather than both being loud: one
                            primary to a column is the whole point of the
                            arrangement. See `subordinate` on `RecordActions`. */}
                        {/* NO RULE ABOVE IT (user, 2026-09-11: "also remove
                            the separator"). A dashed line stood here to say
                            that the accounts' act had finished and the
                            billing's had begun — which the two buttons now say
                            themselves: one is an outline and the one under it
                            is filled, and a reader who can see that does not
                            need a line drawn between them. It was also the
                            third horizontal rule in a column of four blocks. */}
                        {verifying && (
                          <Box mt={2.5}>
                            <Button
                              w="full"
                              borderRadius="lg"
                              bg={BRAND_COLORS.primaryGreen}
                              color="white"
                              _hover={{ bg: BRAND_COLORS.darkGreen }}
                              // DISABLED RATHER THAN DIMMED BY HAND. It was a
                              // `Box as="button"` carrying its own opacity and
                              // a `not-allowed` cursor, and a filled button
                              // needs the real thing: the kit's disabled state
                              // also stops the press, the hover and the focus
                              // ring, where the hand-rolled version left a
                              // green button that looked pressable and
                              // silently returned.
                              disabled={!canVerifyBilling(billing)}
                              onClick={async () => {
                                if (!canVerifyBilling(billing)) return;
                                // THIS is what ends the billing's visit — the
                                // signature, not the last account's tick. See
                                // `advance`, which deliberately does not.
                                if (await verifyBilling(billing)) {
                                  releaseBilling();
                                }
                              }}
                              /* THE CAPTION UNDER THIS BUTTON IS GONE, for
                                 the reason every other one in this column is:
                                 it said one of two sentences depending on
                                 whether the accounts were all read, so the
                                 rail changed height the moment a verifier
                                 ticked the last box.

                                 WHAT IT SAID IS STILL ON SCREEN. "3 of 4
                                 verified" is the progress line directly above
                                 the list — the same fact, in the place that
                                 already owns it — and the rest is here, on
                                 hover, where it costs nothing. */
                              title={
                                canVerifyBilling(billing)
                                  ? `All ${billing.services.length} accounts read — signing sends ${billing.billingNo} to For Approval.`
                                  : "The billing is signed once every account on it has been verified."
                              }
                            >
                              Verify Billing
                            </Button>
                          </Box>
                        )}

                        {/* FOR ENDORSEMENT HAS AN ACT NOW (user, 2026-09-14:
                            "instead of Next billing, Endorse is the name of the
                            button and make it primary").

                            WHAT STOOD HERE WAS A PAGER. The endorsement had
                            never been described, so the last queue offered
                            "Next billing" — a quiet outline button that stepped
                            over the billing without writing anything, leaving it
                            in the queue to be served again on the next restart.
                            It existed so the screen was not stuck, which is a
                            reason for a control to exist but not a reason to
                            give it the foot of the rail.

                            IT IS A SIGNATURE, SO IT LOOKS LIKE ONE. Primary and
                            full width, in the slot Terminate and Verify Billing
                            occupy on the queues before it — one commit to a
                            column, and this is the commit.

                            AND IT ASKS FIRST (user, 2026-09-14: "when click
                            there is a pop-up to confirm the endorsement"), which
                            is what the other three do: the dialog names the
                            billing, the accounts and the money, and says the
                            billing leaves for accounting. See
                            `useEndorseBilling`. */}
                        {stage === "approved" && !reading && (
                          <Button
                            mt={2.5}
                            w="full"
                            borderRadius="lg"
                            bg={BRAND_COLORS.primaryGreen}
                            color="white"
                            _hover={{ bg: BRAND_COLORS.darkGreen }}
                            disabled={!canEndorseBilling(billing)}
                            onClick={async () => {
                              if (await endorseBilling(billing)) {
                                // Endorsing ENDS the visit — the billing has
                                // left the last queue by the time this fires,
                                // so the conveyor brings the next one.
                                releaseBilling();
                              }
                            }}
                            title={`Endorsing sends ${
                              billing.billingNo ?? billing.billingCode
                            } to accounting. It does not come back to this desk.`}
                          >
                            {/* NO ICON (user, 2026-09-14: "remove the icons in
                                the buttons") — a plain label, like Terminate
                                and Verify Billing in the same slot. */}
                            Endorse
                          </Button>
                        )}
                      </Box>
                    </GridItem>

                    {/* THE RECORD — who it is for, then what they are owed.
                        THE BILLING NO LONGER HEADS IT (user, 2026-09-11): it
                        is in the rail's accounts card, which is pinned, where
                        a heading in this column scrolled away on the first
                        long folder. The column starts with the plan holder,
                        which is what the form below is checked against. */}
                    <GridItem
                      ref={recordRef}
                      css={isDesktop ? CONVEYOR_MAIN_TAIL : STACKED_ITEM}
                    >
                      {/* A STACK OF CARDS, at the claim column's own gap
                          (user, 2026-09-11: "same as the design of the
                          component of the death claim").

                          The sections below drew no edge of their own: a
                          heading, then content, with 28px of air between them
                          — which is how the PLAN HOLDER page reads them, where
                          they are bands in one long scroll and the headings do
                          the dividing. This column is not that. It opens with
                          two cards already, and a bare section under a card
                          reads as content that has fallen out of one.

                          `SectionCard` is the claim column's wrapper and it is
                          drawn around them rather than inside each, for the
                          reason given in that file: the rhythm belongs to the
                          column, not to the section.

                          THE SECOND BLOCK THE SWAP STANDS IN FOR, and the one
                          that genuinely needs the beat: the column is replaced
                          wholesale — a different person, a different plan, a
                          different folder — while the rail beside it keeps most
                          of its furniture. `RecordColumnSkeleton` is this stack
                          in placeholder form, card for card. */}
                      {recordBusy ? (
                        <RecordColumnSkeleton />
                      ) : !service ? (
                        /* A BILLING WITH NOTHING ON IT YET — the paper
                           franchise's first minute. There is no record to draw
                           because there is no plan holder, and the column says
                           that rather than standing empty.

                           IT POINTS AT THE RAIL, which is where the only two
                           moves are: Add Planholder, and the billing's own
                           close. A panel that offered a third door here would be
                           a second way to do the same thing, eighteen inches from
                           the first. */
                        <EmptyPanel
                          title={`${billing.billingNo ?? billing.billingCode} has no accounts yet`}
                          body={
                            billing.isPaperFranchise
                              ? "This franchise submits on paper, so nothing arrived with an endorsement. Add the plan holders one at a time from the hard copies — the button is under the accounts list."
                              : "Nothing has been endorsed against this billing."
                          }
                        />
                      ) : (
                      <Flex
                        // KEYED ON BOTH, so the fade replays for a new plan
                        // holder as well as a new billing — a fresh element is
                        // what makes the animation run again.
                        key={`${billing.billingCode}:${service.id}`}
                        direction="column"
                        gap={5}
                        css={SWAP_FADE}
                      >
                        {/* THE WAY BACK, AND THE REASON THE ACTS ARE MISSING.
                            A held billing is on screen because somebody named
                            it, not because a queue offered it — so the bar says
                            which list it came out of and gives the conveyor back
                            in one press.

                            IT IS NOT A WARNING. Nothing has gone wrong: this is
                            a billing being read rather than worked, which is
                            what the lists are for. Hence a hairline and grey
                            rather than the amber this module warns in.

                            AT THE HEAD OF THE RECORD, not in the rail. The rail
                            is pinned and the reader may be two thousand pixels
                            down a folder — but this is not a fact they need
                            while reading, it is the frame they need on ARRIVAL,
                            and arriving is the one moment the top of this column
                            is guaranteed to be on screen. The missing commit at
                            the foot of the rail is the other half of the same
                            sentence, and a reader who reaches for it has this
                            one press away. */}
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
                              — not in a queue you are working, so it can be read
                              but not acted on.
                            </Text>

                            <Flex
                              as="button"
                              onClick={letGo}
                              align="center"
                              gap={1.5}
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
                            >
                              <LuUndo2 size={13} />
                              Back to {BILLING_QUEUE_LABELS[stage]}
                            </Flex>
                          </Flex>
                        )}

                        <PlanholderPanel
                          service={service}
                          planholder={planholder}
                        />

                        {/* THE PLAN'S OWN TRAIL, as the claim draws it —
                            `PlanholderRemarks` with the notes half switched
                            off, which is exactly the call on
                            `/claims/death-claim`. It was `RemarksPanel`
                            directly here, the same panel one layer down,
                            carrying a "Remarks on record" subtitle the claim
                            does without. */}
                        <SectionCard>
                          <PlanholderRemarks
                            remarks={planRemarks}
                            showNotes={false}
                            showSubtitles={false}
                          />
                        </SectionCard>

                        {/* THE FORM IS IN A CARD TOO, and it was not one of
                            the four sections the change was asked for.

                            It is here because leaving it out would have been
                            the change failing: the record would have been the
                            one edgeless block in a column of five cards, which
                            reads as a section that has lost its card rather
                            than as a section that never had one. The claim
                            column has no such block. The card is the only
                            thing added — the heading, the fields and the
                            layout inside it are untouched. */}
                        <SectionCard>
                          <ServiceRecordForm
                            key={service.id}
                            service={service}
                            billing={billing}
                            onSave={handleSave}
                            locked={locked}
                            // Read, not made — same as every queue past For
                            // Process. See {@link reading}.
                            action={reading ? "read" : STAGE_ACTION[stage]}
                            // THE DEFICIENT TICK IS A WAY INTO THE FOLDER
                            // (user, 2026-09-14). The form knows neither where
                            // the folder is nor which of its two lists should
                            // open; the page answers both.
                            onShowDeficiencies={showDeficiencies}
                          />
                        </SectionCard>

                        {/* THE TWO LOOK-UPS, in the death claim's own place in
                            the column — after the record they are consulted
                            about, before the notes and the folder. Neither is
                            what the record is decided on. See
                            `RecordLookups`. */}
                        <RecordLookups lpaNo={service.lpaNo} />

                        <SectionCard>
                          <ServiceRecordNotes service={service} />
                        </SectionCard>

                        {/* THE FOLDER, IN ONE CARD WITH ITS DEFICIENCIES —
                            two tabs and one list, the claim's own folder. See
                            `ServiceRecordDocuments`.

                            THE REF IS ON A BOX AROUND THE CARD rather than on
                            `SectionCard`, which takes no ref — and the box is
                            what the Deficient tick scrolls to.

                            NO RESERVE UNDER IT (user, 2026-09-14: "remove the
                            white space at the bottom"). A screenful of minimum
                            height stood here for an afternoon so the folder
                            could always be scrolled to the very top; what it
                            bought was not worth what it showed — see the note
                            in `workspace-layout` where the figure used to
                            live. */}
                        <Box ref={documentsRef}>
                          <SectionCard>
                            <ServiceRecordDocuments
                              service={service}
                              isDesktop={isDesktop}
                              tab={docsTab}
                              onTabChange={setDocsTab}
                            />
                          </SectionCard>
                        </Box>
                      </Flex>
                      )}
                    </GridItem>
                  </Grid>
                )}
              </Box>
            </Box>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* Mounted always, `open` driving them — never `{open && <Dialog/>}`,
          which has left this app with the page behind it unclickable. */}
      <SoaDrawer
        lpaNo={service?.lpaNo ?? ""}
        planholder={planholder}
        open={soaOpen}
        onClose={() => setSoaOpen(false)}
      />

      {/* EVERY BILLING THIS MODULE HAS, BEHIND ONE SHEET — the queues, and the
          two lists no queue can name. It is handed the SCOPE and the QUERY and
          reads the billings itself: what is on the four queues is derivable from
          the store, and what is endorsed is not on a queue at all, so a
          `billings` prop could only ever have been the one list this page
          happens to be serving. See `conveyor/billing-list-popup`. */}
      <BillingListPopup
        open={browseOpen}
        onClose={() => setBrowseOpen(false)}
        scope={scope}
        onScopeChange={setScope}
        servedCode={billing?.billingCode}
        query={query}
        onQueryChange={setQuery}
        onOpenBilling={openFromList}
      />

      {/* THE FRANCHISE INTAKE — the one place in this module a billing is made.
          Mounted always and driven by `open`, like every other overlay here.

          IT PUTS THE CONVEYOR ON WHAT IT RAISED. The queue is ordered by how
          long a billing has been waiting, so a billing raised for last week's
          cut arrives near the BACK of For Process — correct as an order, and
          useless as an answer to somebody who has just made it and has the
          paperwork in their hand. See `goToBilling`. */}
      <FranchiseIntakeDialog
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        onSubmit={(intake) => goToBilling(createFranchiseBilling(intake))}
      />

      {/* KEYING A PLAN HOLDER IN — the franchise path's per-sheet act.
          `billing` is the served one, and the button that opens this is drawn
          only where `canAddManualService` allows it, so the fallback below is a
          type guard rather than a state that happens.

          THE NEW ROW IS OPENED IMMEDIATELY. A processor keying in twenty plans
          works one at a time all the way through — type it, terminate it, type
          the next — so the account they just entered is the one they want in
          front of them. Landing them back on whatever was open before would make
          every entry a two-step. */}
      <AddManualServiceDialog
        billing={billing}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(submission) => {
          if (!billing) return;
          const added = addManualService(billing, submission);
          openAccount(added.id);
        }}
      />

      <ClaimsToaster />
    </>
  );
}

/**
 * Nothing left to serve at this stage.
 *
 * TWO DIFFERENT STATES, and they are not the same news. A queue with billings
 * in it that this session has worked past is FINISHED — the work went
 * somewhere, and starting again is a real offer. A queue with nothing in it at
 * all was never yours to do, and a "Start again" there would be a button that
 * reloads an empty list.
 *
 * The stage switch stays, because the way out of an empty queue is the next
 * one along and it should not require leaving the page.
 */
function QueueClear({
  stage,
  worked,
  counts,
  onChangeStage,
  query,
  onQueryChange,
  onSearch,
  onRestart,
  onFranchiseEntry,
}: {
  stage: BillingStage;
  worked: number;
  counts: Record<BillingStage, number>;
  onChangeStage: (stage: BillingStage) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onRestart: () => void;
  onFranchiseEntry: () => void;
}) {
  return (
    <Box maxW="760px">
      {/* THE SEARCH SURVIVES AN EMPTY QUEUE, and it is the one control here
          that has to: a cleared queue is exactly when somebody goes looking for
          a particular chapel they know is in it. */}
      <Box mb={5}>
        <StageSwitch
          active={stage}
          counts={counts}
          onChange={onChangeStage}
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
          onFranchiseEntry={onFranchiseEntry}
        />
      </Box>

      {worked > 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          gap={3}
          py={{ base: 14, md: 24 }}
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
            {BILLING_QUEUE_LABELS[stage]} — queue clear
          </Text>
          <Text fontSize="sm" color="gray.500" maxW="46ch">
            You have worked through all {worked}{" "}
            {worked === 1 ? "billing" : "billings"} waiting here. Pick another
            queue above, or start this one again to walk back through them.
          </Text>
          <Box mt={1}>
            <Box
              as="button"
              onClick={onRestart}
              px={4}
              py={2}
              borderRadius="lg"
              bg={BRAND_COLORS.primaryGreen}
              color="white"
              fontSize="13px"
              fontWeight="600"
              cursor="pointer"
              _hover={{ bg: BRAND_COLORS.darkGreen }}
            >
              Start again
            </Box>
          </Box>
        </Flex>
      ) : (
        <EmptyPanel
          title={`Nothing waiting in ${BILLING_QUEUE_LABELS[stage]}`}
          body="No billing is on this desk right now. Whatever you put through is in the next queue along."
        />
      )}
    </Box>
  );
}
