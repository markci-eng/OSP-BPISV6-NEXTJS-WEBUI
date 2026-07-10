"use client";

import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { OSPBadge } from "@/components/common/badge/badge";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

export interface DocumentInfoField {
  label: string;
  value: string;
  icon?: IconType;
}

export interface DocumentInfoCardProps {
  title?: string;
  fields: DocumentInfoField[];
  statusLabel?: string;
  statusType?: "success" | "info" | "warning" | "danger";
}

/**
 * Generic financial-document summary card: a label/value grid with an
 * optional status badge. Reusable for any statement/document detail view,
 * not just the SOA viewer.
 */
export function DocumentInfoCard({
  title,
  fields,
  statusLabel,
  statusType,
}: DocumentInfoCardProps) {
  return (
    <Box
      bg={BRAND_COLORS.white}
      borderWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      borderRadius={STANDARD_RADIUS.xl}
      boxShadow={STANDARD_SHADOWS.level1}
      p={{ base: STANDARD_SPACING.sm, md: STANDARD_SPACING.md }}
    >
      {(title || statusLabel) && (
        <HStack
          justify="space-between"
          align="flex-start"
          mb={STANDARD_SPACING.sm}
          gap={STANDARD_SPACING.sm}
        >{statusLabel && statusType && (
            <OSPBadge type={statusType}>{statusLabel}</OSPBadge>
          )}
          {title ? (
            <Text
              fontSize="15px"
              fontWeight="700"
              color={BRAND_COLORS.neutralText}
            >
              {title}
            </Text>
          ) : (
            <Box />
          )}
          
        </HStack>
      )}

      <Grid
        templateColumns={{
          base: "1fr 1fr",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: STANDARD_SPACING.sm, md: STANDARD_SPACING.md }}
      >
        {fields.map((field) => (
          <VStack key={field.label} align="start" gap="2px" minW={0}>
            <HStack gap="6px" color={BRAND_COLORS.grey}>
              {field.icon && (
                <Box as={field.icon} boxSize="14px" flexShrink={0} />
              )}
              <Text
                fontSize="10.5px"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                {field.label}
              </Text>
            </HStack>
            <Text
              fontSize="14px"
              fontWeight="700"
              color={BRAND_COLORS.neutralText}
              lineClamp={2}
            >
              {field.value}
            </Text>
          </VStack>
        ))}
      </Grid>
    </Box>
  );
}
