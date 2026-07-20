"use client";

import { Flex, Grid } from "@chakra-ui/react";
import { LuPhone, LuMapPin } from "react-icons/lu";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { AiField } from "../../../../../../components/inputs/AiField";

export function ContactAddressStep() {
  return (
    <Flex flexDir="column" gap={3}>
      <InputCardAccordion
        icon={<LuPhone size={16} />}
        title="Contact Information"
        subtitle="Email and phone numbers"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="email" label="Email" type="email" />
          <AiField fieldKey="mobileNumber" label="Mobile Number" type="tel" />
          <AiField
            fieldKey="landlineNumber"
            label="Landline Number"
            type="tel"
          />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuMapPin size={16} />}
        title="Address"
        subtitle="Residential address details"
        defaultOpen
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          <AiField fieldKey="street" label="Street" />
          <AiField fieldKey="barangay" label="Barangay" />
          <AiField fieldKey="district" label="District" />
          <AiField fieldKey="city" label="City" />
          <AiField fieldKey="province" label="Province" />
          <AiField fieldKey="zipCode" label="Zip Code" />
        </Grid>
      </InputCardAccordion>
    </Flex>
  );
}
