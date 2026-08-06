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
  Table,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Banknote,
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Ellipsis,
  Files,
  Hammer,
  Hash,
  History,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  StickyNote,
  UserRound,
  Wallet,
} from "lucide-react";

import { updateRopRequest } from "../data/data";
import type {
  RopHistoryEntry,
  RopPaymentStatus,
  RopRequest,
} from "../data/types";
import { FormStepper, InfoCardAccordion, OSPBadge, Page } from "osp-ui-kit";
import { DocumentsDialog } from "../../components/documents-dialog";
import type { DocumentRef } from "../../document-requirements";
import { PhUpdatePage } from "./ph-update-page";
import { PayoutValidationPage } from "./payout-validation-page";

const EditRopPaymentSchema = z.object({
  schedule: z.string().min(1, "Schedule is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Amount must be zero or greater",
    ),
  paymentStatus: z.enum(["FOR_PROCESS", "PROCESSED", "RELEASED", "CANCELLED"]),
  dateApplied: z.string().min(1, "Date applied is required"),
  dateReceived: z.string(),
  loanRemarks: z.string(),
  notes: z.string(),
});

type EditRopPaymentFormFields = z.infer<typeof EditRopPaymentSchema>;

const PAYMENT_STATUS_LABELS: Record<RopPaymentStatus, string> = {
  FOR_PROCESS: "FOR PROCESS",
  PROCESSED: "PROCESSED",
  RELEASED: "RELEASED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS_BADGE: Record<
  RopPaymentStatus,
  "warning" | "info" | "success" | "danger"
> = {
  FOR_PROCESS: "warning",
  PROCESSED: "info",
  RELEASED: "success",
  CANCELLED: "danger",
};

function formatDate(value?: string) {
  if (!value || value === "1900-01-01") return "—";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Dashed label/value row — matches the approvals-detail InfoItem pattern.
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

// Mobile stand-in for a ROP History table row — the table's 6 columns don't
// fit a phone width, and a horizontally-scrolling table gives no visible
// affordance that there's more to scroll to (mobile Safari hides scrollbars).
function HistoryEntryCard({ entry }: { entry: RopHistoryEntry }) {
  return (
    <Box borderWidth="1px" borderColor="border.muted" borderRadius="lg" p={3}>
      <Flex align="center" justify="space-between" mb={1}>
        <OSPBadge>#{entry.idx}</OSPBadge>
      </Flex>
      <Text fontSize="sm" color="gray.800" mb={2}>
        {entry.notes || "—"}
      </Text>
      <InfoRow label="Audit User" value={entry.auditUser} />
      <InfoRow label="Audit Date" value={formatDate(entry.auditDate)} />
      <InfoRow label="Edit User" value={entry.editUser} />
      <InfoRow label="Edit Date" value={formatDate(entry.editDate)} />
    </Box>
  );
}

// Bordered section card with an uppercase icon+title strip — mirrors the
// approvals detail panel's SectionCard so form and summary read as one system.
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

// Mini quick-action button — icon-over-label card, matching the
// AccountQuickActions style on the Planholder Profile's LPA card.
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

// Planholder identity block — avatar, name, ROP/LPA identifiers and status.
// Shared by the step identity header and the mobile quick-actions drawer;
// `trailing` is where the header slots its mobile "More" trigger.
function PlanholderNameCard({
  row,
  status,
  trailing,
}: {
  row: RopRequest;
  status: RopPaymentStatus;
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
            name={row.planholderName}
          />
        </Avatar.Root>
      </Box>
      <Box minW={0} flex="1">
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontWeight="bold" fontSize="lg" lineHeight="1.2" truncate minW={0}>
            {row.planholderName}
          </Text>
          {trailing}
        </Flex>
        <Flex align="center" gap={2} mt={1.5} flexWrap="wrap">
          <Flex align="center" gap={1} fontSize="xs" color="gray.500">
            <Hash size={12} />
            <Text>{row.ropNo}</Text>
          </Flex>
          <Text fontSize="xs" color="gray.300">
            ·
          </Text>
          <Text fontSize="xs" color="gray.500">
            LPA {row.lpaNo}
          </Text>
          <OSPBadge>{row.branchCode}</OSPBadge>
        </Flex>
        <Box mt={1.5}>
          <OSPBadge type={PAYMENT_STATUS_BADGE[status]}>
            {PAYMENT_STATUS_LABELS[status]}
          </OSPBadge>
        </Box>
      </Box>
    </Flex>
  );
}

// Quick-actions section — the same InfoCardAccordion used by the Payout
// Validation step, with an empty body until each feature is wired up.
function QuickActionSection({
  icon: Icon,
  label,
  subtitle,
  emptyText,
  isOpen,
  onToggle,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  subtitle: string;
  emptyText: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <InfoCardAccordion
      icon={<Icon size={16} />}
      title={label}
      subtitle={subtitle}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={2}
        py={10}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.200"
        borderRadius="lg"
      >
        <Box color="gray.300">
          <Icon size={28} />
        </Box>
        <Text fontSize="sm" color="gray.400">
          {emptyText}
        </Text>
      </Flex>
    </InfoCardAccordion>
  );
}

// Placeholder for steps whose design hasn't been decided yet.
function StepPlaceholder({ label }: { label: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={3}
      py={20}
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="xl"
      bg="white"
    >
      <Box color="gray.300">
        <Hammer size={36} />
      </Box>
      <Text fontWeight="600" color="gray.700">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.400">
        This step is under construction.
      </Text>
    </Flex>
  );
}

export function EditRopPaymentPage({ request }: { request: RopRequest }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false);
  const [documentsOpen, setDocumentsOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<DocumentRef[]>(
    request.documents,
  );

  const saveDocuments = (next: DocumentRef[]) => {
    setDocuments(next);
    updateRopRequest(request.id, { documents: next });
  };
  // Quick-actions drawer — one section expanded at a time.
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditRopPaymentFormFields>({
    resolver: zodResolver(EditRopPaymentSchema),
    defaultValues: {
      schedule: request.schedule,
      amount: String(request.amount),
      paymentStatus: request.paymentStatus,
      dateApplied: request.dateApplied,
      dateReceived: request.dateReceived,
      loanRemarks: request.loanRemarks,
      notes: request.notes,
    },
  });

  const goBack = () => router.push("/accounts-management/rop");

  const submit = handleSubmit((values) => {
    updateRopRequest(request.id, {
      schedule: values.schedule,
      amount: Number(values.amount),
      paymentStatus: values.paymentStatus,
      dateApplied: values.dateApplied,
      dateReceived: values.dateReceived,
      loanRemarks: values.loanRemarks,
      notes: values.notes,
    });
    toast.success("Payment updated");
    goBack();
  });

  const row = request;
  const liveStatus = watch("paymentStatus");

  // Identity header — planholder + ROP/LPA identifiers + quick actions.
  // Prepended to every step's content, so it renders between the stepper's
  // tab header and each step's info.
  const identityHeader = (
    <Box
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
        <PlanholderNameCard row={row} status={liveStatus} />

        {/* Desktop — quick actions inline, right-aligned with the name row */}
        <Flex gap={2} flexShrink={0} display={{ base: "none", md: "flex" }}>
          <QuickActionButton
            icon={Files}
            label="Documents"
            onClick={() => setDocumentsOpen(true)}
          />
          <QuickActionButton icon={StickyNote} label="Notes" />
          <QuickActionButton icon={CreditCard} label="Payments" />
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
                  <PlanholderNameCard row={row} status={liveStatus} />
                </Box>

                <Flex direction="column" gap={4}>
                  {/* Opens the same Documents window as the desktop tile */}
                  <QuickActionButton
                    icon={Files}
                    label="Documents"
                    onClick={() => {
                      setQuickActionsOpen(false);
                      setDocumentsOpen(true);
                    }}
                  />
                  <QuickActionSection
                    icon={StickyNote}
                    label="Notes"
                    subtitle="Remarks recorded against this request"
                    emptyText="No notes yet."
                    isOpen={openSection === "notes"}
                    onToggle={() => toggleSection("notes")}
                  />
                  <QuickActionSection
                    icon={CreditCard}
                    label="Payments"
                    subtitle="Payment transactions for this account"
                    emptyText="No payments yet."
                    isOpen={openSection === "payments"}
                    onToggle={() => toggleSection("payments")}
                  />
                </Flex>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );

  const ropScheduleStep = {
    title: "ROP Schedule",
    icon: Wallet,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          }}
          gap={5}
          alignItems="start"
        >
          {/* Left — editable form, grouped into section cards */}
          <Flex direction="column" gap={4}>
            <SectionCard icon={<Hash size={14} />} title="ROP Identification">
              <InfoRow label="ROP No." value={row.ropNo} />
              <InfoRow label="LPA No." value={row.lpaNo} />
              <InfoRow label="Days Processed" value={row.daysProcessed} />
            </SectionCard>

            <SectionCard icon={<Wallet size={14} />} title="Schedule">
              <Grid templateColumns="1fr" gap={4}>
                <Grid
                  templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                  gap={4}
                >
                  <Field.Root invalid={!!errors.schedule}>
                    <Field.Label fontSize="xs" color="gray.500">
                      Schedule
                    </Field.Label>
                    <Input size="sm" {...register("schedule")} />
                    {errors.schedule && (
                      <Field.ErrorText>
                        {errors.schedule.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.amount}>
                    <Field.Label fontSize="xs" color="gray.500">
                      Amount
                    </Field.Label>
                    <Input
                      size="sm"
                      type="number"
                      step="0.01"
                      {...register("amount")}
                    />
                    {errors.amount && (
                      <Field.ErrorText>{errors.amount.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Grid>

                <Field.Root>
                  <Field.Label fontSize="xs" color="gray.500">
                    Status
                  </Field.Label>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field {...register("paymentStatus")}>
                      {Object.entries(PAYMENT_STATUS_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>

                <Grid
                  templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                  gap={4}
                >
                  <Field.Root invalid={!!errors.dateApplied}>
                    <Field.Label fontSize="xs" color="gray.500">
                      Date Applied
                    </Field.Label>
                    <Input size="sm" type="date" {...register("dateApplied")} />
                    {errors.dateApplied && (
                      <Field.ErrorText>
                        {errors.dateApplied.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="xs" color="gray.500">
                      Date Received
                    </Field.Label>
                    <Input
                      size="sm"
                      type="date"
                      {...register("dateReceived")}
                    />
                  </Field.Root>
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard
              icon={<MessageSquare size={14} />}
              title="Remarks & Notes"
            >
              <Grid templateColumns="1fr" gap={4}>
                <Field.Root>
                  <Field.Label fontSize="xs" color="gray.500">
                    Loan Remarks
                  </Field.Label>
                  <Input size="sm" {...register("loanRemarks")} />
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="xs" color="gray.500">
                    Notes
                  </Field.Label>
                  <Textarea
                    size="sm"
                    rows={3}
                    resize="vertical"
                    {...register("notes")}
                  />
                </Field.Root>
              </Grid>
            </SectionCard>
          </Flex>

          {/* Right — planholder summary + history */}
          <Flex direction="column" gap={4}>
            <SectionCard
              icon={<CalendarClock size={14} />}
              title="Plan Timeline"
            >
              <Grid
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                columnGap={4}
                rowGap={{ base: 1, sm: 0 }}
              >
                <InfoRow label="Birthdate" value={formatDate(row.birthdate)} />
                <InfoRow label="Age" value={row.age} />
                <InfoRow
                  label="Effectivity Date"
                  value={formatDate(row.effectivityDate)}
                />
                <InfoRow
                  label="New Effectivity Date"
                  value={formatDate(row.newEffectivityDate)}
                />
                <InfoRow label="Move Date" value={formatDate(row.moveDate)} />
                <InfoRow
                  label="First ROP Date"
                  value={formatDate(row.firstRopDate)}
                />
              </Grid>
            </SectionCard>

            <SectionCard
              icon={<ShieldCheck size={14} />}
              title="Account Status"
            >
              <Grid
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                columnGap={4}
                rowGap={{ base: 1, sm: 0 }}
              >
                <InfoRow
                  label="Termination Status"
                  value={row.terminationStatus}
                />
                <InfoRow
                  label="TermiStat Date"
                  value={formatDate(row.terminationStatusDate)}
                />
                <InfoRow label="Account Status" value={row.accountStatus} />
                <InfoRow label="Pay Class" value={row.payClass} />
              </Grid>
            </SectionCard>

            <SectionCard icon={<Banknote size={14} />} title="Plan & Contract">
              <Grid
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                columnGap={4}
                rowGap={{ base: 1, sm: 0 }}
              >
                <InfoRow label="Plan Code" value={row.planType} />
                <InfoRow
                  label="Contract Price"
                  value={formatCurrency(row.contractPrice)}
                />
              </Grid>
            </SectionCard>

            <SectionCard icon={<ClipboardList size={14} />} title="Remarks">
              <Text fontSize="sm" color="gray.700">
                {row.remarks || "—"}
              </Text>
            </SectionCard>

            <SectionCard icon={<History size={14} />} title="ROP History">
              {row.history.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                  No history available.
                </Text>
              ) : (
                <>
                  {/* Mobile — stacked cards; a 6-column table has no room on a phone. */}
                  <Flex
                    display={{ base: "flex", md: "none" }}
                    direction="column"
                    gap={2}
                  >
                    {row.history.map((h) => (
                      <HistoryEntryCard key={h.idx} entry={h} />
                    ))}
                  </Flex>

                  {/* Tablet/desktop — full table. */}
                  <Box display={{ base: "none", md: "block" }} overflowX="auto">
                    <Table.Root size="sm" variant="outline">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Idx</Table.ColumnHeader>
                          <Table.ColumnHeader>Notes</Table.ColumnHeader>
                          <Table.ColumnHeader>Audit User</Table.ColumnHeader>
                          <Table.ColumnHeader>Audit Date</Table.ColumnHeader>
                          <Table.ColumnHeader>Edit User</Table.ColumnHeader>
                          <Table.ColumnHeader>Edit Date</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {row.history.map((h) => (
                          <Table.Row key={h.idx}>
                            <Table.Cell>{h.idx}</Table.Cell>
                            <Table.Cell whiteSpace="normal" minW="200px">
                              {h.notes}
                            </Table.Cell>
                            <Table.Cell>{h.auditUser}</Table.Cell>
                            <Table.Cell>{formatDate(h.auditDate)}</Table.Cell>
                            <Table.Cell>{h.editUser}</Table.Cell>
                            <Table.Cell>{formatDate(h.editDate)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </>
              )}
            </SectionCard>
          </Flex>
        </Grid>
      </Flex>
    ),
  };

  const phUpdateStep = {
    title: "PH Update",
    icon: UserRound,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <PhUpdatePage entries={row.phUpdates} />
      </Flex>
    ),
  };

  const payoutValidationStep = {
    title: "Payout Validation",
    icon: BadgeCheck,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <PayoutValidationPage account={row.payoutAccount} />
      </Flex>
    ),
  };

  const summaryStep = {
    title: "Summary",
    icon: ListChecks,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <StepPlaceholder label="Summary" />
      </Flex>
    ),
  };

  const stepsData = [
    phUpdateStep,
    payoutValidationStep,
    ropScheduleStep,
    summaryStep,
  ];

  return (
    <Page.Root
      title="ROP Information"
      description={`ROP No. ${row.ropNo}`}
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
        <FormStepper
          stepsData={stepsData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={submit}
          submitButtonText="Save Changes"
        />
        {quickActionsDrawer}

        <DocumentsDialog
          open={documentsOpen}
          onClose={() => setDocumentsOpen(false)}
          documents={documents}
          onChange={saveDocuments}
        />
      </Page.MainContent>
    </Page.Root>
  );
}
