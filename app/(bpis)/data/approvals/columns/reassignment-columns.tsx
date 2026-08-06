"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Box, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { FileCheck2, FileText, Receipt, ReceiptText } from "lucide-react";

import type { ReassignmentRequest } from "../types";
import { ApprovalStatusBadge } from "@/components/feedback/ApprovalStatusBadge";
import { LuClipboard, LuCopy } from "react-icons/lu";
import { toast } from "sonner";
import { multiSelectFilter } from "osp-ui-kit";

const DOCUMENT_META: Record<string, { icon: LucideIcon; accent: string }> = {
  "Official Receipt": { icon: Receipt, accent: "blue" },
  "Collection Receipt": { icon: ReceiptText, accent: "purple" },
  "Sales Invoice": { icon: FileText, accent: "orange" },
  "Acknowledgement Receipt": { icon: FileCheck2, accent: "green" },
};

function DocumentTypeCell({ document }: { document: string }) {
  const { icon: Icon, accent } = DOCUMENT_META[document] ?? {
    icon: FileText,
    accent: "gray",
  };

  return (
    <HStack gap={2}>
      <Box
        p={1.5}
        borderRadius="md"
        bg={`${accent}.50`}
        color={`${accent}.600`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon size={14} />
      </Box>
      <Text fontWeight="600" color="gray.800">
        {document}
      </Text>
    </HStack>
  );
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
    return;
  }

  // Fallback for non-secure contexts (e.g. plain HTTP) where the
  // Clipboard API isn't exposed on navigator.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Failed to copy to clipboard");
  } finally {
    document.body.removeChild(textarea);
  }
}

function getSeriesQuantity(series: string): number | null {
  const match = series.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2]);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return end - start + 1;
}

function SeriesCell({ series }: { series: string }) {
  const quantity = getSeriesQuantity(series);

  return (
    <VStack align="start" gap={0}>
      <Text fontWeight={"500"}>{series}</Text>
      {quantity !== null && (
        <HStack color="fg.muted">
          <Text fontSize="xs" fontFamily="mono">
            Qty: {quantity} pcs
          </Text>
        </HStack>
      )}
    </VStack>
  );
}

function formatRequestDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const reassignmentColumns: ColumnDef<ReassignmentRequest>[] = [
  {
    accessorKey: "document",
    header: "Document",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 2,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => <DocumentTypeCell document={getValue<string>()} />,
  },
  {
    accessorKey: "series",
    header: "Series",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 3,
    },
  },
  {
    accessorKey: "from",
    header: "From",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ row, getValue }) => (
      <VStack align={"start"} gap={0}>
        <Text>{getValue<string>()}</Text>
        <HStack
          color="fg.muted"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(row.original.fromEmpCode);
          }}
        >
          <Text fontSize="xs" fontFamily={"mono"}>
            {row.original.fromEmpCode}
          </Text>
          <LuCopy size={"10px"} />
        </HStack>
      </VStack>
    ),
  },
  {
    accessorKey: "to",
    header: "To",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ row, getValue }) => (
      <VStack align={"start"} gap={0}>
        <Text>{getValue<string>()}</Text>
        <HStack
          color="fg.muted"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(row.original.toEmpCode);
          }}
        >
          <Text fontSize="xs" fontFamily={"mono"}>
            {row.original.toEmpCode}
          </Text>
          <LuCopy size={"10px"} />
        </HStack>
      </VStack>
    ),
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ getValue }) => (
      <Text>{formatRequestDate(getValue<string>())}</Text>
    ),
  },
  {
    accessorKey: "requester",
    header: "Requester",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    cell: ({ row, getValue }) => (
      <VStack align={"start"} gap={0}>
        <Text>{getValue<string>()}</Text>
        <HStack
          color="fg.muted"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(row.original.fromEmpCode);
          }}
        >
          <Text fontSize="xs" fontFamily={"mono"}>
            {row.original.fromEmpCode}
          </Text>
          <LuCopy size={"10px"} />
        </HStack>
      </VStack>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
    },
    cell: ({ getValue }) => <ApprovalStatusBadge status={getValue<string>()} />,
  },
];
