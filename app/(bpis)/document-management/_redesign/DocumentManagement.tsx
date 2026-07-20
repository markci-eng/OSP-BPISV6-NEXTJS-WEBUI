"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowRightLeft,
  Ban,
  Calendar,
  Clock,
  Download,
  Eye,
  Inbox,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import Page from "@/claude components/layout/page/Page";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { DataTableRowActions } from "@/components/common/reusable-tableV2/components/DataTableRowActions";
import type { RowAction } from "@/components/common/reusable-tableV2/types";

import {
  type DocumentRecord,
  expState,
  fmt,
  fmtDate,
  getAgent,
  isActiveStatus,
  seedDocuments,
  seriesLabel,
} from "./data";
import { TYPE_META } from "./meta";
import { type Filters, EMPTY_FILTERS, hasActiveFilters } from "./types";
import {
  AgentInline,
  ExpiryText,
  ProgressMeter,
  SeriesRange,
  StatusChip,
  TypeBadge,
} from "./components/atoms";
import FilterToolbar from "./components/FilterToolbar";
import AgentSummaryCard from "./components/AgentSummaryCard";
import DocumentDrawer from "./components/DocumentDrawer";
import AssignWizard from "./components/AssignWizard";
import ReassignModal, { type ReassignResult } from "./components/ReassignModal";
import BlockModal, { type BlockResult } from "./components/BlockModal";

const TODAY_ISO = "2026-07-15";

type ModalKind = "drawer" | "assign" | "reassign" | "block" | null;

function newControl(): string {
  return `CN-${Math.floor(100000 + Math.random() * 899999)}`;
}

const columns: ColumnDef<DocumentRecord>[] = [
  {
    accessorKey: "code",
    header: "Document Code",
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
      width: "150px",
      minWidth: "140px",
    },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="600" color="fg">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "control",
    header: "Control No.",
    meta: { responsivePriority: 6, width: "130px" },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" color="fg">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "type",
    header: "Document Type",
    meta: { responsivePriority: 3, width: "200px" },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" color="fg">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    id: "series",
    accessorKey: "s",
    header: "Series Range",
    enableSorting: true,
    meta: { responsivePriority: 5, width: "150px" },
    cell: ({ row }) => <SeriesRange doc={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { responsivePriority: 4, width: "150px" },
    cell: ({ getValue }) => <StatusChip status={getValue<string>()} />,
  },
  {
    id: "agent",
    accessorFn: (row) => getAgent(row.agentId).name,
    header: "Assigned To",
    meta: { responsivePriority: 7, width: "180px" },
    cell: ({ row }) => <AgentInline agent={getAgent(row.original.agentId)} />,
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
      numeric: true,
      width: "150px",
    },
    cell: ({ row }) => (
      <VStack align="stretch" gap={1.5} minW="120px">
        <HStack align="baseline" gap={1}>
          <Text fontSize="sm" fontWeight="700" fontFamily="mono" color="fg">
            {fmt(row.original.remaining)}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            / {fmt(row.original.assignedQty)}
          </Text>
        </HStack>
        <ProgressMeter
          remaining={row.original.remaining}
          total={row.original.assignedQty}
          active={isActiveStatus(row.original.status)}
        />
      </VStack>
    ),
  },
  {
    accessorKey: "expiry",
    header: "Expiry",
    meta: { responsivePriority: 8, width: "140px" },
    cell: ({ getValue }) => <ExpiryText date={getValue<string>()} />,
  },
];

