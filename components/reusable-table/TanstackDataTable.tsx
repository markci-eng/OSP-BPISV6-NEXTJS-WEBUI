"use client";

import * as React from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Table,
  NativeSelect,
  Flex,
  IconButton,
  InputGroup,
  Checkbox,
} from "@chakra-ui/react";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BsX } from "react-icons/bs";
import type { ColumnFiltersState, Row } from "@tanstack/react-table";
import { InputFloatingLabel } from "st-peter-ui";
import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";

// A tiny default global filter: checks any cell text
const defaultGlobalFilter: FilterFn<any> = (row, _columnId, filterValue) => {
  const search = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!search) return true;

  const values = Object.values(row.original ?? {});
  return values.some((v) =>
    String(v ?? "")
      .toLowerCase()
      .includes(search),
  );
};
type TanstackDataTableProps<T> = {
  /** Core table data */
  data: T[];
  columns: ColumnDef<T, any>[];

  /** Feature toggles */
  features?: {
    rowSelection?: boolean;
    search?: boolean;
    horizontalScroll?: boolean;
  };

  /** Table behavior */
  table?: {
    getRowId?: (originalRow: T, index: number) => string;
    initialPageSize?: number;
    minWidth?: string | number;
    nowrapCells?: boolean;
  };

  /** UI text */
  text?: {
    searchPlaceholder?: string;
  };

  /** Events */
  events?: {
    onRowClick?: (rowData: T) => void;
    onRowClickMeta?: (row: Row<T>) => void;
    onSelectionChange?: (rows: T[]) => void;
  };

  /** Container customization */
  containerProps?: React.ComponentProps<typeof Box>;
};

