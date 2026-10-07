"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFileWarning, LuUpload } from "react-icons/lu";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";

/**
 * One line of the Deficiencies list — a document type with no file on record,
 * or a deficiency raised by hand.
 *
 * The same compact row a document is, deliberately: these are the same objects
 * seen from the other side. What differs is the chip and the trailing mark —
 * amber instead of green, and an UPLOAD arrow where a document shows its
 * format, because tapping it opens the add flow for this type. A special case
 * has no document behind it, so it has no arrow and nothing to tap.
 *
 * SWIPED LEFT TO REMOVE, like a document (user, 2026-10-01: "make the
 * deficiencies removable in death claim too") — through the same
 * `SwipeToRemoveRow` every list on this page uses.
 */
export function DocumentDeficiencyRow({
  name,
  caption,
  remarks,
  onUpload,
  onRequestRemove,
}: {
  name: string;
  /** The code, or who raised it. */
  caption: string;
  remarks?: string;
  /** Start the add flow for this type. Absent for a special case. */
  onUpload?: () => void;
  /** Resolves true once the deficiency has actually been removed. */
  onRequestRemove: () => Promise<boolean>;
}) {
  return (
    <SwipeToRemoveRow onClick={onUpload} onRequestRemove={onRequestRemove}>
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        aria-label={onUpload ? `Upload ${name}` : undefined}
      >
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={2}
            borderRadius="lg"
            bg="#fdf3e3"
            color="#b45309"
            flexShrink={0}
          >
            <LuFileWarning size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {name}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {caption}
            </Text>
            {/* Wraps rather than truncates — a reason cut off mid-sentence is
                a row the reader has to open something else to understand. */}
            {remarks && (
              <Text fontSize="11px" color="gray.500" mt="2px" lineHeight="1.5">
                {remarks}
              </Text>
            )}
          </Box>
        </Flex>

        {onUpload && (
          <Box color="gray.400" flexShrink={0}>
            <LuUpload size={16} />
          </Box>
        )}
      </Flex>
    </SwipeToRemoveRow>
  );
}

export default DocumentDeficiencyRow;
