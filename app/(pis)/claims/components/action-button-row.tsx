"use client";

// A row of equal-width labelled buttons — the claims area's way of putting a
// set of whole-object actions on the face of the page instead of behind a tap.
//
// Extracted from the plan holder profile's own plan actions so the claim's
// actions can be the same thing: one definition, so a row of buttons above the
// plan holder card cannot drift from a row of buttons above the claims.

import { forwardRef } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { BaseButton } from "st-peter-ui";

export interface ActionButtonRowItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface ActionRowButtonProps {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
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
>(({ label, icon: Icon, ...rest }, ref) => (
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
    minH="32px"
    px={2}
    py="6px"
    fontSize="xs"
    // Icon over label: side by side, the icon takes a third of a column this
    // narrow away from the words.
    flexDirection="column"
    gap="2px"
    whiteSpace="normal"
    textAlign="center"
    lineHeight="1.25"
    {...rest}
  >
    <Icon />
    {label}
  </BaseButton>
));
ActionRowButton.displayName = "ActionRowButton";

export function ActionButtonRow({
  actions,
  columns = 3,
  maxW = "420px",
  after,
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
          onClick={onClick}
        />
      ))}
      {after}
    </SimpleGrid>
  );
}

export default ActionButtonRow;