export function TanstackDataTable<T>({
  data,
  columns,
  features,
  table,
  text,
  events,
  containerProps,
}: TanstackDataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const enableRowSelection = features?.rowSelection ?? false;
  const enableSearch = features?.search ?? true;
  const enableHorizontalScroll = features?.horizontalScroll ?? true;

  const initialPageSize = table?.initialPageSize ?? 10;
  const tableMinWidth = table?.minWidth ?? "max-content";
  const nowrapCells = table?.nowrapCells ?? true;
  const getRowId = table?.getRowId;

  const searchPlaceholder = text?.searchPlaceholder ?? "Search...";

  const onRowClick = events?.onRowClick;
  const onRowClickMeta = events?.onRowClickMeta;
  const onSelectionChange = events?.onSelectionChange;

  const [rowSelection, setRowSelection] = React.useState({});
  const [inputKey, setInputKey] = React.useState(0);

  const selectionColumn = React.useMemo<ColumnDef<T>>(
    () => ({
      id: "select",

      header: ({ table }) => (
        <Checkbox.Root
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(d) => table.toggleAllPageRowsSelected(!!d.checked)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all rows"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),

      cell: ({ row }) => (
        <Checkbox.Root
          checked={row.getIsSelected()}
          onCheckedChange={(d) => row.toggleSelected(!!d.checked)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),

      size: 44,
      enableSorting: false,
      enableHiding: false,
    }),
    [onRowClick],
  );

  const finalColumns = React.useMemo(() => {
    return enableRowSelection ? [selectionColumn, ...columns] : columns;
  }, [enableRowSelection, selectionColumn, columns]);

  const DataTable = useReactTable({
    data,
    columns: finalColumns,

    state: { globalFilter, sorting, columnFilters, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,

    enableRowSelection,

    globalFilterFn: defaultGlobalFilter,
    getRowId: getRowId as any,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      pagination: { pageIndex: 0, pageSize: initialPageSize },
    },
  });

  const records = DataTable.getFilteredRowModel().rows.length;

  const { pageSize, pageIndex } = DataTable.getState().pagination;
  const total = DataTable.getFilteredRowModel().rows.length;

  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <Box
      {...containerProps}
      borderWidth="1px"
      borderRadius="xl"
      bg="white"
      h={{ base: "auto", md: "450px" }}
      minH={"100%"}
      display="flex"
      flexDir="column"
      overflow="hidden" // important: prevents visual spill/overlap with rounded corners
      textStyle="xs"
    >
      {/* Toolbar */}
      {enableSearch && (
        <HStack
          p={4}
          gap={3}
          borderBottomWidth="1px"
          position="sticky"
          top={0}
          bg="white"
          zIndex={1}
        >
          <Flex
            align="center"
            alignItems={"center"}
            justify={"space-between"}
            gap={5}
            w="full"
          >
            <InputGroup
              textStyle={"xs"}
              maxW="325px"
              w="full"
              endElement={
                globalFilter ? (
                  <IconButton
                    aria-label="Clear search"
                    size="sm"
                    variant="ghost"
                    minW="auto"
                    h="auto"
                    p={1}
                    onClick={() => {
                      setGlobalFilter("");
                      setInputKey((k) => k + 1); // force remount
                      DataTable.resetColumnFilters();
                      DataTable.resetSorting();
                      DataTable.setPageIndex(0);
                    }}
                  >
                    <BsX size={18} />
                  </IconButton>
                ) : undefined
              }
            >
              <InputFloatingLabel
                key={inputKey}
                size={"md"}
                textStyle={"xs"}
                label={searchPlaceholder} // floating label text
                placeholder={searchPlaceholder} // optional; depends how your component works
                value={globalFilter ?? ""} // controlled value
                onChange={(e) => setGlobalFilter(e.target.value)} // standard input handler
                pr="44px" // space for the endElement button
                bg="white"
              />
            </InputGroup>

            <Text fontSize="xs" color={"gray.500"}>
              Records:
              <Text as="span" fontWeight="bold">
                {records}
              </Text>
            </Text>
          </Flex>
        </HStack>
      )}
      <Table.ScrollArea
        flex="1"
        minH="0"
        overflowY="auto"
        overflowX={enableHorizontalScroll ? "auto" : "hidden"}
      >
        <Table.Root
          size="sm"
          interactive
          variant="outline"
          stickyHeader
          fontWeight="light"
          textStyle="xs"
          minW={enableHorizontalScroll ? tableMinWidth : undefined}
        >
          <Table.Header top={0} zIndex={1}>
            {DataTable.getHeaderGroups().map((hg) => (
              <Table.Row key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <Table.ColumnHeader
                      key={header.id}
                      userSelect="none"
                      bgColor="gray.50"
                      whiteSpace={nowrapCells ? "nowrap" : "normal"}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        cursor={canSort ? "pointer" : "default"}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <Box flex="1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </Box>

                        {canSort ? (
                          <Text fontSize="sm" color="gray.500">
                            {sorted === "asc"
                              ? "▲"
                              : sorted === "desc"
                                ? "▼"
                                : ""}
                          </Text>
                        ) : null}
                      </Box>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body color="gray.500" textStyle="xs">
            {DataTable.getRowModel().rows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={DataTable.getAllLeafColumns().length}
                  py={10}
                >
                  <Text textAlign="center" color="gray.500">
                    No results.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              DataTable.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  cursor={onRowClick || onRowClickMeta ? "pointer" : "default"}
                  _hover={
                    onRowClick || onRowClickMeta ? { bg: "gray.50" } : undefined
                  }
                  onClick={() => {
                    console.group("TanStack Row Click");

                    console.log("Row Index:", row.index); // index in current view
                    console.log("Row ID:", row.id); // TanStack internal id
                    console.log("Row Original Data:", row.original); // your full object

                    console.log("Row State:", {
                      isSelected: row.getIsSelected(),
                      isExpanded: row.getIsExpanded?.(),
                    });

                    console.groupEnd();

                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      whiteSpace={nowrapCells ? "nowrap" : "normal"}
                    >
                      {/* ✅ key */}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {/* Footer */}
      <HStack
        p={4}
        borderTopWidth="1px"
        bg="white"
        flexShrink={0}
        alignItems="center"
      >
        <Flex
          w="full"
          gap={3}
          align="center"
          wrap="wrap" // ✅ allows responsive wrapping
        >
          {/* Left: range text */}
          <Box flex={{ base: "1 1 100%", md: "1 1 auto" }}>
            <Text fontSize="xs" color="gray.500">
              {start}-{end} of {total} items
            </Text>
          </Box>

          {/* Middle: pagination buttons */}
          <Flex
            gap={2}
            align="center"
            justify={{ base: "space-between", md: "center" }}
            flex={{ base: "1 1 100%", md: "0 0 auto" }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => DataTable.setPageIndex(0)}
              disabled={!DataTable.getCanPreviousPage()}
            >
              <LuChevronsLeft />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => DataTable.previousPage()}
              disabled={!DataTable.getCanPreviousPage()}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => DataTable.nextPage()}
              disabled={!DataTable.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                DataTable.setPageIndex(DataTable.getPageCount() - 1)
              }
              disabled={!DataTable.getCanNextPage()}
            >
              <LuChevronsRight />
            </Button>
          </Flex>

          {/* Right: page size */}
          <Flex
            gap={2}
            align="center"
            justify={{ base: "space-between", md: "end" }}
            flex={{ base: "1 1 100%", md: "1 1 auto" }}
          >
            <Text fontSize="xs" color="gray.600">
              Items per page
            </Text>

            <NativeSelect.Root width="70px" size="xs">
              <NativeSelect.Field
                bg="white"
                value={String(pageSize)}
                onChange={(e) =>
                  DataTable.setPageSize(Number(e.currentTarget.value))
                }
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Flex>
        </Flex>
      </HStack>
    </Box>
  );
}
