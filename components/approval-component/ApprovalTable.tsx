"use client";

import * as React from "react";
import { Box, Checkbox, Table } from "@chakra-ui/react";
import type { ColumnConfig } from "./types";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

interface ApprovalTableProps<T extends Record<string, any>> {
  paginated: T[];
  columns: ColumnConfig<T>[];
  getRowId: (row: T) => string;
  activeRowId: string | null;
  selectedRows: Set<string>;
  allPageSelected: boolean;
  somePageSelected: boolean;
  onToggleAll: () => void;
  onToggleSelection: (id: string) => void;
  onRowClick: (id: string) => void;
  onSort: (key: string) => void;
  sortKey: string | null;
  sortDir: "asc" | "desc";
}

interface ApprovalMobileListProps<T> {
  data: T[];
  getRowId: (row: T) => string;
  activeRowId: string | null;
  selectedRows: Set<string>;
  onToggleSelection: (id: string) => void;
  onRowClick: (id: string) => void;
}

export function ApprovalTable<T extends Record<string, any>>({
  paginated,
  columns,
  getRowId,
  activeRowId,
  selectedRows,
  allPageSelected,
  somePageSelected,
  onToggleAll,
  onToggleSelection,
  onRowClick,
  onSort,
  sortKey,
  sortDir,
}: ApprovalTableProps<T>) {
  return (
    <Box overflowX="auto">
      <Table.Root size="sm" variant="line">
        <Table.Header position="sticky" top="0" zIndex="10" bg="bg">
          <Table.Row>
            <Table.ColumnHeader w="40px" px="4" py="3">
              <Box display="flex" justifyContent="center">
                <Checkbox.Root
                  checked={
                    somePageSelected && !allPageSelected
                      ? "indeterminate"
                      : allPageSelected
                  }
                  onCheckedChange={() => onToggleAll()}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Box>
            </Table.ColumnHeader>

            {columns.map((col) => (
              <Table.ColumnHeader
                key={String(col.key)}
                onClick={() => col.sortable && onSort(String(col.key))}
                cursor={col.sortable ? "pointer" : "default"}
                userSelect="none"
                px="4"
                py="3"
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
                w={col.width}
              >
                <Box display="inline-flex" alignItems="center" gap={1}>
                  {col.header}

                  {col.sortable && (
                    <>
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : (
                        <ChevronsUpDown size={14} opacity={0.4} />
                      )}
                    </>
                  )}
                </Box>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {paginated.map((row) => {
            const id = getRowId(row);
            const isActive = activeRowId === id;
            const isSelected = selectedRows.has(id);

            return (
              <Table.Row
                key={id}
                onClick={() => onRowClick(id)}
                cursor="pointer"
                bg={isActive ? "blue.subtle" : "bg"}
                _hover={{ bg: isActive ? "blue.subtle" : "bg.muted" }}
                borderLeftWidth="2px"
                borderLeftColor={isActive ? "blue.solid" : "transparent"}
                transition="background-color 0.15s ease"
              >
                <Table.Cell w="40px" px="4" py="3">
                  <Box display="flex" justifyContent="center">
                    <Checkbox.Root
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Box>
                </Table.Cell>

                {columns.map((col) => (
                  <Table.Cell key={String(col.key)} px="4" py="3" fontSize="sm">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </Table.Cell>
                ))}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
