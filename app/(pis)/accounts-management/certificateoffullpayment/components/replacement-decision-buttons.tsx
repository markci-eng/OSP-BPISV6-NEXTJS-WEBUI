"use client";

// Approve, Pending and Deny — bottom right of the Replacement view's Branch
// panel, under COFP Replacement Information (user, 2026-10-06). Each asks for
// confirmation first. Nothing is persisted yet — there is no endpoint.

import { Flex } from "@chakra-ui/react";
import {
  PrimaryMdButton,
  SecondaryMdButton,
  createLabeledButtonDanger,
  useMessageDialog,
} from "osp-ui-kit";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { toast } from "sonner";

/**
 * Deny in the kit's danger outline — red edge and text, filled red on hover.
 * The kit's Tertiary button is a borderless ghost, which read as loose text
 * beside the other two. Not fixed-width, so it sizes like its neighbours.
 */
const DenyMdButton = createLabeledButtonDanger("Deny", "outline", "md", false);

type Decision = "approve" | "pending" | "deny";

const DECISIONS: Record<
  Decision,
  { confirmText: string; message: (lpaNo: string) => string; done: string }
> = {
  approve: {
    confirmText: "Approve",
    message: (lpaNo) => `Approve the COFP replacement request for ${lpaNo}?`,
    done: "approved",
  },
  pending: {
    confirmText: "Set to Pending",
    message: (lpaNo) =>
      `Set the COFP replacement request for ${lpaNo} to pending?`,
    done: "set to pending",
  },
  deny: {
    confirmText: "Deny",
    message: (lpaNo) => `Deny the COFP replacement request for ${lpaNo}?`,
    done: "denied",
  },
};

export interface CofpReplacementDecisionButtonsProps {
  lpaNo: string;
}

export function CofpReplacementDecisionButtons({
  lpaNo,
}: CofpReplacementDecisionButtonsProps) {
  const { messageBox } = useMessageDialog();

  const decide = async (decision: Decision) => {
    const { confirmText, message, done } = DECISIONS[decision];
    const confirmed = await messageBox({
      title: "CONFIRM",
      message: message(lpaNo),
      confirmText,
      variant: "confirmation",
    });
    if (!confirmed) return;
    toast.success(`COFP replacement request for ${lpaNo} ${done}.`);
  };

  return (
    <Flex justify="flex-end" align="center" gap={2} wrap="wrap">
      <DenyMdButton
        leftIcon={<CircleX size={16} />}
        onClick={() => decide("deny")}
      />
      <SecondaryMdButton onClick={() => decide("pending")}>
        <Clock size={16} />
        Pending
      </SecondaryMdButton>
      <PrimaryMdButton onClick={() => decide("approve")}>
        <CircleCheck size={16} />
        Approve
      </PrimaryMdButton>
    </Flex>
  );
}

export default CofpReplacementDecisionButtons;
