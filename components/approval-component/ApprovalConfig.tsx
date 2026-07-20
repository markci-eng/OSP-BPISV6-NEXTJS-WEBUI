"use client";

import * as React from "react";
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  NativeSelect,
  Spinner,
  Text,
  Center,
  createListCollection,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Search, ChevronLeft, ChevronRight, Inbox, X } from "lucide-react";

import type { ApprovalPageProps, FilterConfig } from "./types";
import { ApprovalTable } from "./ApprovalTable";
import { ApprovalDrawer } from "./ApprovalDrawer";
import { BulkActionBar } from "./BulkActionBar";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

export function ApprovalPage<T extends Record<string, any>>({
  data,
  columns,
  rowIdKey,
  isLoading = false,
  sorting = true,
  enableColumnFilter = true,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  renderDrawerContent,
  filters = [],
  title = "Approvals",
  headerContent,
  pageSize = 15,
}: ApprovalPageProps<T>) {
  const [search, setSearch] = React.useState("");

  const initialFilters = Object.fromEntries(
    filters.map((f) => [f.key, f.default ?? null]),
  );
  const [activeFilters, setActiveFilters] =
    React.useState<Record<string, any>>(initialFilters);

  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const getRowId = React.useCallback(
    (row: T) => String(row[rowIdKey]),
    [rowIdKey],
  );

  const filtered = React.useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        }),
      );
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) {
        result = result.filter((row) => String(row[key] ?? "") === value);
      }
    }

    // Apply sorting
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, activeFilters, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = React.useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const toggleSelection = React.useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = React.useCallback(() => {
    const ids = paginated.map(getRowId);
    const allSelected = ids.every((id) => selectedRows.has(id));

    setSelectedRows((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, [paginated, selectedRows, getRowId]);

  const activeRow = React.useMemo(
    () =>
      activeRowId
        ? (data.find((r) => getRowId(r) === activeRowId) ?? null)
        : null,
    [activeRowId, data, getRowId],
  );

  const selectedData = React.useMemo(
    () => data.filter((r) => selectedRows.has(getRowId(r))),
    [data, selectedRows, getRowId],
  );

  const pageIds = paginated.map(getRowId);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id));
  const somePageSelected = pageIds.some((id) => selectedRows.has(id));

  const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filtered.length);

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  return (
    <Box>
      <Box mx="auto">
        {/* Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ md: "center" }}
          gap={4}
          mb={6}
        >
          {headerContent ?? (
            <Text fontSize="xl" fontWeight="semibold">
              {title}
            </Text>
          )}

          <HStack flexWrap={{ base: "wrap", lg: "nowrap" }} gap={2}>
            {filters.map((f) => (
              <FilterSelect
                key={f.key}
                filter={f}
                value={activeFilters[f.key] ?? ""}
                onChange={(v) => {
                  setActiveFilters((prev) => ({ ...prev, [f.key]: v }));
                  setPage(1);
                }}
              />
            ))}

            {/* Search */}
            <InputGroup
              startElement={<Icon as={Search} boxSize={4} />}
              // w={{ base: "full", sm: "300px" }}
              flex="1"
              minW="220px"
              endElement={
                search && (
                  <IconButton
                    aria-label="Clear"
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </IconButton>
                )
              }
            >
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search..."
              />
            </InputGroup>
          </HStack>
        </Flex>

        {/* Table */}
        <Box
          rounded="xl"
          bg="bg"
          borderWidth="1px"
          borderColor="border.muted"
          overflow="hidden"
        >
          {isLoading ? (
            <Center py={24}>
              <Spinner />
            </Center>
          ) : filtered.length === 0 ? (
            <Center py={24} flexDir="column">
              <Icon as={Inbox} boxSize={8} mb={3} opacity={0.4} />
              <Text fontSize="sm" color="fg.muted">
                No results found
              </Text>
            </Center>
          ) : isMobile ? (
            ""
          ) : (
            <ApprovalTable
              paginated={paginated}
              columns={columns}
              getRowId={getRowId}
              activeRowId={activeRowId}
              selectedRows={selectedRows}
              allPageSelected={allPageSelected}
              somePageSelected={somePageSelected}
              onToggleAll={toggleAll}
              onToggleSelection={toggleSelection}
              onRowClick={(id) => setActiveRowId(id)}
              onSort={(key) => {
                setSortKey(key);
                setSortDir((prev) =>
                  sortKey === key && prev === "asc" ? "desc" : "asc",
                );
              }}
              sortKey={sortKey}
              sortDir={sortDir}
            />
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <Flex
              px={4}
              py={3}
              borderTopWidth="1px"
              justify="space-between"
              align="center"
              fontSize="sm"
              color="fg.muted"
            >
              <Text>
                {start}–{end} of {filtered.length}
              </Text>

              <HStack>
                <IconButton
                  aria-label="Prev"
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft />
                </IconButton>

                <Text>
                  {page} / {totalPages}
                </Text>

                <IconButton
                  aria-label="Next"
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight />
                </IconButton>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Drawer */}
      {activeRow && (
        <ApprovalDrawer
          row={activeRow}
          onClose={() => setActiveRowId(null)}
          onApprove={onApprove}
          onReject={onReject}
          renderContent={renderDrawerContent}
        />
      )}

      {/* Bulk */}
      <BulkActionBar
        count={selectedRows.size}
        onBulkApprove={() => onBulkApprove(selectedData)}
        onBulkReject={() => onBulkReject(selectedData)}
        onClear={() => setSelectedRows(new Set())}
      />
    </Box>
  );
}

function FilterSelect({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    // <NativeSelect.Root w={{ base: "full", sm: "180px" }}>
    //   <NativeSelect.Field
    //     value={value}
    //     onChange={(e) => onChange(e.target.value)}
    //   >
    //     {filter.options.map((o) => (
    //       <option key={o.value} value={o.value}>
    //         {o.label}
    //       </option>
    //     ))}
    //   </NativeSelect.Field>
    //   <NativeSelect.Indicator />
    // </NativeSelect.Root>
    <Box w={{ base: "full", lg: "160px" }}>
      <FloatingLabelSelect
        label={filter.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {filter.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </FloatingLabelSelect>
    </Box>
  );
}
