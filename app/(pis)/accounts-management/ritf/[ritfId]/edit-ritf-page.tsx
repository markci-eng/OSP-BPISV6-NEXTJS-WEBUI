"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  CloseButton,
  Drawer,
  Field,
  Flex,
  Grid,
  Input,
  NativeSelect,
  Portal,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Ellipsis,
  FileText,
  Files,
  Hash,
  ListChecks,
  Pencil,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, OSPBadge, Page } from "osp-ui-kit";
import { PrimaryMdButton, SecondarySmButton } from "st-peter-ui";

import { updateRitfRequest } from "../data/data";
import { DocumentsDialog } from "../../components/documents-dialog";
import type { DocumentRef } from "../../document-requirements";
import type {
  RitfPhUpdateEntry,
  RitfProcessingStatus,
  RitfRequest,
} from "../data/types";

const SUB_TYPE_OPTIONS = [
  "RI-NEW SAME LPA",
  "RI-NEW DIFF LPA",
  "TRANSFER SAME LPA",
  "TRANSFER DIFF LPA",
];

const PROCESSING_STATUS_OPTIONS = [
  "FOR PROCESS",
  "PROCESSED",
  "COMPLETED",
  "CANCELLED",
] as const;

const PROCESSING_STATUS_BADGE: Record<
  RitfProcessingStatus,
  "warning" | "info" | "success" | "danger"
> = {
  "FOR PROCESS": "warning",
  PROCESSED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const PLAN_CODE_OPTIONS = ["G5M6", "G1A6", "LG5A10", "LG5M10", "A1A10", "G5Q6"];

// Only these fields are actually editable — everything else on the request
// is informational and rendered read-only via InfoRow.
const EditRitfSchema = z.object({
  subType: z.string().min(1, "Required"),
  processingStatus: z.enum(PROCESSING_STATUS_OPTIONS),
  newPlanCode: z.string().min(1, "Required"),
  tfLastName: z.string(),
  tfFirstName: z.string(),
  dateReceivedByOP: z.string(),
  dateReceivedFrOP: z.string(),
  dateInformed: z.string(),
  dateComplied: z.string(),
});

type EditRitfFormFields = z.infer<typeof EditRitfSchema>;

function formatDate(value?: string) {
  if (!value || value === "1900-01-01") return "—";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// Dashed label/value row for read-only, info-only fields — matches the
// pattern used on the ROP edit page.
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

// Planholder identity block — avatar, name, LPA/branch identifiers and status.
// Shared by the page's identity header and the mobile quick-actions drawer;
// `trailing` is where the header slots its mobile "More" trigger.
function PlanholderNameCard({
  request,
  status,
  trailing,
}: {
  request: RitfRequest;
  status: RitfProcessingStatus;
  trailing?: React.ReactNode;
}) {
  return (
    <Flex align="center" gap={4} minW={0} flex="1" w="full">
      <Box
        p="3px"
        borderRadius="full"
        border="2px solid"
        borderColor="var(--chakra-colors-primary-disabled)"
        flexShrink={0}
      >
        <Avatar.Root size="lg" bg="var(--chakra-colors-primary-disabled)/30">
          <Avatar.Fallback
            color="var(--chakra-colors-primary)"
            fontWeight="semibold"
            name={request.planholderName}
          />
        </Avatar.Root>
      </Box>
      <Box minW={0} flex="1">
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontWeight="bold" fontSize="lg" lineHeight="1.2" truncate minW={0}>
            {request.planholderName}
          </Text>
          {trailing}
        </Flex>
        <Flex align="center" gap={2} mt={1.5} flexWrap="wrap">
          <Flex align="center" gap={1} fontSize="xs" color="gray.500">
            <Hash size={12} />
            <Text>{request.lpaNo}</Text>
          </Flex>
          <Text fontSize="xs" color="gray.300">
            ·
          </Text>
          <Text fontSize="xs" color="gray.500">
            {request.reqBranch}
          </Text>
        </Flex>
        <Box mt={1.5}>
          <OSPBadge type={PROCESSING_STATUS_BADGE[status]}>{status}</OSPBadge>
        </Box>
      </Box>
    </Flex>
  );
}

// Mini quick-action button — icon-over-label card, matching the ROP edit page.
function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      boxShadow="xs"
      cursor="pointer"
      transition="box-shadow 150ms ease-out, border-color 150ms ease-out, transform 150ms ease-out"
      py={3}
      px={4}
      _hover={{
        borderColor: "var(--chakra-colors-primary)",
        boxShadow: "sm",
        transform: "translateY(-2px)",
      }}
    >
      <Flex direction="column" align="center" gap={1.5}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize="36px"
          borderRadius="full"
          color="var(--chakra-colors-primary)"
        >
          <Icon size={18} />
        </Box>
        <Text fontSize="xs" fontWeight="700" color="gray.500">
          {label}
        </Text>
      </Flex>
    </Box>
  );
}

