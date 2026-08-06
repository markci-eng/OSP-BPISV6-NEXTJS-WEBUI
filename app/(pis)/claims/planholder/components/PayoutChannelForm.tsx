"use client";

import { useEffect, useState } from "react";
import { Grid, GridItem, Text } from "@chakra-ui/react";
import {
  DocumentUploader,
  FloatingLabelInput,
  FloatingLabelSelect,
} from "osp-ui-kit";
import {
  getPayoutChannelByCode,
  maskAccountNo,
  type BeneficiaryPayout,
} from "../../claims-data";

export type PayoutChannelOption = { label: string; value: string };

/**
 * Who the channels being registered belong to. The form and the section around
 * it are identical for both — a payee and a beneficiary are paid the same way,
 * and differ only in the table the channels are read from and written to — so
 * this only decides how the copy reads.
 */
export type PayoutSubject = "beneficiary" | "payee";

/**
 * The payout channel form, shared by the two places it is shown: inline in the
 * Payout Channel section when there is no channel yet, and in
 * {@link PayoutChannelDrawer} once there are channels to add to or edit.
 *
 * Both surfaces render the same fields and build the same payout, so the form
 * lives here once rather than being duplicated per surface.
 */

interface UsePayoutFormOptions {
  /** The payout being edited, or null/undefined when registering a new one. */
  payout?: BeneficiaryPayout | null;
  /**
   * Whether the form is currently on screen. The fields re-seed from `payout`
   * each time this turns true, so a reopened form never carries the last one's
   * details.
   */
  active: boolean;
  channelOptions: PayoutChannelOption[];
}

export function usePayoutChannelForm({
  payout,
  active,
  channelOptions,
}: UsePayoutFormOptions) {
  const [channelCode, setChannelCode] = useState("");
  const [accountNo, setAccountNo] = useState("");

  useEffect(() => {
    if (!active) return;
    setChannelCode(payout?.channelCode ?? "");
    setAccountNo(payout?.accountNo ?? "");
  }, [active, payout]);

  const canSave = !!channelCode.trim() && !!accountNo.trim();

  /** The payout as entered, or null when the required fields are still blank. */
  const buildPayout = (): BeneficiaryPayout | null => {
    const code = channelCode.trim();
    const account = accountNo.trim();
    if (!code || !account) return null;

    const channel = getPayoutChannelByCode(code);
    return {
      id: payout?.id ?? `PO-LOCAL-${Date.now()}`,
      channelCode: code,
      channelName:
        channel?.channelName ??
        channelOptions.find((o) => o.value === code)?.label ??
        code,
      channelType: channel?.channelType ?? "",
      accountNo: account,
      accountNoMasked: maskAccountNo(account),
    };
  };

  const reset = () => {
    setChannelCode("");
    setAccountNo("");
  };

  return {
    channelCode,
    setChannelCode,
    accountNo,
    setAccountNo,
    canSave,
    buildPayout,
    reset,
  };
}

interface PayoutChannelFieldsProps {
  channelCode: string;
  onChannelCodeChange: (value: string) => void;
  accountNo: string;
  onAccountNoChange: (value: string) => void;
  channelOptions: PayoutChannelOption[];
}

/**
 * The fields themselves — channel, account, and the supporting documents.
 *
 * Stacked at every width: the form is short, and two columns would leave the
 * pair of inputs cramped against the edges of the sheet it sits in.
 */
export function PayoutChannelFields({
  channelCode,
  onChannelCodeChange,
  accountNo,
  onAccountNoChange,
  channelOptions,
}: PayoutChannelFieldsProps) {
  return (
    <Grid templateColumns="1fr" gap={4}>
      <FloatingLabelSelect
        label="Payout Channel"
        value={channelCode}
        onValueChange={onChannelCodeChange}
      >
        <option value="">Select a channel</option>
        {channelOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FloatingLabelSelect>

      <FloatingLabelInput
        label="Payout Account"
        value={accountNo}
        onValueChange={onAccountNoChange}
      />

      <GridItem>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
          Upload Documents
        </Text>
        <DocumentUploader
          accept=".pdf,.png,.jpg,.jpeg"
          maxFiles={5}
          maxSizeMB={10}
        />
      </GridItem>
    </Grid>
  );
}
