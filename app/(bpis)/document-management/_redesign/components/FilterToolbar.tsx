"use client";

import * as React from "react";
import {
  Box,
  Button,
  Drawer,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  FileText,
  Filter,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";

import { AGENTS } from "../data";
import { DOC_TYPES, STATUS_META, statusPalette, typePalette } from "../meta";
import { type Filters, EMPTY_FILTERS, hasActiveFilters } from "../types";
import { AgentAvatar } from "./atoms";
import SearchableSelect, { type SearchableSelectOption } from "./SearchableSelect";

const MotionBox = motion(Box);

type Props = {
  applied: Filters;
  onApply: (next: Filters) => void;
  onReset: () => void;
};

/** Small solid dot used to preview a type/status palette in the option row. */
function Dot({ palette }: { palette: string }) {
  return <Box w="9px" h="9px" borderRadius="full" bg={`${palette}.500`} flexShrink={0} />;
}

const agentOptions: SearchableSelectOption[] = [
  { value: "", label: "All agents" },
  ...AGENTS.map((a) => ({
    value: a.id,
    label: a.name,
    description: a.emp,
    leading: <AgentAvatar agent={a} size={22} />,
  })),
];

const typeOptions: SearchableSelectOption[] = [
  { value: "", label: "All types" },
  ...DOC_TYPES.map((t) => ({
    value: t,
    label: t,
    leading: <Dot palette={typePalette(t)} />,
  })),
];

const statusOptions: SearchableSelectOption[] = [
  { value: "", label: "All statuses" },
  ...Object.keys(STATUS_META).map((s) => ({
    value: s,
    label: s,
    leading: <Dot palette={statusPalette(s)} />,
  })),
];

/** True when any of the sheet-hosted filters (everything except the always-visible
    search box) are active — drives the filter button's active state and dot. */
function hasSheetFilters(f: Filters): boolean {
  return (
    !!f.type ||
    !!f.status ||
    !!f.agent ||
    !!f.expFrom ||
    !!f.expTo ||
    f.remMin !== "" ||
    f.remMax !== ""
  );
}

export default function FilterToolbar({ applied, onApply, onReset }: Props) {
  const [draft, setDraft] = React.useState<Filters>(applied);
  const [showMore, setShowMore] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Resolve the breakpoint before committing to a path; default to desktop so
  // the mobile sheet isn't mounted during the first (unresolved) render.
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  // Keep the draft in sync whenever the applied filters are reset/changed externally.
  React.useEffect(() => {
    setDraft(applied);
  }, [applied]);

  // Safety net mirroring QuickBottomSheet: Chakra v3 (zag-js) can leave
  // `pointer-events: none` + `data-inert` stuck on <body> after a modal closes.
  // When the filter sheet is closed and no other modal is open, restore
  // interactivity.
  React.useEffect(() => {
    if (sheetOpen) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [sheetOpen]);

  const patch = (p: Partial<Filters>) => setDraft((d) => ({ ...d, ...p }));

  const resetDisabled = !hasActiveFilters(applied) && !hasActiveFilters(draft);
  const resetAll = () => {
    setDraft(EMPTY_FILTERS);
    onReset();
  };

  /* ------- Shared field renderers (reused by desktop toolbar & mobile sheet) ------- */

  const agentField = (
    <SearchableSelect
      label="Assigned Agent"
      value={draft.agent}
      options={agentOptions}
      onChange={(v) => patch({ agent: v })}
      searchPlaceholder="Search agent or ID"
      mobileSubtitle="Filter documents by the assigned agent."
      mobileIcon={Users}
    />
  );

  const typeField = (
    <SearchableSelect
      label="Document Type"
      value={draft.type}
      options={typeOptions}
      onChange={(v) => patch({ type: v })}
      searchPlaceholder="Search document type"
      mobileSubtitle="Filter by accountable document type."
      mobileIcon={FileText}
    />
  );

  const statusField = (
    <SearchableSelect
      label="Status"
      value={draft.status}
      options={statusOptions}
      onChange={(v) => patch({ status: v })}
      searchPlaceholder="Search status"
      mobileSubtitle="Filter by document status."
      mobileIcon={CircleDot}
    />
  );

  const advancedGrid = (
    <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, minmax(0, 200px))" }} gap={3}>
      <FloatingLabelInput
        type="date"
        label="Expiry from"
        value={draft.expFrom}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ expFrom: e.target.value })}
      />
      <FloatingLabelInput
        type="date"
        label="Expiry to"
        value={draft.expTo}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ expTo: e.target.value })}
      />
      <FloatingLabelInput
        type="number"
        min="0"
        label="Remaining min"
        placeholder="0"
        value={draft.remMin}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ remMin: e.target.value })}
      />
      <FloatingLabelInput
        type="number"
        min="0"
        label="Remaining max"
        placeholder="Any"
        value={draft.remMax}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ remMax: e.target.value })}
      />
    </Grid>
  );

  /* ================================= Mobile ================================= */
  if (isMobile) {
    const sheetActive = hasSheetFilters(applied);

    return (
      <Box>
        {/* Compact bar: an always-live search box + a filter button that opens
            the bottom sheet. Search filters immediately (no Apply); the rest of
            the filters live in the sheet and commit on "Apply Filters". */}
        <Flex gap={2.5} align="center">
          <Box flex="1" pos="relative">
            <InputGroup startElement={<Search size={16} />}>
              <Input
                h="10"
                fontSize="sm"
                bg="bg"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                placeholder="Search documents"
                _placeholder={{ color: "fg.muted" }}
                _focusVisible={{
                  borderColor: "var(--chakra-colors-primary)",
                  boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
                }}
                value={applied.q}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onApply({ ...applied, q: e.target.value })
                }
              />
            </InputGroup>
          </Box>

          <Box pos="relative" flexShrink={0}>
            <IconButton
              aria-label="Filters"
              h="10"
              w="10"
              minW="10"
              variant={sheetActive ? "solid" : "outline"}
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal size={18} />
            </IconButton>
            {sheetActive && (
              <Box
                pos="absolute"
                top="-1"
                right="-1"
                w="10px"
                h="10px"
                borderRadius="full"
                bg="var(--chakra-colors-primary)"
                borderWidth="2px"
                borderColor="bg.panel"
                pointerEvents="none"
              />
            )}
          </Box>
        </Flex>

        <Drawer.Root
          open={sheetOpen}
          onOpenChange={(e) => setSheetOpen(e.open)}
          placement="bottom"
        >
          <Portal>
            <Drawer.Backdrop bg="blackAlpha.500" backdropFilter="blur(4px)" />
            <Drawer.Positioner>
              <Drawer.Content asChild bg="transparent" shadow="none">
                <MotionBox
                  initial={{ y: 500, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 500, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  style={{
                    position: "relative",
                    background: "var(--chakra-colors-bg-panel)",
                    borderTopLeftRadius: "18px",
                    borderTopRightRadius: "18px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "86vh",
                  }}
                >
                  {/* Grab handle */}
                  <Box pt={3} pb={1} display="flex" justifyContent="center">
                    <Box w="38px" h="4px" bg="border.emphasized" borderRadius="full" />
                  </Box>

                  <Flex align="center" justify="space-between" px={5} pt={2} pb={3}>
                    <Text fontSize="lg" fontWeight="700" color="fg">
                      Filters
                    </Text>
                    <IconButton
                      aria-label="Close filters"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSheetOpen(false)}
                    >
                      <X size={18} />
                    </IconButton>
                  </Flex>

                  <Drawer.Body px={5} pb={2} pt={1}>
                    <VStack gap={4} align="stretch">
                      {agentField}
                      {typeField}
                      {statusField}
                      {advancedGrid}
                    </VStack>
                  </Drawer.Body>

                  <HStack
                    gap={2.5}
                    px={5}
                    py={4}
                    borderTopWidth="1px"
                    borderColor="border.muted"
                  >
                    <Button
                      flex="1"
                      variant="outline"
                      disabled={resetDisabled}
                      onClick={() => {
                        resetAll();
                        setSheetOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      flex="1"
                      onClick={() => {
                        onApply(draft);
                        setSheetOpen(false);
                      }}
                    >
                      <Filter size={16} /> Apply Filters
                    </Button>
                  </HStack>
                </MotionBox>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </Box>
    );
  }

  /* ================================= Desktop =============================== */
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="xl"
      p={4}
      shadow="xs"
    >
      <Flex gap={3} flexWrap="wrap" align="flex-end">
        {/* Styled to match the SearchableSelect trigger: h=10, 1px border, md
            radius, and an always-floated label sitting on the border — so the
            search box lines up with the filter dropdowns beside it. */}
        <Box flex="2 1 260px" pos="relative">
          <InputGroup startElement={<Search size={16} />}>
            <Input
              h="10"
              fontSize="sm"
              bg="bg"
              borderWidth="1px"
              borderColor="border"
              borderRadius="md"
              placeholder="Document code, control no., or agent"
              _placeholder={{ color: "fg.muted" }}
              _focusVisible={{
                borderColor: "var(--chakra-colors-primary)",
                boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
              }}
              value={draft.q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ q: e.target.value })}
            />
          </InputGroup>

          <Text
            as="span"
            pos="absolute"
            top="-2"
            insetStart="2"
            px="1"
            bg="bg"
            fontSize="xs"
            lineHeight="1"
            color="fg.muted"
            pointerEvents="none"
          >
            Search
          </Text>
        </Box>

        <Box flex="1 1 200px">{agentField}</Box>
        <Box flex="1 1 190px">{typeField}</Box>
        <Box flex="1 1 180px">{statusField}</Box>

        <HStack gap={2} flexShrink={0}>
          <Button onClick={() => onApply(draft)}>
            <Filter size={16} /> Apply Filters
          </Button>
          <Button variant="outline" disabled={resetDisabled} onClick={resetAll}>
            Reset
          </Button>
        </HStack>
      </Flex>

      <Button
        variant="plain"
        size="sm"
        mt={3}
        px={0}
        color="blue.600"
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        Advanced filters — expiry &amp; quantity range
      </Button>

      {showMore && (
        <Box mt={3} pt={3} borderTopWidth="1px" borderColor="border.muted">
          {advancedGrid}
        </Box>
      )}

      {hasActiveFilters(applied) && (
        <Text mt={3} fontSize="xs" color="fg.muted">
          Filters applied. Showing matching documents only.
        </Text>
      )}
    </Box>
  );
}
