import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PlanDetailType } from "../planholder-profile-page";
import {
  Avatar,
  Box,
  Button,
  CheckboxCheckedChangeDetails,
  Collapsible,
  EmptyState,
  Flex,
  Grid,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Popover,
  Portal,
  Separator,
  Strong,
  Tabs,
  Textarea,
  Timeline,
  VStack,
} from "@chakra-ui/react";
import { LuArrowDown, LuFile, LuSearch, LuUsersRound } from "react-icons/lu";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaRegFileAlt, FaTrash, FaUser } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { HiOutlinePencilAlt, HiRefresh } from "react-icons/hi";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { IoMdPersonAdd } from "react-icons/io";
import {
  Small,
  Body,
  PrimarySmButton,
  PrimarySmFlexButton,
  PrimaryMdButton,
  H4,
  Checkbox,
} from "st-peter-ui";
import { StatementOfAccount } from "./ph-statement-of-account";
import InfoItem from "@/components/common/info-item/info-item";
import { IconType } from "react-icons";
import { GiMartyrMemorial } from "react-icons/gi";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { MdHealthAndSafety, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiArrowDownSLine, RiHistoryFill } from "react-icons/ri";
import { IoChevronDown } from "react-icons/io5";

export function PhListOfPlansMobile({ plans }: { plans: PlanDetailType[] }) {
  const [selectedTab, setSelectedTab] = useState<string | null>("plan-details");
  const [searchVal, setSearchVal] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<PlanDetailType>(
    plans.find((plan) => plan.lpaNumber === plans[0].lpaNumber)!,
  );
  const [filteredPlans, setFilteredPlans] = useState<PlanDetailType[]>(plans);

  useEffect(() => {
    setFilteredPlans(
      plans.filter((e) => e.lpaNumber.toLocaleLowerCase().includes(searchVal)),
    );
  }, [searchVal]);

  return (
    <Box width="full" minW={0} p={5} boxShadow="sm" borderRadius="md">
      <Strong fontSize="md" color="var(--chakra-colors-primary)">
        List of Plans (2)
      </Strong>

      <Separator mt={2} mb={5} />

      {/* <InputGroup startElement={<LuSearch />}>
        <Input
          placeholder="LPA Number"
          value={searchVal}
          onChange={(e) => setSearchVal(e.currentTarget.value)}
        />
      </InputGroup>

      <Separator my={3} />

      <Flex gap={2} overflowX="auto" p={2} minW={0}>
        {filteredPlans.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <LuFile />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No LPA Found!</EmptyState.Title>
                <EmptyState.Description>
                  Search a valid LPA Number
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : (
          filteredPlans.map((plan) => (
            <Flex
              key={plan.lpaNumber}
              align="center"
              justify="flex-start"
              borderRadius="md"
              cursor="pointer"
              boxShadow="sm"
              p={4}
              gap={4}
              flexShrink={0} // 👈 important for horizontal scroll
              _hover={{
                bg: "var(--chakra-colors-primary-disabled)/40",
              }}
              onClick={() => setPlanDetails(plan)}
              bg={
                planDetails.lpaNumber === plan.lpaNumber
                  ? "var(--chakra-colors-primary-disabled)/30"
                  : "white"
              }
            >
              <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />

              <VStack gap={1} align="start" minW={0}>
                <Strong>{plan.lpaNumber}</Strong>

                <Flex gap={2}>
                  <OSPBadge
                    type={
                      plan.accountStatus === "LAPSED" ? "warning" : "success"
                    }
                  >
                    {plan.accountStatus}
                  </OSPBadge>
                </Flex>
              </VStack>
            </Flex>
          ))
        )}
      </Flex> */}

      <Popover.Root
        positioning={{ offset: { crossAxis: 0, mainAxis: 5 }, sameWidth: true }}
      >
        <Popover.Trigger asChild>
          <Flex
            justify={"space-between"}
            my={3}
            key={planDetails.lpaNumber}
            align={"center"}
            width={"full"}
            borderRadius={"md"}
            cursor={"pointer"}
            boxShadow={"sm"}
            p={4}
            gap={4}
            _hover={{
              bg: "var(--chakra-colors-primary-disabled)/40",
            }}
          >
            <Flex align={"center"} justify={"justify-start"}>
              <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />
              <VStack gap={1} mx={2} align="start" minW={0} cursor={"pointer"}>
                <Strong>{planDetails.lpaNumber}</Strong>
                <Flex gap={2}>
                  <OSPBadge
                    type={
                      planDetails.accountStatus === "LAPSED"
                        ? "warning"
                        : "success"
                    }
                  >
                    {planDetails.accountStatus}
                  </OSPBadge>
                  <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                </Flex>
              </VStack>
            </Flex>
            <IoChevronDown />
          </Flex>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content width={"full"}>
              <Popover.Body width={"full"}>
                <InputGroup startElement={<LuSearch />}>
                  <Input
                    placeholder="LPA Number"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.currentTarget.value)}
                  />
                </InputGroup>
                <Separator my={3} />
                <Flex direction={"column"} gap={2}>
                  {filteredPlans.map((plan) => (
                    <Flex
                      key={plan.lpaNumber}
                      align={"center"}
                      justify={"justify-start"}
                      width={"full"}
                      borderRadius={"md"}
                      cursor={"pointer"}
                      boxShadow={"sm"}
                      p={4}
                      gap={4}
                      _hover={{
                        bg: "var(--chakra-colors-primary-disabled)/40",
                      }}
                      onClick={() => setPlanDetails(plan)}
                      bg={
                        planDetails.lpaNumber === plan.lpaNumber
                          ? "var(--chakra-colors-primary-disabled)/30"
                          : "white"
                      }
                    >
                      <FaRegFileAlt
                        size={25}
                        color="var(--chakra-colors-primary)"
                      />
                      <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                        <Strong>{plan.lpaNumber}</Strong>
                        <Flex gap={2}>
                          <OSPBadge
                            type={
                              plan.accountStatus === "LAPSED"
                                ? "warning"
                                : "success"
                            }
                          >
                            {plan.accountStatus}
                          </OSPBadge>
                          <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                        </Flex>
                      </VStack>
                    </Flex>
                  ))}
                </Flex>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {planDetails.accountStatus === "LAPSED" &&
        planDetails.terminationStatus === "NOT YET TERMINATED" && (
          <PrimarySmFlexButton
            onClick={() =>
              (window.location.href =
                "/plan-management/planholder/" +
                planDetails.lpaNumber +
                "/reinstatement")
            }
          >
            <HiRefresh /> Reinstate Plan
          </PrimarySmFlexButton>
        )}

      {planDetails.accountStatus != "LAPSED" &&
        planDetails.terminationStatus === "NOT YET TERMINATED" && (
          <PrimarySmFlexButton
            onClick={() =>
              (window.location.href =
                "/plan-management/planholder/" +
                planDetails.lpaNumber +
                "/transfer-of-rights")
            }
          >
            <HiRefresh /> Transfer Plan
          </PrimarySmFlexButton>
        )}
      <Tabs.Root
        mt={5}
        value={selectedTab}
        onValueChange={(e) => setSelectedTab(e.value)}
        variant="enclosed"
        defaultValue={"plan-details"}
        w={"full"}
      >
        <Tabs.List w={"full"}>
          <Tabs.Trigger
            value="plan-details"
            _selected={{
              fontWeight: "semibold",
              color: "var(--chakra-colors-primary)",
            }}
          >
            <FiFileText />
            {selectedTab === "plan-details" ? "Plan Details" : ""}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="beneficiaries"
            _selected={{
              fontWeight: "semibold",
              color: "var(--chakra-colors-primary)",
            }}
          >
            <LuUsersRound />
            {selectedTab === "beneficiaries" ? "Beneficiaries" : ""}
          </Tabs.Trigger>
          <Tabs.Trigger
            value="soa"
            _selected={{
              fontWeight: "semibold",
              color: "var(--chakra-colors-primary)",
            }}
          >
            <HiOutlineDocumentCurrencyDollar />
            {selectedTab === "soa" ? "Statement of Account" : ""}
          </Tabs.Trigger>
          <MenuTabs _setSelectedTab={setSelectedTab} />
        </Tabs.List>
        <Tabs.Content value="plan-details" px={2}>
          <Strong>Plan Details</Strong>
          <Flex direction={"column"} mt={5}>
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>LPA Number</Body>
              <Strong color={"gray.600"}>{planDetails.lpaNumber}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Account Status</Body>
              <Strong
                color={
                  planDetails.accountStatus === "LAPSED"
                    ? "orange.500"
                    : "green.600"
                }
              >
                {planDetails.accountStatus}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Termination Status</Body>
              <Strong
                color={
                  planDetails.terminationStatus === "NOT YET TERMINATED"
                    ? "green.600"
                    : "red.600"
                }
              >
                {planDetails.terminationStatus}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Plan</Body>
              <Strong color={"gray.600"}>{planDetails.planDescription}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Mode</Body>
              <Strong color={"gray.600"}>{planDetails.mode}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Term</Body>
              <Strong color={"gray.600"}>{planDetails.term} YEARS</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Plan Class</Body>
              <Strong color={"gray.600"}>{planDetails.planClass}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Plan Code</Body>
              <Strong color={"gray.600"}>{planDetails.planCode}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Contract Price</Body>
              <Strong color={"gray.600"}>
                {"₱ " + planDetails?.contractPrice.toLocaleString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Installment Amount</Body>
              <Strong color={"gray.600"}>
                {"₱ " + planDetails?.installmentAmount.toLocaleString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Total Amount Payable</Body>
              <Strong color={"gray.600"}>
                {"₱ " + planDetails?.totalAmountPayable.toLocaleString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Effectivity Date</Body>
              <Strong color={"gray.600"}>
                {planDetails.effectivityDate.toLocaleDateString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>New Effectivity Date</Body>
              <Strong color={"gray.600"}>
                {planDetails.newEffectivityDate.toLocaleDateString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Branch</Body>
              <Strong color={"gray.600"}>{planDetails.branch}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>COFP Number</Body>
              <Strong color={"gray.600"}>{planDetails.cfpNumber}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>COFP Date</Body>
              <Strong color={"gray.600"}>
                {planDetails.cfpDate?.toLocaleDateString()}
              </Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Sales Agent 1</Body>
              <Strong color={"gray.600"}>{planDetails.salesAgent1}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Sales Agent 2</Body>
              <Strong color={"gray.600"}>{planDetails.salesAgent2}</Strong>
            </Flex>
            <Separator my={3} />
            <Flex justify={"space-between"}>
              <Body color={"gray.600"}>Service Only</Body>
              <Strong color={"gray.600"}>
                {planDetails.isServiceOnly ? "YES" : "NO"}
              </Strong>
            </Flex>
            <Separator my={3} />
          </Flex>
          <Strong>Remarks</Strong>
          <Textarea
            height={"100px"}
            placeholder="Planholder Remarks"
            readOnly
            value={
              "NIP/MEMORIAL SERVICE ONLY;REINSTATED||LOPEZ BR. SOA BY:E.T SILVALA**flr FP-10/3/05CfpNo S05-005352 CfpDate 2005-12-22"
            }
          />
        </Tabs.Content>
        <Tabs.Content value="beneficiaries" px={2}>
          <Strong>Beneficiaries</Strong>
          <Box width={"full"} pt={3}>
            <Flex
              align={"center"}
              justify={"justify-start"}
              width={"full"}
              borderRadius={"md"}
              boxShadow={"sm"}
              p={4}
              gap={4}
            >
              {<FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />}
              <VStack gap={1} align="start" minW={0}>
                <Small color="gray.500">{"LPA Number"}</Small>
                <Body color={"gray.700"} fontWeight={"semibold"}>
                  {planDetails.lpaNumber}
                </Body>
              </VStack>
            </Flex>
            <Box
              my={3}
              w={"full"}
              borderRadius={"lg"}
              borderWidth={1}
              borderColor={"gray.300"}
              p={5}
            >
              <Flex align={"center"} gap={3} mb={3}>
                <Box
                  p={4}
                  borderRadius={"xl"}
                  bg={"var(--chakra-colors-primary-disabled)/30"}
                >
                  <FaUser color="var(--chakra-colors-primary)" size={25} />
                </Box>
                <Flex direction={"column"}>
                  <Strong>Principal Beneficiaries</Strong>
                  <Small>Receive benefits first</Small>
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Avatar.Root>
                    <Avatar.Fallback name="Juan Dela Cruz" />
                  </Avatar.Root>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "2fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <InfoItem label="Name" value={"JUAN DELA CRUZ"} />
                    <InfoItem label="Relationship" value={"SPOUSE"} />
                    <InfoItem label="Date of Birth" value={"1900-01-01"} />
                    <InfoItem
                      label="Contact Number"
                      value={"+63-912-345-6789"}
                    />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Avatar.Root>
                    <Avatar.Fallback name="Juan Dela Cruz" />
                  </Avatar.Root>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "2fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <InfoItem label="Name" value={"JUAN DELA CRUZ"} />
                    <InfoItem label="Relationship" value={"SPOUSE"} />
                    <InfoItem label="Date of Birth" value={"1900-01-01"} />
                    <InfoItem
                      label="Contact Number"
                      value={"+63-912-345-6789"}
                    />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"lg"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"center"}
                p={5}
                align={"center"}
              >
                <Box mx={2}>
                  <IoMdPersonAdd />
                </Box>
                Add Principal Beneficiary
              </Flex>
            </Box>
            <Box
              my={3}
              w={"full"}
              borderRadius={"lg"}
              borderWidth={1}
              borderColor={"gray.300"}
              p={5}
            >
              <Flex align={"center"} gap={3} mb={3}>
                <Box
                  p={4}
                  borderRadius={"xl"}
                  bg={"var(--chakra-colors-primary-disabled)/30"}
                >
                  <FaUser color="var(--chakra-colors-primary)" size={25} />
                </Box>
                <Flex direction={"column"}>
                  <Strong>Contingent Beneficiaries</Strong>
                  <Small>Receive benefits if principal is unavailable</Small>
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Avatar.Root>
                    <Avatar.Fallback name="Juan Dela Cruz" />
                  </Avatar.Root>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "2fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <InfoItem label="Name" value={"JUAN DELA CRUZ"} />
                    <InfoItem label="Relationship" value={"SPOUSE"} />
                    <InfoItem label="Date of Birth" value={"1900-01-01"} />
                    <InfoItem
                      label="Contact Number"
                      value={"+63-912-345-6789"}
                    />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Avatar.Root>
                    <Avatar.Fallback name="Juan Dela Cruz" />
                  </Avatar.Root>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "2fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <InfoItem label="Name" value={"JUAN DELA CRUZ"} />
                    <InfoItem label="Relationship" value={"SPOUSE"} />
                    <InfoItem label="Date of Birth" value={"1900-01-01"} />
                    <InfoItem
                      label="Contact Number"
                      value={"+63-912-345-6789"}
                    />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
              <Flex
                my={2}
                w={"full"}
                borderRadius={"lg"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"center"}
                p={5}
                align={"center"}
              >
                <Box mx={2}>
                  <IoMdPersonAdd />
                </Box>
                Add Contingent Beneficiary
              </Flex>
            </Box>
          </Box>
        </Tabs.Content>
        <Tabs.Content value="soa">
          <Strong>Statement of Account</Strong>
          <StatementOfAccount
            props={
              plans.find((lpa) => lpa.lpaNumber === planDetails.lpaNumber)
                ?.statementOfAccount!
            }
          />
        </Tabs.Content>
        <Tabs.Content value="ph-remarks">
          <Strong>Planholder Remarks</Strong>
          <Box width={"full"} mt={3} p={3} borderRadius={"md"} boxShadow={"sm"}>
            <Collapsible.Root>
              <Collapsible.Trigger paddingY="3" width={"full"}>
                <Flex justify={"space-between"} align={"center"} width={"full"}>
                  <Small fontWeight={"semibold"} color={"gray.600"}>
                    Search Remarks
                  </Small>
                  <MdOutlineKeyboardArrowDown />
                </Flex>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <InputGroup flex="1" startElement={<LuSearch />} mt={2}>
                  <Input placeholder="Search . . . " size={"sm"} />
                </InputGroup>
                <Flex gap={2} justify={"space-between"} maxW={"full"} mt={2}>
                  <InputGroup flex="1">
                    <Input size={"sm"} type="date" />
                  </InputGroup>
                  -
                  <InputGroup flex="1">
                    <Input size={"sm"} type="date" />
                  </InputGroup>
                </Flex>
              </Collapsible.Content>
            </Collapsible.Root>
          </Box>
          <Timeline.Root my={5} px={2} maxH={"500px"} overflowY={"auto"}>
            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator color={"var(--chakra-colors-primary)"} />
                <Timeline.Indicator
                  bg={"var(--chakra-colors-primary)"}
                ></Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title>
                  <Strong>Filed under FP-10/3/26</Strong>
                </Timeline.Title>
                <Timeline.Description>
                  2026-10-03 02:57:00 PM
                </Timeline.Description>
                <Small>Related to policy processing.</Small>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator color={"var(--chakra-colors-primary)"} />
                <Timeline.Indicator bg={"var(--chakra-colors-primary)"}>
                  {/* <LuCheck /> */}
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title textStyle="sm">
                  <Strong>CFP No: S05-005352 issued</Strong>
                </Timeline.Title>
                <Timeline.Description>
                  2025-12-22 09:23:03 AM
                </Timeline.Description>
                <Small>CFP Date recorded</Small>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator bg={"var(--chakra-colors-primary)"}>
                  {/* <LuPackage /> */}
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title textStyle="sm">
                  <Strong>NIP/Memorial Service Only</Strong>
                </Timeline.Title>
                <Timeline.Description>No specified date</Timeline.Description>
                <Small>Reinstated</Small>
              </Timeline.Content>
            </Timeline.Item>

            <Timeline.Item>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator bg={"var(--chakra-colors-primary)"}>
                  {/* <LuPackage /> */}
                </Timeline.Indicator>
              </Timeline.Connector>
              <Timeline.Content>
                <Timeline.Title textStyle="sm">
                  <Strong>
                    SOA processed by: <strong>E. T. Silvala</strong>
                  </Strong>
                </Timeline.Title>
                <Timeline.Description>No specified date</Timeline.Description>
                <Small>Branch: Lopez Branch</Small>
              </Timeline.Content>
            </Timeline.Item>
          </Timeline.Root>
        </Tabs.Content>
        <Tabs.Content value="health-declaration">
          <Strong>Health Declaration</Strong>

          <Body mt={3}>
            I hereby represent and declare to the best of my knowledge that at
            the time of purchase of my Life Plan:
          </Body>
          <VStack mt={3} align={"start"} gap={2}>
            <Box as="ul" listStyleType="circle" px={5}>
              <li>
                <Small>
                  I am between 18 years and 60 years old (not beyond my 60th
                  birthday)
                </Small>
              </li>
              <li>
                <Small>
                  I possess sound health and am able to perform the normal
                  activities in pursuit of my livelihood.
                </Small>
              </li>
              <li>
                <Small>
                  I have not consulted any physician for heart condition,
                  hypertension, cancer, diabetes, lungs, kidneys or intestinal
                  disorder, tuberculosis, or any other physical impairment nor
                  have I been confined in a hospital/clinic and received any
                  medical or surgical attention.
                </Small>
              </li>
              <li>
                <Small>
                  I understand and agree that I am INSURABLE based on the
                  above-stated representations.
                </Small>
              </li>
            </Box>
          </VStack>
        </Tabs.Content>
        <Tabs.Content value="loan">
          <Strong>Loan</Strong>
        </Tabs.Content>
        <Tabs.Content value="service">
          <Strong>Service</Strong>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

function MenuTabs({
  _setSelectedTab,
}: {
  _setSelectedTab: Dispatch<SetStateAction<string | null>>;
}) {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  function MenuItem({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon: IconType;
  }) {
    const Icon = icon;

    const handleClick = () => {
      setSelectedTab(value);
      _setSelectedTab(value);
    };

    return (
      <Menu.Item
        value={value}
        onClick={handleClick}
        p={3}
        boxShadow={selectedTab === value ? "sm" : "none"}
        fontWeight={selectedTab === value ? "semibold" : "regular"}
        color={selectedTab === value ? "var(--chakra-colors-primary)" : ""}
      >
        <Icon /> {label}
      </Menu.Item>
    );
  }

  return (
    <Flex gap={1}>
      {selectedTab === "ph-remarks" && (
        <Tabs.Trigger
          value="ph-remarks"
          _selected={{
            fontWeight: "semibold",
            color: "var(--chakra-colors-primary)",
          }}
        >
          <RiHistoryFill />
        </Tabs.Trigger>
      )}
      {selectedTab === "health-declaration" && (
        <Tabs.Trigger
          value="health-declaration"
          _selected={{
            fontWeight: "semibold",
            color: "var(--chakra-colors-primary)",
          }}
        >
          <MdHealthAndSafety />
          Health Declaration
        </Tabs.Trigger>
      )}
      {selectedTab === "loan" && (
        <Tabs.Trigger
          value="loan"
          _selected={{
            fontWeight: "semibold",
            color: "var(--chakra-colors-primary)",
          }}
        >
          <LiaHandHoldingUsdSolid />
          Loan
        </Tabs.Trigger>
      )}
      {selectedTab === "service" && (
        <Tabs.Trigger
          value="service"
          _selected={{
            fontWeight: "semibold",
            color: "var(--chakra-colors-primary)",
          }}
        >
          <GiMartyrMemorial />
          Service
        </Tabs.Trigger>
      )}

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton mx={2} bg={"transparent"} color={"gray.500"}>
            <RiArrowDownSLine />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {/* <MenuItem
                label={"PH Remarks"}
                value={"ph-remarks"}
                icon={RiHistoryFill}
              /> */}
              <MenuItem
                label={"Health Declaration"}
                value={"health-declaration"}
                icon={MdHealthAndSafety}
              />
              <MenuItem
                label={"Loan"}
                value={"loan"}
                icon={LiaHandHoldingUsdSolid}
              />
              <MenuItem
                label={"Service"}
                value={"service"}
                icon={GiMartyrMemorial}
              />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  );
}
