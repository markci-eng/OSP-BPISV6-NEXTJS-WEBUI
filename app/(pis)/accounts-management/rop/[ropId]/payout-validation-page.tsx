"use client";

import * as React from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Image,
  Input,
  NativeSelect,
  Portal,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CreditCard,
  ExternalLink,
  FileImage,
  FileText,
  History,
  IdCard,
  Minus,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { DataTable, InfoCardAccordion, OSPBadge, useMessageDialog } from "osp-ui-kit";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { toast } from "sonner";

import { isChequePayout } from "../data/data";
import type { PayoutAccountDetails, PayoutAttachment } from "../data/types";

interface ValidationItem {
  documentCode: string;
  description: string;
}

const PAYOUT_VALIDATION_ITEMS: ValidationItem[] = [
  {
    documentCode: "BNKBANKA36",
    description: "BANK ACCOUNT NUMBER NOT MATCHED",
  },
  { documentCode: "BNKGCASH26", description: "GCASH NUMBER NOT MATCHED" },
  {
    documentCode: "BNKINVALI33",
    description: "INVALID PAYOUT CHANNEL (BDO KABAYAN)",
  },
  {
    documentCode: "BNKNAMEA69",
    description: "NAME NOT MATCHED IN SUBMITTED ID AND BANK STATEMENT",
  },
];

const ID_SIGNATURE_VALIDATION_ITEMS: ValidationItem[] = [
  {
    documentCode: "BD-000004",
    description: "DATE OF BIRTH IN ID AND SYSTEM RECORD NOT MATCH",
  },
  {
    documentCode: "BNKPLEASE35",
    description:
      "PLEASE SEND VALID ID WITH FULL NAME, DATE OF BIRTH AND SIGNATURE",
  },
  { documentCode: "DVD-000001", description: "FORFEITED ACCOUNT" },
  {
    documentCode: "DVD-000002",
    description: "FORFEITED LOAN (PLEASE COORDINATE TO OPCO)",
  },
];

const REMARKS_OPTIONS = ["Valid", "Invalid"];

interface PayoutHistoryEntry {
  date: string;
  channel: string;
  amount: number;
  referenceNo: string;
  status: "RELEASED" | "FAILED" | "PENDING";
}

const PAYOUT_HISTORY_ITEMS: PayoutHistoryEntry[] = [
  {
    date: "2026-01-15",
    channel: "METROPOLITAN BANK AND TRUST CO",
    amount: 12500,
    referenceNo: "PYT-2026-00842",
    status: "RELEASED",
  },
  {
    date: "2025-07-15",
    channel: "GCASH",
    amount: 12500,
    referenceNo: "PYT-2025-00415",
    status: "RELEASED",
  },
  {
    date: "2025-01-15",
    channel: "METROPOLITAN BANK AND TRUST CO",
    amount: 12500,
    referenceNo: "PYT-2025-00102",
    status: "FAILED",
  },
];

function payoutStatusBadgeType(status: PayoutHistoryEntry["status"]) {
  switch (status) {
    case "RELEASED":
      return "success" as const;
    case "FAILED":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

function formatDate(value?: string) {
  if (!value || value === "1900-01-01") return "—";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// Dashed label/value row — mirrors edit-rop-payment-page's InfoRow.
function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <Flex align="center" py={1} fontSize="sm">
      <Text color="gray.500" whiteSpace="nowrap" fontSize="xs">
        {label}
      </Text>
      <Box
        flex="1"
        mx={2}
        borderBottom="1px dashed"
        borderColor="gray.300"
        transform="translateY(2px)"
      />
      <Text
        fontWeight="semibold"
        textAlign="right"
        whiteSpace="nowrap"
        fontSize="sm"
        color="gray.800"
      >
        {value ?? "—"}
      </Text>
    </Flex>
  );
}

// Bordered section card with an uppercase icon+title strip — mirrors
// edit-rop-payment-page's SectionCard so both steps read as one system.
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
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
        <Box color="green.700">{icon}</Box>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="green.700"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
      </Flex>
      <Box px={4} py={3}>
        {children}
      </Box>
    </Box>
  );
}

const isImage = (attachment: PayoutAttachment) =>
  attachment.mimeType.startsWith("image/");

