"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Image,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SIZES,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import { BaseButton, PrimaryMdButton } from "st-peter-ui";
import { useEffect, useMemo, useState } from "react";
// import { PayMongoService } from "@/services/API/PayMongoService";
// import { InfoCard } from "@/components/ui/info-card";
import { useDemoAuth } from "@/components/ui/demo-auth";
import { FaEllipsisH } from "react-icons/fa";
import {
  LuChevronFirst,
  LuChevronLast,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuCircleDollarSign,
  LuCalendar,
  LuListFilter,
  LuMapPin,
  LuMinus,
  LuPlus,
  LuSearch,
  LuUser,
} from "react-icons/lu";
import Page from "@/claude components/layout/page/Page";
import InfoCard from "@/claude components/info-card/info-card";

const PAY_MY_PLAN_STORAGE_KEY = "payMyPlanSelectedItems";

const activePlans = [
  {
    contractNo: "LOS001111C",
    plan: "ST. ANNE",
    mode: "Monthly",
    amountDue: "3,000.00",
    effectiveDate: "02/09/2026",
    dueDate: "04/09/2026",
    balance: "174,000.00",
  },
  {
    contractNo: "LOS001112C",
    plan: "ST. GREGORY",
    mode: "Annual",
    amountDue: "11,400.00",
    effectiveDate: "02/20/2026",
    dueDate: "02/20/2027",
    balance: "45,600.00",
  },
  {
    contractNo: "LOS001113C",
    plan: "ST. CLAIRE",
    mode: "Annual",
    amountDue: "19,700.00",
    effectiveDate: "03/09/2026",
    dueDate: "03/09/2027",
    balance: "78,800.00",
  },
];

const desktopTableHeaders = [
  { label: "CONTRACT NO.", minW: "130px" },
  { label: "PLAN", minW: "120px" },
  { label: "MODE", minW: "100px" },
  { label: "INSTALLMENT NO.", minW: "150px" },
  { label: "AMOUNT DUE", minW: "130px", textAlign: "right" },
  { label: "EFFECTIVE DATE", minW: "126px" },
  { label: "DUE DATE", minW: "118px" },
  { label: "BALANCE", minW: "126px", textAlign: "right" },
  { label: "STATUS", minW: "86px" },
  { label: "ACTIONS", minW: "100px", textAlign: "right" },
];

type ActivePlan = (typeof activePlans)[number];

type SelectedPlan = ActivePlan & {
  installmentNumber: number;
};

type InstallmentNumbers = Record<string, number>;

