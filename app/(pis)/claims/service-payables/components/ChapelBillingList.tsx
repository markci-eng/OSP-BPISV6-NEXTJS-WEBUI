"use client";

// The chapels of a territory, as the rail beside the work.
//
// This is where this screen departs from the death dashboard, and the reason is
// worth stating. There the rail holds context — a search, a feed — and the work
// is entirely in the main column. Here the rail holds the NAVIGATION: a service
// payable belongs to a chapel, so the chapel list is what the user is choosing
// from all the way through the task, and it has to stay on screen while the
// billing beside it is worked. Put it in the main column and every plan holder
// terminated would be a scroll away from the next chapel.
//
// So the rail is a picker, and the main column is what was picked. Same two
// columns as the dashboard, opposite jobs.
//
// A row does NOT carry the create-billing action, though the screen this
// replaces put a "+" on each chapel row. It did here too, briefly, and the row
// could not afford it: at 340px, a button pushed the code, the period, the
// amount and the number into whatever was left, and the whole list read as
// heavier than the work it lists. The action lives on the billing's own line in
// the main column, where the period, the total and the plan holders it covers
// are all on screen — which is what someone is deciding on when they create it.
//
// What a row carries instead is STATE, and only state: the amount, the billing
// number once one exists, and a mark when the chapel is holding a plan that
// CANNOT BE SERVICED. Not when it is short a document — that is listed in the
// column this list points at, and it is a queue rather than news.

import { useState } from "react";
import { Box, Button, Flex, Text, type BoxProps } from "@chakra-ui/react";
import { Tooltip } from "osp-ui-kit";
import { LuInfo } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ScrollFade } from "../../components/scroll-fade";
import { TOOLTIP_SURFACE } from "../../components/tooltip-surface";
import {
  discrepancyLabel,
  formatCSP,
  type ServiceBilling,
} from "../service-payables-data";

/** The same red every discrepancy count in this module is drawn in. */
const DEFICIENCY_ACCENT = "#e11d48";

/**
 * A row's height, and the gap between two of them. Measured, not declared — a
 * row is two lines of type over `py={2}` and a border, and it comes to 52.5px,
 * rounded up here so the tenth row is not clipped by a fraction.
 *
 * Every row is exactly this tall, which is not an accident: the discrepancy
 * mark is a fixed-size icon IN the row's own line for this reason, and the
 * billing number sits in the second line rather than adding a third.
 */
const ROW_HEIGHT = 53;
const ROW_GAP = 8;

/** How many rows the list shows before it scrolls — see {@link LIST_MAX_HEIGHT}. */
export const VISIBLE_ROWS = 10;

/**
 * Tallest the list gets on a desktop: ten rows, and the ninth gap between them.
 *
 * A COUNT OF ITEMS, not a share of the screen. It was `calc(100vh - 260px)`,
 * which meant the list held five chapels on a laptop and thirteen on a large
 * monitor — the same territory, a different list, and no way for someone
 * working across two machines to learn how much they are looking at. Ten is
 * the number now, and the rail scrolls to reach the tenth on a screen too
 * short to show it outright.
 */
export const LIST_MAX_HEIGHT = `${
  VISIBLE_ROWS * ROW_HEIGHT + (VISIBLE_ROWS - 1) * ROW_GAP
}px`;

/**
 * The mark on a row that carries a DISCREPANCY.
 *
 * An icon and nothing else, and that is the whole point of it. The count used
 * to sit on a line of its own under the row — which meant a row with a
 * discrepancy was TALLER than one without, so a list of ten chapels came out
 * ragged and the eye read the height difference before it read the words. A
 * fixed-size mark in the row's own line leaves every row identical.
 *
 * What was lost with that line — how many, and what they are — is in the
 * tooltip, which is more than the line ever said.
 *
 * DEFICIENCIES ARE NOT MARKED HERE, and that is the change of 2026-08-24. Both
 * kinds shared this icon, so a chapel one photocopy short was flagged in the
 * same red as a chapel holding a plan that cannot be serviced at all. Only the
 * second is news at the altitude of a picker: it needs somebody outside this
 * module to correct a record, where the first needs an envelope to arrive. The
 * deficiencies are still listed in full one column over, under their own quiet
 * heading — see `BillingDetail`.
 *
 * Opens on hover AND on click, because half the people who need it are on a
 * phone where there is no hover at all. Controlled state is what allows both:
 * the tooltip drives `open` for pointer users, and the click toggles the same
 * flag for everyone else.
 */
