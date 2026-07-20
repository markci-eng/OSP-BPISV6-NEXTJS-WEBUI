"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  FileUpload,
  Heading,
  Icon,
  Portal,
  Text,
  useFileUploadContext,
  VStack,
} from "@chakra-ui/react";
import { LuUpload } from "react-icons/lu";
import { toast } from "sonner";
import {
  Body,
  CancelButton,
  H3,
  NextButton,
  PrimarySmButton,
} from "st-peter-ui";
import Page from "@/claude components/layout/page/Page";
import InfoCard from "@/claude components/info-card/info-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SharedLifePlanApplication } from "@splpi/estore-shared-components";

const MAX_FILES = 4;

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

const ConditionalDropzone = () => {
  const fileUpload = useFileUploadContext();
  const acceptedFiles = fileUpload.acceptedFiles;

  if (acceptedFiles.length >= MAX_FILES) {
    return null;
  }

  const remaining = MAX_FILES - acceptedFiles.length;

  return (
    <FileUpload.Dropzone>
      <Icon size="md" color="fg.muted">
        <LuUpload />
      </Icon>
      <FileUpload.DropzoneContent>
        <Box>Drag and drop files here</Box>
        {remaining} more file{remaining === 1 ? "" : "s"} allowed
        <Box color="fg.muted">
          {/* <FileUpload.Trigger asChild>
            <PrimarySmButton mt={2}>Browse Files</PrimarySmButton>
          </FileUpload.Trigger> */}
        </Box>
      </FileUpload.DropzoneContent>
    </FileUpload.Dropzone>
  );
};

export default function NewSalePage() {
  const [showApplication, setShowApplication] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [idFiles, setIdFiles] = useState<File[]>([]);
  const [signatureFiles, setSignatureFiles] = useState<File[]>([]);

  // Simulated requirements upload. Validates that both documents are provided,
  // then resolves successfully so the flow can advance to the application.
  const handleDummyRequirementsUpload = async (): Promise<{
    success: boolean;
  }> => {
    if (idFiles.length === 0) {
      toast.error("Please upload a government-issued ID.");
      return { success: false };
    }

    if (signatureFiles.length === 0) {
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
                  <Box>
                    <Body fontWeight="bold">Upload Government-issued ID</Body>
                    <FileUpload.Root
                      maxW="full"
                      alignItems="stretch"
                      maxFiles={MAX_FILES}
                      accept={["image/png", "image/jpeg", "application/pdf"]}
                      onFileChange={(details) =>
                        setIdFiles(details.acceptedFiles)
                      }
                    >
                      <FileUpload.HiddenInput />
                      <ConditionalDropzone />
                      <FileUpload.List clearable />
                    </FileUpload.Root>
                  </Box>

                  <Box>
                    <Body fontWeight="bold">Upload Specimen Signature</Body>
                    <FileUpload.Root
                      maxW="full"
                      alignItems="stretch"
                      maxFiles={MAX_FILES}
                      accept={["image/png", "image/jpeg", "application/pdf"]}
                      onFileChange={(details) =>
                        setSignatureFiles(details.acceptedFiles)
                      }
                    >
                      <FileUpload.HiddenInput />
                      <ConditionalDropzone />
                      <FileUpload.List clearable />
                    </FileUpload.Root>
                  </Box>
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