const parseAmount = (value: string) => Number(value.replace(/,/g, ""));

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getStoredSelectedPlans = (): SelectedPlan[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = sessionStorage.getItem(PAY_MY_PLAN_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as SelectedPlan[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((storedPlan) =>
        activePlans.some((plan) => plan.contractNo === storedPlan.contractNo),
      )
      .map((plan) => ({
        ...plan,
        installmentNumber: Math.max(1, plan.installmentNumber ?? 1),
      }));
  } catch {
    sessionStorage.removeItem(PAY_MY_PLAN_STORAGE_KEY);
    return [];
  }
};

const getInitialInstallmentNumbers = (selectedPlans: SelectedPlan[]) => {
  const nextCounts: InstallmentNumbers = {};

  activePlans.forEach((plan) => {
    nextCounts[plan.contractNo] = 1;
  });

  selectedPlans.forEach((plan) => {
    nextCounts[plan.contractNo] = Math.max(1, plan.installmentNumber ?? 1);
  });

  return nextCounts;
};

const PayMyPlan = () => {
  const { login } = useDemoAuth();

  const [selectedPlans, setSelectedPlans] = useState<SelectedPlan[]>(() =>
    getStoredSelectedPlans(),
  );
  const [installmentNumbers, setInstallmentNumbers] =
    useState<InstallmentNumbers>(() =>
      getInitialInstallmentNumbers(getStoredSelectedPlans()),
    );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [planModeFilter, setPlanModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Due");
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [sideDrawerPlan, setSideDrawerPlan] = useState<ActivePlan | null>(null);

  useEffect(() => {
    sessionStorage.setItem(
      PAY_MY_PLAN_STORAGE_KEY,
      JSON.stringify(selectedPlans),
    );
  }, [selectedPlans]);

  useEffect(() => {
    login();
  }, [login]);

  const totalSelectedAmount = useMemo(() => {
    return selectedPlans.reduce(
      (total, plan) =>
        total +
        parseAmount(plan.amountDue) *
          (installmentNumbers[plan.contractNo] ?? 1),
      0,
    );
  }, [installmentNumbers, selectedPlans]);

  const filteredActivePlans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activePlans.filter((plan) => {
      const matchesSearch =
        !query ||
        [
          plan.contractNo,
          plan.plan,
          plan.mode,
          plan.effectiveDate,
          plan.dueDate,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesMode =
        planModeFilter === "All" || plan.mode === planModeFilter;
      const matchesStatus = statusFilter === "All" || statusFilter === "Due";

      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [planModeFilter, searchQuery, statusFilter]);

  const desktopResultStart = filteredActivePlans.length > 0 ? 1 : 0;
  const desktopResultEnd = filteredActivePlans.length;

  const toggleContract = (planToToggle: ActivePlan) => {
    setSelectedPlans((prev) => {
      const exists = prev.some(
        (plan) => plan.contractNo === planToToggle.contractNo,
      );

      if (exists) {
        return prev.filter(
          (plan) => plan.contractNo !== planToToggle.contractNo,
        );
      }

      return [
        ...prev,
        {
          ...planToToggle,
          installmentNumber: installmentNumbers[planToToggle.contractNo] ?? 1,
        },
      ];
    });
  };

  const updateInstallmentNumber = (contractNo: string, delta: number) => {
    const nextCount = Math.max(
      1,
      (installmentNumbers[contractNo] ?? 1) + delta,
    );

    setInstallmentNumbers((prev) => ({
      ...prev,
      [contractNo]: nextCount,
    }));

    setSelectedPlans((prev) =>
      prev.map((plan) =>
        plan.contractNo === contractNo
          ? {
              ...plan,
              installmentNumber: nextCount,
            }
          : plan,
      ),
    );
  };

  const getInstallmentNumber = (contractNo: string) =>
    installmentNumbers[contractNo] ?? 1;

  const getSelectedPlanTotal = (plan: ActivePlan) =>
    parseAmount(plan.amountDue) * getInstallmentNumber(plan.contractNo);

  const isPlanSelected = (contractNo: string) =>
    selectedPlans.some((plan) => plan.contractNo === contractNo);

  const togglePlanExpanded = (contractNo: string) => {
    setExpandedPlans((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(contractNo)) {
        newSet.delete(contractNo);
      } else {
        newSet.add(contractNo);
      }

      return newSet;
    });
  };

  const handleCheckout = async () => {
    if (selectedPlans.length === 0) {
      return;
    }

    setIsCheckingOut(true);

    try {
      const payload = selectedPlans.map((plan) => ({
        planDesc: plan.plan,
        productCode: plan.contractNo,
        contractPrice: parseAmount(plan.balance),
        ipInstAmt: parseAmount(plan.amountDue) * plan.installmentNumber,
        planTerm: 5,
        quantity: plan.installmentNumber,
      }));

      // const { checkoutUrl } = await PayMongoService.createCheckout(payload);

      // if (!checkoutUrl) {
      //   throw new Error("Checkout URL not found");
      // }

      // window.location.href = checkoutUrl;
    } catch (error) {
      console.error(error);
      alert("Failed to proceed to payment");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Page.Root
        title="Pay My Plan"
        description="Listed below are your active St. Peter Life Plan, please select the plan/s you wish to pay."
      >
        <Page.MainContent mb={{ base: 60, md: 0 }}>
          {/* ── INFO CARD ──────────────────────────────────────────────────── */}
          <Page.Row>
            <InfoCard>
              Tap Add / Checkbox to include a plan. You can remove it anytime
              before checkout.
            </InfoCard>
          </Page.Row>

          {/* ── DESKTOP TABLE ──────────────────────────────────────────────── */}
          <Page.Row>
            <Box
              display={{ base: "none", lg: "block" }}
              borderWidth="1px"
              borderColor={BRAND_COLORS.neutralBorder}
              borderRadius={STANDARD_RADIUS.md}
              overflow="hidden"
              bg={BRAND_COLORS.white}
              boxShadow={STANDARD_SHADOWS.level1}
            >
              {/* Filter bar */}
              <Flex
                align="flex-end"
                justify="space-between"
                gap={STANDARD_SPACING.md}
                p={STANDARD_SPACING.sm}
                borderBottomWidth="1px"
                borderColor={BRAND_COLORS.neutralBorder}
                bg={BRAND_COLORS.subtleBg}
              >
                <VStack align="stretch" gap="4px" w="260px">
                  <Text
                    color={BRAND_COLORS.grey}
                    fontSize="11px"
                    fontWeight="600"
                    lineHeight="1.2"
                  >
                    Plan Type
                  </Text>
                  <NativeSelect.Root w="full">
                    <NativeSelect.Field
                      value={planModeFilter}
                      onChange={(event) =>
                        setPlanModeFilter(event.currentTarget.value)
                      }
                      w="full"
                      h="40px"
                      px={STANDARD_SPACING.xs}
                      pr={STANDARD_SPACING.md}
                      borderWidth="1px"
                      borderColor={BRAND_COLORS.neutralBorder}
                      borderRadius={STANDARD_RADIUS.sm}
                      color={BRAND_COLORS.neutralText}
                      fontSize="13px"
                      bg={BRAND_COLORS.white}
                      boxShadow="0px 1px 2px rgba(0,0,0,0.03)"
                    >
                      <option value="All">All Active Plans</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Annual">Annual</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </VStack>

                <HStack gap={STANDARD_SPACING.xs} align="flex-end">
                  <Box position="relative" w="300px">
                    <Box
                      as={LuSearch}
                      position="absolute"
                      left={STANDARD_SPACING.xs}
                      top="50%"
                      transform="translateY(-50%)"
                      color={BRAND_COLORS.grey}
                      boxSize="16px"
                    />
                    <Input
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.currentTarget.value)
                      }
                      placeholder="Search plans..."
                      w="full"
                      h="40px"
                      pl="36px"
                      pr={STANDARD_SPACING.xs}
                      borderWidth="1px"
                      borderColor={BRAND_COLORS.neutralBorder}
                      borderRadius={STANDARD_RADIUS.sm}
                      color={BRAND_COLORS.neutralText}
                      fontSize="13px"
                      bg={BRAND_COLORS.white}
                      boxShadow="0px 1px 2px rgba(0,0,0,0.03)"
                      outline="none"
                      _focus={{
                        borderColor: BRAND_COLORS.primaryGreen,
                        boxShadow: "0 0 0 1px #109448",
                      }}
                    />
                  </Box>

                  <VStack align="stretch" gap="4px" w="140px">
                    <Text
                      color={BRAND_COLORS.grey}
                      fontSize="11px"
                      fontWeight="600"
                      lineHeight="1.2"
                    >
                      Status
                    </Text>
                    <NativeSelect.Root w="full">
                      <NativeSelect.Field
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.currentTarget.value)
                        }
                        w="full"
                        h="40px"
                        px={STANDARD_SPACING.xs}
                        pr={STANDARD_SPACING.md}
                        borderWidth="1px"
                        borderColor={BRAND_COLORS.neutralBorder}
                        borderRadius={STANDARD_RADIUS.sm}
                        color={BRAND_COLORS.neutralText}
                        fontSize="13px"
                        bg={BRAND_COLORS.white}
                        boxShadow="0px 1px 2px rgba(0,0,0,0.03)"
                      >
                        <option value="Due">Due</option>
                        <option value="All">All</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </VStack>
                </HStack>
              </Flex>

              {/* Table */}
              <Box
                overflowX="auto"
                css={{
                  "&::-webkit-scrollbar": { height: "8px" },
                  "&::-webkit-scrollbar-track": {
                    background: BRAND_COLORS.subtleBg,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: BRAND_COLORS.neutralBorder,
                    borderRadius: STANDARD_RADIUS.full,
                  },
                }}
              >
                <Box
                  as="table"
                  w="full"
                  minW="1160px"
                  borderCollapse="collapse"
                >
                  <Box as="thead" bg={BRAND_COLORS.mutedBg}>
                    <Box as="tr">
                      <Box
                        as="th"
                        w="44px"
                        px={STANDARD_SPACING.xs}
                        py="12px"
                        borderBottomWidth="1px"
                        borderColor={BRAND_COLORS.neutralBorder}
                      >
                        <Checkbox.Root>
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                        </Checkbox.Root>
                      </Box>
                      {desktopTableHeaders.map((header) => (
                        <Box
                          as="th"
                          key={header.label}
                          minW={header.minW}
                          textAlign={header.textAlign ?? "left"}
                          px={STANDARD_SPACING.xs}
                          py="12px"
                          fontSize="11px"
                          fontWeight="700"
                          color={BRAND_COLORS.grey}
                          letterSpacing="0.5px"
                          borderBottomWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                          position={
                            header.label === "ACTIONS" ? "sticky" : "static"
                          }
                          right={header.label === "ACTIONS" ? 0 : undefined}
                          zIndex={header.label === "ACTIONS" ? 1 : undefined}
                          bg={BRAND_COLORS.mutedBg}
                        >
                          <HStack
                            justify={
                              header.textAlign === "right"
                                ? "flex-end"
                                : "flex-start"
                            }
                            gap="6px"
                          >
                            <Text as="span">{header.label}</Text>
                            {header.label !== "ACTIONS" ? (
                              <>
                                <Box
                                  as={LuChevronDown}
                                  boxSize="10px"
                                  color={BRAND_COLORS.grey}
                                  opacity={0.5}
                                />
                                <Box
                                  as={LuListFilter}
                                  boxSize="12px"
                                  color={BRAND_COLORS.grey}
                                  opacity={0.7}
                                />
                              </>
                            ) : null}
                          </HStack>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box as="tbody">
                    {filteredActivePlans.length === 0 ? (
                      <Box as="tr">
                        <td
                          colSpan={desktopTableHeaders.length + 1}
                          style={{
                            padding: `${STANDARD_SPACING.lg} ${STANDARD_SPACING.sm}`,
                            textAlign: "center",
                            color: BRAND_COLORS.grey,
                            fontSize: "14px",
                          }}
                        >
                          No Records Available
                        </td>
                      </Box>
                    ) : null}
                    {filteredActivePlans.map((plan) => {
                      const isSelected = isPlanSelected(plan.contractNo);

                      return (
                        <Box
                          as="tr"
                          key={plan.contractNo}
                          bg={
                            isSelected
                              ? BRAND_COLORS.successBg
                              : BRAND_COLORS.white
                          }
                          _hover={{ bg: BRAND_COLORS.subtleBg }}
                          transition="background-color 0.2s ease-out"
                        >
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Checkbox.Root
                              checked={isSelected}
                              onCheckedChange={() => toggleContract(plan)}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                            </Checkbox.Root>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Text
                              color={BRAND_COLORS.neutralText}
                              fontSize="13px"
                            >
                              {plan.contractNo}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Text
                              color={BRAND_COLORS.neutralText}
                              fontWeight="600"
                              fontSize="13px"
                            >
                              {plan.plan}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Text
                              color={BRAND_COLORS.neutralText}
                              fontSize="13px"
                            >
                              {plan.mode}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <HStack gap={STANDARD_SPACING.xs}>
                              <Button
                                w="34px"
                                minW="34px"
                                h="34px"
                                variant="outline"
                                borderColor={BRAND_COLORS.primaryGreen}
                                color={BRAND_COLORS.primaryGreen}
                                borderRadius={STANDARD_RADIUS.md}
                                bg={BRAND_COLORS.white}
                                _hover={{ bg: BRAND_COLORS.successBg }}
                                onClick={() =>
                                  updateInstallmentNumber(plan.contractNo, -1)
                                }
                                disabled={
                                  getInstallmentNumber(plan.contractNo) <= 1
                                }
                              >
                                -
                              </Button>
                              <Text
                                color={BRAND_COLORS.neutralText}
                                fontWeight="700"
                                minW="28px"
                                textAlign="center"
                                fontSize="16px"
                              >
                                {getInstallmentNumber(plan.contractNo)}
                              </Text>
                              <Button
                                w="34px"
                                minW="34px"
                                h="34px"
                                variant="outline"
                                borderColor={BRAND_COLORS.primaryGreen}
                                color={BRAND_COLORS.primaryGreen}
                                borderRadius={STANDARD_RADIUS.md}
                                bg={BRAND_COLORS.white}
                                _hover={{ bg: BRAND_COLORS.successBg }}
                                onClick={() =>
                                  updateInstallmentNumber(plan.contractNo, 1)
                                }
                              >
                                +
                              </Button>
                            </HStack>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                            color={BRAND_COLORS.neutralText}
                            fontSize="13px"
                            textAlign="right"
                          >
                            P{formatCurrency(getSelectedPlanTotal(plan))}
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                            color={BRAND_COLORS.neutralText}
                            fontSize="13px"
                          >
                            {plan.effectiveDate}
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                            color={BRAND_COLORS.neutralText}
                            fontSize="13px"
                          >
                            {plan.dueDate}
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                            color={BRAND_COLORS.neutralText}
                            fontWeight="600"
                            fontSize="13px"
                            textAlign="right"
                          >
                            P{plan.balance}
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Badge
                              bg={BRAND_COLORS.errorBg}
                              color={BRAND_COLORS.errorRed}
                              borderWidth="1px"
                              borderColor={BRAND_COLORS.errorRed}
                              borderRadius={STANDARD_RADIUS.sm}
                              px={STANDARD_SPACING.xs}
                              py="2px"
                              fontSize="11px"
                              fontWeight="700"
                              lineHeight="18px"
                            >
                              Due
                            </Badge>
                          </Box>
                          <Box
                            as="td"
                            px={STANDARD_SPACING.xs}
                            py="14px"
                            borderBottomWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                            textAlign="right"
                            position="sticky"
                            right={0}
                            bg={
                              isSelected
                                ? BRAND_COLORS.successBg
                                : BRAND_COLORS.white
                            }
                            boxShadow="-8px 0 12px rgba(255,255,255,0.86)"
                          >
                            <HStack
                              justify="flex-end"
                              gap={STANDARD_SPACING.xs}
                            >
                              <PrimaryMdButton
                                minW="88px"
                                h={STANDARD_SIZES.button.sm.height}
                                borderRadius={STANDARD_RADIUS.sm}
                                onClick={() => toggleContract(plan)}
                              >
                                {isSelected ? "REMOVE" : "Add"}
                              </PrimaryMdButton>
                              <Button
                                w={STANDARD_SIZES.iconButton.sm}
                                minW={STANDARD_SIZES.iconButton.sm}
                                h={STANDARD_SIZES.iconButton.sm}
                                variant="ghost"
                                color={BRAND_COLORS.neutralText}
                              >
                                <FaEllipsisH />
                              </Button>
                            </HStack>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {/* Pagination */}
              <Flex
                align="center"
                justify="space-between"
                gap={STANDARD_SPACING.md}
                px={STANDARD_SPACING.sm}
                py={STANDARD_SPACING.sm}
                borderTopWidth="1px"
                borderColor={BRAND_COLORS.neutralBorder}
                bg={BRAND_COLORS.white}
              >
                <Text color={BRAND_COLORS.neutralText} fontSize="13px">
                  Showing {desktopResultStart}-{desktopResultEnd} of{" "}
                  {desktopResultEnd} records
                </Text>

                <HStack gap={STANDARD_SPACING.xs}>
                  <Text color={BRAND_COLORS.neutralText} fontSize="13px">
                    Rows per page
                  </Text>
                  <NativeSelect.Root w="64px">
                    <NativeSelect.Field
                      value="10"
                      onChange={() => undefined}
                      h="36px"
                      px={STANDARD_SPACING.xs}
                      borderWidth="1px"
                      borderColor={BRAND_COLORS.neutralBorder}
                      borderRadius={STANDARD_RADIUS.sm}
                      color={BRAND_COLORS.neutralText}
                      fontSize="13px"
                      bg={BRAND_COLORS.white}
                    >
                      <option value="10">10</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Text color={BRAND_COLORS.neutralText} fontSize="13px">
                    Page 1 of 1
                  </Text>
                  {[
                    LuChevronFirst,
                    LuChevronLeft,
                    LuChevronRight,
                    LuChevronLast,
                  ].map((Icon, index) => (
                    <Button
                      key={index}
                      w="34px"
                      minW="34px"
                      h="34px"
                      variant="outline"
                      borderColor={BRAND_COLORS.lightCyan}
                      color={BRAND_COLORS.softGreen}
                      borderRadius={STANDARD_RADIUS.sm}
                      disabled
                    >
                      <Icon />
                    </Button>
                  ))}
                </HStack>
              </Flex>
            </Box>
          </Page.Row>

          {/* ── MOBILE COMPACT LIST ──────────────────────────────────────────── */}
          <Page.Row>
            <VStack
              display={{ base: "flex", lg: "none" }}
              align="stretch"
              gap={STANDARD_SPACING.sm}
            >
              {filteredActivePlans.map((plan) => {
                const isSelected = isPlanSelected(plan.contractNo);

                return (
                  <Box
                    key={plan.contractNo}
                    bg={BRAND_COLORS.white}
                    borderWidth="1px"
                    borderColor={
                      isSelected
                        ? BRAND_COLORS.primaryGreen
                        : BRAND_COLORS.neutralBorder
                    }
                    borderRadius={STANDARD_RADIUS.md}
                    boxShadow={STANDARD_SHADOWS.level1}
                    p={{ base: STANDARD_SPACING.sm, md: "20px" }}
                    transition="border-color 150ms ease-out, box-shadow 150ms ease-out"
                    onClick={() => {
                      // Open the side drawer for this plan
                      setSideDrawerPlan(plan);
                      setSideDrawerOpen(true);
                    }}
                  >
                    <Flex
                      align={{ base: "flex-start", sm: "center" }}
                      gap={{ base: "10px", sm: STANDARD_SPACING.sm }}
                    >
                      <Checkbox.Root
                        checked={isSelected}
                        onCheckedChange={() => toggleContract(plan)}
                        mt={{ base: "20px", sm: 0 }}
                        flexShrink={0}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>

                      <Image
                        src={`/images/plan-images/${plan.plan}.jpg`}
                        alt={plan.plan}
                        w={{ base: "64px", sm: "78px" }}
                        h={{ base: "64px", sm: "78px" }}
                        borderRadius={STANDARD_RADIUS.md}
                        objectFit="cover"
                        flexShrink={0}
                      />

                      <Flex
                        flex="1"
                        minW={0}
                        direction={{ base: "column", sm: "row" }}
                        align={{ base: "stretch", sm: "flex-end" }}
                        justify="space-between"
                        gap={{
                          base: STANDARD_SPACING.sm,
                          sm: STANDARD_SPACING.md,
                        }}
                      >
                        <VStack align="start" gap="2px" minW={0}>
                          <Text
                            fontSize={{ base: "15px", sm: "17px" }}
                            fontWeight="700"
                            color={BRAND_COLORS.neutralText}
                            lineHeight="1.2"
                            lineClamp={1}
                          >
                            {plan.plan}
                          </Text>
                          <Text
                            fontSize={{ base: "12px", sm: "13px" }}
                            fontWeight="600"
                            color={BRAND_COLORS.neutralText}
                            lineClamp={1}
                          >
                            {plan.contractNo}
                          </Text>
                          <Text fontSize="12px" color={BRAND_COLORS.grey}>
                            Mode: {plan.mode}
                          </Text>
                          <Text fontSize="12px" color={BRAND_COLORS.grey}>
                            Effective Date: {plan.effectiveDate}
                          </Text>
                          <Text
                            mt={{ base: "6px", sm: "12px" }}
                            fontSize="13px"
                            color={BRAND_COLORS.neutralText}
                          >
                            Amount Due:{" "}
                            <Text as="span" fontWeight="700">
                              P {formatCurrency(getSelectedPlanTotal(plan))}
                            </Text>
                          </Text>
                        </VStack>

                        <HStack
                          alignSelf={{ base: "flex-start", sm: "flex-end" }}
                          gap={0}
                          borderWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                          borderRadius={STANDARD_RADIUS.sm}
                          overflow="hidden"
                          bg={BRAND_COLORS.white}
                          flexShrink={0}
                        >
                          <Button
                            aria-label="Decrease installment"
                            variant="ghost"
                            w="28px"
                            minW="28px"
                            h="28px"
                            borderRadius="0"
                            color={BRAND_COLORS.grey}
                            _hover={{ bg: BRAND_COLORS.subtleBg }}
                            onClick={() =>
                              updateInstallmentNumber(plan.contractNo, -1)
                            }
                            disabled={
                              getInstallmentNumber(plan.contractNo) <= 1
                            }
                          >
                            <LuMinus size={12} />
                          </Button>
                          <Box
                            w="34px"
                            h="28px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderLeftWidth="1px"
                            borderRightWidth="1px"
                            borderColor={BRAND_COLORS.neutralBorder}
                          >
                            <Text
                              fontSize="14px"
                              fontWeight="700"
                              color={BRAND_COLORS.neutralText}
                            >
                              {getInstallmentNumber(plan.contractNo)}
                            </Text>
                          </Box>
                          <Button
                            aria-label="Increase installment"
                            variant="ghost"
                            w="28px"
                            minW="28px"
                            h="28px"
                            borderRadius="0"
                            color={BRAND_COLORS.grey}
                            _hover={{ bg: BRAND_COLORS.subtleBg }}
                            onClick={() =>
                              updateInstallmentNumber(plan.contractNo, 1)
                            }
                          >
                            <LuPlus size={12} />
                          </Button>
                        </HStack>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
              {/* <SideDrawer
                open={sideDrawerOpen}
                onOpenChange={(open) => {
                  setSideDrawerOpen(open);
                  if (!open) setSideDrawerPlan(null);
                }}
                title={
                  sideDrawerPlan ? `${sideDrawerPlan.plan}` : "Plan Details"
                }
                tabs={
                  sideDrawerPlan
                    ? [
                        {
                          label: "Information",
                          value: "info",
                          sections: [{ title: "Plan Information", rows: [] }],
                        },
                        {
                          label: "Documents",
                          value: "documents",
                          sections: [],
                        },
                      ]
                    : []
                }
                badges={
                  sideDrawerPlan ? [{ label: "Due", tone: "error" }] : undefined
                }
                headerChildren={
                  sideDrawerPlan ? (
                    <HStack gap={STANDARD_SPACING.xs} wrap="wrap">
                      <Button>Transfer Plan</Button>
                      <Button variant="outline">Test Button</Button>
                    </HStack>
                  ) : null
                }
                sections={
                  sideDrawerPlan
                    ? [
                        {
                          title: "Plan Information",
                          rows: [
                            {
                              label: "Contract No.",
                              value: sideDrawerPlan.contractNo,
                            },
                            { label: "Mode", value: sideDrawerPlan.mode },
                            {
                              label: "Amount Due",
                              value: `P ${sideDrawerPlan.amountDue}`,
                            },
                            {
                              label: "Effective Date",
                              value: sideDrawerPlan.effectiveDate,
                            },
                            {
                              label: "Due Date",
                              value: sideDrawerPlan.dueDate,
                            },
                            {
                              label: "Balance",
                              value: `P ${sideDrawerPlan.balance}`,
                            },
                          ],
                        },
                      ]
                    : []
                }
              /> */}
            </VStack>
          </Page.Row>

          <Page.Row>
            <VStack display="none" align="stretch" gap={STANDARD_SPACING.sm}>
              {filteredActivePlans.map((plan) => {
                const isSelected = isPlanSelected(plan.contractNo);
                const isExpanded = expandedPlans.has(plan.contractNo);

                return (
                  <Box
                    key={plan.contractNo}
                    bg={BRAND_COLORS.white}
                    borderWidth="1px"
                    borderColor={
                      isSelected
                        ? BRAND_COLORS.primaryGreen
                        : BRAND_COLORS.neutralBorder
                    }
                    borderRadius={STANDARD_RADIUS.xl}
                    overflow="hidden"
                    boxShadow={STANDARD_SHADOWS.level2}
                    transition="border-color 150ms ease-out, box-shadow 150ms ease-out"
                  >
                    <VStack
                      align="stretch"
                      gap={STANDARD_SPACING.xs}
                      p={STANDARD_SPACING.sm}
                    >
                      <Flex align="flex-start" justify="space-between" gap={3}>
                        <HStack align="flex-start" gap="10px" minW={0}>
                          <Box
                            w="34px"
                            h="34px"
                            borderRadius={STANDARD_RADIUS.full}
                            bg={BRAND_COLORS.subtleBg}
                            color={BRAND_COLORS.neutralText}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <LuUser size={16} />
                          </Box>
                          <VStack align="start" gap="2px" minW={0}>
                            <Text
                              fontWeight="800"
                              fontSize="15px"
                              color={BRAND_COLORS.neutralText}
                              lineClamp={1}
                            >
                              {plan.plan}
                            </Text>
                            <Text
                              fontSize="11px"
                              color={BRAND_COLORS.grey}
                              lineClamp={1}
                            >
                              ID {plan.contractNo}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack gap="8px" flexShrink={0}>
                          <Box
                            w="7px"
                            h="7px"
                            borderRadius={STANDARD_RADIUS.full}
                            bg={
                              isSelected
                                ? BRAND_COLORS.primaryGreen
                                : BRAND_COLORS.grey
                            }
                          />
                          <Badge
                            bg={
                              isSelected
                                ? BRAND_COLORS.successBg
                                : BRAND_COLORS.mutedBg
                            }
                            color={
                              isSelected
                                ? BRAND_COLORS.primaryGreen
                                : BRAND_COLORS.neutralText
                            }
                            borderRadius={STANDARD_RADIUS.sm}
                            px="8px"
                            py="4px"
                            fontSize="11px"
                            fontWeight="700"
                          >
                            {isSelected ? "Selected" : "Due"}
                          </Badge>
                        </HStack>
                      </Flex>

                      <HStack gap="8px" flexWrap="wrap">
                        <HStack
                          gap="5px"
                          px="9px"
                          py="5px"
                          borderWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                          borderRadius={STANDARD_RADIUS.full}
                          color={BRAND_COLORS.neutralText}
                        >
                          <LuCalendar size={12} />
                          <Text fontSize="11px" fontWeight="600">
                            {plan.dueDate}
                          </Text>
                        </HStack>

                        <HStack
                          gap="5px"
                          px="9px"
                          py="5px"
                          borderWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                          borderRadius={STANDARD_RADIUS.full}
                          color={BRAND_COLORS.neutralText}
                        >
                          <LuMapPin size={12} />
                          <Text fontSize="11px" fontWeight="600">
                            {plan.mode}
                          </Text>
                        </HStack>
                      </HStack>

                      <HStack align="center" gap="7px" minW={0}>
                        <LuUser size={13} color={BRAND_COLORS.grey} />
                        <Text
                          fontSize="13px"
                          color={BRAND_COLORS.neutralText}
                          lineClamp={1}
                        >
                          Effective: {plan.effectiveDate}
                        </Text>
                      </HStack>

                      <HStack
                        align="center"
                        justify="space-between"
                        gap={STANDARD_SPACING.xs}
                      >
                        <HStack
                          gap="6px"
                          px="10px"
                          py="6px"
                          borderRadius={STANDARD_RADIUS.full}
                          bg="#EFF6FF"
                          color="#2563EB"
                          minW={0}
                        >
                          <LuCircleDollarSign size={13} />
                          <Text fontSize="12px" fontWeight="700" lineClamp={1}>
                            P {formatCurrency(getSelectedPlanTotal(plan))}
                          </Text>
                        </HStack>

                        <Checkbox.Root
                          checked={isSelected}
                          onCheckedChange={() => toggleContract(plan)}
                          flexShrink={0}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label
                            color={BRAND_COLORS.neutralText}
                            fontSize="12px"
                            fontWeight="700"
                          >
                            {isSelected ? "Remove" : "Add"}
                          </Checkbox.Label>
                        </Checkbox.Root>
                      </HStack>

                      {isExpanded ? (
                        <Box
                          borderTopWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                          pt={STANDARD_SPACING.xs}
                        >
                          <Flex align="center" justify="space-between" gap={3}>
                            <VStack align="start" gap="1px">
                              <Text fontSize="11px" color={BRAND_COLORS.grey}>
                                Balance
                              </Text>
                              <Text
                                fontSize="13px"
                                fontWeight="800"
                                color={BRAND_COLORS.neutralText}
                              >
                                P {plan.balance}
                              </Text>
                            </VStack>

                            <HStack
                              gap={0}
                              borderWidth="1px"
                              borderColor={BRAND_COLORS.neutralBorder}
                              borderRadius={STANDARD_RADIUS.md}
                              overflow="hidden"
                              bg={BRAND_COLORS.white}
                            >
                              <Button
                                aria-label="Decrease installment"
                                variant="ghost"
                                w="34px"
                                minW="34px"
                                h="34px"
                                borderRadius="0"
                                color={BRAND_COLORS.primaryGreen}
                                _hover={{ bg: BRAND_COLORS.subtleBg }}
                                onClick={() =>
                                  updateInstallmentNumber(plan.contractNo, -1)
                                }
                                disabled={
                                  getInstallmentNumber(plan.contractNo) <= 1
                                }
                              >
                                <LuMinus size={14} />
                              </Button>

                              <Box
                                w="34px"
                                h="34px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                borderLeftWidth="1px"
                                borderRightWidth="1px"
                                borderColor={BRAND_COLORS.neutralBorder}
                              >
                                <Text
                                  fontSize="13px"
                                  fontWeight="800"
                                  color={BRAND_COLORS.neutralText}
                                >
                                  {getInstallmentNumber(plan.contractNo)}
                                </Text>
                              </Box>

                              <Button
                                aria-label="Increase installment"
                                variant="ghost"
                                w="34px"
                                minW="34px"
                                h="34px"
                                borderRadius="0"
                                color={BRAND_COLORS.primaryGreen}
                                _hover={{ bg: BRAND_COLORS.subtleBg }}
                                onClick={() =>
                                  updateInstallmentNumber(plan.contractNo, 1)
                                }
                              >
                                <LuPlus size={14} />
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      ) : null}

                      <Flex align="center" justify="space-between" pt="2px">
                        <Button
                          variant="plain"
                          h="24px"
                          minW="auto"
                          px={0}
                          color={BRAND_COLORS.grey}
                          fontSize="12px"
                          fontWeight="600"
                          onClick={() => togglePlanExpanded(plan.contractNo)}
                        >
                          {isExpanded ? "Hide details" : "Tap for details"}
                        </Button>
                        <HStack gap="4px" color={BRAND_COLORS.neutralText}>
                          <Text fontSize="12px" fontWeight="800">
                            {plan.contractNo}
                          </Text>
                          <LuChevronRight size={14} />
                        </HStack>
                      </Flex>
                    </VStack>

                    <Box
                      display="none"
                      h="1px"
                      bg={BRAND_COLORS.neutralBorder}
                    />

                    {/* Bottom row: amount due + stepper */}
                    <HStack
                      display="none"
                      justify="space-between"
                      align="center"
                      px={STANDARD_SPACING.sm}
                      py="10px"
                    >
                      <VStack align="start" gap="1px">
                        <Text
                          fontSize="11px"
                          color={BRAND_COLORS.grey}
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="0.04em"
                        >
                          Amount Due
                        </Text>
                        <Text
                          fontWeight="700"
                          fontSize="15px"
                          color={BRAND_COLORS.darkGreen}
                        >
                          ₱ {formatCurrency(getSelectedPlanTotal(plan))}
                        </Text>
                      </VStack>

                      <HStack
                        gap={0}
                        borderWidth="1px"
                        borderColor={BRAND_COLORS.neutralBorder}
                        borderRadius={STANDARD_RADIUS.md}
                        overflow="hidden"
                        bg={BRAND_COLORS.white}
                      >
                        <Button
                          aria-label="Decrease installment"
                          variant="ghost"
                          w="38px"
                          minW="38px"
                          h="38px"
                          borderRadius="0"
                          color={BRAND_COLORS.primaryGreen}
                          _hover={{ bg: BRAND_COLORS.subtleBg }}
                          onClick={() =>
                            updateInstallmentNumber(plan.contractNo, -1)
                          }
                          disabled={getInstallmentNumber(plan.contractNo) <= 1}
                        >
                          −
                        </Button>

                        <Box
                          w="38px"
                          h="38px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderLeftWidth="1px"
                          borderRightWidth="1px"
                          borderColor={BRAND_COLORS.neutralBorder}
                        >
                          <Text
                            fontSize="14px"
                            fontWeight="700"
                            color={BRAND_COLORS.neutralText}
                          >
                            {getInstallmentNumber(plan.contractNo)}
                          </Text>
                        </Box>

                        <Button
                          aria-label="Increase installment"
                          variant="ghost"
                          w="38px"
                          minW="38px"
                          h="38px"
                          borderRadius="0"
                          color={BRAND_COLORS.primaryGreen}
                          _hover={{ bg: BRAND_COLORS.subtleBg }}
                          onClick={() =>
                            updateInstallmentNumber(plan.contractNo, 1)
                          }
                        >
                          +
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* ── PAYMENT SUMMARY — only visible when ≥1 plan is selected ────── */}
      {selectedPlans.length > 0 && (
        <Box
          position="fixed"
          bottom={{
            // Clear the floating bottom-nav pill (sits at 1.25rem, ~75px tall)
            // so the summary never overlaps it on mobile.
            base: "calc(7rem + env(safe-area-inset-bottom))",
            md: STANDARD_SPACING.sm,
          }}
          left="50%"
          transform="translateX(-50%)"
          w={{
            base: "calc(100% - 32px)",
            md: "min(720px, calc(100% - 64px))",
          }}
          maxW="720px"
          bg={BRAND_COLORS.white}
          borderWidth="1px"
          borderColor={BRAND_COLORS.neutralBorder}
          borderRadius={STANDARD_RADIUS.lg}
          boxShadow={STANDARD_SHADOWS.level3}
          zIndex="20"
          overflow="hidden"
          css={{
            "@keyframes slideUp": {
              from: {
                opacity: 0,
                transform: "translateX(-50%) translateY(16px)",
              },
              to: {
                opacity: 1,
                transform: "translateX(-50%) translateY(0)",
              },
            },
            animation: "slideUp 180ms ease-out",
          }}
        >
          {/* Expandable breakdown — mobile only, hidden by default */}
          {summaryExpanded && (
            <Box
              display={{ base: "block", md: "none" }}
              borderBottomWidth="1px"
              borderColor={BRAND_COLORS.neutralBorder}
              bg={BRAND_COLORS.subtleBg}
              px={STANDARD_SPACING.sm}
              py={STANDARD_SPACING.sm}
            >
              <VStack align="stretch" gap={STANDARD_SPACING.xs}>
                {selectedPlans.map((plan, idx) => (
                  <Flex
                    key={plan.contractNo}
                    justify="space-between"
                    align="center"
                    gap={STANDARD_SPACING.sm}
                  >
                    <HStack gap="8px" minW={0}>
                      <Text
                        fontSize="22px"
                        fontWeight="800"
                        color={BRAND_COLORS.primaryGreen}
                        lineHeight="1"
                        flexShrink={0}
                      >
                        {idx + 1}
                      </Text>
                      <VStack align="start" gap={0} minW={0}>
                        <Text
                          fontSize="13px"
                          fontWeight="700"
                          color={BRAND_COLORS.neutralText}
                          lineClamp={1}
                        >
                          {plan.plan}
                        </Text>
                        <Text
                          fontSize="11px"
                          color={BRAND_COLORS.grey}
                          lineClamp={1}
                        >
                          {plan.contractNo} · {plan.mode} ×{" "}
                          {installmentNumbers[plan.contractNo] ?? 1}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color={BRAND_COLORS.darkGreen}
                      flexShrink={0}
                    >
                      ₱ {formatCurrency(getSelectedPlanTotal(plan))}
                    </Text>
                  </Flex>
                ))}

                {/* Total row */}
                <Box
                  borderTopWidth="1px"
                  borderColor={BRAND_COLORS.neutralBorder}
                  pt={STANDARD_SPACING.xs}
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color={BRAND_COLORS.grey}
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      Total
                    </Text>
                    <Text
                      fontSize="15px"
                      fontWeight="800"
                      color={BRAND_COLORS.darkGreen}
                    >
                      ₱ {formatCurrency(totalSelectedAmount)}
                    </Text>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Compact summary row + CTA — always visible */}
          <Flex
            align="center"
            justify="space-between"
            gap={STANDARD_SPACING.sm}
            px={STANDARD_SPACING.sm}
            py="12px"
          >
            {/* Left: tap area to expand breakdown on mobile */}
            <HStack
              gap="6px"
              minW={0}
              flex="1"
              cursor={{ base: "pointer", md: "default" }}
              onClick={() => setSummaryExpanded((v) => !v)}
              display={{ base: "flex", md: "none" }}
            >
              <VStack align="start" gap={0} minW={0}>
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color={BRAND_COLORS.primaryGreen}
                >
                  {selectedPlans.length} plan
                  {selectedPlans.length > 1 ? "s" : ""} selected
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="800"
                  color={BRAND_COLORS.neutralText}
                  lineHeight="1.3"
                >
                  ₱ {formatCurrency(totalSelectedAmount)}
                </Text>
              </VStack>
              <Box
                as={LuChevronDown}
                boxSize="16px"
                color={BRAND_COLORS.grey}
                flexShrink={0}
                transition="transform 200ms ease"
                transform={summaryExpanded ? "rotate(180deg)" : "rotate(0deg)"}
              />
            </HStack>

            {/* Left: desktop (no expand toggle) */}
            <Box minW={0} display={{ base: "none", md: "block" }}>
              <Text
                fontSize="12px"
                fontWeight="600"
                color={BRAND_COLORS.primaryGreen}
              >
                {selectedPlans.length} plan
                {selectedPlans.length > 1 ? "s" : ""} selected
              </Text>
              <Text
                fontSize="18px"
                fontWeight="800"
                color={BRAND_COLORS.neutralText}
                lineHeight="1.3"
              >
                ₱ {formatCurrency(totalSelectedAmount)}
              </Text>
            </Box>

            <BaseButton
              flexShrink={0}
              minW={{ base: "110px", sm: "150px" }}
              h={STANDARD_SIZES.button.lg.height}
              disabled={isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? "Processing..." : "Pay Now"}
            </BaseButton>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default PayMyPlan;