function HeldMark({ billing }: { billing: ServiceBilling }) {
  const [open, setOpen] = useState(false);

  const held = billing.discrepant;
  const label = discrepancyLabel(billing.discrepant.length);

  return (
    <Tooltip
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      openDelay={100}
      closeDelay={100}
      // So the tooltip can be moved onto and read, rather than vanishing the
      // moment the pointer leaves the 24px icon.
      interactive
      positioning={{ placement: "top-end" }}
      contentProps={{ ...TOOLTIP_SURFACE, maxW: "260px" }}
      content={
        <Box>
          {/* The count takes the accent — it is what the mark stands for, and
              on the kit's dark chip it was white like the reasons under it. */}
          <Text
            fontSize="10px"
            fontWeight="700"
            color={DEFICIENCY_ACCENT}
            letterSpacing="0.04em"
            textTransform="uppercase"
            mb={1.5}
          >
            {label}
          </Text>
          {held.map((service) => (
            // The LPA leads in the darker weight and the reason follows in
            // plain — a list of four reads as four entries that way, where four
            // lines of one colour read as a paragraph.
            <Text
              key={service.id}
              fontSize="11px"
              lineHeight="1.45"
              color="gray.600"
              mt="2px"
            >
              <Text as="span" fontWeight="700" color="gray.800">
                {service.lpaNo}
              </Text>{" "}
              {/* The disagreement, which is the only kind listed here now. A
                  service carrying a deficiency as well is in this list for the
                  discrepancy, and the discrepancy is what has to be answered
                  first anyway — see `terminationBlocker`. */}
              — {service.discrepancy?.reason}
            </Text>
          ))}
        </Box>
      }
    >
      <Button
        aria-label={`${label} on ${billing.billingCode}`}
        // Stopped here, unlike everything else on the row: this is a marker,
        // not a way in. Reading why a service is held should not also change
        // which billing the main column is showing.
        onClick={(e) => {
          e.stopPropagation();
          setOpen((current) => !current);
        }}
        variant="plain"
        w="20px"
        h="20px"
        minW="20px"
        p={0}
        color={DEFICIENCY_ACCENT}
        _hover={{ color: DEFICIENCY_ACCENT, opacity: 0.75 }}
      >
        <LuInfo size={15} />
      </Button>
    </Tooltip>
  );
}

function ChapelRow({
  billing,
  selected,
  onSelect,
}: {
  billing: ServiceBilling;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      borderWidth="1px"
      // NEARLY SQUARE, and the one place this module's "on" state departs from
      // the tile tabs it otherwise copies exactly.
      //
      // A tile is 64px tall and stands alone in a row of four, so a 12px corner
      // is a small fraction of its edge. A row is 53px and stands in a stack of
      // ten inside a card that has a 16px corner of its own — at 8px the green
      // edge, which is 2px thick where the ring doubles the border, curved
      // enough at each end to read as a lozenge rather than as a row that had
      // been picked out of a list. 4px keeps the corner off the sharp edge
      // without rounding the selection into a shape of its own.
      borderRadius="sm"
      // ONE EVEN 1px EDGE, SELECTED OR NOT — only its colour changes.
      //
      // There was a `0 0 0 1px` ring under the border here, copied from the
      // tile tabs. Two 1px greens stacked draw as a 2px edge, so a picked row
      // was not the same shape as the nine around it — it was one pixel wider
      // on every side, and the extra weight collected in the corners. The wash
      // and the green are enough to say which row is on; the ring was saying it
      // a second time in the one property that changes the row's outline.
      //
      // Kept as a colour change and not a WIDTH change on purpose: a 2px border
      // on the selected row alone would move that row's contents by a pixel and
      // nudge every row under it each time the selection moved.
      borderColor={selected ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={selected ? "#f4faf6" : "white"}
      px={2.5}
      py={2}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: selected ? undefined : "gray.300" }}
    >
      {/* `center`, now that every row is exactly two lines tall — the mark on
          the right sits level with them instead of hanging off the top. */}
      <Flex justify="space-between" align="center" gap={2}>
        {/* The billing code leads, and the chapel's name is not shown at all —
            the code opens with the chapel's own code ("DONSOL1JUN26"), so a
            name above it was the same fact twice, in the row's most valuable
            line. The period underneath is what tells two of one chapel's
            billings apart, which is the only ambiguity a code leaves. */}
        <Box minW={0} flex="1">
          <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
            {billing.billingCode}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {billing.periodLabel}
          </Text>
        </Box>

        <Flex align="center" gap={1.5} flexShrink={0}>
          <Box textAlign="right">
            {/* <Text fontSize="11px" fontWeight="700" color="gray.700" whiteSpace="nowrap">
              {formatCSP(billing.totalCSP)}
            </Text> */}
            {/* Only when there IS one. "Not billed" used to stand here to say
                the absence out loud, and it turned out to say it on nearly
                every row of a For Process list — where not being billed yet is
                what the whole list has in common. A number now means something
                by being there at all. */}
            {billing.billingNo && (
              <Text
                fontSize="10px"
                fontWeight="600"
                color={BRAND_COLORS.darkGreen}
                mt="1px"
                whiteSpace="nowrap"
              >
                {billing.billingNo}
              </Text>
            )}
          </Box>

          {/* The row's only control, and it is a marker rather than an action:
              a chapel holding a plan that CANNOT BE SERVICED says so here, and
              what is held is in the tooltip. A deficiency does not raise it —
              see {@link HeldMark}. */}
          {billing.discrepant.length > 0 && <HeldMark billing={billing} />}
        </Flex>
      </Flex>
    </Box>
  );
}

