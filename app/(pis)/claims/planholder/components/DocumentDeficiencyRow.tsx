"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuFileWarning, LuUpload } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { DocumentType } from "../../claims-data";

/**
 * A document type with no file on record — one line of the Deficiencies list.
 *
 * The same compact row a document is, deliberately: these are the same objects
 * seen from the other side, and a reader comparing the two tabs is comparing
 * one list against another rather than a list against a form.
 *
 * What differs is the chip and the trailing mark. Amber instead of green, so
 * the two tabs are told apart at a glance even mid-scroll; and an UPLOAD arrow
 * where a document shows its format, because that is what the row does — tapping
 * it opens the file picker for this type, and the file lands in the tab next
 * door. Nothing here says "Missing": the tab it is in already said that.
 *
 * Not swipeable. There is nothing to remove — a deficiency is the absence of a
 * document, and it goes when the file arrives.
 */
export function DocumentDeficiencyRow({
  type,
  onUpload,
}: {
  type: DocumentType;
  /** Start the add flow for this exact type. */
  onUpload: () => void;
}) {
  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={onUpload}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onUpload();
        }
      }}
      aria-label={`Upload ${type.name}`}
      align="center"
      justify="space-between"
      gap={3}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      px={3}
      py="10px"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ borderColor: BRAND_COLORS.primaryGreen, bg: "#f4faf6" }}
      css={{ "&:hover .deficiency-upload": { color: BRAND_COLORS.darkGreen } }}
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
            {type.name}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {type.code}
          </Text>
        </Box>
      </Flex>

      <Box className="deficiency-upload" color="gray.400" flexShrink={0}>
        <LuUpload size={16} />
      </Box>
    </Flex>
  );
}

export default DocumentDeficiencyRow;
