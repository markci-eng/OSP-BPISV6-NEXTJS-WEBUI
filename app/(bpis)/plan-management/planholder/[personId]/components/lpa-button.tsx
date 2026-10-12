"use client";
import { PlanOverview } from "@/types/plan-management.types";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "osp-ui-kit";
import { LuChevronRight } from "react-icons/lu";

function formatPeso(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH");
}

function LabeledValue({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Box
        fontSize="9px"
        color="whiteAlpha.700"
        letterSpacing="widest"
        textTransform="uppercase"
        mb="1px"
      >
        {label}
      </Box>
      <Box fontSize="xs" color="whiteAlpha.900" fontWeight="medium">
        {value}
      </Box>
    </Box>
  );
}

export function LPANumberButton({
  plan,
  isSelected,
  onClick,
  personId,
}: {
  plan: PlanOverview;
  isSelected: boolean;
  onClick: () => void;
  personId?: string;
}) {
  const instPerAnnum =
    plan.mode === "MONTHLY"
      ? 12
      : plan.mode === "QUARTERLY"
        ? 4
        : plan.mode === "SEMI-ANNUAL"
          ? 2
          : plan.mode === "ANNUAL"
            ? 1
            : 0;
  const totalInstallments = instPerAnnum * plan.term;
  // A percentage, 0 when the mode is unknown (no installments to divide by).
  const progress =
    totalInstallments > 0
      ? Math.min(
          Math.round(((plan.installmentNo ?? 0) / totalInstallments) * 100),
          100,
        )
      : 0;
  const totalPayments = (plan.amountDue ?? 0) * (plan.installmentNo ?? 0);
  // const statement = getPlanStatement(plan);
  // const progress = statement.progress;
  // const totalInstallments = statement.totalInstallments;
  // const paidInstallments = statement.installmentsPaid;

  if (isSelected) {
    const nextDue = plan.dueDate
      ? new Date(plan.dueDate).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : undefined;

    return (
      <Box
        borderRadius="xl"
        cursor="pointer"
        p={4}
        bg={`linear-gradient(135deg, #1aad58 0%, ${BRAND_COLORS.primaryGreen} 50%, ${BRAND_COLORS.darkGreen} 100%)`}
        onClick={onClick}
        position="relative"
        overflow="hidden"
      >
        {/* decorative circles */}
        <Box
          position="absolute"
          right="-20px"
          top="-20px"
          w="90px"
          h="90px"
          borderRadius="full"
          bg="whiteAlpha.100"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          right="30px"
          top="-36px"
          w="70px"
          h="70px"
          borderRadius="full"
          bg="whiteAlpha.100"
          pointerEvents="none"
        />

        <Flex direction="column" gap={3}>
          {/* LPA number + status badge */}
          <Flex align="flex-start" justify="space-between">
            <Box>
              <Box
                fontSize="9px"
                color="whiteAlpha.700"
                letterSpacing="widest"
                textTransform="uppercase"
                mb="1px"
              >
                LPA Number
              </Box>
              <Box fontSize="sm" fontWeight="bold" color="white">
                {plan.lpaNo}
              </Box>
            </Box>
            <Box
              px={2}
              py="2px"
              borderRadius="full"
              bg={
                plan.terminationStatus !== "NOT YET TERMINATED"
                  ? "red.500"
                  : plan.accountStatus === "LAPSED"
                    ? "orange.400"
                    : "whiteAlpha.200"
              }
              fontSize="xs"
              color="white"
              fontWeight="semibold"
              letterSpacing="wide"
            >
              {plan.terminationStatus !== "NOT YET TERMINATED"
                ? plan.terminationStatus
                : plan.accountStatus}
            </Box>
          </Flex>

          {/* Plan name + subtitle */}
          <Box>
            <Box
              fontSize="xl"
              fontWeight="extrabold"
              color="white"
              lineHeight="short"
              letterSpacing="tight"
              mb={2}
            >
              {plan.planDescription}
            </Box>
            <Flex gap={4}>
              <LabeledValue label="Mode" value={plan.mode} />
              <LabeledValue
                label="Term"
                value={`${plan.term} year${plan.term !== 1 ? "s" : ""}`}
              />
              <LabeledValue label="Branch" value={plan.branch} />
            </Flex>
          </Box>

          {/* Progress */}
          <Box>
            <Flex justify="space-between" mb={1}>
              <Box
                fontSize="xs"
                color="whiteAlpha.800"
                fontWeight="medium"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {plan.installmentNo} of {totalInstallments} PAID
              </Box>
              <Flex align="center" gap={1} direction="row">
                <Box
                  fontSize="9px"
                  color="whiteAlpha.700"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  mb="1px"
                >
                  DUE:
                </Box>{" "}
                <Box fontSize="xs" color="white" fontWeight="bold">
                  {nextDue}
                </Box>
              </Flex>
            </Flex>
          </Box>

          {/* Amount due + Pay button */}
          <Flex align="flex-end" justify="space-between">
            <Box>
              <Box
                fontSize="9px"
                color="whiteAlpha.700"
                letterSpacing="widest"
                textTransform="uppercase"
                mb="1px"
              >
                Amount Due
              </Box>
              <Box fontSize="lg" fontWeight="bold" color="white">
                {formatPeso(plan.amountDue ?? 0)}
              </Box>
            </Box>
            <Flex gap={2}>
              <Button
                size="sm"
                bg="white"
                color="var(--chakra-colors-primary)"
                _hover={{ bg: "gray.50" }}
                borderRadius="2xl"
                fontWeight="semibold"
                px={3}
                display={{ base: "block", lg: "none" }}
              >
                View Details
              </Button>
              {personId &&
                plan.accountStatus !== "LAPSED" &&
                plan.accountStatus !== "FULLY PAID" &&
                plan.terminationStatus === "NOT YET TERMINATED" && (
                  <Button
                    size="sm"
                    bg="white"
                    color="var(--chakra-colors-primary)"
                    _hover={{ bg: "gray.50" }}
                    borderRadius="2xl"
                    fontWeight="semibold"
                    px={5}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/plan-management/planholder/${personId}/pay?lpaNumber=${encodeURIComponent(plan.lpaNo)}`;
                    }}
                  >
                    Pay via QR
                  </Button>
                )}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      cursor="pointer"
      w="full"
      transition="box-shadow 0.15s, border-color 0.15s"
      _hover={{
        boxShadow: "md",
        borderColor: "var(--chakra-colors-primary-disabled)",
      }}
      onClick={onClick}
    >
      <Box px={4} pt={3} pb={4}>
        {/* Header row */}
        <Flex align="flex-start" justify="space-between" gap={2} mb={2}>
          <Box minW={0}>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="gray.800"
              lineClamp={1}
            >
              {plan.lpaNo}
            </Text>
            <Text
              fontSize="xs"
              color="var(--chakra-colors-primary)"
              fontWeight="medium"
              lineClamp={1}
              mt="1px"
            >
              {plan.planDescription}
            </Text>
          </Box>
          <Flex
            align="center"
            gap={1.5}
            px={2}
            py={1}
            borderRadius="full"
            bg={
              plan.terminationStatus !== "NOT YET TERMINATED"
                ? "red.100"
                : plan.accountStatus === "LAPSED"
                  ? "orange.50"
                  : "green.50"
            }
            flexShrink={0}
          >
            <Box
              w="5px"
              h="5px"
              borderRadius="full"
              bg={
                plan.terminationStatus !== "NOT YET TERMINATED"
                  ? "red.500"
                  : plan.accountStatus === "LAPSED"
                    ? "orange.400"
                    : "green.400"
              }
            />
            <Text
              fontSize="10px"
              fontWeight="semibold"
              color={
                plan.terminationStatus !== "NOT YET TERMINATED"
                  ? "red.600"
                  : plan.accountStatus === "LAPSED"
                    ? "orange.600"
                    : "green.600"
              }
            >
              {plan.terminationStatus !== "NOT YET TERMINATED"
                ? plan.terminationStatus
                : plan.accountStatus}
            </Text>
          </Flex>
        </Flex>

        {/* Mode · Term · Branch */}
        <Text fontSize="xs" color="gray.400" mb={3} lineClamp={1}>
          {plan.mode} · {plan.term} year{plan.term !== 1 ? "s" : ""} ·{" "}
          {plan.branch}
        </Text>

        {/* Progress label */}
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="xs" color="gray.500">
            {formatPeso(totalPayments)} paid
          </Text>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            {progress}%
          </Text>
        </Flex>

        {/* Progress bar */}
        <Box h="3px" borderRadius="full" bg="gray.100" mb={3}>
          <Box
            h="full"
            borderRadius="full"
            bg="var(--chakra-colors-primary)"
            w={`${progress}%`}
            transition="width 0.4s ease"
          />
        </Box>

        {/* Footer */}
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.400">
            {formatPeso(plan.planTAP ?? 0)} total
          </Text>
          <Flex align="center" gap={1} color="gray.400">
            <Text fontSize="10px" fontFamily="mono">
              View details
            </Text>
            <LuChevronRight size={11} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
