"use client";

import * as React from "react";
import type {
  ColumnFiltersState,
  Table as TanStackTable,
} from "@tanstack/react-table";
import { Box, Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { X } from "lucide-react";

type DataTableFilterChipsProps<TData> = {
  table: TanStackTable<TData>;
  columnFilters: ColumnFiltersState;
};

export function DataTableFilterChips<TData>({
  table,
  columnFilters,
}: DataTableFilterChipsProps<TData>) {
  if (columnFilters.length === 0) return null;

  return (
    <Box px={{ base: 4, md: 5 }} py={3} borderBottomWidth="1px" bg="gray.50">
      <HStack gap={2} wrap="wrap">
        <Text fontSize="xs" color="gray.500" fontWeight="700">
          Filters:
        </Text>

        {columnFilters.map((filter) => {
          const values = Array.isArray(filter.value)
            ? (filter.value as string[])
            : [String(filter.value)];

          const columnName = String(filter.id)
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ");

          return values.map((value) => (
            <HStack
              key={`${filter.id}-${value}`}
              px={2.5}
              py={1}
              borderRadius="full"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              color="gray.700"
              fontSize="xs"
              fontWeight="600"
              gap={1}
              boxShadow="xs"
            >
              <Text color="gray.500" textTransform="capitalize">
                {columnName}:
              </Text>

              <Text>{value}</Text>

              <IconButton
                aria-label="Remove filter"
                variant="ghost"
                size="2xs"
                minW="18px"
                h="18px"
                onClick={() => {
                  const next = values.filter((item) => item !== value);
                  const column = table.getColumn(filter.id);

                  column?.setFilterValue(next.length > 0 ? next : undefined);
                }}
              >
                <X size={11} />
              </IconButton>
            </HStack>
          ));
        })}

        <Button
          variant="ghost"
          size="xs"
          h="24px"
          fontSize="xs"
          color="gray.600"
          onClick={() => table.resetColumnFilters()}
        >
          Clear all
        </Button>
      </HStack>
    </Box>
  );
}
