"use client";

// One chapel's billing, in full — the main column of the For Process workspace.
//
// This is the screen's subject. The rail beside it says WHICH chapel; this says
// what is owed to it, under what number, and for which plan holders.
//
// It opens with the chapel's card — see `ChapelBillingCard`, which carries the
// identity, the money and the counts the money is made of.
//
// That card replaced a bare heading row, which had itself replaced an earlier
// card. The note against the row said a card gave two facts a border for
// nothing, and that was true of the card it removed: it held the billing number
// and a button. The one here holds the TOTAL CSP — the number this whole screen
// is about, and which appeared nowhere in this column before, so a processor
// had to add up a table to find it — with the service, terminated and
// discrepancy counts underneath it.
//
// NO ACTION IN THIS COLUMN. Create/Edit is in the rail, under the territory
// picker — see `BillingAction`. This column is the READING of the billing; the
// button belongs beside the list being worked, where it does not scroll away
// with a long table of plan holders.
//
// ONE TABLE OF PLAN HOLDERS — every one of them, and that is the 2026-08-25
// correction finishing what 2026-08-24 started.
//
// A service waiting on paperwork was the first to come back into the table: it
// had been lifted into a list of its own, which made a plan holder's POSITION ON
// THE PAGE depend on whether a photocopy had arrived. A DISCREPANCY kept its own
// list a while longer, on the reasoning that a plan which cannot be serviced is
// not part of what the chapel is being billed for.
//
// That reasoning was about the MONEY, and the money was never the problem — the
// total excludes those services either way. What the separate list cost was the
// READING: it was a stack of bordered cards carrying different fields in a
// different order, so a processor going down the CSP column reached the bottom
// of the table and had to start again in another layout. Both kinds are rows
// now, pinned below the billable ones, marked on their second line and with
// their CSP greyed because that amount is not in the total. The discrepancies
// additionally carry a tinted row — see {@link HELD_ROW_CSS} — because those are
// the ones somebody outside this module has to act on.
//
// THE TABLE NO LONGER SORTS, and that is what pins them. "Held services last" is
// a fact about the billing, not a default the reader may reorder away; a sort on
// any column would scatter them back through the billable rows. Little is lost —
// a billing is one chapel's cut, a handful of rows, which is the same reason
// stated below for having neither a search nor a pager.

