"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Ellipsis,
  Files,
  Hammer,
  Hash,
  ListChecks,
  StickyNote,
  UserRound,
} from "lucide-react";
import { FormStepper, InfoCardAccordion, Page } from "osp-ui-kit";

import { updateCsvRequest } from "../data/data";
import type { CsvRequest } from "../data/types";
import { CsvStatusBadge } from "../components/CsvStatusBadge";
import { DocumentsDialog } from "../../components/documents-dialog";
import type { DocumentRef } from "../../document-requirements";
import { PhUpdatePage } from "./ph-update-page";
import { PayoutValidationPage } from "./payout-validation-page";

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

// Quick-actions section — the same InfoCardAccordion the ROP drawer uses,
// with an empty body until the feature is wired up.
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

// Planholder identity block — avatar, name, LPA/branch identifiers and status.
// Shared by the step identity header and the mobile quick-actions drawer;
// `trailing` is where the header slots its mobile "More" trigger.
function PlanholderNameCard({
  request,
  trailing,
}: {
  request: CsvRequest;
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
          <Text
            fontWeight="bold"
            fontSize="lg"
            lineHeight="1.2"
            truncate
            minW={0}
          >
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
            {request.branchCode}
          </Text>
        </Flex>
        <Box mt={1.5}>
          <CsvStatusBadge status={request.status} />
        </Box>
      </Box>
    </Flex>
  );
}

export function EditCsvPage({ request }: { request: CsvRequest }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false);
  const [documentsOpen, setDocumentsOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<DocumentRef[]>(
    request.documents,
  );
  // Quick-actions drawer — one section expanded at a time.
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const saveDocuments = (next: DocumentRef[]) => {
    setDocuments(next);
    updateCsvRequest(request.id, { documents: next });
  };

  const goBack = () => router.push("/accounts-management/csv");

  const complete = () => {
    toast.success("CSV request updated");
    goBack();
  };

  // Identity header — planholder + LPA/branch identifiers + quick actions.
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
        <PlanholderNameCard request={request} />

        {/* Desktop — quick actions inline, right-aligned with the name row */}
        <Flex gap={2} flexShrink={0} display={{ base: "none", md: "flex" }}>
          <QuickActionButton
            icon={Files}
            label="Documents"
            onClick={() => setDocumentsOpen(true)}
          />
          <QuickActionButton icon={StickyNote} label="Notes" />
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
                  <PlanholderNameCard request={request} />
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
                </Flex>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );

  const phUpdateStep = {
    title: "PH Update",
    icon: UserRound,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <PhUpdatePage entries={request.phUpdates} />
      </Flex>
    ),
  };

  const payoutValidationStep = {
    title: "Payout Validation",
    icon: BadgeCheck,
    content: (
      <Flex direction="column" gap={5}>
        {identityHeader}
        <PayoutValidationPage account={request.payoutAccount} />
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

  const stepsData = [phUpdateStep, payoutValidationStep, summaryStep];

  return (
    <Page.Root
      title="CSV Request"
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
        <FormStepper
          stepsData={stepsData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={complete}
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

export default EditCsvPage;
