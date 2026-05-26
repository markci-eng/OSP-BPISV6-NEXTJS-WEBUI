import {
  Flex,
  Input,
  InputGroup,
  Popover,
  Portal,
  Separator,
  Strong,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Badge } from "../badge/badge";
import { FaRegFileAlt } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export function PlanSelectionDropdown(
  {
    plans,
    onChange,
  }: { plans: PlanDetailType[]; onChange?: (plan: PlanDetailType) => void },
  //   { onChange }: { onChange: (plan: PlanDetailType) => void },
) {
  const [open, setOpen] = useState(false);

  const [searchVal, setSearchVal] = useState<string>("");
  const [planDetails, setPlanDetails] = useState<PlanDetailType>(
    plans.find((plan) => plan.lpaNumber === plans[0].lpaNumber)!,
  );
  const [filteredPlans, setFilteredPlans] = useState<PlanDetailType[]>(plans);

  useEffect(() => {
    setFilteredPlans(
      plans.filter((e) => e.lpaNumber.toLocaleLowerCase().includes(searchVal)),
    );
  }, [searchVal]);

  return (
    <Popover.Root
      open={open}
      positioning={{
        offset: { crossAxis: 0, mainAxis: 5 },
        sameWidth: true,
      }}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Popover.Trigger asChild>
        <Flex
          justify={"space-between"}
          my={3}
          key={planDetails.lpaNumber}
          align={"center"}
          width={"full"}
          borderRadius={STANDARD_RADIUS.md}
          borderWidth="1px"
          borderColor="gray.200"
          cursor={"pointer"}
          boxShadow={STANDARD_SHADOWS.level1}
          p={{ base: 3, md: 4 }}
          gap={3}
          _hover={{
            bg: BRAND_COLORS.successBg,
            borderColor: BRAND_COLORS.primaryGreen,
          }}
        >
          <Flex align={"center"} justify={"justify-start"}>
            <FaRegFileAlt size={22} color={BRAND_COLORS.primaryGreen} />
            <VStack gap={1} mx={2} align="start" minW={0} cursor={"pointer"}>
              <Strong>{planDetails.lpaNumber}</Strong>
              <Flex gap={2} wrap="wrap">
                <Badge
                  type={
                    planDetails.accountStatus === "LAPSED"
                      ? "warning"
                      : "success"
                  }
                >
                  {planDetails.accountStatus}
                </Badge>
                <Badge
                  type={
                    planDetails.terminationStatus === "NOT YET TERMINATED"
                      ? "success"
                      : "info"
                  }
                >
                  {planDetails.terminationStatus}
                </Badge>
              </Flex>
            </VStack>
          </Flex>
          <IoChevronDown />
        </Flex>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width={"full"}>
            <Popover.Body width={"full"}>
              <InputGroup startElement={<LuSearch />}>
                <Input
                  placeholder="LPA Number"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.currentTarget.value)}
                />
              </InputGroup>
              <Separator my={3} />
              <Flex direction={"column"} gap={2}>
                {filteredPlans.map((plan) => (
                  <Flex
                    key={plan.lpaNumber}
                    align={"center"}
                    justify={"justify-start"}
                    width={"full"}
                    borderRadius={STANDARD_RADIUS.md}
                    borderWidth="1px"
                    borderColor={
                      planDetails.lpaNumber === plan.lpaNumber
                        ? BRAND_COLORS.primaryGreen
                        : "gray.200"
                    }
                    cursor={"pointer"}
                    boxShadow={
                      planDetails.lpaNumber === plan.lpaNumber
                        ? STANDARD_SHADOWS.level1
                        : "none"
                    }
                    p={{ base: 3, md: 4 }}
                    gap={3}
                    _hover={{
                      bg: BRAND_COLORS.successBg,
                      borderColor: BRAND_COLORS.primaryGreen,
                    }}
                    onClick={() => {
                      setPlanDetails(plan);
                      setOpen(false);
                      onChange?.(plan);
                    }}
                    bg={
                      planDetails.lpaNumber === plan.lpaNumber
                        ? BRAND_COLORS.successBg
                        : "white"
                    }
                  >
                    <FaRegFileAlt
                      size={22}
                      color={BRAND_COLORS.primaryGreen}
                    />
                    <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                      <Strong>{plan.lpaNumber}</Strong>
                      <Flex gap={2} wrap="wrap">
                        <Badge
                          type={
                            plan.accountStatus === "LAPSED"
                              ? "warning"
                              : "success"
                          }
                        >
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
                ))}
              </Flex>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
