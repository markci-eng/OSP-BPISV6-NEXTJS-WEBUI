"use client";

import * as React from "react";

import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { Box, Table, useBreakpointValue } from "@chakra-ui/react";
import { DataTableProps, DEFAULT_FEATURES } from "./types";

import { DataTableToolbar } from "./components/DataTableToolbar";
import { DataTableFilterChips } from "./components/DataTableFilterChips";
import { DataTableSelectionBar } from "./components/DataTableSelectionBar";
import { DataTablePagination } from "./components/DataTablePagination";
import { DataTableHeader } from "./components/DataTableHeader";
import { DataTableRowActions } from "./components/DataTableRowActions";
import { DataTableDetailDrawer } from "./components/DataTableDetailDrawer";
import { DataTableBody } from "./components/DataTableBody";
import { DataTableMobileCards } from "./components/DataTableMobileCards";
import { DataTableMobileAccordion } from "./components/DataTableMobileAccordion";

const ACTIONS_COLUMN_ID = "_actions";
const ACTIONS_COLUMN_WIDTH = "44px";

export function DataTable<TData>({
  columns: userColumns,
  data: initialData,
  headerContent,
  title,
  description,
  features: featuresProp,
  size = "md",
  pageSizeOptions = [10, 20, 30, 50, 100],
  defaultPageSize = 10,
  renderDetail,
  onRowClick,
  rowActions,
  bulkActions,
  onReorder,
  onSelectionChange,
  emptyState,
  headerButton,
  headerActions,
  className = "",
  getRowId,
  mobileConfig,
  floatingBulkActions = false,
  summaryRows,
  toolbarTop = "var(--sticky-header-h, 0px)",
}: DataTableProps<TData>) {
  const features = { ...DEFAULT_FEATURES, ...featuresProp };
  const resolvedMobileConfig = {
    viewMode: "scroll" as const,
    ...mobileConfig,
  };
  void resolvedMobileConfig;

  const [data, setData] = React.useState<TData[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const resolveRowId = React.useCallback(
    (row: TData, index: number) => {
      return getRowId ? getRowId(row, index) : String(index);
    },
    [getRowId],
  );

  const arrayFilterFn = React.useCallback(
    (row: any, columnId: string, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;

      const cellValue = String(row.getValue(columnId) ?? "");

      return filterValue.includes(cellValue);
    },
    [],
  );

  const columns = React.useMemo(() => {
    const enhancedColumns = userColumns.map((column) => ({
      ...column,
      filterFn: (column as any).filterFn ?? arrayFilterFn,
    }));

    if (!rowActions || rowActions.length === 0) {
      return enhancedColumns;
    }

    const actionsColumn: ColumnDef<TData, any> = {
      id: ACTIONS_COLUMN_ID,
      header: "",
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      meta: {
        isStickyRight: true,
        isActionsColumn: true,
      },
      cell: ({ row }) => (
        <DataTableRowActions row={row.original} actions={rowActions} />
      ),
    };

    return [...enhancedColumns, actionsColumn];
  }, [userColumns, rowActions, arrayFilterFn]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => resolveRowId(row, index),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableSorting: features.sorting,
    enableFilters: features.filtering,
    enableRowSelection: features.selection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(next);

      if (onSelectionChange) {
        const nextSelectedRows = data.filter((row, index) => {
          const rowId = resolveRowId(row, index);
          return !!next[rowId];
        });

        onSelectionChange(nextSelectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: features.sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      features.filtering || features.search ? getFilteredRowModel() : undefined,
    getPaginationRowModel: features.pagination
      ? getPaginationRowModel()
      : undefined,
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const rowIds = React.useMemo(
    () => data.map((row, index) => resolveRowId(row, index)),
    [data, resolveRowId],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = rowIds.indexOf(String(active.id));
      const newIndex = rowIds.indexOf(String(over.id));

      if (oldIndex < 0 || newIndex < 0) return;

      const nextData = arrayMove(data, oldIndex, newIndex);

      setData(nextData);
      onReorder?.(nextData);
    },
    [data, rowIds, onReorder],
  );

  const selectedCount = Object.keys(rowSelection).filter(
    (key) => rowSelection[key],
  ).length;

  const selectedRows = React.useMemo(() => {
    return data.filter((row, index) => {
      const rowId = resolveRowId(row, index);
      return !!rowSelection[rowId];
    });
  }, [data, rowSelection, resolveRowId]);

  const responsiveColumnBreakpoints = useBreakpointValue({
    base: resolvedMobileConfig.viewMode === "scroll" ? undefined : 2,
    sm: resolvedMobileConfig.viewMode === "scroll" ? undefined : 3,
    md: resolvedMobileConfig.viewMode === "scroll" ? undefined : 4,
    lg: undefined,
  });

  React.useEffect(() => {
    if (responsiveColumnBreakpoints == null) {
      setColumnVisibility({});
      return;
    }

    const nonActionColumns = table
      .getAllLeafColumns()
      .filter((column) => column.id !== ACTIONS_COLUMN_ID);

    const sortedColumns = [...nonActionColumns].sort((a, b) => {
      const aMeta = a.columnDef.meta as
        | { responsivePriority?: number; alwaysVisible?: boolean }
        | undefined;

      const bMeta = b.columnDef.meta as
        | { responsivePriority?: number; alwaysVisible?: boolean }
        | undefined;

      return (
        (aMeta?.responsivePriority ?? 999) - (bMeta?.responsivePriority ?? 999)
      );
    });

    const alwaysVisibleIds = new Set(
      sortedColumns
        .filter((column) => {
          const meta = column.columnDef.meta as
            | { responsivePriority?: number; alwaysVisible?: boolean }
            | undefined;

          return !!meta?.alwaysVisible;
        })
        .map((column) => column.id),
    );

    const visibleIds = new Set<string>();

    sortedColumns.forEach((column) => {
      if (alwaysVisibleIds.has(column.id)) {
        visibleIds.add(column.id);
      }
    });

    for (const column of sortedColumns) {
      if (visibleIds.size >= responsiveColumnBreakpoints) break;

      visibleIds.add(column.id);
    }

    const nextVisibility: VisibilityState = {};

    table.getAllLeafColumns().forEach((column) => {
      if (column.id === ACTIONS_COLUMN_ID) {
        nextVisibility[column.id] = true;
        return;
      }

      if (!column.getCanHide()) {
        nextVisibility[column.id] = true;
        return;
      }

      nextVisibility[column.id] = visibleIds.has(column.id);
    });

    setColumnVisibility(nextVisibility);
  }, [responsiveColumnBreakpoints, table]);

  const isMobileScrollMode = resolvedMobileConfig.viewMode === "scroll";
  const useFixedTableLayout = table
    .getVisibleLeafColumns()
    .filter((column) => column.id !== ACTIONS_COLUMN_ID)
    .every((column) => !!(column.columnDef.meta as any)?.width);

  return (
    <Box
      w="full"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="clip"
      bg="white"
      position="relative"
      className={className}
    >
      <DataTableToolbar
        table={table}
        title={title}
        description={description}
        headerContent={headerContent}
        features={features}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        headerButton={headerButton}
        headerActions={headerActions}
        top={toolbarTop}
      />

      {features.filtering && (
        <DataTableFilterChips table={table} columnFilters={columnFilters} />
      )}

      {features.selection && (
        <DataTableSelectionBar
          selectedCount={selectedCount}
          selectedRows={selectedRows}
          bulkActions={bulkActions}
          floating={floatingBulkActions}
          onClearSelection={() => setRowSelection({})}
        />
      )}

      {resolvedMobileConfig.viewMode === "card" && (
        <Box display={{ base: "block", md: "none" }}>
          <DataTableMobileCards
            table={table}
            features={features}
            mobileConfig={resolvedMobileConfig}
            rowActions={rowActions}
            emptyState={emptyState}
            onRowActivate={(rowId, row) => {
              setActiveRowId(rowId);

              if (onRowClick) {
                onRowClick(row);
              }

              if (features.detailSidebar) {
                setSelectedRow(row);
              }
            }}
          />
        </Box>
      )}

      {resolvedMobileConfig.viewMode === "accordion" && (
        <Box display={{ base: "block", md: "none" }}>
          <DataTableMobileAccordion
            table={table}
            features={features}
            mobileConfig={resolvedMobileConfig}
            rowActions={rowActions}
            emptyState={emptyState}
            onRowActivate={(rowId, row) => {
              setActiveRowId(rowId);

              if (onRowClick) {
                onRowClick(row);
              }

              if (features.detailSidebar) {
                setSelectedRow(row);
              }
            }}
          />
        </Box>
      )}

      <Box
        display={{
          base:
            resolvedMobileConfig.viewMode === "card" ||
            resolvedMobileConfig.viewMode === "accordion"
              ? "none"
              : "block",
          md: "block",
        }}
        overflowX="auto"
        borderTopWidth="1px"
        borderColor="gray.200"
      >
        <Box minW={useFixedTableLayout ? "full" : "max-content"}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table.Root
              size="sm"
              width={useFixedTableLayout ? "full" : "max-content"}
              minW="full"
              tableLayout={useFixedTableLayout ? "fixed" : "auto"}
            >
              <DataTableHeader
                table={table}
                features={features}
                size={isMobileScrollMode ? "sm" : size}
                actionsColumnId={ACTIONS_COLUMN_ID}
                actionsColumnWidth={ACTIONS_COLUMN_WIDTH}
              />

              <DataTableBody
                table={table}
                rowIds={rowIds}
                columnsLength={columns.length}
                size={isMobileScrollMode ? "sm" : size}
                features={features}
                activeRowId={activeRowId}
                rowActionsLength={rowActions?.length ?? 0}
                actionsColumnId={ACTIONS_COLUMN_ID}
                actionsColumnWidth={ACTIONS_COLUMN_WIDTH}
                summaryRows={summaryRows}
                emptyState={emptyState}
                onRowActivate={(rowId, row) => {
                  setActiveRowId(rowId);

                  if (onRowClick) {
                    onRowClick(row);
                  }

                  if (features.detailSidebar) {
                    setSelectedRow(row);
                  }
                }}
              />
            </Table.Root>
          </DndContext>
        </Box>
      </Box>

      {features.pagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}

      {features.detailSidebar && (
        <DataTableDetailDrawer
          title={title}
          selectedRow={selectedRow}
          renderDetail={renderDetail}
          onClose={() => {
            setSelectedRow(null);
            setActiveRowId(null);
          }}
        />
      )}
    </Box>
  );
}

export default DataTable;
