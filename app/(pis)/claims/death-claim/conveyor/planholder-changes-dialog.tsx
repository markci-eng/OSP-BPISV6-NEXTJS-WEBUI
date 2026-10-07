"use client";

// EVERY CORRECTION ON THE CLAIM, IN ONE LIST — what the rail's Edit opens once
// the planholder has changes.
//
// THE PROCESSOR AND THE VERIFIER GET THE SAME CONTROLS: Revert all, and a way
// back into the form. Reverting ONE field is on its label's tooltip, beside the
// value it undoes. There is no Accept or Reject (user, 2026-10-01) — the
// verifier who disagrees with a change overrides it in the form or reverts it,
// and one they let stand goes on with the claim. Each row says who changed it
// last. Anyone else (a held claim, a finished one) only reads the list.
//
// A POP-UP IN THE CENTRE, the same as the form it sits beside (user,
// 2026-09-29). An earlier draft hung it off the tile as a drop-down, where it sat
// over the planholder card and its Show more.

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { PrimarySmButton, SecondarySmButton } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SectionPopup } from "../../components/section-popup";
import { SectionTitle } from "../../components/section-title";
import {
  CORRECTABLE_PLANHOLDER_FIELDS,
  planholderValueLabel,
  type CorrectionStage,
  type PlanholderCorrection,
} from "../../claim-store";
import { STAGE_COLOR } from "./correction-label";

/** Who is reading the list — which decides what it lets them do. */
export type ChangesReader = "processor" | "verifier" | "reader";

const STAGE_BADGE: Record<CorrectionStage, { text: string; bg: string }> = {
  process: { text: "Processor", bg: "orange.50" },
  verification: { text: "Verifier", bg: "green.50" },
};

export function PlanholderChangesDialog({
  open,
  onClose,
  subtitle,
  corrections,
  reader,
  onEdit,
  onRevertAll,
}: {
  open: boolean;
  onClose: () => void;
  subtitle: string;
  corrections: PlanholderCorrection[];
  reader: ChangesReader;
  onEdit: () => void;
  onRevertAll: () => void;
}) {
  const count = `${corrections.length} change${corrections.length === 1 ? "" : "s"}`;

  return (
    <SectionPopup
      title="Planholder changes"
      open={open}
      onClose={onClose}
      maxW="480px"
    >
      <SectionTitle title="Planholder Changes" subtitle={`${subtitle} · ${count}`} />

      <VStack align="stretch" gap={0}>
        {corrections.map((correction) => {
          const { field, stage } = correction;
          const badge = STAGE_BADGE[stage];

          return (
            <Flex
              key={field}
              align="center"
              gap={3}
              py={2.5}
              borderTopWidth="1px"
              borderColor="gray.100"
              _first={{ borderTopWidth: 0 }}
            >
              <Box minW={0} flex="1">
                <Text fontSize="xs" color="gray.500">
                  {CORRECTABLE_PLANHOLDER_FIELDS[field]}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                  wordBreak="break-word"
                >
                  {planholderValueLabel(field, correction.to)}
                </Text>
                <Text fontSize="11px" color="gray.400">
                  {correction.from
                    ? `was ${planholderValueLabel(field, correction.from)}`
                    : "added"}
                </Text>
              </Box>

              <Box
                as="span"
                flexShrink={0}
                px={2}
                py="2px"
                borderRadius="full"
                fontSize="xs"
                fontWeight="semibold"
                bg={badge.bg}
                color={STAGE_COLOR[stage]}
              >
                {badge.text}
              </Box>
            </Flex>
          );
        })}
      </VStack>

      <Flex justify="flex-end" align="center" gap={2} mt={5}>
        {reader !== "reader" && (
          <Box
            as="button"
            mr="auto"
            fontSize="13px"
            fontWeight="600"
            color={BRAND_COLORS.destructiveRed}
            cursor="pointer"
            onClick={onRevertAll}
          >
            Revert all
          </Box>
        )}
        <SecondarySmButton onClick={onClose}>Close</SecondarySmButton>
        {reader !== "reader" && (
          <PrimarySmButton onClick={onEdit}>Edit planholder</PrimarySmButton>
        )}
      </Flex>
    </SectionPopup>
  );
}

export default PlanholderChangesDialog;
