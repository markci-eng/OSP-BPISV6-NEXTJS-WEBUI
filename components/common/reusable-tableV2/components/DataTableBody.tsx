"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Table } from "@chakra-ui/react";

import { DraggableRow } from "./DraggableRow";
import type {
  DataTableFeatures,
  DataTableSummaryAggregation,
  DataTableSummaryRow,
  TableSize,
} from "../types";

type DataTableBodyProps<TData> = {
  table: TanStackTable<TData>;
  rowIds: string[];
  columnsLength: number;

  size: TableSize;
  features: Required<DataTableFeatures>;

  activeRowId: string | null;
  rowActionsLength: number;

  actionsColumnId: string;
  actionsColumnWidth: string;
  summaryRows?: DataTableSummaryRow<TData>[];

  emptyState?: React.ReactNode;

  onRowActivate: (rowId: string, row: TData) => void;
};

export function DataTableBody<TData>({
  table,
  rowIds,
  columnsLength,
  size,
  features,
  activeRowId,
  rowActionsLength,
  actionsColumnId,
  actionsColumnWidth,
  summaryRows,
  emptyState,
  onRowActivate,
}: DataTableBodyProps<TData>) {
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const allRows = (table.options.data ?? []) as TData[];
  const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);
  const summaryLabelColumnId =
    visibleColumns.find((column) => column.id !== actionsColumnId)?.id ?? "";

  const formatNumber = React.useCallback((value: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  }, []);

  const getNumericValues = React.useCallback(
    (sourceRows: TData[], columnId: string) => {
      return sourceRows
        .map((row) => Number((row as Record<string, unknown>)[columnId]))
        .filter((value) => Number.isFinite(value));
    },
    [],
  );

  const aggregate = React.useCallback(
    (
      type: DataTableSummaryAggregation,
      columnId: string,
      sourceRows: TData[] = filteredRows,
    ) => {
      const values = getNumericValues(sourceRows, columnId);

      if (type === "count") return sourceRows.length;
      if (values.length === 0) return 0;

      if (type === "average") {
        return values.reduce((total, value) => total + value, 0) / values.length;
      }

      if (type === "min") return Math.min(...values);
      if (type === "max") return Math.max(...values);

      return values.reduce((total, value) => total + value, 0);
    },
    [filteredRows, getNumericValues],
  );

  const renderSummaryCell = React.useCallback(
    (
      summaryRow: DataTableSummaryRow<TData>,
      columnId: string,
    ): React.ReactNode => {
      const sourceRows =
        summaryRow.includeFilteredRows === false ? allRows : filteredRows;
      const values = sourceRows.map(
        (row) => (row as Record<string, unknown>)[columnId],
      );

      const customValue = summaryRow.values?.[columnId as keyof TData & string];

      if (typeof customValue === "function") {
        return customValue({
          columnId,
          rows: sourceRows,
          allRows,
          values,
          aggregate: (type, targetColumnId) =>
            aggregate(type, targetColumnId, sourceRows),
          formatNumber,
        });
      }

      if (customValue !== undefined) return customValue as React.ReactNode;

      const aggregation =
        summaryRow.aggregations?.[columnId as keyof TData & string];

      if (aggregation) {
        return formatNumber(aggregate(aggregation, columnId, sourceRows));
      }

      const labelColumnId = summaryRow.labelColumnId ?? summaryLabelColumnId;

      if (summaryRow.label && columnId === labelColumnId) {
        return summaryRow.label;
      }

      return "";
    },
    [aggregate, allRows, filteredRows, formatNumber, summaryLabelColumnId],
  );

  return (
    <Table.Body>
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        {rows.length > 0 ? (
          <>
            {rows.map((row) => (
              <DraggableRow
                key={row.id}
                row={row}
                size={size}
                draggable={features.draggable}
                selectable={features.selection}
                isActive={activeRowId === row.id}
                stickyActionsColumn={rowActionsLength > 0}
                actionsColumnId={actionsColumnId}
                actionsColumnWidth={actionsColumnWidth}
                onRowClick={() => onRowActivate(row.id, row.original)}
              />
            ))}

            {summaryRows?.map((summaryRow, index) => (
              <Table.Row
                key={summaryRow.id ?? `summary-${index}`}
                bg="green.50"
                borderTopWidth="1px"
                borderBottomWidth="1px"
                borderColor="green.100"
              >
                {features.draggable && (
                  <Table.Cell px={2} py={2.5} w="32px" minW="32px" />
                )}

                {features.selection && (
                  <Table.Cell px={2} py={2.5} w="40px" minW="40px" />
                )}

                {visibleColumns.map((column) => {
                  const isActionsColumn = column.id === actionsColumnId;
                  const columnMeta = column.columnDef.meta as
                    | {
                        numeric?: boolean;
                        width?: string;
                        minWidth?: string;
                        maxWidth?: string;
                      }
                    | undefined;
                  const value = isActionsColumn
                    ? ""
                    : renderSummaryCell(summaryRow, column.id);

                  return (
                    <Table.Cell
                      key={`${summaryRow.id ?? index}-${column.id}`}
                      px={isActionsColumn ? 0 : 2}
                      py={2.5}
                      fontSize={size === "sm" ? "xs" : "sm"}
                      fontWeight="700"
                      color="gray.900"
                      whiteSpace="nowrap"
                      textAlign={
                        columnMeta?.numeric ? "right" : "left"
                      }
                      fontVariantNumeric="tabular-nums"
                      w={isActionsColumn ? actionsColumnWidth : columnMeta?.width}
                      minW={
                        isActionsColumn ? actionsColumnWidth : columnMeta?.minWidth
                      }
                      maxW={
                        isActionsColumn
                          ? actionsColumnWidth
                          : columnMeta?.maxWidth ?? columnMeta?.width
                      }
                      position={isActionsColumn ? "sticky" : undefined}
                      right={isActionsColumn ? 0 : undefined}
                      zIndex={isActionsColumn ? 2 : undefined}
                      bg={isActionsColumn ? "green.50" : undefined}
                      borderLeftWidth={isActionsColumn ? "1px" : undefined}
                      borderLeftColor={
                        isActionsColumn ? "green.100" : undefined
                      }
                    >
                      {value}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
          </>
        ) : (
          <Table.Row>
            <Table.Cell
              colSpan={
                columnsLength +
                (features.draggable ? 1 : 0) +
                (features.selection ? 1 : 0)
              }
              textAlign="center"
              py={12}
              color="gray.500"
            >
              {emptyState || "No results found."}
            </Table.Cell>
          </Table.Row>
        )}
      </SortableContext>
    </Table.Body>
  );
}
