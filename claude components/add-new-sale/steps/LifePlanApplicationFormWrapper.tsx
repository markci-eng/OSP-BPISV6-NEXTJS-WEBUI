"use client";

import LifePlanApplication1 from "./LifePlanApplication1";
import LifePlanApplication2 from "./LifePlanApplication2";
import LifePlanApplication3 from "./LifePlanApplication3";
import { Box, Flex, Icon, VStack } from "@chakra-ui/react";
import { FaRegAddressCard, FaRegUser } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";
import { useCallback, useEffect, useState } from "react";
import {
  IAddress,
  IApplicationData,
  IEmployment,
  IPersonalInfo,
} from "../planholder";
// import {
//   createEmptyApplicationData,
//   loadApplicationDataFromLocalStorage,
//   saveApplicationDataToLocalStorage,
// } from "@/lib/utils/applicationDataFactory";
import { STANDARD_SPACING } from "@/lib/theme/standard-design-tokens";
import { TertiarySmButton } from "st-peter-ui";
import InfoCard from "@/claude components/info-card/info-card";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";

const hasText = (value: unknown) => String(value ?? "").trim() !== "";

const isPersonalComplete = (p?: IPersonalInfo) =>
  !!p &&
  [
    p.idType,
    p.idNumber,
    p.lastName,
    p.firstName,
    p.birthDate,
    p.gender,
    p.civilStatus,
    p.nationality,
    p.mobileNumber,
    p.emailAddress,
    p.mailingAddress,
  ].every(hasText) &&
  Number(p.height) > 0 &&
  Number(p.weight) > 0;

const isAddressComplete = (a?: IAddress) =>
  !!a &&
  [a.province, a.city, a.district, a.barangay, a.street, a.lot].every(hasText);

const isEmploymentComplete = (e?: IEmployment) =>
  !!e &&
  [
    e.occupation,
    e.employerName,
    e.employmentStatus,
    e.officeAddress,
    e.TIN,
    e.SSS,
    e.sourceOfIncome,
  ].every(hasText);

const LifePlanApplicationFormWrapper = ({
  openSection,
  openSectionKey,
  onValidChange,
}: {
  openSection?: string;
  openSectionKey?: number;
  onValidChange?: (valid: boolean) => void;
}) => {
  // const [applicationData, setApplicationData] = useState<IApplicationData>(
  //   createEmptyApplicationData,
  // );
  const [hydrated, setHydrated] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["personal"]);

  // useEffect(() => {
  //   const timeoutId = window.setTimeout(() => {
  //     const saved = loadApplicationDataFromLocalStorage();
  //     if (saved) setApplicationData(saved);
  //     setHydrated(true);
  //   }, 0);

  //   return () => window.clearTimeout(timeoutId);
  // }, []);

  // useEffect(() => {
  //   if (!hydrated) return;
  //   saveApplicationDataToLocalStorage(applicationData);
  // }, [applicationData, hydrated]);

  // const isComplete =
  //   isPersonalComplete(applicationData.personalInfo) &&
  //   isAddressComplete(applicationData.address);

  // useEffect(() => {
  //   onValidChange?.(isComplete);
  // }, [isComplete, onValidChange]);

  useEffect(() => {
    if (!openSection) return;

    const timer = window.setTimeout(() => {
      setOpenSections((prev) =>
        prev.includes(openSection) ? prev : [...prev, openSection],
      );
      document
        .getElementById(`app-section-${openSection}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [openSection, openSectionKey]);

  // const handlePersonalInfoUpdate = useCallback(
  //   (personalInfo: IPersonalInfo) => {
  //     setApplicationData((prev) => ({
  //       ...prev,
  //       personalInfo,
  //     }));
  //   },
  //   [],
  // );

  // const handleAddressUpdate = useCallback((address: IAddress) => {
  //   setApplicationData((prev) => ({
  //     ...prev,
  //     address,
  //   }));
  // }, []);

  // const handleEmploymentUpdate = useCallback((employment: IEmployment) => {
  //   setApplicationData((prev) => ({
  //     ...prev,
  //     employment,
  //   }));
  // }, []);

  const sections = [
    {
      icon: FaRegUser,
      label: "Personal Info",
      description: "Identification and full name",
      value: "personal",
      // complete: isPersonalComplete(applicationData.personalInfo),
      page: (
        <LifePlanApplication1
        // initialData={applicationData.personalInfo}
        // onUpdate={handlePersonalInfoUpdate}
        />
      ),
    },
    {
      icon: FaRegAddressCard,
      label: "Address",
      description: "Where you currently live",
      value: "address",
      // complete: isAddressComplete(applicationData.address),
      page: <LifePlanApplication2 />,
    },
    {
      icon: IoIosInformationCircleOutline,
      label: "Employment",
      description: "Work and income details",
      value: "employment",
      // complete: isEmploymentComplete(applicationData.employment),
      page: (
        <LifePlanApplication3
        // initialData={applicationData.employment}
        // onUpdate={handleEmploymentUpdate}
        />
      ),
    },
  ];

  const expandAll = () => setOpenSections(sections.map((s) => s.value));
  const collapseAll = () => setOpenSections([]);
  const toggleSection = (value: string) => {
    setOpenSections((prev) =>
      prev.includes(value)
        ? prev.filter((sectionValue) => sectionValue !== value)
        : [...prev, value],
    );
  };

  return (
    <Box w="full">
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={STANDARD_SPACING.sm}
        mb={STANDARD_SPACING.sm}
      >
        <Flex direction="column" gap={STANDARD_SPACING.xs}>
          <InfoCard>
            Sections below are expandable and collapsible. Use them to focus
            only on relevant details.
          </InfoCard>
          <Flex gap={STANDARD_SPACING.xs} justify="flex-end">
            <TertiarySmButton onClick={expandAll}>
              <LuChevronsDown size={14} />
              Expand All
            </TertiarySmButton>
            <TertiarySmButton onClick={collapseAll}>
              <LuChevronsUp size={14} />
              Collapse All
            </TertiarySmButton>
          </Flex>
        </Flex>
      </Flex>

      <VStack align="stretch" gap={2}>
        {sections.map((section) => (
          <Box
            key={section.value}
            id={`app-section-${section.value}`}
            scrollMarginTop="80px"
          >
            <InputCardAccordion
              icon={<Icon as={section.icon} boxSize="18px" />}
              title={section.label}
              subtitle={section.description}
              isOpen={openSections.includes(section.value)}
              onToggle={() => toggleSection(section.value)}
              // isComplete={section.complete}
            >
              {hydrated ? section.page : null}
            </InputCardAccordion>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default LifePlanApplicationFormWrapper;
