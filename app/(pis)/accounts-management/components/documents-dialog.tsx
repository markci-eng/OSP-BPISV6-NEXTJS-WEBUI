"use client";

import * as React from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "osp-ui-kit";
import { DeleteSmButton, PrimarySmButton } from "st-peter-ui";
import { toast } from "sonner";

import { DOCUMENT_REQUIREMENTS, type DocumentRef } from "../document-requirements";

const documentColumns: ColumnDef<DocumentRef>[] = [
  {
    accessorKey: "refCode",
    header: "RefCode",
    enableSorting: true,
    meta: { responsivePriority: 1, alwaysVisible: true, width: "140px" },
    cell: ({ getValue }) => (
      <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
        {getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: "refDesc",
    header: "RefDesc",
    enableSorting: true,
    meta: { responsivePriority: 2, alwaysVisible: true },
    cell: ({ getValue }) => (
      <Text fontSize="sm" color="gray.700">
        {getValue<string>()}
      </Text>
    ),
  },
];

const TABLE_FEATURES = {
  search: true,
  filtering: false,
  sorting: true,
  pagination: true,
  columnToggle: false,
  selection: true,
  detailSidebar: false,
};

/**
 * Documents for a request: the reference list of requirements on top, what the
 * branch has already submitted below. Tick rows in the top table and "Add to
 * list" moves them down; tick rows below and "Delete" takes them off.
 *
 * Mirrors the current RITF system's Documents window, rebuilt on the kit's
 * DataTable so search, paging and row selection come from one component.
 * Controlled — the calling module owns `documents` and persists `onChange`.
 */
export function DocumentsDialog({
  open,
  onClose,
  documents,
  onChange,
  requirements = DOCUMENT_REQUIREMENTS,
}: {
  open: boolean;
  onClose: () => void;
  documents: DocumentRef[];
  onChange: (next: DocumentRef[]) => void;
  /** Reference list to pick from; defaults to the shared requirements. */
  requirements?: DocumentRef[];
}) {
  const [pickedRequirements, setPickedRequirements] = React.useState<
    DocumentRef[]
  >([]);
  const [pickedSubmitted, setPickedSubmitted] = React.useState<DocumentRef[]>(
    [],
  );

  // Anything already submitted drops out of the requirements list, so the same
  // document can't be added twice.
  const available = React.useMemo(
    () =>
      requirements.filter(
        (req) => !documents.some((doc) => doc.refCode === req.refCode),
      ),
    [requirements, documents],
  );

  const addToList = () => {
    if (pickedRequirements.length === 0) return;
    onChange([...documents, ...pickedRequirements]);
    toast.success(
      `${pickedRequirements.length} document${
        pickedRequirements.length === 1 ? "" : "s"
      } added.`,
    );
    setPickedRequirements([]);
  };

  const deleteSelected = () => {
    if (pickedSubmitted.length === 0) return;
    const removed = new Set(pickedSubmitted.map((doc) => doc.refCode));
    onChange(documents.filter((doc) => !removed.has(doc.refCode)));
    toast.success(
      `${pickedSubmitted.length} document${
        pickedSubmitted.length === 1 ? "" : "s"
      } removed.`,
    );
    setPickedSubmitted([]);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size={{ base: "full", md: "xl" }}
      placement="center"
      scrollBehavior="inside"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: 0, md: undefined }}>
          <Dialog.Content
            maxW={{ base: "100dvw", md: "820px" }}
            borderRadius={{ base: 0, md: "xl" }}
            minH={{ base: "100dvh", md: "auto" }}
          >
            <Dialog.Header borderBottomWidth="1px" py={3}>
              <Flex w="full" align="center" justify="space-between" gap={3}>
                <Dialog.Title fontSize="sm">Documents</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" position="initial" />
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>

            <Dialog.Body py={4}>
              <Flex direction="column" gap={6}>
                {/* ── Reference list ── */}
                <Flex direction="column" gap={3}>
                  <Box
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="bg"
                  >
                    <DataTable<DocumentRef>
                      title="List of Requirements"
                      columns={documentColumns}
                      data={available}
                      getRowId={(row) => row.refCode}
                      size="sm"
                      defaultPageSize={5}
                      emptyState="Every requirement has been submitted."
                      features={TABLE_FEATURES}
                      mobileConfig={{
                        viewMode: "accordion",
                        primaryField: "refCode",
                        secondaryField: "refDesc",
                      }}
                      onSelectionChange={setPickedRequirements}
                    />
                  </Box>
                  <Flex justify="flex-end">
                    <PrimarySmButton
                      disabled={pickedRequirements.length === 0}
                      onClick={addToList}
                    >
                      Add to list
                    </PrimarySmButton>
                  </Flex>
                </Flex>

                {/* ── Submitted ── */}
                <Flex direction="column" gap={3}>
                  <Box
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="bg"
                  >
                    <DataTable<DocumentRef>
                      title="Documents Submitted"
                      columns={documentColumns}
                      data={documents}
                      getRowId={(row) => row.refCode}
                      size="sm"
                      defaultPageSize={5}
                      emptyState="No documents submitted yet."
                      features={TABLE_FEATURES}
                      mobileConfig={{
                        viewMode: "accordion",
                        primaryField: "refCode",
                        secondaryField: "refDesc",
                      }}
                      onSelectionChange={setPickedSubmitted}
                    />
                  </Box>
                  <Flex justify="flex-end">
                    <DeleteSmButton
                      disabled={pickedSubmitted.length === 0}
                      onClick={deleteSelected}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default DocumentsDialog;
