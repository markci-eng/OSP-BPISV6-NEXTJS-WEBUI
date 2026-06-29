import DocumentUploader, {
  UploadedFile,
} from "@/components/document-uploader/DragAndDrop";
import {
  Badge,
  Box,
  HStack,
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
    label: "Valid Government-Issued ID",
    description:
      "Any one (1) primary ID: Passport, SSS, GSIS, Driver's License, PRC, PhilHealth, Postal ID, or Voter's ID.",
    required: true,
  },
  {
    label: "Duly Accomplished Amendment Request Form",
    description:
      "Signed request form indicating the specific planholder information to be updated.",
    required: true,
  },
  {
    label: "Proof of Address",
    description:
      "Utility bill, bank statement, or any official document showing the new address (required for address changes).",
    required: false,
  },
  {
    label: "PSA Birth Certificate",
    description:
      "Philippine Statistics Authority-issued birth certificate (required for corrections to name or date of birth).",
    required: false,
  },
  {
    label: "PSA Marriage Certificate",
    description:
      "Required if requesting a name change due to marriage.",
    required: false,
  },
  {
    label: "Court Order / Legal Document",
    description:
      "Required for name corrections or changes not covered by marriage or birth records.",
    required: false,
  },
] as const;

export function EditDocumentsPage({
  onFilesChange,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  return (
    <Box
      display={{ base: "flex", md: "grid" }}
      flexDirection="column"
      gridTemplateColumns={{ md: "1fr 1fr" }}
      gap={5}
      mt={2}
      alignItems="start"
    >
      {/* Left column: Instructions Banner + Required Documents */}
      <VStack align="stretch" gap={5}>
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
      </VStack>

      {/* Right column: Important Notice + Upload Documents */}
      <VStack align="stretch" gap={5}>
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
            Incomplete or illegible documents may delay the processing of your information update
            request. Your Branch personnel will review all uploaded files before applying any changes.
          </Text>
        </HStack>

        {/* Upload Documents */}
        <Box>
          <Text fontWeight="semibold" fontSize="sm" mb={3}>
            Upload Documents
          </Text>
          <DocumentUploader onFilesChange={onFilesChange} canPicture />
        </Box>
      </VStack>
    </Box>
  );
}
