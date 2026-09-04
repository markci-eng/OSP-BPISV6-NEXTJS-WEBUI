"use client";

// A QUEUE CUT BY STAFF, as a workspace: what one member of staff put through,
// and the plans under whichever of their billings is picked.
//
// TWO PAGES ARE THIS COMPONENT — For Verification and For Approval — and that is
// why it exists (user, 2026-08-27: "the design is the same as for-verification").
// They are the same screen twice: same two columns, same bounded sticky rail,
// same stack of accordion cards, same record swap, same stacked order below
// `xl`. What differs is the STAGE they read, the words in the header, and the
// one act at the foot of a card. Everything else was going to be a copy, and a
// copy of a page this long is a page that drifts.
//
// WHAT EACH PAGE STILL OWNS is its route file and the props below — see
// `for-verification/page.tsx`, which is now four lines and a note.
//
// NAMED FOR THE QUEUE, NOT THE STAGE. The route was `/processed-billing` and the
// page was titled "Processed Billings", after the stage a billing here IS. Both
// now say For Verification, after what the pile is WAITING FOR — which is the
// name the nav, the dashboard tabs and the processor use for it. The stage keeps
// its own name where a billing is described: `BillingStage` is still `processed`,
// and the chip on a row still reads Processed. See `BILLING_QUEUE_LABELS` for
// why the two vocabularies are both right, and {@link ProcessorWorkspaceProps.stage}
// for the offset that follows from it.
//
// IT IS AN ACCORDION, which is the rest of "same screen as For Process" being
// true. The two pages had the same COLUMNS and not the same SHAPE: For Process
// had moved to a stack of cards that unfold in place, while this one still kept
// its billings in a rail list and drew the picked one in the column opposite. So
// a reader arriving from the queue they had just worked found the same content
// arranged a different way, and "read down the billings" meant a
// click-and-look-across here against a click-and-read-on there.
//
// What that buys is what it bought For Process: the WHOLE queue stays on screen,
// one card per billing, and opening one unfolds that billing where it stands
// rather than in a second column. The rail keeps the module's nav and the staff
// picker, and gains the same index of what is in the stack — see `BillingIndex`.
//
// THE BILLING NUMBER LEADS HERE, and that is the one deliberate difference from
// For Process's stack (user-confirmed 2026-08-26). Every billing at these stages
// has been created, so every one of them HAS a number, and the number is what it
// is quoted by everywhere outside this module — the voucher, the email, the
// phone call. On For Process the code leads instead, because most of that queue
// has no number to lead with. Both cards carry both; `lead` says which is the
// title and which is the line beneath it.
//
// WHAT DIFFERS FROM FOR PROCESS IS WHAT THE RAIL PICKS BY. That page is cut by
// TERRITORY, because work not yet done is found the way the old screen made you
// find it: pick a territory, then a chapel inside it. A billing past it has
// already been found — it carries a number and every plan under it is terminated
// — so where it sits has stopped being the question, and the fact worth carrying
// is who put it through. That is the same cut the dashboard makes on these
// stages ("Processed by"), so arriving from one of those cards lands on a list
// already grouped the way it was chosen. See `isProcessorStage`.
//
// NOTHING HERE CREATES. There is no Create Billing in the rail's foot and no way
// to make a service record from the table: the billing exists and its plans are
// terminated. What a card CAN do is the queue's own act, and only that — see
// {@link ProcessorWorkspaceProps.action}.
//
// The route names the PAGE and the person rides along in `?processor=`, exactly
// as the territory does on For Process — arriving without one is a real state,
// and the page asks rather than guessing a colleague on the user's behalf.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Grid, GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { SectionTitle } from "../../components/section-title";
import { ClaimsToaster } from "../../components/toaster";
import {
  BILLING_STAGE_ROUTES,
  formatCSP,
  getBillingsByProcessor,
  getProcessorOptions,
  getProcessorSummaries,
  servicesOf,
  type BillingStage,
  type ProcessorSummary,
} from "../service-payables-data";
import { useServicePayablesStore } from "../service-payables-store";
import {
  INDEX_IN_RAIL,
  MAIN_COLUMN_TAIL,
  PAGE_PADDING_BOTTOM,
  WORKSPACE_GRID,
  WORKSPACE_RAIL,
  WORKSPACE_ROOT,
  scrollDetailIntoView,
} from "../workspace-layout";
import { useTwoColumn } from "../use-two-column";
import { useApproveBillings } from "../use-verify-accounts";
import { BillingAccordionCard } from "./BillingAccordionCard";
import { BillingIndex } from "./BillingIndex";
import { EmptyPanel } from "./EmptyPanel";
import { PlanholderSearchField } from "./PlanholderSearchField";
import { ProcessorCard } from "./ProcessorCard";
import { ProcessorPicker } from "./ProcessorPicker";
import { ServiceRecordDrawer } from "./ServiceRecordDrawer";
import { ServiceRecordView } from "./ServiceRecordView";
import { StageQuickLinks } from "./StageQuickLinks";

