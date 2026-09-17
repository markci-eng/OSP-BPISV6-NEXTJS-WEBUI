"use client";

// A row of equal-width labelled buttons — the claims area's way of putting a
// set of whole-object actions on the face of the page instead of behind a tap.
//
// Extracted from the plan holder profile's own plan actions so the claim's
// actions can be the same thing: one definition, so a row of buttons above the
// plan holder card cannot drift from a row of buttons above the claims. That is
// also why the colours are set on the button below rather than at either call
// site — the plan actions and the claim's actions are the same control, and
// there is nowhere to change one without the other.

import { forwardRef } from "react";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { BaseButton } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface ActionButtonRowItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface ActionRowButtonProps {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  /**
   * Tighter padding and smaller type.
   *
   * OPT-IN, so the two screens already using this row are untouched. It exists
   * for the conveyor's rail, which stacks NINE of these in one block: at the
   * standard size that is 200px of buttons above the first thing a processor
   * actually reads. Three of something is a row of controls; nine of it is a
   * wall, and the fix is to make each one cost less rather than to hide some.
   */
  compact?: boolean;
}

/**
 * One button of the row, on its own.
 *
 * Exported because a caller sometimes needs to wrap it — a menu trigger, most
 * of all, which has to be the button itself rather than something beside it.
 * Forwards its ref and any extra props for exactly that: `Menu.Trigger asChild`
 * hands down a ref, an id and the handlers that open the menu.
 */
export const ActionRowButton = forwardRef<
  HTMLButtonElement,
  ActionRowButtonProps
>(({ label, icon: Icon, compact = false, ...rest }, ref) => (
  <BaseButton
    ref={ref}
    // `BaseButton` with the same variant/size the `SecondarySmButton` pill
    // uses, rather than that pill itself: the locked buttons drop `height` and
    // the paddings, and a label on two lines needs a button that grows past the
    // one-line height they fix.
    variant="outline"
    size="sm"
    width="100%"
    height="auto"
    minH={compact ? "26px" : "32px"}
    // Room enough that a label wrapping to two lines is not pressed against the
    // border on any side. `px` stays the tighter of the two on purpose: the
    // columns are narrow and every pixel taken here is a pixel of label, which
    // is what decides whether a third line appears.
    px={compact ? "6px" : "10px"}
    py={compact ? "4px" : 2}
    // `xs`, the size {@link InfoLabel} sets its LABEL at — so a button's name
    // and a card's field name are the same size wherever they sit next to each
    // other in the rail. Briefly `sm`, which cost 5px of row height for nothing
    // the labels needed; height in the rail is shared with the claims and the
    // folder — see the note on `PLAN_ACTION_COLUMNS`.
    fontSize={compact ? "10px" : "xs"}
    // Icon over label: side by side, the icon takes a third of a column this
    // narrow away from the words.
    flexDirection="column"
    gap={compact ? "2px" : "3px"}
    whiteSpace="normal"
    textAlign="center"
    lineHeight="1.25"
    /* The row's colours, taken from the cards these buttons sit among rather
       than from the brand.

       The library's outline button is brand green, border and label both. Three
       of them stacked in the rail under the search box, and a fourth row of them
       over the claim's details, put the page's strongest colour on its least
       important controls — none of these is the thing a user came to the page to
       do, and two of the three are not even wired up yet. Green there also
       spends the colour that ought to mean "this one": with everything green,
       nothing is.

       So they take the card's own values exactly — `gray.200` border, `gray.800`
       label, white ground, the same three the beneficiary and plan cards use.

       Set as style props rather than by asking for a different variant: the
       library has no neutral outline, and these override the green one's own
       colours — including on hover, which would otherwise go back to green the
       moment the pointer landed. */
    color="gray.800"
    borderColor="gray.200"
    bg="white"
    // Hover is the one place they part company with a card: a card is not
    // pressable and these are, so the border firms and the ground greys.
    _hover={{ bg: "gray.50", borderColor: "gray.300", color: "gray.800" }}
    _active={{ bg: "gray.100" }}
    {...rest}
  >
    {/* The ICON is the exception, and the only brand colour left on the control:
        the same `primaryGreen` the navigation draws its icons in, so a mark in
        this app is green wherever it appears. It works here for the reason green
        did not work on the border and the label — a coloured glyph identifies an
        action at a glance without making the whole button shout.

        Wrapped rather than coloured through the button: react-icons draw with
        `currentColor`, so the icon would otherwise take the label's grey — and
        setting the BUTTON green would take the label with it. The wrapper is
        what lets the two differ. `display: flex` so the box is the glyph's size
        and adds no line of its own. */}
    <Box
      display="flex"
      color={BRAND_COLORS.primaryGreen}
      // react-icons default to `1em`, so the glyph follows whatever font size
      // it is standing in. Compact drops the label to 10px, and an icon that
      // small reads as a smudge rather than a mark — so the wrapper holds the
      // glyph at its full-size dimension and only the words get smaller.
      fontSize={compact ? "14px" : undefined}
    >
      <Icon />
    </Box>

    <Text
      fontSize={compact ? "10px" : "xs"}
      color="gray.500"
      letterSpacing="-0.1px"
      lineHeight="1.25"
    >
      {label}
    </Text>
  </BaseButton>
));
ActionRowButton.displayName = "ActionRowButton";

export function ActionButtonRow({
  actions,
  columns = 3,
  maxW = "420px",
  after,
  compact = false,
}: {
  actions: ActionButtonRowItem[];
  /**
   * How many across. The count is a layout choice, not a wrapping hint: a
   * caller with three long labels passes three, and one with five short ones
   * passes five.
   */
  columns?: number;
  /**
   * Widest the row may be. Without it, a row given a full page column becomes
   * buttons the width of a paragraph with two words in the middle. Columns
   * narrower than this are unaffected.
   */
  maxW?: string;
  /**
   * An extra cell after the actions — a menu trigger, typically. Rendered as a
   * grid child, so it should be (or contain) a single {@link ActionRowButton}.
   */
  after?: React.ReactNode;
  /**
   * The smaller button — {@link ActionRowButton}'s own `compact`, which this
   * row could not reach until now.
   *
   * IT IS WHAT THE DEATH CLAIM'S RAIL USES. `ClaimActions` assembles its own
   * grid precisely so it can pass `compact` to every cell, so a caller wanting
   * the same button had to copy the grid to get it. Exposing it here means a
   * rail can have the small button without owning a second copy of the layout.
   */
  compact?: boolean;
}) {
  return (
    // Equal columns rather than a wrapping flex row: sized to their labels
    // these come to more than the column they sit in is wide, and a wrapping
    // row would drop the last onto a line of its own. In equal columns the
    // label wraps inside its own button instead and the grid levels the rest.
    <SimpleGrid columns={columns} gap={2} maxW={maxW}>
      {actions.map(({ label, icon, onClick }) => (
        <ActionRowButton
          key={label}
          label={label}
          icon={icon}
          compact={compact}
          onClick={onClick}
        />
      ))}
      {after}
    </SimpleGrid>
  );
}

export default ActionButtonRow;
