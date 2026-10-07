"use client";

// EVERY ACTION IN THE RAIL, in one block of six, UNDER the plan holder card.
//
// Three on the plan first — Print SOA, Cancel Plan Termination, Consider Plan —
// off `PLAN_ACTIONS`, the same list the profile's own row reads. Then what is
// left of the claim's: Print, Edit, and the overflow menu.
//
// VERIFY AND ENDORSE ARE GONE, and their absence is the conveyor's whole
// argument. On the plan holder's claim detail they are steps a processor takes
// by hand — confirm the details check out, then choose which desk the claim goes
// to next. Here the verdict buttons at the foot of the claim do both: approving
// IS the confirmation, and `decideClaim` already records who it now sits with.
// Leaving the manual pair beside them would offer two routes to one outcome and
// let a claim be endorsed without ever being answered.
//
// DELETE IS IN THE MENU, NOT ON A BUTTON. It is the one action here that cannot
// be taken back, and a button of its own puts it a single mis-click from the
// Edit beside it — in a rail whose buttons are deliberately small and close
// together. Behind the overflow it costs a click, which is the right price for
// the only irreversible thing on the screen.
//
// THE ORDER IS THE ARGUMENT FOR THE PLACEMENT. The plan's three sit immediately
// below the card naming the plan, so read down the rail it is one thought: here
// is the plan, here is what you can do to it, and then here is what you can do to
// the claim beside it.
//
// THREE ACROSS, and all six one height — `gridAutoRows="1fr"`. "Cancel Plan
// Termination" wraps to two lines and no other label does, so left alone its row
// would stand taller than the other and the block would read as two controls
// stapled together. Equal rows, and the buttons stretch into them.
//
// AND ALL SIX ARE `compact`. See the prop on `ActionRowButton` — it is opt-in
// precisely so the screens showing these at full size are untouched.

import type { ElementType, ReactNode } from "react";
import { Box, Flex, Menu, Portal, SimpleGrid, Text } from "@chakra-ui/react";
import { LuEllipsis } from "react-icons/lu";
import { toast } from "sonner";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ActionRowButton } from "../../components/action-button-row";
import {
  DELETE_ACTION,
  EDIT_ACTION,
  ENDORSE_ACTION,
  MORE_CLAIM_ACTIONS,
  PRIMARY_CLAIM_ACTIONS,
  VERIFY_ACTION,
} from "../../components/claim-action-items";
import { PLAN_ACTIONS } from "../../components/plan-action-items";
import { PRINT_SOA_LABEL, printSoa } from "../../components/print-soa";
import type { DeathClaim } from "../death-claims-data";
import { CountBubble } from "./mobile-quick-access";

/**
 * The claim actions this screen does NOT put on a button.
 *
 * SELECTED OUT OF THE SHARED LIST rather than written as a list of its own, so
 * the labels and icons still come from one place and this screen only states
 * what it does differently. Verify and Endorse are dropped entirely; Delete
 * moves to the menu, which is why it is named separately below.
 */
const WITHHELD = [VERIFY_ACTION, ENDORSE_ACTION, DELETE_ACTION];

/** Print and Edit — what is left with a button of its own. */
const BUTTON_ACTIONS = PRIMARY_CLAIM_ACTIONS.filter(
  (action) => !WITHHELD.includes(action.label),
);

/**
 * The menu: Delete at the top, then the legacy toolbar rest.
 *
 * FIRST, because it is the only reason a processor opens this menu with
 * something in mind — everything under it is a document to produce. Its own
 * entry already carries the red icon the shared list gives it.
 */
const MENU_ACTIONS = [
  ...PRIMARY_CLAIM_ACTIONS.filter((action) => action.label === DELETE_ACTION),
  ...MORE_CLAIM_ACTIONS,
];

/** Delete alone — the phone's list keeps it last, in a group of its own. */
const DELETE_ITEMS = PRIMARY_CLAIM_ACTIONS.filter(
  (action) => action.label === DELETE_ACTION,
);

/**
 * One group of the phone's list: a white block of rows on the sheet's grey,
 * under a small heading when it has one. Service Payables' Actions sheet is
 * built from the same two pieces.
 */
