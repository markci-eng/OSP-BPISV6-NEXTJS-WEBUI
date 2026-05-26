import { Flex } from "@chakra-ui/react";
import { SummaryItems, SummarySection } from "@splpi/operations";
import {
  LuCircleUserRound,
  LuClipboardCheck,
  LuUser,
  LuUsersRound,
} from "react-icons/lu";
import { PrimaryMdButton } from "st-peter-ui";

export default function TFReviewApplicationPage() {
  const summaryItems = (): SummaryItems[] => [
    { label: "LPA Number", value: "L25031417H" },
    { label: "Plan Type", value: "ST. GREGORY" },
    { label: "Mode", value: "MONTHLY" },
    { label: "Term", value: " 5YEARS" },
  ];

  const summaryItems1 = (): SummaryItems[] => [
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

  const summaryItems2 = (): SummaryItems[] => [
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
    <Flex direction={"column"} gap={5}>
      <SummarySection
        columns={4}
        items={summaryItems()}
        icon={<LuClipboardCheck />}
        title={"Transfer of Rights Summary"}
      />

      <SummarySection
        columns={4}
        items={summaryItems1()}
        icon={<LuCircleUserRound />}
        title={"New Planholder Information"}
      />

      <SummarySection
        columns={4}
        items={summaryItems2()}
        icon={<LuUsersRound />}
        title={"Beneficiaries"}
      />
      <PrimaryMdButton>Submit Application</PrimaryMdButton>
    </Flex>
  );
}
