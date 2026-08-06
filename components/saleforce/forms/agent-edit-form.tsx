"use client";
import React, { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { LuBriefcase } from "react-icons/lu";
import { SalesAgent } from "../../common/agent-lookup/agent-lookup.type";
import { PersonalInfoSection } from "@/components/forms/PersonalInfoSection";
import { AddressListSection } from "@/components/forms/AddressListSection";
import { ContactListSection } from "@/components/forms/ContactListSection";
import { FormFooterActions } from "@/components/forms/FormFooterActions";
import { FloatingLabelInput, InputCardAccordion } from "osp-ui-kit";

interface AgentEditFormProps {
  selectedAgent?: SalesAgent;
  onCancel?: () => void;
  onSubmitted?: () => void;
  successLink?: string;
  hideActions?: boolean;
}

const mockAgent: SalesAgent = {
  id: "SA21",
  name: "Lim, Carlo",
  firstName: "Carlo",
  lastName: "Lim",
  middleName: "Santos",
  suffix: "",
  placeOfBirth: "Manila",
  birthDate: "1993-05-11",
  gender: "MALE",
  civilStatus: "Single",
  nationality: "Filipino",
  naturalizationDate: "N/A",
  height: "5'6\"",
  weight: "150 lbs",
  position: "SA2",
  hireDate: "2022-01-01",
  employeeStatus: "Active",
  branch: "Makati",
  superiorId: "STL1",
  sssNumber: "34-1234568-4",
  nbiNumber: "12-345678907-8",
  tinNumber: "1000-0007-0007",
  landline: "800-7007",
  mobile: "+63 917 111 1007",
  email: "carlo.lim@stpeter.com.ph",
  address: {
    unit: "Unit 9F",
    street: "Legazpi St.",
    barangay: "Legazpi Village",
    district: "District 1",
    city: "Makati",
    province: "Metro Manila",
    zipCode: "1229",
  },
  isContractPrinted: true,
  isSFIDPrinted: true,
  employer: "",
};

const ReadOnlyFieldTile = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <Box p={0.5}>
    <Box
      pos="relative"
      w="full"
      h="12"
      pt="5"
      pb="1"
      px="3"
      bg="gray.50"
      borderWidth="1.5px"
      borderColor="gray.200"
      borderRadius="lg"
    >
      <Text
        pos="absolute"
        top="-2"
        insetStart="2.5"
        px="0.5"
        bg="gray.50"
        fontSize="xs"
        fontWeight="medium"
        color="gray.400"
      >
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="gray.900" truncate>
        {value || "—"}
      </Text>
    </Box>
  </Box>
);

function EmploymentInfoSection({
  selectedAgent,
}: {
  selectedAgent?: SalesAgent;
}) {
  const [employmentInfo, setEmploymentInfo] = useState<{
    position: string;
    hireDate: string;
    employeeStatus: string;
    branch: string;
    superiorId: string;
    sssNumber: string;
    nbiNumber: string;
    tinNumber: string;
  }>({
    position: selectedAgent?.position ?? "",
    hireDate: selectedAgent?.hireDate ?? "",
    employeeStatus: selectedAgent?.employeeStatus ?? "",
    branch: selectedAgent?.branch ?? "",
    superiorId: selectedAgent?.superiorId ?? "",
    sssNumber: selectedAgent?.sssNumber ?? "",
    nbiNumber: selectedAgent?.nbiNumber ?? "",
    tinNumber: selectedAgent?.tinNumber ?? "",
  });

  const updateEmploymentInfo = (patch: Partial<typeof employmentInfo>) =>
    setEmploymentInfo((prev) => ({ ...prev, ...patch }));

  const isEmploymentInfoComplete = Object.values(employmentInfo).every(
    (v) => v.trim() !== "",
  );

  return (
    <InputCardAccordion
      icon={<LuBriefcase />}
      title="Employment Information"
      subtitle="Update agent employment details"
      isComplete={isEmploymentInfoComplete}
    >
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gapX={2}
        gapY={3}
      >
        <ReadOnlyFieldTile label="Position" value={employmentInfo.position} />
        <ReadOnlyFieldTile label="Hire Date" value={employmentInfo.hireDate} />
        <ReadOnlyFieldTile
          label="Employee Status"
          value={employmentInfo.employeeStatus}
        />
        <ReadOnlyFieldTile label="Branch" value={employmentInfo.branch} />
        <ReadOnlyFieldTile
          label="Superior ID"
          value={employmentInfo.superiorId}
        />
        <FloatingLabelInput
          required
          label="SSS Number"
          value={employmentInfo.sssNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateEmploymentInfo({ sssNumber: e.target.value })
          }
        />
        <FloatingLabelInput
          required
          label="NBI Number"
          value={employmentInfo.nbiNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateEmploymentInfo({ nbiNumber: e.target.value })
          }
        />
        <FloatingLabelInput
          required
          label="TIN Number"
          value={employmentInfo.tinNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateEmploymentInfo({ tinNumber: e.target.value })
          }
        />
      </Grid>
    </InputCardAccordion>
  );
}

const AgentEditForm: React.FC<AgentEditFormProps> = ({
  selectedAgent = mockAgent,
  onCancel,
  onSubmitted,
  successLink,
  hideActions,
}) => {
  return (
    <Flex flexDir="column" gap={4}>
      <PersonalInfoSection selectedPerson={selectedAgent} entityLabel="agent" />
      <EmploymentInfoSection selectedAgent={selectedAgent} />
      <AddressListSection selectedPerson={selectedAgent} entityLabel="agent" />
      <ContactListSection selectedPerson={selectedAgent} entityLabel="agent" />

      {!hideActions && (
        <FormFooterActions
          entityLabel="agent"
          onCancel={onCancel}
          onSubmitted={onSubmitted}
          successLink={successLink}
        />
      )}
    </Flex>
  );
};

export default AgentEditForm;