/** The query parameter the staff member travels in. */
export const PROCESSOR_PARAM = "processor";

/**
 * Narrowest a processor card may be laid out before the grid stops adding
 * columns — the dashboard's figure, because these are the dashboard's cards.
 */
const PROCESSOR_CARD_MIN_WIDTH = "300px";

/** Fades the main column in when what it is showing changes wholesale. */
const FADE_IN = {
  "@keyframes processorWorkspaceFadeIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  animation: "processorWorkspaceFadeIn 0.22s ease-out",
  // A reader who has asked for less motion gets the content, immediately.
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

export interface ProcessorWorkspaceProps {
  /**
   * The stage whose billings this queue holds — which is ONE BEHIND the queue's
   * own name. A billing sitting in For Verification is `processed`; one sitting
   * in For Approval is `verified`. That offset is the whole of the note on
   * `BILLING_QUEUE_LABELS`, and this prop is where it lands.
   */
  stage: BillingStage;
  /** The page's title — the queue's name, not the stage's. */
  title: string;
  /**
   * The line under it. FIXED per page, not built from whoever is open — the For
   * Process page's rule, for the reason given there: a page header is read on
   * arrival and then becomes furniture, and every live figure it could carry is
   * already where it is worked.
   */
  description: string;
  /**
   * THE QUEUE'S ONE ACT, handed to every card and to the record behind a row.
   *
   *   `"verify"`   For Verification. Accounts are read one at a time and signed
   *                off, then the billing itself is. Rows carry tick boxes.
   *   `"approve"`  For Approval. The reading is done — what is left is a
   *                judgement on the BILLING, so there is nothing to tick and no
   *                tick boxes are drawn.
   *   `"endorse"`  For Endorsement. The approval card WITHOUT its button, until
   *                the endorsement's own act is described (user, 2026-08-27:
   *                "we will tweak later the buttons and process"). The reading
   *                is the whole of the screen for now — the same rows, the same
   *                record, the same print. When the act arrives it is a hook and
   *                a button in the two places `approve` already has them: the
   *                foot of `BillingAccordionCard` and `RecordActions`, plus the
   *                batch on `BillingIndex` below if it is done in bulk.
   *
   * See `BillingAccordionCard`, which owns what each one draws.
   */
  action: "verify" | "approve" | "endorse";
  /**
   * What the choice screen's heading says these billings are waiting for —
   * "awaiting verification", "awaiting approval". A queue is named by what has
   * to happen to it next, and this is that phrase in the one place the page
   * says it in a sentence.
   */
  awaiting: string;
}

export function ProcessorWorkspace({
  stage,
  title,
  description,
  action,
  awaiting,
}: ProcessorWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeVersion = useServicePayablesStore();

  // Empty is a real state, not a missing one: someone can reach this page from
  // the dashboard's tab strip or a bare link without having chosen anybody.
  const processor = searchParams.get(PROCESSOR_PARAM) ?? "";

  // Everything is re-read on a store write: signing the last account of a
  // billing one stage back moves it INTO this stage, under the name of whoever
  // processed it — so a list on this page can gain a row without this page
  // acting.
  const billings = useMemo(
    () => (processor ? getBillingsByProcessor(processor, stage) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processor, stage, storeVersion],
  );

  /**
   * WHICH CARD IS UNFOLDED — one at a time, or none.
   *
   * Held by BILLING CODE and not by billing number, even though the number is
   * what the card leads with. The code is the key every other part of this
   * module identifies a billing by — `BillingIndex`, the card refs, For
   * Process's own accordion — and a second key here would be a second thing to
   * keep in step for no gain the user can see.
   *
   * One at a time, for the reason the For Process stack is: an open card is a
   * whole table tall, so two of them bury every closed head between and below,
   * and a reader scrolling what looks like one long list of plan holders cannot
   * tell which billing any given row belongs to.
   */
  const [openCode, setOpenCode] = useState<string | null>(null);

  // Open the first card when a staff member's list arrives, and again when the
  // list changes underneath the open one — switching staff, or a billing moving
  // on to the next queue. While the open card survives, it is left as the user
  // left it, including deliberately closed.
  useEffect(() => {
    setOpenCode((prev) => {
      if (prev && billings.some((b) => b.billingCode === prev)) return prev;
      return billings[0]?.billingCode ?? null;
    });
  }, [billings]);

  /**
   * Each card's element, for the index to scroll to. A ref callback per card
   * keeps the map current as the staff filter changes what is rendered.
   */
  const cardRefs = useRef(new Map<string, HTMLDivElement>());

  /**
   * The card the index has asked to travel to — consumed by the effect below on
   * the render AFTER the toggle, so the scroll measures a page on which the
   * card has already grown or folded. For Process's arrangement, and its note
   * has the whole of why this is an effect rather than a `requestAnimationFrame`.
   */
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!scrollTarget) return;
    scrollDetailIntoView(cardRefs.current.get(scrollTarget) ?? null);
    setScrollTarget(null);
  }, [scrollTarget]);

  /**
   * Fold the card, or unfold it and fold whatever else was open.
   *
   * ALWAYS TRAVELS TO WHAT IT OPENS. With one card open at a time, opening a
   * card below the open one closes a whole table's worth of height ABOVE it, so
   * the head just clicked jumps up the page — often clean off the top of the
   * viewport. Closing does not scroll: nothing moved above the card.
   */
  const toggleCard = (billingCode: string) => {
    const opening = openCode !== billingCode;
    setOpenCode(opening ? billingCode : null);
    if (opening) setScrollTarget(billingCode);
  };

  /** The index ROW's click: make this the open card, and travel to it. */
  const revealCard = (billingCode: string) => {
    setOpenCode(billingCode);
    setScrollTarget(billingCode);
  };

  /* --------------------------- the batch, ticked --------------------------- */

  /**
   * THE BILLINGS TICKED IN THE RAIL, for the queues that act in bulk.
   *
   * Held here rather than in `BillingIndex` because the index is a list and the
   * PAGE is what owns what is being worked on — the same reason `openCode` is
   * here. It is also what lets a batch survive the index being unmounted, which
   * it is on a narrow layout.
   */
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const approveBillings = useApproveBillings();

  // Anything that leaves the queue leaves the selection with it — approving a
  // billing from its own card while others are ticked, or the list changing
  // under a staff switch. A tick on a billing that is no longer here would be
  // counted by the bar and dropped by the write, which is the shape of a control
  // people learn to distrust.
  useEffect(() => {
    setSelectedCodes((prev) => {
      const live = prev.filter((code) =>
        billings.some((b) => b.billingCode === code),
      );
      return live.length === prev.length ? prev : live;
    });
  }, [billings]);

  /** Put through everything ticked, then empty the rail. */
  const approveSelected = async () => {
    const picked = billings.filter((b) => selectedCodes.includes(b.billingCode));
    if (await approveBillings(picked)) setSelectedCodes([]);
  };

  /* ------------------------- the record, opened ------------------------- */

  // A ROW OPENS THE ACCOUNT'S RECORD (user, 2026-08-26). The rows were inert
  // here — the reasoning being that a processed plan is already terminated, so
  // the form behind it has nothing left to do. That was right about the FORM and
  // wrong about the reader: checking an account means reading what was put
  // through against the chapel's paperwork, and everything that needs is on the
  // record — the plan holder, the dates, the CSP and the credit of service, the
  // notes, the documents.
  //
  // NOTHING HAD TO BE MADE READ-ONLY. `ServiceRecordView` locks itself against a
  // terminated plan already (`isServiceTerminated` → `locked`): the fields go
  // read-only and the commit is withheld with the reason under it. Every account
  // on these queues is terminated by definition, so the record opens locked
  // without this page saying a word about it. The documents section stays live,
  // which is the same deliberate exception it makes on For Process — a
  // deficiency is chased after the fact.

  /**
   * Which billing the OPEN RECORD belongs to, and which service. The For Process
   * page's pair, and held the same way: by code and by id rather than as
   * snapshots, so a list that changes underneath cannot hand the reader a
   * different chapel's account.
   */
  const [openBillingCode, setOpenBillingCode] = useState<string>();
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);

  const openBilling = billings.find((b) => b.billingCode === openBillingCode);

  const openRecord = useMemo(
    () =>
      openServiceId && openBilling
        ? (servicesOf(openBilling).find((s) => s.id === openServiceId) ?? null)
        : null,
    [openServiceId, openBilling],
  );

  /**
   * The roll-up over the stack: what this staff member has waiting here.
   *
   * No "done" count opposite it, unlike For Process's — there, that figure
   * separates the billing finished under an open record from the ones still
   * waiting. Every billing here is at the same stage, so the same split would be
   * the whole list against nothing.
   */
  const rollup = useMemo(
    () => ({
      codes: billings.length,
      services: billings.reduce((t, b) => t + b.services.length, 0),
      totalCSP: billings.reduce((t, b) => t + b.totalCSP, 0),
    }),
    [billings],
  );

  // Everyone, including whoever has nothing at this stage — see
  // `getProcessorOptions`, and the same rule on the territory picker.
  const processorOptions = useMemo(
    () => getProcessorOptions(stage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, storeVersion],
  );

  /** This queue's own route — where the staff filter is written back to. */
  const route = BILLING_STAGE_ROUTES[stage];

  /**
   * NOTHING LEFT UNDER THE CHOSEN STAFF — so the page goes back to the choice
   * (user, 2026-08-27).
   *
   * IT USED TO BE A DEAD END. Working a staff member's pile to the bottom — the
   * ordinary and desirable outcome — left a panel reading "Nothing here under
   * GRACE T. FERNANDEZ" over an empty column, and the only way on was the picker
   * two controls up the rail. The screen answered a job finished by saying
   * nothing was there, which is true and useless: what somebody who has just
   * cleared a pile wants is the next pile.
   *
   * A DERIVATION AND A URL CORRECTION, in that order and not the other way
   * round. The page RENDERS the choice the moment the list empties — see where
   * this is read below — and the effect writes `?processor=` out of the address
   * afterwards. Waiting for the URL would show the empty panel for the frames in
   * between, which is the flash of a dead end on the way past it.
   *
   * `replace`, matching the picker: emptying a pile is not a place to come back
   * to with the browser's Back.
   */
  const nothingHere = Boolean(processor) && billings.length === 0;

  useEffect(() => {
    if (nothingHere) router.replace(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nothingHere, route]);

  /** Whether the main column is the staff CHOICE rather than a stack. */
  const choosing = !processor || nothingHere;

  /**
   * The staff with work at this stage, as the dashboard summarises them.
   *
   * Only read when NOBODY is open — that is the one time the main column has no
   * billing to show and the choice itself is the work. Which is also why these
   * are the dashboard's summaries and not {@link processorOptions}: the picker
   * lists everyone including the empty ones, because it has to be able to say
   * "that one is empty", while a CARD offering a person with nothing under them
   * is a door onto an empty room.
   */
  const processorSummaries = useMemo(
    () => (choosing ? getProcessorSummaries(stage) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [choosing, stage, storeVersion],
  );

  /**
   * Change staff by changing the URL, not by holding it in state.
   *
   * `replace`, not `push`: the picker is a filter on this page, and a filter
   * should not build a back-button history of itself. Back goes where the user
   * came from — the dashboard — rather than through everyone they looked at on
   * the way.
   */
  const changeProcessor = (next: string) =>
    router.replace(
      next ? `${route}?${PROCESSOR_PARAM}=${encodeURIComponent(next)}` : route,
    );

  /** The workspace — what the two-column split is measured against. */
  const workspaceRef = useRef<HTMLDivElement>(null);

  /**
   * Whether the workspace is wide enough for the record to TAKE the page.
   * `false` until measured, so the server and first client render agree.
   */
  const isDesktop = useTwoColumn(workspaceRef);

  /** The record shown IN THE PAGE. Desktop only — narrower gets the drawer. */
  const pageRecord = isDesktop ? openRecord : null;

  /** Whether the record view is up — used to drop the page's own heading. */
  const recordUp = isDesktop && openServiceId !== null;

  /**
   * Open an account's record from a card, or (with `null`) go back to the stack.
   *
   * NO SWAP PLACEHOLDER, where For Process holds one for ~320ms. That skeleton
   * covers a page whose BOTH columns change at once — the rail there is a
   * territory picker and the record's is a chapel picker over plan holders. It
   * is the same change here, so the same argument would apply; what differs is
   * that this is a reading rather than a sitting of work, and the fade the page
   * already runs on every processor change is enough to say the page moved. If
   * this ever reads as a cut rather than a move, `ServicePayablesSwapSkeleton`
   * is the thing to reach for and For Process is the worked example.
   */
  const openFromCard = (billingCode: string, serviceId: string) => {
    setOpenBillingCode(billingCode);
    setOpenServiceId(serviceId);
  };

  /** Move to another account on the same billing — from inside the record. */
  const selectService = (serviceId: string) => setOpenServiceId(serviceId);

  /**
   * Move to another chapel without leaving the record, landing on its first
   * account — there is no other sensible landing point, and an empty record
   * would make the picker look as though it had failed.
   */
  const changeChapel = (billingCode: string) => {
    const next = billings.find((b) => b.billingCode === billingCode);
    const first = next ? servicesOf(next)[0] : undefined;
    if (!next || !first) return;
    setOpenBillingCode(next.billingCode);
    setOpenServiceId(first.id);
  };

  const closeRecord = () => setOpenServiceId(null);

  // An account that leaves the billing under the reader closes the record —
  // signing the billing off moves it on and off this queue.
  useEffect(() => {
    if (openServiceId && !openRecord) setOpenServiceId(null);
  }, [openServiceId, openRecord]);

  return (
    // A fragment, because the toaster at the bottom cannot live INSIDE
    // `Page.Root` — that component keeps only its tool and main content children
    // and silently drops the rest. See `ClaimsToaster`.
    <>
      {/* `headerButton="back-mobile"`: no back chevron beside the title on a
          desktop, matching the rest of this module — the breadcrumb above it
          already goes back. A phone keeps it, having no breadcrumb to replace
          it. */}
      <Page.Root
        title={title}
        description={description}
        headerButton="back-mobile"
        paddingBottom={PAGE_PADDING_BOTTOM}
        /*
         * The page's own heading, dropped while a record is open — For Process's
         * rule and its reasoning: a record REPLACES this page rather than sitting
         * under it, and a title naming the queue over a view that has taken its
         * place names the wrong thing. Desktop only; the MOBILE bar goes on using
         * these props, and a record never opens into this branch there.
         */
        css={
          recordUp ? { "& > div:nth-of-type(2)": { display: "none" } } : undefined
        }
      >
        <Page.MainContent>
          <Page.Row>
            {/* THE WORKSPACE, and what the two-column split is measured against
                — see the note at the top of `workspace-layout`. */}
            <Box ref={workspaceRef} css={WORKSPACE_ROOT}>
              {pageRecord && openBilling ? (
                /* A record is open on a desktop, so the page IS the record — the
                   same swap For Process makes, into the same view, which locks
                   itself because every plan on these queues is terminated. */
                <Box css={FADE_IN}>
                  <ServiceRecordView
                    service={pageRecord}
                    billing={openBilling}
                    billings={billings}
                    onSelectService={selectService}
                    onChangeChapel={changeChapel}
                    onBack={closeRecord}
                    asPage
                    /* THE RECORD ENDS IN THE QUEUE'S OWN ACT, not in Terminate
                       (user, 2026-08-27). Every plan on these queues is
                       terminated, so the commit at the foot of the rail was a
                       greyed-out "Terminated" — accurate, and useless on a
                       screen opened in order to act. See `RecordActions`. */
                    action={action}
                    /* AND THE PICKER NAMES BILLINGS BY NUMBER, as the cards
                       behind it do — the same `lead` this page hands the stack
                       and the index. Without it a reader opened B26004004 and
                       found BACOLO4MAY26 in the picker at the top of the rail. */
                    lead="number"
                    /* AND BACK GOES TO THE STAFF, not to a territory. This queue
                       is cut by whoever put the billings through — it is what
                       the rail picks by and what the URL carries — so the stack
                       behind this record is theirs. */
                    backTo={processor}
                  />
                </Box>
              ) : (
                <Grid css={WORKSPACE_GRID}>
                  {/* Written FIRST so that stacked it comes above the plans: the
                      order of the task is choose the queue, pick a staff, pick a
                      billing, read what it covers. `order` swaps it to the right
                      on a wide screen. */}
                  <GridItem css={WORKSPACE_RAIL}>
                    {/* THE PLAN HOLDER SEARCH, at the head of the rail — the same
                        field in the same place as the dashboard's and For
                        Process's, so a name is looked up from one spot wherever
                        in the module you happen to be standing.

                        ABOVE THE NAV for the reason it is there: everything below
                        it narrows by a CUT of the queue — which stage, whose
                        billings — and this one is for arriving with a name and no
                        idea which cut it falls in. That gap is widest here,
                        because this rail's own list is billings by STAFF, so a
                        plan holder is two levels down from anything the column
                        offers.

                        DISPLAY ONLY for now — see `PlanholderSearchField`. */}
                    <PlanholderSearchField />

                    {/* THE MODULE'S NAV, marked at this stage — the same strip
                        the dashboard and For Process lead their rails with, in
                        the same place, so moving between the four pages is a
                        change of contents and not of furniture.

                        IT LEADS THE RAIL, above the staff picker, because it
                        answers the earlier question. The picker says which
                        staff's billings you are reading; the nav says which of
                        the four queues you are reading at all. Without it the
                        only way on was back out to the dashboard and in again,
                        which made this page a dead end rather than a stop on a
                        run of four. */}
                    <Box mb={4} flexShrink={0}>
                      <StageQuickLinks activeStage={stage} />
                    </Box>

                    <Box mb={4} flexShrink={0}>
                      <ProcessorPicker
                        value={processor}
                        options={processorOptions}
                        onChange={changeProcessor}
                      />
                    </Box>

                    {/* THE STACK AT A GLANCE while an open card runs long — For
                        Process's index, leading with the BILLING NUMBER because
                        that is what the cards beside it lead with. Only where
                        there is a stack to index, and only where it can sit
                        BESIDE it: see `INDEX_IN_RAIL`, which is also the one item
                        in this column allowed to shrink. */}
                    {processor && billings.length > 0 && (
                      <Box css={INDEX_IN_RAIL}>
                        <BillingIndex
                          billings={billings}
                          openCode={openCode}
                          onReveal={revealCard}
                          onToggle={toggleCard}
                          lead="number"
                          /* THE BATCH LIVES ON THIS LIST, and only where the
                             queue acts in bulk. For Verification does not: its
                             work is per ACCOUNT, and a tick against a whole
                             billing there would offer to sign accounts nobody
                             has read. For Approval does — see the note on
                             `selection`. For Endorsement does not YET: ticking
                             billings for an act that has not been described
                             would be a control that gathers a batch and has
                             nowhere to send it. */
                          selection={
                            action === "approve"
                              ? {
                                  selected: selectedCodes,
                                  onChange: setSelectedCodes,
                                  actionLabel: (count) =>
                                    `Approve ${count} ${
                                      count === 1 ? "billing" : "billings"
                                    }`,
                                  onAction: () => void approveSelected(),
                                }
                              : undefined
                          }
                        />
                      </Box>
                    )}
                  </GridItem>

                  <GridItem css={MAIN_COLUMN_TAIL}>
                    <Box css={FADE_IN} key={choosing ? "none" : processor}>
                      {choosing ? (
                        /* Nobody picked — or nobody LEFT to pick, the pile
                           having just been cleared (see `nothingHere`). Either
                           way the CHOICE is the work, and it is made here, in
                           the column the work is done in, on the same cards the
                           dashboard offers staff with. They carry what a name is
                           chosen by: how many billings, and how far they reach.

                           THE EMPTY PANEL THAT USED TO STAND HERE IS GONE with
                           the dead end it described. "Nothing here under GRACE
                           T. FERNANDEZ" was a true sentence with nothing to do
                           after it; the list of who still has work is the same
                           answer with somewhere to go. */
                        <ProcessorChoice
                          summaries={processorSummaries}
                          awaiting={awaiting}
                          onOpen={changeProcessor}
                        />
                      ) : (
                        <>
                          {/* THE ROLL-UP: what the stack comes to. Over the list
                              rather than in the rail — it is not a control, it is
                              this list's own total, and a figure describing a
                              list is read with it. For Process's row, to the
                              value. */}
                          <Flex
                            align="baseline"
                            gap={2}
                            mb={3}
                            display={{ base: "none", md: "flex" }}
                          >
                            <Text fontSize="xs" color="gray.500">
                              {rollup.codes}{" "}
                              {rollup.codes === 1 ? "billing" : "billings"}
                            </Text>
                            <Text fontSize="xs" color="gray.300">
                              ·
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {rollup.services}{" "}
                              {rollup.services === 1 ? "service" : "services"}
                            </Text>
                            <Text fontSize="xs" color="gray.300">
                              ·
                            </Text>
                            <Text fontSize="sm" fontWeight="700" color="gray.800">
                              {formatCSP(rollup.totalCSP)}
                            </Text>
                          </Flex>

                          {/* One card per billing, each unfolding into the
                              billing itself. A row opens that account's record:
                              the card hands the service up rather than
                              navigating, because only the page knows whether that
                              is a swap here or a drawer on something narrower. */}
                          <Flex direction="column" gap={2.5}>
                            {billings.map((b) => (
                              <Box
                                key={b.billingCode}
                                ref={(el: HTMLDivElement | null) => {
                                  if (el) cardRefs.current.set(b.billingCode, el);
                                  else cardRefs.current.delete(b.billingCode);
                                }}
                              >
                                <BillingAccordionCard
                                  billing={b}
                                  open={openCode === b.billingCode}
                                  onToggle={() => toggleCard(b.billingCode)}
                                  lead="number"
                                  action={action}
                                  onOpenService={(service) =>
                                    openFromCard(b.billingCode, service.id)
                                  }
                                />
                              </Box>
                            ))}
                          </Flex>
                        </>
                      )}
                    </Box>
                  </GridItem>
                </Grid>
              )}
            </Box>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* For a workspace too narrow for the record to take the page, where it has
          nowhere to go but on top of the stack. `open` is gated on NOT being a
          desktop so the two presentations can never both be up. */}
      <ServiceRecordDrawer
        service={openRecord}
        billing={openBilling}
        billings={billings}
        onSelectService={selectService}
        onChangeChapel={changeChapel}
        open={!isDesktop && openRecord !== null}
        onClose={closeRecord}
        /* The same act and the same identifier the page's own record carries —
           see them there. */
        action={action}
        lead="number"
      />

      {/* Signing raises a toast, and the store that draws them has to be mounted
          — OUTSIDE `Page.Root`, which would drop it. */}
      <ClaimsToaster />
    </>
  );
}

