"use client";

// The plan holders on one chapel's billing, as the rail beside the record.
//
// Same job the chapel list does in the billing view, one level down: the rail is
// the NAVIGATION, and the main column is whatever it points at. There the user
// is choosing a chapel out of a territory; here they are choosing a plan holder
// out of a chapel, and working down the list is the whole task — so the list has
// to stay on screen while each record beside it is filled in and saved.
//
// The row construction is `ChapelBillingList`'s, deliberately: two lines and a
// fixed height whatever state the row is in. A user coming from that view should
// not have to learn a second kind of row.
//
// WHERE IT NOW DIVERGES, and why — both changes are the same 2026-08-26 point,
// that a chapel is picked by its money and a plan holder is picked by their
// name:
//
//   NO AMOUNT. A chapel row carries what the chapel is owed, because working a
//   territory IS working down those figures. Nobody chooses which plan holder to
//   open by what their service is worth; the figure is on the record beside this
//   rail and in the billing's own table, and taking it off gave the names the
//   width they were short of.
//
//   THREE LINES WHEN THE DECEASED IS NOT THE PLAN HOLDER. See the row.
//
// IT CARRIES NO MARK (user-confirmed 2026-08-25). A red (i) captioned
// "Discrepancy" hung on the end of a row here and opened a tooltip; it was drawn
// off the DEFICIENCY, so a plan holder waiting on a copy of the LPA wore the
// mark for an account that should never have been serviced. A discrepancy has
// its own notification now — View and Send on the record — and a deficiency is
// flagged where it is worked, in the Documents section.
//
// What is different is the SECOND fact on the right. A chapel row shows the
// billing number once one exists; a plan holder row shows whether their record
// has been saved — which is the one thing that changes as the list is worked,
// and the thing that says where the user got to if they leave and come back.
//
// AND ON ONE QUEUE IT IS ALSO A MULTI-SELECT (user, 2026-09-03). On For
// Verification the rows carry a tick box and the rail above them a Check all,
// so a verifier who has read down the list signs the whole billing from where
// they are standing. Without it the only way to sign more than one account at a
// time was to leave the record, go back to the billing's own table on the card
// and tick there — which is the selection the user asked not to have to return
// to. See `selectable`, and `RecordActions` for the button the ticks act with.



import { Box, Checkbox, Flex, Text, type BoxProps } from "@chakra-ui/react";
import { LuCheck, LuCircleCheck } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ScrollFade } from "../../components/scroll-fade";
import {
  deceasedName,
  hasOtherDeceased,
  planholderName,
  type ServiceRecord,
} from "../service-payables-data";

/**
 * An ORDINARY row's height and the gap between two of them, measured at 52.5px
 * and rounded up so the tenth row is not clipped by a fraction.
 *
 * The chapel row's figure exactly: this row is that row's construction — two
 * lines of type over `py={2}` and a border — so a difference between the two
 * numbers would mean one of them had stopped being measured.
 *
 * NOT EVERY ROW IS THIS TALL ANY MORE (2026-08-26). A service whose deceased is
 * not the plan holder carries a third line naming them, so it stands about 15px
 * taller. Saving a record still cannot change a row's height, which is what the
 * fixed figure was for; what changes it is a fact about the service, and one
 * worth seeing from the rail.
 */
const ROW_HEIGHT = 53;
const ROW_GAP = 8;

/** How many rows the list shows before it scrolls — see {@link LIST_MAX_HEIGHT}. */
export const VISIBLE_ROWS = 10;

/**
 * Tallest the list gets on a desktop: ten ordinary rows, and the ninth gap
 * between them.
 *
 * The chapel list's rule, for the reason given there — a list should hold a
 * KNOWN NUMBER of items rather than however many a particular screen has room
 * for, so the same billing looks the same on a laptop and on a monitor.
 *
 * A CAP AND NOT A COUNT, which is the part that matters now that a row can be
 * three lines: a billing carrying assigned plans fits nine and a bit rather than
 * ten, and scrolls for the rest. The list is bounded either way, which is what
 * the rail needs of it.
 */
export const LIST_MAX_HEIGHT = `${
  VISIBLE_ROWS * ROW_HEIGHT + (VISIBLE_ROWS - 1) * ROW_GAP
}px`;

