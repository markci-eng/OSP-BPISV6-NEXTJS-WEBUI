"use client";

import { useEffect } from "react";
import { Box, CloseButton, Drawer, Portal, Text } from "@chakra-ui/react";
import { CancelSmButton, DeleteSmButton, SaveSmButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import type { BeneficiaryPayout } from "../../claims-data";
import {
  PayoutChannelFields,
  usePayoutChannelForm,
  type PayoutSubject,
} from "./PayoutChannelForm";

interface PayoutChannelDrawerProps {
  /** The payout being edited, or null to register a new one. */
  payout?: BeneficiaryPayout | null;
  open: boolean;
  onClose: () => void;
  /** Commit the form — an add when `payout` is null, otherwise an edit. */
  onSave: (payout: BeneficiaryPayout) => void;
  /** Confirm + remove the payout being edited. */
  onRemove?: () => void;
  /** The payout channels offered by the select. */
  channelOptions: { label: string; value: string }[];
  /** Whose channels these are — decides only how the subtitle reads. */
  subject?: PayoutSubject;
}

/**
 * Register / edit a payout channel — a second bottom sheet that slides up over
 * the beneficiary or payee drawer, the same way the claim edit drawer stacks
 * over the claim request drawer.
 *
 * One drawer serves both flows, since the form is the same either way and only
 * the chrome differs. Delete only appears when editing: there is nothing to
 * remove on an add.
 *
 * Only reached once there is already a channel — the first one is registered
 * inline in the section, so nobody is sent through a sheet to fill in two
 * fields on an empty list.
 */
export function PayoutChannelDrawer({
  payout,
  open,
  onClose,
  onSave,
  onRemove,
  channelOptions,
  subject = "beneficiary",
}: PayoutChannelDrawerProps) {
  const isEdit = !!payout;

  // Re-seeds each time the sheet opens, so it reflects the payout being edited
  // and never carries the last one's details into an add.
  const {
    channelCode,
    setChannelCode,
    accountNo,
    setAccountNo,
    canSave,
    buildPayout,
  } = usePayoutChannelForm({ payout, active: open, channelOptions });

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

  const handleSave = () => {
    const entry = buildPayout();
    if (entry) onSave(entry);
  };

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
          {/* A short sheet, not a page: three inputs do not earn a full-height
              drawer. Sized to its content and capped, the same partial sheet
              the "Add Document" type picker and the "More" quick actions use. */}
          <Drawer.Content
            roundedTop="2xl"
            maxH="70vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            {/* Grabber — signals the sheet is dismissible by dragging down. */}
            <Box pt={3} pb={1} display="flex" justifyContent="center">
              <Box
                w="36px"
                h="4px"
                bg="gray.300"
                borderRadius="full"
                opacity={0.7}
              />
            </Box>

            <Drawer.Header
              pt={2}
              pb={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Box minW={0}>
                <Drawer.Title>
                  <Text fontWeight="bold" color={BRAND_COLORS.darkGreen} truncate>
                    {isEdit ? "Edit Payout Channel" : "Register Payout Channel"}
                  </Text>
                </Drawer.Title>
                <Text fontSize="xs" color="gray.500" truncate>
                  {isEdit
                    ? payout!.channelName
                    : `Where this ${subject}'s benefit is released`}
                </Text>
              </Box>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body pb={4} overflowY="auto">
              <PayoutChannelFields
                channelCode={channelCode}
                onChannelCodeChange={setChannelCode}
                accountNo={accountNo}
                onAccountNoChange={setAccountNo}
                channelOptions={channelOptions}
              />
            </Drawer.Body>

            <Drawer.Footer
              borderTopWidth="1px"
              borderColor="gray.100"
              pt={3}
              pb={6}
              gap={2}
              justifyContent="flex-end"
            >
              {/* Delete only when editing one that exists. */}
              {isEdit && onRemove && (
                <Box mr="auto">
                  <DeleteSmButton
                    borderRadius={STANDARD_RADIUS.md}
                    onClick={onRemove}
                  />
                </Box>
              )}
              <CancelSmButton
                borderRadius={STANDARD_RADIUS.md}
                onClick={onClose}
              />
              <SaveSmButton
                borderRadius={STANDARD_RADIUS.md}
                onClick={handleSave}
                disabled={!canSave}
              />
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PayoutChannelDrawer;
