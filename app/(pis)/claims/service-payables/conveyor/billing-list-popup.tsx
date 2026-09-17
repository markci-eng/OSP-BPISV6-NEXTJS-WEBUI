"use client";

// ANY LIST OF BILLINGS, over the page — the queue being served, the ones worked
// past, and the ones endorsed out to accounting. One sheet, six tabs.
//
// WHY IT IS NOT SIX CONTROLS IN THE RAIL. The death claim answers the same need
// with `WorkLists`, a card of five rows sitting last in its rail — and that rail
// is sticky but unbounded, where this one is capped at `CONVEYOR_RAIL_MAX` with
// the accounts card as the only thing allowed to shrink. A card of rows here
// would come straight out of the plan holder list a processor is working down.
// So the lists are tabs on the sheet they open, and the rail keeps its height.
//
// IT USED TO BE `BillingQueuePopup`, and the rename is the change: it was handed
// `billingQueue(stage)` and could only ever show the queue on screen. Two things
// were unreachable from anywhere on the page as a result — a billing at another
// stage, and every billing that has been ENDORSED, which `billingQueue` filters
// out by design so the conveyor does not serve it again. The second is the one
// that matters: an endorsed billing is the finished work, it is what a branch
// rings about, and until now this module had no door to it at all.
//
// THE TABS ARE DOCUMENT STATES, THE RAIL'S TABS ARE PILES OF WORK, and the two
// vocabularies are already written down — see `BILLING_STAGE_LABELS` against
// `BILLING_QUEUE_LABELS` in the data layer, which is explicit that one describes
// a billing ("this one has been processed") and the other a queue ("somebody is
// going there to verify it"). So the rail says Verify and this says Processed,
// about the same billings, and neither is a spelling of the other. A second
// filled tab strip saying the four words the rail already says is exactly the
// confusion that note was written to prevent.
//
// THE COUNTS FOLLOW THE SEARCH, AND THAT IS THE POINT OF PUTTING THEM ON TABS.
// Type a billing code you cannot find and the tab strip answers the question you
// actually have — WHICH list is it in — before you click anything. With plain
// totals on the tabs the reader would have to open all six.
//
// THEY DO NOT FOLLOW THE TWO FILTERS, which is the other half of that rule.
// Territory and processor narrow the rows you are looking at; if they moved the
// counts too, a reader who ticked Bicol would see five zeroes and conclude the
// billing is nowhere. What a filter did is shown on the filter's own button,
// which carries the number of things ticked.
//
// THE SEARCH FIELD IS HERE NOW (user, 2026-09-14: "why this does not have a
// search bar to search the results"). It was a prop — the rail's field was where
// the processor had already typed, so re-asking on arrival was the worse of the
// two. That reasoning held while this sheet could only show the queue you typed
// against. It cannot survive tabs: switch to Endorsed and the rail's term is
// stale, and asking again meant closing the dialog, retyping in the rail and
// reopening it.
//
// IT IS STILL ONE QUERY (user, same message: "instead of another search bar").
// The page owns the string and both fields read and write it, so typing here
// updates the rail behind the sheet and arriving from the rail lands pre-filled.
// Two views, one search.
//
// THE ORDER IS THE SAME ON EVERY TAB — oldest first, the module's FIFO rule.
// See `ordered`, which has why, and why the line that used to announce it under
// the search is gone.

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../../data";
import { FilterSelect } from "../../components/filter-select";
import { SearchBar } from "../../components/search-bar";
import { SectionPopup } from "../../components/section-popup";
import { TabPill } from "../../components/tab-pill";
import { EmptyPanel } from "../components/EmptyPanel";
import {
  BILLING_KIND_CODE,
  BILLING_KIND_LABEL,
  BILLING_KIND_TERMS,
  BILLING_STAGES,
  BILLING_STAGE_LABELS,
  billingKind,
  deceasedName,
  formatCSP,
  getServiceBillings,
  periodKey,
  servicesOf,
  type BillingStage,
  type ServiceBilling,
} from "../service-payables-data";
import {
  getCreatedBilling,
  getEndorsedBilling,
  useServicePayablesStore,
} from "../service-payables-store";
// `isLongWait` and `waitingFor` came out with the per-row wait (2026-09-17).
// They still rank this list — see `stageSince` below, which is the same figure
// the sort is made of — the row simply no longer prints it.
import { stageSince } from "./billing-queue";

