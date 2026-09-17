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

import { Box, Flex, Menu, Portal, SimpleGrid, Text } from "@chakra-ui/react";
import { LuEllipsis } from "react-icons/lu";
import { toast } from "sonner";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { ActionRowButton } from "../../components/action-button-row";
import {
  DELETE_ACTION,
  ENDORSE_ACTION,
  MORE_CLAIM_ACTIONS,
  PRIMARY_CLAIM_ACTIONS,
  VERIFY_ACTION,
} from "../../components/claim-action-items";
import { PLAN_ACTIONS } from "../../components/plan-action-items";
import type { DeathClaim } from "../death-claims-data";

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

export function ClaimActions({ claim }: { claim: DeathClaim }) {
  const claimLabel = claim.claimNo ?? claim.reference;

  // NOTHING HERE IS WIRED, and every one of them says so rather than failing
  // silently — the same call the plan holder profile makes for its own row.
  const notWired = (label: string) =>
    toast.info(`${label} is not available yet`, { description: claimLabel });

  // The plan's three say the LPA rather than the claim number, because that is
  // what they act on — a statement printed for the plan, a termination reversed
  // on the plan. Same toast, different subject.
  const planNotWired = (label: string) =>
    toast.info(`${label} is not available yet`, {
      description: `LPA No. ${claim.lpaNo}`,
    });

  return (
    <Box>
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
            onClick={() => notWired(label)}
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
  );
}

export default ClaimActions;
