import { useState, useMemo } from "react";
import {
  Box,
  Input,
  IconButton,
  HStack,
  Table,
  Dialog,
  Portal,
  Text,
  Group,
} from "@chakra-ui/react";
import { FaSearch, FaTimes } from "react-icons/fa";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export type Header = { label: string; field: string };

type Props<T> = {
  data: T[];
  headers: Header[];
  placeholder?: string;
  modalTitle?: string;
  displayField?: keyof T;
  getInputValue?: (item: T) => string;
  onSelect?: (item: T) => void;
  pageSizeOptions?: number[];
};

const LookUp = <T extends Record<string, any>>({
  data = [],
  headers,
  placeholder = "Search...",
  modalTitle,
  displayField,
  getInputValue,
  onSelect,
  pageSizeOptions = [10, 20, 50, 100],
}: Props<T>) => {
  const [selected, setSelected] = useState<T | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // ================= FILTER =================
  const filteredData = useMemo(() => {
    const query = modalSearch.toLowerCase();
    if (!query) return data;

    return data.filter((item) =>
      headers.some((h) => String(item[h.field]).toLowerCase().includes(query)),
    );
  }, [modalSearch, data, headers]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // ================= SELECT =================
  const handleSelect = (item: T) => {
    setSelected(item);

    if (getInputValue) setInputValue(getInputValue(item));
    else if (displayField) setInputValue(String(item[displayField] ?? ""));
    else setInputValue(headers.map((h) => item[h.field]).join(" - "));

    setOpen(false);
    setPage(1);
    onSelect?.(item);
  };

  // ================= OPEN =================
  const handleOpenModal = () => {
    setModalSearch(inputValue);
    setOpen(true);
    setPage(1);
    setPageSize(pageSizeOptions[0]);
    setHighlightIndex(0);
  };

  // ================= PAGINATION =================
  const goFirst = () => setPage(1);
  const goLast = () => setPage(totalPages);
  const goPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return (
    <Box w="100%">
      {/* ================= INPUT ================= */}
      <Group attached w="100%" mb={3}>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSelected(null);
          }}
          focusRing="none"
          _focus={{
            borderColor: "green.600",
            boxShadow: "none",
          }}
          h="36px"
        />

        <IconButton
          aria-label="Search"
          onClick={handleOpenModal}
          bg="green.600"
          color="white"
          _hover={{ bg: "green.700" }}
          _focusVisible={{
            outline: "none",
            boxShadow: "none",
          }}
          h="36px"
        >
          <FaSearch />
        </IconButton>
      </Group>

      {/* ================= MODAL ================= */}
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />

          <Dialog.Positioner>
            <Dialog.Content
              w={{ base: "95vw", md: "90vw", lg: "900px" }}
              maxW="900px"
              tabIndex={0}
              onKeyDown={(e) => {
                const maxIndex = paginatedData.length - 1;

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIndex((p) => Math.min(p + 1, maxIndex));
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIndex((p) => Math.max(p - 1, 0));
                }

                if (e.key === "Enter") {
                  e.preventDefault();
                  const item = paginatedData[highlightIndex];
                  if (item) handleSelect(item);
                }

                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
            >
              <Dialog.Header>
                <HStack justify="space-between" w="100%">
                  <Text fontWeight="bold">{modalTitle || "Select Item"}</Text>

                  <IconButton
                    aria-label="Close"
                    size="sm"
                    onClick={() => setOpen(false)}
                    variant="ghost"
                    bg="transparent"
                    border="none"
                    color="green.600"
                    _hover={{
                      bg: "transparent",
                      color: "green.700",
                    }}
                    _active={{ bg: "transparent" }}
                    _focusVisible={{
                      outline: "none",
                      boxShadow: "none",
                    }}
                  >
                    <FaTimes size={18} />
                  </IconButton>
                </HStack>
              </Dialog.Header>

              <Dialog.Body>
                {/* SEARCH */}
                <Box mb={3}>
                  <Input
                    placeholder="Search here..."
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setPage(1);
                      setHighlightIndex(0);
                    }}
                    focusRing="none"
                    _focus={{
                      boxShadow: "none",
                      borderColor: "green.600",
                    }}
                  />
                </Box>

                {/* TABLE */}
                <Box overflowX="auto">
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        {headers.map((h) => (
                          <Table.ColumnHeader key={h.field}>
                            {h.label}
                          </Table.ColumnHeader>
                        ))}
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {paginatedData.length ? (
                        paginatedData.map((item, idx) => (
                          <Table.Row
                            key={idx}
                            _hover={{ bg: "gray.100", cursor: "pointer" }}
                            bg={highlightIndex === idx ? "green.50" : undefined}
                            onMouseEnter={() => setHighlightIndex(idx)}
                            onClick={() => handleSelect(item)}
                          >
                            {headers.map((h) => (
                              <Table.Cell key={h.field}>
                                {item[h.field]}
                              </Table.Cell>
                            ))}
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan={headers.length}>
                            No results found
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Root>
                </Box>

                {/* ================= PAGINATION (UNCHANGED STRUCTURE) ================= */}
                <Box mt={4}>
                  <HStack
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={3}
                  >
                    {/* ROWS PER PAGE */}
                    <HStack
                      flexWrap="wrap"
                      gap={2}
                      w={{ base: "100%", md: "auto" }}
                      justify={{ base: "center", md: "flex-start" }}
                      textAlign={{ base: "center", md: "left" }}
                    >
                      <Text whiteSpace="nowrap">Rows per page</Text>

                      <select
                        value={pageSize}
                        onChange={(e) =>
                          handlePageSizeChange(Number(e.target.value))
                        }
                        style={{
                          width: "80px",
                          fontSize: "0.9rem",
                          padding: "0.25rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #CBD5E0",
                          textAlign: "center",
                        }}
                      >
                        {pageSizeOptions.map((ps) => (
                          <option key={ps} value={ps}>
                            {ps}
                          </option>
                        ))}
                      </select>
                    </HStack>

                    {/* PAGINATION */}
                    <HStack
                      flexWrap="wrap"
                      gap={1}
                      w={{ base: "100%", md: "auto" }}
                      justify={{ base: "center", md: "flex-end" }}
                      textAlign="center"
                    >
                      <Text fontSize="sm" whiteSpace="nowrap">
                        Page {page} of {totalPages} ({filteredData.length})
                      </Text>

                      <IconButton
                        aria-label="First page"
                        size="sm"
                        variant="outline"
                        onClick={goFirst}
                        disabled={page === 1}
                      >
                        <ChevronsLeft size={16} />
                      </IconButton>

                      <IconButton
                        aria-label="Previous page"
                        size="sm"
                        variant="outline"
                        onClick={goPrev}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} />
                      </IconButton>

                      <IconButton
                        aria-label="Next page"
                        size="sm"
                        variant="outline"
                        onClick={goNext}
                        disabled={page === totalPages}
                      >
                        <ChevronRight size={16} />
                      </IconButton>

                      <IconButton
                        aria-label="Last page"
                        size="sm"
                        variant="outline"
                        onClick={goLast}
                        disabled={page === totalPages}
                      >
                        <ChevronsRight size={16} />
                      </IconButton>
                    </HStack>
                  </HStack>
                </Box>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default LookUp;
