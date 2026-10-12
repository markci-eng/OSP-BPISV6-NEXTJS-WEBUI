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
  EmptyState,
  Skeleton,
} from "@chakra-ui/react";
import {
  OSPBadge,
  H4,
  Small,
  useMessageDialog,
  Card,
  EmptyStateCard,
  ErrorStateCard,
  InfoCardAccordion,
  InfoCardSheet,
} from "osp-ui-kit";
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
import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import AccountQuickActions, {
  QuickAction,
} from "@/components/plan-management/planholder-profile/cards/account-quick-actions";
import { LPANumberButton } from "./lpa-button";
import {
  AddressInfo,
  PlanDetails,
  PlanOverview,
} from "@/types/plan-management.types";
import { HealthDeclaration } from "@splpi/estore-shared-components";
import { GiMartyrMemorial } from "react-icons/gi";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { MdHealthAndSafety } from "react-icons/md";
import { Beneficiaries } from "./tabs/beneficiaries";
import { PlanDetailsPage } from "./tabs/plan-details";
import { StatementOfAccount } from "./tabs/statement-of-account";
import { usePlanInfo } from "../hooks/usePlanInfo";

export interface PhBeneficiaries {
  lpaNumber: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  contactNumber: string;
  type: "principal" | "contingent";
}

