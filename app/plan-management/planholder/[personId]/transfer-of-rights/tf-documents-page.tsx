import DocumentUploader, {
  UploadedFile,
} from "@/components/document-uploader/DragAndDrop";
import {
  Badge,
  Box,
  HStack,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuCircleCheck,
  LuClipboardList,
  LuInfo,
  LuTriangleAlert,
} from "react-icons/lu";

const REQUIRED_DOCUMENTS = [
  {
    label: "Transfer of Rights Application Form",
    description: "Duly accomplished and signed by the current planholder (Assignor).",
    required: true,
  },
  {
    label: "Absolute Deed of Assignment",
    description: "Notarized deed of assignment executed by both the Assignor and Assignee.",
    required: true,
  },
  {
    label: "Original Plan Contract / Policy",
    description: "The original copy of the life insurance plan contract.",
    required: true,
  },
  {
    label: "Valid Government-Issued ID of Assignor",
    description:
      "Any one (1) primary ID: Passport, SSS, GSIS, Driver's License, PRC, PhilHealth, Postal ID, or Voter's ID.",
    required: true,
  },
  {
    label: "Valid Government-Issued ID of Assignee",
    description:
      "Any one (1) primary ID: Passport, SSS, GSIS, Driver's License, PRC, PhilHealth, Postal ID, or Voter's ID.",
    required: true,
  },
  {
    label: "Proof of Relationship (if applicable)",
    description:
      "Marriage Certificate, Birth Certificate, or other supporting document showing the relationship between Assignor and Assignee.",
    required: false,
  },
  {
    label: "Death Certificate (if Assignor is deceased)",
    description:
      "PSA-issued Death Certificate of the deceased planholder, if the transfer is due to death.",
    required: false,
  },
] as const;

export function TransferDocumentsPage({
  onFilesChange,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  return (
    <VStack align="stretch" gap={5} mt={2}>
      {/* Instructions Banner */}
      <Box
        borderWidth="1px"
        borderColor="blue.200"
        bg="blue.50"
        rounded="xl"
        p={4}
        _dark={{ bg: "blue.950", borderColor: "blue.800" }}
      >
        <HStack gap={2} mb={2} align="center">
          <Box color="blue.500">
            <LuInfo size={16} />
          </Box>
          <Text fontWeight="semibold" fontSize="sm" color="blue.700" _dark={{ color: "blue.300" }}>
            Before You Upload
          </Text>
        </HStack>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color="blue.700" _dark={{ color: "blue.300" }}>
            Please prepare clear, legible scanned copies or photos of all required documents listed
            below. Ensure all pages are complete and signatures are visible.
          </Text>
          <Text fontSize="xs" color="blue.700" _dark={{ color: "blue.300" }}>
            Accepted formats: <strong>PDF, JPG, PNG, DOC, DOCX</strong> &mdash; max{" "}
            <strong>20 MB</strong> per file.
          </Text>
        </VStack>
      </Box>

      {/* Required Documents Checklist */}
      <Box borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden">
        <HStack px={4} py={3} bg="bg.subtle" gap={2} borderBottomWidth="1px" borderColor="border">
          <Box color="fg.muted">
            <LuClipboardList size={16} />
          </Box>
          <Text fontWeight="semibold" fontSize="sm">
            Required Documents
          </Text>
        </HStack>

        <VStack align="stretch" gap={0} divideY="1px">
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
      </Box>

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
          Incomplete or illegible documents may delay the processing of your Transfer of Rights
          application. Your Branch personnel will review all uploaded files before proceeding.
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