function PlanholderRow({
  service,
  selected,
  saved,
  verified,
  selectable,
  checked,
  onToggle,
  onSelect,
}: {
  service: ServiceRecord;
  selected: boolean;
  /** Whether this plan holder's service record has been saved. */
  saved: boolean;
  /** Whether this account already carries a verifier's signature. */
  verified: boolean;
  /** Whether the row offers a tick box — see the props on the list. */
  selectable: boolean;
  /** Whether it is ticked. Meaningless unless `selectable`. */
  checked: boolean;
  onToggle: () => void;
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
      // The chapel row's corner, for the reason spelled out there: a picked row
      // in a stack wants a nearly square edge, where a tile standing alone can
      // afford a rounder one. These two rows are one construction and a
      // difference here would be the first place they diverged.
      borderRadius="sm"
      // One even 1px edge whether or not the row is picked, and the ring that
      // used to double it dropped — the chapel row's treatment, for the reason
      // given there.
      borderColor={selected ? BRAND_COLORS.primaryGreen : "gray.200"}
      bg={selected ? "#f4faf6" : "white"}
      px={2.5}
      py={2}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: selected ? undefined : "gray.300" }}
    >
      <Flex justify="space-between" align="center" gap={2}>
        {/* THE TICK BOX, and only where there is something to tick FOR — see
            `selectable` on the list.

            IT DOES NOT OPEN THE ROW. Ticking and opening are two different
            intentions: a verifier reads one account at a time in the column
            opposite, and gathers several to sign in one go. If the tick also
            navigated, gathering five would drag the reading column through five
            records nobody asked to see — so the box swallows both the click and
            the key that reaches it, and the rest of the row still opens.

            A SIGNED ACCOUNT HAS NO BOX. The signature is written once
            (`verifyServices` refuses to re-stamp), so a box on a verified row
            could only ever offer to do nothing. The row wears the mark on its
            right instead. */}
        {selectable && !verified && (
          <Box
            flexShrink={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Checkbox.Root
              size="sm"
              checked={checked}
              onCheckedChange={onToggle}
              aria-label={`Select ${planholderName(service)}`}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
            </Checkbox.Root>
          </Box>
        )}

        {/* THE PLAN HOLDER LEADS. On the chapel list it is the code that leads,
            because a chapel is worked by its code; a plan holder is a person,
            and the LPA number under the name is what identifies them on the
            paperwork.

            It used to be the DECEASED's name up here, which was the same string
            in every ordinary row and quietly the wrong one in the rest: this is
            a list of plan holders, filed under the person who owns the plan. */}
        <Box minW={0} flex="1">
          <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
            {planholderName(service)}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {service.lpaNo}
          </Text>

          {/* A THIRD LINE, AND ONLY WHEN THE TWO NAMES DIFFER — the assigned
              plan, where the funeral this chapel is being paid for was not the
              plan holder's own (user-confirmed 2026-08-26).

              LABELLED, because an unlabelled second name under an LPA number is
              a riddle: nothing on the row would say which of the two people it
              is. The label is what makes the line worth the height.

              WHICH THE ROW GIVES UP ITS FIXED HEIGHT FOR, and that is the trade.
              Every row was two lines tall so a "Saved" mark could not change the
              shape of the list; these rows are three, so a billing with assigned
              plans on it is a slightly ragged column. The raggedness is the
              point — the rows that are different LOOK different, from the rail,
              without being opened. See {@link ROW_HEIGHT}. */}
          {hasOtherDeceased(service) && (
            <Flex align="baseline" gap={1} mt="1px" minW={0}>
              <Text
                fontSize="10px"
                fontWeight="600"
                color="gray.400"
                flexShrink={0}
                textTransform="uppercase"
                letterSpacing="0.02em"
              >
                Deceased
              </Text>
              <Text fontSize="11px" color="gray.600" truncate>
                {deceasedName(service)}
              </Text>
            </Flex>
          )}
        </Box>

        <Flex align="center" gap={1.5} flexShrink={0}>
          {/* THE AMOUNT IS GONE (user-confirmed 2026-08-26). It stood here in
              the chapel row's place, and on a chapel row the money is the point
              — a territory is worked by what each chapel is owed. A plan holder
              is not chosen by what their service is worth: they are chosen by
              WHO they are, and the figure is on the record beside this rail and
              in the billing's own table. What it cost was the width the names
              now have.

              Only when it has been SAVED — the same rule the billing number
              follows on the chapel row. Every row in an unworked list would
              otherwise carry "Not saved", which is what the list has in common
              and so tells the user nothing. */}
          {/* VERIFIED BEATS SAVED, and never stands beside it. Both say the
              same kind of thing — how far this row has been got with — and the
              signature is the later and larger of the two, so it takes the slot
              rather than crowding into it.

              IT IS WHAT MAKES "CHECK ALL" HONEST. Check all ticks the accounts
              that still want signing, which is a different set from the whole
              list the moment one has been signed; without a mark on the row the
              verifier would have no way of seeing which ones it skipped. */}
          {verified ? (
            <Flex align="center" gap="2px" color={BRAND_COLORS.darkGreen}>
              <LuCircleCheck size={11} />
              <Text fontSize="10px" fontWeight="600" whiteSpace="nowrap">
                Verified
              </Text>
            </Flex>
          ) : (
            saved && (
              <Flex align="center" gap="2px" color={BRAND_COLORS.darkGreen}>
                <LuCheck size={11} />
                <Text fontSize="10px" fontWeight="600" whiteSpace="nowrap">
                  Saved
                </Text>
              </Flex>
            )
          )}

          {/* NO MARK ON THE ROW (user-confirmed 2026-08-25). An (i) stood here,
              red and captioned "Discrepancy", and it was wrong twice over: it
              was drawn off `service.deficiency`, so a plan holder waiting on a
              copy of the LPA wore the mark that means an account should never
              have been serviced — and the discrepancy has its own notification
              now, View and Send on the record itself.

              What is outstanding on a plan holder is said where it is worked:
              the deficiency in the Documents section, the discrepancy on the
              record beside this rail. This list is navigation. */}
        </Flex>
      </Flex>
    </Box>
  );
}

