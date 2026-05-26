"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Collapsible,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";

import type {
  DataTableFeatures,
  DataTableMobileConfig,
  RowAction,
} from "../types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_ICON_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

type DataTableMobileAccordionProps<TData> = {
  table: TanStackTable<TData>;
  features: Required<DataTableFeatures>;
  mobileConfig: DataTableMobileConfig<TData>;

  rowActions?: RowAction<TData>[];
  emptyState?: React.ReactNode;

  onRowActivate: (rowId: string, row: TData) => void;
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\w\S*/g, (text) => {
      const upperWords = ["ID", "NO", "OR", "SI", "LPA"];

      if (upperWords.includes(text.toUpperCase())) {
        return text.toUpperCase();
      }

      return text.charAt(0).toUpperCase() + text.slice(1);
    });
}

function getLabel<TData>(
  field: keyof TData & string,
  labelMap?: Partial<Record<keyof TData & string, string>>,
) {
  return labelMap?.[field] ?? formatLabel(field);
}

function getFieldValue<TData>(row: TData, field?: keyof TData & string) {
  if (!field) return undefined;

  return (row as Record<string, any>)[field];
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return String(value);
}

function getDisplayValue<TData>(
  row: TData,
  field: keyof TData & string,
  mobileConfig: DataTableMobileConfig<TData>,
) {
  const value = getFieldValue(row, field);
  const formatter = mobileConfig.valueFormatter?.[field];

  if (formatter) {
    return formatter(value, row);
  }

  return renderValue(value);
}

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderTitleValue<TData>(
  row: TData,
  field: keyof TData & string,
  mobileConfig: DataTableMobileConfig<TData>,
) {
  const value = getDisplayValue(row, field, mobileConfig);

  if (typeof value !== "string") return value;

  if (mobileConfig.titleTransform === "capitalize") {
    return toTitleCase(value);
  }

  if (mobileConfig.titleTransform === "uppercase") {
    return value.toUpperCase();
  }

  return value;
}