/**
 * Which list of billings is on show.
 *
 * THE FOUR STAGES, PLUS THE TWO THE STAGES CANNOT NAME:
 *
 *   all       every billing this module knows of, at any stage. The one list
 *             that always has an answer, which is why it leads — the death
 *             claim's "All claims" is first in its card for the same reason.
 *   endorsed  gone to accounting. Not a fifth `BillingStage` — the model has
 *             four and accounting's own desk is not described — so it is read
 *             off the endorsement signature, exactly as `billingQueue` reads it
 *             to keep an endorsed billing from being served twice.
 */
export type BillingScope = "all" | BillingStage | "endorsed";

export const BILLING_SCOPES: BillingScope[] = [
  "all",
  ...BILLING_STAGES,
  "endorsed",
];

/** The tab's word. See the note at the top on why these are not the queue's. */
const SCOPE_LABEL: Record<BillingScope, string> = {
  all: "All",
  ...BILLING_STAGE_LABELS,
  endorsed: "Endorsed",
};

/**
 * What the sheet is called while a scope is on — the dialog's label for a
 * screen reader, and the phrase the page quotes back on the read-only bar when
 * a billing is opened out of one of these lists.
 */
export const scopeTitle = (scope: BillingScope): string =>
  scope === "all" ? "All billings" : `${SCOPE_LABEL[scope]} billings`;

/**
 * WHEN THE BILLING WAS FILED — the one date that means the same thing whatever
 * state it is in, and the key the mixed lists are ordered by.
 *
 * `cisUploadDate` IS THE FILE DATE. It is written on the `TblClaimsBilling` row
 * when the billing is put through, and unlike the two signature dates beside it
 * it never changes again — so a billing verified last week and approved
 * yesterday still reports the day it was filed. That is what makes it sortable
 * across a list holding billings at five different states, where `stageSince`
 * deliberately answers a different question per stage.
 *
 * THE FALLBACK IS THE PERIOD'S END, not today. A billing with no row has not
 * been filed, and the last thing that actually happened to it is the close of
 * the week it covers — the same fallback `stageSince` makes, for the same
 * reason. Read together they mean a For Process billing sorts by its period and
 * everything past it by the day it was filed, which is the order they arrived at
 * this desk in either way.
 *
 * READ FROM THE STORE FIRST. A billing raised or numbered this session has its
 * row there and nowhere else; asking the seed alone would file everything the
 * processor did today under its period instead.
 */
function fileDate(billing: ServiceBilling): string {
  return (
    getCreatedBilling(billing.billingCode)?.cisUploadDate ||
    db.getClaimsBillingByCode(billing.billingCode)?.cisUploadDate ||
    stageSince(billing)
  );
}

/**
 * The amber this module marks a franchise in — the chip on a billing card, the
 * count on a territory card, and the identifier on a row here. Restated rather
 * than imported for the reason `TerritoryCard` and `TerritoryDataTable` restate
 * it: it is not a brand colour and has no home in `BRAND_COLORS`.
 */
const FRANCHISE_ACCENT = "#b45309";

/**
 * The row the conveyor is serving — the one billing in this list that is already
 * open behind the sheet.
 *
 * THE GREEN WASH THIS MODULE HOVERS AND SELECTS WITH, which the document rows,
 * the chapel rows and the deficiency rows already use. It replaced `#F0F9F3`
 * when the "on screen" label was removed and the colour became the only thing
 * saying which row it is.
 *
 * THE EDGE IS AN INSET SHADOW AND NOT A BORDER, so the row does not grow by two
 * pixels and shove its neighbours along when it becomes the served one.
 */
const SERVED_BG = "#eaf5ee";
const SERVED_EDGE = "#bfe0cb";

/**
 * HOW FAR DOWN A BILLING SOMEBODY GOT — the mark on a row whose accounts are
 * part terminated (user, 2026-09-17: "how do you think we can make this table
 * show that the billing number has already have terminated accounts. since
 * sometime processor don't finish terminating all the account in the billing").
 *
 * IT SPEAKS ONLY WHEN THERE IS SOMETHING TO SAY, which is the whole design. A
 * fraction on every row would be a column reading "0 of 5" forty times, and the
 * reader would have to find the handful that are not zero inside it. Drawn only
 * where the count is BETWEEN nothing and everything, the mark IS the answer: a
 * row carrying one is a billing somebody started and left.
 *
 * THE TWO ENDS CANNOT APPEAR HERE ANYWAY, which is what makes that cheap. None
 * terminated is the ordinary state of a For Process billing and says nothing
 * about a processor; ALL terminated is not a For Process billing at all — that
 * is the completion rule, and the billing has moved to Processed by the time it
 * is true. So the only figure worth printing is the one in between.
 *
 * WHY A FRACTION AND NOT A BAR. At this size a bar is a two-pixel smudge that
 * needs a number beside it to be read, and the number on its own is smaller and
 * exact. "2 of 5" also says how much is LEFT, which is what a processor picking
 * up somebody's half-done billing actually wants.
 *
 * AMBER, AND NOT THE MODULE'S GREEN. Green would read as progress made; this is
 * work outstanding — the same thing the franchise chip and the deficiency rows
 * mean by it — and the row it marks is the one to go back to.
 */
