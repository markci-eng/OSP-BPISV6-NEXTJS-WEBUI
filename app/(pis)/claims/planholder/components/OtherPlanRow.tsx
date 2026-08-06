"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuChevronRight, LuFileSpreadsheet } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderOtherPlan } from "../../claims-data";

/**
 * One of the person's other plans — the same compact row as a beneficiary or a
 * document. The plan name sits over its LPA number on the left; the account
 * status pill and effectivity date on the right.
 *
 * Tapping the row navigates to that plan's own page rather than opening a
 * drawer: it is a different plan holder record, not a detail of this one.
 */
export function OtherPlanRow({
  plan,
  onClick,
}: {
  plan: PlanholderOtherPlan;
  onClick?: () => void;
}) {
  return (
    <Flex
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
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
    >
      <Flex align="center" gap={3} minW={0}>
        <Box
          p={2}
          borderRadius="lg"
          bg="#eaf5ee"
          color={BRAND_COLORS.darkGreen}
          flexShrink={0}
        >
          <LuFileSpreadsheet size={16} />
        </Box>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            {plan.planDesc}
          </Text>
          <Text fontSize="11px" color="gray.500" truncate>
            {plan.lpaNo}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap={2} flexShrink={0}>
        <Box textAlign="right">
          {/* Same green/amber split the Info card's Account Status uses. */}
          <Box
            as="span"
            display="inline-flex"
            px={2}
            py="2px"
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            bg={plan.isActive ? "green.50" : "orange.50"}
            color={plan.isActive ? "green.600" : "orange.600"}
          >
            {plan.statusLabel}
          </Box>
          <Text fontSize="11px" color="gray.500" whiteSpace="nowrap" mt="2px">
            {plan.effectivity}
          </Text>
        </Box>
        <LuChevronRight
          size={16}
          color="var(--chakra-colors-gray-400, #9ca3af)"
        />
      </Flex>
    </Flex>
  );
}

export default OtherPlanRow;
