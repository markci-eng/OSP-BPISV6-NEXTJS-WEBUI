"use client";

// Return COFP — opened from the Return button under the List of Confiscated
// COFP (user, 2026-10-05). Picks the branch the checked certificates go back
// to, the date they are returned, and an optional remark.
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
  Input,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Undo2 } from "lucide-react";
import { PrimaryMdButton, SecondaryMdButton } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

import { COFP_BRANCHES } from "../data/branches";
import type { CofpBranch } from "../data/types";
import { BranchCombobox } from "./request-list-card";

export interface CofpReturnDetails {
  branch: CofpBranch;
  /** ISO. */
  dateReturned: string;
  remarks: string;
}

export interface CofpReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** How many certificates are being returned — said in the subtitle. */
  count: number;
  /** The branch the field starts on — the one the list is under. */
  defaultBranchCode?: string;
  onReturn: (details: CofpReturnDetails) => void;
}

/** Today as `YYYY-MM-DD` in local time, the shape a date input takes. */
const today = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** The uppercase field label the design draws. */
const labelProps = {
  fontSize: "xs",
  fontWeight: "semibold",
  color: "gray.600",
  textTransform: "uppercase",
} as const;

export function CofpReturnDialog({
  open,
  onOpenChange,
  count,
  defaultBranchCode,
  onReturn,
}: CofpReturnDialogProps) {
  const [branchCode, setBranchCode] = useState(defaultBranchCode);
  const [dateReturned, setDateReturned] = useState(today);
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const branch = COFP_BRANCHES.find((b) => b.code === branchCode);

  const confirm = () => {
    setSubmitted(true);
    if (!branch || !dateReturned) return;
    onReturn({ branch, dateReturned, remarks: remarks.trim() });
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
                  <Undo2 size={18} />
                </Box>
                <Box minW={0}>
                  <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                    Return COFP
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {`${count} confiscated certificate${count === 1 ? "" : "s"} to return`}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <BranchCombobox
                  branches={COFP_BRANCHES}
                  value={branchCode}
                  onChange={(next) => setBranchCode(next.code)}
                  label="SELECTION OF BRANCH:"
                  // Kept inside the dialog, which would otherwise trap focus
                  // away from a list portalled out of it.
                  portalled={false}
                  errorText={submitted && !branch ? "Required" : undefined}
                />

                <Field.Root invalid={submitted && !dateReturned}>
                  <Field.Label {...labelProps}>Date Return:</Field.Label>
                  <Input
                    type="date"
                    size="sm"
                    value={dateReturned}
                    onChange={(e) => setDateReturned(e.currentTarget.value)}
                  />
                  <Field.ErrorText>Required</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label {...labelProps}>Remarks (Optional):</Field.Label>
                  <Textarea
                    size="sm"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.currentTarget.value)}
                    placeholder="ENTER RETURN REMARKS..."
                    textTransform="uppercase"
                    _placeholder={{ color: "gray.400" }}
                  />
                </Field.Root>
              </Flex>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <SecondaryMdButton type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </SecondaryMdButton>
              {/* The app's own primary button (user, 2026-10-05), as Add
                  Special COFP's confirm is. */}
              <PrimaryMdButton type="button" onClick={confirm}>
                Confirm &amp; Return
              </PrimaryMdButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default CofpReturnDialog;
