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
  Strong,
} from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaRegFileAlt } from "react-icons/fa";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBan,
  LuChevronLeft,
  LuChevronRight,
  LuCreditCard,
  LuFiles,
  LuIdCard,
  LuPointer,
  LuPrinter,
  LuSearch,
  LuShieldCheck,
  LuTrash,
  LuTrash2,
  LuUsersRound,
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { OnboardingTutorial } from "../onboarding-tutorial";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { EmptyState } from "../components/empty-state/empty-state";
import { LPANumberButton } from "../components/buttons/lpa-button";
import { H4, PrimaryMdButton, PrimarySmButton, Small } from "st-peter-ui";
import { HiRefresh } from "react-icons/hi";
import { InfoCardSheet } from "@/claude components/card-accordion/info-card-sheet";
import { FiFileText } from "react-icons/fi";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { MdHealthAndSafety } from "react-icons/md";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import { GiMartyrMemorial } from "react-icons/gi";
import { PlanDetailsPage } from "../pages/plan-details";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Beneficiaries } from "../pages/beneficiaries";
import { StatementOfAccount } from "../pages/statement-of-accounts";
import { HealthDeclaration } from "../pages/health-declaration";
import AccountQuickActions, {
  QuickAction,
} from "../cards/account-quick-actions";

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
    <Flex direction="column" gap={2}>
      <InfoCardSheet
        icon={<FiFileText size={16} />}
        title="Plan Details"
        subtitle="Coverage & premium info"
      >
        <PlanDetailsPage planDetails={planDetails} />
      </InfoCardSheet>

      <InfoCardSheet
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
      </InfoCardSheet>

      <InfoCardSheet
        icon={<HiOutlineDocumentCurrencyDollar size={16} />}
        title="Statement of Accounts"
        subtitle="Payment history & balance"
      >
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
            paymentRecords: [
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2026-00001",
                siDate: new Date("2026-01-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 7,
                nextDueDate: new Date("2026-04-15"),
                cvNumber: "CV-2026-00701",
                pcvNumber: "PCV-2026-00701",
                auditDate: new Date("2026-01-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2025-00056",
                siDate: new Date("2025-10-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 6,
                nextDueDate: new Date("2026-01-15"),
                cvNumber: "CV-2025-00601",
                pcvNumber: "PCV-2025-00601",
                auditDate: new Date("2025-10-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2025-00043",
                siDate: new Date("2025-07-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 5,
                nextDueDate: new Date("2025-10-15"),
                cvNumber: "CV-2025-00501",
                pcvNumber: "PCV-2025-00501",
                auditDate: new Date("2025-07-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2025-00031",
                siDate: new Date("2025-04-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 4,
                nextDueDate: new Date("2025-07-15"),
                cvNumber: "CV-2025-00401",
                pcvNumber: "PCV-2025-00401",
                auditDate: new Date("2025-04-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2025-00018",
                siDate: new Date("2025-01-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 3,
                nextDueDate: new Date("2025-04-15"),
                cvNumber: "CV-2025-00301",
                pcvNumber: "PCV-2025-00301",
                auditDate: new Date("2025-01-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "DC",
                siNumber: "SI-2024-00092",
                siDate: new Date("2024-10-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 2,
                nextDueDate: new Date("2025-01-15"),
                cvNumber: "CV-2024-00201",
                pcvNumber: "PCV-2024-00201",
                auditDate: new Date("2024-10-16"),
              },
              {
                lpaNumber: planDetails.lpaNumber,
                payClass: "NS",
                siNumber: "SI-2024-00071",
                siDate: new Date("2024-07-15"),
                siAmount: planDetails.installmentAmount,
                planCode: planDetails.planCode,
                installmentNumber: 1,
                nextDueDate: new Date("2024-10-15"),
                cvNumber: "CV-2024-00101",
                pcvNumber: "PCV-2024-00101",
                auditDate: new Date("2024-07-16"),
              },
            ],
          }}
        />
      </InfoCardSheet>

      <InfoCardSheet
        icon={<MdHealthAndSafety size={16} />}
        title="Health Declaration"
        subtitle="Medical disclosures"
      >
        <HealthDeclaration />
      </InfoCardSheet>

      <InfoCardSheet
        icon={<LiaHandHoldingUsdSolid size={16} />}
        title="Loan"
        subtitle="Loan records"
      >
        <EmptyState
          title="No Record Found"
          description="Loan details displays here."
        />
      </InfoCardSheet>

      <InfoCardSheet
        icon={<GiMartyrMemorial size={16} />}
        title="Service"
        subtitle="Service records"
      >
        <EmptyState
          title="No Record Found"
          description="Service Information displays here."
        />
      </InfoCardSheet>

      <InfoCardSheet
        icon={<FiFileText size={16} />}
        title="ROP History"
        subtitle="Return of premium history"
      >
        <EmptyState
          title="No Record Found"
          description="ROP history displays here."
        />
      </InfoCardSheet>

      <InfoCardSheet
        icon={<LuUsersRound size={16} />}
        title="Transfer History"
        subtitle="Plan transfer records"
      >
        <EmptyState
          title="No Record Found"
          description="Transfer history displays here."
        />
      </InfoCardSheet>
    </Flex>
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
          "/plan-management/planholder/" + personId + "/soa"),
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
        // if (confirmed) {
        //   deletePlanFunction(planDetails?.lpaNumber ?? "");
        // }
      },
    },
  ];

  // const actionButtons = planDetails ? (
  //   <Flex gap={2} w={{ base: "full", lg: "auto" }}>
  //     {planDetails.accountStatus === "LAPSED" &&
  //       planDetails.terminationStatus === "NOT YET TERMINATED" && (
  //         <Box flex={1}>
  //           <Show when={!isMobile}>
  //             <PrimaryMdButton
  //               w="full"
  //               onClick={() =>
  //                 (window.location.href =
  //                   "/plan-management/planholder/" +
  //                   planDetails.lpaNumber +
  //                   "/reinstatement")
  //               }
  //             >
  //               <HiRefresh /> Reinstate
  //             </PrimaryMdButton>
  //           </Show>
  //           <Show when={isMobile}>
  //             <PrimarySmButton
  //               w="full"
  //               onClick={() =>
  //                 (window.location.href =
  //                   "/plan-management/planholder/" +
  //                   planDetails.lpaNumber +
  //                   "/reinstatement")
  //               }
  //             >
  //               <HiRefresh /> Reinstate
  //             </PrimarySmButton>
  //           </Show>
  //         </Box>
  //       )}

  //     {planDetails.accountStatus !== "LAPSED" &&
  //       planDetails.terminationStatus === "NOT YET TERMINATED" && (
  //         <Box flex={1}>
  //           <Show when={!isMobile}>
  //             <PrimaryMdButton
  //               w="full"
  //               onClick={() =>
  //                 (window.location.href =
  //                   "/plan-management/planholder/" +
  //                   planDetails.lpaNumber +
  //                   "/transfer-of-rights")
  //               }
  //             >
  //               <HiRefresh /> Transfer Plan
  //             </PrimaryMdButton>
  //           </Show>
  //           <Show when={isMobile}>
  //             <PrimarySmButton
  //               w="full"
  //               onClick={() =>
  //                 (window.location.href =
  //                   "/plan-management/planholder/" +
  //                   planDetails.lpaNumber +
  //                   "/transfer-of-rights")
  //               }
  //             >
  //               <HiRefresh /> Transfer
  //             </PrimarySmButton>
  //           </Show>
  //         </Box>
  //       )}

  //     {deletePlanFunction && (
  //       <Button
  //         flex={1}
  //         size={{ base: "sm", lg: "md" }}
  //         bg={"var(--chakra-colors-danger-hover)"}
  //         _hover={{ bg: "var(--chakra-colors-danger)" }}
  //         color={"white"}
  //         onClick={async () => {
  //           const confirmed = await messageBox({
  //             title: "Delete Plan",
  //             message:
  //               "Are you sure you want to delete this plan? (" +
  //               planDetails.lpaNumber +
  //               ")",
  //             confirmText: "Delete",
  //             cancelText: "Cancel",
  //             variant: "confirmation",
  //           });
  //           if (confirmed) {
  //             deletePlanFunction(planDetails.lpaNumber);
  //           }
  //         }}
  //       >
  //         <LuTrash /> Delete
  //       </Button>
  //     )}
  //   </Flex>
  // ) : null;

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
                <AccountQuickActions actions={resolvedActions} />
                {/* {actionButtons} */}
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
                      {/* <Flex gap={1.5} mt={2} flexWrap="wrap">
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
                      </Flex> */}
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
              {/* {actionButtons && (
                <Box
                  id="tour-plan-actions"
                  px={4}
                  py={2}
                  borderBottomWidth={1}
                  borderColor="gray.100"
                >
                  {actionButtons}
                </Box>
              )} */}

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

      {/* {modalOpen && (
        <OnboardingTutorial
          steps={PLAN_DETAIL_STEPS}
          storageKey="osp-plan-detail-tour-v1"
        />
      )} */}
    </Box>
  );
}
