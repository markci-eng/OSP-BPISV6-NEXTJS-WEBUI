import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import InfoCard from "@/claude components/info-card/info-card";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Box, Flex, Separator, Text } from "@chakra-ui/react";
import {
  LuFileText,
  LuMapPin,
  LuPhone,
  LuUserPen,
} from "react-icons/lu";
import { PrimaryMdFlexButton } from "st-peter-ui";

interface EditPlanholderReviewProps {
  planholder: SalesAgent;
  selectedDocuments: UploadedFile[];
}

export default function EditPlanholderReview({
  planholder,
  selectedDocuments,
}: EditPlanholderReviewProps) {
  const { messageBox } = useMessageDialog();

  const fullAddress = (addr: SalesAgent["address"]) =>
    [addr?.unit, addr?.street, addr?.barangay, addr?.district, addr?.city, addr?.province]
      .filter(Boolean)
      .join(", ");

  return (
    <Flex direction="column" gap={5}>
      <InfoCard>
        Please review all the information below before submitting. Once
        submitted, changes may require additional processing time.
      </InfoCard>

      <InfoCardAccordion icon={<LuUserPen />} title="Personal Information" defaultOpen>
        <RowItem label="Last Name" value={planholder.lastName} />
        <RowItem label="First Name" value={planholder.firstName} />
        <RowItem label="Middle Name" value={planholder.middleName} />
        <RowItem label="Suffix" value={planholder.suffix || "—"} />
        <RowItem label="Gender" value={planholder.gender} />
        <RowItem label="Date of Birth" value={planholder.birthDate} />
        <RowItem label="Place of Birth" value={planholder.placeOfBirth} />
        <RowItem label="Civil Status" value={planholder.civilStatus} />
        <RowItem label="Nationality" value={planholder.nationality} />
        <RowItem label="Naturalization Date" value={planholder.naturalizationDate} />
        <RowItem label="Height" value={planholder.height} />
        <RowItem label="Weight" value={planholder.weight} />
      </InfoCardAccordion>

      <InfoCardAccordion icon={<LuMapPin />} title="Address" defaultOpen>
        <RowItem label="Lot/Bldg/Unit No." value={planholder.address?.unit} />
        <RowItem label="Street" value={planholder.address?.street} />
        <RowItem label="Barangay" value={planholder.address?.barangay} />
        <RowItem label="District" value={planholder.address?.district} />
        <RowItem label="City" value={planholder.address?.city} />
        <RowItem label="Province" value={planholder.address?.province} />
        <RowItem label="Zip Code" value={planholder.address?.zipCode} />
      </InfoCardAccordion>

      <InfoCardAccordion icon={<LuPhone />} title="Contact Information" defaultOpen>
        <RowItem label="Email" value={planholder.email} />
        <RowItem label="Mobile Number" value={planholder.mobile} />
        <RowItem label="Landline Number" value={planholder.landline} />
      </InfoCardAccordion>

      <InfoCardAccordion icon={<LuFileText />} title="Attached Documents" defaultOpen>
        {selectedDocuments.length === 0 ? (
          <Box
            p={4}
            borderRadius="md"
            borderWidth={1}
            borderStyle="dashed"
            borderColor="border"
            textAlign="center"
            color="gray.500"
            fontSize="sm"
          >
            No documents uploaded.
          </Box>
        ) : (
          <Flex direction="column" gap={2}>
            {selectedDocuments.map((doc, idx) => (
              <Flex key={doc.id} align="center" gap={2}>
                <Text fontSize="sm" color="gray.600" minW="20px">
                  {idx + 1}.
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {doc.file.name}
                </Text>
                <Text fontSize="xs" color="gray.400" ml="auto">
                  {(doc.file.size / 1024).toFixed(1)} KB
                </Text>
              </Flex>
            ))}
          </Flex>
        )}
      </InfoCardAccordion>

      <Separator my={2} />

      <PrimaryMdFlexButton
        onClick={async () => {
          const confirmed = await messageBox({
            title: "Confirm Submission",
            message:
              "Are you sure you want to submit the changes to the planholder information?",
            variant: "warning",
            confirmText: "Yes, Submit",
            showCancel: true,
            cancelText: "Cancel",
          });

          if (confirmed) {
            window.location.href = window.location.href + "/success";
          }
        }}
      >
        Submit Changes
      </PrimaryMdFlexButton>
    </Flex>
  );
}
