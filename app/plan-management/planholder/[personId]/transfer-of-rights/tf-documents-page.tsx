import DocumentUploader, {
  UploadedFile,
} from "@/components/document-uploader/DragAndDrop";
import { Box } from "@chakra-ui/react";

export function TransferDocumentsPage({
  onFilesChange,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  return (
    <Box mt={5}>
      <DocumentUploader onFilesChange={onFilesChange} />
    </Box>
  );
}
