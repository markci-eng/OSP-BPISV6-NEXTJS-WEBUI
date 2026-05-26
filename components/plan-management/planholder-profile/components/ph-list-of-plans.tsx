import { OSPBadge } from "@/components/common/badge/badge";
import InfoItem from "@/components/common/info-item/info-item";
import {
  Avatar,
  Box,
  Button,
  CheckboxCheckedChangeDetails,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Portal,
  Separator,
  Strong,
  Tabs,
  Textarea,
  Timeline,
  VStack,
} from "@chakra-ui/react";
import { SetStateAction, useState, Dispatch, useEffect } from "react";
import { IconType } from "react-icons";
import { FaRegFileAlt, FaTrash } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { FiFileText } from "react-icons/fi";
import { GiMartyrMemorial } from "react-icons/gi";
import { HiOutlinePencilAlt, HiRefresh } from "react-icons/hi";
import { IoMdPersonAdd } from "react-icons/io";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { LuSearch, LuUsersRound } from "react-icons/lu";
import { RiArrowDownSLine, RiHistoryFill } from "react-icons/ri";
import {
  Body,
  Checkbox,
  H4,
  InputFloatingLabel,
  PrimaryMdButton,
  Small,
} from "st-peter-ui";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { MdHealthAndSafety } from "react-icons/md";
import { PlanDetailsData } from "@/app/plan-management/data/plan-details.data";
import { PlanDetailType } from "../planholder-profile-page";
import { StatementOfAccount } from "./ph-statement-of-account";

export interface PhBeneficiaries {
  lpaNumber: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  contactNumber: string;
  type: "principal" | "contingent";
}

export interface PhPlanDetailsProps {
  planDetails: PlanDetailType;
  beneficiaries: PhBeneficiaries[];
}

