import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import { Box, Container, FieldRoot, Flex, Text } from "@chakra-ui/react";
import { UploadFile } from "@splpi/operations";
import { Body } from "st-peter-ui";

export function TransferDocumentsPage() {
  return (
    <>
      <Box mt={5}>
        {/* <Text textStyle="xl" fontWeight="semibold">
          Document's
        </Text>

        <Body textStyle="md">
          Please provide the following documentation for your convenience in the
          next steps.
        </Body>
      </Box>

      <Box padding="5px">
        <Text textStyle="lg" fontWeight="semibold">
          Requirements:
        </Text>

        <Container textStyle="md">
          <Box
            as="ol"
            listStyle="decimal"
            display="flex"
            flexDirection="column"
            gap="5px"
          >
            <li>
              Photocopy of Valid IDs of the Planholder and Transferee
              (Government-issued ID's)
            </li>
            <li>
              Photocopy of Valid IDs of the Beneficiaries (Government-issued
              ID's)
            </li>
          </Box>
        </Container> */}
        <DocumentUploader />

        {/* <Container
          display="flex"
          flexDirection="column"
          gap="10px"
          marginTop="10px"
          padding="20px 0"
        >
          <Flex gap="15px">
            <Box width="100%">
              <Text textStyle="lg" fontWeight="semibold">
                Upload Documents
              </Text>
              <Text textStyle="md">
                Please upload the required documents listed in the previous
                step.
              </Text>
              <Box padding="5px">
                <UploadFile />
              </Box>
            </Box>

            <FieldRoot></FieldRoot>
          </Flex>
        </Container> */}
      </Box>
    </>
  );
}
