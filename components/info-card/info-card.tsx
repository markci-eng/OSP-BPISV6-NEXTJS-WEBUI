"use client";

import { ReactNode } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

import { Body } from "osp-ui-kit";
import { HiInformationCircle } from "react-icons/hi";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { DASHBOARD_ACCENT_COLORS } from "@/lib/theme/dashboard-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SIZES,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

interface InfoCardProps {
  children: ReactNode;
  /** Leading icon. Defaults to an information circle. */
  icon?: IconType;
}

/**
 * Inline informational banner — soft green background with a leading icon
 * and a short helper message. Pass the message as children.
 */
export const InfoCard = ({
  children,
  icon = HiInformationCircle,
}: InfoCardProps) => {
  return (
    <HStack
      gap={STANDARD_SPACING.sm}
      align="center"
      p="8px"
      borderRadius={STANDARD_RADIUS.md}
      bg="#ebf4fb"
      borderWidth="1px"
      borderColor={DASHBOARD_ACCENT_COLORS.info}
      color={BRAND_COLORS.darkGreen}
    >
      <Box
        as={icon}
        boxSize={STANDARD_SIZES.iconButton.sm}
        color={DASHBOARD_ACCENT_COLORS.info}
        flexShrink={0}
      />
      <Text color={DASHBOARD_ACCENT_COLORS.info} fontSize="xs">
        {children}
      </Text>
    </HStack>
  );
};

export default InfoCard;