export function PhListOfPlans({ plans }: { plans: PlanDetailType[] }) {
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
    <Box width={"full"} p={5} boxShadow={"sm"} borderRadius={"md"}>
      <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
        List of Plans (2)
      </Strong>
      <Separator mt={2} mb={5} />
      <Grid templateColumns={"repeat(4, 1fr)"} gap={2}>
        <GridItem colSpan={1}>
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
                <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />
                <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                  <Strong>{plan.lpaNumber}</Strong>
                  <Flex gap={2}>
                    <OSPBadge
                      type={
                        plan.accountStatus === "LAPSED" ? "warning" : "success"
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
        </GridItem>
        <GridItem colSpan={3}>
          <Box boxShadow={"sm"} p={3} borderRadius={"sm"}>
            <Flex align={"center"} justify={"space-between"}>
              <Flex gap={2} my={2} align={"center"}>
                <FaRegFileAlt size={40} color="var(--chakra-colors-primary)" />
                <Flex direction={"column"}>
                  <Small mb={-1}>LPA Number</Small>
                  <H4>{planDetails.lpaNumber}</H4>
                  <Flex gap={2} mt={2}>
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
                </Flex>
              </Flex>
              {planDetails.accountStatus === "LAPSED" &&
                planDetails.terminationStatus === "NOT YET TERMINATED" && (
                  <PrimaryMdButton
                    onClick={() =>
                      (window.location.href =
                        "/plan-management/planholder/" +
                        planDetails.lpaNumber +
                        "/reinstatement")
                    }
                  >
                    <HiRefresh /> Reinstate Plan
                  </PrimaryMdButton>
                )}

              {planDetails.accountStatus != "LAPSED" &&
                planDetails.terminationStatus === "NOT YET TERMINATED" && (
                  <PrimaryMdButton
                    onClick={() =>
                      (window.location.href =
                        "/plan-management/planholder/" +
                        planDetails.lpaNumber +
                        "/transfer-of-rights")
                    }
                  >
                    <HiRefresh /> Transfer Plan
                  </PrimaryMdButton>
                )}
            </Flex>
            <Separator my={2} />
            <Tabs.Root
              value={selectedTab}
              onValueChange={(e) => setSelectedTab(e.value)}
              variant="enclosed"
              defaultValue={"plan-details"}
              w={"full"}
            >
              <Tabs.List>
                <Tabs.Trigger
                  value="plan-details"
                  _selected={{
                    fontWeight: "semibold",
                    color: "var(--chakra-colors-primary)",
                  }}
                >
                  <FiFileText /> Plan Details
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="beneficiaries"
                  _selected={{
                    fontWeight: "semibold",
                    color: "var(--chakra-colors-primary)",
                  }}
                >
                  <LuUsersRound />
                  Beneficiaries
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="soa"
                  _selected={{
                    fontWeight: "semibold",
                    color: "var(--chakra-colors-primary)",
                  }}
                >
                  <HiOutlineDocumentCurrencyDollar />
                  Statement of Account
                </Tabs.Trigger>
                <MenuTabs _setSelectedTab={setSelectedTab} />
              </Tabs.List>
              <Tabs.Content value="plan-details" px={2}>
                <Strong>Plan Details</Strong>
                <Grid
                  py={3}
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(3, 1fr)",
                  }}
                  gap={4}
                >
                  <InfoItem label="LPA Number" value={planDetails.lpaNumber} />
                  <InfoItem
                    label="Account Status"
                    value={planDetails?.accountStatus ?? "N/A"}
                    color={
                      planDetails.accountStatus === "LAPSED"
                        ? "orange.500"
                        : "green.500"
                    }
                  />
                  <InfoItem
                    label="Termination Status"
                    value={planDetails?.terminationStatus ?? "N/A"}
                    color={
                      planDetails.terminationStatus === "NOT YET TERMINATED"
                        ? "green.500"
                        : "red.500"
                    }
                  />
                  <InfoItem
                    label="Plan"
                    value={planDetails?.planDescription ?? "N/A"}
                  />
                  <InfoItem label="Mode" value={planDetails?.mode ?? "N/A"} />
                  <InfoItem
                    label="Term"
                    value={(planDetails?.term ?? "0") + " YEARS"}
                  />
                  <InfoItem
                    label="Plan Class"
                    value={planDetails?.planClass ?? "N/A"}
                  />
                  <InfoItem
                    label="Account Class"
                    value={planDetails?.accountClass ?? "N/A"}
                  />
                  <InfoItem
                    label="Plan Code"
                    value={planDetails?.planCode ?? "N/A"}
                  />
                  <InfoItem
                    label="Contract Price"
                    value={"₱ " + planDetails?.contractPrice.toLocaleString()}
                  />
                  <InfoItem
                    label="Installment Amount"
                    value={
                      "₱ " + planDetails?.installmentAmount.toLocaleString()
                    }
                  />
                  <InfoItem
                    label="Total Amount Payable"
                    value={
                      "₱ " + planDetails?.totalAmountPayable.toLocaleString()
                    }
                  />
                  <InfoItem
                    label="Effectivity Date"
                    value={
                      planDetails?.effectivityDate.toLocaleDateString() ?? "N/A"
                    }
                  />
                  <InfoItem
                    label="New Effectivity Date"
                    value={
                      planDetails?.newEffectivityDate.toLocaleDateString() ??
                      "N/A"
                    }
                  />
                  <InfoItem
                    label="Branch"
                    value={planDetails?.branch ?? "N/A"}
                  />
                  <InfoItem
                    label="COFP Number"
                    value={planDetails?.cfpNumber ?? "N/A"}
                  />
                  <InfoItem
                    label="COFP Date"
                    value={planDetails?.cfpDate?.toLocaleDateString() ?? "N/A"}
                  />
                  <InfoItem
                    label="Service Only"
                    value={planDetails?.isServiceOnly ? "YES" : "NO"}
                  />
                  <InfoItem
                    label="Sales Agent"
                    value={planDetails?.salesAgent1 ?? "N/A"}
                  />
                  <InfoItem
                    label="Sales Agent 2"
                    value={planDetails?.salesAgent2 ?? "N/A"}
                  />
                </Grid>
                <Strong>Remarks</Strong>
                <Textarea
                  placeholder="Planholder Remarks"
                  readOnly
                  value={
                    "NIP/MEMORIAL SERVICE ONLY;REINSTATED||LOPEZ BR. SOA BY:E.T SILVALA**flr FP-10/3/05CfpNo S05-005352 CfpDate 2005-12-22"
                  }
                />
              </Tabs.Content>
              <Tabs.Content value="beneficiaries" px={2}>
                <Strong>Beneficiaries</Strong>
                <Box width={"full"}>
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
                        <FaUser
                          color="var(--chakra-colors-primary)"
                          size={25}
                        />
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
                          <InfoItem
                            label="Date of Birth"
                            value={"1900-01-01"}
                          />
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
                          <InfoItem
                            label="Date of Birth"
                            value={"1900-01-01"}
                          />
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
                        <FaUser
                          color="var(--chakra-colors-primary)"
                          size={25}
                        />
                      </Box>
                      <Flex direction={"column"}>
                        <Strong>Contingent Beneficiaries</Strong>
                        <Small>
                          Receive benefits if principal is unavailable
                        </Small>
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
                          <InfoItem
                            label="Date of Birth"
                            value={"1900-01-01"}
                          />
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
                          <InfoItem
                            label="Date of Birth"
                            value={"1900-01-01"}
                          />
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
                <Grid templateColumns={"repeat(2, 1fr)"} gap={3} my={3}>
                  <InputGroup flex="1" startElement={<LuSearch />}>
                    <Input placeholder="Search . . . " size={"sm"} />
                  </InputGroup>
                  <Flex gap={2} align={"center"} justify={"space-between"}>
                    <InputGroup flex="1" startElement={<LuSearch />}>
                      <Input size={"sm"} type="date" />
                    </InputGroup>
                    -
                    <InputGroup flex="1" startElement={<LuSearch />}>
                      <Input size={"sm"} type="date" />
                    </InputGroup>
                  </Flex>
                </Grid>
                <Timeline.Root my={5} px={2} maxH={"500px"} overflowY={"auto"}>
                  <Timeline.Item>
                    <Timeline.Connector>
                      <Timeline.Separator
                        color={"var(--chakra-colors-primary)"}
                      />
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
                      <Timeline.Separator
                        color={"var(--chakra-colors-primary)"}
                      />
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
                      <Timeline.Description>
                        No specified date
                      </Timeline.Description>
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
                      <Timeline.Description>
                        No specified date
                      </Timeline.Description>
                      <Small>Branch: Lopez Branch</Small>
                    </Timeline.Content>
                  </Timeline.Item>
                </Timeline.Root>
              </Tabs.Content>
              <Tabs.Content value="health-declaration">
                <Strong>Health Declaration</Strong>

                <Body mt={3}>
                  I hereby represent and declare to the best of my knowledge
                  that at the time of purchase of my Life Plan:
                </Body>
                <VStack mt={3} align={"start"} gap={2}>
                  <Box as="ul" listStyleType="circle" px={5}>
                    <li>
                      <Small>
                        I am between 18 years and 60 years old (not beyond my
                        60th birthday)
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
                        hypertension, cancer, diabetes, lungs, kidneys or
                        intestinal disorder, tuberculosis, or any other physical
                        impairment nor have I been confined in a hospital/clinic
                        and received any medical or surgical attention.
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
        </GridItem>
      </Grid>
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
          <RiHistoryFill /> PH Remarks
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
          <MdHealthAndSafety /> Health Declaration
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
          <LiaHandHoldingUsdSolid /> Loan
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
          <GiMartyrMemorial /> Service
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