import { useRef } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, useMessageDialog } from "osp-ui-kit";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import { formatFiledDate } from "@/app/(pis)/data";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { alignHeadersRight } from "../../components/table-align";
import { getVerifiedAccount } from "../service-payables-store";
import {
  deceasedName,
  planholderName,
  formatCSP,
  formatServiceCSP,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import { ChapelBillingCard } from "./ChapelBillingCard";

/** The same red every discrepancy in this module is drawn in. */
const DISCREPANCY_ACCENT = "#e11d48";

/**
 * The attribute a discrepancy row carries, and the tint {@link HELD_ROW_CSS}
 * finds it by.
 *
 * A MARK IN THE CELL RATHER THAN A CLASS ON THE ROW, because the kit's table
 * gives its `<tr>` no hook of any kind — no row id, no class, no data attribute
 * (checked against the rendered DOM, not assumed). What it does render is
 * whatever a column's `cell` returns, so the mark goes on the first cell's own
 * box and `:has()` walks back up to the row.
 *
 * The obvious alternative was positional — `tr:nth-last-child(-n+2)`, since held
 * rows are last — and it is wrong twice over: the summary row lives inside the
 * same `tbody` and would be counted, and any future reordering would leave the
 * tint on whichever rows happened to end up at the bottom rather than on the
 * ones that are actually held.
 */
const HELD_MARK = "data-held-service";

/**
 * The attribute a SIGNED-OFF row carries — {@link HELD_MARK}'s counterpart at
 * the other end of the same table, and found the same way for the same reason.
 */
const VERIFIED_MARK = "data-verified-account";

/**
 * The tinted band behind a discrepancy row.
 *
 * Spread onto the wrapper around a `DataTable` whose rows come from
 * {@link billingRows}. The hover is a shade deeper rather than the kit's grey:
 * a held row that turns grey under the pointer would read as though the mark had
 * been cleared by touching it.
 */
export const HELD_ROW_CSS = {
  [`& tbody tr:has([${HELD_MARK}])`]: {
    background: "#fff1f2",
  },
  [`& tbody tr:has([${HELD_MARK}]):hover`]: {
    background: "#ffe4e6",
  },
} as const;

/**
 * The tinted band behind an account that has been VERIFIED, and the tick box
 * on it put out of use.
 *
 * THE SAME TREATMENT A DISCREPANCY GETS, deliberately (user, 2026-08-27), and
 * for the same underlying reason: both are rows a verifier cannot act on, so
 * both are lifted out of the run of workable ones — pinned into a group of their
 * own by {@link verificationRows}, banded so the group reads as a block rather
 * than as scattered rows, and left in the same table so the five columns stay
 * one set of columns. Green where held is red, because one is done and the other
 * is wrong.
 *
 * THE TICK BOX IS THE POINT OF IT. A signed-off account cannot be signed again —
 * `verifyServices` writes once and refuses to re-stamp — so a live checkbox on
 * one of these rows offers an action that does nothing. The kit's `DataTable`
 * owns its selection column and takes no per-row `enableRowSelection`, so the
 * box is put beyond use here instead: dimmed, and `pointer-events: none` so a
 * click passes through it. The header's select-all still reaches these rows in
 * the table's own model, which is why every count and every write downstream is
 * taken over what is PENDING rather than over what is ticked.
 *
 * Only spread where verification is the job — see the accordion card. On For
 * Process nothing is verified, so it would match nothing.
 */
export const VERIFIED_ROW_CSS = {
  // A STEP DEEPER THAN THE HELD BAND IS PALE, and not by preference: the kit
  // draws its own summary row in #f0fdf4, which is where this band started and
  // which put the group's last row and the totals under it in the same colour
  // with a #dcfce7 hairline between them (measured). The band has to be the one
  // that moves — the totals row is the kit's and every table in the module wears
  // it — so the signed-off rows take green-100 and leave green-50 to the sum.
  [`& tbody tr:has([${VERIFIED_MARK}])`]: {
    background: "#dcfce7",
  },
  [`& tbody tr:has([${VERIFIED_MARK}]):hover`]: {
    background: "#bbf7d0",
  },
} as const;

/**
 * Every plan holder the chapel serviced, in the order the billing is read: the
 * ones on the billing, then the ones that cannot be serviced at all.
 *
 * THE ONES WAITING ON A DOCUMENT ARE IN THE FIRST GROUP now, not a group of
 * their own — a requirement not yet complied with does not take a service off
 * the billing (2026-08-25). They keep their note on the row; they are simply
 * not held.
 *
 * ONE FUNCTION FOR BOTH PRESENTATIONS — the workspace's table and the accordion
 * card's — so the two can never disagree about what a billing contains or what
 * order it comes in.
 */
export function billingRows(billing: ServiceBilling): ServiceRecord[] {
  return [...billing.services, ...billing.discrepant];
}

/**
 * The accounts on this billing that a verifier has SIGNED OFF.
 *
 * Kept next to {@link billingRows} because the two answer the same question for
 * two stages: that one says what a billing contains, this one says which part of
 * it is finished. Its complement — what is still to check — is
 * `verifiableAccounts`, which lives with the rule for what may be signed rather
 * than with the rules for drawing a table.
 */
export function verifiedRows(billing: ServiceBilling): ServiceRecord[] {
  return billing.services.filter((service) =>
    Boolean(getVerifiedAccount(service.id)),
  );
}

/**
 * The summary row's label: how many rows the table holds, and how that differs
 * from what the money underneath is made of.
 *
 * Someone checking a billing against a chapel's own paperwork counts rows, and a
 * count that silently disagrees with the total beside it is the one thing this
 * screen must not do. Both figures that can differ are named — the billable ones
 * the total IS, and the held ones it is not — and each is dropped when it has
 * nothing to say, so an ordinary billing reads "3 services" and not "3 services ·
 * 3 billable · 0 held".
 */
export function rowsSummaryLabel(billing: ServiceBilling): string {
  const rows = billingRows(billing).length;
  const billable = billing.services.length;
  const held = billing.discrepant.length;

  const parts = [`${rows} ${rows === 1 ? "service" : "services"}`];
  if (billable !== rows) parts.push(`${billable} billable`);
  if (held > 0) parts.push(`${held} held`);
  return parts.join(" · ");
}

/**
 * The corner on the card the table sits in — `2xl`, as a raw value.
 *
 * ONE CONSTANT FOR TWO PLACES, and they must agree. The card sets it, and the
 * kit's table — which brings a rounded, clipped surface of its own inside the
 * card — is overridden to it. Written out rather than read from the theme
 * because the second use is an `!important` override, which the token syntax
 * has no way to carry.
 */
const TABLE_CARD_RADIUS = "16px";

/** Two values in one cell — the death dashboard's table construction. */
const StackedCell = ({
  primary,
  secondary,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
}) => (
  <Box minW={0}>
    <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
      {primary}
    </Text>
    <Text fontSize="11px" color="gray.500" mt="1px" truncate>
      {secondary}
    </Text>
  </Box>
);

/* ------------------------------ the table ------------------------------ */

/**
 * The table carries no action column. A row IS the action: clicking one opens
 * that plan holder's service record, which is where the work on them happens.
 *
 * It briefly had a Terminate button in a trailing column, and taking it out left
 * nothing on this page able to advance a billing. That gap is closed now — the
 * service record page is where a plan is terminated, by saving the record, which
 * is what the screen this replaces does too.
 */
export const serviceColumns: ColumnDef<ServiceRecord>[] = [
  {
    id: "planholder",
    // THE PLAN HOLDER, and it used to be `deceasedName` under this heading —
    // the same string on every row in this data, so the mislabelling was
    // invisible and would have stayed invisible until the first plan bought for
    // a dependant came through. The name it prints now is the one the LPA
    // number beneath it belongs to, which is what makes the two lines one fact.
    accessorFn: (service) => planholderName(service),
    header: "Planholder",
    cell: (info) => {
      const service = info.row.original;
      // A service can carry both; the discrepancy is the one that names the row,
      // for the reason `ServiceBilling.discrepant` gives — it is the harder of
      // the two to clear and it decides where the service ends up being billed.
      const discrepancy = service.discrepancy;
      const reason = discrepancy?.reason ?? service.deficiency?.reason;
      // Read once and used twice — the row's band below, and the tick at the
      // end of the second line.
      const verified = getVerifiedAccount(service.id);

      return (
        <Box
          minW={0}
          // The mark the row's tint is found by — see `HELD_MARK`. Only a
          // discrepancy carries it: a deficiency is a wait, not a verdict, and
          // tinting it would put the ordinary course of business in alarm
          // colours on most billings in the queue.
          //
          // OR THE SIGNED-OFF MARK, which is the same device at the other end of
          // the table — see `VERIFIED_ROW_CSS`. Never both: a held service is not
          // on the billing and so is never verified, and if the two ever did meet
          // the discrepancy is the one that names the row, for the reason given
          // above.
          {...(discrepancy
            ? { [HELD_MARK]: "" }
            : verified
              ? { [VERIFIED_MARK]: "" }
              : {})}
        >
          <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
            {info.getValue() as string}
          </Text>
          {/* WHAT IS HOLDING THE SERVICE IS SAID ON THE SECOND LINE, in the
              space the LPA number already occupies, so a held row is exactly as
              tall as one that is not. A third line here would make the table
              ragged and would put the height difference in front of the words —
              the same reason the rail's mark is a fixed-size icon.

              The icon appears only for a discrepancy, and it is what carries the
              distinction where the tint cannot: a printed page, or a reader who
              does not see the red. */}
          <Flex align="center" gap={1} minW={0} mt="1px">
            {discrepancy && (
              <Box color={DISCREPANCY_ACCENT} flexShrink={0} display="flex">
                <LuCircleAlert size={11} />
              </Box>
            )}
            <Text
              fontSize="11px"
              color={discrepancy ? DISCREPANCY_ACCENT : "gray.500"}
              truncate
            >
              {reason ? `${service.lpaNo} · ${reason}` : service.lpaNo}
            </Text>
            {/* SIGNED OFF BY A VERIFIER — the For Verification queue's own mark,
                and the only thing on this row that says an account is DONE
                rather than merely present.

                IT HAS TO BE ON THE ROW, because verification is per account: a
                verifier who puts three of five through and comes back after
                lunch has no other way to see which two are left, and a button
                whose effect is invisible until the last account trains people
                not to trust it.

                AT THE END OF THE LINE rather than in front of the name: the
                left edge of this cell is where the eye goes down the table, and
                a tick that pushed every verified name sideways would make a
                half-verified billing read as two ragged columns. Read off the
                store on every render, so it appears the moment the button is
                pressed — nothing here is stale between the write and the next
                derivation.

                It never renders on For Process: nothing is verified at that
                stage, so the lookup finds nothing and this costs those tables a
                map probe per row. */}
            {verified && (
              <Box
                color={BRAND_COLORS.darkGreen}
                flexShrink={0}
                display="flex"
                title="Verified"
                aria-label="Verified"
              >
                <LuCircleCheck size={11} />
              </Box>
            )}
          </Flex>
        </Box>
      );
    },
  },
  {
    // WHO THE SERVICE WAS RENDERED FOR — the check this table is read for.
    //
    // It stands NEXT TO the plan holder deliberately: the processor is
    // comparing two names, and a column two places over is a column they have
    // to hold one of them in their head to reach. On nearly every row the two
    // read identically, and that IS the check passing — a plan is usually held
    // by the person it covers. Where they differ, the plan was bought for a
    // dependant, and the difference is the thing to notice before the payable
    // goes through.
    //
    // ONE LINE, where the Planholder cell has two. The second line there is the
    // LPA number, which identifies the plan and so belongs to the holder; there
    // is nothing of the same standing to say about the deceased, and the date of
    // death already has its own column two over. Repeating it here to fill the
    // line would put the same date twice on every row.
    id: "deceased",
    accessorFn: (service) => deceasedName(service),
    header: "Deceased",
    cell: (info) => (
      <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
        {info.getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "planDesc",
    header: "Plan",
    cell: (info) => (
      <Text fontSize="xs" fontWeight="600" color="gray.800" truncate>
        {info.getValue() as string}
      </Text>
    ),
  },
  {
    // When they died, over when the plan started. The two dates a service
    // payable is checked against, and they are never confused for each other
    // because one is labelled and the other says "Contract".
    accessorKey: "dateOfDeathISO",
    header: "Date of Death",
    cell: (info) => (
      <StackedCell
        primary={formatFiledDate(info.getValue() as string)}
        secondary={`Contract ${formatFiledDate(
          info.row.original.contractDateISO,
        )}`}
      />
    ),
  },
  {
    accessorKey: "csp",
    header: "CSP",
    cell: (info) => {
      // MUTED WHENEVER THE AMOUNT IS NOT IN THE TOTAL, which since 2026-08-25 is
      // ONLY a plan that should not have been serviced. A folder short a
      // document is in the total like any other row: the requirement is chased,
      // the payable is not withheld. Muting it would have told a reader adding
      // the column up to leave out money that is in the figure at the foot.
      //
      // So this reads the discrepancy alone — the deficiency is said on the
      // row's second line and nowhere else.
      //
      // A DASH RATHER THAN Php 0.00 where nothing priced it — see
      // `formatServiceCSP`. Muted too, because an unpriced row contributes
      // nothing to the figure at the foot, which is the same reason a held one
      // is.
      const service = info.row.original;
      const held = Boolean(service.discrepancy);
      const unpriced = service.csp === 0;
      return (
        <Flex justify="flex-end">
          <Text
            fontSize="xs"
            fontWeight={held || unpriced ? "600" : "700"}
            color={held || unpriced ? "gray.400" : "gray.800"}
            whiteSpace="nowrap"
          >
            {formatServiceCSP(info.getValue() as number)}
          </Text>
        </Flex>
      );
    },
  },
];

/**
 * The columns a table of rows that CANNOT be ticked wears — the signed-off
 * accounts and the held ones, as the verify card lays them out beneath the
 * working table.
 *
 * The service columns with a MARKER in front, and the marker earns its place
 * twice over. It says which group the row is in — a tick or an alert, on every
 * row, which is what a printed page or a reader who does not see the tint has to
 * go on. And it stands where the TICK BOX stands in the table above: these
 * tables have no selection column, so without it all five shared columns would
 * sit a box-width to the left of the headings they belong under. The widths in
 * {@link VERIFY_TABLE_LAYOUT} finish that job.
 */
export const groupServiceColumns: ColumnDef<ServiceRecord>[] = [
  {
    id: "state",
    header: "",
    cell: (info) => {
      const held = Boolean(info.row.original.discrepancy);
      return (
        <Flex
          justify="center"
          color={held ? DISCREPANCY_ACCENT : BRAND_COLORS.darkGreen}
          title={held ? "Held by a discrepancy" : "Verified"}
          aria-label={held ? "Held by a discrepancy" : "Verified"}
        >
          {held ? <LuCircleAlert size={13} /> : <LuCircleCheck size={13} />}
        </Flex>
      );
    },
  },
  ...serviceColumns,
];

/**
 * ONE SET OF COLUMNS ACROSS SEVERAL TABLES.
 *
 * The verify card draws its billing as two or three tables stacked — what is
 * still to check, what has been signed, what is held — because the kit takes
 * `enableRowSelection` as one boolean for a whole table and has no per-row form
 * of it, so a row that must never be ticked cannot be in the table that has tick
 * boxes. Select-all reaches everything in its own table's data, and that was the
 * complaint: signed-off accounts came back ticked (user, 2026-08-27).
 *
 * WHAT THAT COSTS is what this puts back. Each table sizes its own columns from
 * its own content, so three tables of the same five columns produce three
 * different sets of column edges, stacked and visibly ragged. `table-layout:
 * fixed` takes the sizing away from the content and these widths hand every
 * table the same grid, so the stack reads as ONE table interrupted by bands
 * rather than as three tables that nearly line up.
 *
 * The first column is the tick box in the working table and the marker in the
 * others — one figure, so the two coincide. The rest are percentages of what is
 * left, weighted to the two name columns, which are the ones being compared.
 *
 * `!important` because the kit writes a width onto its own selection cell.
 */
/**
 * Tick box or marker, then the five shared columns, as shares of the panel.
 *
 * THE SCROLL WRAPPER HAS TO LET GO FIRST, which is the rule above them. The kit
 * puts each table inside a `min-width: max-content` box within a horizontal
 * scroller, so a table is as wide as its content wants and the box scrolls
 * sideways. Two tables then want two different widths, which is the whole
 * problem — and it cannot be settled by pinning the columns while that box still
 * sizes itself: with percentages there is nothing for them to resolve against
 * (measured: a 1,000,000px table), and with pixels the box's max-content picks
 * up the summary row and the kit's own 32px selection cell and lands 30px apart
 * between the two tables (measured: 723 against 754).
 *
 * Told to be the scroller's width, the box gives both tables the same definite
 * width, and shares of it then come out identical to the pixel — verified.
 *
 * WHAT IS GIVEN UP is the sideways scroll; what replaces it is truncation, which
 * every cell in these columns already does. The shares favour the two NAME
 * columns, because those are the pair a verifier is reading against each other.
 *
 * AND IT IS GIVEN UP ONLY WHERE THERE IS ROOM TO GIVE. On a phone the panel is
 * the width of the screen, and six columns of a 375px screen is 73px of plan
 * holder name (measured) — a column of first names cut off mid-word. Below `md`
 * the rules simply do not apply: the kit's scroll comes back, the tables size
 * themselves, and the two of them line up only approximately. That is the right
 * way round. On a wide screen the stack has to read as one table, because it
 * sits under one set of headings; on a phone it is read a row at a time, and a
 * name you can actually read matters more than an edge that lines up with the
 * table above.
 */
const VERIFY_COLUMN_WIDTHS = ["44px", "26%", "22%", "16%", "18%", "18%"];

export const VERIFY_TABLE_LAYOUT = {
  "@media (min-width: 48em)": {
    "& div:has(> table)": { minWidth: "0 !important", width: "100% !important" },
    "& table": { tableLayout: "fixed", width: "100%" },
    ...Object.fromEntries(
      VERIFY_COLUMN_WIDTHS.map((width, index) => [
        `& thead th:nth-of-type(${index + 1}), & tbody td:nth-of-type(${index + 1})`,
        { width: `${width} !important` },
      ]),
    ),
  },
} as const;

/* ------------------------------ the panel ------------------------------ */

/*
 * `HeldList` used to live here — the discrepancies as a stack of bordered cards
 * under the table, each carrying the LPA number, the reason, and the PH branch /
 * servicing branch / Trx point triple the old screen gave three columns to.
 *
 * It is gone because those rows are IN the table now (see the note at the top of
 * this file). The one thing that did not survive the move is that triple: the
 * table has no columns for it, and widening it to four narrow ones would have
 * cost every row on every billing to serve the few that are held. It is on the
 * service record, one click away through the row itself, which is where a
 * processor goes to resolve the discrepancy in any case.
 */

/*
 * `BillingBar` used to live here — the billing's number and its one button, as
 * a `SectionTitle` row. `ChapelBillingCard` is what it became; the reasoning
 * for the change is at the top of this file and in that component's own note.
 */

export interface BillingDetailProps {
  billing?: ServiceBilling;
  /**
   * Open one plan holder's service record.
   *
   * Handed UP to the page rather than navigating from here. The record is not a
   * route — the page swaps to it in place, the way the plan holder page swaps to
   * a claim — and only the page knows whether that means a swap or a drawer.
   *
   * OMITTED WHERE THERE IS NO RECORD TO WORK. A processed billing's plans are
   * already terminated and the screen behind them is a form for doing exactly
   * that, so the Processed workspace lists them and leaves them alone — and the
   * rows drop their pointer cursor to say as much, rather than looking like a
   * way in that answers nothing.
   */
  onOpenService?: (service: ServiceRecord) => void;
  /**
   * What stands here before a billing is picked. Defaulted to the For Process
   * wording, where the rail is a list of CHAPELS; the Processed workspace picks
   * from a person's billings and says so.
   */
  emptyTitle?: string;
  emptyBody?: string;
}

export function BillingDetail({
  billing,
  onOpenService,
  emptyTitle = "Pick a chapel",
  emptyBody = "Its billing and the plans under it appear here.",
}: BillingDetailProps) {
  const { messageBox } = useMessageDialog();

  /**
   * Which uncreated billings the user has already been warned about.
   *
   * ASKED ONCE PER BILLING, not once per row. The warning is about the BILLING —
   * it has no number, so nothing on it can be terminated — and a processor who
   * has said "continue" to that has been told. Asking again for the second plan
   * holder on the same chapel would be the same sentence about the same fact,
   * and a confirmation people learn to dismiss without reading is worse than no
   * confirmation at all.
   *
   * Keyed by billing code, so opening a different uncreated chapel asks again.
   * A ref rather than state: nothing on screen changes when it is written, and
   * a re-render here would be a re-render of the whole table.
   */
  const warnedFor = useRef(new Set<string>());

  /**
   * Open a plan holder's record — after a word, when the billing has no number.
   *
   * WHY THE WARNING IS HERE AND NOT ON THE RECORD. The record already says it:
   * Terminate is disabled there with the reason under it (see `RecordActions`).
   * But that is found at the END of the work — a processor opens a plan holder,
   * fills in the CSP, the dates and the remarks, and only then reaches the
   * button that cannot be pressed. This is the same fact delivered before the
   * work rather than after it.
   *
   * IT DOES NOT REFUSE. Saving the record is real work and doing it before the
   * billing is created is ordinary, so the answer is the user's: told what will
   * not be possible, they say whether to go on.
   */
  const openService = async (service: ServiceRecord) => {
    if (!onOpenService || !billing) return;

    if (!billing.billingNo && !warnedFor.current.has(billing.billingCode)) {
      const proceed = await messageBox({
        title: "NO BILLING NUMBER YET",
        message:
          `${billing.billingCode} has not been created, so it carries no billing number — ` +
          `and a plan can only be terminated into a billing that has one. You can still open ` +
          `${deceasedName(service)}'s record and save what you enter; terminating waits until ` +
          `the billing is created. Continue?`,
        confirmText: "Continue",
        cancelText: "Cancel",
        variant: "confirmation",
      });
      if (!proceed) return;
      warnedFor.current.add(billing.billingCode);
    }

    onOpenService(service);
  };

  /**
   * EVERY PLAN HOLDER THE CHAPEL SERVICED, in one table — billable, waiting on a
   * document, and held by a disagreement alike. See `billingRows`, and the note
   * at the top of this file for why both kinds of held row came back in.
   *
   * Billable first, so the top of the table is the work that can be done now.
   */
  const rows = billing ? billingRows(billing) : [];

  if (!billing) {
    return (
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderStyle="dashed"
        borderRadius="xl"
        py={12}
        px={4}
        textAlign="center"
      >
        <Text fontSize="sm" fontWeight="600" color="gray.600">
          {emptyTitle}
        </Text>
        <Text fontSize="xs" color="gray.400" mt={1}>
          {emptyBody}
        </Text>
      </Box>
    );
  }

  return (
    // The kit gives every table row a pointer cursor whether or not it was
    // handed an `onRowClick`, so rows that lead nowhere still LOOK clickable.
    // Put back to `default` from out here, the way the two summary tables do —
    // on this wrapper rather than one of its own, since the plan-holder table is
    // the only `tbody` in the column.
    <Box
      css={{
        // THE CSP HEADING OVER THE CSP FIGURES — the last column, and the only
        // one here that is a number. See `alignHeadersRight`.
        //
        // COUNTED FROM THE END, and it used to be `:nth-of-type(4)` — which was
        // right when this table had four columns and stopped being right the day
        // Deceased was added between Planholder and Plan. Nothing said so: the
        // rule went on matching, one column to the left, so DATE OF DEATH wore
        // the right-aligned heading and the figures it was written for did not.
        // Found on 2026-08-26, while adding a checkbox column that would have
        // moved it again.
        //
        // `:last-of-type` is stable under both: the CSP is the last column in
        // every presentation of this table, with or without the kit's select box
        // in front. `table-align`'s own note asks for a second look whenever a
        // column is inserted — this is the form that does not need one.
        ...alignHeadersRight(":last-of-type"),
        // The tint behind the rows that cannot be serviced.
        ...HELD_ROW_CSS,
        ...(onOpenService ? {} : { "& tbody tr": { cursor: "default" } }),
      }}
    >
      <ChapelBillingCard billing={billing} />

      {/* No heading over the table — the row above names the billing and the
          table's own column headers say what each row holds. The count that
          used to need one is the table's own summary row now; see
          `summaryRows` below.
          NOTE for whenever a heading does come back here: the word is
          "Planholders", one word — the spelling this system uses everywhere
          else, and the one "Plan Holders" got wrong. */}
      {rows.length === 0 ? (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderStyle="dashed"
          borderRadius="xl"
          py={8}
          px={4}
          textAlign="center"
        >
          {/* NOTHING AT ALL, which is now the only way to empty this table:
              every kind of held service is a row in it. In practice this is a
              franchise whose billing was raised before a single plan holder was
              keyed in — see `canAddManualService`. */}
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            No services on this billing yet
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            Plan holders appear here as they are endorsed or keyed in.
          </Text>
        </Box>
      ) : (
        // THE TABLE ON A CARD.
        //
        // The surface a card gives belongs to whatever the screen is ABOUT, and
        // on this screen that is the plan holders and what they come to. It was
        // briefly around the chapel list in the rail instead, which put a box
        // around a stack of rows that were already boxed and left the subject
        // of the page sitting on the page's own background.
        //
        // `DetailCard`'s values, minus its hover lift — that card is pressed
        // and this one is only read — and minus its padding: a table brings its
        // own, and gutters here would inset the header band and the summary row
        // from the edge they are meant to span. `overflow: hidden` is what
        // makes that safe, clipping both bands to the corners instead of
        // letting them square them off.
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.100"
          borderRadius={TABLE_CARD_RADIUS}
          boxShadow="sm"
          overflow="hidden"
          css={{
            // The kit's table brings a rounded white surface of its OWN — 8px,
            // clipped — inside this one. Both being white, the surface itself
            // is invisible; its radius is not. The header band (#fcfcfc) and
            // the summary row (#f0fdf4) ARE coloured, and left alone they clip
            // to the inner 8px while the card corners at 16px, leaving a white
            // wedge in each corner of the card.
            //
            // `!important` because the kit sets that radius on its own class
            // and a plain rule here loses to it. `inherit` was tried first and
            // lost the same way, which is why the figure is a shared constant
            // rather than the keyword.
            "& > *": { borderRadius: `${TABLE_CARD_RADIUS} !important` },
          }}
        >
        <DataTable<ServiceRecord>
          columns={serviceColumns}
          data={rows}
          getRowId={(row) => row.id}
          // Only when there IS a record to open — see `onOpenService`. The row
          // goes through `openService` rather than straight out, so a billing
          // with no number gets a word in first.
          onRowClick={
            onOpenService ? (service) => void openService(service) : undefined
          }
          size="sm"
          /*
           * WHAT THIS TABLE HOLDS AND WHAT THE MONEY IS MADE OF — see
           * `rowsSummaryLabel`, which is shared with the accordion card so the
           * two presentations of one billing cannot report it differently.
           *
           * The table's OWN feature rather than a heading above it — the kit
           * ships two, and this is the one that does not need a toolbar. (The
           * other is `labels.resultsCountLabel`, which only renders when the
           * toolbar does: with search, filtering and the column toggle all off
           * here, there is no toolbar for it to sit in.) It also lands the
           * figure where a total belongs, at the foot of the column it totals,
           * instead of above the header where it would be read before the rows
           * it describes.
           */
          summaryRows={[
            {
              id: "totals",
              label: rowsSummaryLabel(billing),
              values: {
                // THE BILLING'S OWN TOTAL, not the column's sum — and this is
                // the one place the two must not be confused. Every row is on
                // screen, but a row waiting on paperwork is not in the money:
                // `aggregate("sum", "csp")` would add it in and quietly report a
                // billing worth more than it is. `billing.totalCSP` is the
                // figure the chapel card at the head of this column shows and
                // the figure the payable is raised for, so the two agree by
                // construction.
                //
                // A node and not a number: the summary cell aligns left unless
                // the column declares itself numeric — which needs a
                // `ColumnMeta` augmentation this project does not have — so
                // this right-aligns itself, the same way the CSP cells above
                // it do.
                csp: () => (
                  <Flex justify="flex-end">
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="gray.900"
                      whiteSpace="nowrap"
                    >
                      {formatCSP(billing.totalCSP)}
                    </Text>
                  </Flex>
                ),
              },
            },
          ]}
          features={{
            // The list is one chapel's period — a few rows — so it needs
            // neither a search nor a pager, and the same reasoning as the death
            // queue's table applies to both.
            search: false,
            filtering: false,
            // AND NOT A SORT EITHER, for a reason the others do not share: the
            // order here carries meaning. Held services sit last because they
            // are held, and a reader who sorted by name or by date would
            // scatter them back through the billable rows and lose the one
            // thing the arrangement was saying.
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
  );
}

export default BillingDetail;
