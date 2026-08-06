"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFileText } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderDocument } from "../../claims-data";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";

/** Small pill showing the file format, e.g. "PDF". */
function FormatPill({ format }: { format: string }) {
  return (
    <Box
      display="inline-flex"
      flexShrink={0}
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="11px"
      fontWeight="semibold"
      whiteSpace="nowrap"
      bg="gray.100"
      color="gray.600"
    >
      {format || "FILE"}
    </Box>
  );
}

/**
 * A single document — file icon, name, file name, format. Deliberately compact
 * (a media-player style row) so a long list stays scannable; the full detail
 * lives in the drawer the row opens.
 *
 * Swiping the row left reveals the remove action — see {@link SwipeToRemoveRow},
 * which owns the gesture for every list here.
 */
export function DocumentRow({
  document: doc,
  onClick,
  onRequestRemove,
}: {
  document: PlanholderDocument;
  onClick?: () => void;
  /** Resolves true once the document has actually been removed. */
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
            <LuFileText size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {doc.name}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {doc.fileName}
            </Text>
          </Box>
        </Flex>
        <FormatPill format={doc.format} />
      </Flex>
    </SwipeToRemoveRow>
  );
}

export default DocumentRow;
