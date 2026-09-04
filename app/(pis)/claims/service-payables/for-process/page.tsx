"use client";

// The For Process workspace: the chapels waiting to be billed, as an ACCORDION.
//
// THE ROUTE NAMES THE PAGE, NOT THE TERRITORY. It used to be
// `/service-payables/[territoryCode]`, which made the territory part of the
// page's identity — so there was no such thing as "the For Process page", only
// the For Process page OF somewhere, and arriving without having chosen first
// was not expressible. A territory is a FILTER on this screen, and the picker
// changes it without leaving; that is a query parameter's job.
//
// So: `/service-payables/for-process` is the page, and `?territory=BT` is where
// it opens. Both are valid. The dashboard supplies the parameter because the
// user has already chosen by tapping a card; the sidebar and a bare link do not,
// and the page asks.
//
// THE QUEUE IS AN ACCORDION — the 2026-08-24 redesign. The old rail-and-detail
// arrangement kept the chapel list on screen so the user always knew where they
// were in the queue; the accordion keeps the WHOLE QUEUE on screen instead, one
// card per billing, and opening a card unfolds that billing in place. What the
// rail was for — pick, then work what was picked, without losing the list — the
// stack does by never taking the list away.
//
// A RAIL CAME BACK BESIDE IT, and it is not that old one. Nothing is picked
// from it: it holds the module's nav, the territory the stack is scoped to, and
// an index of the codes in it. That is the DASHBOARD's rail, in the same place
// and built from the same shared constants — see the note over `INDEX_IN_RAIL`
// for what moved into it and why.
//
// WHAT DID NOT CHANGE: clicking a plan holder opens their service record
// exactly as before — swapped in as the whole page on a desktop, in a drawer on
// anything narrower — and the billing's Create/Edit action sits with the rows
// it acts on.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Grid, GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../../data";
import { SectionTitle } from "../../components/section-title";
import { ClaimsToaster } from "../../components/toaster";
import {
  formatCSP,
  getBillingsByTerritory,
  getTerritorySummaries,
  servicesOf,
  type BillingStage,
  type ServiceBilling,
  type TerritorySummary,
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
import { BillingAccordionCard } from "../components/BillingAccordionCard";
import { BillingIndex } from "../components/BillingIndex";
import { EmptyPanel } from "../components/EmptyPanel";
import { PlanholderSearchField } from "../components/PlanholderSearchField";
import { ServicePayablesSwapSkeleton } from "../components/ServicePayablesSwapSkeleton";
import { ServiceRecordDrawer } from "../components/ServiceRecordDrawer";
import { ServiceRecordView } from "../components/ServiceRecordView";
import { StageQuickLinks } from "../components/StageQuickLinks";
import { TerritoryCard } from "../components/TerritoryCard";
import { TerritoryPicker } from "../components/TerritoryPicker";

/**
 * The stage this page works. Fixed — it is in the route's own name.
 *
 * The other three stages will want pages of their own, and when they arrive
 * this constant is the only thing that differs between them.
 */
const STAGE: BillingStage = "for-process";

/** The query parameter the territory travels in. */
export const TERRITORY_PARAM = "territory";

/**
 * The line under the title. FIXED, not built from the open territory — a page
 * header is read on arrival and then becomes furniture, and every live figure
 * it could carry is already where it is worked: the territory in the picker,
 * the counts on the roll-up beside it, the money on the cards.
 */
const DESCRIPTION =
  "Chapels waiting to be billed for the services they have rendered.";

/**
 * Narrowest a territory card may be laid out before the grid stops adding
 * columns — the dashboard's figure, because these are the dashboard's cards.
 */
const TERRITORY_CARD_MIN_WIDTH = "300px";

/**
 * How long the swap's placeholder is held, in milliseconds.
 *
 * Long enough to read as a transition and not a flicker, short enough that it is
 * never a wait: the content behind it is already in hand — this is derived from
 * seed data, synchronously — so every millisecond here is one the user is paying
 * for the ANIMATION, not for the page. The plan holder page's figure, because it
 * is the same transition.
 */
const SWAP_MS = 320;

/* -------------------------------- the rail -------------------------------- */

// THE PAGE HAS THE DASHBOARD'S RAIL NOW, and it is the module's shared one —
// `WORKSPACE_GRID` and `WORKSPACE_RAIL`, the same constants every other screen
// here is laid out to — rather than the bespoke 240px index track this page
// had. What that track held was one thing, an index of billing codes, so it
// was sized for that one thing and matched nothing else in the module.
//
// WHAT MOVED INTO IT: the module nav and the territory picker, which were
// stacked loose above the work. Both are the same KIND of thing the dashboard
// keeps in its rail — controls that say what the page is showing, standing
// beside the thing they are showing rather than on top of it — and left above
// the stack they read as page furniture belonging to nothing in particular.
// The rail is where this module puts that, so this page puts it there too.
//
// WHAT STAYED IN THE MAIN COLUMN: the roll-up. It is not a control, it is the
// stack's own total, and a figure describing a list belongs over the list.

// `INDEX_IN_RAIL` USED TO BE DECLARED HERE, along with the two container
// conditions it is built from. It is in `workspace-layout` now — For
// Verification took the accordion and its index on 2026-08-26, so the rule
// holds for two rails and belongs where every other figure both pages share
// does. See it there.

/** Fades content in behind the placeholder rather than cutting to it. */
const SWAP_FADE = {
  "@keyframes servicePayablesSwapIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  animation: "servicePayablesSwapIn 0.22s ease-out",
  // A reader who has asked for less motion gets the content, immediately.
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

export default function ForProcessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeVersion = useServicePayablesStore();

  // Empty is a real state, not a missing one: someone can reach this page from
  // the sidebar without having chosen anything, and the page's job then is to
  // ask rather than to guess a territory on their behalf.
  const territoryCode = searchParams.get(TERRITORY_PARAM) ?? "";

  /* --------------------------- what is being worked --------------------------- */

  // DECLARED UP HERE, ahead of the list itself, because the list is derived from
  // them: which billing stays on the queue after it completes turns on which
  // billing the user is standing inside. Both are the same two facts they always
  // were — see the notes at their old home, further down beside the selection and
  // the record swap — moved rather than changed.

  /**
   * Which billing the OPEN RECORD belongs to. Held by code rather than by
   * index, so a billing that moves in the list does not silently hand the user
   * a different chapel's plan holders. With no record open it is only a
   * remembered default — the accordion itself needs no selection.
   */
  const [selected, setSelected] = useState<string>();

  /**
   * The service whose record is open, held by ID rather than as a snapshot:
   * saving it writes to the store, and looking it up again each render is what
   * lets the view show the result. Null when the stack is what is on screen.
   */
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);

  /**
   * The billing the user is INSIDE — the one whose plan holder record is open —
   * and nothing at all when the stack is what they are looking at.
   *
   * This is the whole of the rule below. It is deliberately not a memory of
   * where they have been: it is only ever the one billing they are in RIGHT
   * NOW, so it empties on its own the moment they step out of it — closing the
   * record, moving to another chapel, changing territory. Nothing has to be
   * cleared, because there is nothing kept.
   */
  const heldCode = openServiceId ? selected : undefined;

  /**
   * The queue, PLUS the billing the user is inside if they have just finished it.
   *
   * Terminating the last plan moves a billing to Processed, and strictly this
   * page lists For Process only — so the moment the processor terminated the
   * last account, its card vanished, the open record was closed under them and
   * they were dropped back on the territory stack mid-thought. Completing the
   * work read as being thrown out of it.
   *
   * So a billing completed UNDER AN OPEN RECORD stays on the page, marked
   * Processed, for as long as the user is still in it — time to walk back
   * through the plan holders and check the billing code and the total before
   * moving on.
   *
   * IT IS HELD BY PRESENCE, NOT BY VISIT (user-confirmed 2026-08-25). It used to
   * be kept until the user left the page, which meant a finished billing sat on
   * the For Process queue behind them while they worked the next chapel, and was
   * still there when they came back to the territory later. A billing that has
   * been processed is not For Process work — it has gone to endorsement — and a
   * queue that lists it invites it to be worked twice. So the moment they step
   * out of it, it is off the list: closing the plan holder info, moving to a
   * different billing code, or loading the territory again.
   *
   * Synchronous (derived, not tracked in an effect) so the billing never leaves
   * the list even for one render while the record is open: an effect-based
   * version would let the record-closing effect below fire in the gap and cause
   * exactly the kick-out this exists to prevent.
   */
  const billings = useMemo(() => {
    if (!territoryCode) return [];
    return getBillingsByTerritory(territoryCode).filter(
      (b) =>
        b.stage === STAGE ||
        (b.stage === "processed" && b.billingCode === heldCode),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territoryCode, storeVersion, heldCode]);

  /* ------------------------------ the stack ------------------------------ */

  /**
   * WHICH CARD IS UNFOLDED — one at a time, or none.
   *
   * A SINGLE CODE, and it was a Set of them until 2026-08-25. The Set let any
   * number of billings stand open at once, on the reasoning that comparing two
   * chapels side by side is half of working a queue. In practice it made the
   * stack unreadable: an open card is a whole table tall, so two or three of
   * them buried every closed head between and below them, and a processor
   * scrolling through what looked like one long list of plan holders could not
   * tell which billing any given row belonged to.
   *
   * So opening a card closes whatever was open. The queue stays a queue —
   * exactly one billing is ever being worked, which is what is actually true —
   * and the index rail beside it is what makes moving between them cheap.
   */
  const [openCode, setOpenCode] = useState<string | null>(null);

  // Open the first card when a territory's list arrives, and again when the
  // list changes underneath the open one — switching territory, or a finished
  // billing dropping off the queue as the user steps out of it. Completing a
  // billing does not close anything while they are still inside it: it is held
  // on the list for exactly that long. While the open card survives, it is left
  // as the user left it, including deliberately closed.
  useEffect(() => {
    setOpenCode((prev) => {
      if (prev && billings.some((b) => b.billingCode === prev)) return prev;
      return billings[0]?.billingCode ?? null;
    });
  }, [billings]);

  /**
   * Fold the card, or unfold it and fold whatever else was open.
   *
   * ALWAYS TRAVELS TO WHAT IT OPENS. With one card open at a time, opening a
   * card below the open one closes a whole table's worth of height ABOVE it, so
   * the head the user just clicked jumps up the page — often clean off the top
   * of the viewport. The scroll puts it back under their eyes. Closing does not
   * scroll: nothing moved above the card, and it is still where they left it.
   */
  const toggleCard = (billingCode: string) => {
    const opening = openCode !== billingCode;
    setOpenCode(opening ? billingCode : null);
    if (opening) setScrollTarget(billingCode);
  };

  /**
   * Each card's element, for the index to scroll to. A ref callback per card
   * keeps the map current as search and completion change what is rendered.
   */
  const cardRefs = useRef(new Map<string, HTMLDivElement>());

  /**
   * The card the index has asked to travel to — consumed by the effect below
   * on the render AFTER the toggle, so the scroll measures a page on which the
   * card has already grown or folded. An opening card grows by a whole table;
   * scrolling to where its head used to be would land short.
   *
   * An EFFECT and not `requestAnimationFrame`, deliberately: rAF is suspended
   * whenever the page is not compositing — a backgrounded tab — and a scroll
   * parked there would fire whenever the frame finally comes, long after the
   * click it belonged to.
   */
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!scrollTarget) return;
    scrollDetailIntoView(cardRefs.current.get(scrollTarget) ?? null);
    setScrollTarget(null);
  }, [scrollTarget]);

  /**
   * The index ROW's click: make this the open card, and travel to it.
   *
   * Always opens, never closes — a click on a name in an index means "take me
   * there", and arriving at a folded head would answer the click with a second
   * click. An already-open card just gets the scroll.
   */
  const revealCard = (billingCode: string) => {
    setOpenCode(billingCode);
    setScrollTarget(billingCode);
  };

  /**
   * The index EYE's click: show this card, or close it where it stands.
   *
   * WHAT IT IS STILL FOR, now that only one card can be open. It used to be for
   * tidying — folding cards away from a stack where several stood open — and
   * that job no longer exists. What is left is the one move the row cannot make:
   * closing the open card WITHOUT opening another, so the whole queue is closed
   * heads and the stack can be read end to end.
   */
  const toggleCardFromIndex = (billingCode: string) => toggleCard(billingCode);

  /**
   * The roll-up beside the picker: what the stack comes to.
   *
   * COUNTED OVER THE WORK STILL WAITING, not over every card — a billing being
   * held on the page while its record is open is done, and folding its money
   * back into "what is owed" would report a queue that never shrinks. It gets
   * its own count instead: at most one, and only while the user is inside it,
   * which on a narrow workspace is what stands behind the drawer.
   */
  const rollup = useMemo(() => {
    const pending = billings.filter((b) => b.stage === STAGE);
    return {
      codes: pending.length,
      services: pending.reduce((t, b) => t + b.services.length, 0),
      totalCSP: pending.reduce((t, b) => t + b.totalCSP, 0),
      processed: billings.length - pending.length,
    };
  }, [billings]);

  /* ---------------------------- the selection ---------------------------- */

  // `selected` itself is declared at the top of the component, with the note on
  // what it is — the list is derived from it now, so it has to exist first.

  // Keep it pointing at something real when the list changes underneath it.
  useEffect(() => {
    if (selected && billings.some((b) => b.billingCode === selected)) return;
    setSelected(billings[0]?.billingCode);
  }, [billings, selected]);

  const billing = billings.find((b) => b.billingCode === selected);

  // Every territory, with the count for this stage — see the note in
  // `TerritoryPicker` on why the empty ones are listed rather than hidden.
  const territoryOptions = useMemo(
    () =>
      db.getTerritories().map((territory) => ({
        territoryCode: territory.territoryCode,
        description: territory.description,
        chapelCount: new Set(
          getBillingsByTerritory(territory.territoryCode, STAGE).map(
            (b) => b.chapelCode,
          ),
        ).size,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  /**
   * The territories with work at this stage, as the dashboard summarises them.
   *
   * Only read when NOTHING has been picked — that is the one time the page has
   * no stack to show and the choice itself is the work.
   */
  const territorySummaries = useMemo(
    () => (territoryCode ? [] : getTerritorySummaries(STAGE)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [territoryCode, storeVersion],
  );

  /**
   * Change territory by changing the URL, not by holding it in state.
   *
   * `replace`, not `push`: the picker is a filter on this page, and a filter
   * should not build a back-button history of itself.
   */
  const changeTerritory = (next: string) =>
    router.replace(
      next
        ? `/claims/service-payables/for-process?${TERRITORY_PARAM}=${encodeURIComponent(next)}`
        : "/claims/service-payables/for-process",
    );

  /**
   * The workspace — the container `useTwoColumn` observes, and the container
   * the record view's own layout queries are asked of. It wraps all three of
   * what the page can show — the skeleton, the record, the stack — so the
   * measurement survives a swap instead of being torn down mid-animation.
   */
  const workspaceRef = useRef<HTMLDivElement>(null);

  /* ------------------------- the record swap ------------------------- */

  /**
   * Whether the workspace is wide enough for the record to take the page.
   * `false` until measured, so the server and the first client render agree.
   */
  const isDesktop = useTwoColumn(workspaceRef);

  // `openServiceId` is declared at the top of the component for the same reason
  // `selected` is: together they say which billing the queue holds open.

  const selectedService = useMemo(
    () =>
      openServiceId && billing
        ? (servicesOf(billing).find((s) => s.id === openServiceId) ?? null)
        : null,
    [openServiceId, billing],
  );

  /**
   * The record shown IN THE PAGE. Desktop only — on a narrow workspace the same
   * tap opens the drawer instead, so this stays null and the stack underneath
   * is what the drawer covers.
   */
  const openService = isDesktop ? selectedService : null;

  // Whether the placeholder is up. The whole page changes at once during a
  // swap, and cutting straight between layouts reads as a flicker, not a move.
  const [swapping, setSwapping] = useState(false);
  const swapTimer = useRef<number | null>(null);

  /**
   * Open a service record, or (with `null`) go back to the stack.
   *
   * The placeholder is only for the DESKTOP swap. On a narrow workspace the
   * same tap opens the drawer: the page underneath does not change, so there is
   * nothing to cover.
   */
  const swapTo = useCallback(
    (serviceId: string | null) => {
      setOpenServiceId(serviceId);
      if (!isDesktop) return;

      setSwapping(true);
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => {
        setSwapping(false);
        swapTimer.current = null;
      }, SWAP_MS);
    },
    [isDesktop],
  );

  /**
   * Whether the record view is up — settled OR arriving.
   *
   * Read off the ID and not the looked-up service, so it is already true during
   * the swap: the page's heading has to be gone before the record lands, or it
   * goes at the end of the animation and reads as a second, later move.
   */
  const recordUp = isDesktop && openServiceId !== null;

  /**
   * A service that leaves the billing under the user closes the record.
   *
   * NOT the last save of a chapel any more: a billing completed under an open
   * record is held on this page for as long as that record is open (see the
   * `billings` rule), so the processor reviews the finished billing on their own
   * time and it leaves the queue when they leave it. What is left for this
   * effect is the genuinely-gone service — a manual row removed, or the list
   * changing under a stale id.
   */
  useEffect(() => {
    if (openServiceId && !selectedService) swapTo(null);
  }, [openServiceId, selectedService, swapTo]);

  // A swap left mid-flight must not call back into a page that is gone.
  useEffect(
    () => () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    },
    [],
  );

  /**
   * Open a plan holder's record from one of the cards. Both writes are one
   * update, so the record and the billing it reads from can never be a frame
   * out of step.
   */
  const openFromCard = (b: ServiceBilling, serviceId: string) => {
    setSelected(b.billingCode);
    swapTo(serviceId);
  };

  /**
   * Move to another plan holder on the same billing — from inside the record.
   * No placeholder: only the main column's contents change.
   */
  const selectService = (serviceId: string) => setOpenServiceId(serviceId);

  /**
   * Move to another chapel without leaving the record.
   *
   * Opens that chapel's first plan holder, because there is no other sensible
   * landing point — leaving the record empty would make the picker look like it
   * had failed.
   */
  const changeChapel = (billingCode: string) => {
    const next = billings.find((b) => b.billingCode === billingCode);
    const first = next ? servicesOf(next)[0] : undefined;
    if (!next || !first) return;
    setSelected(next.billingCode);
    setOpenServiceId(first.id);
  };

  return (
    // A fragment, because the toaster at the bottom cannot live INSIDE
    // `Page.Root` — see the note on `ClaimsToaster`: that component keeps only
    // its tool and main content children and silently drops the rest.
    <>
      {/* `headerButton="back-mobile"`: no back chevron beside the title on a
          desktop, matching the death dashboard — the breadcrumb above it
          already goes back. A phone keeps it, having no breadcrumb. */}
      <Page.Root
        title="For Process"
        description={DESCRIPTION}
        headerButton="back-mobile"
        paddingBottom={PAGE_PADDING_BOTTOM}
        /*
         * The page's own heading, dropped while a record is open.
         *
         * A record REPLACES this page rather than sitting under it, and a title
         * reading "For Process" over a view that has taken its place names the
         * wrong thing. Only the desktop heading is hidden — the MOBILE bar goes
         * on using these props, and a record never opens into this branch
         * there. `of-type` and not `nth-child` — emotion inserts a <style>
         * among these children when the page is rendered on the server.
         */
        css={
          recordUp
            ? { "& > div:nth-of-type(2)": { display: "none" } }
            : undefined
        }
      >
        <Page.MainContent>
          <Page.Row>
            {/* THE WORKSPACE — see `workspaceRef`. It wraps all three branches
                so the measurement is not torn down and retaken across a swap. */}
            <Box ref={workspaceRef} css={WORKSPACE_ROOT}>
              {swapping ? (
                /* Mid-swap. Shaped like the layout ARRIVING, so the real
                   content lands on a shape that is already correct. */
                <ServicePayablesSwapSkeleton
                  target={openServiceId ? "record" : "worklist"}
                />
              ) : openService && billing ? (
                /* A record is open, and this is a desktop — so the page IS the
                   record, exactly as before the redesign: the record view keeps
                   its own two-column shape, chapel picker and all.

                   On a narrow workspace this branch is never taken:
                   `openService` is null there and the drawer below is what is
                   seen. */
                <Box css={SWAP_FADE}>
                  <ServiceRecordView
                    service={openService}
                    billing={billing}
                    billings={billings}
                    onSelectService={selectService}
                    onChangeChapel={changeChapel}
                    onBack={() => swapTo(null)}
                    asPage
                  />
                </Box>
              ) : (
                <Box css={SWAP_FADE}>
                  {/* THE RAIL AND THE WORK — the dashboard's arrangement, and
                      the module's shared one. The grid wraps ALL THREE states
                      the page can be in, not just the stack: the rail carries
                      the territory picker, and a picker that vanished on the
                      branch where nothing is picked would be the one screen
                      where the control cannot be reached. */}
                  <Grid css={WORKSPACE_GRID}>
                    {/* Written FIRST so that stacked — every phone, and every
                        window too narrow for two columns — the rail's contents
                        come above the work, which is the order of the task:
                        choose where you are and what you are looking at, then
                        work it. `order` swaps it to the right once there are
                        two columns. */}
                    <GridItem css={WORKSPACE_RAIL}>
                      {/* THE PLAN HOLDER SEARCH, at the head of the rail.

                          ABOVE THE NAV, which is otherwise the first thing in
                          every rail in this module, because it answers an
                          EARLIER question than any of them: the nav and the
                          picker below it are for a processor working DOWN —
                          this queue, that territory, these billings — and this
                          is for one who already has a name and wants the
                          billing it sits on. Put under the picker it would read
                          as "search within this territory", which is the one
                          reading it is not for.

                          DISPLAY ONLY for now — see
                          `PlanholderSearchField`. */}
                      <PlanholderSearchField />

                      {/* THE MODULE'S NAV, marked at For Process — the same
                          strip the dashboard rail leads with, in the same
                          place, so arriving here from there is a change of
                          contents and not of furniture.

                          HERE AND NOT ONLY ON THE DASHBOARD because this
                          process runs across four pages. A processor who has
                          finished a territory's billings wants For
                          Verification next, and without this the only way
                          there is back out to the dashboard and in again —
                          the module would have no way of moving sideways
                          within itself.

                          Inside this branch, so it goes when a record takes
                          the page — the heading goes with it for the same
                          reason (see `recordUp`): a record is not a queue,
                          and offering to jump queues over an open service
                          record invites a half-filled form to be abandoned by
                          a stray click. */}
                      <Box flexShrink={0} mb={4}>
                        <StageQuickLinks activeStage={STAGE} />
                      </Box>

                      {/* The territory the stack is scoped to. Back at the top
                          of a rail, which is where `TerritoryPicker`'s own
                          note says it belongs: it stands on top of the list it
                          changes. */}
                      <Box flexShrink={0} mb={4}>
                        <TerritoryPicker
                          value={territoryCode}
                          options={territoryOptions}
                          onChange={changeTerritory}
                        />
                      </Box>

                      {/* The queue at a glance while an open card runs long.
                          Only where there is a stack to index, and only where
                          it can sit BESIDE it — see `INDEX_IN_RAIL`. */}
                      {territoryCode && billings.length > 0 && (
                        <Box css={INDEX_IN_RAIL}>
                          <BillingIndex
                            billings={billings}
                            openCode={openCode}
                            onReveal={revealCard}
                            onToggle={toggleCardFromIndex}
                          />
                        </Box>
                      )}
                    </GridItem>

                    <GridItem css={MAIN_COLUMN_TAIL}>
                      {!territoryCode ? (
                        /* Nothing picked, so the CHOICE is the work — made on
                           the same cards the dashboard offers territories
                           with. */
                        <TerritoryChoice
                          summaries={territorySummaries}
                          onOpen={changeTerritory}
                        />
                      ) : billings.length === 0 ? (
                        <EmptyPanel
                          title={`Nothing to process in ${db.getTerritoryName(territoryCode)}`}
                          /* No "above" or "to the right" — the picker is
                             above the work when stacked and beside it when
                             not, and a direction that is wrong on half the
                             widths is worse than none. */
                          body="Every chapel here has been billed. Pick another territory to carry on."
                        />
                      ) : (
                        <>
                          {/* THE ROLL-UP: what the stack comes to. Over the
                              list rather than in the rail — it is not a
                              control, it is this list's own total, and a
                              figure describing a list is read with it. */}
                          <Flex
                            align="baseline"
                            gap={2}
                            mb={3}
                            display={{ base: "none", md: "flex" }}
                          >
                            <Text fontSize="xs" color="gray.500">
                              {rollup.codes}{" "}
                              {rollup.codes === 1
                                ? "billing code"
                                : "billing codes"}
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
                            <Text
                              fontSize="sm"
                              fontWeight="700"
                              color="gray.800"
                            >
                              {formatCSP(rollup.totalCSP)}
                            </Text>
                            {/* The chapels finished this visit, still on the
                                page for a final check — counted apart so the
                                queue's own figures shrink as work is done. */}
                            {rollup.processed > 0 && (
                              <>
                                <Text fontSize="xs" color="gray.300">
                                  ·
                                </Text>
                                <Text
                                  fontSize="xs"
                                  fontWeight="600"
                                  color={BRAND_COLORS.darkGreen}
                                >
                                  {rollup.processed} processed
                                </Text>
                              </>
                            )}
                          </Flex>

                          {/* One card per billing, each unfolding into the
                              billing itself. See `BillingAccordionCard`. */}
                          <Flex direction="column" gap={2.5}>
                            {billings.map((b) => (
                              <Box
                                key={b.billingCode}
                                // The element the index scrolls to — kept
                                // current by the callback as completion
                                // changes what is rendered.
                                ref={(el: HTMLDivElement | null) => {
                                  if (el)
                                    cardRefs.current.set(b.billingCode, el);
                                  else cardRefs.current.delete(b.billingCode);
                                }}
                              >
                                <BillingAccordionCard
                                  billing={b}
                                  open={openCode === b.billingCode}
                                  onToggle={() => toggleCard(b.billingCode)}
                                  // A row of the card's table opens that plan
                                  // holder's record. The page decides what
                                  // that means — a swap here, a drawer on a
                                  // narrow workspace — which is why the card
                                  // hands the service up rather than
                                  // navigating.
                                  onOpenService={(service) =>
                                    openFromCard(b, service.id)
                                  }
                                />
                              </Box>
                            ))}
                          </Flex>
                        </>
                      )}
                    </GridItem>
                  </Grid>
                </Box>
              )}
            </Box>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* For a workspace too narrow for the record to take the page, where it
          has nowhere to go but on top of the stack. `open` is gated on NOT
          being a desktop so the two presentations can never both be up. */}
      <ServiceRecordDrawer
        service={selectedService}
        billing={billing}
        billings={billings}
        onSelectService={selectService}
        onChangeChapel={changeChapel}
        open={!isDesktop && selectedService !== null}
        onClose={() => swapTo(null)}
      />

      {/* Creating a billing or saving a record raises a toast, and the store
          that draws them has to be mounted — OUTSIDE `Page.Root`, which would
          drop it. */}
      <ClaimsToaster />
    </>
  );
}

/**
 * The territory choice, as the page shows it before anything is picked.
 *
 * The dashboard's cards, unchanged and deliberately so: this is the same
 * decision made in the same terms, and a user who arrives here from the sidebar
 * should be choosing from what they would have chosen from had they gone
 * through the dashboard instead.
 */
function TerritoryChoice({
  summaries,
  onOpen,
}: {
  summaries: TerritorySummary[];
  onOpen: (territoryCode: string) => void;
}) {
  const totalCSP = summaries.reduce((sum, t) => sum + t.totalCSP, 0);

  return (
    <Box>
      <SectionTitle
        title="Territories"
        subtitle={
          summaries.length === 0
            ? "Nothing is waiting to be billed"
            : `${summaries.length} ${
                summaries.length === 1 ? "territory" : "territories"
              } with work to bill · ${formatCSP(totalCSP)}`
        }
      />

      {summaries.length === 0 ? (
        <EmptyPanel
          title="Nothing to process"
          body="Every chapel has been billed. The other stages are on the dashboard."
        />
      ) : (
        <SimpleGrid
          gridTemplateColumns={`repeat(auto-fill, minmax(min(${TERRITORY_CARD_MIN_WIDTH}, 100%), 1fr))`}
          gap={3}
        >
          {summaries.map((summary) => (
            <TerritoryCard
              key={summary.territoryCode}
              summary={summary}
              onClick={() => onOpen(summary.territoryCode)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
