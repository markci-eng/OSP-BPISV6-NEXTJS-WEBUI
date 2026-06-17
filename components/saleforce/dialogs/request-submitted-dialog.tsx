"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { Body, H4, PrimaryMdButton, Small } from "st-peter-ui";
import { LuCircleCheck } from "react-icons/lu";

interface RequestSubmittedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  transactionId?: string;
  onConfirm?: () => void;
}

export function RequestSubmittedDialog({
  open,
  onOpenChange,
  title = "Request Submitted",
  description = "Your request has been submitted and is subject to approval.",
  transactionId,
  onConfirm,
}: RequestSubmittedDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: 0, md: undefined }}>
          <Dialog.Content borderRadius={{ base: 0, md: undefined }}>
            <Dialog.Header>
              <Dialog.Title>
                <Flex align="center" gap={2}>
                  <Box color="var(--chakra-colors-primary)">
                    <LuCircleCheck size={22} />
                  </Box>
                  <H4 color="var(--chakra-colors-primary)">{title}</H4>
                </Flex>
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" onClick={() => onConfirm?.()} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Flex direction="column" gap={3} pt={1}>
                <Body color="gray.600">{description}</Body>
                {transactionId ? (
                  <Box
                    p={3}
                    borderRadius="md"
                    bg="green.50"
                    borderWidth={1}
                    borderColor="green.200"
                  >
                    <Small color="gray.600">Transaction Reference</Small>
                    <Text
                      fontWeight="bold"
                      color="var(--chakra-colors-primary)"
                    >
                      {transactionId}
                    </Text>
                  </Box>
                ) : null}
                <Small color="gray.500">
                  You can track the status of this request in the Request
                  History.
                </Small>
              </Flex>
            </Dialog.Body>

            {/* <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  CANCEL
                </Button>
              </Dialog.ActionTrigger>
              <PrimaryMdButton
                onClick={() => {
                  onConfirm?.();
                  onOpenChange(false);
                }}
              >
                Close
              </PrimaryMdButton>
            </Dialog.Footer> */}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RequestSubmittedDialog;
