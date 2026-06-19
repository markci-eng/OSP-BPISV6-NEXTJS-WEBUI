"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { Flex, HStack, IconButton, NativeSelect, Text } from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type DataTablePaginationProps<TData> = {
  table: TanStackTable<TData>;
  pageSizeOptions: number[];
};

export function DataTablePagination<TData>({
  table,
  pageSizeOptions,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount() || 1;

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      gap={2}
      px={3}
      py={1.5}
      borderTopWidth="1px"
      bg="white"
    >
      <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
        <Text as="span" fontWeight="600" color="gray.700">{startRow}</Text>
        {"-"}
        <Text as="span" fontWeight="600" color="gray.700">{endRow}</Text>
        {" / "}
        <Text as="span" fontWeight="600" color="gray.700">{totalRows}</Text>
      </Text>

      <Flex align="center" gap={2}>
        <HStack color="gray.500" fontSize="xs" gap={1}>
          <Text whiteSpace="nowrap">Rows</Text>
          <NativeSelect.Root size="xs" w="60px">
            <NativeSelect.Field
              value={String(pageSize)}
              onChange={(e) => {
                table.setPageSize(Number(e.currentTarget.value));
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={String(size)}>
                  {size}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </HStack>

        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          <Text as="span" fontWeight="600" color="gray.700">{pageIndex + 1}</Text>
          {" / "}
          <Text as="span" fontWeight="600" color="gray.700">{pageCount}</Text>
        </Text>

        <HStack gap={0.5}>
          <IconButton
            aria-label="First page"
            variant="ghost"
            size="xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={14} />
          </IconButton>

          <IconButton
            aria-label="Previous page"
            variant="ghost"
            size="xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} />
          </IconButton>

          <IconButton
            aria-label="Next page"
            variant="ghost"
            size="xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} />
          </IconButton>

          <IconButton
            aria-label="Last page"
            variant="ghost"
            size="xs"
            onClick={() =>
              table.setPageIndex(Math.max(table.getPageCount() - 1, 0))
            }
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={14} />
          </IconButton>
        </HStack>
      </Flex>
    </Flex>
  );
}
