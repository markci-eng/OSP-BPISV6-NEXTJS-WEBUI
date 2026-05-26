"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Check, Filter, X } from "lucide-react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Popover,
  Text,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_ICON_BUTTON_STYLES,
} from "@/lib/theme/standard-design-tokens";

interface ColumnFilterPopoverProps<TData> {
  column: Column<TData, unknown>;
  data: TData[];
}

export function ColumnFilterPopover<TData>({
  column,
  data,
}: ColumnFilterPopoverProps<TData>) {
  const [open, setOpen] = React.useState(false);

  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>();

    data.forEach((row) => {
      const value = (row as any)[column.id];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        values.add(String(value));
      }
    });

    return Array.from(values).sort((a, b) => {
      const aNumber = Number(a);
      const bNumber = Number(b);
      const bothNumeric = Number.isFinite(aNumber) && Number.isFinite(bNumber);

      if (bothNumeric) {
        return aNumber - bNumber;
      }

      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [data, column.id]);

  const currentFilter = (column.getFilterValue() as string[] | undefined) ?? [];
  const isFiltered = currentFilter.length > 0;

  const toggleValue = (value: string) => {
    const next = currentFilter.includes(value)
      ? currentFilter.filter((item) => item !== value)
      : [...currentFilter, value];

    column.setFilterValue(next.length > 0 ? next : undefined);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
  };

  return (
    <Popover.Root open={open} onOpenChange={(event) => setOpen(!!event.open)}>
      <Popover.Trigger asChild>
        <IconButton
          aria-label={isFiltered ? "Column filter active" : "Column filter"}
          variant={isFiltered ? "subtle" : "ghost"}
          bg={isFiltered ? BRAND_COLORS.successBg : undefined}
          color={isFiltered ? BRAND_COLORS.primaryGreen : undefined}
          size="xs"
          {...STANDARD_ICON_BUTTON_STYLES.sm}
          onClick={(event) => event.stopPropagation()}
        >
          <Filter size={14} />
        </IconButton>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content
          width="240px"
          onClick={(event) => event.stopPropagation()}
        >
          <Popover.Arrow />

          <Popover.Body p={0}>
            <Box px={3} py={2.5} borderBottomWidth="1px" bg="gray.50">
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" fontWeight="700" color="gray.800">
                    Filter values
                  </Text>

                  <Text fontSize="xs" color="gray.500">
                    {isFiltered
                      ? `${currentFilter.length} selected`
                      : "Showing all records"}
                  </Text>
                </Box>

                {isFiltered && (
                  <IconButton
                    aria-label="Clear filter"
                    variant="ghost"
                    size="xs"
                    {...STANDARD_ICON_BUTTON_STYLES.sm}
                    onClick={clearFilter}
                  >
                    <X size={14} />
                  </IconButton>
                )}
              </HStack>
            </Box>

            <Box maxH="14rem" overflowY="auto" display="grid" gap={0.5} p={2}>
              <HStack
                px={2}
                py={1.5}
                borderRadius="md"
                _hover={{ bg: "gray.50" }}
                cursor="pointer"
                onClick={clearFilter}
              >
                <Checkbox.Root checked={!isFiltered}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>

                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  All records
                </Text>
              </HStack>

              {uniqueValues.length > 0 ? (
                uniqueValues.map((value) => {
                  const checked = currentFilter.includes(value);

                  return (
                    <HStack
                      key={value}
                      px={2}
                      py={1.5}
                      borderRadius="md"
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                      onClick={() => toggleValue(value)}
                    >
                      <Checkbox.Root checked={checked}>
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>

                      <Text fontSize="sm" truncate flex="1">
                        {value}
                      </Text>

                      {checked && <Check size={13} />}
                    </HStack>
                  );
                })
              ) : (
                <Box px={2} py={6} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    No filter values found.
                  </Text>
                </Box>
              )}
            </Box>

            <HStack px={3} py={2.5} borderTopWidth="1px" justify="flex-end">
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  {...STANDARD_BUTTON_STYLES.md}
                  minW="80px"
                  onClick={clearFilter}
                >
                  Clear
                </Button>
              )}

              <Button
                size="sm"
                {...STANDARD_BUTTON_STYLES.md}
                minW="88px"
                bg={BRAND_COLORS.primaryGreen}
                color={BRAND_COLORS.white}
                _hover={{ bg: BRAND_COLORS.darkGreen }}
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </HStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