export function ActionGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Box>
      {title && (
        <Text
          fontSize="10px"
          fontWeight="700"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="gray.400"
          mb={1.5}
        >
          {title}
        </Text>
      )}
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.100"
        borderRadius="xl"
        overflow="hidden"
        css={{ "& > button + button": { borderTopWidth: "1px" } }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** One action as a full-width row — 48px, the touch minimum. */
export function ActionListRow({
  label,
  icon: Icon,
  iconColor,
  count,
  detail,
  danger,
  disabled,
  onClick,
}: {
  label: string;
  icon: ElementType;
  iconColor?: string;
  /** Corrections waiting — Edit only. */
  count?: number;
  /** What the row will act on, on its right — e.g. the next account's number. */
  detail?: ReactNode;
  /** Delete: the label goes red as well as the icon. */
  danger?: boolean;
  /** Nothing to act on right now — greyed and not pressable. */
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      as="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      align="center"
      gap={3}
      w="full"
      minH="48px"
      px={3.5}
      textAlign="left"
      borderColor="gray.100"
      cursor="pointer"
      _active={{ bg: "gray.50" }}
      _disabled={{ opacity: 0.45, cursor: "not-allowed", _active: { bg: "transparent" } }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: BRAND_COLORS.primaryGreen,
        outlineOffset: "-2px",
      }}
      aria-label={
        count
          ? `${label}, ${count} planholder change${count === 1 ? "" : "s"}`
          : undefined
      }
    >
      <Box color={iconColor ?? BRAND_COLORS.darkGreen} flexShrink={0}>
        <Icon size={18} />
      </Box>
      <Text
        flex="1"
        minW={0}
        fontSize="sm"
        color={danger ? BRAND_COLORS.destructiveRed : "gray.800"}
        truncate
      >
        {label}
      </Text>
      {detail && (
        <Text
          flexShrink={0}
          fontSize="12px"
          fontFamily="mono"
          color="gray.500"
          whiteSpace="nowrap"
        >
          {detail}
        </Text>
      )}
      {count ? <CountBubble count={count} /> : null}
    </Flex>
  );
}

interface ClaimActionsProps {
  claim: DeathClaim;
  /**
   * EDIT IS THE PLANHOLDER'S CORRECTION, and the only tile here that is wired.
   * The page decides what it opens — the form, or the list of changes already
   * made — because only the page knows who is reading and whether there are any.
   */
  onEdit: () => void;
  /** Corrections waiting on the reader, shown on the tile — see `count`. */
  editCount?: number;
}

/** What every action does when pressed — shared by the tiles and the list. */
function useClaimActionHandlers(claim: DeathClaim) {
  const claimLabel = claim.claimNo ?? claim.reference;

  // NOTHING HERE IS WIRED BUT EDIT, and every other one says so rather than failing
  // silently — the same call the plan holder profile makes for its own row.
  const notWired = (label: string) =>
    toast.info(`${label} is not available yet`, { description: claimLabel });

  // The plan's three say the LPA rather than the claim number, because that is
  // what they act on — a statement printed for the plan, a termination reversed
  // on the plan. Same toast, different subject.
  const planNotWired = (label: string) =>
    label === PRINT_SOA_LABEL
      ? printSoa(claim.lpaNo)
      : toast.info(`${label} is not available yet`, {
          description: `LPA No. ${claim.lpaNo}`,
        });

  return { notWired, planNotWired };
}

/**
 * EVERY ACTION AS A ROW, with no "More" — wherever the actions are already
 * behind a click: the phone's Actions sheet, and the folded rail's Actions
 * flyout (user, 2026-10-05: "more is already shown … when the conveyor is in
 * minimize or icon mode").
 */