/** Zoom range for the inline proof preview, in percent. */
const ZOOM_MIN = 50;
const ZOOM_MAX = 300;
const ZOOM_STEP = 25;

// Thumbnail for one submitted proof. Images open the zoom dialog; anything
// else (PDF today) opens in a new tab rather than rendering inline.
function ProofTile({
  attachment,
  onOpen,
  zoom = 100,
}: {
  attachment: PayoutAttachment;
  onOpen: (attachment: PayoutAttachment) => void;
  /** Preview scale in percent; the frame scrolls when it overflows. */
  zoom?: number;
}) {
  const image = isImage(attachment);

  return (
    <Box
      as="button"
      textAlign="start"
      w="full"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="lg"
      overflow="hidden"
      bg="bg"
      cursor="pointer"
      transition="border-color 0.15s, box-shadow 0.15s"
      _hover={{ borderColor: "var(--chakra-colors-primary)", boxShadow: "sm" }}
      onClick={() =>
        image
          ? onOpen(attachment)
          : window.open(attachment.url, "_blank", "noopener,noreferrer")
      }
    >
      {/* Fixed window onto the proof: the card keeps its size and the image
          scrolls inside, so the whole of a tall screenshot is reachable
          without opening the zoom dialog. */}
      <Flex
        h="260px"
        align="flex-start"
        justify="center"
        bg="gray.50"
        borderBottomWidth="1px"
        borderColor="border.muted"
        overflow="auto"
      >
        {image ? (
          <Image
            src={attachment.url}
            alt={attachment.label}
            w={`${zoom}%`}
            h="auto"
            maxW="none"
            flexShrink={0}
            objectFit="contain"
          />
        ) : (
          <Flex
            direction="column"
            align="center"
            gap={1}
            color="gray.400"
            m="auto"
          >
            <FileText size={28} />
            <Text fontSize="10px" fontWeight="700" letterSpacing="0.08em">
              PDF
            </Text>
          </Flex>
        )}
      </Flex>

      <Box px={3} py={2}>
        <Flex align="center" gap={1.5} minW={0}>
          <Text fontSize="xs" fontWeight="600" color="gray.700" lineClamp={1}>
            {attachment.label}
          </Text>
          {!image && (
            <Box color="gray.400" flexShrink={0}>
              <ExternalLink size={12} />
            </Box>
          )}
        </Flex>
        <Text fontSize="10px" color="gray.500" mt="2px" lineClamp={1}>
          {attachment.uploadedBy} · {formatDate(attachment.uploadedAt)}
        </Text>
      </Box>
    </Box>
  );
}

const validationColumns: ColumnDef<ValidationItem>[] = [
  {
    accessorKey: "documentCode",
    header: "Document Code",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700" fontFamily="mono">
        {String(info.getValue())}
      </Text>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => (
      <Text fontSize="sm" color="gray.700">
        {String(info.getValue())}
      </Text>
    ),
  },
];

