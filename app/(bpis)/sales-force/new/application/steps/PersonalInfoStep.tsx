"use client";

import { Flex, Grid } from "@chakra-ui/react";
import { LuUser, LuCalendar, LuNotebook, LuIdCard } from "react-icons/lu";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { AiField } from "../../../../../../components/inputs/AiField";

export function PersonalInfoStep() {
  return (
    <Flex flexDir="column" gap={3}>
      <InputCardAccordion
        icon={<LuUser size={16} />}
        title="Full Name"
        subtitle="Last, First, Middle, Suffix"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="lastName" label="Last Name" />
          <AiField fieldKey="firstName" label="First Name" />
          <AiField fieldKey="middleName" label="Middle Name" />
          <AiField fieldKey="suffix" label="Suffix" />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuCalendar size={16} />}
        title="Birth Information"
        subtitle="Date and place of birth"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="dateOfBirth" label="Date of Birth" type="date" />
          <AiField fieldKey="placeOfBirth" label="Place of Birth" />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuNotebook size={16} />}
        title="Demographic Information"
        subtitle="Sex, civil status, and nationality"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField
            fieldKey="sex"
            label="Sex"
            type="select"
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
          />
          <AiField
            fieldKey="civilStatus"
            label="Civil Status"
            type="select"
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Widowed", label: "Widowed" },
              { value: "Separated", label: "Legally Separated" },
              { value: "Annulled", label: "Annulled" },
            ]}
          />
          <AiField fieldKey="nationality" label="Nationality" />
          <AiField
            fieldKey="naturalizationDate"
            label="Naturalization Date"
            type="date"
          />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuIdCard size={16} />}
        title="Identification Document"
        subtitle="Read from your uploaded valid ID"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="idType" label="ID Type" />
          <AiField fieldKey="idNumber" label="ID Number" />
          <AiField fieldKey="issueDate" label="Issue Date" type="date" />
          <AiField fieldKey="expiryDate" label="Expiry Date" type="date" />
        </Grid>
      </InputCardAccordion>
    </Flex>
  );
}
