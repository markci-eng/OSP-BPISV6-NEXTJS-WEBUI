"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { ModalForm, ModalFormField, PrimaryMdButton } from "osp-ui-kit";

import type {
  AccessDiff,
  AccessUser,
} from "../types";
import type { AccessGroup } from "../types";
import { PermissionChangeSummary } from "./PermissionChangeSummary";

type ConfirmAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccessUser;
  groups: AccessGroup[];
  /** The roles about to be written. */
  pendingCodes: string[];
  diff: AccessDiff;
  saving: boolean;
  onConfirm: () => void;
};

export function ConfirmAssignDialog({
  open,
  onOpenChange,
  user,
  groups,
  pendingCodes,
  diff,
  saving,
  onConfirm,
}: ConfirmAssignDialogProps) {
  const names = pendingCodes.map(
    (code) => groups.find((group) => group.code === code)?.description ?? code,
  );

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      confirmation={false}
      title="Send role assignment for approval?"
      description={
        <Text fontSize="sm" color="gray.500" lineHeight="1.55">
          You&rsquo;re about to request{" "}
          <Text as="span" color="gray.700" fontWeight="600">
            {user.name}
          </Text>{" "}
          ({user.memberCode}) for {pendingCodes.length} role(s):{" "}
          {names.join(", ")}. Effective access is the union of these presets —
          it changes once an approver grants the request, not now.
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
            loadingText="Sending…"
            onClick={onConfirm}
          >
            Submit for approval
          </PrimaryMdButton>
        </HStack>
      }
    >
      <ModalFormField fullWidth>
        <PermissionChangeSummary
          diff={diff}
          grantedLabel="gained"
          revokedLabel="removed"
        />
      </ModalFormField>
    </ModalForm>
  );
}
