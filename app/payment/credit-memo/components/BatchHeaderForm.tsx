"use client";

import * as React from "react";
import {
  Badge,
  Box,
  Grid,
  Input,
  NativeSelect,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { BatchInfo, CREDIT_MEMO_TYPES, getDepositStatus } from "./types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

interface BatchHeaderFormProps {
  batch: BatchInfo;
  onChange: (batch: BatchInfo) => void;
}

const SUBTYPES = ["Standard", "Special", "Emergency", "Adjustment"];

export function BatchHeaderForm({ batch, onChange }: BatchHeaderFormProps) {
  const depositStatus = getDepositStatus(batch.type);
  const typeConfig = CREDIT_MEMO_TYPES.find((t) => t.value === batch.type);

  const depositPalette =
    depositStatus === "required"
      ? "blue"
      : depositStatus === "optional"
        ? "green"
        : "gray";

  return (
    <Box
      bg={BRAND_COLORS.white}
      borderWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      borderRadius={STANDARD_RADIUS.md}
      p={{ base: 4, md: 5 }}
      boxShadow={STANDARD_SHADOWS.level1}
    >
      <HStack justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <Text fontSize="lg" fontWeight="semibold" color="fg">
          Batch Header
        </Text>

        {batch.type && (
          <Badge
            variant="subtle"
            colorPalette={depositPalette}
            rounded="full"
            px="3"
            py="1"
            textTransform="none"
          >
            Deposit: {depositStatus}
          </Badge>
        )}
      </HStack>

      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        columnGap={4}
        rowGap={3}
      >
        <VStack align="stretch" gap={1.5}>
          <Text fontSize="sm" fontWeight="medium" color="fg">
            Batch No
          </Text>
          <Input
            fontVariantNumeric="tabular-nums"
            value={batch.batchNo}
            onChange={(e) => onChange({ ...batch, batchNo: e.target.value })}
            placeholder="e.g. CM-2026-0001"
          />
        </VStack>

        <VStack align="stretch" gap={1.5}>
          <Text fontSize="sm" fontWeight="medium" color="fg">
            Credit Memo Type
          </Text>

          <NativeSelect.Root>
            <NativeSelect.Field
              value={batch.type}
              onChange={(e) =>
                onChange({
                  ...batch,
                  type: e.target.value as BatchInfo["type"],
                })
              }
            >
              <option value="">Select type</option>
              {CREDIT_MEMO_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          {typeConfig && (
            <Text fontSize="xs" color="fg.muted">
              {typeConfig.helper}
            </Text>
          )}
        </VStack>

        <VStack align="stretch" gap={1.5}>
          <Text fontSize="sm" fontWeight="medium" color="fg">
            Subtype
          </Text>

          <NativeSelect.Root>
            <NativeSelect.Field
              value={batch.subtype}
              onChange={(e) =>
                onChange({
                  ...batch,
                  subtype: e.target.value,
                })
              }
            >
              <option value="">Select subtype</option>
              {SUBTYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </VStack>

        <VStack align="stretch" gap={1.5}>
          <Text fontSize="sm" fontWeight="medium" color="fg">
            Description
          </Text>
          <Input
            value={batch.description}
            onChange={(e) =>
              onChange({ ...batch, description: e.target.value })
            }
            placeholder="Memo description"
          />
        </VStack>
      </Grid>
    </Box>
  );
}