// Bordered section card with an icon+title strip.
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

const phUpdateColumns: ColumnDef<RitfPhUpdateEntry>[] = [
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
  {
    accessorKey: "authorizedDate",
    header: "Authorized Date",
    cell: (info) => (
      <Text fontSize="sm" color="gray.600">
        {formatDate(String(info.getValue()))}
      </Text>
    ),
  },
];

export function EditRitfPage({ request }: { request: RitfRequest }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditRitfFormFields>({
    resolver: zodResolver(EditRitfSchema),
    defaultValues: {
      subType: request.subType,
      processingStatus: request.processingStatus,
      newPlanCode: request.newPlanCode,
      tfLastName: request.tfLastName,
      tfFirstName: request.tfFirstName,
      dateReceivedByOP: request.dateReceivedByOP,
      dateReceivedFrOP: request.dateReceivedFrOP,
      dateInformed: request.dateInformed,
      dateComplied: request.dateComplied,
    },
  });

  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false);
  const [documentsOpen, setDocumentsOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<DocumentRef[]>(
    request.documents,
  );

  const saveDocuments = (next: DocumentRef[]) => {
    setDocuments(next);
    updateRitfRequest(request.id, { documents: next });
  };

  const goBack = () => router.push("/accounts-management/ritf");

  const submit = handleSubmit((values) => {
    updateRitfRequest(request.id, values);
    toast.success("RITF request updated");
    goBack();
  });

  const liveProcessingStatus = watch("processingStatus");

  // Identity header — planholder + LPA/branch identifiers + live status,
  // mirroring the ROP edit page.
  const identityHeader = (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg="bg"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="2xl"
      shadow="xs"
      p={{ base: 4, md: 6 }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={4}
      >
        <PlanholderNameCard request={request} status={liveProcessingStatus} />

        {/* Desktop — quick actions inline, right-aligned with the name row */}
        <Flex gap={2} flexShrink={0} display={{ base: "none", md: "flex" }}>
          <QuickActionButton
            icon={Files}
            label="Documents"
            onClick={() => setDocumentsOpen(true)}
          />
        </Flex>
      </Flex>
    </Box>
  );

  // Mobile — quick actions open as a full-screen drawer, triggered from the
  // page header so the trigger sits inline with the page title.
  const quickActionsDrawer = (
    <Drawer.Root
      size="full"
      open={quickActionsOpen}
      onOpenChange={(e) => setQuickActionsOpen(e.open)}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              borderBottomWidth="1px"
              borderColor="gray.200"
              py={3}
            >
              <Drawer.Title
                fontSize="xs"
                fontWeight="700"
                color="gray.400"
                letterSpacing="0.10em"
                textTransform="uppercase"
              >
                Quick Actions
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" position="initial" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body pt={5}>
              <Flex direction="column" gap={5}>
                {/* Name card details, repeated so the drawer keeps its context */}
                <Box
                  bg="bg"
                  borderWidth="1px"
                  borderColor="border.muted"
                  borderRadius="2xl"
                  shadow="xs"
                  p={4}
                >
                  <PlanholderNameCard
                    request={request}
                    status={liveProcessingStatus}
                  />
                </Box>

                {/* Opens the same Documents window as the desktop tile */}
                <Flex direction="column" gap={4}>
                  <QuickActionButton
                    icon={Files}
                    label="Documents"
                    onClick={() => {
                      setQuickActionsOpen(false);
                      setDocumentsOpen(true);
                    }}
                  />
                </Flex>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );

  return (
    <Page.Root
      title="Edit RITF"
      description={`LPA No. ${request.lpaNo}`}
      headerButton="back"
    >
      {/* Mobile — "More" sits in the header tool slot, inline with the title */}
      <Page.ToolContent display={{ base: "block", md: "none" }}>
        <Flex
          as="button"
          align="center"
          gap={1}
          borderRadius="full"
          borderWidth="1px"
          borderColor="var(--chakra-colors-primary)"
          color="var(--chakra-colors-primary)"
          fontSize="xs"
          fontWeight="semibold"
          px={3}
          py={1.5}
          flexShrink={0}
          onClick={() => setQuickActionsOpen(true)}
          aria-label="Quick actions"
        >
          <Ellipsis size={14} />
          More
        </Flex>
      </Page.ToolContent>

      <Page.MainContent>
        <Flex direction="column" gap={5}>
          {identityHeader}

          {/* Editing on the left, the read-only request beside it for reference */}
          <Grid
            templateColumns={{
              base: "minmax(0, 1fr)",
              lg: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
            }}
            gap={5}
            alignItems="start"
          >
            <SectionCard icon={<Pencil size={14} />} title="Editable Fields">
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
            gap={4}
          >
            <Field.Root>
              <Field.Label fontSize="xs" color="gray.500">
                Type
              </Field.Label>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field {...register("subType")}>
                  {SUB_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="xs" color="gray.500">
                Status
              </Field.Label>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field {...register("processingStatus")}>
                  {PROCESSING_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="xs" color="gray.500">
                NewPlanCode
              </Field.Label>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field {...register("newPlanCode")}>
                  {PLAN_CODE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="xs" color="gray.500">
                TF LastName
              </Field.Label>
              <Input size="sm" {...register("tfLastName")} />
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="xs" color="gray.500">
                TF FirstName
              </Field.Label>
              <Input size="sm" {...register("tfFirstName")} />
            </Field.Root>

            <Field.Root invalid={!!errors.dateReceivedByOP}>
              <Field.Label fontSize="xs" color="gray.500">
                DateReceivedByOP
              </Field.Label>
              <Input size="sm" type="date" {...register("dateReceivedByOP")} />
            </Field.Root>

            <Field.Root invalid={!!errors.dateReceivedFrOP}>
              <Field.Label fontSize="xs" color="gray.500">
                DateReceivedFrOP
              </Field.Label>
              <Input size="sm" type="date" {...register("dateReceivedFrOP")} />
            </Field.Root>

            <Field.Root invalid={!!errors.dateInformed}>
              <Field.Label fontSize="xs" color="gray.500">
                DateInformed
              </Field.Label>
              <Input size="sm" type="date" {...register("dateInformed")} />
            </Field.Root>

            <Field.Root invalid={!!errors.dateComplied}>
              <Field.Label fontSize="xs" color="gray.500">
                DateComplied
              </Field.Label>
              <Input size="sm" type="date" {...register("dateComplied")} />
            </Field.Root>
          </Grid>
            </SectionCard>

            <SectionCard icon={<FileText size={14} />} title="Request Info">
              <Flex direction="column" gap={1}>
                <InfoRow label="LPANo" value={request.lpaNo} />
                <InfoRow label="AcctStatus" value={request.acctStatus} />
                <InfoRow label="TermiStatus" value={request.termiStatus} />
                <InfoRow label="TrxMonth" value={request.trxMonth} />
                <InfoRow label="ReqBranch" value={request.reqBranch} />
                <InfoRow label="DaysProcessed" value={request.daysProcessed} />
                <InfoRow label="Notes" value={request.notes || undefined} />
                <InfoRow
                  label="Complete Documents"
                  value={request.completeDocuments ? "Yes" : "No"}
                />
              </Flex>
            </SectionCard>
          </Grid>

          <SectionCard icon={<ListChecks size={14} />} title="PH Updates">
            <DataTable<RitfPhUpdateEntry>
              columns={phUpdateColumns}
              data={request.phUpdates}
              getRowId={(row) => String(row.idx)}
              size="sm"
              emptyState="No data available in table."
              features={{
                search: true,
                filtering: false,
                sorting: true,
                pagination: true,
                columnToggle: false,
                selection: false,
                detailSidebar: false,
              }}
            />
          </SectionCard>

          <Flex gap={2} justify="flex-end">
            <SecondarySmButton onClick={goBack}>Cancel</SecondarySmButton>
            <PrimaryMdButton onClick={submit}>Save Changes</PrimaryMdButton>
          </Flex>

          {quickActionsDrawer}

          <DocumentsDialog
            open={documentsOpen}
            onClose={() => setDocumentsOpen(false)}
            documents={documents}
            onChange={saveDocuments}
          />
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}

export default EditRitfPage;
