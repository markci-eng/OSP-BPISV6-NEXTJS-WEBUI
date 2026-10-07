"use client";

// ROP History — opened from the Transfer page header.
//
// DRAWN LIKE ROP's Payment History dialog: the header names the plan (LPA No.
// and planholder) so the table under the rule is read against the right
// account. The table itself is ROP's own `RopHistoryCard`, so the two screens
// show a release the same way.

import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Separator,
  Text,
} from "@chakra-ui/react";
import { History } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { KIT_BORDER } from "../../components/section-card";
import { RopHistoryCard } from "../../return-of-premium/components/rop-history-card";
import type { RopHistory } from "../../return-of-premium/data/types";

export interface RopHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpaNo: string;
  planholderName: string;
  /** Oldest first. */
  history: RopHistory[];
}

export function RopHistoryDialog({
  open,
  onOpenChange,
  lpaNo,
  planholderName,
  history,
}: RopHistoryDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      // Wider than Payment History: nine columns rather than four.
      size="xl"
      motionPreset="scale"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header pb={3} flexDirection="column" alignItems="stretch">
              <Flex align="center" gap={3}>
                <Box color={BRAND_COLORS.primaryGreen} flexShrink={0}>
                  <History size={18} />
                </Box>
                <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                  ROP History
                </Dialog.Title>
                {history.length > 0 && (
                  <Text fontSize="xs" fontFamily="mono" color="gray.400">
                    ({history.length}{" "}
                    {history.length === 1 ? "release" : "releases"} on file)
                  </Text>
                )}
              </Flex>
              <Flex mt={3} gap={8} wrap="wrap">
                <Box minW={0}>
                  <Text fontSize="xs" color="gray.500">
                    LPA No.
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" fontFamily="mono">
                    {lpaNo}
                  </Text>
                </Box>
                <Box minW={0}>
                  <Text fontSize="xs" color="gray.500">
                    Planholder Name
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {planholderName}
                  </Text>
                </Box>
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Separator borderColor={KIT_BORDER} />

            <Dialog.Body pt={4}>
              {history.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
                  No ROP releases on file.
                </Text>
              ) : (
                <RopHistoryCard history={history} showHeader={false} />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopHistoryDialog;
