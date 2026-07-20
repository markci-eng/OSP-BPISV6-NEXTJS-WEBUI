"use client";

import { Flex, Grid } from "@chakra-ui/react";
import { LuBuilding2, LuCreditCard } from "react-icons/lu";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { AiField } from "../../../../../../components/inputs/AiField";

export function EmploymentStep() {
  return (
    <Flex flexDir="column" gap={3}>
      <InputCardAccordion
        icon={<LuBuilding2 size={16} />}
        title="Employment Details"
        subtitle="Employer and position information"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="employer" label="Employer" />
          <AiField fieldKey="position" label="Position" />
          <AiField fieldKey="hireDate" label="Hire Date" />
          <AiField fieldKey="employmentStatus" label="Employment Status" />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuCreditCard size={16} />}
        title="Government IDs"
        subtitle="NBI, TIN, and SSS numbers"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="nbiNumber" label="NBI Number" />
          <AiField fieldKey="tinNumber" label="TIN Number" />
          <AiField fieldKey="sssNumber" label="SSS Number" />
        </Grid>
      </InputCardAccordion>
    </Flex>
  );
}
