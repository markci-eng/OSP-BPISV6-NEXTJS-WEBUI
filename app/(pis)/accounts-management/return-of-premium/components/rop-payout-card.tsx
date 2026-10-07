"use client";

// Payout Details — under the ROP details card.
//
// WHERE THE MONEY GOES, and the check that it is going to the right person. A
// processor reads this against the IDs in the panel beside it: the account
// name against the ID, the payee against the relationship, the reason against
// why somebody other than the planholder is collecting at all.
//
// IT IS A VIEWER OVER THE SUBMITTED PAYOUTS (user, 2026-09-24), not a form. A
// planholder can file more than one way of being paid, and the channel
// dropdown picks between those submissions — change it and the account, the
// payee and the reason change with it, because they belong to that submission.
// The dropdown therefore offers ONLY the channels this planholder submitted:
// a channel with nothing filed against it has no details to show.
//
// Nothing here is edited, so the fields are `InfoRow`s — the same dotted-leader
// rows the ROP details card above uses — and the card is that card's
// `SectionCard` with the same green strip, edge and lift.

import { useEffect, useState, type ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FloatingLabelSelect, PrimaryMdFlexButton } from "osp-ui-kit";
import { Pencil, Wallet } from "lucide-react";
import { toast } from "sonner";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import { ColumnHeading } from "../../transfer/components/transfer-party-card";
import { CHEQUE_CHANNEL } from "../data/data";
import { RopPayeeDialog, type PayeeDraft } from "./rop-payee-dialog";
import type { RopPayout } from "../data/types";

export interface RopPayoutCardProps {
  /** Every payout this planholder submitted, one per channel. */
  payouts: RopPayout[];
  /**
   * Told which submission is on screen, and whether it has been switched to
   * cheque — so the Proof of Payout card beside this one can show the proof
   * filed for that channel.
   */
  onSelectionChange?: (selection: RopPayoutSelection) => void;
  /**
   * Drawn without a card of its own, under a column heading, as one half of a
   * surface it shares with the proof — the way the Transferor card holds its
   * details and Submitted IDs (user, 2026-10-02).
   */
  embedded?: boolean;
}

export interface RopPayoutSelection {
  payout?: RopPayout;
  onCheque: boolean;
}

