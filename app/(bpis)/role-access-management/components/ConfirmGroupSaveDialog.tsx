"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { ModalForm, ModalFormField, PrimaryMdButton } from "osp-ui-kit";

import type { AccessDiff } from "../types";
import type { AccessGroup } from "../types";
import { PermissionChangeSummary } from "./PermissionChangeSummary";

type ConfirmGroupSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AccessGroup;
  diff: AccessDiff;
  /** How many users inherit this preset and will be re-synced. */
  memberCount: number;
  saving: boolean;
  onConfirm: () => void;
};

export function ConfirmGroupSaveDialog({
  open,
  onOpenChange,
  group,
  diff,
  memberCount,
  saving,
  onConfirm,
}: ConfirmGroupSaveDialogProps) {
  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      confirmation={false}
      title="Save preset changes?"
      description={
        <Text fontSize="sm" color="gray.500" lineHeight="1.55">
          You&rsquo;re about to update the{" "}
          <Text as="span" color="gray.700" fontWeight="600">
            {group.description}
          </Text>{" "}
          ({group.code}) preset. {memberCount} user(s) inherit this group and
          will be re-synced.
        </Text>
      }
      footer={
        <HStack gap={2.5} w="full">
          <Button
            flex="1"
            variant="outline"
            borderColor="gray.300"
            color="gray.700"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <PrimaryMdButton
            flex="1.4"
            loading={saving}
            loadingText="Saving…"
            onClick={onConfirm}
          >
            Save preset
          </PrimaryMdButton>
        </HStack>
      }
    >
      <ModalFormField fullWidth>
        <PermissionChangeSummary diff={diff} />
      </ModalFormField>
    </ModalForm>
  );
}