const PARTIAL_ACCENT = "#b45309";

/** `undefined` unless the billing is part-terminated — see {@link PARTIAL_ACCENT}. */
function partialProgress(billing: ServiceBilling): string | undefined {
  const done = billing.terminatedCount;
  const total = billing.services.length;
  if (done <= 0 || done >= total) return undefined;
  return `${done} of ${total} terminated`;
}

/* It moved under the amount on 2026-09-17 and stopped being a chip when it did
 * — see the note where it is drawn. `PARTIAL_ACCENT` is still what colours it,
 * and still amber for the same reason: this is work outstanding. */

/** Endorsed billings are out of every stage list — see {@link inScope}. */
const isEndorsed = (billing: ServiceBilling) =>
  Boolean(getEndorsedBilling(billing.billingCode));

/**
 * The billings of one list, unsorted.
 *
 * A STAGE LIST EXCLUDES THE ENDORSED, and that is not tidying. An endorsed
 * billing is still `approved` on the model — endorsement writes a signature, not
 * a fifth stage — so without this every endorsed billing would appear on two
 * tabs at once, with the Approved tab counting work that has left the building.
 */
function inScope(
  billings: ServiceBilling[],
  scope: BillingScope,
): ServiceBilling[] {
  if (scope === "all") return billings;
  if (scope === "endorsed") return billings.filter(isEndorsed);
  return billings.filter(
    (billing) => billing.stage === scope && !isEndorsed(billing),
  );
}

/**
 * The list, oldest first.
 *
 * EVERY TAB IS OLDEST-FIRST (user, 2026-09-15: "make the order by file date or
 * audit date. which is the oldest would be always in the top which we keep the
 * rules FIFO"). One rule across six lists, and it is the module's own rule
 * rather than a new one — the conveyor has always served the longest wait first,
 * and these lists are how that queue is read.
 *
 * IT USED TO BE STATED UNDER THE SEARCH, in a line that also counted the rows;
 * both came out on 2026-09-17 as redundant — the count is on the tab, and one
 * order across every tab is not news worth a line of its own. The rule lives
 * here, where it is enforced.
 *
 * WHAT CHANGED AND WHAT DID NOT, when it was made one rule. The four STAGE tabs
 * were already oldest-first, ordered by the date the billing entered that stage,
 * and they still are: that comparator has to stay identical to `billingQueue`'s
 * or the For Process tab would describe a different queue from the one the page
 * is serving. The two mixed lists are what moved:
 *
 *   ALL       was "newest period first" — the source order, kept because no
 *             single date meant the same thing at five different states. The
 *             FILE DATE does: see {@link fileDate}. Now oldest first.
 *   ENDORSED  was newest signature first, on the reasoning that the last thing
 *             this desk did is the thing most likely to be asked about. That
 *             reasoning is overturned rather than forgotten — one order
 *             everywhere is worth more than each list being separately clever,
 *             and the search box is how a reader reaches a particular endorsed
 *             billing anyway.
 */
function ordered(
  billings: ServiceBilling[],
  scope: BillingScope,
): ServiceBilling[] {
  // EVERY TAB PUTS THE OLDEST AT THE TOP — see the note above. Ties broken
  // by the code throughout, so the order is stable between store writes: on a
  // sheet a processor is reading down, a row that swapped places with its
  // neighbour because something unrelated was saved is the worst kind of bug to
  // be asked about.
  const oldestFirst = (
    key: (billing: ServiceBilling) => string,
  ): ServiceBilling[] =>
    [...billings].sort((a, b) => {
      const byDate = key(a).localeCompare(key(b));
      return byDate !== 0 ? byDate : a.billingCode.localeCompare(b.billingCode);
    });

  // ALL IS ORDERED BY THE FILE DATE, which is the one date that means the same
  // thing at every state. It used to keep the source order — newest period
  // first — because no such date had been identified; see {@link fileDate}.
  if (scope === "all") return oldestFirst(fileDate);

  // ENDORSED BY ITS SIGNATURE, oldest first. It was newest first until
  // 2026-09-15; the note above says what that traded away.
  if (scope === "endorsed") {
    return oldestFirst(
      (billing) => getEndorsedBilling(billing.billingCode)?.dateVerified ?? "",
    );
  }

  // The queue's order, and deliberately the same comparator as `billingQueue`:
  // the For Process tab and the For Process conveyor must agree about which
  // billing is at the head, or the list is describing a different queue from
  // the one the page is serving.
  return [...billings].sort((a, b) => {
    const since = stageSince(a).localeCompare(stageSince(b));
    return since !== 0 ? since : a.billingCode.localeCompare(b.billingCode);
  });
}