/**
 * The staff choice, as the main column shows it before anybody is picked.
 *
 * The dashboard's cards, unchanged and deliberately so: this is the same
 * decision made in the same terms, and a user who arrives here from the sidebar
 * should be choosing from what they would have chosen from had they come
 * through the dashboard instead.
 *
 * It leads with a heading rather than starting straight into cards, because the
 * page's own title names the QUEUE and something has to say that these are the
 * people who PROCESSED what is waiting in it, and that pressing one opens
 * theirs. The heading carries more weight since the titles stopped saying
 * "processed" themselves: it is now the only thing on the page naming what the
 * cards are cut by.
 */
function ProcessorChoice({
  summaries,
  awaiting,
  onOpen,
}: {
  summaries: ProcessorSummary[];
  awaiting: string;
  onOpen: (processor: string) => void;
}) {
  const totalCSP = summaries.reduce((sum, p) => sum + p.totalCSP, 0);
  const billingCount = summaries.reduce((sum, p) => sum + p.billingCount, 0);

  return (
    <Box>
      <SectionTitle
        title="Processed by"
        subtitle={
          summaries.length === 0
            ? "Nothing has been put through yet"
            : // "staff" is its own plural, which is half of why the word was
              // worth using here — the count reads the same either way.
              `${summaries.length} staff · ${billingCount} ${
                billingCount === 1 ? "billing" : "billings"
              } ${awaiting} · ${formatCSP(totalCSP)}`
        }
      />

      {summaries.length === 0 ? (
        <EmptyPanel
          title="Nothing here yet"
          body="No billing has reached this stage. The other stages are on the dashboard."
        />
      ) : (
        <SimpleGrid
          gridTemplateColumns={`repeat(auto-fill, minmax(min(${PROCESSOR_CARD_MIN_WIDTH}, 100%), 1fr))`}
          gap={3}
        >
          {summaries.map((summary) => (
            <ProcessorCard
              key={summary.processor}
              summary={summary}
              onClick={() => onOpen(summary.processor)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default ProcessorWorkspace;
