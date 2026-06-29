import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import SummaryForm from "@/components/common/text/SummaryForm";
import InfoItem from "@/components/new-planholder-profile/components/info-item/info-item";
import { Flex, Separator } from "@chakra-ui/react";
import { SummaryItems, SummarySection } from "@splpi/operations";
import {
  LuCircleUserRound,
  LuClipboardCheck,
  LuFileText,
  LuUser,
  LuUsersRound,
} from "react-icons/lu";

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
    <Flex direction={"column"} gap={5}>
      <InfoCardAccordion
        icon={<LuFileText />}
        title={"Plan Details"}
        defaultOpen
      >
        <RowItem label="LPA Number" value="L25031417H" />
        <RowItem label="Plan Type" value="ST. GREGORY" />
        <RowItem label="Mode" value="MONTHLY" />
        <RowItem label="Term" value=" 5YEARS" />
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<LuUser />}
        title={"New Planholder Info"}
        defaultOpen
      >
        <RowItem label="Last Name" value="DELA CRUZ" />{" "}
        <RowItem label="First Name" value="JUAN" />{" "}
        <RowItem label="Middle Name" value="GO" />{" "}
        <RowItem label="Date of Birth" value="09/11/1912" />{" "}
        <RowItem label="Gender" value="MALE" />{" "}
        <RowItem label="Civil Status" value="WIDOWED" />{" "}
        <RowItem label="Contact Number" value="+63-987-654-3210" />{" "}
        <RowItem label="Insurability" value="NOT INSURABLE" />{" "}
        <RowItem label="Lot No." value="LOT 12-B" />{" "}
        <RowItem label="Street" value="MAPLE STREET" />{" "}
        <RowItem label="Barangay" value="SAMPALOC" />{" "}
        <RowItem label="District" value="DISTRICT II" />{" "}
        <RowItem label="City" value="DASMARINAS" />{" "}
        <RowItem label="Province" value="CAVITE" />{" "}
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<LuUsersRound />}
        title={"Beneficiaries"}
        defaultOpen
      >
        <RowItem label="Name" value="LIZ ANN L. RIVAS" />
        <RowItem label="Relationship" value="COUSIN" />
        <RowItem label="Date of Birth" value="11/02/1990" />
        <InfoItem
          label="Address"
          value="B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171"
        />
        <Separator my={2} />
        <RowItem label="Name" value="LIZ ANN L. RIVAS" />
        <RowItem label="Relationship" value="COUSIN" />
        <RowItem label="Date of Birth" value="11/02/1990" />
        <InfoItem
          label="Address"
          value="B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171"
        />
      </InfoCardAccordion>
    </Flex>
  );
}
