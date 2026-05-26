import DocumentUploader, {
  UploadedFile,
} from "@/components/document-uploader/DragAndDrop";
import { Box, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { Body } from "st-peter-ui";

export function TransferDocumentsPage({
  onFilesChange,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  return (
    <Box mt={{ base: 3, md: 4 }}>
      <Box mb={3}>
        <Body fontWeight="semibold" color={BRAND_COLORS.primaryGreen}>
          Required Documents
        </Body>
        <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} mt={1}>
          Upload the required supporting documents before proceeding to the next
          step.
        </Text>
      </Box>
      <DocumentUploader onFilesChange={onFilesChange} />
    </Box>
  );
}
