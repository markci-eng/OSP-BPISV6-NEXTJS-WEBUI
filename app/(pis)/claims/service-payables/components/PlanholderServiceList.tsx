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

/**
 * The same row, tightened — the conveyor's rail (user, 2026-09-11: "maybe the
 * selection of the planholder would be more compact to accommodate the
 * buttons").
 *
 * WHAT IT BUYS. The conveyor's rail carries a stage card, the billing, the
 * progress, this list and two lookups, and it splits on the viewport now — so on
 * a 1024px shell it has less room than the workspaces this list was drawn for.
 * Ten compact rows come to 484px against 602, which is the 118px the block above
 * and the buttons below needed.
 *
 * WHAT IT DOES NOT TOUCH is the NAME. The row is read by its name and nothing
 * else on it is worth a pixel taken from that, so the leading line keeps its
 * size and weight; what gives is the padding, the gap and the LPA line — the
 * number is confirmed once, at a glance, not read across the list.
 */
const COMPACT_ROW_HEIGHT = 32;
const COMPACT_ROW_GAP = 6;

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

/**
 * FIVE ROWS, NOT TEN (user, 2026-09-11) — and, since the same day, A PHONE'S CAP
 * RATHER THAN THE LIST'S.
 *
 * IT IS WHAT PUT THE COMMIT BACK IN THE RAIL. Terminate had moved to the foot of
 * the record because the rail spent 711px before reaching it on a phone; five
 * rows is 184px against ten rows' 374, and that 190px is the difference between
 * a rail that runs past the fold and one that ends — stage card, billing,
 * accounts and controls — inside a single screen. A button that is always on
 * screen does not need to follow the reading.
 *
 * WHY IT NO LONGER BINDS A DESKTOP (user, 2026-09-11: "when the screen is long
 * allowed to display more planholder as long as the buttons will be shown"). The
 * figure was measured against the WORST screen the rail has to survive, and
 * applying it to every screen made a 1080px monitor draw five rows where fifteen
 * would have fitted above the commit untouched. Beside the record the rail is a
 * bounded flex column and the browser will shrink this list to whatever is left
 * — so the bound does the capping, per screen, and does it better than a
 * constant can. See `conveyorListBox`.
 *
 * STACKED THERE IS NO SUCH BOUND to hand the job to: the rail is an ordinary
 * block on a scrolling page, so this is still what keeps the button above the
 * fold. What it costs there is that a billing of more than five accounts scrolls
 * inside the list, which is the right thing to spend — the list is NAVIGATION,
 * and a navigation list that scrolls is normal where a commit below the fold is
 * not. The count above it says how many there are, so nothing is hidden, only
 * out of view.
 */
export const COMPACT_VISIBLE_ROWS = 5;

/** {@link LIST_MAX_HEIGHT} for the compact row — five rows, and four gaps. */
export const LIST_MAX_HEIGHT_COMPACT = `${
  COMPACT_VISIBLE_ROWS * COMPACT_ROW_HEIGHT +
  (COMPACT_VISIBLE_ROWS - 1) * COMPACT_ROW_GAP
}px`;

/**
 * WHOSE NAME A ROW IS FILED UNDER.
 *
 * TWO ANSWERS, AND EACH IS RIGHT FOR ITS SCREEN:
 *
 *   `planholder`  the person who OWNS the plan, which is what a list titled
 *                 "Planholders" is a list of. An assigned plan then carries the
 *                 deceased on a third line, labelled, because the row would
 *                 otherwise not say which of two people it is about.
 *
 *   `deceased`    the person the SERVICE was rendered for — the conveyor's
 *                 answer (user, 2026-09-11). Service payables pays a chapel for
 *                 a funeral, and the funeral was for the deceased; the processor
 *                 working down this rail is matching it against a chapel's
 *                 report, which names the person buried. It also removes the
 *                 third line outright: there is no second person left to name
 *                 once the deceased is the one on top.
 *
 * IN THE ORDINARY ROW THE TWO ARE THE SAME STRING — every plan in the seed is
 * held by the person it covers — so this only ever differs on an assigned plan,
 * which is exactly the row the third line existed for.
 */
export type ServiceRowLead = "planholder" | "deceased";

/** The name at the head of a row, per {@link ServiceRowLead}. */
function leadName(service: ServiceRecord, lead: ServiceRowLead): string {
  return lead === "deceased" ? deceasedName(service) : planholderName(service);
}

