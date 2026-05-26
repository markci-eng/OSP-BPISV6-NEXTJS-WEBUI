"use client";

import * as React from "react";
import { Box, Flex, Separator, Text } from "@chakra-ui/react";
import SectionTitle from "@/components/texts/SectionTitle";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

type ProfileSectionCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  minH?: string | number;
};

export function ProfileSectionCard({
  title,
  description,
  action,
  children,
  minH,
}: ProfileSectionCardProps) {
  return (
    <Box
      w="full"
      minH={minH}
      bg={BRAND_COLORS.white}
      borderWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      borderRadius={STANDARD_RADIUS.md}
      boxShadow={STANDARD_SHADOWS.level1}
      p={{ base: 3, md: 4 }}
    >
      {(title || description || action) && (
        <>
          <Flex
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap={2}
          >
            <Box minW={0}>
              {typeof title === "string" ? (
                <SectionTitle>{title}</SectionTitle>
              ) : (
                title
              )}

              {description && (
                <Text mt={1} fontSize="sm" color="gray.600">
                  {description}
                </Text>
              )}
            </Box>

            {action}
          </Flex>

          <Separator my={{ base: 2, md: 3 }} />
        </>
      )}

      {children}
    </Box>
  );
}

export default ProfileSectionCard;