/**
 * Whether a billing answers what was typed.
 *
 * FIVE FIELDS, IN THE ORDER THEY COST. The three on the billing are a string
 * compare; the plan number and the deceased mean walking its accounts, so they
 * are asked last and only when the cheap three have already failed.
 *
 * THE LAST TWO ARE WHY THIS IS WORTH WIDENING. A caller does not ring with a
 * billing code — they ring with a name, or the plan number off a contract, and
 * before this the only way to answer was to know which chapel buried them.
 */
function matches(billing: ServiceBilling, needle: string): boolean {
  if (
    [
      billing.billingCode,
      billing.billingNo ?? "",
      billing.chapelDesc,
      // WHO RUNS THE CHAPEL, SEARCHABLE (user, 2026-09-15: "add an identifier
      // for franchisee and own chapel. it is also searchable"). Matched against
      // every word for it rather than only the one the chip prints — see
      // `BILLING_KIND_TERMS` — so "franchise", "franchisee", "FR" and "paper"
      // all find the same rows.
      //
      // IN THE CHEAP GROUP because it is a string on the billing, like the three
      // above it: the two expensive fields below still walk the accounts.
      BILLING_KIND_TERMS[billingKind(billing)],
    ]
      .join(" ")
      .toUpperCase()
      .includes(needle)
  ) {
    return true;
  }
  return servicesOf(billing).some(
    (service) =>
      service.lpaNo.toUpperCase().includes(needle) ||
      deceasedName(service).toUpperCase().includes(needle),
  );
}

/** What a row says about itself on a tab that mixes states. */
const statusOf = (billing: ServiceBilling): string =>
  isEndorsed(billing) ? "Endorsed" : BILLING_STAGE_LABELS[billing.stage];

export interface BillingListPopupProps {
  open: boolean;
  onClose: () => void;
  /** Which list is showing. Held by the page — see {@link BillingScope}. */
  scope: BillingScope;
  onScopeChange: (scope: BillingScope) => void;
  /** The one on the conveyor now — marked, not hidden. */
  servedCode?: string;
  /** The page's one query, shown here and in the rail. */
  query: string;
  onQueryChange: (value: string) => void;
  /**
   * Open a billing, and say which list it came out of — the page needs the
   * second half to tell a reader why a billing it cannot act on is on screen.
   */
  onOpenBilling: (billing: ServiceBilling, from: string) => void;
}