export function ClaimActionList({ claim, onEdit, editCount }: ClaimActionsProps) {
  const { notWired, planNotWired } = useClaimActionHandlers(claim);

  return (
      <Flex direction="column" gap={3}>
        <ActionGroup title="Plan">
          {PLAN_ACTIONS.map(({ label, icon }) => (
            <ActionListRow
              key={label}
              label={label}
              icon={icon}
              onClick={() => planNotWired(label)}
            />
          ))}
        </ActionGroup>

        <ActionGroup title="Claim">
          {[...BUTTON_ACTIONS, ...MORE_CLAIM_ACTIONS].map(
            ({ label, icon, iconColor }) => (
              <ActionListRow
                key={label}
                label={label}
                icon={icon}
                iconColor={iconColor}
                count={label === EDIT_ACTION ? editCount : undefined}
                onClick={() =>
                  label === EDIT_ACTION ? onEdit() : notWired(label)
                }
              />
            ),
          )}
        </ActionGroup>

        <ActionGroup>
          {DELETE_ITEMS.map(({ label, icon, iconColor }) => (
            <ActionListRow
              key={label}
              label={label}
              icon={icon}
              iconColor={iconColor}
              danger
              onClick={() => notWired(label)}
            />
          ))}
        </ActionGroup>
      </Flex>
  );
}

export function ClaimActions({ claim, onEdit, editCount }: ClaimActionsProps) {
  const { notWired, planNotWired } = useClaimActionHandlers(claim);

  return (
    <>
      {/* A LIST ON A PHONE (user, 2026-10-01: "when mobile all the action
          should not be an icon since that was hard to click"). Below `lg` these
          live in the Actions sheet, so every action is a full-width row, and
          there is NO "More" — "the actions is already hidden no need to hide
          the others". Grouped plan, then claim, with Delete last and apart: at
          the foot of a list is where a thumb does not land by accident. */}
      <Box hideFrom="lg">
        <ClaimActionList claim={claim} onEdit={onEdit} editCount={editCount} />
      </Box>

      <Box hideBelow="lg">
        {/* WRITTEN OUT RATHER THAN THROUGH `ActionButtonRow`, and only because
          "More" has to be the LAST cell of a mixed set. That component takes its
          extra cell as `after`, which would work here — but the plan actions
          lead, so the grid is assembled in order anyway. The button itself is
          still `ActionRowButton`, so nothing about how these look is
          duplicated; only the grid is. */}
        <SimpleGrid columns={3} gap={2} gridAutoRows="1fr">
          {/* THE PLAN'S THREE LEAD, directly under the plan holder card they act
            on — a statement for that plan, a termination reversed on that plan. */}
          {PLAN_ACTIONS.map(({ label, icon }) => (
            <ActionRowButton
              key={label}
              label={label}
              icon={icon}
              compact
              onClick={() => planNotWired(label)}
            />
          ))}

          {BUTTON_ACTIONS.map(({ label, icon }) => (
            <ActionRowButton
              key={label}
              label={label}
              icon={icon}
              compact
              count={label === EDIT_ACTION ? editCount : undefined}
              aria-label={
                label === EDIT_ACTION && editCount
                  ? `${label}, ${editCount} planholder change${editCount === 1 ? "" : "s"}`
                  : undefined
              }
              onClick={() =>
                label === EDIT_ACTION ? onEdit() : notWired(label)
              }
            />
          ))}

          {/* A DROPDOWN, not the phone's bottom sheet — the same call v1's rail
            makes. A sheet slides up from the bottom of the window and takes it
            over, which is right for a thumb and wrong for a button sitting in a
            rail with a pointer already on it. The menu opens where the button
            is. */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <ActionRowButton label="More" icon={LuEllipsis} compact />
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="248px">
                  {MENU_ACTIONS.map(
                    ({ label, icon: Icon, description, iconColor }) => (
                      <Menu.Item
                        key={label}
                        value={label}
                        onClick={() => notWired(label)}
                        py={2}
                      >
                        <Flex align="center" gap={2.5} minW={0}>
                          <Box
                            color={iconColor ?? BRAND_COLORS.darkGreen}
                            flexShrink={0}
                          >
                            <Icon size={15} />
                          </Box>
                          <Box minW={0}>
                            <Text fontSize="sm" color="gray.800">
                              {label}
                            </Text>
                            {description && (
                              <Text fontSize="xs" color="gray.500">
                                {description}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Menu.Item>
                    ),
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </SimpleGrid>
      </Box>
    </>
  );
}

export default ClaimActions;
