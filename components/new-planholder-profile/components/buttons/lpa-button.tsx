import { Flex, VStack, Strong } from "@chakra-ui/react";
import { FaRegFileAlt } from "react-icons/fa";
import { Badge } from "../badge/badge";
import { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export function LPANumberButton({
  plan,
  isSelected,
  onClick,
}: {
  plan: PlanDetailType;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Flex
      key={plan.lpaNumber}
      align={"center"}
      justify={"justify-start"}
      width={"full"}
      borderRadius={STANDARD_RADIUS.md}
      borderWidth="1px"
      borderColor={isSelected ? BRAND_COLORS.primaryGreen : "gray.200"}
      cursor={"pointer"}
      boxShadow={isSelected ? STANDARD_SHADOWS.level1 : "none"}
      p={{ base: 3, md: 4 }}
      gap={3}
      _hover={{
        bg: BRAND_COLORS.successBg,
        borderColor: BRAND_COLORS.primaryGreen,
      }}
      onClick={onClick}
      bg={isSelected ? BRAND_COLORS.successBg : "white"}
    >
      <FaRegFileAlt size={22} color={BRAND_COLORS.primaryGreen} />
      <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
        <Strong>{plan.lpaNumber}</Strong>
        <Flex gap={2} wrap="wrap">
          <Badge type={plan.accountStatus === "LAPSED" ? "warning" : "success"}>
            {plan.accountStatus}
          </Badge>
          <Badge
            type={
              plan.terminationStatus === "NOT YET TERMINATED"
                ? "success"
                : "info"
            }
          >
            {plan.terminationStatus}
          </Badge>
        </Flex>
      </VStack>
    </Flex>
  );
}