export interface PlanholderServiceListProps {
  services: ServiceRecord[];
  /** The service id currently open in the main column. */
  selected?: string;
  onSelect: (serviceId: string) => void;
  /** Whether a given service's record has been saved. */
  isSaved: (serviceId: string) => boolean;
  /** Tallest the list may be before it scrolls inside itself. */
  maxHeight?: BoxProps["maxH"];
  /**
   * Whether the list FILLS its wrapper and scrolls inside it, rather than
   * growing to its content — see the same prop on `ChapelBillingList`. The rail
   * passes this and lets `railListBox` own both caps; the drawer does not, and
   * passes a `maxHeight` instead.
   */
  fills?: boolean;
  /**
   * Whether the rows carry a TICK BOX — the multi-select the verifier signs
   * with, and off everywhere else.
   *
   * ONE QUEUE HAS AN ACT TO GATHER ROWS FOR. Verifying is a signature against an
   * account and nothing else, so signing five is a coherent thing to want and
   * the whole point of the box. Terminating is a form save per plan holder —
   * there is nothing to batch, because each one has its own fields to fill. For
   * Approval and For Endorsement sign the BILLING, not the accounts. So the list
   * is plain navigation on three queues out of four, which is what it always
   * was.
   */
  selectable?: boolean;
  /** The ticked service ids. Meaningless unless `selectable`. */
  checkedIds?: string[];
  /** Tick or untick one row. */
  onToggle?: (serviceId: string) => void;
  /** Whether a given account already carries a signature — see the row's mark. */
  isVerified?: (serviceId: string) => boolean;
}

export function PlanholderServiceList({
  services,
  selected,
  onSelect,
  isSaved,
  maxHeight,
  fills = false,
  selectable = false,
  checkedIds = [],
  onToggle,
  isVerified,
}: PlanholderServiceListProps) {
  if (services.length === 0) {
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
          No plan holders
        </Text>
        <Text fontSize="11px" color="gray.400" mt={1}>
          This billing covers no services.
        </Text>
      </Box>
    );
  }

  return (
    // The list scrolls, not the page — `ScrollFade` for the same affordance it
    // brings to the chapel list: a half-visible row at a faded edge says there
    // is more, where a clipped list with no bar just looks finished.
    <ScrollFade
      role="listbox"
      aria-label="Planholders"
      maxH={maxHeight}
      flex={fills ? "1 1 auto" : undefined}
      minH={fills ? 0 : undefined}
    >
      <Flex direction="column" gap={2}>
        {services.map((service) => (
          <PlanholderRow
            key={service.id}
            service={service}
            selected={service.id === selected}
            saved={isSaved(service.id)}
            verified={isVerified?.(service.id) ?? false}
            selectable={selectable}
            checked={checkedIds.includes(service.id)}
            onToggle={() => onToggle?.(service.id)}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </Flex>
    </ScrollFade>
  );
}

export default PlanholderServiceList;
