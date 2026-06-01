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
import { FaRegFileAlt } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { OSPBadge } from "@/components/common/badge/badge";
import { PlanDetailType } from "@/components/plan-management/planholder-profile/planholder-profile-page";

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
          borderRadius={"md"}
          cursor={"pointer"}
          boxShadow={"sm"}
          p={4}
          gap={4}
          _hover={{
            bg: "var(--chakra-colors-primary-disabled)/40",
          }}
        >
          <Flex align={"center"} justify={"justify-start"}>
            <FaRegFileAlt size={25} color="var(--chakra-colors-primary)" />
            <VStack gap={1} mx={2} align="start" minW={0} cursor={"pointer"}>
              <Strong>{planDetails.lpaNumber}</Strong>
              <Flex gap={2}>
                <OSPBadge
                  type={
                    planDetails.accountStatus === "LAPSED"
                      ? "warning"
                      : "success"
                  }
                >
                  {planDetails.accountStatus}
                </OSPBadge>
                <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
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
                    borderRadius={"md"}
                    cursor={"pointer"}
                    boxShadow={"sm"}
                    p={4}
                    gap={4}
                    _hover={{
                      bg: "var(--chakra-colors-primary-disabled)/40",
                    }}
                    onClick={() => {
                      setPlanDetails(plan);
                      setOpen(false);
                      onChange?.(plan);
                    }}
                    bg={
                      planDetails.lpaNumber === plan.lpaNumber
                        ? "var(--chakra-colors-primary-disabled)/30"
                        : "white"
                    }
                  >
                    <FaRegFileAlt
                      size={25}
                      color="var(--chakra-colors-primary)"
                    />
                    <VStack gap={1} align="start" minW={0} cursor={"pointer"}>
                      <Strong>{plan.lpaNumber}</Strong>
                      <Flex gap={2}>
                        <OSPBadge
                          type={
                            plan.accountStatus === "LAPSED"
                              ? "warning"
                              : "success"
                          }
                        >
                          {plan.accountStatus}
                        </OSPBadge>
                        <OSPBadge type="success">NOT YET TERMINATED</OSPBadge>
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
