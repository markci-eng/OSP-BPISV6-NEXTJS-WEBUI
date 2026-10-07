"use client";

// Edit Payee — the one thing on the payout card that can be changed.
//
// A DIALOG RATHER THAN FIELDS IN THE CARD. The card is a verification surface:
// everything on it came off the request and is read against the IDs beside it.
// Naming a different payee is a decision, not a correction, and it carries two
// justifications with it — who they are to the planholder, and why they are
// collecting at all. Three fields that only make sense together belong behind
// one deliberate action.
//
// IT EDITS A DRAFT, not the record. The card holds what comes back and shows
// it in place of the submitted payee; nothing is persisted until there is
// somewhere to persist it to.

import { useEffect, useState } from "react";
import { Box, CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";
import { Pencil } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { MODIFIED_PAYEE_REASONS, RELATIONSHIP_OPTIONS } from "../data/data";

/** What the dialog edits — the three fields that describe a payee. */
export interface PayeeDraft {
  payeeName: string;
  relationship: string;
  reason: string;
}

/**
 * The options a select should offer, with the current value guaranteed among
 * them.
 *
 * A record filed before these lists existed can hold a value the list does not
 * — "Planholder", say, where the planholder collects their own return. Without
 * this the select would silently open on the first option and a save would
 * change a field nobody touched.
 */
function withCurrent(options: string[], current: string): string[] {
  if (!current || options.includes(current)) return options;
  return [current, ...options];
}

export interface RopPayeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the form opens on. */
  payee: PayeeDraft;
  onSave: (payee: PayeeDraft) => void;
}

export function RopPayeeDialog({
  open,
  onOpenChange,
  payee,
  onSave,
}: RopPayeeDialogProps) {
  const [draft, setDraft] = useState<PayeeDraft>(payee);

  // Reopen on what is currently shown, so a cancelled edit leaves nothing
  // behind for the next one to start from.
  useEffect(() => {
    if (open) setDraft(payee);
  }, [open, payee]);

  const set = <K extends keyof PayeeDraft>(key: K, value: PayeeDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // A payee with no name is not a payee. The other two have defaults, so a
  // name is the only thing that can block a save.
  const canSave = draft.payeeName.trim().length > 0;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="sm"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={2}>
              <Flex align="start" gap={3} minW={0}>
                <Box color={BRAND_COLORS.primaryGreen} mt={0.5} flexShrink={0}>
                  <Pencil size={18} />
                </Box>
                <Box minW={0}>
                  <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                    Payee Information
                  </Dialog.Title>
                  {/* What the three fields are FOR, in the one line a dialog
                      gets to say it. */}
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    Specify authorized payee, relationship, and justification
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <FloatingLabelInput
                  label="Payee Name"
                  value={draft.payeeName}
                  onValueChange={(value) => set("payeeName", value)}
                  autoFocus
                />

                <FloatingLabelSelect
                  label="Relationship to Planholder"
                  value={draft.relationship}
                  onValueChange={(value) => set("relationship", value)}
                >
                  {withCurrent(RELATIONSHIP_OPTIONS, draft.relationship).map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ),
                  )}
                </FloatingLabelSelect>

                <FloatingLabelSelect
                  label="Reason for Modified Payee"
                  value={draft.reason}
                  onValueChange={(value) => set("reason", value)}
                >
                  {withCurrent(MODIFIED_PAYEE_REASONS, draft.reason).map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ),
                  )}
                </FloatingLabelSelect>
              </Flex>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <SecondaryMdButton onClick={() => onOpenChange(false)}>
                Cancel
              </SecondaryMdButton>
              <PrimaryMdButton
                disabled={!canSave}
                onClick={() => {
                  onSave({ ...draft, payeeName: draft.payeeName.trim() });
                  onOpenChange(false);
                }}
              >
                Save Changes
              </PrimaryMdButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopPayeeDialog;
