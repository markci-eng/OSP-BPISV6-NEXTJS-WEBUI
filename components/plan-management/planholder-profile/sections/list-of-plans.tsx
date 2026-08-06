import {
  Box,
  Carousel,
  CloseButton,
  Drawer,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Separator,
  Show,
  Text,
  useBreakpointValue,
  Strong,
} from "@chakra-ui/react";
import { OSPBadge } from "osp-ui-kit";
import { FaRegFileAlt } from "react-icons/fa";
import {
  LuBan,
  LuChevronLeft,
  LuChevronRight,
  LuIdCard,
  LuPrinter,
  LuSearch,
  LuShieldCheck,
  LuTrash2,
  LuUsersRound,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";

import { LPANumberButton } from "../components/buttons/lpa-button";
import { H4, Small } from "st-peter-ui";
import { FiFileText } from "react-icons/fi";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { MdHealthAndSafety } from "react-icons/md";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { GiMartyrMemorial } from "react-icons/gi";
import { PlanDetailsPage } from "../pages/plan-details";
import { useMessageDialog } from "osp-ui-kit";
import { Beneficiaries } from "../pages/beneficiaries";
import { StatementOfAccount } from "../pages/statement-of-accounts";
import { getPlanStatement } from "../data/plan-statement";
import { HealthDeclaration } from "../pages/health-declaration";
import AccountQuickActions, {
  QuickAction,
} from "../cards/account-quick-actions";
import {
  Card,
  EmptyStateCard,
  InfoCardAccordion,
  InfoCardSheet,
} from "osp-ui-kit";

export interface PhBeneficiaries {
  lpaNumber: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  contactNumber: string;
  type: "principal" | "contingent";
}

function PlanTabs({
  planDetails,
  planholderAddress,
}: {
  planDetails: PlanDetailType;
  planholderAddress?: string;
}) {
  const statement = getPlanStatement(planDetails);
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const InfoCard = isDesktop ? InfoCardAccordion : InfoCardSheet;

  return (
    <Flex direction="column" gap={2}>
      <InfoCard
        icon={<FiFileText size={16} />}
        title="Plan Details"
        subtitle="Coverage & premium info"
      >
        <PlanDetailsPage planDetails={planDetails} />
      </InfoCard>

      <InfoCard
        icon={<LuUsersRound size={16} />}
        title="Beneficiaries"
        subtitle="Named beneficiaries"
      >
        <Beneficiaries
          beneficiaries={[
            {
              personId: "PI10001",
              lpaNumber: "L25053226I",
              beneficiaryClass: "PRINCIPAL",
              lastName: "DELA ROSA",
              firstName: "ROLAND",
              middleInitial: "C",
              relationship: "SON",
              age: 23,
              address: "CALOOCAN CITY",
            },
          ]}
          planholderAddress={planholderAddress}
        />
      </InfoCard>

      <InfoCard
        icon={<HiOutlineDocumentCurrencyDollar size={16} />}
        title="Statement of Accounts"
        subtitle="Payment history & balance"
      >
        <StatementOfAccount
          props={{
            lpaNumber: planDetails.lpaNumber,
            dueDate: statement.nextDueDate,
            term: planDetails.term,
            mode: planDetails.mode,
            installmentNumber: statement.installmentsPaid,
            installmentAmount: planDetails.installmentAmount,
            totalAmountPayable: planDetails.totalAmountPayable,
            totalPayments: statement.totalPayments,
            balance: statement.balance,
            terminationValue: statement.terminationValue,
            paymentRecords: statement.paymentRecords,
          }}
        />
      </InfoCard>

      <InfoCard
        icon={<MdHealthAndSafety size={16} />}
        title="Health Declaration"
        subtitle="Medical disclosures"
      >
        <HealthDeclaration />
      </InfoCard>

      <InfoCard
        icon={<LiaHandHoldingUsdSolid size={16} />}
        title="Loan"
        subtitle="Loan records"
      >
        <EmptyStateCard
          title="No Record Found"
          description="Loan details displays here."
        />
      </InfoCard>

      <InfoCard
        icon={<GiMartyrMemorial size={16} />}
        title="Service"
        subtitle="Service records"
      >
        <EmptyStateCard
          title="No Record Found"
          description="Service Information displays here."
        />
      </InfoCard>

      <InfoCard
        icon={<FiFileText size={16} />}
        title="ROP History"
        subtitle="Return of premium history"
      >
        <EmptyStateCard
          title="No Record Found"
          description="ROP history displays here."
        />
      </InfoCard>

      <InfoCard
        icon={<LuUsersRound size={16} />}
        title="Transfer History"
        subtitle="Plan transfer records"
      >
        <EmptyStateCard
          title="No Record Found"
          description="Transfer history displays here."
        />
      </InfoCard>
    </Flex>
  );
}

export function ListOfPlans({
  plans,
  deletePlanFunction,
  personId,
  planholderAddress,
  selectedLpaNumber,
}: {
  plans: PlanDetailType[];
  deletePlanFunction?: (lpaNumber: string) => void;
  personId?: string;
  planholderAddress?: string;
  selectedLpaNumber?: string;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [searchVal, setSearchVal] = useState<string>("");
  const initialPlanIndex = Math.max(
    selectedLpaNumber
      ? plans.findIndex((p) => p.lpaNumber === selectedLpaNumber)
      : 0,
    0,
  );
  const [planDetails, setPlanDetails] = useState<PlanDetailType | null>(
    plans[initialPlanIndex] ?? null,
  );
  const [filteredPlans, setFilteredPlans] = useState<PlanDetailType[]>(plans);
  const [modalOpen, setModalOpen] = useState(false);

  const { messageBox } = useMessageDialog();

  useEffect(() => {
    setFilteredPlans(
      plans.filter((e) => e.lpaNumber.toLocaleLowerCase().includes(searchVal)),
    );
  }, [searchVal]);

  const resolvedActions: QuickAction[] = [
    {
      key: "reinstate-plan",
      label: planDetails?.accountStatus === "LAPSED" ? "Reinstate" : "Transfer",
      icon: FiFileText,
      onClick: () =>
        (window.location.href =
          "/plan-management/planholder/" +
          planDetails?.lpaNumber +
          (planDetails?.accountStatus === "LAPSED"
            ? "/reinstatement"
            : "/transfer-of-rights")),
    },
    {
      key: "print-soa",
      label: "Print SOA",
      icon: LuPrinter,
      onClick: () =>
        (window.location.href =
          "/plan-management/planholder/" +
          personId +
          "/soa?lpaNumber=" +
          encodeURIComponent(planDetails?.lpaNumber ?? "")),
    },
    {
      key: "phid",
      label: "PHID",
      icon: LuIdCard,
      onClick: () => {},
    },
    {
      key: "delete",
      label: "Delete",
      icon: LuTrash2,
      onClick: async () => {
        const confirmed = await messageBox({
          title: "Delete Plan",
          message:
            "Are you sure you want to delete this plan? (" +
            planDetails?.lpaNumber +
            ")",
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "confirmation",
        });
        if (confirmed) {
          deletePlanFunction?.(planDetails?.lpaNumber ?? "");
        }
      },
    },
  ];

  return (
    <Box my={{ base: 0, lg: 5 }}>
      {plans.length > 0 ? (
        <Grid templateColumns={"repeat(4, 1fr)"} gap={2}>
          {/* Plan list / carousel column */}
          <GridItem colSpan={isMobile ? 4 : 1}>
            <Show when={!isMobile}>
              <InputGroup startElement={<LuSearch />}>
                <Input
                  placeholder="Search LPA Number"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.currentTarget.value)}
                />
              </InputGroup>
              <Separator my={3} />
              <Flex direction={"column"} gap={2}>
                <Show when={filteredPlans.length === 0}>
                  <EmptyStateCard
                    title={"No Plans Found"}
                    description={"No Plans match your search criteria."}
                  />
                </Show>
                {filteredPlans.map((plan) => (
                  <LPANumberButton
                    key={plan.lpaNumber}
                    plan={plan}
                    isSelected={planDetails?.lpaNumber === plan.lpaNumber}
                    onClick={() => setPlanDetails(plan)}
                    personId={personId}
                  />
                ))}
              </Flex>
            </Show>

            <Show when={isMobile}>
              <Carousel.Root
                slideCount={plans.length}
                defaultPage={initialPlanIndex}
                onPageChange={(details) => {
                  setPlanDetails(plans[details.page]);
                }}
              >
                <Box position="relative" overflow="visible">
                  <Carousel.ItemGroup w="full">
                    {plans.map((plan, index) => (
                      <Carousel.Item
                        key={plan.lpaNumber}
                        index={index}
                        minW={0}
                      >
                        <LPANumberButton
                          plan={plan}
                          isSelected={true}
                          onClick={() => {
                            setPlanDetails(plan);
                            setModalOpen(true);
                          }}
                          personId={personId}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel.ItemGroup>
                </Box>

                <Carousel.Control justifyContent="center" gap="4">
                  <Carousel.PrevTrigger asChild>
                    <IconButton size="xs" variant="ghost">
                      <LuChevronLeft />
                    </IconButton>
                  </Carousel.PrevTrigger>

                  <Carousel.Indicators />

                  <Carousel.NextTrigger asChild>
                    <IconButton size="xs" variant="ghost">
                      <LuChevronRight />
                    </IconButton>
                  </Carousel.NextTrigger>
                </Carousel.Control>
              </Carousel.Root>
            </Show>
          </GridItem>

          {/* Tabs panel — desktop only */}
          <GridItem colSpan={3} display={{ base: "none", lg: "block" }}>
            <Box
              p={3}
              borderRadius={"sm"}
              border={"1px solid"}
              borderColor={"gray.200"}
            >
              <Flex align={"center"} justify={"space-between"}>
                <Flex gap={2} my={2} align={"center"}>
                  <FaRegFileAlt
                    size={40}
                    color="var(--chakra-colors-primary)"
                  />
                  <Flex direction={"column"}>
                    <Small mb={-1}>LPA Number</Small>
                    <H4>{planDetails!.lpaNumber}</H4>
                    <Flex gap={2} mt={2}>
                      <OSPBadge
                        type={
                          planDetails!.accountStatus === "LAPSED"
                            ? "warning"
                            : "success"
                        }
                      >
                        {planDetails!.accountStatus}
                      </OSPBadge>
                      <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                    </Flex>
                  </Flex>
                </Flex>
                <AccountQuickActions actions={resolvedActions} />
              </Flex>
              <Separator my={2} />
              <PlanTabs
                planDetails={planDetails!}
                planholderAddress={planholderAddress}
              />
            </Box>
          </GridItem>
        </Grid>
      ) : (
        <Card.MainContent>
          <EmptyStateCard
            title={"No Plans Found"}
            description={"This person does not have any plans."}
          />
        </Card.MainContent>
      )}

      {/* Mobile full-screen plan detail drawer */}
      <Drawer.Root
        open={modalOpen}
        onOpenChange={(e) => setModalOpen(e.open)}
        size="full"
        placement={"bottom"}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header px={4} pt={4} pb={0} borderBottomWidth={0}>
                <Flex
                  id="tour-plan-lpa-header"
                  align="flex-start"
                  justify="space-between"
                  w="full"
                >
                  <Flex align="center" gap={3} flex={1} minW={0}>
                    <Flex
                      align="center"
                      justify="center"
                      w={10}
                      h={10}
                      borderRadius="lg"
                      bg="var(--chakra-colors-primary-disabled)/30"
                      flexShrink={0}
                    >
                      <FaRegFileAlt
                        size={18}
                        color="var(--chakra-colors-primary)"
                      />
                    </Flex>
                    <Box flex={1} minW={0}>
                      <Text
                        fontSize="2xs"
                        color="gray.400"
                        letterSpacing="wider"
                        textTransform="uppercase"
                      >
                        LPA Number
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="var(--chakra-colors-primary)"
                        lineHeight="tight"
                        mt={0.5}
                      >
                        {planDetails?.lpaNumber}
                      </Text>
                    </Box>
                  </Flex>
                  <Drawer.CloseTrigger asChild>
                    <CloseButton size="sm" mt={0.5} />
                  </Drawer.CloseTrigger>
                </Flex>
                <Separator mt={4} borderColor="gray.100" />
              </Drawer.Header>
              <Flex
                px={4}
                py={2}
                direction={"column"}
                gap={2}
                borderBottomWidth={1}
                borderColor="gray.100"
              >
                <Grid templateColumns={"repeat(2, 1fr)"} gap={2}>
                  <Box
                    border={"1px solid"}
                    borderColor={"gray.200"}
                    borderRadius={"md"}
                    p={3}
                  >
                    <Flex align="center" gap={1}>
                      <LuShieldCheck
                        size={12}
                        color="var(--chakra-colors-fg-muted)"
                      />
                      <Small color="fg.muted">Account status</Small>
                    </Flex>
                    <OSPBadge
                      type={
                        planDetails?.accountStatus === "LAPSED"
                          ? "warning"
                          : "success"
                      }
                    >
                      {planDetails?.accountStatus}
                    </OSPBadge>
                  </Box>
                  <Box
                    border={"1px solid"}
                    borderColor={"gray.200"}
                    borderRadius={"md"}
                    p={3}
                  >
                    <Flex align="center" gap={1}>
                      <LuBan size={12} color="var(--chakra-colors-fg-muted)" />
                      <Small color="fg.muted">Termination status</Small>
                    </Flex>
                    <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                  </Box>
                </Grid>
                <Strong>Common Actions</Strong>
                <AccountQuickActions actions={resolvedActions} />
              </Flex>

              <Drawer.Body px={3} py={3}>
                {planDetails && (
                  <Box id="tour-plan-tabs">
                    <PlanTabs
                      planDetails={planDetails}
                      planholderAddress={planholderAddress}
                    />
                  </Box>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