export default function DocumentManagement() {
  const [documents, setDocuments] = React.useState<DocumentRecord[]>(() =>
    seedDocuments(),
  );
  const [applied, setApplied] = React.useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = React.useState<DocumentRecord | null>(null);
  const [modal, setModal] = React.useState<ModalKind>(null);

  const filtered = React.useMemo(() => {
    return documents.filter((d) => {
      const ql = applied.q.trim().toLowerCase();
      if (ql) {
        const hay =
          `${d.code} ${d.control} ${getAgent(d.agentId).name}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      if (applied.type && d.type !== applied.type) return false;
      if (applied.status && d.status !== applied.status) return false;
      if (applied.agent && d.agentId !== applied.agent) return false;
      if (applied.expFrom && d.expiry < applied.expFrom) return false;
      if (applied.expTo && d.expiry > applied.expTo) return false;
      if (applied.remMin !== "" && d.remaining < Number(applied.remMin))
        return false;
      if (applied.remMax !== "" && d.remaining > Number(applied.remMax))
        return false;
      return true;
    });
  }, [documents, applied]);

  const closeModal = React.useCallback(() => setModal(null), []);
  const openDrawer = React.useCallback((d: DocumentRecord) => {
    setSelected(d);
    setModal("drawer");
  }, []);
  const openReassign = React.useCallback((d: DocumentRecord) => {
    setSelected(d);
    setModal("reassign");
  }, []);
  const openBlock = React.useCallback((d: DocumentRecord) => {
    setSelected(d);
    setModal("block");
  }, []);
  const openAssign = React.useCallback(() => {
    setSelected(null);
    setModal("assign");
  }, []);

  const refresh = () => toast.success("Documents refreshed");
  const exportCsv = () =>
    toast.success(`Exporting ${filtered.length} documents to CSV…`);

  const handleAssign = (doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev]);
    toast.success(
      `Assigned ${fmt(doc.assignedQty)} ${doc.unit.toLowerCase()} to ${getAgent(doc.agentId).name}`,
    );
    closeModal();
  };

  const handleReassign = (result: ReassignResult) => {
    if (!selected) return;
    const target = selected;
    const ag = getAgent(result.newAgentId);
    const fromName = getAgent(target.agentId).name;

    setDocuments((prev) => {
      const docs = prev.slice();
      const i = docs.findIndex((x) => x.id === target.id);
      if (i < 0) return prev;
      const cur = { ...docs[i] };

      if (result.method === "entire") {
        cur.agentId = result.newAgentId;
        cur.timeline = [
          {
            type: "reassign",
            date: TODAY_ISO,
            by: "You (Admin)",
            text: `Fully reassigned to ${ag.name}`,
          },
          ...cur.timeline,
        ];
        docs[i] = cur;
      } else {
        const moved = result.moved;
        cur.remaining = Math.max(0, cur.remaining - moved);
        cur.status = cur.remaining > 0 ? "Partially Assigned" : "Fully Used";
        cur.timeline = [
          {
            type: "reassign",
            date: TODAY_ISO,
            by: "You (Admin)",
            text: `Partial reassignment · ${moved.toLocaleString()} pcs (${result.s}–${result.e}) moved to ${ag.name}`,
          },
          ...cur.timeline,
        ];
        docs[i] = cur;

        const seq = String(docs.length + 21).padStart(4, "0");
        docs.unshift({
          id: "d" + Date.now(),
          code: `${TYPE_META[cur.type].code}-2026-${seq}`,
          control: newControl(),
          type: cur.type,
          s: result.s,
          e: result.e,
          origS: result.s,
          origE: result.e,
          unit: cur.unit,
          assignedQty: moved,
          remaining: moved,
          status: "Assigned",
          agentId: result.newAgentId,
          assignedDate: TODAY_ISO,
          by: "You (Admin)",
          expiry: cur.expiry,
          bookletSize: cur.bookletSize,
          timeline: [
            {
              type: "assigned",
              date: TODAY_ISO,
              by: "You (Admin)",
              text: `Received ${moved.toLocaleString()} pcs (${result.s}–${result.e}) via reassignment from ${fromName}`,
            },
          ],
        });
      }
      return docs;
    });

    toast.success(`Reassignment confirmed → ${ag.name}`);
    closeModal();
  };

  const handleBlock = (result: BlockResult) => {
    if (!selected) return;
    const target = selected;

    setDocuments((prev) => {
      const docs = prev.slice();
      const i = docs.findIndex((x) => x.id === target.id);
      if (i < 0) return prev;
      const cur = { ...docs[i] };

      let blocked: number;
      if (result.method === "entire") {
        blocked = cur.remaining;
        cur.remaining = 0;
        cur.status = "Blocked";
      } else {
        blocked = result.blocked;
        cur.remaining = Math.max(0, cur.remaining - blocked);
        cur.status = cur.remaining > 0 ? "Partially Assigned" : "Blocked";
      }
      cur.timeline = [
        {
          type: "block",
          date: TODAY_ISO,
          by: "You (Admin)",
          text: `Blocked ${blocked.toLocaleString()} pcs — ${result.reason}${
            result.remarks ? ` (${result.remarks})` : ""
          }`,
        },
        ...cur.timeline,
      ];
      docs[i] = cur;
      return docs;
    });

    toast.warning(`Blocked series portion — ${result.reason}`);
    closeModal();
  };

  const rowActions = React.useMemo<RowAction<DocumentRecord>[]>(
    () => [
      { id: "view", label: "View Details", icon: Eye, onClick: openDrawer },
      {
        id: "reassign",
        label: "Reassign",
        icon: ArrowRightLeft,
        disabled: (d) => !(isActiveStatus(d.status) && d.remaining > 0),
        onClick: openReassign,
      },
      {
        id: "block",
        label: "Block",
        icon: Ban,
        variant: "destructive",
        disabled: (d) => !(isActiveStatus(d.status) && d.remaining > 0),
        onClick: openBlock,
      },
      {
        id: "history",
        label: "View History",
        icon: Clock,
        separator: true,
        onClick: openDrawer,
      },
    ],
    [openDrawer, openReassign, openBlock],
  );

  const selectedAgent = applied.agent ? getAgent(applied.agent) : null;

  const emptyState = (
    <VStack gap={2} py={12} px={6} textAlign="center">
      <Box
        w="64px"
        h="64px"
        borderRadius="2xl"
        bg="bg.muted"
        color="fg.muted"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        {hasActiveFilters(applied) ? <Search size={30} /> : <Inbox size={30} />}
      </Box>
      <Text fontSize="md" fontWeight="700" color="fg">
        {hasActiveFilters(applied)
          ? "No matching documents found"
          : "No documents have been assigned yet"}
      </Text>
      <Text fontSize="sm" color="fg.muted" maxW="340px">
        {hasActiveFilters(applied)
          ? "Try adjusting or clearing your filters to see more results."
          : "Assign accountable documents to agents to start tracking series and remaining quantities."}
      </Text>
      <Box mt={3}>
        {hasActiveFilters(applied) ? (
          <Button variant="outline" onClick={() => setApplied(EMPTY_FILTERS)}>
            <RefreshCw size={16} /> Reset Filters
          </Button>
        ) : (
          <Button onClick={openAssign}>
            <Plus size={16} /> Assign Documents
          </Button>
        )}
      </Box>
    </VStack>
  );

  return (
    <Page.Root
      title="Document Management"
      description="Assign, reassign, and block accountable documents across agents. Track series ranges, remaining quantities, and expiry at a glance."
      headerButton="menu"
    >
      <Page.ToolContent>
        <HStack gap={2}>
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              Export
            </Text>
          </Button>
          <Button onClick={openAssign}>
            <Plus size={16} />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              Assign Documents
            </Text>
          </Button>
        </HStack>
      </Page.ToolContent>

      <Page.MainContent>
        {selectedAgent && (
          <AgentSummaryCard
            agent={selectedAgent}
            documents={documents}
            onClear={() => setApplied((f) => ({ ...f, agent: "" }))}
          />
        )}

        <FilterToolbar
          applied={applied}
          onApply={setApplied}
          onReset={() => setApplied(EMPTY_FILTERS)}
        />

        <DataTable<DocumentRecord>
          columns={columns}
          data={filtered}
          title="Assigned Documents"
          description={`${filtered.length} document${filtered.length === 1 ? "" : "s"}`}
          getRowId={(row) => row.id}
          size="md"
          rowActions={rowActions}
          onRowClick={openDrawer}
          emptyState={emptyState}
          features={{
            search: false,
            filtering: false,
            sorting: true,
            pagination: true,
            columnToggle: true,
            selection: false,
            draggable: false,
            detailSidebar: false,
          }}
          mobileConfig={{
            viewMode: "card",
            renderMobileCard: (row) => (
              <MobileDocCard
                doc={row}
                rowActions={rowActions}
                onOpen={openDrawer}
              />
            ),
          }}
        />

        {/* Overlays — portaled, so their position in the tree does not affect layout */}
        <DocumentDrawer
          doc={modal === "drawer" ? selected : null}
          onClose={closeModal}
          onReassign={openReassign}
          onBlock={openBlock}
        />

        <AssignWizard
          open={modal === "assign"}
          onClose={closeModal}
          existingCount={documents.length}
          onConfirm={handleAssign}
        />

        <ReassignModal
          open={modal === "reassign"}
          onClose={closeModal}
          doc={selected}
          onConfirm={handleReassign}
        />

        <BlockModal
          open={modal === "block"}
          onClose={closeModal}
          doc={selected}
          onConfirm={handleBlock}
        />
      </Page.MainContent>
    </Page.Root>
  );
}

/* --------------------------- Mobile card ---------------------------------- */

function MobileDocCard({
  doc,
  rowActions,
  onOpen,
}: {
  doc: DocumentRecord;
  rowActions: RowAction<DocumentRecord>[];
  onOpen: (d: DocumentRecord) => void;
}) {
  const agent = getAgent(doc.agentId);
  const active = isActiveStatus(doc.status);
  const es = expState(doc.expiry);

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="xl"
      p={4}
      shadow="xs"
      onClick={() => onOpen(doc)}
      cursor="pointer"
    >
      <HStack justify="space-between" align="flex-start" gap={2.5}>
        <VStack align="start" gap={1.5}>
          <Text fontFamily="mono" fontSize="sm" fontWeight="600" color="fg">
            {doc.code}
          </Text>
          <TypeBadge type={doc.type} />
        </VStack>
        <Box onClick={(e) => e.stopPropagation()}>
          <DataTableRowActions row={doc} actions={rowActions} />
        </Box>
      </HStack>

      <HStack
        justify="space-between"
        align="center"
        my={3}
        py={3}
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <VStack align="start" gap={1}>
          <Text
            fontSize="10px"
            color="fg.muted"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.03em"
          >
            Series
          </Text>
          <Text fontFamily="mono" fontSize="xs" color="fg">
            {seriesLabel(doc)}
          </Text>
        </VStack>
        <StatusChip status={doc.status} />
      </HStack>

      <HStack gap={2.5} mb={2.5} align="center">
        <AgentInline agent={agent} size={32} />
        <Box textAlign="right" ml="auto">
          <Text fontSize="sm" fontWeight="700" fontFamily="mono" color="fg">
            {fmt(doc.remaining)}
          </Text>
          <Text as="span" fontSize="xs" color="fg.muted">
            / {fmt(doc.assignedQty)}
          </Text>
        </Box>
      </HStack>

      <ProgressMeter
        remaining={doc.remaining}
        total={doc.assignedQty}
        active={active}
      />

      <HStack gap={1.5} mt={3} fontSize="xs">
        <Box
          as="span"
          color={
            es === "ok" ? "fg.muted" : es === "near" ? "orange.400" : "red.500"
          }
          display="inline-flex"
        >
          <Calendar size={14} />
        </Box>
        <Text
          color={
            es === "expired"
              ? "red.600"
              : es === "near"
                ? "orange.600"
                : "fg.muted"
          }
          fontWeight={es === "ok" ? "medium" : "600"}
        >
          {es === "expired" ? "Expired " : "Expires "}
          {fmtDate(doc.expiry)}
        </Text>
      </HStack>
    </Box>
  );
}
