"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { LuBanknote, LuPlus } from "react-icons/lu";
import { useMessageDialog } from "osp-ui-kit";
import { SaveSmButton, TertiarySmButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import { SectionTitle } from "../../components/section-title";
import type { BeneficiaryPayout } from "../../claims-data";
import { PayoutChannelDrawer } from "./PayoutChannelDrawer";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";
import {
  PayoutChannelFields,
  usePayoutChannelForm,
  type PayoutSubject,
} from "./PayoutChannelForm";

/* ------------------------------ row ------------------------------ */

/**
 * A registered payout channel — the same compact row the documents list uses,
 * with the channel over its masked account number.
 *
 * Behaves like `DocumentRow`: tapping opens the channel in the form drawer, and
 * swiping left reveals the remove action — see {@link SwipeToRemoveRow}, which
 * owns the gesture for every list here.
 */
function PayoutRow({
  payout,
  onClick,
  onRequestRemove,
}: {
  payout: BeneficiaryPayout;
  onClick: () => void;
  /** Resolves true once the payout has actually been removed. */
  onRequestRemove: () => Promise<boolean>;
}) {
  return (
    <SwipeToRemoveRow onClick={onClick} onRequestRemove={onRequestRemove}>
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={2}
            borderRadius="lg"
            bg="#eaf5ee"
            color={BRAND_COLORS.darkGreen}
            flexShrink={0}
          >
            <LuBanknote size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {payout.channelName}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {payout.accountNoMasked}
              {payout.channelType ? ` · ${payout.channelType}` : ""}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </SwipeToRemoveRow>
  );
}

/* ------------------------------ section ------------------------------ */

interface PayoutChannelSectionProps {
  /** Channels currently registered, as the owning form holds them. */
  payouts: BeneficiaryPayout[];
  onChange: (payouts: BeneficiaryPayout[]) => void;
  /** The payout channels offered by the drawer's select. */
  channelOptions: { label: string; value: string }[];
  /**
   * Whose channels these are. A payee and a beneficiary register payouts
   * identically — only the table behind them differs — so this decides nothing
   * but how the copy reads.
   */
  subject?: PayoutSubject;
}

/**
 * A beneficiary's or payee's payout channels — laid out like the Documents
 * section: a section title with the add control on its right, then the
 * registered channels as rows.
 *
 * The form is shown two ways, because the empty case and the has-some case are
 * different jobs:
 *
 * - **No channel yet** — the form sits inline where the rows would be. Everyone
 *   being paid needs one, so the first is filled in on the spot rather than
 *   behind an "Add Payout" tap and a sheet. There is no list to make room for
 *   and nothing to go back to, so a sheet would only add a step.
 * - **At least one channel** — the rows own the section, and adding or editing
 *   happens in {@link PayoutChannelDrawer}, a sheet that stacks over the
 *   owning drawer. Tapping a row opens it on that channel; swiping a row left
 *   removes it after confirming.
 */
export function PayoutChannelSection({
  payouts,
  onChange,
  channelOptions,
  subject = "beneficiary",
}: PayoutChannelSectionProps) {
  const { messageBox } = useMessageDialog();

  // The payout open in the form drawer; null with the drawer open means add.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryPayout | null>(null);

  // A different subject (or a reopened drawer) swaps the list — close any form
  // left over from the last one.
  useEffect(() => {
    setFormOpen(false);
    setEditing(null);
  }, [payouts]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (payout: BeneficiaryPayout) => {
    setEditing(payout);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const isEmpty = payouts.length === 0;

  // The inline form, live only while the section is empty — the drawer takes
  // over the moment there is a channel to add to.
  const inlineForm = usePayoutChannelForm({
    payout: null,
    active: isEmpty,
    channelOptions,
  });

  /**
   * Confirm, then drop the payout. Shared by the row's swipe and the form
   * drawer's Delete button — a payout is never removed without asking.
   * Resolves whether it was actually removed, which is what holds the swiped
   * row open while the confirmation is up.
   */
  const handleRemove = async (payout: BeneficiaryPayout): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE PAYOUT CHANNEL",
      message: `Remove ${payout.channelName} (${payout.accountNoMasked}) from this ${subject}'s payout channels?`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed) return false;

    onChange(payouts.filter((p) => p.id !== payout.id));
    // Removing the one the form has open closes the form with it.
    if (editing?.id === payout.id) closeForm();
    return true;
  };

  /** Commit the form drawer — an add when nothing is being edited. */
  const handleSave = (entry: BeneficiaryPayout) => {
    onChange(
      editing
        ? payouts.map((p) => (p.id === entry.id ? entry : p))
        : [...payouts, entry],
    );
    closeForm();
  };

  /** Commit the inline form — always the beneficiary's first channel. */
  const handleInlineSave = () => {
    const entry = inlineForm.buildPayout();
    if (!entry) return;
    onChange([...payouts, entry]);
    inlineForm.reset();
  };

  return (
    <Box>
      {/* Add rides in the heading's action slot, the same way Add Document
          does on the plan holder page — but only once there is a list to add
          to. With the form already inline, it would open a sheet onto the very
          fields sitting under it. */}
      <SectionTitle
        title="Payout Channel"
        subtitle={`Where this ${subject}'s benefit is released`}
        action={
          isEmpty ? undefined : (
            <TertiarySmButton onClick={openAdd}>
              <LuPlus /> Add Payout
            </TertiarySmButton>
          )
        }
      />

      {isEmpty ? (
        /* Boxed like a payout row, so the section still reads as one list even
           while it holds a form instead of entries. */
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          bg="white"
          boxShadow="xs"
          p={4}
        >
          <PayoutChannelFields
            channelCode={inlineForm.channelCode}
            onChannelCodeChange={inlineForm.setChannelCode}
            accountNo={inlineForm.accountNo}
            onAccountNoChange={inlineForm.setAccountNo}
            channelOptions={channelOptions}
          />
          {/* `type="button"`: this sits inside the beneficiary form, and must
              save the channel rather than submit the beneficiary. */}
          <Flex justify="flex-end" mt={4}>
            <SaveSmButton
              type="button"
              borderRadius={STANDARD_RADIUS.md}
              onClick={handleInlineSave}
              disabled={!inlineForm.canSave}
            />
          </Flex>
        </Box>
      ) : (
        <VStack align="stretch" gap={2}>
          {payouts.map((payout) => (
            <PayoutRow
              key={payout.id}
              payout={payout}
              onClick={() => openEdit(payout)}
              onRequestRemove={() => handleRemove(payout)}
            />
          ))}
        </VStack>
      )}

      {/* Stays mounted even while the section is empty. Nothing can open it
          then — Add is hidden and there are no rows — and removing the last
          channel needs it here to close through its own transition rather than
          being torn out mid-animation. */}
      <PayoutChannelDrawer
        payout={editing}
        open={formOpen}
        onClose={closeForm}
        onSave={handleSave}
        onRemove={editing ? () => handleRemove(editing) : undefined}
        channelOptions={channelOptions}
        subject={subject}
      />
    </Box>
  );
}

export default PayoutChannelSection;
