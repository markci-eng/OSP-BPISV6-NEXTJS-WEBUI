import Card from "@/components/cards/Card";
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
  Button,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaRegFileAlt } from "react-icons/fa";
import {
  LuArrowLeft,
  LuArrowRight,
  LuChevronLeft,
  LuChevronRight,
  LuPointer,
  LuSearch,
  LuTrash,
  LuUsersRound,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { OnboardingTutorial } from "../onboarding-tutorial";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { EmptyState } from "../components/empty-state/empty-state";
import { LPANumberButton } from "../components/buttons/lpa-button";
import { H4, PrimaryMdButton, PrimarySmButton, Small } from "st-peter-ui";
import { HiRefresh } from "react-icons/hi";
import { Tab } from "../components/tab/tab";
import { FiFileText } from "react-icons/fi";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { MdHealthAndSafety } from "react-icons/md";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { GiClick, GiMartyrMemorial } from "react-icons/gi";
import { PlanDetailsPage } from "../pages/plan-details";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Beneficiaries } from "../pages/beneficiaries";
import { StatementOfAccount } from "../pages/statement-of-accounts";
import { HealthDeclaration } from "../pages/health-declaration";
import { FaRegHandPointer } from "react-icons/fa6";

const PLAN_DETAIL_STEPS = [
  {
    targetId: "tour-plan-lpa-header",
    title: "Plan Overview",
    body: "This shows the selected plan's LPA number and its current status — Active or Lapsed.",
  },
  {
    targetId: "tour-plan-actions",
    title: "Plan Actions",
    body: "Reinstate a lapsed plan, transfer rights to another person, or delete the plan from here.",
  },
  {
    targetId: "tour-plan-tabs",
    title: "Plan Information",
    body: "Browse plan details, beneficiaries, statement of accounts, health declaration, loan records, and more from these tabs.",
  },
];

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
  return (
    <Tab
      tabItems={[
        {
          icon: FiFileText,
          label: "Plan Details",
          value: "plan-details",
          page: <PlanDetailsPage planDetails={planDetails} />,
        },
        {
          icon: LuUsersRound,
          label: "Beneficiaries",
          value: "beneficiaries",
          page: (
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
          ),
        },
        {
          icon: HiOutlineDocumentCurrencyDollar,
          label: "Statement of Accounts",
          value: "statement-of-accounts",
          page: (
            <StatementOfAccount
              props={{
                lpaNumber: planDetails.lpaNumber,
                dueDate: new Date("2026-05-23"),
                term: planDetails.term,
                mode: planDetails.mode,
                installmentNumber: 7,
                installmentAmount: planDetails.installmentAmount,
                totalAmountPayable: planDetails.totalAmountPayable,
                totalPayments: planDetails.installmentAmount * 7,
                balance:
                  planDetails.totalAmountPayable -
                  planDetails.installmentAmount * 7,
                terminationValue: 600,
                paymentRecords: [],
              }}
            />
          ),
        },
        {
          icon: MdHealthAndSafety,
          label: "Health Declaration",
          value: "health-declaration",
          page: <HealthDeclaration />,
        },
        {
          icon: LiaHandHoldingUsdSolid,
          label: "Loan",
          value: "loan",
          page: (
            <EmptyState
              title={"No Record Found"}
              description={"Loan details displays here."}
            />
          ),
        },
        {
          icon: GiMartyrMemorial,
          label: "Service",
          value: "service",
          page: (
            <EmptyState
              title={"No Record Found"}
              description={"Service Information displays here."}
            />
          ),
        },
        {
          icon: FiFileText,
          label: "ROP History",
          value: "rop-history",
          page: (
            <EmptyState
              title={"No Record Found"}
              description={"ROP history displays here."}
            />
          ),
        },
        {
          icon: LuUsersRound,
          label: "Transfer History",
          value: "transfer-history",
          page: (
            <EmptyState
              title={"No Record Found"}
              description={"Transfer history displays here."}
            />
          ),
        },
      ]}
    />
  );
}

