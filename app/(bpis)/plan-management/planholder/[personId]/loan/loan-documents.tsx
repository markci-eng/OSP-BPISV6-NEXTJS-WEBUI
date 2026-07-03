"use client";

import { useState } from "react";
import DocumentUploader, {
  UploadedFile,
} from "@/components/document-uploader/DragAndDrop";
import { Badge, Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import {
  LuCircleCheck,
  LuClipboardList,
  LuTriangleAlert,
} from "react-icons/lu";

import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import InfoCard from "@/claude components/info-card/info-card";

export const REQUIRED_DOCUMENTS = [
  {
    label: "Current and Valid Government-issued ID",
    description:
      "Original and unexpired government-issued identification of the planholder.",
    required: true,
  },
  {
    label: "Specimen Signature",
    description: "Signature specimen on file for verification purposes.",
    required: true,
  },
  {
    label: "Certificate of Full Payment (COFP)",
    description: "Proof that the plan has been fully paid.",
    required: true,
  },
  {
    label: "Deed of Assignment (DA)",
    description: "Notarized deed of assignment covering the plan.",
    required: true,
  },
  {
    label: "Fully Paid Lending-BSOA",
    description: "Required if this transaction is a renewal.",
    required: false,
  },
  {
    label: "Valid ID of Companion, PH and BM Letter",
    description:
      "Required for planholders 70 years old and above, PWD, or documents affixed with a thumb-mark only.",
    required: false,
  },
] as const;

export function LoanDocumentsPage({
  onFilesChange,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  const [isDocsOpen, setIsDocsOpen] = useState(true);

  return (
    <VStack align="stretch" gap={5} mt={2}>
      {/* Required Documents Checklist */}
      <InputCardAccordion
        icon={<LuClipboardList size={18} />}
        title="Required Documents"
        subtitle={`${REQUIRED_DOCUMENTS.length} items`}
        isOpen={isDocsOpen}
        onToggle={() => setIsDocsOpen((prev) => !prev)}
      >
        <VStack align="stretch" gap={0} divideY="1px" mt={-4} mx={-4}>
          {REQUIRED_DOCUMENTS.map((doc, index) => (
            <HStack key={index} px={4} py={3} gap={3} align="start">
              <Box color="green.500" mt="2px" flexShrink={0}>
                <LuCircleCheck size={16} />
              </Box>
              <Box flex="1" minW={0}>
                <HStack gap={2} align="center" flexWrap="wrap">
                  <Text fontSize="sm" fontWeight="medium">
                    {doc.label}
                  </Text>
                  {doc.required ? (
                    <Badge colorPalette="red" size="sm" variant="subtle">
                      Required
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" size="sm" variant="subtle">
                      If applicable
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="fg.muted" mt={0.5}>
                  {doc.description}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </InputCardAccordion>

      {/* Important Note */}
      <HStack
        borderWidth="1px"
        borderColor="orange.200"
        bg="orange.50"
        rounded="xl"
        p={4}
        gap={3}
        align="start"
        _dark={{ bg: "orange.950", borderColor: "orange.800" }}
      >
        <Box color="orange.500" flexShrink={0} mt="1px">
          <LuTriangleAlert size={16} />
        </Box>
        <Text fontSize="xs" color="orange.700" _dark={{ color: "orange.300" }}>
          Incomplete or illegible documents may delay the processing of your
          Loan application. Your Branch personnel will review all uploaded files
          before proceeding.
        </Text>
      </HStack>

      <Separator />

      {/* Uploader */}
      <Box>
        <Text fontWeight="semibold" fontSize="sm" mb={3}>
          Upload Documents
        </Text>
        <DocumentUploader onFilesChange={onFilesChange} canPicture />
      </Box>
    </VStack>
  );
}