export function PayoutValidationPage({
  account,
}: {
  account: PayoutAccountDetails;
}) {
  const { messageBox } = useMessageDialog();
  const [topRemark, setTopRemark] = React.useState("");
  const [bottomRemark, setBottomRemark] = React.useState("");
  const [zoom, setZoom] = React.useState(100);
  const [viewerZoom, setViewerZoom] = React.useState(100);
  const [activeProof, setActiveProof] = React.useState<PayoutAttachment | null>(
    null,
  );

  // Each proof opens at fit-width rather than inheriting the last zoom.
  React.useEffect(() => {
    if (activeProof) setViewerZoom(100);
  }, [activeProof]);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [payoutValidationOpen, setPayoutValidationOpen] = React.useState(false);
  const [idSignatureValidationOpen, setIdSignatureValidationOpen] =
    React.useState(false);

  const showProof =
    !isChequePayout(account.paymentChannel) && account.attachments.length > 0;

  const changeToCheque = async () => {
    const confirmed = await messageBox({
      title: "Change to Cheque",
      message: `Switch the payout channel for ${account.accountName} from ${account.paymentChannel} to Cheque?`,
      variant: "warning",
      confirmText: "Yes, Change",
      showCancel: true,
      cancelText: "No",
    });

    if (confirmed) {
      toast.success("Payout channel changed to Cheque.");
    }
  };

  return (
    <Flex direction="column" gap={5}>
      {/* Account on the left, the proof it should be checked against on the
          right. Cheque payouts have no proof, so the card keeps full width
          rather than leaving a hole beside it. */}
      <Grid
        templateColumns={{
          base: "minmax(0, 1fr)",
          lg: showProof ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
        }}
        gap={5}
      >
        <SectionCard icon={<CreditCard size={14} />} title="Payout Account">
          <InfoRow label="Payment Channel" value={account.paymentChannel} />
          <InfoRow label="Payout Account No." value={account.payoutAccountNo} />
          <InfoRow label="Payout Branch" value={account.payoutBranch} />
          <InfoRow label="Account Name" value={account.accountName} />
          <InfoRow
            label="PH Birthdate"
            value={formatDate(account.phBirthdate)}
          />

          <Box mt={3}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Remarks
            </Text>
            <NativeSelect.Root size="sm">
              <NativeSelect.Field
                value={topRemark}
                onChange={(e) => setTopRemark(e.currentTarget.value)}
              >
                <option value="">Select Remarks</option>
                {REMARKS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>

          <Flex gap={2} mt={4} flexWrap="wrap" justify="flex-end">
            <PrimaryMdButton onClick={changeToCheque}>
              Change to Cheque
            </PrimaryMdButton>
          </Flex>
        </SectionCard>

        {/* Proof belongs to the payout channel: a wallet screenshot for
            e-wallets, a statement for banks, nothing for cheque. */}
        {showProof && (
          <>
            {/* Desktop — the proof sits beside the account it verifies */}
            <Box display={{ base: "none", md: "block" }}>
              <SectionCard
                icon={<FileImage size={14} />}
                title="Submitted Proof of Account"
              >
                <Flex align="center" justify="space-between" gap={2} mb={3}>
                  <Text fontSize="xs" color="gray.500" minW={0} lineClamp={1}>
                    {account.paymentChannel} — uploaded for verification
                  </Text>

                  {/* Scale the proof inside its frame; the frame scrolls once
                      the image outgrows it. */}
                  <Flex align="center" gap={1} flexShrink={0}>
                    <IconButton
                      aria-label="Zoom out"
                      size="2xs"
                      variant="outline"
                      disabled={zoom <= ZOOM_MIN}
                      onClick={() =>
                        setZoom((prev) => Math.max(ZOOM_MIN, prev - ZOOM_STEP))
                      }
                    >
                      <Minus size={12} />
                    </IconButton>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      minW="34px"
                      textAlign="center"
                    >
                      {zoom}%
                    </Text>
                    <IconButton
                      aria-label="Zoom in"
                      size="2xs"
                      variant="outline"
                      disabled={zoom >= ZOOM_MAX}
                      onClick={() =>
                        setZoom((prev) => Math.min(ZOOM_MAX, prev + ZOOM_STEP))
                      }
                    >
                      <Plus size={12} />
                    </IconButton>
                  </Flex>
                </Flex>

                <SimpleGrid
                  columns={account.attachments.length > 1 ? 2 : 1}
                  gap={3}
                >
                  {account.attachments.map((attachment) => (
                    <ProofTile
                      key={attachment.id}
                      attachment={attachment}
                      onOpen={setActiveProof}
                      zoom={zoom}
                    />
                  ))}
                </SimpleGrid>
              </SectionCard>
            </Box>

            {/* Mobile — a card of thumbnails eats the screen, so the proof
                opens straight into the full-screen viewer instead */}
            <Box display={{ base: "block", md: "none" }}>
              <SecondaryMdButton
                w="full"
                onClick={() => setActiveProof(account.attachments[0])}
              >
                <FileImage size={16} />
                View Proof of Account
              </SecondaryMdButton>
            </Box>
          </>
        )}
      </Grid>

      {/* Zoomed proof — full screen on mobile, centred dialog on desktop */}
      <Dialog.Root
        open={activeProof !== null}
        onOpenChange={(e) => {
          if (!e.open) setActiveProof(null);
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
              borderRadius={{ base: 0, md: "xl" }}
              minH={{ base: "100dvh", md: "auto" }}
            >
              <Dialog.Header
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                gap={3}
              >
                <Box minW={0}>
                  <Dialog.Title fontSize="sm">
                    {activeProof?.label}
                  </Dialog.Title>
                  {activeProof && (
                    <Text fontSize="xs" color="gray.500" mt="2px">
                      Uploaded by {activeProof.uploadedBy} ·{" "}
                      {formatDate(activeProof.uploadedAt)}
                    </Text>
                  )}
                </Box>
                <Flex align="center" gap={1} flexShrink={0}>
                  {/* Same zoom the card offers, so the phone — where the card
                      is replaced by a button — can still inspect detail. */}
                  <IconButton
                    aria-label="Zoom out"
                    size="xs"
                    variant="outline"
                    disabled={viewerZoom <= ZOOM_MIN}
                    onClick={() =>
                      setViewerZoom((prev) =>
                        Math.max(ZOOM_MIN, prev - ZOOM_STEP),
                      )
                    }
                  >
                    <Minus size={14} />
                  </IconButton>
                  <Text
                    fontSize="10px"
                    color="gray.500"
                    minW="34px"
                    textAlign="center"
                  >
                    {viewerZoom}%
                  </Text>
                  <IconButton
                    aria-label="Zoom in"
                    size="xs"
                    variant="outline"
                    disabled={viewerZoom >= ZOOM_MAX}
                    onClick={() =>
                      setViewerZoom((prev) =>
                        Math.min(ZOOM_MAX, prev + ZOOM_STEP),
                      )
                    }
                  >
                    <Plus size={14} />
                  </IconButton>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" position="initial" ml={1} />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body pb={6} overflow="auto">
                {activeProof && (
                  <Image
                    src={activeProof.url}
                    alt={activeProof.label}
                    w={`${viewerZoom}%`}
                    maxW="none"
                    h="auto"
                    objectFit="contain"
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderRadius="lg"
                    bg="gray.50"
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <InfoCardAccordion
        icon={<History size={16} />}
        title="Payout History"
        subtitle="Past payout transactions for this account"
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen((prev) => !prev)}
      >
        {PAYOUT_HISTORY_ITEMS.length === 0 ? (
          <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
            No payout history available.
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Channel</Table.ColumnHeader>
                  <Table.ColumnHeader>Reference No.</Table.ColumnHeader>
                  <Table.ColumnHeader>Amount</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {PAYOUT_HISTORY_ITEMS.map((entry) => (
                  <Table.Row key={entry.referenceNo}>
                    <Table.Cell>{formatDate(entry.date)}</Table.Cell>
                    <Table.Cell>{entry.channel}</Table.Cell>
                    <Table.Cell fontFamily="mono">
                      {entry.referenceNo}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <OSPBadge type={payoutStatusBadgeType(entry.status)}>
                        {entry.status}
                      </OSPBadge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<ShieldAlert size={16} />}
        title="Payout Validation"
        subtitle="Flags blocking this payout from being released"
        isOpen={payoutValidationOpen}
        onToggle={() => setPayoutValidationOpen((prev) => !prev)}
      >
        <DataTable<ValidationItem>
          columns={validationColumns}
          data={PAYOUT_VALIDATION_ITEMS}
          getRowId={(row) => row.documentCode}
          size="sm"
          emptyState="No payout validation flags."
          features={{
            search: true,
            filtering: false,
            sorting: true,
            pagination: false,
            columnToggle: false,
            selection: true,
            detailSidebar: false,
          }}
        />
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<IdCard size={16} />}
        title="ID/Signature Validation"
        subtitle="Flags on submitted ID and signature verification"
        isOpen={idSignatureValidationOpen}
        onToggle={() => setIdSignatureValidationOpen((prev) => !prev)}
      >
        <DataTable<ValidationItem>
          columns={validationColumns}
          data={ID_SIGNATURE_VALIDATION_ITEMS}
          getRowId={(row) => row.documentCode}
          size="sm"
          emptyState="No ID/signature validation flags."
          features={{
            search: true,
            filtering: false,
            sorting: true,
            pagination: false,
            columnToggle: false,
            selection: true,
            detailSidebar: false,
          }}
        />
      </InfoCardAccordion>

      <SectionCard icon={<ShieldAlert size={14} />} title="Remarks">
        <Input
          size="sm"
          placeholder="Enter remarks..."
          value={bottomRemark}
          onChange={(e) => setBottomRemark(e.currentTarget.value)}
        />
      </SectionCard>
    </Flex>
  );
}

export default PayoutValidationPage;
