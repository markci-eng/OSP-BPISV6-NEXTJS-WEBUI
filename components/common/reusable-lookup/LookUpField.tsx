"use client";

import * as React from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ListFilter,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn,
  Row,
} from "@tanstack/react-table";

import {
  Box,
  CloseButton,
  Dialog,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Table,
  Text,
  Button,
  Checkbox,
  VStack,
  Popover,
} from "@chakra-ui/react";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LookupColumn<T> {
  key: keyof T & string;
  header: string;
  /** Opt-in: render a custom cell. */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Enable the multi-value filter dropdown for this column. */
  enableColumnFilter?: boolean;
  /** Enable sorting for this column (default: true). */
  enableSorting?: boolean;
}

interface LookupFieldProps<T> {
  label?: string;
  placeholder?: string;
  modalTitle: string;
  columns: LookupColumn<T>[];
  dataSource: T[];
  searchKeys: (keyof T & string)[];
  onSelect: (item: T | null) => void;
  renderDisplay: (item: T) => string;
  value: T | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const springTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

/** Multi-value filter: passes when the cell value is in the selected set (or set is empty / ["ALL"]). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multiValueFilter: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0 || filterValue.includes("ALL"))
    return true;
  return filterValue.includes(String(row.getValue(columnId)));
};
multiValueFilter.autoRemove = (val: string[]) =>
  !val || val.length === 0 || val.includes("ALL");

// ---------------------------------------------------------------------------
// Column-filter dropdown
// ---------------------------------------------------------------------------

interface ColumnFilterDropdownProps {
  columnId: string;
  allValues: string[];
  filterValue: string[];
  onChange: (next: string[]) => void;
}

function ColumnFilterDropdown({
  allValues,
  filterValue,
  onChange,
}: ColumnFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string[]>(
    filterValue ?? ["ALL"],
  );
  const isActive =
    filterValue && filterValue.length > 0 && !filterValue.includes("ALL");

  const handleOpenChange = (details: { open: boolean }) => {
    if (details.open) {
      // Sync pending state when opening
      setPending(filterValue?.length ? [...filterValue] : ["ALL"]);
    }
    setOpen(details.open);
  };

  const toggle = (val: string) => {
    if (val === "ALL") {
      setPending(["ALL"]);
      return;
    }
    setPending((prev) => {
      const without = prev.filter((v) => v !== "ALL");
      const idx = without.indexOf(val);
      const next =
        idx > -1 ? without.filter((v) => v !== val) : [...without, val];
      return next.length === 0 ? ["ALL"] : next;
    });
  };

  const apply = () => {
    onChange(pending);
    setOpen(false);
  };

  const cancel = () => {
    setPending(filterValue?.length ? [...filterValue] : ["ALL"]);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <IconButton
          aria-label="Filter column"
          size="xs"
          variant="solid"
          bg={isActive ? "green.600" : "green.700"}
          color="white"
          _hover={{ bg: "green.600" }}
          boxShadow={
            isActive ? "0 0 0 2px var(--chakra-colors-green-200)" : undefined
          }
          onClick={(e) => e.stopPropagation()}
        >
          <ListFilter size={12} />
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="220px"
            p={0}
            borderRadius="lg"
            boxShadow="lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Popover.Body p={0}>
              <VStack align="stretch" gap={0} py={2}>
                {/* ALL option */}
                <HStack
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => toggle("ALL")}
                >
                  <Checkbox.Root
                    checked={pending.includes("ALL")}
                    colorPalette="green"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                  <Text fontSize="sm">All</Text>
                </HStack>

                {allValues.map((val) => (
                  <HStack
                    key={val}
                    px={4}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => toggle(val)}
                  >
                    <Checkbox.Root
                      checked={pending.includes(val)}
                      colorPalette="green"
                      size="sm"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                    <Text fontSize="sm" textTransform="capitalize">
                      {val.toLowerCase()}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <HStack
                px={4}
                py={3}
                gap={2}
                borderTopWidth="1px"
                borderColor="gray.100"
              >
                <Button flex={1} size="sm" variant="outline" onClick={cancel}>
                  Cancel
                </Button>
                <Button
                  flex={1}
                  size="sm"
                  bg="green.700"
                  color="white"
                  _hover={{ bg: "green.600" }}
                  onClick={apply}
                >
                  Apply
                </Button>
              </HStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (direction === "asc") return <ChevronUp size={13} />;
  if (direction === "desc") return <ChevronDown size={13} />;
  return <ChevronsUpDown size={13} opacity={0.4} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LookupField<T extends object>({
  label,
  placeholder = "Search...",
  modalTitle,
  columns,
  dataSource,
  searchKeys,
  onSelect,
  renderDisplay,
  value,
}: LookupFieldProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [modalQuery, setModalQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const inputRef = React.useRef<HTMLInputElement>(null);
  const pageSize = 10;

  // Pre-compute unique values per filterable column
  const uniqueColumnValues = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    columns.forEach((col) => {
      if (col.enableColumnFilter) {
        const vals = Array.from(
          new Set(
            dataSource.map((row) =>
              String((row as Record<string, unknown>)[col.key] ?? ""),
            ),
          ),
        ).sort();
        map[col.key] = vals;
      }
    });
    return map;
  }, [columns, dataSource]);

  // Build TanStack column defs
  const tanstackColumns = React.useMemo<ColumnDef<T>[]>(() => {
    return columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.header,
      enableSorting: col.enableSorting !== false,
      enableColumnFilter: !!col.enableColumnFilter,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filterFn: col.enableColumnFilter
        ? (multiValueFilter as FilterFn<any>)
        : undefined,
      cell: ({ row }) =>
        col.render
          ? col.render(row.original[col.key as keyof T], row.original)
          : String(row.original[col.key as keyof T] ?? ""),
    }));
  }, [columns]);

  // Global search filter applied on top of TanStack
  const globallyFiltered = React.useMemo(() => {
    const q = modalQuery.trim().toLowerCase();
    if (!q) return dataSource;
    return dataSource.filter((item) =>
      searchKeys.some((key) =>
        String((item as Record<string, unknown>)[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [modalQuery, dataSource, searchKeys]);

  const table = useReactTable({
    data: globallyFiltered,
    columns: tanstackColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { multiValue: multiValueFilter },
    manualPagination: true,
  });

  const allRows = table.getRowModel().rows;
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const paginatedRows = allRows.slice((page - 1) * pageSize, page * pageSize);
  const startRow = allRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, allRows.length);

  // Reset page when filters / sort / query change
  React.useEffect(() => {
    setPage(1);
  }, [modalQuery, sorting, columnFilters]);
  React.useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const openModal = React.useCallback(() => {
    setModalQuery(searchText.trim());
    setOpen(true);
  }, [searchText]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearchText("");
    setModalQuery("");
    setSorting([]);
    setColumnFilters([]);
    setPage(1);
    setOpen(false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchText("");
    setModalQuery("");
    setSorting([]);
    setColumnFilters([]);
    setPage(1);
  };

  const triggerValue = value ? renderDisplay(value) : searchText;

  return (
    <Box minW="0" w="full">
      {label && (
        <Text mb={1.5} fontSize="sm" fontWeight="medium" color="gray.600">
          {label}
        </Text>
      )}

      <HStack w="full" gap={0}>
        <InputGroup
          flex="1"
          endElement={
            value || searchText ? (
              <IconButton
                aria-label="Clear"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
              >
                <X size={14} />
              </IconButton>
            ) : undefined
          }
        >
          <Input
            borderLeftRadius="sm"
            borderRightRadius="0"
            value={triggerValue}
            onChange={(e) => {
              if (value) onSelect(null);
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                openModal();
              }
            }}
            placeholder={placeholder}
            boxShadow="sm"
            pr={value || searchText ? "2.5rem" : undefined}
          />
        </InputGroup>

        <IconButton
          aria-label="Open search"
          variant="outline"
          size="md"
          onClick={openModal}
          borderRightRadius="sm"
          borderLeftRadius="0"
          bg="green.700"
          _hover={{ bg: "green.600" }}
          boxShadow="sm"
          color="white"
        >
          <Search size={16} />
        </IconButton>
      </HStack>

      {/* ------------------------------------------------------------------ */}
      {/* Modal                                                               */}
      {/* ------------------------------------------------------------------ */}
      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement="center"
        motionPreset="none"
        size="xl"
      >
        <Portal>
          <AnimatePresence>
            {open && (
              <>
                <Dialog.Backdrop asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Dialog.Backdrop>

                <Dialog.Positioner asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springTransition}
                    style={{ width: "100%", padding: "1rem" }}
                  >
                    <Dialog.Content
                      maxW="2xl"
                      w="full"
                      maxH="80vh"
                      borderRadius="2xl"
                      overflow="hidden"
                    >
                      <Dialog.Header
                        px={6}
                        py={5}
                        borderBottomWidth="1px"
                        w="full"
                      >
                        <HStack justify="space-between" w="full">
                          <Dialog.Title fontSize="xl" fontWeight="semibold">
                            {modalTitle}
                          </Dialog.Title>
                          <Dialog.CloseTrigger asChild>
                            <CloseButton
                              position="absolute"
                              top={3}
                              right={3}
                              aria-label="Close"
                            />
                          </Dialog.CloseTrigger>
                        </HStack>
                      </Dialog.Header>

                      <Dialog.Body p={0}>
                        {/* Global search */}
                        <Box px={6} py={4}>
                          <InputGroup
                            startElement={<Search size={16} />}
                            endElement={
                              modalQuery ? (
                                <IconButton
                                  aria-label="Clear search"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setModalQuery("")}
                                >
                                  <X size={14} />
                                </IconButton>
                              ) : undefined
                            }
                          >
                            <Input
                              ref={inputRef}
                              value={modalQuery}
                              onChange={(e) => setModalQuery(e.target.value)}
                              placeholder={placeholder}
                              borderRadius="md"
                              boxShadow="sm"
                              pr={modalQuery ? "2.5rem" : undefined}
                            />
                          </InputGroup>
                        </Box>

                        {/* Table */}
                        <Box
                          px={6}
                          overflowY="auto"
                          overflowX="auto"
                          maxH="calc(80vh - 140px)"
                        >
                          <Table.Root size="sm" width="max-content" minW="full">
                            <Table.Header position="sticky" top={0} zIndex={1}>
                              {table.getHeaderGroups().map((hg) => (
                                <Table.Row key={hg.id}>
                                  {hg.headers.map((header) => {
                                    const col = columns.find(
                                      (c) => c.key === header.id,
                                    );
                                    const canSort = header.column.getCanSort();
                                    const sortDir = header.column.getIsSorted();
                                    const filterVal =
                                      (header.column.getFilterValue() as string[]) ?? [
                                        "ALL",
                                      ];

                                    return (
                                      <Table.ColumnHeader
                                        key={header.id}
                                        p={4}
                                        textAlign="left"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="wide"
                                        whiteSpace="nowrap"
                                        bg="white"
                                      >
                                        <HStack gap={1.5} align="center">
                                          {/* Sort trigger */}
                                          <HStack
                                            gap={1}
                                            cursor={
                                              canSort ? "pointer" : "default"
                                            }
                                            userSelect="none"
                                            onClick={
                                              canSort
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                            }
                                            _hover={
                                              canSort
                                                ? { color: "gray.700" }
                                                : undefined
                                            }
                                          >
                                            <Text as="span">
                                              {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                              )}
                                            </Text>
                                            {canSort && (
                                              <SortIcon direction={sortDir} />
                                            )}
                                          </HStack>

                                          {/* Column filter dropdown */}
                                          {col?.enableColumnFilter && (
                                            <ColumnFilterDropdown
                                              columnId={header.id}
                                              allValues={
                                                uniqueColumnValues[header.id] ??
                                                []
                                              }
                                              filterValue={filterVal}
                                              onChange={(next) =>
                                                header.column.setFilterValue(
                                                  next,
                                                )
                                              }
                                            />
                                          )}
                                        </HStack>
                                      </Table.ColumnHeader>
                                    );
                                  })}
                                </Table.Row>
                              ))}
                            </Table.Header>

                            <Table.Body>
                              {paginatedRows.length === 0 ? (
                                <Table.Row>
                                  <Table.Cell
                                    colSpan={columns.length}
                                    p={10}
                                    textAlign="center"
                                    fontSize="sm"
                                    color="gray.500"
                                  >
                                    No results found
                                  </Table.Cell>
                                </Table.Row>
                              ) : (
                                paginatedRows.map((row) => (
                                  <Table.Row
                                    key={row.id}
                                    cursor="pointer"
                                    transition="background-color 0.15s"
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => handleSelect(row.original)}
                                  >
                                    {row.getVisibleCells().map((cell) => (
                                      <Table.Cell
                                        key={cell.id}
                                        p={4}
                                        textAlign="left"
                                        fontSize="sm"
                                        color="gray.800"
                                        whiteSpace="nowrap"
                                      >
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

                          {/* Pagination */}
                          {allRows.length > 0 && (
                            <HStack
                              justify="space-between"
                              align="center"
                              position="sticky"
                              bottom={0}
                              bg="white"
                              pt={4}
                              pb={5}
                              px={4}
                            >
                              <Text fontSize="sm" color="gray.500">
                                {startRow}–{endRow} of {allRows.length}
                              </Text>

                              <HStack gap={2}>
                                <IconButton
                                  aria-label="Previous page"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                  }
                                  disabled={page === 1}
                                >
                                  <ChevronLeft size={16} />
                                </IconButton>

                                <Text fontSize="sm" color="gray.600">
                                  {page} / {totalPages}
                                </Text>

                                <IconButton
                                  aria-label="Next page"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                  }
                                  disabled={page === totalPages}
                                >
                                  <ChevronRight size={16} />
                                </IconButton>
                              </HStack>
                            </HStack>
                          )}
                        </Box>
                      </Dialog.Body>
                    </Dialog.Content>
                  </motion.div>
                </Dialog.Positioner>
              </>
            )}
          </AnimatePresence>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
