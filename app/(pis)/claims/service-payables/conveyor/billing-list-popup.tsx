"use client";

// ANY LIST OF BILLINGS, over the page — the queue being served and the ones
// worked past. One sheet, five tabs (All and the four stages; the Endorsed tab
// went on 2026-09-30, when approval began endorsing on its own).
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
import { Box, Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../../data";
import { FilterSelect } from "../../components/filter-select";
import { SearchBar } from "../../components/search-bar";
import { SegmentedTabs } from "../../components/segmented-tabs";
import { alignHeadersRight } from "../../components/table-align";
import {
  QueueSearchSheet,
  SheetChoiceGroup,
} from "../../components/queue-search-sheet";
import { ListPopup } from "../../components/section-popup";
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
  useServicePayablesStore,
} from "../service-payables-store";
// `isLongWait` and `waitingFor` came out with the per-row wait (2026-09-17).
// They still rank this list — see `stageSince` below, which is the same figure
// the sort is made of — the row simply no longer prints it.
import { stageSince } from "./billing-queue";

/**
 * Which list of billings is on show — the four stages, and `all`: every billing
 * this module knows of, at any stage. The one list that always has an answer,
 * which is why it leads.
 *
 * NO ENDORSED TAB (user, 2026-09-30). Approval endorses on its own now, so an
 * endorsed billing is simply an approved one and lives under Approved.
 */
export type BillingScope = "all" | BillingStage;

export const BILLING_SCOPES: BillingScope[] = ["all", ...BILLING_STAGES];

/**
 * The tab's word. See the note at the top on why these are not the queue's.
 *
 * EXCEPT PROCESSED (user, 2026-10-01: "change the processed into for
 * verification"). The tab reads For Verification; the chip on a row still
 * says Processed, because that one describes the billing.
 */
