"use client";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { LuChevronRight } from "react-icons/lu";

function formatPeso(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH");
}

export function LPANumberButton({
  plan,
  isSelected,
  onClick,
  personId,
}: {
  plan: PlanDetailType;
  isSelected: boolean;
  onClick: () => void;
  personId?: string;
}) {
  const progress = Math.min(
    100,
    Math.round((plan.installmentAmount / plan.totalAmountPayable) * 100),
  );

  if (isSelected) {
    const nextDue =
      plan.newEffectivityDate instanceof Date
        ? plan.newEffectivityDate.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        : "—";

    return (
      <Box
        borderRadius="xl"
        cursor="pointer"
        p={4}
        bg="linear-gradient(135deg, #1aad58 0%, #109448 50%, #006838 100%)"
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
                {plan.lpaNumber}
              </Box>
            </Box>
            <Box
              px={2}
              py="2px"
              borderRadius="full"
              bg={
                plan.accountStatus === "LAPSED"
                  ? "orange.400"
                  : "whiteAlpha.200"
              }
              fontSize="xs"
              color="white"
              fontWeight="semibold"
              letterSpacing="wide"
            >
              {plan.accountStatus}
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
            >
              {plan.planDescription}
            </Box>
            <Box fontSize="xs" color="whiteAlpha.800" mt="2px">
              {plan.mode} · {plan.term} year{plan.term !== 1 ? "s" : ""} ·{" "}
              {plan.branch}
            </Box>
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
                Paid {formatPeso(plan.installmentAmount)}
              </Box>
              <Box fontSize="xs" color="white" fontWeight="bold">
                {progress}%
              </Box>
            </Flex>
            <Box h="3px" borderRadius="full" bg="whiteAlpha.300">
              <Box
                h="full"
                borderRadius="full"
                bg="white"
                w={`${progress}%`}
                transition="width 0.4s ease"
              />
            </Box>
          </Box>

          {/* Next due + Pay button */}
          <Flex align="flex-end" justify="space-between">
            <Box>
              <Box
                fontSize="9px"
                color="whiteAlpha.700"
                letterSpacing="widest"
                textTransform="uppercase"
                mb="1px"
              >
                Next Due {nextDue}
              </Box>
              <Box fontSize="lg" fontWeight="bold" color="white">
                {formatPeso(plan.installmentAmount)}
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
              >
                View Details
              </Button>
              {personId && plan.accountStatus !== "LAPSED" && (
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
                    window.location.href = `/plan-management/planholder/${personId}/pay-my-plan`;
                  }}
                >
                  Pay
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
              {plan.lpaNumber}
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
            bg={plan.accountStatus === "LAPSED" ? "orange.50" : "green.50"}
            flexShrink={0}
          >
            <Box
              w="5px"
              h="5px"
              borderRadius="full"
              bg={plan.accountStatus === "LAPSED" ? "orange.400" : "green.400"}
            />
            <Text
              fontSize="10px"
              fontWeight="semibold"
              color={
                plan.accountStatus === "LAPSED" ? "orange.600" : "green.600"
              }
            >
              {plan.accountStatus}
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
            {formatPeso(plan.installmentAmount)} paid
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
            {formatPeso(plan.totalAmountPayable)} total
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
