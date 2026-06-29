import { OSPBadge } from "@/components/common/badge/badge";
import InfoItem from "@/components/common/info-item/info-item";
import {
  Avatar,
  Box,
  Button,
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
  VStack,
} from "@chakra-ui/react";
import { SetStateAction, useState, Dispatch, useEffect } from "react";
import { IconBaseProps, IconType } from "react-icons";
import { FaRegFileAlt, FaTrash } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { FiFileText } from "react-icons/fi";
import { GiMartyrMemorial } from "react-icons/gi";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdPersonAdd } from "react-icons/io";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { LuSearch, LuUsersRound } from "react-icons/lu";
import { RiArrowDownSLine } from "react-icons/ri";
import { Body, Small } from "st-peter-ui";
import { StatementOfAccount } from "../ph-statement-of-account";
import { PlanDetailType, PlanholdersProps } from "../planholders.types";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { MdHealthAndSafety } from "react-icons/md";
import { PlanDetailsData } from "@/app/(bpis)/plan-management/data/plan-details.data";

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

export function PhListOfPlans() {
  const [selectedTab, setSelectedTab] = useState<string | null>("plan-details");
  const [selectedLpa, setSelectedLpa] = useState<string>("L25053212I");

  const planDetails = PlanDetailsData.find(
    (plan) => plan.lpaNumber === selectedLpa,
  );

  return (
    <Box width={"full"} p={5} boxShadow={"sm"} borderRadius={"md"}>
      <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
        List of Plans (2)
      </Strong>
      <Separator mt={2} mb={5} />
      <Grid templateColumns={"repeat(4, 1fr)"} gap={2}>
        <GridItem colSpan={1}>
          <InputGroup startElement={<LuSearch />}>
            <Input placeholder="LPA Number" />
          </InputGroup>
          <Separator my={3} />
          <Flex direction={"column"} gap={2}>
            <Flex
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
              onClick={() => setSelectedLpa("L25053212I")}
              bg={
                selectedLpa === "L25053212I"
                  ? "var(--chakra-colors-primary-disabled)/30"
                  : "white"
              }
            >
              <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />
              <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                <Strong>L25053168I</Strong>
                <Flex gap={2}>
                  <OSPBadge type="success">ACTIVE</OSPBadge>
                  <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                </Flex>
              </VStack>
            </Flex>
            <Flex
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
              onClick={() => setSelectedLpa("L25053213I")}
              bg={
                selectedLpa === "L25053213I"
                  ? "var(--chakra-colors-primary-disabled)/30"
                  : "white"
              }
            >
              <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />
              <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                <Strong>L25053169I</Strong>
                <Flex gap={2}>
                  <OSPBadge type="danger">LAPSED</OSPBadge>
                  <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                </Flex>
              </VStack>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={3}>
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
                <InfoItem label="LPA Number" value={selectedLpa} />
                <InfoItem
                  label="Account Status"
                  value={planDetails?.accountStatus ?? "ACTIVE"}
                />
                <InfoItem
                  label="Termination Status"
                  value={planDetails?.terminationStatus ?? "NOT YET TERMINATED"}
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
                  value={"₱ " + planDetails?.installmentAmount.toLocaleString()}
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
                <InfoItem label="Branch" value={planDetails?.branch ?? "N/A"} />
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
            </Tabs.Content>
            <Tabs.Content value="beneficiaries" px={2}>
              <Strong>Beneficiaries</Strong>
              <Box width={"full"}>
                <Flex
                  align={"center"}
                  justify={"justify-start"}
                  width={"full"}
                  borderRadius={"md"}
                  boxShadow={"sm"}
                  p={4}
                  gap={4}
                >
                  {
                    <FaRegFileAlt
                      size={25}
                      color="var(--chakra-colors-primary)"
                    />
                  }
                  <VStack gap={1} align="start" minW={0}>
                    <Small color="gray.500">{"LPA Number"}</Small>
                    <Body color={"gray.700"} fontWeight={"semibold"}>
                      {"L25053168I"}
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
              <StatementOfAccount />
            </Tabs.Content>
            <Tabs.Content value="health-declaration">
              <Strong>Health Declaration</Strong>
            </Tabs.Content>
            <Tabs.Content value="loan">
              <Strong>Loan</Strong>
            </Tabs.Content>
            <Tabs.Content value="service">
              <Strong>Service</Strong>
            </Tabs.Content>
          </Tabs.Root>
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
