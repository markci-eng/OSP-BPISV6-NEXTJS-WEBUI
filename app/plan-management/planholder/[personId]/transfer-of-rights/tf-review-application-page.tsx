import SummaryForm from "@/components/common/text/SummaryForm";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { Body } from "st-peter-ui";

export default function TFReviewApplicationPage() {
  const summaryItems = () => [
    { label: "LPA Number", value: "L25031417H" },
    { label: "Plan Type", value: "ST. GREGORY" },
    { label: "Mode", value: "MONTHLY" },
    { label: "Term", value: " 5YEARS" },
  ];

  const summaryItems1 = () => [
    { label: "Last Name", value: "DELA CRUZ" },
    { label: "First Name", value: "JUAN" },
    { label: "Middle Name", value: "GO" },
    { label: "Date of Birth", value: "09/11/1912" },
    { label: "Gender", value: "MALE" },
    { label: "Civil Status", value: "WIDOWED" },
    { label: "Contact Number", value: "+63-987-654-3210" },
    { label: "Insurability", value: "NOT INSURABLE" },
    { label: "Lot No.", value: "LOT 12-B" },
    { label: "Street", value: "MAPLE STREET" },
    { label: "Barangay", value: "SAMPALOC" },
    { label: "District", value: "DISTRICT II" },
    { label: "City", value: "DASMARINAS" },
    { label: "Province", value: "CAVITE" },
  ];

  const summaryItems2 = () => [
    { label: "Name", value: "LIZ ANN L. RIVAS" },
    { label: "Relationship", value: "COUSIN" },
    { label: "Date of Birth", value: "11/02/1990" },
    {
      label: "Address",
      value:
        "B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171",
    },
    { label: "Name", value: "LIZ ANN L. RIVAS" },
    { label: "Relationship", value: "COUSIN" },
    { label: "Date of Birth", value: "11/02/1990" },
    {
      label: "Address",
      value:
        "B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171",
    },
  ];

  return (
    <Flex direction={"column"} gap={3}>
      <Box>
        <Body fontWeight="semibold" color={BRAND_COLORS.primaryGreen}>
          Review Application
        </Body>
        <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} mt={1}>
          Confirm the transfer details before submitting the application.
        </Text>
      </Box>
      <SummaryForm
        title="Transfer of Rights Summary"
        subtitle="Verify the information below before creating transfer request."
        data={[
          {
            title: "Transfer of Rights Summary",
            data: summaryItems(),
          },
          {
            title: "New Planholder Information",
            data: summaryItems1(),
          },
          {
            title: "Beneficiaries",
            data: summaryItems2(),
          },
        ]}
      />
    </Flex>
  );
}