function PlanholderRow({
  service,
  selected,
  saved,
  verified,
  selectable,
  checked,
  lead,
  compact,
  onToggle,
  onSelect,
}: {
  service: ServiceRecord;
  selected: boolean;
  /** Whose name heads the row — see {@link ServiceRowLead}. */
  lead: ServiceRowLead;
  /** The tightened row — see {@link COMPACT_ROW_HEIGHT}. */
  compact: boolean;
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
      py={compact ? 1.5 : 2}
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
              aria-label={`Select ${leadName(service, lead)}`}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
            </Checkbox.Root>
          </Box>
        )}

        {/* WHOSE NAME LEADS — see {@link PlanholderServiceListProps.lead}, which
            is where the two answers are argued. `planholder` keeps the third
            line for an assigned plan; `deceased` does not need one, because the
            name it would have carried is already the one on top. */}
        {/* THE NAME, AND THE LPA BESIDE IT RATHER THAN UNDER IT when compact
            (user, 2026-09-11: "move the lpa in the right most. So the name and
            it is on the same row").

            IT IS A TRADE OF WIDTH FOR HEIGHT, and on this rail height is the
            scarce one: the row goes from two lines to one — 32px against 46 —
            so ten of them cost 374px where they cost 484. That is what pays for
            the stage card, the billing block and the two lookups all being on
            screen at once in a rail that now splits at a 1024px shell.

            WHAT IT COSTS is the name's width, and the name is what the row is
            read by — so the name takes every pixel the row has spare (`flex 1`,
            truncating) and the number takes only what it needs. The number is
            CONFIRMED at a glance against a report, not read across the list,
            which is why it is the one that yields nothing and still sits
            second. */}
        {compact ? (
          <>
            <Text
              minW={0}
              flex="1"
              fontSize="xs"
              fontWeight="700"
              color="gray.800"
              truncate
            >
              {leadName(service, lead)}
            </Text>
            <Text
              flexShrink={0}
              fontSize="10.5px"
              fontFamily="mono"
              color="gray.500"
              whiteSpace="nowrap"
            >
              {service.lpaNo}
            </Text>
          </>
        ) : (
        <Box minW={0} flex="1">
          <Text fontSize="xs" fontWeight="700" color="gray.800" truncate>
            {leadName(service, lead)}
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
              without being opened. See {@link ROW_HEIGHT}.

              NOT DRAWN AT ALL WHEN THE DECEASED LEADS: the line exists to name
              the second person, and when the deceased is the one on top there is
              no second person left to name. */}
          {lead === "planholder" && hasOtherDeceased(service) && (
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
        )}

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
          {/* THE WORD GOES WHEN THE ROW IS ONE LINE. "Verified" and "Saved"
              cost about 40px, and on a single-line row that is 40px taken from
              the NAME — the one thing the row is read by. The tick alone says
              the same thing in a list where a mark either is or is not there,
              and the word survives in the `title` for anyone who wants it. */}
          {verified ? (
            <Flex
              align="center"
              gap="2px"
              color={BRAND_COLORS.darkGreen}
              title={compact ? "Verified" : undefined}
            >
              <LuCircleCheck size={11} />
              {!compact && (
                <Text fontSize="10px" fontWeight="600" whiteSpace="nowrap">
                  Verified
                </Text>
              )}
            </Flex>
          ) : (
            saved && (
              <Flex
                align="center"
                gap="2px"
                color={BRAND_COLORS.darkGreen}
                title={compact ? "Saved" : undefined}
              >
                <LuCheck size={11} />
                {!compact && (
                  <Text fontSize="10px" fontWeight="600" whiteSpace="nowrap">
                    Saved
                  </Text>
                )}
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
  /**
   * Whose name heads each row — see {@link ServiceRowLead}, where the choice is
   * argued.
   *
   * DEFAULTED TO THE PLAN HOLDER, which is what every caller wanted before the
   * conveyor: the archived workspaces file this list under the person who owns
   * the plan, and a default keeps them reading exactly as they did.
   */
  lead?: ServiceRowLead;
  /**
   * Tighter rows — see {@link COMPACT_ROW_HEIGHT} for what gives and what does
   * not. Off by default, so the archived workspaces are unchanged.
   */
  compact?: boolean;
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
  lead = "planholder",
  compact = false,
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
      <Flex direction="column" gap={compact ? 1.5 : 2}>
        {services.map((service) => (
          <PlanholderRow
            key={service.id}
            service={service}
            selected={service.id === selected}
            saved={isSaved(service.id)}
            verified={isVerified?.(service.id) ?? false}
            selectable={selectable}
            checked={checkedIds.includes(service.id)}
            lead={lead}
            compact={compact}
            onToggle={() => onToggle?.(service.id)}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </Flex>
    </ScrollFade>
  );
}

export default PlanholderServiceList;
