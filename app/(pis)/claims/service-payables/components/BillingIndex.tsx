"use client";

// The index beside the For Process stack — every billing on the page, one
// slim row each, for jumping around a long accordion.
//
// WHY IT EXISTS. The accordion made the whole queue the page, and that is
// right until a card is opened: a twelve-row chapel unfolds to a full screen,
// and every closed head below it goes under the fold. The index is the queue
// AT A GLANCE again — always on screen, because the rail is sticky — and a row
// of it is a way back to any card without scrolling past an open one.
//
// IT MATTERS MORE SINCE THE STACK WENT ONE-AT-A-TIME (2026-08-25). Opening a
// billing now closes the one before it, so moving between two chapels is a
// round trip rather than a glance — and this rail is what makes that trip one
// click from anywhere on the page.
//
// FLAT ROWS, NOT CARDS — the 2026-08-24 redesign. Each row wore a border and
// a white surface, which dressed an index up as a second stack of cards: the
// heaviest thing in the rail was its chrome. An index is a list of names, so
// the rows are bare — a hover says "clickable", and the only box anywhere on
// the rail is the accordion it points at.
//
// NO HIGHLIGHT ON OPEN ROWS, and that is deliberate: this rail is a working
// shortcut, not a second statement of the stack's state. The one thing that
// admits which cards are open is the eye itself, because show/hide is what it
// operates — everything else stays quiet so a processor scanning for a code
// reads names, not states.
//
// TWO CLICKS, TWO MEANINGS, split the way a password field splits them:
//
//   the ROW      "take me there" — always OPENS the card and scrolls to it.
//                Asking for a billing and landing on a folded head would
//                answer the click with a second click.
//   the EYE      show/hide, revealed on hover exactly as a password field's
//                is. It TOGGLES, which since the stack went one-at-a-time
//                leaves it one job the row cannot do: CLOSING the open card
//                without opening another, so the queue goes back to being all
//                closed heads and can be read end to end.
//
// DESKTOP ONLY — the page hides the rail while stacked. Closed accordion heads
// are themselves a compact list; an index above them would be the same list
// twice at two sizes.
//
// WHAT LEADS A ROW DEPENDS ON THE STAGE (`lead`, 2026-08-26). For Process is a
// queue of billings that mostly have no number yet, so the CODE is the only
// identifier every row is guaranteed to have and it leads. Past that stage every
// billing has been created, and the number is what it is quoted by outside this
// system — on the voucher, in the email, down the phone — so on For Verification
// the two swap places. Neither is ever dropped: the one that does not lead sits
// on the second line.

import { Box, Button, Checkbox, Flex, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuEye, LuEyeOff } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { FieldLabel } from "../../components/field-label";
import {
  splitBillingCode,
  type ServiceBilling,
} from "../service-payables-data";

export interface BillingIndexProps {
  /** The billings the stack is showing, in the stack's own order. */
  billings: ServiceBilling[];
  /**
   * The one unfolded card, or null — the page's own state, so the rows agree.
   *
   * Singular since 2026-08-25: the stack shows one billing at a time. See the
   * note on `openCode` in the For Process page.
   */
  openCode: string | null;
  /**
   * The row's click: make sure the card is SHOWING and travel to it. Never
   * closes — see the two-clicks note above.
   */
  onReveal: (billingCode: string) => void;
  /**
   * The eye's click: show or hide the card in place. The page scrolls only
   * when this reveals — hiding is tidying, not travelling.
   */
  onToggle: (billingCode: string) => void;
  /**
   * Which identifier heads a row — see the note at the top.
   *
   * `"code"` is For Process's and the default. `"number"` is every stage after
   * it, where the billing has been created and the number is what it is quoted
   * by. A row asked to lead with a number it does not have falls back to the
   * code rather than printing a blank line.
   */
  lead?: "code" | "number";
  /**
   * BATCH SELECTION — a tick beside every billing number, and a bar under the
   * list that acts on what is ticked.
   *
   * WHY IT IS HERE AND NOT ON THE CARDS (user, 2026-08-27). The old screen
   * approves in bulk: a processor reads down a list of BILLING NUMBERS, ticks
   * the ones that are good and puts them through together. This rail IS that
   * list — it is already on screen beside the stack, already one row per
   * billing, already captioned "Billing Nos." — so the ticks belong on it rather
   * than on a surface invented to hold them.
   *
   * THE SELECTION IS ON BILLINGS AND NEVER ON ACCOUNTS, which is the rule that
   * keeps this coherent with the accounts table having no tick boxes at all: an
   * approver ticking accounts would be expressing a per-account approval the
   * business does not have. One level up, the same gesture is exactly right.
   *
   * IT DOES NOT REPLACE THE SINGLE ACT. The card's foot and the record's rail
   * still carry an Approve for the one billing in front of you — same hook, same
   * write. This is the same act at a different scale: "I have read these five,
   * put them all through".
   *
   * ONE PROP OBJECT rather than four loose ones, because they are meaningless
   * apart — a `selected` with no `onChange` is a list nobody can change, and an
   * action with nothing selected acts on nothing. Absent on every queue that
   * does not batch, which is how For Process and For Verification get the index
   * they have always had.
   */
  selection?: {
    /** The ticked billing codes — held by the page, so the rows agree. */
    selected: string[];
    onChange: (billingCodes: string[]) => void;
    /** The bar's button, given how many are ticked. */
    actionLabel: (count: number) => string;
    onAction: () => void;
  };
}

