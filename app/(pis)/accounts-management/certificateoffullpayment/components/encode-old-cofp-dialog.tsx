"use client";

// Encode Old COFP — opened from the button beside Print Transmittal under
// Printed (user, 2026-10-07). Records a certificate issued before this screen:
// the plan it was for, the number and date it went out under, the branch it
// belongs to — picked from the branch combo box, Released To's replacement
// (user, 2026-10-07) — and an optional remark.
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
  Grid,
  Input,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FileClock } from "lucide-react";
import { PrimaryMdButton, SecondaryMdButton } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

import { COFP_BRANCHES } from "../data/branches";
import type { CofpBranch } from "../data/types";
import { BranchCombobox } from "./request-list-card";

export interface CofpOldCofp {
  lpaNo: string;
  cofpNo: string;
  /** ISO. */
  cofpDate: string;
  branch: CofpBranch;
  remarks: string;
}

export interface CofpEncodeOldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The branch picked in the rail — said in the subtitle. */
  branchName?: string;
  /** The branch the Branch Code field starts on — the rail's. */
  defaultBranchCode?: string;
  onEncode: (cofp: CofpOldCofp) => void;
}

/** The text fields, as typed. */
interface CofpOldCofpForm {
  lpaNo: string;
  cofpNo: string;
  cofpDate: string;
  remarks: string;
}

const BLANK: CofpOldCofpForm = {
  lpaNo: "",
  cofpNo: "",
  cofpDate: "",
  remarks: "",
};

/** The uppercase field label the design draws — as Return COFP's. */
const labelProps = {
  fontSize: "xs",
  fontWeight: "semibold",
  color: "gray.600",
  textTransform: "uppercase",
} as const;

export function CofpEncodeOldDialog({
  open,
  onOpenChange,
  branchName,
  defaultBranchCode,
  onEncode,
}: CofpEncodeOldDialogProps) {
  const [form, setForm] = useState<CofpOldCofpForm>(BLANK);
  const [branchCode, setBranchCode] = useState(defaultBranchCode);
  const [submitted, setSubmitted] = useState(false);

  const branch = COFP_BRANCHES.find((b) => b.code === branchCode);

  const set = (key: keyof CofpOldCofpForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const missing = (key: keyof CofpOldCofpForm) => submitted && !form[key].trim();

  const encode = () => {
    setSubmitted(true);
    const { lpaNo, cofpNo, cofpDate } = form;
    if (![lpaNo, cofpNo, cofpDate].every((v) => v.trim()) || !branch) return;
    onEncode({
      lpaNo: lpaNo.trim().toUpperCase(),
      cofpNo: cofpNo.trim().toUpperCase(),
      cofpDate,
      branch,
      remarks: form.remarks.trim(),
    });
    onOpenChange(false);
  };

  /** A one-line field in uppercase, with Required under it when left blank. */
  const textField = (key: keyof CofpOldCofpForm, label: string, placeholder: string) => (
    <Field.Root invalid={missing(key)}>
      <Field.Label {...labelProps}>{label}</Field.Label>
      <Input
        size="sm"
        value={form[key]}
        onChange={(e) => set(key)(e.currentTarget.value)}
        placeholder={placeholder}
        textTransform="uppercase"
        _placeholder={{ color: "gray.400" }}
      />
      <Field.ErrorText>Required</Field.ErrorText>
    </Field.Root>
  );

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
                  <FileClock size={18} />
                </Box>
                <Box minW={0}>
                  <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                    Encode Old COFP
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {branchName
                      ? `A certificate issued before this system — ${branchName}`
                      : "A certificate issued before this system"}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Flex direction="column" gap={4}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                  {textField("lpaNo", "LPA No.:", "ENTER LPA NO...")}
                  {textField("cofpNo", "COFP No.:", "E.G. CFPWT126-007077")}
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                  <Field.Root invalid={missing("cofpDate")}>
                    <Field.Label {...labelProps}>COFP Date:</Field.Label>
                    <Input
                      type="date"
                      size="sm"
                      value={form.cofpDate}
                      onChange={(e) => set("cofpDate")(e.currentTarget.value)}
                    />
                    <Field.ErrorText>Required</Field.ErrorText>
                  </Field.Root>
                </Grid>

                <BranchCombobox
                  branches={COFP_BRANCHES}
                  value={branchCode}
                  onChange={(next) => setBranchCode(next.code)}
                  label="BRANCH CODE:"
                  // Kept inside the dialog, which would otherwise trap focus
                  // away from a list portalled out of it.
                  portalled={false}
                  errorText={submitted && !branch ? "Required" : undefined}
                />

                <Field.Root>
                  <Field.Label {...labelProps}>Remarks (Optional):</Field.Label>
                  <Textarea
                    size="sm"
                    rows={3}
                    value={form.remarks}
                    onChange={(e) => set("remarks")(e.currentTarget.value)}
                    placeholder="ENTER REMARKS..."
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
              <PrimaryMdButton type="button" onClick={encode}>
                Encode
              </PrimaryMdButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default CofpEncodeOldDialog;
