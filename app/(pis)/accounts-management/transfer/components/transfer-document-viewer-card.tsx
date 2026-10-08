"use client";

// Document Viewer — the papers filed with the transfer (the Transfer Form, the
// Waiver of Rights), in the column at the right of the panel.
//
// ONE DOCUMENT AT A TIME, PICKED FROM THE STRIP, PAGED BELOW IT. A form is
// read page by page against the party cards beside it, so the page is shown
// at the column's full width and scrolls down; the zoom control takes it past
// that when a hand-filled entry needs a closer look.
//
// The file's own Verified / For Review state sits in the toolbar and is
// changed from there — the page holds it, like the Valid ID cards'.

import { useEffect, useState, type ReactNode } from "react";
import { Box, Flex, IconButton, Image, NativeSelect, Text } from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileX,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { formatFiledDate } from "@/app/(pis)/data";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { TransferDocument } from "../data/types";
import { ZoomControl } from "./zoom-control";

export interface TransferDocumentViewerCardProps {
  documents: TransferDocument[];
  /** Whether each document is verified, by document id. */
  isVerified: (document: TransferDocument) => boolean;
  onVerifiedChange: (document: TransferDocument, verified: boolean) => void;
  lpaNo: string;
}

export function TransferDocumentViewerCard({
  documents,
  isVerified,
  onVerifiedChange,
  lpaNo,
}: TransferDocumentViewerCardProps) {
  const [documentId, setDocumentId] = useState(documents[0]?.id);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Back to the first document, its first page, fitted, whenever the set
  // changes — the card stays mounted as the user moves down the list.
  useEffect(() => {
    setDocumentId(documents[0]?.id);
    setPage(0);
    setZoom(1);
  }, [documents]);

  // Falls back to the first for the one render before the effect above runs.
  const current =
    documents.find((document) => document.id === documentId) ?? documents[0];
  const pageCount = current?.pages.length ?? 0;
  const pageIndex = Math.min(page, Math.max(pageCount - 1, 0));
  const verified = current ? isVerified(current) : false;

  return (
    <SectionCard
      icon={<FileText size={14} />}
      title="Document Viewer"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      action={
        documents.length > 0 && (
          <NativeSelect.Root size="xs" w="160px">
            <NativeSelect.Field
              aria-label="Document"
              value={current?.id ?? ""}
              onChange={(e) => {
                setDocumentId(e.target.value);
                setPage(0);
              }}
              bg="bg"
            >
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )
      }
    >
      {!current ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={2}
          minH="480px"
          px={6}
          textAlign="center"
          bg="gray.50"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Box color="gray.400">
            <FileX size={28} />
          </Box>
          <Text fontSize="sm" fontWeight="600" color="gray.600">
            No documents submitted
          </Text>
          <Text fontSize="xs" color="gray.500">
            The transfer form has not been uploaded yet.
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap={3}>
          <Flex align="center" justify="space-between" gap={2} wrap="wrap">
            <Flex
              role="group"
              aria-label="Pages"
              align="center"
              gap={0.5}
              p="1px"
              borderWidth="1px"
              borderColor="border.muted"
              borderRadius="md"
            >
              <PageButton
                label="Previous page"
                disabled={pageIndex === 0}
                onClick={() => setPage(pageIndex - 1)}
              >
                <ChevronLeft size={14} />
              </PageButton>
              <Text
                fontSize="xs"
                fontWeight="600"
                color="gray.700"
                px={1.5}
                whiteSpace="nowrap"
                fontVariantNumeric="tabular-nums"
              >
                Page {pageIndex + 1} / {pageCount}
              </Text>
              <PageButton
                label="Next page"
                disabled={pageIndex >= pageCount - 1}
                onClick={() => setPage(pageIndex + 1)}
              >
                <ChevronRight size={14} />
              </PageButton>
            </Flex>

            <Flex align="center" gap={2}>
              {/* The file's state, as a toggle: it reads as a badge and
                  changes on a click, like the Valid ID cards' Verify. */}
              <Box
                as="button"
                onClick={() => onVerifiedChange(current, !verified)}
                title={verified ? "Mark for review" : "Mark as verified"}
                display="inline-flex"
                alignItems="center"
                gap={1}
                px={2}
                py={0.5}
                borderRadius="full"
                borderWidth="1px"
                fontSize="2xs"
                fontWeight="600"
                cursor="pointer"
                bg={verified ? "green.50" : "orange.50"}
                borderColor={verified ? "green.200" : "orange.200"}
                color={verified ? "green.700" : "orange.700"}
                _hover={{ borderColor: verified ? "green.400" : "orange.400" }}
              >
                {verified ? <ShieldCheck size={12} /> : <TriangleAlert size={12} />}
                {verified ? "Verified File" : "For Review"}
              </Box>
              <ZoomControl zoom={zoom} onZoomChange={setZoom} label="document" />
            </Flex>
          </Flex>

          {/* THE PAGE. A window sized to the screen that scrolls, so a tall
              form never stretches the card and the card, pinned beside the
              party cards, stays in view whole; the page fills its width at
              100% and grows past it when zoomed, auto margins keeping it
              centred. */}
          <Box
            // Keyed by page, so a new page opens scrolled to the top.
            key={`${current.id}-${pageIndex}`}
            h="calc(100vh - 260px)"
            minH="480px"
            overflow="auto"
            display="flex"
            bg="gray.100"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
          >
            <Image
              src={current.pages[pageIndex]}
              alt={`${current.label}, page ${pageIndex + 1}`}
              w={`${zoom * 100}%`}
              maxW="none"
              h="auto"
              flexShrink={0}
              m="auto"
              mt={0}
              boxShadow="0 2px 12px rgba(0, 0, 0, 0.12)"
            />
          </Box>

          <Flex justify="space-between" gap={2} wrap="wrap">
            <Text fontSize="xs" color="gray.500">
              Ref:{" "}
              <Text
                as="span"
                fontFamily="mono"
                fontWeight="700"
                color={BRAND_COLORS.darkGreen}
              >
                {lpaNo}
              </Text>
            </Text>
            <Text fontSize="xs" color="gray.500">
              Uploaded by{" "}
              <Text as="span" fontWeight="600" color="gray.700">
                {current.uploadedBy} branch
              </Text>{" "}
              · {formatFiledDate(current.dateUploaded)}
            </Text>
          </Flex>
        </Flex>
      )}
    </SectionCard>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      size="2xs"
      variant="ghost"
      color="gray.500"
      disabled={disabled}
      onClick={onClick}
      _hover={{ color: BRAND_COLORS.primaryGreen, bg: "green.50" }}
    >
      {children}
    </IconButton>
  );
}

export default TransferDocumentViewerCard;