export function DataTableMobileAccordion<TData>({
  table,
  features,
  mobileConfig,
  rowActions,
  emptyState,
  onRowActivate,
}: DataTableMobileAccordionProps<TData>) {
  const rows = table.getRowModel().rows;
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});
  const toggleRow = React.useCallback((rowId: string, open: boolean) => {
    setOpenRows((prev) => ({
      ...prev,
      [rowId]: open,
    }));
  }, []);

  if (rows.length === 0) {
    return (
      <Box px={4} py={10} textAlign="center" color="gray.500">
        {emptyState || "No results found."}
      </Box>
    );
  }

  return (
    <Box display="grid" gap={2.5} px={3} py={3} bg="gray.50">
      {rows.map((row) => {
        const original = row.original;

        if (mobileConfig.renderMobileAccordion) {
          return (
            <Box key={row.id}>
              {mobileConfig.renderMobileAccordion(original)}
            </Box>
          );
        }

        const badgeValue = getFieldValue(original, mobileConfig.badgeField);

        const badgeColor =
          mobileConfig.badgeColorMap?.[String(badgeValue)] ??
          (badgeValue === undefined || badgeValue === null
            ? "gray"
            : typeof badgeValue === "number" && badgeValue <= 0
              ? "red"
              : "green");
        const badgeStyle =
          badgeValue === undefined || badgeValue === null
            ? undefined
            : mobileConfig.badgeStyleMap?.[String(badgeValue)];

        const visibleFields =
          mobileConfig.visibleFields?.filter(
            (field) =>
              field !== mobileConfig.primaryField &&
              field !== mobileConfig.secondaryField &&
              field !== mobileConfig.badgeField,
          ) ?? [];

        const isOpen = !!openRows[row.id];
        const visibleActions =
          rowActions?.filter(
            (action) => !action.hidden || !action.hidden(original),
          ) ?? [];

        return (
          <Collapsible.Root
            key={row.id}
            open={isOpen}
            onOpenChange={(details: any) => {
              toggleRow(row.id, !!details.open);
            }}
          >
            <Box
              bg="white"
              borderWidth="1px"
              borderColor={
                row.getIsSelected() ? BRAND_COLORS.primaryGreen : "gray.200"
              }
              borderRadius={STANDARD_RADIUS.md}
              overflow="hidden"
              boxShadow={STANDARD_SHADOWS.level1}
            >
              <Collapsible.Trigger asChild>
                <HStack
                  align="flex-start"
                  justify="space-between"
                  gap={2}
                  px={3}
                  py={3}
                  cursor="pointer"
                  //   onClick={() => onRowActivate(row.id, original)}
                >
                  {features.selection && (
                    <Checkbox.Root
                      checked={row.getIsSelected()}
                      onCheckedChange={(value: any) =>
                        row.toggleSelected(
                          typeof value === "boolean" ? value : !!value?.checked,
                        )
                      }
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  )}

                  <Box flex="1" minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color={BRAND_COLORS.primaryGreen}
                      lineClamp={2}
                      letterSpacing="wide"
                    >
                      {mobileConfig.primaryField
                        ? renderTitleValue(
                            original,
                            mobileConfig.primaryField,
                            mobileConfig,
                          )
                        : "Untitled"}
                    </Text>

                    {mobileConfig.secondaryField && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        mt={1}
                        wordBreak="break-word"
                        overflowWrap="anywhere"
                      >
                        {getLabel(
                          mobileConfig.secondaryField,
                          mobileConfig.labelMap,
                        )}
                        :{" "}
                        <Text
                          as="span"
                          color="gray.700"
                          fontWeight="500"
                          wordBreak="break-word"
                          overflowWrap="anywhere"
                        >
                          {getDisplayValue(
                            original,
                            mobileConfig.secondaryField,
                            mobileConfig,
                          )}
                        </Text>
                      </Text>
                    )}
                  </Box>

                  <HStack gap={1} flexShrink={0}>
                    {mobileConfig.badgeField && (
                      <Badge
                        size="sm"
                        variant={badgeStyle ? undefined : "surface"}
                        colorPalette={badgeStyle ? undefined : badgeColor}
                        flexShrink={0}
                        {...badgeStyle}
                      >
                        {getDisplayValue(
                          original,
                          mobileConfig.badgeField,
                          mobileConfig,
                        )}
                      </Badge>
                    )}

                    <IconButton
                      aria-label={isOpen ? "Collapse row" : "Expand row"}
                      variant="ghost"
                      size="xs"
                      {...STANDARD_ICON_BUTTON_STYLES.sm}
                    >
                      {isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </IconButton>
                  </HStack>
                </HStack>
              </Collapsible.Trigger>

              <Collapsible.Content>
                <Box
                  borderTopWidth="1px"
                  borderColor="gray.100"
                  px={3}
                  py={2.5}
                >
                  {visibleFields.length > 0 && (
                    <VStack align="stretch" gap={2}>
                      {visibleFields.map((field) => (
                        <Flex
                          key={field}
                          justify="space-between"
                          align="flex-start"
                          gap={{ base: 1, sm: 4 }}
                          direction={{ base: "column", sm: "row" }}
                          minW={0}
                        >
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            minW={{ base: 0, sm: "110px" }}
                          >
                            {getLabel(field, mobileConfig.labelMap)}
                          </Text>

                          <Text
                            fontSize="xs"
                            color="gray.900"
                            fontWeight="600"
                            textAlign={{ base: "left", sm: "right" }}
                            flex="1"
                            minW={0}
                            maxW="full"
                            wordBreak="break-word"
                            overflowWrap="anywhere"
                          >
                            {getDisplayValue(original, field, mobileConfig)}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                  )}

                  {features.detailSidebar && (
                    <Box
                      mt={visibleFields.length > 0 ? 3 : 0}
                      pt={visibleFields.length > 0 ? 2.5 : 0}
                      borderTopWidth={visibleFields.length > 0 ? "1px" : "0"}
                      borderColor="gray.100"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        w="full"
                        {...STANDARD_BUTTON_STYLES.md}
                        onClick={(event) => {
                          event.stopPropagation();
                          onRowActivate(row.id, original);
                        }}
                      >
                        <Eye size={16} />
                        View Full Details
                      </Button>
                    </Box>
                  )}

                  {visibleActions.length > 0 && (
                    <Box
                      mt={
                        features.detailSidebar || visibleFields.length > 0
                          ? 3
                          : 0
                      }
                      pt={
                        features.detailSidebar || visibleFields.length > 0
                          ? 2.5
                          : 0
                      }
                      borderTopWidth={
                        features.detailSidebar || visibleFields.length > 0
                          ? "1px"
                          : "0"
                      }
                      borderColor="gray.100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Flex
                        gap={2}
                        align="stretch"
                        direction={{ base: "column", sm: "row" }}
                      >
                        {visibleActions.map((action) => {
                          const Icon = action.icon;
                          const isDestructive =
                            action.variant === "destructive";

                          return (
                            <Button
                              key={action.id}
                              size="sm"
                              flex={{ base: "none", sm: "1" }}
                              w="full"
                              variant={isDestructive ? "outline" : "solid"}
                              {...STANDARD_BUTTON_STYLES.md}
                              bg={
                                isDestructive
                                  ? undefined
                                  : BRAND_COLORS.primaryGreen
                              }
                              color={
                                isDestructive
                                  ? BRAND_COLORS.destructiveRed
                                  : "white"
                              }
                              borderColor={
                                isDestructive
                                  ? BRAND_COLORS.destructiveRed
                                  : BRAND_COLORS.primaryGreen
                              }
                              _hover={{
                                bg: isDestructive
                                  ? BRAND_COLORS.errorBg
                                  : BRAND_COLORS.darkGreen,
                                borderColor: isDestructive
                                  ? BRAND_COLORS.destructiveRed
                                  : BRAND_COLORS.darkGreen,
                              }}
                              disabled={action.disabled?.(original)}
                              onClick={() => action.onClick(original)}
                            >
                              {Icon && <Icon size={16} />}
                              {action.label}
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>
                  )}
                </Box>
              </Collapsible.Content>
            </Box>
          </Collapsible.Root>
        );
      })}
    </Box>
  );
}
