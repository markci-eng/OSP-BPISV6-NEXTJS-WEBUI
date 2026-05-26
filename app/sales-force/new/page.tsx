"use client";

import { Separator, Flex } from "@chakra-ui/react";
import { LuUser, LuNotebook, LuBuilding2, LuFileText } from "react-icons/lu";
import AgentEmploymentForm from "@/components/saleforce/forms/agent-employment-form";
import AgentContactForm from "@/components/saleforce/forms/agent-contact-form";
import AgentAddressForm from "@/components/saleforce/forms/agent-address-form";
import AgentPersonalInfoForm from "@/components/saleforce/forms/agent-personal-info-form";
import AgentSummary from "@/components/saleforce/pages/agent-summary";
import { Page } from "@/components/page/page";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import { useRouter } from "next/navigation";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { CARD_LAYOUT } from "@/lib/theme/layout-tokens";

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
      <ProfileSectionCard>
        <Flex flexDir="column" gap={{ base: 4, md: 5 }}>
          <FormTitle label="Contact and Address" />
          <Caption value="Please fill out the following details." />
          <Separator
            my={{
              base: 2,
            }}
          />

          <Flex
            flexDir="column"
            gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
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
        </Flex>
      </ProfileSectionCard>
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
  const router = useRouter();

  const breadItem = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Sale Agent Management",
      href: "",
    },
    {
      label: "New Sales Agent",
    },
  ];
  return (
    <Page
      title="New Sales Agent"
      description="Please fill out the following details."
      breadcrumbItems={breadItem}
    >
      <Flex
        flexDir="column"
        gap={{ base: CARD_LAYOUT.gap.base, md: CARD_LAYOUT.gap.md }}
      >
        <FormStepper
          steps={steps}
          onSubmit={() => {
            router.push("/printing");
          }}
        />
      </Flex>
    </Page>
  );
};

export default CreateSalesForcePage;
