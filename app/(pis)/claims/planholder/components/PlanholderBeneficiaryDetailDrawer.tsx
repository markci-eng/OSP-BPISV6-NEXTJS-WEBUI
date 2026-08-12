"use client";

import { useEffect } from "react";
import { Box, Drawer, Portal, VStack } from "@chakra-ui/react";
import { RowItem } from "@/components/info-card/row-item";
import { SectionTitle } from "../../components/section-title";
import type { PlanholderBeneficiary } from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";

/* WRITE ACTIONS — Edit, Add Payout and Delete, all off for claims. The imports
   they need, kept together so restoring is one block:

import { useMemo } from "react";
import { LuPencil } from "react-icons/lu";
import { DeleteOutlineButton, TertiarySmButton } from "st-peter-ui";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import {
  getPayoutChannelOptions,
  type BeneficiaryPayout,
} from "../../claims-data";
import { PayoutChannelSection } from "./PayoutChannelSection";
*/

interface PlanholderBeneficiaryDetailDrawerProps {
  /** The beneficiary being viewed. `null`/`undefined` keeps the drawer closed. */
  beneficiary?: PlanholderBeneficiary | null;
  open: boolean;
  onClose: () => void;
  /**
   * Open the edit form on this beneficiary.
   *
   * COMMENTED OUT — claims are not allowed to edit a declared beneficiary. The
   * drawer is read-only for them, so nothing is passed in and the Edit control
   * below is commented out with it. Left in place, not deleted: the capability
   * is expected back, and the form drawer it opened is still written.
   *
   * To restore: uncomment this, the destructured `onEdit`, the `action` slot on
   * the Details heading, and the two imports at the top — then the matching
   * block in `PlanholderBeneficiaries`.
   */
  // onEdit: () => void;
  /**
   * Confirm + remove this beneficiary.
   *
   * COMMENTED OUT with the button it drove — see the note on the component.
   */
  // onDelete: () => void;
  /**
   * Write the beneficiary's payout channels back to the list.
   *
   * COMMENTED OUT with the Payout Channel section — see the note on the
   * component. The channels are still SHOWN, on the section's card; what is
   * gone is registering one from here.
   */
  // onPayoutsChange: (payouts: BeneficiaryPayout[]) => void;
}

/**
 * Beneficiary detail — read-only.
 *
 * Every write action this drawer carried is commented out, not deleted: Edit,
 * Add Payout, and Delete. Claims read a declared beneficiary; the plan holder
 * declared them and none of the three is a claims action. The controls are left
 * in place behind comments because the capability is expected back.
 *
 * NOTE that with the section's card now showing everything on file — including
 * the payout channels — nothing opens this drawer any more. It is mounted
 * nowhere. Kept whole for the same reason as the controls inside it.
 *
 * What it used to say, for whoever restores it: the declared details are
 * read-only and changing them is a deliberate step through Edit, which sits on
 * the Details heading beside the fields it edits. Delete closes the page on its
 * own — it drops the whole beneficiary, not one section of it. Payout channels
 * were the exception, registered here directly without going through Edit,
 * because a beneficiary with no channel on file cannot be paid and fixing that
 * should not require opening a form that edits their name.
 */
export function PlanholderBeneficiaryDetailDrawer({
  beneficiary,
  open,
  onClose,
}: // onEdit,
// onDelete,
// onPayoutsChange,
PlanholderBeneficiaryDetailDrawerProps) {
  // const channelOptions = useMemo(() => getPayoutChannelOptions(), []);

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. Restore it.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            display="flex"
            flexDirection="column"
            h="100dvh"
            maxH="100dvh"
            borderRadius={0}
            overflow="hidden"
          >
            <DrawerPageHeader
              title="Beneficiary's Details"
              description={beneficiary?.name}
              onBack={onClose}
            />

            <Drawer.Body py={5} overflowY="auto">
              {beneficiary ? (
                <VStack align="stretch" gap={6}>
                  <Box>
                    {/* Edit rode in the heading's action slot, the same control
                        Add Payout uses one section down: it acts on this
                        section's fields, so it belongs on its heading.

                        COMMENTED OUT — claims may not edit a declared
                        beneficiary; see `onEdit` on the props. With no action
                        the heading renders on its own, which is what the
                        read-only version of this section should look like.

                        action={
                          <TertiarySmButton onClick={onEdit}>
                            <LuPencil /> Edit
                          </TertiarySmButton>
                        } */}
                    <SectionTitle
                      title="Details"
                      subtitle="Declared by the plan holder on the plan"
                    />
                    <Box>
                      <RowItem label="Name" value={beneficiary.name} />
                      <RowItem
                        label="Relationship"
                        value={beneficiary.relation}
                      />
                      <RowItem label="Age" value={`${beneficiary.age} yrs`} />
                      <RowItem
                        label="Address"
                        value={beneficiary.address || undefined}
                      />
                    </Box>
                  </Box>

                  {/* ADD PAYOUT — commented out for claims; see the note on the
                      component.

                      The same section the form carries, and fully live here:
                      inline while nothing is registered, rows plus the Add
                      control once something is. Renders its own SectionTitle.

                      <PayoutChannelSection
                        payouts={beneficiary.payouts}
                        onChange={onPayoutsChange}
                        channelOptions={channelOptions}
                        subject="beneficiary"
                      /> */}

                  {/* DELETE — commented out for claims; see the note on the
                      component.

                      Delete closed the page on its own — the one action that
                      was not scoped to a section, and the only destructive one.

                      `minW` rather than `w`: the library fixes this button at
                      120px and that declaration wins, so the floor is what
                      stretches it across the row.

                      <Box pt={1}>
                        <DeleteOutlineButton
                          minW="full"
                          h="52px"
                          fontSize="md"
                          borderRadius={STANDARD_RADIUS.md}
                          onClick={onDelete}
                        />
                      </Box> */}
                </VStack>
              ) : null}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderBeneficiaryDetailDrawer;
