"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Collapsible,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { RowItem } from "@/components/info-card/row-item";

import type {
  DataTableFeatures,
  DataTableMobileConfig,
  RowAction,
} from "../types";

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
    <Box display="grid" gap={2.5} py={3} bg="white">
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
              borderColor={row.getIsSelected() ? "blue.300" : "gray.200"}
              borderRadius="md"
              overflow="hidden"
              boxShadow="xs"
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
                      color="var(--chakra-colors-primary)"
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
                      <Text fontSize="xs" color="gray.500" mt={1} lineClamp={2}>
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
                      <Badge
                        size="sm"
                        variant="surface"
                        colorPalette={badgeColor}
                        flexShrink={0}
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
                    >
                      {isOpen ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
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
                        <RowItem
                          key={field}
                          label={getLabel(field, mobileConfig.labelMap)}
                          value={getDisplayValue(original, field, mobileConfig)}
                        />
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
                      <HStack gap={2} align="stretch">
                        {visibleActions.map((action) => {
                          const Icon = action.icon;
                          const isDestructive =
                            action.variant === "destructive";

                          return (
                            <Button
                              key={action.id}
                              size="sm"
                              flex="1"
                              variant={isDestructive ? "outline" : "solid"}
                              colorPalette={isDestructive ? "red" : "blue"}
                              disabled={action.disabled?.(original)}
                              onClick={() => action.onClick(original)}
                            >
                              {Icon && <Icon size={16} />}
                              {action.label}
                            </Button>
                          );
                        })}
                      </HStack>
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
