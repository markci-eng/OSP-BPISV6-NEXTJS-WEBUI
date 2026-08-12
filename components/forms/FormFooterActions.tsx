"use client";
import { useRouter } from "next/navigation";
import { Flex } from "@chakra-ui/react";
import {
  PrimaryMdButton,
  SecondaryMdButton,
  useMessageDialog,
} from "osp-ui-kit";

export function FormFooterActions({
  entityLabel,
  onCancel,
  onSubmitted,
  successLink,
}: {
  entityLabel: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
  successLink?: string;
}) {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  return (
    <Flex
      bottom={0}
      bg="white"
      py={3}
      width="full"
      justify="flex-end"
      gap={2}
      borderTopWidth={1}
      borderColor="gray.100"
    >
      <SecondaryMdButton onClick={onCancel}>Cancel</SecondaryMdButton>
      <PrimaryMdButton
        onClick={async () => {
          const confirmed = await messageBox({
            title: "CONFIRMATION",
            message: `Save changes to this ${entityLabel}'s information?`,
            confirmText: "Yes",
            cancelText: "No",
            variant: "confirmation",
          });
          if (!confirmed) return;
          if (successLink) {
            router.push(successLink);
          } else {
            onSubmitted?.();
          }
        }}
      >
        Save Changes
      </PrimaryMdButton>
    </Flex>
  );
}
