"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  Badge,
  Box,
  Checkbox,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";

import type {
  DataTableFeatures,
  DataTableMobileConfig,
  RowAction,
} from "../types";
import { DataTableRowActions } from "./DataTableRowActions";

type DataTableMobileCardsProps<TData> = {
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

export function DataTableMobileCards<TData>({
  table,
  features,
  mobileConfig,
  rowActions,
  emptyState,
  onRowActivate,
}: DataTableMobileCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <Box px={4} py={10} textAlign="center" color="gray.500">
        {emptyState || "No results found."}
      </Box>
    );
  }

  return (
    <Box display="grid" gap={3} px={3} py={3} bg="gray.50">
      {rows.map((row) => {
        const original = row.original;

        if (mobileConfig.renderMobileCard) {
          return (
            <Box key={row.id}>{mobileConfig.renderMobileCard(original)}</Box>
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

        const visibleFields =
          mobileConfig.visibleFields?.filter(
            (field) =>
              field !== mobileConfig.primaryField &&
              field !== mobileConfig.secondaryField &&
              field !== mobileConfig.badgeField,
          ) ?? [];

        return (
          <Box
            key={row.id}
            bg="white"
            borderWidth="1px"
            borderColor={row.getIsSelected() ? "blue.300" : "gray.200"}
            borderRadius="md"
            overflow="hidden"
            boxShadow="xs"
            onClick={() => onRowActivate(row.id, original)}
          >
            <HStack
              align="flex-start"
              justify="space-between"
              gap={2}
              px={3}
              py={3}
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
                  fontWeight="bold"
                  color="gray.900"
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
                  <Text fontSize="xs" color="gray.500" mt={0.5} truncate>
                    {getLabel(
                      mobileConfig.secondaryField,
                      mobileConfig.labelMap,
                    )}
                    :{" "}
                    <Text as="span" color="gray.700" fontWeight="500">
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
                  <Badge size="sm" variant="surface" colorPalette={badgeColor}>
                    {getDisplayValue(
                      original,
                      mobileConfig.badgeField,
                      mobileConfig,
                    )}
                  </Badge>
                )}

                {rowActions && rowActions.length > 0 ? (
                  <Box onClick={(event) => event.stopPropagation()}>
                    <DataTableRowActions row={original} actions={rowActions} />
                  </Box>
                ) : (
                  <IconButton
                    aria-label="Open details"
                    variant="ghost"
                    size="xs"
                    flexShrink={0}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                )}
              </HStack>
            </HStack>

            {visibleFields.length > 0 && (
              <Box borderTopWidth="1px" borderColor="gray.100" px={3} py={2.5}>
                <VStack align="stretch" gap={2}>
                  {visibleFields.map((field) => (
                    <HStack
                      key={field}
                      justify="space-between"
                      align="flex-start"
                      gap={4}
                    >
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textTransform="capitalize"
                        minW="110px"
                      >
                        {getLabel(field, mobileConfig.labelMap)}
                      </Text>

                      <Text
                        fontSize="xs"
                        color="gray.900"
                        fontWeight="600"
                        textAlign="right"
                        lineClamp={2}
                        flex="1"
                      >
                        {getDisplayValue(original, field, mobileConfig)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
