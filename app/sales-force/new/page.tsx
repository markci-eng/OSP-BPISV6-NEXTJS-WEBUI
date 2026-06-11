"use client";

import { Breadcrumb, H4, Small } from "st-peter-ui";
import { Box, Separator, Text, Flex, Strong } from "@chakra-ui/react";
import { LuUser, LuNotebook, LuBuilding2, LuFileText } from "react-icons/lu";
import AgentEmploymentForm from "@/components/saleforce/forms/agent-employment-form";
import AgentContactForm from "@/components/saleforce/forms/agent-contact-form";
import AgentAddressForm from "@/components/saleforce/forms/agent-address-form";
import AgentPersonalInfoForm from "@/components/saleforce/forms/agent-personal-info-form";
import AgentSummary from "@/components/saleforce/pages/agent-summary";
import Page from "@/components/layout/page/Page";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import Card from "@/components/cards/Card";
import { useState } from "react";
import FormSteps from "@/components/FormSteps";

const steps = [
  {
    title: "Personal Info",
    icon: LuUser,
    content: (
      <AgentPersonalInfoForm
        lastName="Doe"
        firstName="John"
        middleName="M"
        suffix="Jr."
        dateOfBirth="September 9, 1998"
        placeOfBirth="Lopez, Quezon"
        civilStatus="Single"
        gender="Male"
        nationality="Filipino"
        naturalizationDate="Jan 1, 2000"
      />
    ),
  },
  {
    title: "Contact & Address",
    icon: LuNotebook,
    content: (
      <Card.Root>
        <Card.MainContent>
          <FormTitle label="Contact and Address" />
          <Caption>Please fill out the following details.</Caption>
          <Separator
            my={{
              base: 2,
            }}
          />

          <Flex
            flexDir={"column"}
            gap={4}
            paddingX={{
              base: 1,
              md: 2,
            }}
          >
            <AgentContactForm
              email="john.doe@example.com"
              mobileNumber="09123456789"
              landlineNumber="021234567"
            />

            <AgentAddressForm
              lotNumber="Lot 123"
              street="Main Street"
              barangay="Barangay 1"
              district="District 1"
              city="City Name"
              province="Province Name"
              zipCode="1234"
            />
          </Flex>
        </Card.MainContent>
      </Card.Root>
    ),
  },
  {
    title: "Employment",
    icon: LuBuilding2,
    content: (
      <AgentEmploymentForm
        employer="St. Peter Life Plan Inc."
        position="SA2"
        hiredate="Feb 19, 2025"
        employmentStatus="Active"
        nbiNumber="NBI123456"
        tinNumber="TIN123456"
        sssNumber="SSS123456"
      />
    ),
  },
  {
    title: "Summary",
    icon: LuFileText,
    content: <AgentSummary />,
  },
];

export const CreateSalesForcePage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <>
      <Page.Root
        title="New Sales Agent"
        description="Please fill out the following details."
      >
        <Page.MainContent>
          <Box mt={"-30px"}>
            <FormSteps
              stepsData={steps}
              title=""
              description=""
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </Box>
        </Page.MainContent>
      </Page.Root>
    </>
  );
};

export default CreateSalesForcePage;
