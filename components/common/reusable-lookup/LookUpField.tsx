"use client";

import * as React from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ListFilter,
  CornerDownLeft,
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
  Dialog,
  Flex,
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
  useBreakpointValue,
} from "@chakra-ui/react";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LookupColumn<T> {
  key: keyof T & string;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  enableColumnFilter?: boolean;
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
  mobileFullscreen?: boolean;
  variant?: "search" | "dropdown";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const springTransition = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0,
};

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
// Shortcut key badge
// ---------------------------------------------------------------------------

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="kbd"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="5px"
      py="1px"
      border="1px solid"
      borderColor="gray.200"
      borderBottomWidth="2px"
      borderRadius="md"
      bg="white"
      fontSize="10px"
      fontWeight="semibold"
      color="gray.500"
      lineHeight="1.6"
      fontFamily="mono"
      minW="18px"
    >
      {children}
    </Box>
  );
}

function ShortcutHint({
  keys,
  label,
}: {
  keys: React.ReactNode[];
  label: string;
}) {
  return (
    <HStack gap={1} align="center">
      {keys.map((k, i) => (
        <Kbd key={i}>{k}</Kbd>
      ))}
      <Text fontSize="10px" color="gray.400" ml="1px">
        {label}
      </Text>
    </HStack>
  );
}

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
          bg={isActive ? "var(--chakra-colors-primary)" : "gray.100"}
          color={isActive ? "white" : "gray.500"}
          _hover={{
            bg: isActive ? "var(--chakra-colors-primary)" : "gray.200",
          }}
          borderRadius="md"
          onClick={(e) => e.stopPropagation()}
        >
          <ListFilter size={11} />
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="220px"
            p={0}
            borderRadius="xl"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.100"
            onClick={(e) => e.stopPropagation()}
          >
            <Popover.Body p={0}>
              <VStack align="stretch" gap={0} py={2}>
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
                    <Checkbox.Control borderRadius="sm" />
                  </Checkbox.Root>
                  <Text fontSize="sm" color="gray.700">
                    All
                  </Text>
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
                      <Checkbox.Control borderRadius="sm" />
                    </Checkbox.Root>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      textTransform="capitalize"
                    >
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
                <Button
                  flex={1}
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                  onClick={cancel}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  size="sm"
                  bg="var(--chakra-colors-primary)"
                  color="white"
                  borderRadius="lg"
                  _hover={{ opacity: 0.9 }}
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
  if (direction === "asc") return <ChevronUp size={12} />;
  if (direction === "desc") return <ChevronDown size={12} />;
  return <ChevronDown size={12} opacity={0.35} />;
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
  mobileFullscreen = false,
  variant = "search",
}: LookupFieldProps<T>) {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const isFullscreen = isMobile;
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [modalQuery, setModalQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [isTriggerFocused, setIsTriggerFocused] = React.useState(false);
  const [suggestionIndex, setSuggestionIndex] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const rowRefs = React.useRef<Map<number, HTMLTableRowElement>>(new Map());
  const pageSize = 10;

  // Suggestions — filtered from dataSource while typing in the trigger input
  const allSuggestions = React.useMemo(() => {
    if (!searchText.trim() || !!value) return [];
    const q = searchText.trim().toLowerCase();
    return dataSource.filter((item) =>
      searchKeys.some((key) =>
        String((item as Record<string, unknown>)[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [searchText, dataSource, searchKeys, value]);

  const suggestions = allSuggestions.slice(0, 8);
  const showSuggestions =
    variant === "search" && isTriggerFocused && !value && suggestions.length > 0;

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

  // Reset page + highlight when filters / sort / query change
  React.useEffect(() => {
    setPage(1);
    setHighlightedIndex(-1);
  }, [modalQuery, sorting, columnFilters]);

  // Reset highlight when page changes
  React.useEffect(() => {
    setHighlightedIndex(-1);
    rowRefs.current.clear();
  }, [page]);

  // Reset everything when modal opens
  React.useEffect(() => {
    if (open) {
      setPage(1);
      setHighlightedIndex(-1);
      rowRefs.current.clear();
    }
  }, [open]);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Safety net: zag-js (Chakra v3) can leak the body pointer-events lock on
  // close, freezing the page. After close, clear it if no other modal is open.
  React.useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      if (
        !document.querySelector(
          '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
        )
      ) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Auto-scroll highlighted row into view
  React.useEffect(() => {
    if (highlightedIndex >= 0) {
      rowRefs.current.get(highlightedIndex)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Reset suggestion highlight when text changes
  React.useEffect(() => {
    setSuggestionIndex(-1);
  }, [searchText]);

  const openModal = React.useCallback(() => {
    setIsTriggerFocused(false);
    setSuggestionIndex(-1);
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
    setHighlightedIndex(-1);
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
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (item: T) => {
    onSelect(item);
    setSearchText("");
    setSuggestionIndex(-1);
    setIsTriggerFocused(false);
  };

  // Keyboard navigation inside the modal search input
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const lastIdx = paginatedRows.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev < lastIdx) return prev + 1;
          // Advance to next page if available
          if (page < totalPages) {
            setPage((p) => p + 1);
            return 0;
          }
          return prev;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev > 0) return prev - 1;
          // Go back to previous page if available
          if (prev === 0 && page > 1) {
            setPage((p) => p - 1);
            return pageSize - 1;
          }
          return prev;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && paginatedRows[highlightedIndex]) {
          handleSelect(paginatedRows[highlightedIndex].original);
        } else if (paginatedRows.length === 1) {
          // Auto-select when only one result
          handleSelect(paginatedRows[0].original);
        }
        break;

      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;

      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;

      case "End":
        e.preventDefault();
        setHighlightedIndex(lastIdx);
        break;

      case "PageDown":
        e.preventDefault();
        if (page < totalPages) {
          setPage((p) => p + 1);
        } else {
          setHighlightedIndex(lastIdx);
        }
        break;

      case "PageUp":
        e.preventDefault();
        if (page > 1) {
          setPage((p) => p - 1);
        } else {
          setHighlightedIndex(0);
        }
        break;
    }
  };

  const triggerValue = value ? renderDisplay(value) : searchText;

  return (
    <Box minW="0" w="full" position="relative">
      {label && (
        <Text mb={1.5} fontSize="sm" fontWeight="medium" color="gray.600">
          {label}
        </Text>
      )}

      {/* ── Trigger ── */}
      {variant === "dropdown" ? (
        <HStack
          gap={0}
          w="full"
          border="1.5px solid"
          borderColor={
            value ? "var(--chakra-colors-primary-disabled)" : "gray.200"
          }
          borderRadius="lg"
          bg="white"
          boxShadow="xs"
          minH="10"
          px={3}
          cursor="pointer"
          role="button"
          tabIndex={0}
          transition="border-color 0.15s, box-shadow 0.15s"
          _hover={{
            borderColor: value ? "var(--chakra-colors-primary)" : "gray.300",
          }}
          _focusVisible={{
            outline: "none",
            borderColor: "var(--chakra-colors-primary)",
            boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
          }}
          onClick={openModal}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal();
            }
          }}
        >
          <Text
            flex={1}
            fontSize="sm"
            color={value ? "gray.800" : "gray.400"}
            fontWeight={value ? "medium" : "normal"}
            lineClamp={1}
            userSelect="none"
          >
            {value ? renderDisplay(value) : placeholder}
          </Text>

          {value && (
            <IconButton
              aria-label="Clear selection"
              variant="ghost"
              size="xs"
              borderRadius="full"
              color="gray.400"
              flexShrink={0}
              _hover={{ bg: "gray.100", color: "gray.600" }}
              onClick={handleClearSelection}
            >
              <X size={12} />
            </IconButton>
          )}

          <Box color="gray.400" flexShrink={0} ml={1}>
            <ChevronDown size={15} />
          </Box>
        </HStack>
      ) : (
        <HStack gap={0} w="full">
          <Box
            flex={1}
            border="1.5px solid"
            borderColor={
              value ? "var(--chakra-colors-primary-disabled)" : "gray.200"
            }
            borderRightWidth="0"
            borderLeftRadius="lg"
            bg="white"
            boxShadow="xs"
            overflow="hidden"
            transition="border-color 0.15s, box-shadow 0.15s"
            _hover={{
              borderColor: value ? "var(--chakra-colors-primary)" : "gray.300",
            }}
            _focusWithin={{
              borderColor: "var(--chakra-colors-primary)",
              boxShadow: "0 0 0 3px var(--chakra-colors-primary-disabled)",
            }}
            minH="10"
            display="flex"
            alignItems="center"
          >
            <Input
              value={triggerValue}
              onChange={(e) => {
                if (value) onSelect(null);
                setSearchText(e.target.value);
              }}
              onFocus={() => setIsTriggerFocused(true)}
              onBlur={() => {
                setTimeout(() => {
                  setIsTriggerFocused(false);
                  setSuggestionIndex(-1);
                }, 150);
              }}
              onKeyDown={(e) => {
                if (showSuggestions) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSuggestionIndex((p) =>
                      Math.min(p + 1, suggestions.length - 1),
                    );
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSuggestionIndex((p) => Math.max(p - 1, -1));
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
                      handleSelectSuggestion(suggestions[suggestionIndex]);
                    } else {
                      openModal();
                    }
                    return;
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setIsTriggerFocused(false);
                    setSuggestionIndex(-1);
                    return;
                  }
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  openModal();
                }
              }}
              onClick={() => {
                if (value) openModal();
              }}
              placeholder={placeholder}
              readOnly={!!value}
              cursor={value ? "pointer" : "text"}
              border="none"
              bg="transparent"
              boxShadow="none"
              borderRadius="0"
              px={3}
              fontSize="sm"
              color={value ? "gray.800" : "gray.700"}
              fontWeight={value ? "medium" : "normal"}
              _placeholder={{ color: "gray.400" }}
              _focus={{ boxShadow: "none", outline: "none" }}
            />

            {(value || searchText) && (
              <Flex align="center" pr={2} flexShrink={0}>
                <IconButton
                  aria-label="Clear selection"
                  variant="ghost"
                  size="xs"
                  borderRadius="full"
                  color="gray.400"
                  _hover={{ bg: "gray.100", color: "gray.600" }}
                  onClick={handleClearSelection}
                >
                  <X size={12} />
                </IconButton>
              </Flex>
            )}
          </Box>

          <IconButton
            aria-label="Open search"
            onClick={openModal}
            bg="var(--chakra-colors-primary)"
            color="white"
            borderLeftRadius="0"
            borderRightRadius="lg"
            h="10"
            minW="10"
            flexShrink={0}
            _hover={{ opacity: 0.88 }}
            _active={{ opacity: 0.75 }}
          >
            <Search size={15} />
          </IconButton>
        </HStack>
      )}

      {/* ── Suggestions dropdown ── */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 1500,
            }}
          >
            <Box
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.100"
              boxShadow="xl"
              overflow="hidden"
            >
              {suggestions.map((item, index) => {
                const isActive = index === suggestionIndex;
                return (
                  <Flex
                    key={index}
                    px={4}
                    py={2.5}
                    align="center"
                    gap={3}
                    cursor="pointer"
                    bg={
                      isActive
                        ? "var(--chakra-colors-primary-disabled)/15"
                        : "white"
                    }
                    borderLeft="3px solid"
                    borderLeftColor={
                      isActive ? "var(--chakra-colors-primary)" : "transparent"
                    }
                    borderBottomWidth="1px"
                    borderBottomColor="gray.50"
                    transition="all 0.08s"
                    _hover={{
                      bg: "var(--chakra-colors-primary-disabled)/10",
                      borderLeftColor: "var(--chakra-colors-primary)",
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(item);
                    }}
                    onMouseEnter={() => setSuggestionIndex(index)}
                  >
                    <Box
                      color={
                        isActive ? "var(--chakra-colors-primary)" : "gray.300"
                      }
                      flexShrink={0}
                    >
                      <Search size={12} />
                    </Box>
                    <Text
                      fontSize="sm"
                      color={
                        isActive ? "var(--chakra-colors-primary)" : "gray.700"
                      }
                      fontWeight={isActive ? "medium" : "normal"}
                      lineClamp={1}
                      flex={1}
                      transition="color 0.08s"
                    >
                      {renderDisplay(item)}
                    </Text>
                  </Flex>
                );
              })}

              {/* "See all" footer when there are more results */}
              {allSuggestions.length > 8 && (
                <Flex
                  px={4}
                  py={2.5}
                  borderTopWidth="1px"
                  borderColor="gray.100"
                  bg="gray.50"
                  cursor="pointer"
                  align="center"
                  justify="space-between"
                  _hover={{ bg: "gray.100" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    openModal();
                  }}
                >
                  <Text
                    fontSize="xs"
                    color="var(--chakra-colors-primary)"
                    fontWeight="medium"
                  >
                    See all {allSuggestions.length} results
                  </Text>
                  <ChevronRight
                    size={12}
                    color="var(--chakra-colors-primary)"
                  />
                </Flex>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement={isFullscreen ? "top" : "center"}
        motionPreset="none"
        size={isFullscreen ? "full" : "xl"}
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
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(15, 23, 42, 0.45)",
                      backdropFilter: "blur(3px)",
                    }}
                  />
                </Dialog.Backdrop>

                <Dialog.Positioner asChild>
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: isFullscreen ? 1 : 0.96,
                      y: isFullscreen ? 16 : 0,
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: isFullscreen ? 1 : 0.96,
                      y: isFullscreen ? 16 : 0,
                    }}
                    transition={springTransition}
                    style={{
                      width: "100%",
                      padding: isFullscreen ? "0" : "1rem",
                    }}
                  >
                    <Dialog.Content
                      maxW={isFullscreen ? "100vw" : "2xl"}
                      w="full"
                      h={isFullscreen ? "100dvh" : "auto"}
                      maxH={isFullscreen ? "100dvh" : "80vh"}
                      borderRadius={isFullscreen ? "0" : "2xl"}
                      overflow="hidden"
                      boxShadow="2xl"
                      bg="white"
                    >
                      {/* Header */}
                      <Dialog.Header
                        px={5}
                        py={4}
                        borderBottomWidth="1px"
                        borderColor="gray.100"
                        bg="white"
                      >
                        <HStack gap={3} flex={1} minW={0}>
                          <Box
                            p={2}
                            bg="var(--chakra-colors-primary-disabled)/20"
                            borderRadius="lg"
                            flexShrink={0}
                          >
                            <Search
                              size={15}
                              color="var(--chakra-colors-primary)"
                            />
                          </Box>
                          <Dialog.Title
                            fontSize="md"
                            fontWeight="semibold"
                            color="gray.800"
                            lineClamp={1}
                          >
                            {modalTitle}
                          </Dialog.Title>
                        </HStack>
                        <Dialog.CloseTrigger asChild>
                          <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            position="absolute"
                            top={3}
                            right={3}
                            color="gray.400"
                            _hover={{ bg: "gray.100", color: "gray.700" }}
                          >
                            <X size={15} />
                          </IconButton>
                        </Dialog.CloseTrigger>
                      </Dialog.Header>

                      {/* Search toolbar */}
                      <Box
                        px={5}
                        py={3}
                        bg="gray.50"
                        borderBottomWidth="1px"
                        borderColor="gray.100"
                      >
                        <InputGroup
                          startElement={
                            <Box
                              color="gray.400"
                              display="flex"
                              alignItems="center"
                            >
                              <Search size={14} />
                            </Box>
                          }
                          endElement={
                            modalQuery ? (
                              <IconButton
                                aria-label="Clear search"
                                variant="ghost"
                                size="xs"
                                borderRadius="full"
                                color="gray.400"
                                _hover={{ bg: "gray.200" }}
                                onClick={() => setModalQuery("")}
                              >
                                <X size={12} />
                              </IconButton>
                            ) : undefined
                          }
                        >
                          <Input
                            ref={inputRef}
                            value={modalQuery}
                            onChange={(e) => setModalQuery(e.target.value)}
                            onKeyDown={handleModalKeyDown}
                            placeholder={placeholder}
                            borderRadius="lg"
                            bg="white"
                            borderColor="gray.200"
                            fontSize="sm"
                            _focus={{
                              borderColor: "var(--chakra-colors-primary)",
                              boxShadow:
                                "0 0 0 3px var(--chakra-colors-primary-disabled)",
                            }}
                            pr={modalQuery ? "2.5rem" : undefined}
                          />
                        </InputGroup>
                      </Box>

                      {/* Table */}
                      <Dialog.Body p={0}>
                        <Box
                          overflowY="auto"
                          overflowX={isMobile ? "hidden" : "auto"}
                          maxH={
                            isFullscreen
                              ? "calc(100dvh - 220px)"
                              : "calc(80vh - 220px)"
                          }
                        >
                          {/* ── Empty state (shared) ── */}
                          {paginatedRows.length === 0 && (
                            <Flex
                              direction="column"
                              align="center"
                              justify="center"
                              gap={2}
                              py={14}
                            >
                              <Box
                                p={3}
                                borderRadius="full"
                                bg="gray.100"
                                color="gray.400"
                              >
                                <Search size={22} />
                              </Box>
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color="gray.500"
                              >
                                No results found
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                Try a different search term
                              </Text>
                            </Flex>
                          )}

                          {/* ── Mobile: card list ── */}
                          {isMobile && paginatedRows.length > 0 && (
                            <Flex direction="column" gap={2} p={3}>
                              {paginatedRows.map((row, index) => {
                                const isHighlighted =
                                  index === highlightedIndex;
                                const cells = row.getVisibleCells();
                                return (
                                  <Box
                                    key={row.id}
                                    ref={(el: any) => {
                                      if (el)
                                        rowRefs.current.set(
                                          index,
                                          el as HTMLTableRowElement,
                                        );
                                      else rowRefs.current.delete(index);
                                    }}
                                    borderRadius="xl"
                                    borderWidth="1.5px"
                                    borderColor={
                                      isHighlighted
                                        ? "var(--chakra-colors-primary-disabled)"
                                        : "gray.100"
                                    }
                                    borderLeftWidth="3px"
                                    borderLeftColor={
                                      isHighlighted
                                        ? "var(--chakra-colors-primary)"
                                        : "gray.100"
                                    }
                                    bg={
                                      isHighlighted
                                        ? "var(--chakra-colors-primary-disabled)/15"
                                        : "white"
                                    }
                                    boxShadow="sm"
                                    px={4}
                                    py={3}
                                    cursor="pointer"
                                    transition="all 0.1s"
                                    _active={{ transform: "scale(0.99)" }}
                                    _hover={{
                                      borderLeftColor:
                                        "var(--chakra-colors-primary)",
                                      bg: "var(--chakra-colors-primary-disabled)/10",
                                    }}
                                    onClick={() => handleSelect(row.original)}
                                    onMouseEnter={() =>
                                      setHighlightedIndex(index)
                                    }
                                  >
                                    {/* First cell as card title */}
                                    <Text
                                      fontSize="sm"
                                      fontWeight="semibold"
                                      color={
                                        isHighlighted
                                          ? "var(--chakra-colors-primary)"
                                          : "gray.800"
                                      }
                                      mb={2}
                                      lineClamp={1}
                                    >
                                      {flexRender(
                                        cells[0].column.columnDef.cell,
                                        cells[0].getContext(),
                                      )}
                                    </Text>

                                    {/* Remaining cells as label–value rows */}
                                    <Flex direction="column" gap={1}>
                                      {cells.slice(1).map((cell) => {
                                        const col = columns.find(
                                          (c) => c.key === cell.column.id,
                                        );
                                        return (
                                          <HStack
                                            key={cell.id}
                                            gap={2}
                                            align="baseline"
                                          >
                                            <Text
                                              fontSize="xs"
                                              color="gray.400"
                                              flexShrink={0}
                                              w="80px"
                                            >
                                              {col?.header}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color={
                                                isHighlighted
                                                  ? "var(--chakra-colors-primary)"
                                                  : "gray.600"
                                              }
                                              lineClamp={1}
                                            >
                                              {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                              )}
                                            </Text>
                                          </HStack>
                                        );
                                      })}
                                    </Flex>
                                  </Box>
                                );
                              })}
                            </Flex>
                          )}

                          {/* ── Desktop: table ── */}
                          {!isMobile && (
                            <Table.Root
                              size="sm"
                              width="max-content"
                              minW="full"
                            >
                              <Table.Header
                                position="sticky"
                                top={0}
                                zIndex={1}
                              >
                                {table.getHeaderGroups().map((hg) => (
                                  <Table.Row
                                    key={hg.id}
                                    bg="white"
                                    borderBottomWidth="2px"
                                    borderColor="gray.100"
                                  >
                                    {hg.headers.map((header) => {
                                      const col = columns.find(
                                        (c) => c.key === header.id,
                                      );
                                      const canSort =
                                        header.column.getCanSort();
                                      const sortDir =
                                        header.column.getIsSorted();
                                      const filterVal =
                                        (header.column.getFilterValue() as string[]) ?? [
                                          "ALL",
                                        ];

                                      return (
                                        <Table.ColumnHeader
                                          key={header.id}
                                          px={4}
                                          py={3}
                                          textAlign="left"
                                          fontSize="xs"
                                          fontWeight="semibold"
                                          color="gray.400"
                                          textTransform="uppercase"
                                          letterSpacing="wider"
                                          whiteSpace="nowrap"
                                          bg="white"
                                        >
                                          <HStack gap={1.5} align="center">
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
                                                  ? { color: "gray.600" }
                                                  : undefined
                                              }
                                              transition="color 0.1s"
                                            >
                                              <Text as="span">
                                                {flexRender(
                                                  header.column.columnDef
                                                    .header,
                                                  header.getContext(),
                                                )}
                                              </Text>
                                              {canSort && (
                                                <SortIcon direction={sortDir} />
                                              )}
                                            </HStack>

                                            {col?.enableColumnFilter && (
                                              <ColumnFilterDropdown
                                                columnId={header.id}
                                                allValues={
                                                  uniqueColumnValues[
                                                    header.id
                                                  ] ?? []
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
                                {paginatedRows.length > 0 &&
                                  paginatedRows.map((row, index) => {
                                    const isHighlighted =
                                      index === highlightedIndex;
                                    return (
                                      <Table.Row
                                        key={row.id}
                                        ref={(el) => {
                                          if (el)
                                            rowRefs.current.set(
                                              index,
                                              el as HTMLTableRowElement,
                                            );
                                          else rowRefs.current.delete(index);
                                        }}
                                        cursor="pointer"
                                        bg={
                                          isHighlighted
                                            ? "var(--chakra-colors-primary-disabled)/20"
                                            : undefined
                                        }
                                        borderLeft={
                                          isHighlighted
                                            ? "3px solid"
                                            : "3px solid transparent"
                                        }
                                        borderLeftColor={
                                          isHighlighted
                                            ? "var(--chakra-colors-primary)"
                                            : "transparent"
                                        }
                                        transition="background-color 0.08s"
                                        _hover={{
                                          bg: isHighlighted
                                            ? "var(--chakra-colors-primary-disabled)/25"
                                            : "var(--chakra-colors-primary-disabled)/10",
                                        }}
                                        onClick={() =>
                                          handleSelect(row.original)
                                        }
                                        onMouseEnter={() =>
                                          setHighlightedIndex(index)
                                        }
                                        borderBottomWidth="1px"
                                        borderColor="gray.50"
                                      >
                                        {row.getVisibleCells().map((cell) => (
                                          <Table.Cell
                                            key={cell.id}
                                            px={4}
                                            py={3}
                                            textAlign="left"
                                            fontSize="sm"
                                            color={
                                              isHighlighted
                                                ? "var(--chakra-colors-primary)"
                                                : "gray.700"
                                            }
                                            fontWeight={
                                              isHighlighted
                                                ? "medium"
                                                : "normal"
                                            }
                                            whiteSpace="nowrap"
                                            transition="color 0.08s"
                                          >
                                            {flexRender(
                                              cell.column.columnDef.cell,
                                              cell.getContext(),
                                            )}
                                          </Table.Cell>
                                        ))}
                                      </Table.Row>
                                    );
                                  })}
                              </Table.Body>
                            </Table.Root>
                          )}
                        </Box>

                        {/* Shortcut hints + Pagination */}
                        <Box
                          borderTopWidth="1px"
                          borderColor="gray.100"
                          bg="gray.50"
                        >
                          {/* Shortcut bar */}
                          <HStack
                            px={5}
                            py={2}
                            gap={4}
                            display={{ base: "none", lg: "flex" }}
                            borderBottomWidth="1px"
                            borderColor="gray.100"
                            flexWrap="wrap"
                          >
                            <ShortcutHint keys={["↑", "↓"]} label="Navigate" />
                            <ShortcutHint
                              keys={[<CornerDownLeft key="enter" size={10} />]}
                              label="Select"
                            />
                            <ShortcutHint keys={["Esc"]} label="Close" />
                            <ShortcutHint
                              keys={["PgDn", "PgUp"]}
                              label="Page"
                            />
                            <ShortcutHint keys={["Home", "End"]} label="Jump" />
                          </HStack>

                          {/* Pagination */}
                          {allRows.length > 0 && (
                            <HStack
                              justify="space-between"
                              align="center"
                              px={5}
                              py={3}
                            >
                              <Text fontSize="xs" color="gray.400">
                                {startRow}–{endRow}{" "}
                                <Text as="span" color="gray.300">
                                  of
                                </Text>{" "}
                                {allRows.length} results
                              </Text>

                              <HStack gap={1}>
                                <IconButton
                                  aria-label="Previous page"
                                  size="sm"
                                  variant="ghost"
                                  borderRadius="full"
                                  color="gray.500"
                                  _hover={{ bg: "gray.200" }}
                                  onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                  }
                                  disabled={page === 1}
                                >
                                  <ChevronLeft size={15} />
                                </IconButton>

                                <Box
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  bg="white"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  minW="60px"
                                  textAlign="center"
                                >
                                  <Text
                                    fontSize="xs"
                                    fontWeight="medium"
                                    color="gray.600"
                                  >
                                    {page} / {totalPages}
                                  </Text>
                                </Box>

                                <IconButton
                                  aria-label="Next page"
                                  size="sm"
                                  variant="ghost"
                                  borderRadius="full"
                                  color="gray.500"
                                  _hover={{ bg: "gray.200" }}
                                  onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                  }
                                  disabled={page === totalPages}
                                >
                                  <ChevronRight size={15} />
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