export interface ChapelBillingListProps {
  billings: ServiceBilling[];
  /** The billing code currently open in the main column. */
  selected?: string;
  onSelect: (billingCode: string) => void;
  /**
   * Tallest the list may be before it scrolls inside itself.
   *
   * Applies at EVERY width, which is the point of it. On a desktop it stops the
   * sticky rail outgrowing the viewport; stacked, it stops a territory with
   * nine chapels burying the billing under a screen and a half of list — the
   * list scrolls in place and the page stays the length of the work.
   *
   * Passed in rather than fixed here: this is really "how much of the viewport
   * the rail may take", and the page is the only thing that knows what else is
   * standing in it.
   */
  maxHeight?: BoxProps["maxH"];
  /**
   * Whether the list FILLS its wrapper and scrolls inside it, rather than
   * growing to its content.
   *
   * The rails pass this: their wrapper carries both the stacked cap and the
   * ten-row cap (`railListBox`), and the list is a flex child that takes what
   * the wrapper ended up being. It is the alternative to `maxHeight="100%"`,
   * which resolves against a parent with a DEFINITE height — and a flex item
   * sized from its own content has none, so that cap silently dropped out.
   */
  fills?: boolean;
  /**
   * What the empty state says. Defaulted, and overridden for the one case the
   * default is wrong about: with NO territory picked there is no "this
   * territory" for it to be talking about — the list is empty because nothing
   * has been asked of it yet, which is a different sentence.
   */
  emptyTitle?: string;
  emptyBody?: string;
  /**
   * What a screen reader calls this list.
   *
   * "Chapels" is right where the list is a territory's chapels, which is what
   * this was built for. Scoped to a PERSON instead — the Processed workspace —
   * the rows span whatever chapels they happen to have worked, so the thing
   * being listed is billings and the label has to say so.
   */
  label?: string;
}

export function ChapelBillingList({
  billings,
  selected,
  onSelect,
  maxHeight,
  fills = false,
  emptyTitle = "No chapels to bill",
  emptyBody = "Nothing in this territory is waiting at this stage.",
  label = "Chapels",
}: ChapelBillingListProps) {
  if (billings.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderStyle="dashed"
        borderRadius="lg"
        py={6}
        px={3}
        textAlign="center"
      >
        <Text fontSize="xs" fontWeight="600" color="gray.600">
          {emptyTitle}
        </Text>
        <Text fontSize="11px" color="gray.400" mt={1}>
          {emptyBody}
        </Text>
      </Box>
    );
  }

  return (
    // The list scrolls, not the page. `ScrollFade` rather than a plain
    // `overflowY` box for the affordance it brings: the bar is hidden and the
    // edge the list continues past is faded instead, so a half-visible chapel
    // row says "there is more" at the place the eye already is. A clipped list
    // with no bar and no edge just looks like a list that ends there.
    <ScrollFade
      role="listbox"
      aria-label={label}
      maxH={maxHeight}
      flex={fills ? "1 1 auto" : undefined}
      minH={fills ? 0 : undefined}
    >
      <Flex direction="column" gap={2}>
        {billings.map((billing) => (
          <ChapelRow
            key={billing.billingCode}
            billing={billing}
            selected={billing.billingCode === selected}
            onSelect={() => onSelect(billing.billingCode)}
          />
        ))}
      </Flex>
    </ScrollFade>
  );
}

export default ChapelBillingList;