export function BillingListPopup({
  open,
  onClose,
  scope,
  onScopeChange,
  servedCode,
  query,
  onQueryChange,
  onOpenBilling,
}: BillingListPopupProps) {
  // Endorsing a billing moves it between two of these tabs, so the sheet reads
  // the store itself rather than trusting a parent's render to be the thing
  // that refreshes it.
  const version = useServicePayablesStore();

  /**
   * WHAT THE TWO FILTERS ARE NARROWING BY — v1's own pickers, as multi-selects.
   *
   * HELD HERE AND NOT BY THE PAGE, unlike the search text. The query is half of
   * a gesture that starts in the rail's field; these begin and end inside this
   * dialog.
   */
  const [territories, setTerritories] = useState<string[]>([]);
  const [processors, setProcessors] = useState<string[]>([]);
  /**
   * THE CUT (user, 2026-09-17: "add a filter for a period"), held as
   * {@link periodKey} strings rather than labels — two periods can never print
   * the same words, but a key is what the value IS and the label is how it
   * happens to be written.
   */
  const [periods, setPeriods] = useState<string[]>([]);

  /**
   * CLOSING THE DIALOG CLEARS THEM — and so does CHANGING TAB.
   *
   * A filter that outlives the sitting it was set in is the way this pattern
   * misleads: the queue moves under it, so a processor who ticked Bicol on
   * Monday opens the list on Tuesday, sees four rows where there are nineteen,
   * and has no reason to suspect the filters.
   *
   * The tab is the same argument at a smaller scale, and it is the one this
   * component would have got wrong: the options are read off the list on show,
   * so a territory ticked on For Process may not exist on Endorsed at all —
   * leaving the reader on an empty tab, with a filter offering nothing that
   * would fill it.
   */
  useEffect(() => {
    setTerritories([]);
    setProcessors([]);
    setPeriods([]);
  }, [open, scope]);

  const universe = useMemo(
    () => getServiceBillings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const needle = query.trim().toUpperCase();

  /**
   * The query applied ONCE, across every billing there is — so the six tab
   * counts below are six filters of one array rather than six passes over the
   * whole file. `getServiceBillings` rebuilds its groups on every call, which
   * is the other reason nothing here calls it in a loop.
   */
  const searched = useMemo(
    () => (needle ? universe.filter((b) => matches(b, needle)) : universe),
    [universe, needle],
  );

  /** The tab strip's numbers — the query, not the filters. See the top of file. */
  const counts = useMemo(() => {
    const out = {} as Record<BillingScope, number>;
    for (const key of BILLING_SCOPES) out[key] = inScope(searched, key).length;
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, version]);

  /** This tab's billings, before the filters — what the filters may offer. */
  const listed = useMemo(
    () => ordered(inScope(searched, scope), scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, scope, version],
  );

  /**
   * The options, taken from THE LIST ON SHOW rather than from the reference
   * tables.
   *
   * A filter should only ever offer what it can find. Listing every territory
   * in the country against a tab holding four of them is a menu that is mostly
   * dead ends — and on the processor side there is no table to list anyway: who
   * worked a billing is a name on the row.
   */
  const territoryOptions = useMemo(() => {
    const codes = [...new Set(listed.map((b) => b.territoryCode))]
      .filter(Boolean)
      .sort();
    return codes.map((code) => ({
      value: code,
      label: db.getTerritoryName(code) || code,
    }));
  }, [listed]);

  /**
   * The cuts this list actually holds, OLDEST FIRST.
   *
   * THE SAME ORDER AS THE ROWS, which is what stops the menu and the list
   * disagreeing about which end of the file is the top. A billing period is the
   * one filter here whose options have a natural order, and picking a different
   * one for the menu would mean a reader scanning down the list and down the
   * menu is travelling through time in opposite directions.
   *
   * KEYED, LABELLED IN WORDS. `periodKey` sorts chronologically as a string —
   * that is what it is for — and `periodLabel` is already on the billing, so
   * the menu says "JUNE 1-7, 2026" and the filter matches on `20260601`.
   */
  const periodOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const billing of listed) {
      const key = periodKey(billing.period);
      if (!seen.has(key)) seen.set(key, billing.periodLabel);
    }
    return [...seen.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }, [listed]);

  const processorOptions = useMemo(() => {
    // A BILLING MAY HAVE NO PROCESSOR YET — For Process is where one is put
    // through, so the rows waiting there carry no name. Those are not an
    // option; they are the rows a processor filter cannot speak about, and
    // ticking any name correctly excludes them.
    const names = [
      ...new Set(listed.map((b) => b.processedBy).filter(Boolean)),
    ].sort() as string[];
    return names.map((name) => ({ value: name, label: name }));
  }, [listed]);

  // EVERY CONDITION NARROWS THE LAST, which is what a reader expects of a
  // toolbar: the tab, then the text, then the period, then the territory, then
  // the staff member. An empty group is not a condition — it means the question
  // was not asked.
  const rows = listed.filter((billing) => {
    if (periods.length && !periods.includes(periodKey(billing.period))) {
      return false;
    }
    if (territories.length && !territories.includes(billing.territoryCode)) {
      return false;
    }
    if (
      processors.length &&
      !(billing.processedBy && processors.includes(billing.processedBy))
    ) {
      return false;
    }
    return true;
  });

  /** Whether anything is being narrowed — what the empty state has to explain. */
  const filtered =
    periods.length > 0 || territories.length > 0 || processors.length > 0;

  /** Stage tabs report a wait; the mixed ones report what the billing IS. */
  const showsWait = scope !== "all" && scope !== "endorsed";

  return (
    <SectionPopup
      title={scopeTitle(scope)}
      open={open}
      onClose={onClose}
      // WIDE ENOUGH FOR THE ROW. Two identifiers, a chapel, a period, a
      // territory and a name on the left; the money and the state on the right.
      // The sheet is still capped by the screen, so a narrow window gets a
      // narrow sheet.
      maxW="1100px"
      header={
        <Box>
          {/* THE SIX LISTS. A strip that SCROLLS rather than wraps: inside a
              dialog header a second row of tabs pushes the search down on
              exactly the narrow screens that have least height to give, and a
              tab strip is a thing the hand already expects to swipe. */}
          <Flex
            gap={1.5}
            overflowX="auto"
            pb="2px"
            role="tablist"
            aria-label="Billing lists"
            css={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {BILLING_SCOPES.map((key) => (
              <TabPill
                key={key}
                label={SCOPE_LABEL[key]}
                count={counts[key]}
                active={key === scope}
                onClick={() => onScopeChange(key)}
              />
            ))}
          </Flex>

          {/* THE FIELD AND THE TWO FILTERS ON ONE ROW, under the tabs that
              scope the list: what narrows stands together, below what chooses.

              TWO NAMED CONTROLS RATHER THAN ONE FUNNEL (user, 2026-09-14:
              "since it is wide we can remove it in the filter button and have
              dedicated [controls] in here"). The funnel exists because the
              claims TABLE's toolbar is full — a type dropdown, a branch
              dropdown, a view toggle and a search box — and three more labelled
              controls there is a row that wraps. This sheet is 1100px carrying a
              search field and nothing else, so the reason does not apply, and
              what the collapse costs is the words: behind an icon, "Territory"
              is a heading nobody reads until they open a panel they had no
              reason to open. See `FilterSelect`.

              NO MAGNIFIER BUTTON ON THE FIELD. The rail's has one because that
              search GOES somewhere — it opens this sheet. Here the rows narrow
              as the query is typed, so a button would be a control that visibly
              does nothing. See `onSearch` on `SearchBar`.

              IT WRAPS RATHER THAN SQUEEZES. On a phone the sheet is the screen
              less 24px, where a field and two dropdowns cannot share a line; the
              field keeps a floor of 200px and the filters drop beneath it. */}
          <Flex gap={2} mt={2.5} align="center" wrap="wrap">
            <SearchBar
              size="sm"
              flex="1"
              minW="200px"
              value={query}
              onChange={onQueryChange}
              label="Search billings"
              // THE IDENTIFIER IS IN THE LIST because a placeholder is where a
              // reader finds out what a search box will answer, and "franchise"
              // is not a thing anyone would guess a billing search accepts. It
              // costs one word and it is the newest of the six fields.
              placeholder="Billing code, no., chapel, franchise, plan no. or deceased"
            />
            {/* FIRST OF THE THREE, because it is the one a processor reaches
                for most: a payable is chased by the cut it belongs to — "what
                is still open from the first week of June" — where territory and
                processor answer questions about WHO rather than WHEN.

                It is also the only one whose options are a sequence, so it sits
                where the eye starts rather than at the end of a row of
                unordered menus. */}
            <FilterSelect
              label="Period"
              options={periodOptions}
              selected={periods}
              onChange={setPeriods}
              emptyNote="No billing in this list carries a period."
            />
            {/* Filtered by CODE and listed by NAME — the billing carries the
                code, and the reference table is the only place the name it is
                called by is written down. */}
            <FilterSelect
              label="Territory"
              options={territoryOptions}
              selected={territories}
              onChange={setTerritories}
              emptyNote="No billing in this list carries a territory."
            />
            {/* Filtered and listed by the same string: who put a billing
                through is a name on the row and nothing else. */}
            <FilterSelect
              label="Processor"
              options={processorOptions}
              selected={processors}
              onChange={setProcessors}
              // THE ORDINARY CASE ON FOR PROCESS, and it is not a fault: a
              // billing waiting to be put through has nobody's name on it yet.
              emptyNote="No billing in this list has been put through by anyone yet."
            />
          </Flex>

          {/* NO COUNT LINE (user, 2026-09-17: "remove the number of billings
              and the longest wait first. it is redundant"), and both halves of
              it were.

              THE COUNT IS ON THE TAB the reader just pressed, and that number
              follows the search, so "23 billings" under a pill reading
              "For Process 23" was the same figure twice, eighteen pixels apart.

              THE ORDER STOPPED BEING NEWS when every tab became oldest-first on
              2026-09-15. It was written when the six lists were sorted three
              different ways and the sentence changed as you moved between them.
              One rule everywhere does not need restating per tab — it is on
              `ordered`, which is what enforces it.

              THE TWO FILTERS STILL ANNOUNCE THEMSELVES, which is what this line
              was doing that nothing else did: `FilterSelect` carries the number
              of things ticked on its own button, so a narrowed list is still
              accounted for. */}
        </Box>
      }
    >
      <Box>
        {rows.length === 0 ? (
          <EmptyPanel
            title="Nothing matches"
            // THE EMPTY STATE NAMES THE CAUSE, and now it has three to choose
            // between. A reader who has emptied a list must not be told the
            // list is empty when what is actually true is that they narrowed
            // it — and with six tabs there is a third case the queue pop-up
            // never had: the search found nothing HERE, and the tab strip above
            // is already saying where it did find something.
            body={
              filtered
                ? "No billing in this list matches the filters set above. Clear them to see the rest."
                : needle
                  ? "No billing in this list carries that code, number, chapel, kind of chapel, plan number or name. The counts on the tabs above say which list does."
                  : "There is no billing in this list."
            }
          />
        ) : (
          <Flex direction="column" gap={1}>
            {rows.map((billing) => {
              const served = billing.billingCode === servedCode;
              const kind = billingKind(billing);
              const partial = partialProgress(billing);
              return (
                <Flex
                  as="button"
                  key={billing.billingCode}
                  align="center"
                  gap={4}
                  textAlign="left"
                  px={3}
                  py={2.5}
                  borderRadius="lg"
                  cursor="pointer"
                  // THE ROW ON SCREEN SAYS SO BY ITS COLOUR (user, 2026-09-17:
                  // "make the bg color of the onscreen different"), which is
                  // what pays for the "on screen" label being gone.
                  //
                  // IT HAD TO GET STRONGER TO DO THAT JOB. It was #F0F9F3 — a
                  // wash two shades off white, which was legible as "this one"
                  // only because a line of text underneath was also saying it.
                  // Alone it has to carry the fact on its own, so it is the
                  // module's own tint with an edge in the brand green: the row
                  // is picked out whether the reader is scanning the numbers or
                  // the amounts.
                  bg={served ? SERVED_BG : "transparent"}
                  boxShadow={served ? `inset 0 0 0 1px ${SERVED_EDGE}` : undefined}
                  transition="background 0.12s ease"
                  _hover={served ? undefined : { bg: BRAND_COLORS.subtleBg }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: BRAND_COLORS.primaryGreen,
                    outlineOffset: "-2px",
                  }}
                  onClick={() => onOpenBilling(billing, scopeTitle(scope))}
                >
                  <Box flex="1" minW={0}>
                    <Flex align="center" gap={2} minW={0}>
                      <Text
                        fontSize="13px"
                        fontWeight="600"
                        fontFamily="mono"
                        color="gray.800"
                        truncate
                      >
                        {/* THE BILLING NUMBER LEADS, ALWAYS (user, 2026-09-17:
                            "show the billing number instead of the billing
                            code"). It used to be `billingNo ?? billingCode`,
                            which reads as one column and is two: a reader
                            scanning down the list met a number, then a code,
                            then a number, with nothing saying why they were
                            different kinds of string.

                            THE DASH SHOULD NEVER BE SEEN NOW. Every
                            chapel-period is numbered in the seed, so the
                            fallback is for a billing raised in a session with
                            no number yet — and if one ever shows here, "not
                            issued" is the honest thing for it to say rather
                            than a gap. */}
                        {billing.billingNo ?? "—"}
                      </Text>

                      {/* THE PERIOD, BESIDE THE NUMBER (user, 2026-09-17:
                          "place the period beside the billing number then the
                          terminated is below the total CSP like a book").

                          THE TWO TOGETHER ARE THE BILLING'S NAME. A billing IS
                          a chapel and a cut — the number is the key it was
                          issued under, the period is what it covers — so the
                          identifier line now carries the whole of what a
                          processor would say out loud to name this row. It was
                          under the amount before, where it qualified the money
                          rather than the billing.

                          LIGHTER THAN THE NUMBER on purpose. Two facts of equal
                          weight side by side make a line with no beginning; the
                          number leads and the period follows it. */}
                      <Text
                        flexShrink={0}
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.500"
                        letterSpacing="0.01em"
                      >
                        {billing.periodLabel}
                      </Text>

                      {/* WHO RUNS THE CHAPEL (user, 2026-09-15). Beside the
                          number rather than down in the grey line, because it is
                          not another attribute of the billing — it says which
                          PROCESS produced it, and that changes what the reader
                          should expect of everything else on the row: a paper
                          franchise's accounts were typed in by hand and its
                          identifier is a number where every other row's may be a
                          code.

                          ONLY WHERE THERE IS SOMETHING TO SAY. A company-owned
                          chapel is the ordinary case — most of this file — and a
                          chip on every row saying "ordinary" is a column of
                          noise that makes the two that matter harder to see. The
                          word is still searchable; see `BILLING_KIND_TERMS`.

                          THE MODULE'S FRANCHISE AMBER, which is where this
                          colour genuinely belongs: it marks a FACT about the
                          chapel here, as it does on the territory card and the
                          billing card. It was wrong on a button, which is what
                          those became the kit's green for. */}
                      {kind !== "owned" && (
                        <Text
                          flexShrink={0}
                          fontSize="9.5px"
                          fontWeight="700"
                          letterSpacing="0.04em"
                          textTransform="uppercase"
                          color={FRANCHISE_ACCENT}
                          borderWidth="1px"
                          borderColor="#e7d3b5"
                          bg="#fdf6ec"
                          borderRadius="sm"
                          px={1.5}
                          py="1px"
                          title={`${BILLING_KIND_LABEL[kind]} — RefMortuary class ${BILLING_KIND_CODE[kind]}`}
                        >
                          {BILLING_KIND_LABEL[kind]}
                        </Text>
                      )}

                    </Flex>
                    {/* JOINED FROM WHAT IS ACTUALLY THERE, rather than written
                        out with separators between fixed slots. A paper
                        franchise is billed to a MORTUARY, and a franchise
                        mortuary's own chapel often does not resolve — one row in
                        `RefMortuary` has none at all — so the territory is
                        legitimately empty and the hand-written "· ·" left a
                        dangling separator in the middle of the line.

                        NO BILLING CODE (user, 2026-09-17: "remove the billing
                        code in the details"). It stood at the head of this line
                        for an hour, put there when the number took the line
                        above. Every billing in the file is numbered now, so the
                        code is no longer the thing that identifies a row to a
                        reader — it is a derived key, and one whose chapel and
                        period are spelled out in words beside it anyway. The
                        SEARCH still matches it, which is where a code is
                        actually used: typed in, not read off.

                        THE PERIOD HAS GONE TOO, up beside the number, where the
                        two of them name the billing between them.

                        TERRITORY BEFORE CHAPEL (user, 2026-09-17: "territory
                        first"). It reads as an address now — the wide thing
                        first, then the place inside it — and it puts the word
                        the Territory filter above is named after at the start
                        of every line, where a column of them can be scanned
                        without reading past a chapel name to reach it. */}
                    <Text
                      mt={0.5}
                      fontSize="11.5px"
                      color="gray.500"
                      lineHeight="1.4"
                    >
                      {[
                        db.getTerritoryName(billing.territoryCode) ||
                          billing.territoryCode,
                        billing.chapelDesc,
                        billing.processedBy,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </Box>

                  <Box flexShrink={0} textAlign="right">
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      fontVariantNumeric="tabular-nums"
                      color="gray.800"
                    >
                      {formatCSP(billing.totalCSP)}
                    </Text>
                    {/* HOW FAR DOWN IT SOMEBODY GOT, under the money (user,
                        2026-09-17: "the terminated is below the total csp like
                        a book"). The two belong together: the amount is what
                        the chapel is owed for the whole billing, and this is
                        how much of it has actually been posted — the figure and
                        its progress, one under the other.

                        IT READS AS TEXT RATHER THAN AS A CHIP now that it has
                        left the identifier line. Up there it had to hold its own
                        beside the FRANCHISE chip and needed a border to do it;
                        here it is the second line of a two-line figure, and a
                        boxed word would be the only framed thing in the column.

                        SILENT ALMOST ALWAYS — see {@link partialProgress}. What
                        stands here on an untouched billing is nothing at all,
                        which is why the amount does not look lonely: most rows
                        are one line on this side.

                        NO WAIT, AND NO "ON SCREEN". The days ranked a list that
                        is already SORTED by them — see `ordered` — so the number
                        was restating the order it had just been put in, row
                        after row. The served row says it is the served row by
                        its own colour; see the row's background.

                        THE STATE SURVIVES ON THE MIXED TABS, and only there. On
                        All and Endorsed the rows are at different stages and
                        nothing else on the row says which, so "Processed" is
                        the one thing a reader cannot work out for themselves.
                        On a stage tab every row is at the same stage as the tab
                        they clicked, and printing it per row would be the tab's
                        own name repeated fifty times. */}
                    {partial && (
                      <Text
                        mt={0.5}
                        fontSize="10.5px"
                        fontWeight="600"
                        color={PARTIAL_ACCENT}
                        title="Some accounts on this billing are terminated and some are not — it was started and not finished."
                      >
                        {partial}
                      </Text>
                    )}

                    {!showsWait && (
                      <Text mt="1px" fontSize="10.5px" color="gray.400">
                        {statusOf(billing)}
                      </Text>
                    )}
                  </Box>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Box>
    </SectionPopup>
  );
}

export default BillingListPopup;