export function ListOfPlans({
  plans,
  deletePlanFunction,
  personId,
  selectedLpaNumber,
  phAddress,
}: {
  plans: PlanOverview[];
  deletePlanFunction?: (lpaNumber: string) => void;
  personId?: string;
  selectedLpaNumber?: string;
  phAddress?: AddressInfo | null | undefined;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [searchVal, setSearchVal] = useState<string>("");
  // Only the choice is state; the plan itself is derived. `plans` is empty on
  // the first render after a reload (the planholder query is still in flight),
  // so a copy taken at mount would stay null once the plans arrive.
  const [chosenLpaNo, setChosenLpaNo] = useState<string | undefined>(
    selectedLpaNumber || undefined,
  );
  const initialPlanIndex = Math.max(
    plans.findIndex((p) => p.lpaNo === chosenLpaNo),
    0,
  );
  const planDetails: PlanOverview | null = plans[initialPlanIndex] ?? null;
  const setPlanDetails = (plan: PlanOverview | undefined) =>
    setChosenLpaNo(plan?.lpaNo);
  const search = searchVal.toLocaleLowerCase();
  const filteredPlans = plans.filter((e) =>
    e.lpaNo.toLocaleLowerCase().includes(search),
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { messageBox } = useMessageDialog();

  const resolvedActions: QuickAction[] = [
    {
      key: "reinstate-plan",
      label: planDetails?.accountStatus === "LAPSED" ? "Reinstate" : "Transfer",
      icon: FiFileText,
      onClick: () =>
        (window.location.href =
          "/plan-management/planholder/" +
          planDetails?.lpaNo +
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
          encodeURIComponent(planDetails?.lpaNo ?? "")),
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
            planDetails?.lpaNo +
            ")",
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "confirmation",
        });
        if (confirmed) {
          deletePlanFunction?.(planDetails?.lpaNo ?? "");
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
                    key={plan.lpaNo}
                    plan={plan}
                    isSelected={planDetails?.lpaNo === plan.lpaNo}
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
                      <Carousel.Item key={plan.lpaNo} index={index} minW={0}>
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

                  <Carousel.Indicators
                    transition="width 0.2s ease-in-out"
                    transformOrigin="center"
                    opacity="0.5"
                    boxSize="2"
                    bg={"primaryDisabled"}
                    _current={{
                      width: "10",
                      bg: "primary",
                      opacity: 1,
                    }}
                  />

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
            <Box p={3} bg={"surface"} borderRadius={"card"} boxShadow={"card"}>
              <Flex align={"center"} justify={"space-between"}>
                <Flex gap={2} my={2} align={"center"}>
                  <FaRegFileAlt
                    size={40}
                    color="var(--chakra-colors-primary)"
                  />
                  <Flex direction={"column"}>
                    <Small mb={-1}>LPA Number</Small>
                    <H4>{planDetails!.lpaNo}</H4>
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
                      <OSPBadge
                        type={
                          planDetails?.terminationStatus ===
                          "NOT YET TERMINATED"
                            ? "success"
                            : "danger"
                        }
                      >
                        {planDetails.terminationStatus}
                      </OSPBadge>
                    </Flex>
                  </Flex>
                </Flex>
                <AccountQuickActions actions={resolvedActions} />
              </Flex>
              <Separator my={2} />
              <PlanTabs plan={planDetails} phAddress={phAddress} />
            </Box>
          </GridItem>
        </Grid>
      ) : (
        <Card.MainContent>
          <Box boxShadow={"card"} borderRadius={"card"} p={2} bg={"surface"}>
            <EmptyStateCard
              title={"No Plans Found"}
              description={"This person does not have any plans."}
            />
          </Box>
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
                        {planDetails?.lpaNo}
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
                    <OSPBadge
                      type={
                        planDetails?.terminationStatus === "NOT YET TERMINATED"
                          ? "success"
                          : "danger"
                      }
                    >
                      {planDetails.terminationStatus}
                    </OSPBadge>
                  </Box>
                </Grid>
                <Strong>Common Actions</Strong>
                <AccountQuickActions actions={resolvedActions} />
              </Flex>

              <Drawer.Body px={3} py={3}>
                {planDetails && (
                  <Box id="tour-plan-tabs">
                    <PlanTabs
                      plan={planDetails}
                      phAddress={phAddress}
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

function PlanTabs({
  plan,
  phAddress,
}: {
  plan: PlanOverview;
  phAddress?: AddressInfo | null | undefined;
}) {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const InfoCard = isDesktop ? InfoCardAccordion : InfoCardSheet;

  const {
    data: planInfo,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePlanInfo(plan.lpaNo);
  const lpaNumber = plan.lpaNo;
  const planDetails = planInfo?.planDetails;

  if (isLoading) {
    return (
      <Flex direction="column" gap={2}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} h="60px" borderRadius="xl" />
        ))}
      </Flex>
    );
  }

  // A plan the API says isn't there won't appear on a retry.
  if (planInfo === null || (!isError && !planDetails)) {
    return (
      <EmptyStateCard
        title="Plan Not Found"
        description={`No details were found for plan ${lpaNumber}.`}
      />
    );
  }

  if (isError || !planDetails) {
    return (
      <ErrorStateCard
        title="Could not load plan details"
        description="Something went wrong while loading this plan. Please try again."
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  return (
    <Flex direction="column" gap={2}>
      {/* Only the desktop accordion starts open; the mobile sheet has no such state. */}
      {isDesktop ? (
        <InfoCardAccordion
          icon={<FiFileText size={16} />}
          title="Plan Details"
          subtitle="Coverage & premium info"
          defaultOpen
        >
          <PlanDetailsPage planDetails={planDetails} />
        </InfoCardAccordion>
      ) : (
        <InfoCardSheet
          icon={<FiFileText size={16} />}
          title="Plan Details"
          subtitle="Coverage & premium info"
        >
          <PlanDetailsPage planDetails={planDetails} />
        </InfoCardSheet>
      )}

      <InfoCard
        icon={<LuUsersRound size={16} />}
        title="Beneficiaries"
        subtitle="Named beneficiaries"
      >
        <Beneficiaries
          lpaNo={lpaNumber}
          beneficiaries={planInfo?.beneficiaries ?? []}
          planholderAddress={phAddress}
        />
      </InfoCard>

      <InfoCard
        icon={<HiOutlineDocumentCurrencyDollar size={16} />}
        title="Statement of Accounts"
        subtitle="Payment history & balance"
      >
        <StatementOfAccount
          plan={plan}
          planDetails={planDetails}
          paymentRecords={planInfo?.paymentRecords ?? []}
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