export function RopPayoutCard({
  payouts,
  onSelectionChange,
  embedded = false,
}: RopPayoutCardProps) {
  const [channel, setChannel] = useState(payouts[0]?.channel ?? "");
  const [editing, setEditing] = useState(false);

  // CHEQUE IS A MODE, NOT A CHOICE IN THE DROPDOWN (user, 2026-09-24). Nobody
  // submits an account for a cheque; it is where a processor goes when none of
  // the submitted accounts can be paid into, so it is reached through the
  // button under the card and nowhere else.
  const [onCheque, setOnCheque] = useState(false);

  // PAYEE EDITS, KEYED BY CHANNEL (user, 2026-09-24). Each submission names its
  // own payee, so naming a different one for the bank account says nothing
  // about who would collect a cheque — an override that followed the dropdown
  // around would put a payee against a submission nobody named them on.
  const [payeeEdits, setPayeeEdits] = useState<Record<string, PayeeDraft>>({});

  // Back to the first submission whenever the record changes, and the edits go
  // with it — the panel keeps this card mounted as the user moves down the ROP
  // list, and neither a channel nor a payee named on one request belongs to
  // the next.
  useEffect(() => {
    setChannel(payouts[0]?.channel ?? "");
    setPayeeEdits({});
    setOnCheque(false);
  }, [payouts]);

  // The submission the chosen channel belongs to. Falls back to the first,
  // so a channel that somehow does not match still shows a real payout rather
  // than a card of dashes.
  const submitted = payouts.find((p) => p.channel === channel) ?? payouts[0];

  // Keyed on the SUBMISSION, not on `payout` below: that one is rebuilt on
  // every render, and reporting it would have the parent re-render this card
  // in a loop. A payee edit does not change the proof, so nothing is lost.
  useEffect(() => {
    onSelectionChange?.({ payout: submitted, onCheque });
  }, [submitted, onCheque, onSelectionChange]);

  // What is shown: the submission, with any payee named over the top of it.
  const edit = submitted ? payeeEdits[submitted.channel] : undefined;
  const selected = submitted && edit ? { ...submitted, ...edit } : submitted;

  // On cheque the PAYEE still stands — a cheque is issued to whoever was going
  // to be paid — and only the account goes, because there is no account to pay
  // into. That is why it is built off the selected submission rather than
  // replacing it.
  const payout =
    selected && onCheque
      ? { ...selected, channel: CHEQUE_CHANNEL, accountNo: "" }
      : selected;

  // The card's own strip, or — embedded — a column heading carrying the same
  // title and count.
  const shell = (children: ReactNode, action?: ReactNode) =>
    embedded ? (
      <Flex direction="column" minW={0}>
        <ColumnHeading action={action}>Payout Details</ColumnHeading>
        {children}
      </Flex>
    ) : (
      <SectionCard
        icon={<Wallet size={14} />}
        title="Payout Details"
        borderColor={KIT_BORDER}
        boxShadow={KIT_SHADOW}
        action={action}
      >
        {children}
      </SectionCard>
    );

  if (!payout) {
    return shell(
      <Text fontSize="sm" color="gray.500" py={4} textAlign="center">
        No payout details were submitted with this request.
      </Text>,
    );
  }

  return shell(
    <>
      <Flex direction="column" gap={3}>
        {/* THE SELECTOR, laid out as a field rather than as a row: a bank name
            runs to thirty characters, which in this column has no room left
            beside a label. Stacked and full width, it also reads as the one
            control on the card — the rows under it are plainly output by
            comparison.

            ONLY THE SUBMITTED CHANNELS. Offering the full list would invite a
            processor to pick one the planholder never filed, and there would
            be nothing to show under it. */}
        <Box>
          {onCheque ? (
            // NOT A DISABLED SELECT: a greyed dropdown says "you may choose
            // here, but not now", and cheque is not in the list at all. A
            // plain field says what the channel is and leaves the button
            // below as the way back.
            <Box
              borderWidth="1px"
              borderColor="border.muted"
              borderRadius="md"
              bg="gray.50"
              px={3}
              py={2}
            >
              <Text fontSize="10px" fontWeight="600" color="gray.500">
                Payout Channel
              </Text>
              <Text fontSize="sm" fontWeight="600" color="gray.800">
                {CHEQUE_CHANNEL}
              </Text>
            </Box>
          ) : (
            <FloatingLabelSelect
              label="Payout Channel"
              value={payout.channel}
              onValueChange={setChannel}
            >
              {payouts.map((option) => (
                <option key={option.channel} value={option.channel}>
                  {option.channel}
                </option>
              ))}
            </FloatingLabelSelect>
          )}
        </Box>

        {/* VERIFIED, NOT ENTERED. Same rows as the ledger above, so the two
            cards read as one column of facts. */}
        <Flex direction="column" gap={1}>
          {/* Stacked, caption above, rather than an `InfoRow`: this is the one
              value checked digit by digit, so it gets a line of its own. */}
          <Box
            pt={1}
            pb={2}
            mb={1}
            borderBottom="1px solid"
            borderColor="border.muted"
          >
            <Text fontSize="sm" color="gray.500">
              Payout Account No.
            </Text>
            <Text
              // Mono because an account number is checked digit by digit
              // against a passbook or a screenshot. Each digit sits one mono
              // space (1ch) apart via letter-spacing rather than inserted
              // spaces, so a copied number pastes without gaps.
              fontFamily="mono"
              fontSize="md"
              fontWeight="600"
              color="gray.800"
              letterSpacing={payout.accountNo ? "1ch" : undefined}
            >
              {/* A cheque has no account — the em dash every empty field here
                  draws, rather than a blank that reads as unfilled. */}
              {payout.accountNo || "—"}
            </Text>
          </Box>
          <InfoRow label="Account Name" value={payout.accountName} />

          {/* THE ONE ROW THAT CAN BE CHANGED, and it says so with a pencil
              beside the value rather than by looking like a field — the rest
              of the card is verification, and a form control here would invite
              editing what is only meant to be checked. The dialog behind it
              carries the two justifications that have to come with a new
              payee. */}
          <InfoRow
            label="Payee Name"
            valueWrap
            value={
              <Flex as="span" align="center" justify="end" gap={1.5} minW={0}>
                <span>{payout.payeeName}</span>
                <Box
                  as="button"
                  onClick={() => setEditing(true)}
                  aria-label="Edit payee information"
                  display="inline-flex"
                  flexShrink={0}
                  p={1}
                  borderRadius="sm"
                  color={BRAND_COLORS.primaryGreen}
                  cursor="pointer"
                  _hover={{ bg: "green.50" }}
                >
                  <Pencil size={13} />
                </Box>
              </Flex>
            }
          />

          <InfoRow label="Relationship" value={payout.relationship} />
          <InfoRow label="Reason" value={payout.reason} />
        </Flex>

        {/* THE TWO ACTIONS, ONE BUTTON DRAWN TWICE (user, 2026-09-24): the
            Confirm button is the model, so both are the primary `Md` flex
            variant and neither carries an icon. Labels only, matched weight.

            The kit's `*FlexButton` variants are the same buttons at `w: 100%`
            with their contents centred, which is what lets each fill its half
            — the plain variants strip `width`, so it cannot be set on them
            from here. Each sits in a `flex="1"` cell, so the pair splits the
            card's width evenly however wide the column is.

            Neither has a destination yet, so each reports back rather than
            pretending to have done something. */}
        <Flex gap={2} pt={1} align="stretch">
          <Box flex="1" minW={0}>
            <PrimaryMdFlexButton
              onClick={() => toast.info("Confirm is not wired up yet.")}
            >
              Confirm
            </PrimaryMdFlexButton>
          </Box>
          {/* THE ONLY WAY TO CHEQUE, and the only way back from it. It reads
              as what it will do next rather than as a state, so the label
              flips with the mode. */}
          <Box flex="1" minW={0}>
            <PrimaryMdFlexButton onClick={() => setOnCheque((v) => !v)}>
              {onCheque ? "Use Submitted Channel" : "Change to Cheque"}
            </PrimaryMdFlexButton>
          </Box>
        </Flex>
      </Flex>

      {/* Mounted whatever the state, so opening it is a prop change rather
          than a mount — the dialog's own animation then runs. */}
      <RopPayeeDialog
        open={editing}
        onOpenChange={setEditing}
        payee={{
          payeeName: payout.payeeName,
          relationship: payout.relationship,
          reason: payout.reason,
        }}
        onSave={(next) =>
          setPayeeEdits((edits) => ({ ...edits, [payout.channel]: next }))
        }
      />
    </>,
    // How many ways of being paid were filed, so the dropdown is visibly a
    // choice between submissions rather than a list of every channel there is.
    payouts.length > 1 ? (
      <Text fontSize="xs" fontWeight="600" color="green.700">
        {payouts.length} submitted
      </Text>
    ) : undefined,
  );
}

export default RopPayoutCard;
