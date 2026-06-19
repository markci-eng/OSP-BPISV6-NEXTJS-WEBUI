"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Box, HStack, Table } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import type { DataTableFeatures, TableSize } from "../types";
import { SIZE_STYLES } from "../types";
type DataTableHeaderProps<TData> = {
  table: TanStackTable<TData>;
  features: Required<DataTableFeatures>;
  size: TableSize;
  actionsColumnId: string;
  actionsColumnWidth: string;
};

const stickyRightHeaderStyles = {
  position: "sticky" as const,
  right: "-1px",
  zIndex: 3,
  bg: "gray.50",
  borderLeftWidth: "1px",
  borderLeftColor: "gray.200",
};

export function DataTableHeader<TData>({
  table,
  features,
  size,
  actionsColumnId,
  actionsColumnWidth,
}: DataTableHeaderProps<TData>) {
  const s = SIZE_STYLES[size];

  return (
    <Table.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        <Table.Row key={headerGroup.id} bg="gray.50" borderBottomWidth="1px">
          {features.draggable && (
            <Table.ColumnHeader px={s.headerPx} w="32px" minW="32px" />
          )}

          {features.selection && (
            <Table.ColumnHeader px={s.headerPx} w="40px" minW="40px">
              <Checkbox.Root
                checked={
                  table.getIsAllRowsSelected()
                    ? true
                    : table.getIsSomeRowsSelected()
                      ? ("indeterminate" as const)
                      : false
                }
                onCheckedChange={(value: any) =>
                  table.toggleAllRowsSelected(
                    typeof value === "boolean" ? value : !!value?.checked,
                  )
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Table.ColumnHeader>
          )}

          {headerGroup.headers.map((header) => {
            const isActionsColumn = header.column.id === actionsColumnId;
            const columnMeta = header.column.columnDef.meta as
              | { numeric?: boolean; width?: string; minWidth?: string }
              | undefined;
            const isNumericColumn = !!columnMeta?.numeric;

            return (
              <Table.ColumnHeader
                key={header.id}
                px={s.headerPx}
                textAlign={isNumericColumn ? "right" : "left"}
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.600"
                fontWeight="700"
                cursor={header.column.getCanSort() ? "pointer" : "default"}
                userSelect={header.column.getCanSort() ? "none" : "auto"}
                onClick={header.column.getToggleSortingHandler()}
                _hover={
                  header.column.getCanSort() ? { color: "gray.900" } : undefined
                }
                whiteSpace="nowrap"
                h="40px"
                w={isActionsColumn ? actionsColumnWidth : undefined}
                width={isActionsColumn ? actionsColumnWidth : columnMeta?.width}
                minW={
                  isActionsColumn ? actionsColumnWidth : columnMeta?.minWidth
                }
                maxW={isActionsColumn ? actionsColumnWidth : undefined}
                {...(isActionsColumn ? stickyRightHeaderStyles : {})}
              >
                <HStack
                  gap={1}
                  minW={0}
                  justify={
                    isActionsColumn
                      ? "center"
                      : isNumericColumn
                        ? "flex-end"
                        : "flex-start"
                  }
                >
                  <Box minW={0} overflow="hidden">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Box>

                  {header.column.getCanSort() && (
                    <Box flexShrink={0}>
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp size={14} />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} opacity={0.4} />
                      )}
                    </Box>
                  )}

                </HStack>
              </Table.ColumnHeader>
            );
          })}
        </Table.Row>
      ))}
    </Table.Header>
  );
}
