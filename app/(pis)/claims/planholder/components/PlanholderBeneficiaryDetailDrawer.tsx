"use client";

import { useEffect, useMemo } from "react";
import { Box, Drawer, Portal, VStack } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";
import { DeleteOutlineButton, TertiarySmButton } from "st-peter-ui";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import { RowItem } from "@/components/info-card/row-item";
import { SectionTitle } from "../../components/section-title";
import {
  getPayoutChannelOptions,
  type BeneficiaryPayout,
  type PlanholderBeneficiary,
} from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PayoutChannelSection } from "./PayoutChannelSection";

interface PlanholderBeneficiaryDetailDrawerProps {
  /** The beneficiary being viewed. `null`/`undefined` keeps the drawer closed. */
  beneficiary?: PlanholderBeneficiary | null;
  open: boolean;
  onClose: () => void;
  /** Open the edit form on this beneficiary. */
  onEdit: () => void;
  /** Confirm + remove this beneficiary. */
  onDelete: () => void;
  /** Write the beneficiary's payout channels back to the list. */
  onPayoutsChange: (payouts: BeneficiaryPayout[]) => void;
}

/**
 * Beneficiary detail — what a row opens. The declared details are read-only;
 * changing them is a deliberate step through Edit, which sits on the Details
 * heading beside the fields it edits. Delete closes the page on its own: it
 * drops the whole beneficiary, not one section of it.
 *
 * Payout channels are the exception: they are registered here directly, without
 * going through Edit. A beneficiary with no channel on file cannot be paid, and
 * fixing that should not require opening a form that edits their name.
 *
 * A row used to open the form directly, which meant every tap looked like the
 * start of an edit. Mirrors the payee detail drawer, the same surface one level
 * up on a claim.
 */
export function PlanholderBeneficiaryDetailDrawer({
  beneficiary,
  open,
  onClose,
  onEdit,
  onDelete,
  onPayoutsChange,
}: PlanholderBeneficiaryDetailDrawerProps) {
  const channelOptions = useMemo(() => getPayoutChannelOptions(), []);

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
                    {/* Edit rides in the heading's action slot, the same
                        control Add Payout uses one section down: it acts on
                        this section's fields, so it belongs on its heading. */}
                    <SectionTitle
                      title="Details"
                      subtitle="Declared by the plan holder on the plan"
                      action={
                        <TertiarySmButton onClick={onEdit}>
                          <LuPencil /> Edit
                        </TertiarySmButton>
                      }
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

                  {/* The same section the form carries, and fully live here:
                      inline while nothing is registered, rows plus the Add
                      control once something is. Renders its own SectionTitle. */}
                  <PayoutChannelSection
                    payouts={beneficiary.payouts}
                    onChange={onPayoutsChange}
                    channelOptions={channelOptions}
                    subject="beneficiary"
                  />

                  {/* Delete closes the page on its own — the one action that
                      is not scoped to a section, and the only destructive one.

                      `minW` rather than `w`: the library fixes this button at
                      120px and that declaration wins, so the floor is what
                      stretches it across the row. */}
                  <Box pt={1}>
                    <DeleteOutlineButton
                      minW="full"
                      h="52px"
                      fontSize="md"
                      borderRadius={STANDARD_RADIUS.md}
                      onClick={onDelete}
                    />
                  </Box>
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
