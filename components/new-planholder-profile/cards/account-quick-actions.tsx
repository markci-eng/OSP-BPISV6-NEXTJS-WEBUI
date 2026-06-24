"use client";

import { Box, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import type { ComponentType } from "react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import {
  LuCreditCard,
  LuShieldCheck,
  LuFiles,
  LuCalendarDays,
  LuTrash2,
} from "react-icons/lu";
import { FiFileText } from "react-icons/fi";

export type QuickAction = {
  key: string;
  label: string;
  icon: ComponentType;
  onClick?: () => void;
};

type AccountQuickActionsProps = {
  actions: QuickAction[];
};

const AccountQuickActions = ({ actions }: AccountQuickActionsProps) => {
  return (
    <SimpleGrid
      columns={4}
      gap={{ base: STANDARD_SPACING.xs, md: STANDARD_SPACING.sm }}
    >
      {actions.map((action) => (
        <Box
          key={action.key}
          as="button"
          // type="button"
          onClick={action.onClick}
          bg={BRAND_COLORS.white}
          borderWidth="1px"
          borderColor={BRAND_COLORS.neutralBorder}
          borderRadius={STANDARD_RADIUS.lg}
          boxShadow={STANDARD_SHADOWS.level1}
          cursor={action.onClick ? "pointer" : "default"}
          transition="box-shadow 150ms ease-out, border-color 150ms ease-out, transform 150ms ease-out"
          py={{ base: "8px", md: "20px" }}
          px={STANDARD_SPACING.xs}
          _hover={
            action.onClick
              ? {
                  borderColor: BRAND_COLORS.primaryGreen,
                  boxShadow: STANDARD_SHADOWS.level2,
                  transform: "translateY(-2px)",
                }
              : undefined
          }
        >
          <VStack gap={STANDARD_SPACING.xs}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxSize="40px"
              borderRadius={STANDARD_RADIUS.full}
              // bg={BRAND_COLORS.successBg}
              color={BRAND_COLORS.primaryGreen}
            >
              <Icon as={action.icon} boxSize="20px" />
            </Box>
            <Text
              fontSize="12px"
              fontWeight="700"
              color="gray.500"
              textAlign="center"
              lineHeight="1.2"
            >
              {action.label}
            </Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default AccountQuickActions;
