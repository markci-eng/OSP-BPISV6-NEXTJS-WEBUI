"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, UserRound, X } from "lucide-react";
import { DataTable, useMessageDialog } from "osp-ui-kit";
import { PrimarySmButton, SecondarySmButton } from "st-peter-ui";
import { toast } from "sonner";

import type { PhUpdateEntry } from "../data/types";

const phUpdateColumns: ColumnDef<PhUpdateEntry>[] = [
  {
    accessorKey: "idx",
    header: "Idx",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700" fontFamily="mono">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "lpaNo",
    header: "LPA No.",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700" fontFamily="mono">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "fieldName",
    header: "Field Name",
    cell: (info) => (
      <Text fontSize="sm" fontWeight="medium" color="gray.800">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "oldValue",
    header: "Old Value",
    cell: (info) => (
      <Text fontSize="sm" color="gray.500">
        {String(info.getValue()) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "newValue",
    header: "New Value",
    cell: (info) => (
      <Text fontSize="sm" fontWeight="semibold" color="gray.800">
        {String(info.getValue()) || "—"}
      </Text>
    ),
  },
];

export function PhUpdatePage({ entries }: { entries: PhUpdateEntry[] }) {
  const { messageBox } = useMessageDialog();

  const deny = async () => {
    const confirmed = await messageBox({
      title: "Deny PH Update",
      message: "Are you sure you want to deny these planholder updates?",
      variant: "warning",
      confirmText: "Yes, Deny",
      showCancel: true,
      cancelText: "No",
    });

    if (confirmed) {
      toast.success("PH update denied");
    }
  };

  const approve = async () => {
    const confirmed = await messageBox({
      title: "Approve PH Update",
      message: "Are you sure you want to approve these planholder updates?",
      variant: "confirmation",
      confirmText: "Yes, Approve",
      showCancel: true,
      cancelText: "No",
    });

    if (confirmed) {
      toast.success("PH update approved");
    }
  };

  return (
    <Box
      bg="bg"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="lg"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={2}
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderBottomColor="green.100"
        borderLeftWidth="3px"
        borderLeftColor="green.500"
        bg="green.50"
      >
        <Box color="green.700">
          <UserRound size={14} />
        </Box>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="green.700"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Planholder Field Updates
        </Text>
      </Flex>
      <Box px={4} py={3}>
        <DataTable<PhUpdateEntry>
          columns={phUpdateColumns}
          data={entries}
          getRowId={(row) => String(row.idx)}
          size="sm"
          emptyState="No planholder updates found."
          features={{
            search: true,
            filtering: false,
            sorting: true,
            pagination: true,
            columnToggle: false,
            selection: true,
            detailSidebar: false,
          }}
        />

        <Flex gap={2} justify="flex-end" mt={4}>
          <SecondarySmButton colorPalette="red" onClick={deny}>
            <X size={14} />
            Deny
          </SecondarySmButton>

          <PrimarySmButton onClick={approve}>
            <Check size={14} />
            Approve
          </PrimarySmButton>
        </Flex>
      </Box>
    </Box>
  );
}

export default PhUpdatePage;
