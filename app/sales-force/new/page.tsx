"use client";

import { useState } from "react";
import { Box, Flex, Grid } from "@chakra-ui/react";
import {
  LuUser,
  LuPhone,
  LuMapPin,
  LuBuilding2,
  LuFileText,
  LuCalendar,
  LuCreditCard,
  LuNotebook,
} from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import FormSteps from "@/claude components/FormSteps";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { InputFloatingLabel } from "st-peter-ui";
import AgentSummary from "@/components/saleforce/pages/agent-summary";

const PersonalInfoStep = () => (
  <Flex flexDir="column" gap={3}>
    <InputCardAccordion
      icon={<LuUser size={16} />}
      title="Full Name"
      subtitle="Last, First, Middle, Suffix"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Last Name" value="Doe" />
        <InputFloatingLabel label="First Name" value="John" />
        <InputFloatingLabel label="Middle Name" value="M" />
        <InputFloatingLabel label="Suffix" value="Jr." />
      </Grid>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuCalendar size={16} />}
      title="Birth Information"
      subtitle="Date and place of birth"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Date of Birth" value="September 9, 1998" />
        <InputFloatingLabel label="Place of Birth" value="Lopez, Quezon" />
      </Grid>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuNotebook size={16} />}
      title="Demographic Information"
      subtitle="Gender, civil status, and nationality"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Gender" value="Male" />
        <InputFloatingLabel label="Civil Status" value="Single" />
        <InputFloatingLabel label="Nationality" value="Filipino" />
        <InputFloatingLabel label="Naturalization Date" value="Jan 1, 2000" />
      </Grid>
    </InputCardAccordion>
  </Flex>
);

const ContactAddressStep = () => (
  <Flex flexDir="column" gap={3}>
    <InputCardAccordion
      icon={<LuPhone size={16} />}
      title="Contact Information"
      subtitle="Email and phone numbers"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Email" value="john.doe@example.com" />
        <InputFloatingLabel label="Mobile Number" value="09123456789" />
        <InputFloatingLabel label="Landline Number" value="021234567" />
      </Grid>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuMapPin size={16} />}
      title="Address"
      subtitle="Residential address details"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Lot/Bldg/Unit No." value="Lot 123" />
        <InputFloatingLabel label="Street" value="Main Street" />
        <InputFloatingLabel label="Barangay" value="Barangay 1" />
        <InputFloatingLabel label="District" value="District 1" />
        <InputFloatingLabel label="City" value="City Name" />
        <InputFloatingLabel label="Province" value="Province Name" />
        <InputFloatingLabel label="Zip Code" value="1234" />
      </Grid>
    </InputCardAccordion>
  </Flex>
);

const EmploymentStep = () => (
  <Flex flexDir="column" gap={3}>
    <InputCardAccordion
      icon={<LuBuilding2 size={16} />}
      title="Employment Details"
      subtitle="Employer and position information"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="Employer" value="St. Peter Life Plan Inc." />
        <InputFloatingLabel label="Position" value="SA2" />
        <InputFloatingLabel
          label="Hire Date"
          value="Feb 19, 2025"
          type="date"
        />
        <InputFloatingLabel label="Employment Status" value="Active" />
      </Grid>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuCreditCard size={16} />}
      title="Government IDs"
      subtitle="NBI, TIN, and SSS numbers"
      defaultOpen
    >
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
        <InputFloatingLabel label="NBI Number" value="NBI123456" />
        <InputFloatingLabel label="TIN Number" value="TIN123456" />
        <InputFloatingLabel label="SSS Number" value="SSS123456" />
      </Grid>
    </InputCardAccordion>
  </Flex>
);

const stepsData = [
  {
    title: "Personal Info",
    icon: LuUser,
    content: <PersonalInfoStep />,
  },
  {
    title: "Contact & Address",
    icon: LuPhone,
    content: <ContactAddressStep />,
  },
  {
    title: "Employment",
    icon: LuBuilding2,
    content: <EmploymentStep />,
  },
  {
    title: "Summary",
    icon: LuFileText,
    content: <AgentSummary />,
  },
];

export default function CreateSalesForcePage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Page.Root
      headerButton="menu"
      title="New Sales Agent"
      description="Complete all required sections to register a new sales agent."
    >
      <Page.MainContent>
        <FormSteps
          stepsData={stepsData}
          title=""
          description=""
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepsComplete={() => {}}
          submitButtonText="Create Agent"
        />
      </Page.MainContent>
    </Page.Root>
  );
}