export function BillingIndex({
  billings,
  openCode,
  onReveal,
  onToggle,
  lead = "code",
  selection,
}: BillingIndexProps) {
  const leadsWithNumber = lead === "number";

  /** Whether a row carries a tick — see {@link BillingIndexProps.selection}. */
  const selectable = Boolean(selection);
  const selected = selection?.selected ?? [];

  const toggleSelected = (billingCode: string) =>
    selection?.onChange(
      selected.includes(billingCode)
        ? selected.filter((code) => code !== billingCode)
        : [...selected, billingCode],
    );

  /**
   * The select-all beside the caption, in the three states a header tick has:
   * all, none, and some. `"indeterminate"` is the kit's own value for the third
   * — a dash rather than a tick — which is what stops a half-selection reading
   * as an empty one.
   */
  const allSelected = billings.length > 0 && selected.length === billings.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () =>
    selection?.onChange(
      allSelected ? [] : billings.map((billing) => billing.billingCode),
    );

  return (
    <>
      {/* The caption names what the rows LEAD with, since that is what someone
          scanning the rail is matching against — see the note at the top on why
          that differs by stage. */}
      <Flex align="center" gap={2} flexShrink={0}>
        {/* THE SELECT-ALL, in the caption's own row — where a table keeps it,
            and the only place in a list of bare rows that reads as "all of
            these" rather than as one more row. */}
        {selectable && (
          <Checkbox.Root
            size="sm"
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
            aria-label={allSelected ? "Clear selection" : "Select every billing"}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        )}
        <FieldLabel>{leadsWithNumber ? "Billing Nos." : "Billing Codes"}</FieldLabel>
      </Flex>

      {/* THE ONE THING IN THE RAIL THAT GIVES — the rail is bounded and
          sticky, so the list shrinks into what is left and scrolls inside
          itself rather than pushing anything off screen. */}
      <Flex
        direction="column"
        gap="1px"
        overflowY="auto"
        flex="1 1 auto"
        minH={0}
        pr={0.5}
      >
        {billings.map((billing) => {
          const open = openCode === billing.billingCode;
          // FINISHED THIS VISIT — and only meaningful where finishing is
          // something that can happen while you watch. On a stage whose every
          // billing is already processed the same tick would be on every row,
          // marking nothing; `leadsWithNumber` is exactly the set of stages
          // where that is true.
          const done = !leadsWithNumber && billing.stage === "processed";
          const code = splitBillingCode(
            billing.billingCode,
            billing.chapelCode,
          );
          /** Lead with the number where the stage has one to lead with. */
          const numberLeads = leadsWithNumber && Boolean(billing.billingNo);

          return (
            // A div with a button's role, not a <button> — the eye inside is a
            // real button, and a button may not contain one. `HeldList` rows
            // are built the same way for the same reason.
            <Flex
              key={billing.billingCode}
              role="button"
              tabIndex={0}
              onClick={() => onReveal(billing.billingCode)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onReveal(billing.billingCode);
                }
              }}
              aria-expanded={open}
              align="center"
              gap={2}
              px={2}
              py={1.5}
              flexShrink={0}
              borderRadius="md"
              cursor="pointer"
              transition="background 0.12s ease"
              _hover={{ bg: "gray.100" }}
              // The eye is INVISIBLE UNTIL ASKED FOR — hover or keyboard focus
              // anywhere in the row — the way a password field's is. It keeps
              // its space either way, so rows do not shift as the pointer
              // moves down the list.
              css={{
                "&:hover .billing-index-eye, &:focus-within .billing-index-eye":
                  { opacity: 1 },
              }}
            >
              {/* THE ROW'S TICK. Its click is stopped, or every tick would also
                  travel to the card — the same guard the eye below carries, and
                  it works here for the reason it works there: the handler being
                  silenced is an ANCESTOR's, so the box's own change still fires.
                  (The kit's table taught this the other way round — a guard
                  placed above the checkbox silences the checkbox itself.) */}
              {selectable && (
                <Checkbox.Root
                  size="sm"
                  flexShrink={0}
                  checked={selected.includes(billing.billingCode)}
                  onCheckedChange={() => toggleSelected(billing.billingCode)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  aria-label={`Select ${
                    numberLeads ? billing.billingNo : billing.billingCode
                  }`}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              )}

              <Box minW={0} flex="1">
                {/* THE CODE, WEIGHTED THE WAY THE CARDS WEIGHT IT — handle at
                    reading contrast, shared cut-month-year dropped back. This
                    rail is where the effect matters most: the codes sit
                    directly under one another with nothing between them, so an
                    undifferentiated list is a column of near-identical strings
                    and the index stops being an index. See `splitBillingCode`.

                    The chapel name is NOT added here, though the cards lead
                    with it. The rail is a finding aid for a stack that already
                    names every chapel in full — a second line per row would
                    double the rail's height to repeat what is on screen beside
                    it.

                    WHERE THE NUMBER LEADS this is the second line instead, and
                    the split does the same work one rung down: the numbers above
                    differ only in their last digits, so the code underneath is
                    what a reader recognises the chapel by. */}
                {numberLeads ? (
                  <>
                    {/* THE NUMBER, WHOLE AND AT FULL CONTRAST. Not split the way
                        the code is: it is nine characters against the code's
                        twelve, and what varies down a staff's list is the tail
                        rather than the head — dimming the "B26" every row shares
                        would leave the loud half of each row a bare sequence
                        with no idea what it belongs to. Short enough that the
                        eye finds the difference unaided. */}
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      color="gray.700"
                      truncate
                      letterSpacing="0.02em"
                    >
                      {billing.billingNo}
                    </Text>
                    <Text fontSize="10px" truncate letterSpacing="0.02em">
                      <Text as="span" fontWeight="600" color="gray.500">
                        {code.handle}
                      </Text>
                      <Text as="span" fontWeight="600" color="gray.400">
                        {code.period}
                      </Text>
                    </Text>
                  </>
                ) : (
                  <>
                    <Text fontSize="11px" truncate letterSpacing="0.02em">
                      <Text as="span" fontWeight="700" color="gray.700">
                        {code.handle}
                      </Text>
                      <Text as="span" fontWeight="600" color="gray.400">
                        {code.period}
                      </Text>
                    </Text>
                    {/* The number, once minted — the identity the billing is
                        quoted by outside this system, so an index of billings
                        carries it the moment it exists. */}
                    {billing.billingNo && (
                      <Text
                        fontSize="10px"
                        fontWeight="600"
                        color={BRAND_COLORS.primaryGreen}
                        truncate
                      >
                        {billing.billingNo}
                      </Text>
                    )}
                  </>
                )}
              </Box>

              {/* Finished this visit — the one state mark the index repeats,
                  because it is the one that says "nothing left to do here". */}
              {done && (
                <Box
                  flexShrink={0}
                  color={BRAND_COLORS.darkGreen}
                  display="flex"
                >
                  <LuCircleCheck size={13} />
                </Box>
              )}

              {/* The show/hide eye. A real button so it is its own tab stop
                  and its own click — stopped from bubbling, or every hide
                  would be undone by the row's own reveal. */}
              <Box
                as="button"
                className="billing-index-eye"
                // Named by whatever the row LEADS with, so the spoken label and
                // the visible one are the same string.
                aria-label={`${open ? "Hide" : "Show"} ${
                  numberLeads ? billing.billingNo : billing.billingCode
                }`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggle(billing.billingCode);
                }}
                opacity={0}
                transition="opacity 0.12s ease"
                color="gray.400"
                _hover={{ color: "gray.600" }}
                display="flex"
                flexShrink={0}
                cursor="pointer"
              >
                {open ? <LuEyeOff size={13} /> : <LuEye size={13} />}
              </Box>
            </Flex>
          );
        })}
      </Flex>

      {/* THE BATCH BAR, under the list and OUTSIDE its scroller — the list is
          the one thing in this rail that gives, so a bar inside it would scroll
          away from the selection it describes.

          ONLY ONCE SOMETHING IS TICKED. A bar standing empty on every visit
          would report the resting state of a control as though it were news,
          which is the rule the card's own selection line and the chips on its
          head are both built on. Its Clear is what puts the rail back.

          IT NAMES THE COUNT, not "Approve selected": the difference between
          "press this" and "press this, and here is exactly what it will sign" —
          and it is the last thing read before a batch that cannot be taken
          back. */}
      {selection && selected.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          gap={2}
          mt={2}
          pt={2}
          flexShrink={0}
          borderTopWidth="1px"
          borderColor="gray.200"
        >
          <Box
            as="button"
            onClick={() => selection.onChange([])}
            fontSize="11px"
            fontWeight="600"
            color="gray.500"
            _hover={{ color: "gray.700" }}
            cursor="pointer"
            flexShrink={0}
          >
            Clear
          </Box>

          <Button
            size="xs"
            bg={BRAND_COLORS.primaryGreen}
            color="white"
            borderRadius="lg"
            flexShrink={0}
            minW={0}
            _hover={{ bg: BRAND_COLORS.darkGreen }}
            onClick={selection.onAction}
          >
            <LuCircleCheck size={13} />
            <Text as="span" truncate>
              {selection.actionLabel(selected.length)}
            </Text>
          </Button>
        </Flex>
      )}
    </>
  );
}

export default BillingIndex;
