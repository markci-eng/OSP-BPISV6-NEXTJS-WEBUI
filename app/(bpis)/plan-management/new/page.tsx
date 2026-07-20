"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { Body, CancelButton, H3, NextButton } from "st-peter-ui";
import Page from "@/claude components/layout/page/Page";
import InfoCard from "@/claude components/info-card/info-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SharedLifePlanApplication } from "@splpi/estore-shared-components";
import {
  ApplicationProvider,
  useApplication,
} from "@/app/(bpis)/sales-force/new/application/application-context";
import { DocumentUploadCard } from "@/app/(bpis)/sales-force/new/application/components/DocumentUploadCard";
import { DOCUMENT_TYPES } from "@/app/(bpis)/sales-force/new/application/document-config";

const VALID_ID_CONFIG = DOCUMENT_TYPES.find((d) => d.id === "valid-id")!;
const SIGNATURE_CONFIG = DOCUMENT_TYPES.find(
  (d) => d.id === "specimen-signature",
)!;

const REQUIRED_INFO = [
  "Full Name",
  "Nationality",
  "Mobile Number",
  "Email Address",
  "Date of Birth",
  "Complete Address",
  "Beneficiary/ies",
];

const REQUIRED_DOCUMENTS = [
  "Current and Valid Government-issued ID",
  "Specimen Signature",
];

function NewSalePageContent() {
  const [showApplication, setShowApplication] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { documents } = useApplication();

  // Validates that both documents have finished uploading/processing, then
  // resolves successfully so the flow can advance to the application.
  const handleDummyRequirementsUpload = async (): Promise<{
    success: boolean;
  }> => {
    if (documents[VALID_ID_CONFIG.id]?.status !== "completed") {
      toast.error("Please upload a government-issued ID.");
      return { success: false };
    }

    if (documents[SIGNATURE_CONFIG.id]?.status !== "completed") {
      toast.error("Please upload your specimen signature.");
      return { success: false };
    }

    toast.success("Requirements uploaded successfully.");
    return { success: true };
  };

  if (showApplication) {
    return (
      <Page.Root
        headerButton="menu"
        title="Add New Sale"
        description="Apply for a new life plan."
      >
        <Page.MainContent>
          <SharedLifePlanApplication />
        </Page.MainContent>
      </Page.Root>
    );
  }

  return (
    <Box
      maxW="2xl"
      mx="auto"
      mt={{ base: 4, md: 8 }}
      p={{ base: 6, md: 8 }}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      bg="white"
      shadow="sm"
    >
      <H3 textAlign={"center"}>Let&apos;s Get Started</H3>
      <Body mt={3}>
        We&apos;ll be needing some documents and information to proceed with the
        purchase, please prepare the following in advance to smooth out the next
        steps
      </Body>

      <Box mt={6} p={{ base: 4, md: 6 }} bg="gray.50" borderRadius="xl">
        <Text fontWeight="bold">Required Information</Text>
        <VStack align="stretch" gap={1} mt={2}>
          {REQUIRED_INFO.map((item, index) => (
            <Text key={item}>
              {index + 1}. {item}
            </Text>
          ))}
        </VStack>

        <Text fontWeight="bold" mt={4}>
          Required Documents
        </Text>
        <VStack align="stretch" gap={1} mt={2}>
          {REQUIRED_DOCUMENTS.map((item, index) => (
            <Text key={item}>
              {index + 1}. {item}
            </Text>
          ))}
        </VStack>
      </Box>

      <Dialog.Root
        size={{ mdDown: "full", md: "md" }}
        open={uploadDialogOpen}
        onOpenChange={(details) => setUploadDialogOpen(details.open)}
      >
        <Dialog.Trigger asChild>
          <Button
            w="full"
            mt={6}
            bg={BRAND_COLORS.primaryGreen}
            color="white"
            _hover={{ bg: BRAND_COLORS.darkGreen }}
            onClick={() => setUploadDialogOpen(true)}
          >
            CONTINUE
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Upload Requirements</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack gap={6} align="stretch">
                  <InfoCard>
                    To continue, please upload a valid ID. The system will use
                    it to populate your information automatically.
                  </InfoCard>
                  <DocumentUploadCard config={VALID_ID_CONFIG} />
                  <DocumentUploadCard config={SIGNATURE_CONFIG} />
                </VStack>
              </Dialog.Body>

              <Dialog.Footer display="flex" justifyContent="space-between">
                <Dialog.ActionTrigger asChild>
                  <CancelButton />
                </Dialog.ActionTrigger>
                <NextButton
                  onClick={async () => {
                    const result = await handleDummyRequirementsUpload();
                    if (!result.success) return;

                    setUploadDialogOpen(false);
                    setShowApplication(true);
                  }}
                />
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

export default function NewSalePage() {
  return (
    <ApplicationProvider>
      <NewSalePageContent />
    </ApplicationProvider>
  );
}
