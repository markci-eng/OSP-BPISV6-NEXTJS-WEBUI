"use client";

// Approve — opened from the Approve button on the List of Deficient (user,
// 2026-10-07), for the checked accounts that are considered despite their
// deficiency. Asks for the notes / remarks the approval is made under.
//
// Nothing is persisted: the page is handed what was entered, until there is
// somewhere to send it.

import { useState } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { CircleCheck } from "lucide-react";
import { PrimaryMdButton, SecondaryMdButton } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface CofpApproveDetails {
  remarks: string;
}

export interface CofpApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** How many accounts are being approved — said in the subtitle. */
  count: number;
  onApprove: (details: CofpApproveDetails) => void;
}

/** The uppercase field label the design draws — as Return COFP's. */
const labelProps = {
  fontSize: "xs",
  fontWeight: "semibold",
  color: "gray.600",
  textTransform: "uppercase",
} as const;

export function CofpApproveDialog({
  open,
  onOpenChange,
  count,
  onApprove,
}: CofpApproveDialogProps) {
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const confirm = () => {
    setSubmitted(true);
    if (!remarks.trim()) return;
    onApprove({ remarks: remarks.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="md"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={2}>
              <Flex align="start" gap={3} minW={0}>
                <Box color={BRAND_COLORS.primaryGreen} mt={0.5} flexShrink={0}>
                  <CircleCheck size={18} />
                </Box>
                <Box minW={0}>
                  <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                    Approve Deficient COFP
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {`${count} considered account${count === 1 ? "" : "s"} to approve`}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Field.Root invalid={submitted && !remarks.trim()}>
                <Field.Label {...labelProps}>Notes / Remarks:</Field.Label>
                <Textarea
                  size="sm"
                  rows={4}
                  autoFocus
                  value={remarks}
                  onChange={(e) => setRemarks(e.currentTarget.value)}
                  placeholder="ENTER NOTES OR REMARKS FOR THE APPROVAL..."
                  textTransform="uppercase"
                  _placeholder={{ color: "gray.400" }}
                />
                <Field.ErrorText>Required</Field.ErrorText>
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <SecondaryMdButton type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </SecondaryMdButton>
              <PrimaryMdButton type="button" onClick={confirm}>
                Confirm &amp; Approve
              </PrimaryMdButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default CofpApproveDialog;
