"use client";

// The right column under For Printing — the region picked on the rail and the
// branches it covers. It takes the plan holder card's place because a region is
// what that view lists, and an empty column reads as a screen that failed to
// load.

import { Box, Flex, Text } from "@chakra-ui/react";
import { Star } from "lucide-react";
import { H3 } from "osp-ui-kit";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SURFACE_RADIUS } from "../../../claims/components/section-card";
import {
  branchesOf,
  forPrintingCountOf,
  regionLabelOf,
} from "../data/regions";
import type { CofpRegion } from "../data/types";

export interface CofpRegionCardProps {
  region: CofpRegion;
}

export function CofpRegionCard({ region }: CofpRegionCardProps) {
  const branches = branchesOf(region);

  return (
    <Box
      // The rail's own surface, so the two columns read as one screen —
      // Special Request keeps its dark-green edge here too, so the list under
      // it is never mistaken for a region's.
      bg="white"
      borderWidth="1px"
      borderColor={region.special ? BRAND_COLORS.darkGreen : "border.muted"}
      borderLeftWidth={region.special ? "4px" : "1px"}
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      p={4}
    >
      <Flex align="baseline" justify="space-between" gap={2} mb={3}>
        <Flex align="center" gap={2} minW={0}>
          {region.special && (
            <Box color={BRAND_COLORS.gold} display="flex" flexShrink={0}>
              <Star size={18} fill="currentColor" />
            </Box>
          )}
          <H3 fontSize="lg">{regionLabelOf(region)}</H3>
        </Flex>
        <Text fontSize="xs" color="gray.400">
          {`${forPrintingCountOf(region)} for printing · ${branches.length} branch${
            branches.length === 1 ? "" : "es"
          }`}
        </Text>
      </Flex>

      <Flex wrap="wrap" gap={2}>
        {branches.map((branch) => (
          <Box
            key={branch}
            px={2.5}
            py={1}
            borderWidth="1px"
            borderColor={BRAND_COLORS.primaryGreen}
            borderRadius="full"
            bg="#f4faf6"
            fontSize="xs"
            fontWeight="600"
            color="gray.700"
          >
            {branch}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

export default CofpRegionCard;