export function ListOfPlans({
  plans,
  deletePlanFunction,
  personId,
  planholderAddress,
}: {
  plans: PlanDetailType[];
  deletePlanFunction?: (lpaNumber: string) => void;
  personId?: string;
  planholderAddress?: string;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [searchVal, setSearchVal] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<PlanDetailType | null>(
    plans[0] ?? null,
  );
  const [filteredPlans, setFilteredPlans] = useState<PlanDetailType[]>(plans);
  const [modalOpen, setModalOpen] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(true);

  const { messageBox } = useMessageDialog();

  useEffect(() => {
    setFilteredPlans(
      plans.filter((e) => e.lpaNumber.toLocaleLowerCase().includes(searchVal)),
    );
  }, [searchVal]);

  const actionButtons = planDetails ? (
    <Flex gap={2} w={{ base: "full", lg: "auto" }}>
      {planDetails.accountStatus === "LAPSED" &&
        planDetails.terminationStatus === "NOT YET TERMINATED" && (
          <Box flex={1}>
            <Show when={!isMobile}>
              <PrimaryMdButton
                w="full"
                onClick={() =>
                  (window.location.href =
                    "/plan-management/planholder/" +
                    planDetails.lpaNumber +
                    "/reinstatement")
                }
              >
                <HiRefresh /> Reinstate Plan
              </PrimaryMdButton>
            </Show>
            <Show when={isMobile}>
              <PrimarySmButton
                w="full"
                onClick={() =>
                  (window.location.href =
                    "/plan-management/planholder/" +
                    planDetails.lpaNumber +
                    "/reinstatement")
                }
              >
                <HiRefresh /> Reinstate Plan
              </PrimarySmButton>
            </Show>
          </Box>
        )}

      {planDetails.accountStatus !== "LAPSED" &&
        planDetails.terminationStatus === "NOT YET TERMINATED" && (
          <Box flex={1}>
            <Show when={!isMobile}>
              <PrimaryMdButton
                w="full"
                onClick={() =>
                  (window.location.href =
                    "/plan-management/planholder/" +
                    planDetails.lpaNumber +
                    "/transfer-of-rights")
                }
              >
                <HiRefresh /> Transfer Plan
              </PrimaryMdButton>
            </Show>
            <Show when={isMobile}>
              <PrimarySmButton
                w="full"
                onClick={() =>
                  (window.location.href =
                    "/plan-management/planholder/" +
                    planDetails.lpaNumber +
                    "/transfer-of-rights")
                }
              >
                <HiRefresh /> Transfer Plan
              </PrimarySmButton>
            </Show>
          </Box>
        )}

      {deletePlanFunction && (
        <Button
          flex={1}
          size={{ base: "sm", lg: "md" }}
          bg={"var(--chakra-colors-danger-hover)"}
          _hover={{ bg: "var(--chakra-colors-danger)" }}
          color={"white"}
          onClick={async () => {
            const confirmed = await messageBox({
              title: "Delete Plan",
              message:
                "Are you sure you want to delete this plan? (" +
                planDetails.lpaNumber +
                ")",
              confirmText: "Delete",
              cancelText: "Cancel",
              variant: "confirmation",
            });
            if (confirmed) {
              deletePlanFunction(planDetails.lpaNumber);
            }
          }}
        >
          <LuTrash /> Delete Plan
        </Button>
      )}
    </Flex>
  ) : null;

  const glassBg = "rgba(255, 255, 255, 0.72)";
  const glassBorder = "rgba(255, 255, 255, 0.60)";
  const glassShadow =
    "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -0.5px 0 rgba(0,0,0,0.04)";

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
                  <EmptyState
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
                onPageChange={(details) => {
                  setPlanDetails(plans[details.page]);
                  setShowViewDetails(false);
                  setTimeout(() => setShowViewDetails(true), 350);
                }}
              >
                <Box
                  position="relative"
                  // mx={plans.length > 1 ? 4 : 0}
                  overflow="visible"
                >
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

                  {/* View Details — sibling of ItemGroup so carousel clipping doesn't affect it */}
                  <Box
                    position="absolute"
                    bottom={0}
                    left="50%"
                    zIndex={2}
                    style={{ transform: "translate(-50%, 50%)" }}
                    opacity={showViewDetails ? 1 : 0}
                    pointerEvents={showViewDetails ? "auto" : "none"}
                    transition="opacity 0.2s ease"
                  >
                    {/* <Button
                      size="xs"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      boxShadow="sm"
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="semibold"
                      color="var(--chakra-colors-primary)"
                      px={3}
                      gap={1}
                      onClick={() => setModalOpen(true)}
                    >
                      <LuPointer size={11} />
                      View Details
                    </Button> */}
                  </Box>

                  {/* {plans.length > 1 && (
                    <Carousel.PrevTrigger asChild>
                      <IconButton
                        size="xs"
                        variant="outline"
                        position="absolute"
                        left={0}
                        top="50%"
                        bg="white"
                        boxShadow="sm"
                        borderRadius="full"
                        zIndex={1}
                        style={{ transform: "translate(-50%, -50%)" }}
                      >
                        <LuArrowLeft />
                      </IconButton>
                    </Carousel.PrevTrigger>
                  )}

                  {plans.length > 1 && (
                    <Carousel.NextTrigger asChild>
                      <IconButton
                        size="xs"
                        variant="outline"
                        position="absolute"
                        right={0}
                        top="50%"
                        bg="white"
                        boxShadow="sm"
                        borderRadius="full"
                        zIndex={1}
                        style={{ transform: "translate(50%, -50%)" }}
                      >
                        <LuArrowRight />
                      </IconButton>
                    </Carousel.NextTrigger>
                  )} */}
                </Box>

                {/* {plans.length > 1 && (
                  <Carousel.Indicators
                    transition="width 0.2s ease-in-out"
                    boxSize="2"
                    opacity="0.5"
                    bg={"var(--chakra-colors-primary-disabled)"}
                    _current={{
                      width: "10",
                      bg: "primary",
                      opacity: 1,
                    }}
                  />
                )} */}
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
                {actionButtons}
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
          <EmptyState
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
                      <Flex gap={1.5} mt={2} flexWrap="wrap">
                        <OSPBadge
                          type={
                            planDetails?.accountStatus === "LAPSED"
                              ? "warning"
                              : "success"
                          }
                        >
                          {planDetails?.accountStatus}
                        </OSPBadge>
                        <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
                      </Flex>
                    </Box>
                  </Flex>
                  <Drawer.CloseTrigger asChild>
                    <CloseButton size="sm" mt={0.5} />
                  </Drawer.CloseTrigger>
                </Flex>
                <Separator mt={4} borderColor="gray.100" />
              </Drawer.Header>

              {actionButtons && (
                <Box
                  id="tour-plan-actions"
                  px={4}
                  py={2}
                  borderBottomWidth={1}
                  borderColor="gray.100"
                >
                  {actionButtons}
                </Box>
              )}

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

      {modalOpen && (
        <OnboardingTutorial
          steps={PLAN_DETAIL_STEPS}
          storageKey="osp-plan-detail-tour-v1"
        />
      )}
    </Box>
  );
}
