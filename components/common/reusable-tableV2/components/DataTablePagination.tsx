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
import { STANDARD_ICON_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";

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
      direction={{ base: "column", md: "row" }}
      align={{ base: "stretch", md: "center" }}
      justify="space-between"
      gap={{ base: 2.5, md: 3 }}
      px={{ base: 3, md: 5 }}
      py={3}
      borderTopWidth="1px"
      bg="white"
    >
      <HStack
        color="gray.600"
        fontSize={{ base: "xs", md: "sm" }}
        justify={{ base: "center", md: "flex-start" }}
      >
        <Text textAlign={{ base: "center", md: "left" }}>
          Showing{" "}
          <Text as="span" fontWeight="700" color="gray.800">
            {startRow}
          </Text>
          -
          <Text as="span" fontWeight="700" color="gray.800">
            {endRow}
          </Text>{" "}
          of{" "}
          <Text as="span" fontWeight="700" color="gray.800">
            {totalRows}
          </Text>{" "}
          records
        </Text>
      </HStack>

      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        gap={{ base: 2.5, md: 3 }}
        justify={{ base: "space-between", md: "flex-end" }}
        w={{ base: "full", md: "auto" }}
      >
        <HStack
          color="gray.600"
          fontSize={{ base: "xs", md: "sm" }}
          justify={{ base: "space-between", sm: "flex-start" }}
        >
          <Text whiteSpace="nowrap">
            <Text as="span" display={{ base: "inline", md: "none" }}>
              Rows
            </Text>
            <Text as="span" display={{ base: "none", md: "inline" }}>
              Rows per page
            </Text>
          </Text>

          <NativeSelect.Root size="sm" w={{ base: "72px", md: "80px" }}>
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

        <Text
          fontSize={{ base: "xs", md: "sm" }}
          color="gray.600"
          whiteSpace="nowrap"
          textAlign={{ base: "center", sm: "left" }}
        >
          Page{" "}
          <Text as="span" fontWeight="700" color="gray.800">
            {pageIndex + 1}
          </Text>{" "}
          of{" "}
          <Text as="span" fontWeight="700" color="gray.800">
            {pageCount}
          </Text>
        </Text>

        <HStack gap={1} w={{ base: "full", sm: "auto" }}>
          <IconButton
            aria-label="First page"
            variant="outline"
            size="sm"
            {...STANDARD_ICON_BUTTON_STYLES.md}
            flex={{ base: 1, sm: "unset" }}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={16} />
          </IconButton>

          <IconButton
            aria-label="Previous page"
            variant="outline"
            size="sm"
            {...STANDARD_ICON_BUTTON_STYLES.md}
            flex={{ base: 1, sm: "unset" }}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={16} />
          </IconButton>

          <IconButton
            aria-label="Next page"
            variant="outline"
            size="sm"
            {...STANDARD_ICON_BUTTON_STYLES.md}
            flex={{ base: 1, sm: "unset" }}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={16} />
          </IconButton>

          <IconButton
            aria-label="Last page"
            variant="outline"
            size="sm"
            {...STANDARD_ICON_BUTTON_STYLES.md}
            flex={{ base: 1, sm: "unset" }}
            onClick={() =>
              table.setPageIndex(Math.max(table.getPageCount() - 1, 0))
            }
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={16} />
          </IconButton>
        </HStack>
      </Flex>
    </Flex>
  );
}
