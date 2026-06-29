"use client";

import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Grid,
  HStack,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BaseButton, Body, PrimaryMdButton, Small } from "st-peter-ui";
import { HiInformationCircle } from "react-icons/hi";
import { useEffect, useMemo, useState } from "react";
import Page from "@/components/layout/page/Page";

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

const tableHeaders = [
  "Contract No.",
  "Plan",
  "Mode",
  "Amount Due (P)",
  "Effective Date",
  "Due Date",
  "Balance (P)",
  "Actions",
];

type ActivePlan = (typeof activePlans)[number];

const parseAmount = (value: string) => Number(value.replace(/,/g, ""));

const PayMyPlan = () => {
  const [selectedPlans, setSelectedPlans] = useState<ActivePlan[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PAY_MY_PLAN_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ActivePlan[];
      if (!Array.isArray(parsed)) return;
      const validPlans = parsed.filter((storedPlan) =>
        activePlans.some((plan) => plan.contractNo === storedPlan.contractNo),
      );
      setSelectedPlans(validPlans);
    } catch {
      sessionStorage.removeItem(PAY_MY_PLAN_STORAGE_KEY);
    }
  }, []);

  const totalSelectedAmount = useMemo(() => {
    return selectedPlans.reduce(
      (total, plan) => total + parseAmount(plan.amountDue),
      0,
    );
  }, [selectedPlans]);

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
      return [...prev, planToToggle];
    });
  };

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
    if (selectedPlans.length === 0) return;
    setIsCheckingOut(true);
    try {
      // const payload = selectedPlans.map((plan) => ({
      //   planDesc: plan.plan,
      //   productCode: plan.contractNo,
      //   contractPrice: parseAmount(plan.balance),
      //   ipInstAmt: parseAmount(plan.amountDue),
      //   planTerm: 5,
      //   quantity: 1,
      // }));
      // const { checkoutUrl } = await PayMongoService.createCheckout(payload);
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
        subtitle="SPLPI-22-000021"
        title="Pay My Plan"
        description="Select one or more active plans to prepare your payment in one go."
      >
        <Page.MainContent>
          {/* Summary stats */}
          <Page.Row>
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap={{ base: "3", md: "4" }}
            >
              <Box
                bg="gray.50"
                rounded="md"
                p={{ base: "4", md: "5" }}
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _hover={{ borderColor: "green.300", bg: "green.50" }}
              >
                <Small color="gray.600" fontWeight="600" fontSize="xs">
                  Active Plans
                </Small>
                <Text
                  color="green.700"
                  fontWeight="700"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  mt="2"
                >
                  {activePlans.length}
                </Text>
              </Box>

              <Box
                bg="gray.50"
                rounded="md"
                p={{ base: "4", md: "5" }}
                border="1px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _hover={{ borderColor: "green.300", bg: "green.50" }}
              >
                <Small color="gray.600" fontWeight="600" fontSize="xs">
                  Amount to Pay
                </Small>
                <Text
                  color="green.700"
                  fontWeight="700"
                  fontSize={{ base: "xl", md: "2xl" }}
                  mt="2"
                >
                  P{" "}
                  {totalSelectedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Box>
            </Grid>
          </Page.Row>

          {/* Info banner */}
          <Page.Row>
            <HStack
              gap="2"
              color="green.700"
              align="center"
              p="3"
              rounded="lg"
              bg="green.50"
              border="1px solid"
              borderColor="green.100"
            >
              <Box as={HiInformationCircle} boxSize={{ base: "8", md: "6" }} />
              <Body>
                Tap Add / Checkbox to include a plan. You can remove it anytime
                before checkout.
              </Body>
            </HStack>
          </Page.Row>

          {/* Desktop table */}
          <Page.Row>
            <Box display={{ base: "none", lg: "block" }}>
              <Box
                border="1px solid"
                borderColor="green.200"
                rounded="2xl"
                overflowX="auto"
                bg="white"
              >
                <Box as="table" w="full" minW="980px" borderCollapse="collapse">
                  <Box as="thead" bg="#177D54" color="white">
                    <Box as="tr">
                      {tableHeaders.map((header) => (
                        <Box
                          as="th"
                          key={header}
                          textAlign="left"
                          px="4"
                          py="3"
                          fontSize="sm"
                          fontWeight="700"
                          borderBottom="1px solid"
                          borderColor="green.800"
                        >
                          {header}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box as="tbody">
                    {activePlans.map((plan) => {
                      const isSelected = selectedPlans.some(
                        (s) => s.contractNo === plan.contractNo,
                      );
                      return (
                        <Box
                          as="tr"
                          key={plan.contractNo}
                          bg={isSelected ? "green.50" : "white"}
                          _hover={{ bg: "green.50" }}
                          transition="background-color 0.35s ease-in-out"
                        >
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                          >
                            <Text color="green.900" fontSize="sm">
                              {plan.contractNo}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                          >
                            <Text
                              color="green.900"
                              fontWeight="600"
                              fontSize="sm"
                            >
                              {plan.plan}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                          >
                            <Text color="green.800" fontSize="sm">
                              {plan.mode}
                            </Text>
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                            color="green.900"
                            fontSize="sm"
                          >
                            {plan.amountDue}
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                            color="green.900"
                            fontSize="sm"
                          >
                            {plan.effectiveDate}
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                            color="green.900"
                            fontSize="sm"
                          >
                            {plan.dueDate}
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                            color="green.900"
                            fontWeight="600"
                            fontSize="sm"
                          >
                            {plan.balance}
                          </Box>
                          <Box
                            as="td"
                            px="4"
                            py="4"
                            borderBottom="1px solid"
                            borderColor="green.100"
                          >
                            <PrimaryMdButton
                              minW="100px"
                              onClick={() => toggleContract(plan)}
                            >
                              {isSelected ? "REMOVE" : "Add"}
                            </PrimaryMdButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Page.Row>

          {/* Mobile cards */}
          <Page.Row>
            <Box pb={"100px"} display={{ base: "block", lg: "none" }}>
              <VStack align="stretch" gap="3">
                {activePlans.map((plan) => {
                  const isSelected = selectedPlans.some(
                    (s) => s.contractNo === plan.contractNo,
                  );
                  const isExpanded = expandedPlans.has(plan.contractNo);

                  return (
                    <Box
                      key={plan.contractNo}
                      rounded="xl"
                      border="1px solid"
                      borderColor={isSelected ? "green.500" : "gray.200"}
                      bg={isSelected ? "green.50" : "white"}
                      overflow="hidden"
                      shadow={isSelected ? "sm" : "none"}
                    >
                      <Box
                        p="4"
                        cursor="pointer"
                        onClick={() => togglePlanExpanded(plan.contractNo)}
                        _hover={{ bg: isSelected ? "green.100" : "gray.50" }}
                        transition="background-color 0.2s ease-in-out"
                      >
                        <Flex justify="space-between" align="start" gap="4">
                          <Box flex="1">
                            <Small color="green.700" fontWeight="600">
                              {plan.contractNo}
                            </Small>
                            <Text
                              color="green.900"
                              fontWeight="700"
                              fontSize="lg"
                            >
                              {plan.plan}
                            </Text>
                            <Body color="green.700" fontSize="sm" mt="1">
                              {plan.mode}
                            </Body>
                          </Box>
                          <Flex direction="column" align="end" gap="2">
                            <Box textAlign="right" display="flex" gap={4}>
                              <Badge
                                bg="green.700"
                                color="white"
                                rounded="full"
                                px="3"
                                py="1"
                                whiteSpace="nowrap"
                              >
                                P {plan.amountDue}
                              </Badge>
                              <Badge bg="red.500" color="white">
                                Due
                              </Badge>
                            </Box>
                            <Checkbox.Root
                              checked={isSelected}
                              onCheckedChange={() => toggleContract(plan)}
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                            </Checkbox.Root>
                          </Flex>
                        </Flex>
                      </Box>

                      {isExpanded && (
                        <>
                          <Separator borderColor="gray.200" />
                          <Box p="4">
                            <Grid templateColumns="repeat(2, 1fr)" gap="4">
                              <Box>
                                <Small color="green.600" fontWeight="600">
                                  Effective Date
                                </Small>
                                <Body fontWeight="600" color="green.900">
                                  {plan.effectiveDate}
                                </Body>
                              </Box>
                              <Box>
                                <Small color="green.600" fontWeight="600">
                                  Due Date
                                </Small>
                                <Body fontWeight="600" color="green.900">
                                  {plan.dueDate}
                                </Body>
                              </Box>
                              <Box gridColumn="1 / -1">
                                <Small color="green.600" fontWeight="600">
                                  Balance
                                </Small>
                                <Body
                                  fontWeight="700"
                                  color="green.900"
                                  fontSize="lg"
                                >
                                  P {plan.balance}
                                </Body>
                              </Box>
                            </Grid>
                          </Box>
                        </>
                      )}

                      {!isExpanded && <Separator borderColor="gray.200" />}
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>

      {/* Fixed payment summary bar */}
      <Box
        position="fixed"
        bottom={{ base: "calc(7rem + env(safe-area-inset-bottom))", md: "4" }}
        left={{ base: "50%", md: "50%" }}
        transform="translateX(-50%)"
        w={{ base: "sm", md: "min(720px, calc(100% - 2rem))" }}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        rounded="2xl"
        px="4"
        py="4"
        shadow="md"
        zIndex="20"
      >
        <Flex
          align="center"
          justify="space-between"
          gap={{ base: "2", md: "4" }}
          whiteSpace="nowrap"
        >
          <Box>
            <Small color="green.700">Payment Summary</Small>
            <Text
              color="green.900"
              fontWeight="700"
              fontSize={{ base: "sm", md: "lg" }}
            >
              {selectedPlans.length} plan(s) • P{" "}
              {totalSelectedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Box>
          <BaseButton
            w={{ base: "5", md: "sm" }}
            disabled={selectedPlans.length === 0 || isCheckingOut}
            minW="180px"
            onClick={handleCheckout}
          >
            {isCheckingOut ? "Processing..." : "Payment"}
          </BaseButton>
        </Flex>
      </Box>
    </>
  );
};

export default PayMyPlan;
