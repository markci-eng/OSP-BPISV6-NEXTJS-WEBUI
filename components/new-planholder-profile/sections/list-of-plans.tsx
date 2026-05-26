import Card from "@/components/cards/Card";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Input,
  InputGroup,
  Separator,
  Show,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Badge } from "../components/badge/badge";
import { FaRegFileAlt } from "react-icons/fa";
import { LuSearch, LuTrash, LuUsersRound } from "react-icons/lu";
import { useEffect, useState } from "react";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { EmptyState } from "../components/empty-state/empty-state";
import { LPANumberButton } from "../components/buttons/lpa-button";
import { H4, Small } from "st-peter-ui";
import { HiRefresh } from "react-icons/hi";
import { Tab } from "../components/tab/tab";
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
import { PlanSelectionDropdown } from "../components/plan-selection-dropdown/plan-selection-dropdown";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_RADIUS,
} from "@/lib/theme/standard-design-tokens";

function getPlanBadgeType(
  status: string,
): "success" | "info" | "warning" | "danger" | undefined {
  if (status === "LAPSED") return "warning";
  if (status === "NOT YET TERMINATED" || status === "ACTIVE") return "success";
  if (status.includes("SERVICED")) return "info";
  return undefined;
}

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
}: {
  plans: PlanDetailType[];
  deletePlanFunction?: (lpaNumber: string) => void;
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchVal, setSearchVal] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<PlanDetailType>(
    plans.find((plan) => plan.lpaNumber === plans[0]?.lpaNumber) ??
      ({} as PlanDetailType),
  );
  const [filteredPlans, setFilteredPlans] = useState<PlanDetailType[]>(plans);

  const { messageBox } = useMessageDialog();

  useEffect(() => {
    setFilteredPlans(
      plans.filter((e) =>
        e.lpaNumber.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase()),
      ),
    );
  }, [plans, searchVal]);

  return (
    <Box my={{ base: 4, md: 5 }}>
      <Card.Root title={"List of Plan(s)"}>
        {plans.length > 0 ? (
          <Card.MainContent>
            <Grid
              templateColumns={{ base: "1fr", lg: "minmax(260px, 320px) 1fr" }}
              gap={{ base: 4, md: 5 }}
              alignItems="start"
            >
              <GridItem minW={0}>
                <Show when={!isMobile}>
                  <InputGroup startElement={<LuSearch />}>
                    <Input
                      placeholder="Search LPA Number"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.currentTarget.value)}
                      h="40px"
                      borderRadius={STANDARD_RADIUS.md}
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
                        isSelected={planDetails.lpaNumber === plan.lpaNumber}
                        onClick={() => setPlanDetails(plan)}
                      />
                    ))}
                  </Flex>
                </Show>
                <Show when={isMobile}>
                  <PlanSelectionDropdown
                    plans={plans}
                    onChange={(pln) => setPlanDetails(pln)}
                  />
                </Show>
              </GridItem>
              <GridItem minW={0}>
                <Box
                  p={{ base: 3, md: 4 }}
                  borderRadius={STANDARD_RADIUS.md}
                  border={"1px solid"}
                  borderColor="gray.200"
                  bg={BRAND_COLORS.white}
                >
                  <Flex
                    align={{ base: "stretch", md: "center" }}
                    justify={"space-between"}
                    direction={{ base: "column", md: "row" }}
                    gap={3}
                  >
                    <Flex gap={3} my={{ base: 0, md: 2 }} align={"center"}>
                      <Box
                        p={3}
                        borderRadius={STANDARD_RADIUS.md}
                        bg={BRAND_COLORS.successBg}
                        flexShrink={0}
                      >
                        <FaRegFileAlt
                          size={24}
                          color={BRAND_COLORS.primaryGreen}
                        />
                      </Box>
                      <Flex direction={"column"} minW={0}>
                        <Small mb={-1}>LPA Number</Small>
                        <H4>{planDetails.lpaNumber}</H4>
                        <Flex gap={2} mt={2} wrap="wrap">
                          <Badge
                            type={getPlanBadgeType(planDetails.accountStatus)}
                          >
                            {planDetails.accountStatus}
                          </Badge>
                          <Badge
                            type={getPlanBadgeType(
                              planDetails.terminationStatus,
                            )}
                          >
                            {planDetails.terminationStatus}
                          </Badge>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      align={"stretch"}
                      justify={{ base: "stretch", md: "flex-end" }}
                      direction={{ base: "column", sm: "row" }}
                      gap={2}
                    >
                      {deletePlanFunction && (
                        <Button
                          width={{ base: "full", sm: "auto" }}
                          size="sm"
                          variant="outline"
                          {...STANDARD_BUTTON_STYLES.md}
                          color={BRAND_COLORS.destructiveRed}
                          borderColor={BRAND_COLORS.destructiveRed}
                          _hover={{
                            bg: BRAND_COLORS.errorBg,
                          }}
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
                      {planDetails.accountStatus === "LAPSED" &&
                        planDetails.terminationStatus ===
                          "NOT YET TERMINATED" && (
                          <>
                            <Button
                              size="sm"
                              w={{ base: "full", sm: "auto" }}
                              {...STANDARD_BUTTON_STYLES.md}
                              bg={BRAND_COLORS.primaryGreen}
                              color="white"
                              _hover={{ bg: BRAND_COLORS.darkGreen }}
                              onClick={() =>
                                (window.location.href =
                                  "/plan-management/planholder/" +
                                  planDetails.lpaNumber +
                                  "/reinstatement")
                              }
                            >
                              <HiRefresh /> Reinstate Plan
                            </Button>
                          </>
                        )}

                      {planDetails.accountStatus != "LAPSED" &&
                        planDetails.terminationStatus ===
                          "NOT YET TERMINATED" && (
                          <>
                            <Button
                              size="sm"
                              w={{ base: "full", sm: "auto" }}
                              {...STANDARD_BUTTON_STYLES.md}
                              bg={BRAND_COLORS.primaryGreen}
                              color="white"
                              _hover={{ bg: BRAND_COLORS.darkGreen }}
                              onClick={() =>
                                (window.location.href =
                                  "/plan-management/planholder/" +
                                  planDetails.lpaNumber +
                                  "/transfer-of-rights")
                              }
                            >
                              <HiRefresh /> Transfer Plan
                            </Button>
                          </>
                        )}
                    </Flex>
                  </Flex>
                  <Separator my={2} />
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
                              totalAmountPayable:
                                planDetails.totalAmountPayable,
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
                </Box>
              </GridItem>
            </Grid>
          </Card.MainContent>
        ) : (
          <Card.MainContent>
            <EmptyState
              title={"No Plans Found"}
              description={"This person does not have any plans."}
            />
          </Card.MainContent>
        )}
      </Card.Root>
    </Box>
  );
}
