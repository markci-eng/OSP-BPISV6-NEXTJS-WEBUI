import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import {
  VStack,
  Text,
  Input,
  Field,
  FileUpload,
  Box,
  useFileUploadContext,
  Icon,
  Span,
} from "@chakra-ui/react";
import { UploadFile } from "@splpi/operations";
import { LuUpload } from "react-icons/lu";
import { Body, H4, PrimarySmButton } from "st-peter-ui";
const MAX_FILES = 4;

const ConditionalDropzone = () => {
  const fileUpload = useFileUploadContext();
  const acceptedFiles = fileUpload.acceptedFiles;

  if (acceptedFiles.length >= MAX_FILES) {
    return null;
  }

  return (
    <FileUpload.Dropzone>
      <Icon size="md" color="fg.muted">
        <LuUpload />
      </Icon>
      <FileUpload.DropzoneContent>
        <Box>Drag and drop files here</Box>
        <Box color="fg.muted">.png, .jpg, .pdf </Box>
        {MAX_FILES - acceptedFiles.length} file
        {MAX_FILES - acceptedFiles.length === 1 ? "" : "s"} allowed
        <Box color="fg.muted">
          <FileUpload.Trigger asChild>
            <PrimarySmButton mt={2}>Browse Files</PrimarySmButton>
          </FileUpload.Trigger>
        </Box>
      </FileUpload.DropzoneContent>
    </FileUpload.Dropzone>
  );
};
const Requirements = () => {
  return (
    <VStack align="stretch" gap={4} mb={4}>
      <H4>Upload Requirements</H4>
      {/* <FileUpload.Root
        maxW="2xl"
        alignItems="stretch"
        maxFiles={MAX_FILES}
        accept=".png,.jpg,.jpeg,.pdf"
      >
        <FileUpload.HiddenInput />
        <FileUpload.Label w="xl">
          Kindly upload valid government issued ID with signature and three (3)
          specimen signature.
        </FileUpload.Label>
        <ConditionalDropzone />
        <FileUpload.List clearable />
      </FileUpload.Root> */}
      <Body>
        Kindly upload the <Span fontWeight="bold">LPA Form</Span> and valid{" "}
        {/* <Span fontWeight="bold">government issued ID with signature</Span> and */}
        <Span fontWeight="bold"> three (3) specimen signature.</Span>
      </Body>
      <Box w={"2xl"}>
        <DocumentUploader />
      </Box>
      <Field.Root w="2xl">
        <Body>Do you have an referral agent? (optional)</Body>
        <Input placeholder="Enter agent name" />
      </Field.Root>
    </VStack>
  );
};

export default Requirements;