const SCOPE_LABEL: Record<BillingScope, string> = {
  all: "All",
  ...BILLING_STAGE_LABELS,
  processed: "For Verification",
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

/**
 * The billings of one list, unsorted.
 *
 * An endorsed billing is `approved` on the model — endorsement writes a
 * signature, not a fifth stage — and with approval endorsing on its own it is
 * listed under Approved like any other.
 */
function inScope(
  billings: ServiceBilling[],
  scope: BillingScope,
): ServiceBilling[] {
  if (scope === "all") return billings;
  return billings.filter((billing) => billing.stage === scope);
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

/**
 * WHO RUNS THE CHAPEL, as a filter (user, 2026-10-05: "we need to add a filter
 * for chapel own and franchisee"). Two choices and All, not the three
 * `BillingKind`s: Franchisee takes both franchises, on the system and on paper
 * — the reader's question is "theirs or ours", and the paper kind still shows
 * on its row's chip.
 */
type OwnerFilter = "all" | "own" | "franchisee";

const OWNER_LABEL: Record<OwnerFilter, string> = {
  all: "All",
  // "Own" AND NOT "Own chapel" (user, 2026-10-05: "just Own is enough").
  own: "Own",
  franchisee: "Franchisee",
};

function ownedBy(billing: ServiceBilling, owner: OwnerFilter): boolean {
  if (owner === "all") return true;
  return (billingKind(billing) === "owned") === (owner === "own");
}

/** What a row says about itself on a tab that mixes states. */
const statusOf = (billing: ServiceBilling): string =>
  BILLING_STAGE_LABELS[billing.stage];

/**
 * The FRANCHISE mark beside a chapel — the phone row's and the PC table's.
 *
 * ONLY WHERE THERE IS SOMETHING TO SAY. A company-owned chapel is the ordinary
 * case — most of this file — and a chip on every row saying "ordinary" is a
 * column of noise that makes the few that matter harder to see. The word is
 * still searchable; see `BILLING_KIND_TERMS`.
 *
 * THE MODULE'S FRANCHISE AMBER: it marks a FACT about the chapel here, as it
 * does on the territory card and the billing card.
 */
function KindChip({ billing }: { billing: ServiceBilling }) {
  const kind = billingKind(billing);
  if (kind === "owned") return null;
  return (
    <Text
      as="span"
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
  );
}

/**
 * Under the money: how far down the billing somebody got (see
 * {@link partialProgress}), and on a tab that mixes states, which state it is
 * in. Both silent almost always. Shared by the phone row and the PC table.
 */
function AmountNotes({
  billing,
  showStatus,
}: {
  billing: ServiceBilling;
  showStatus: boolean;
}) {
  const partial = partialProgress(billing);
  return (
    <>
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
      {showStatus && (
        <Text mt="1px" fontSize="10.5px" color="gray.400">
          {statusOf(billing)}
        </Text>
      )}
    </>
  );
}

/**
 * One billing on the PHONE's sheet (redesigned 2026-10-05, option A of the
 * mock-up). Three lines where it had two: the number and period, then the
 * chapel with its franchise mark, then the territory. Territory and chapel
 * used to share a grey line that wrapped mid-name on a phone.
 *
 * The PC dialog is a table now — see `billingColumns`.
 */
function BillingRow({
  billing,
  served,
  showStatus,
  onClick,
}: {
  billing: ServiceBilling;
  /** The one on the conveyor now — washed green, see `SERVED_BG`. */
  served: boolean;
  /** The state under the money — only on a tab that mixes states. */
  showStatus: boolean;
  onClick: () => void;
}) {
  const territory =
    db.getTerritoryName(billing.territoryCode) || billing.territoryCode;
  return (
    <Flex
      as="button"
      align="flex-start"
      gap={3}
      textAlign="left"
      px={3}
      py={2.5}
      borderRadius="lg"
      cursor="pointer"
      bg={served ? SERVED_BG : "white"}
      borderWidth="1px"
      borderColor={served ? SERVED_EDGE : "gray.100"}
      transition="background 0.12s ease"
      _hover={served ? undefined : { bg: BRAND_COLORS.subtleBg }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "-2px",
      }}
      onClick={onClick}
    >
      <Box flex="1" minW={0}>
        {/* The number never shrinks (user, 2026-09-30: "billing number is
            important"); the period follows it, lighter. */}
        <Flex align="baseline" columnGap={2} wrap="wrap">
          <Text
            fontSize="13.5px"
            fontWeight="700"
            fontFamily="mono"
            color="gray.800"
            flexShrink={0}
          >
            {billing.billingNo ?? "—"}
          </Text>
          <Text
            fontSize="11px"
            fontWeight="600"
            color="gray.500"
            letterSpacing="0.01em"
            whiteSpace="nowrap"
          >
            {billing.periodLabel}
          </Text>
        </Flex>

        <Flex mt={1} align="center" gap={2} minW={0}>
          <Text
            fontSize="13px"
            fontWeight="600"
            color="gray.700"
            minW={0}
            truncate
          >
            {billing.chapelDesc}
          </Text>
          <KindChip billing={billing} />
        </Flex>

        <Text mt="1px" fontSize="11.5px" color="gray.400" truncate>
          {[territory, billing.processedBy].filter(Boolean).join(" · ")}
        </Text>
      </Box>

      <Box flexShrink={0} textAlign="right">
        <Text
          fontSize="13.5px"
          fontWeight="700"
          fontVariantNumeric="tabular-nums"
          color="gray.800"
          whiteSpace="nowrap"
        >
          {formatCSP(billing.totalCSP)}
        </Text>
        <AmountNotes billing={billing} showStatus={showStatus} />
      </Box>
    </Flex>
  );
}

/**
 * THE PC DIALOG'S TABLE (redesigned 2026-10-05). The same facts the old row
 * carried, each in its own column, so a reader scanning for a territory or a
 * period reads straight down one edge.
 *
 * NOT SORTABLE: every list here is oldest-first, the module's FIFO rule — see
 * `ordered`. A header that re-sorts would let the table disagree with the
 * conveyor about which billing is at the head.
 *
 * `showProcessor` drops the column where nobody has put a billing through yet —
 * For Process, where it would be a column of dashes.
 */
function billingColumns({
  showStatus,
  showProcessor,
  servedCode,
}: {
  showStatus: boolean;
  showProcessor: boolean;
  servedCode?: string;
}): ColumnDef<ServiceBilling>[] {
  const cols: (ColumnDef<ServiceBilling> | false)[] = [
    {
      id: "billingNo",
      header: "Billing No.",
      cell: ({ row }) => (
        <Text
          // THE SERVED ROW is found by this mark — the kit's table has no
          // per-row style, so the wash is applied from outside with `:has`.
          data-served={row.original.billingCode === servedCode || undefined}
          fontSize="13px"
          fontWeight="600"
          fontFamily="mono"
          color="gray.800"
          whiteSpace="nowrap"
        >
          {row.original.billingNo ?? "—"}
        </Text>
      ),
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => (
        <Text
          fontSize="11.5px"
          fontWeight="600"
          color="gray.500"
          letterSpacing="0.01em"
          whiteSpace="nowrap"
        >
          {row.original.periodLabel}
        </Text>
      ),
    },
    {
      // TERRITORY BEFORE CHAPEL (user, 2026-09-17: "territory first") — the
      // wide thing, then the place inside it.
      id: "territory",
      header: "Territory",
      cell: ({ row }) => (
        <Text fontSize="12px" color="gray.500">
          {db.getTerritoryName(row.original.territoryCode) ||
            row.original.territoryCode}
        </Text>
      ),
    },
    {
      id: "chapel",
      header: "Chapel",
      cell: ({ row }) => (
        <Flex align="center" gap={2}>
          <Text fontSize="13px" fontWeight="600" color="gray.800">
            {row.original.chapelDesc}
          </Text>
          <KindChip billing={row.original} />
        </Flex>
      ),
    },
    showProcessor && {
      id: "processor",
      header: "Processor",
      cell: ({ row }) => (
        <Text fontSize="12px" color="gray.600" whiteSpace="nowrap">
          {row.original.processedBy ?? "—"}
        </Text>
      ),
    },
    {
      id: "totalCSP",
      header: "Total CSP",
      cell: ({ row }) => (
        <Box textAlign="right">
          <Text
            fontSize="13px"
            fontWeight="700"
            fontVariantNumeric="tabular-nums"
            color="gray.800"
            whiteSpace="nowrap"
          >
            {formatCSP(row.original.totalCSP)}
          </Text>
          <AmountNotes billing={row.original} showStatus={showStatus} />
        </Box>
      ),
    },
  ];
  return cols.filter(Boolean) as ColumnDef<ServiceBilling>[];
}

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
  /**
   * A FIXED LIST instead of the six tabs — a History row's billings (user,
   * 2026-09-30). Shown in the order given, with no tab strip: the row that was
   * tapped already chose the list, and tabs over it would offer the whole file
   * back. The search and the three filters still narrow it.
   */
  list?: { title: string; billings: ServiceBilling[] };
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
  list,
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
  /** Own chapel or franchisee — see {@link OwnerFilter}. Cleared like the rest. */
  const [owner, setOwner] = useState<OwnerFilter>("all");

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
    setOwner("all");
  }, [open, scope]);

  const universe = useMemo(
    () => list?.billings ?? getServiceBillings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, list],
  );
  const title = list?.title ?? scopeTitle(scope);

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
    () => (list ? searched : ordered(inScope(searched, scope), scope)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, scope, version, list],
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

  /**
   * The owner switch's numbers — the tab and the search, like the tab counts,
   * and not the other filters, for the same reason: see the top of file.
   */
  const ownerOptions = useMemo(
    () =>
      (["all", "own", "franchisee"] as const).map((value) => ({
        value,
        label: OWNER_LABEL[value],
        count: listed.filter((billing) => ownedBy(billing, value)).length,
      })),
    [listed],
  );

  /**
   * The Processor column, only where a row could fill it — nobody's name is on
   * a For Process billing yet, and a column of dashes says nothing.
   */
  const showProcessor = listed.some((billing) => billing.processedBy);

  // EVERY CONDITION NARROWS THE LAST, which is what a reader expects of a
  // toolbar: the tab, then the text, then who runs the chapel, then the period,
  // then the territory, then the staff member. An empty group is not a
  // condition — it means the question was not asked.
  const rows = listed.filter((billing) => {
    if (!ownedBy(billing, owner)) return false;
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
    owner !== "all" ||
    periods.length > 0 ||
    territories.length > 0 ||
    processors.length > 0;

  /** The owner switch — the PC toolbar's and the phone sheet's foot. */
  const ownerSwitch = (
    <SegmentedTabs
      label="Chapel"
      options={ownerOptions}
      value={owner}
      onChange={setOwner}
    />
  );

  /** Stage tabs report a wait; the mixed ones report what the billing IS. */
  const showsWait = !list && scope !== "all";

  const columns = useMemo(
    () => billingColumns({ showStatus: !showsWait, showProcessor, servedCode }),
    [showsWait, showProcessor, servedCode],
  );

  /**
   * Why the list is empty — the three causes, in the order they win. Said by
   * the desktop's empty panel and the phone sheet's alike.
   */
  const emptyBody = filtered
    ? "No billing in this list matches the filters set above. Clear them to see the rest."
    : needle
      ? "No billing in this list carries that code, number, chapel, kind of chapel, plan number or name. The counts on the tabs above say which list does."
      : "There is no billing in this list.";

  /**
   * THE PHONE'S SHEET below `lg` — see `QueueSearchSheet`. The same tabs, the
   * same one query and the same three filters, with the controls at the foot;
   * the dialog below stays the desktop's. Both always mounted, `open` choosing.
   */
  const isPhone = useBreakpointValue({ base: true, lg: false }) ?? false;

  return (
    <>
      <QueueSearchSheet
        title={title}
        open={open && isPhone}
        onClose={onClose}
        // No tabs over a fixed list — see `list`.
        tabs={
          list
            ? undefined
            : BILLING_SCOPES.map((key) => ({
                key,
                label: SCOPE_LABEL[key],
                count: counts[key],
              }))
        }
        activeTab={list ? undefined : scope}
        onTabChange={(key) => onScopeChange(key as BillingScope)}
        query={query}
        onQueryChange={onQueryChange}
        placeholder="Billing no., code, chapel, plan no.…"
        // ALWAYS AT THE FOOT, not in the funnel (user, 2026-10-05: option A
        // of the mock-up) — one tap, so the funnel's count leaves it out.
        quickFilter={ownerSwitch}
        items={rows}
        getKey={(billing) => billing.billingCode}
        renderItem={(billing) => (
          <BillingRow
            billing={billing}
            served={billing.billingCode === servedCode}
            showStatus={!showsWait}
            onClick={() => onOpenBilling(billing, title)}
          />
        )}
        empty={<EmptyPanel title="Nothing matches" body={emptyBody} />}
        filterCount={periods.length + territories.length + processors.length}
        onClearFilters={() => {
          setPeriods([]);
          setTerritories([]);
          setProcessors([]);
        }}
        renderFilters={() => (
          <>
            {/* Period first — the one a processor reaches for most; see the
                desktop's row below for why. */}
            <SheetChoiceGroup
              label="Period"
              multi
              options={periodOptions}
              selected={periods}
              onChange={setPeriods}
            />
            <SheetChoiceGroup
              label="Territory"
              multi
              options={territoryOptions}
              selected={territories}
              onChange={setTerritories}
            />
            <SheetChoiceGroup
              label="Processor"
              multi
              options={processorOptions}
              selected={processors}
              onChange={setProcessors}
            />
          </>
        )}
      />

      <ListPopup
        title={title}
        open={open && !isPhone}
        onClose={onClose}
        // WIDE ENOUGH FOR THE TABLE — six columns, and a toolbar holding the
        // search, the owner switch and three dropdowns on one line. Still
        // capped by the screen.
        maxW="1100px"
        header={
          <Box>
            {/* THE SIX LISTS. A strip that SCROLLS rather than wraps: inside a
                dialog header a second row of tabs pushes the search down on
                exactly the narrow screens that have least height to give, and a
                tab strip is a thing the hand already expects to swipe. */}
            <Flex
              // No tabs over a fixed list — see `list`.
              display={list ? "none" : "flex"}
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
            <Flex gap={2} mt={list ? 0 : 2.5} align="center" wrap="wrap">
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
              {/* WHO RUNS THE CHAPEL (user, 2026-10-05) — a switch and not a
                  fourth dropdown: three choices, all worth seeing at once. */}
              <Box flexShrink={0}>{ownerSwitch}</Box>
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
              body={emptyBody}
            />
          ) : (
            <Box
              css={{
                // Total CSP's heading to the figures' edge.
                ...alignHeadersRight(":last-of-type"),
                // THE ROW ON SCREEN, by its colour — see `SERVED_BG`. Found by
                // the mark on its Billing No. cell; the kit has no row style.
                "& tbody tr:has([data-served]) td": { bg: SERVED_BG },
                "& tbody tr:has([data-served]) td:first-of-type": {
                  boxShadow: `inset 3px 0 0 ${BRAND_COLORS.primaryGreen}`,
                },
              }}
            >
              <DataTable<ServiceBilling>
                columns={columns}
                data={rows}
                getRowId={(billing) => billing.billingCode}
                onRowClick={(billing) => onOpenBilling(billing, title)}
                size="sm"
                features={{
                  search: false,
                  filtering: false,
                  sorting: false,
                  pagination: false,
                  columnToggle: false,
                  selection: false,
                  detailSidebar: false,
                }}
              />
            </Box>
          )}
        </Box>
      </ListPopup>
    </>
  );
}

export default BillingListPopup;
