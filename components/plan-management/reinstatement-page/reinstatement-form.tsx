import {
  Box,
  Flex,
  Grid,
  GridItem,
  Group,
  IconButton,
  Input,
  Separator,
  Table,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { H4, Small, Body, Checkbox } from "st-peter-ui";
import type { CheckedPlan, PhLapsedPlan } from "@/data/plan-management/reinstate-plans/reinstatement.types";
import { RITableRow } from "./ri-table-row";
import { LuSearch } from "react-icons/lu";

export function ReinstatementForm({
  lapsedPlans,
  onCheckedPlansChange,
}: {
  lapsedPlans: PhLapsedPlan[];
  onCheckedPlansChange?: (checked: CheckedPlan[]) => void;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);

  const indeterminate =
    checkedPlans.length > 0 && checkedPlans.length < lapsedPlans.length;

  const TotalAmountDue = useRef<HTMLSpanElement>(null);
  const TotalRIPayment = useRef<HTMLSpanElement>(null);
  const TotalRIFee = useRef<HTMLSpanElement>(null);

  // -----------------------------
  // 1. Child row change handler
  // -----------------------------
  const handleCheckedChange = (checked: boolean, values: CheckedPlan) => {
    setCheckedPlans((prev) => {
      if (checked) {
        if (checked) {
          const filtered = prev.filter((p) => p.lpaNo !== values.lpaNo);
          return [...filtered, values];
        }
        return prev.filter((p) => p.lpaNo !== values.lpaNo);
      }
      return prev.filter((p) => p.lpaNo !== values.lpaNo);
    });
  };

  // -----------------------------
  // 2. Parent callback is ALWAYS here
  // -----------------------------
  useEffect(() => {
    onCheckedPlansChange?.(checkedPlans);
  }, [checkedPlans]);

  // -----------------------------
  // 3. Update totals
  // -----------------------------
  useEffect(() => {
    let totalDue = 0;
    let totalRIPayment = 0;
    let totalRIFee = 0;

    checkedPlans.forEach((plan) => {
      totalRIPayment += plan.reinstatementPayment;
      totalRIFee += plan.reinstatementFee;
      totalDue += plan.reinstatementFee + plan.reinstatementPayment;
    });

    if (TotalRIPayment.current) {
      TotalRIPayment.current.innerText = totalRIPayment.toLocaleString(
        undefined,
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      );
    }
    if (TotalRIFee.current) {
      TotalRIFee.current.innerText = totalRIFee.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (TotalAmountDue.current) {
      TotalAmountDue.current.innerText = totalDue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }, [checkedPlans]);

  const [searchVal, setSearchVal] = useState<string>("");

  return (
    <Box py={3}>
      <Flex justify="space-between">
        <Box>
          <H4>Lapsed Plans</H4>
          <Small mb="4" fontStyle="italic">
            Kindly select plans you want to reinstate.
          </Small>
        </Box>
        <Group attached w="360px">
          <Input
            borderLeftRadius="sm"
            borderRightRadius="0"
            boxShadow="sm"
            placeholder="Search LPA Number . . ."
            value={searchVal}
            onChange={(e) => setSearchVal(e.currentTarget.value)}
            onKeyDown={(e) => {}}
          />
          <IconButton
            borderRightRadius="sm"
            borderLeftRadius="0"
            bg="green.700"
            _hover={{ bg: "green.600" }}
            boxShadow="sm"
            color="white"
            onClick={() => {}}
          >
            <LuSearch />
          </IconButton>
        </Group>
      </Flex>

      <Table.ScrollArea maxH="450px">
        <Table.Root size="sm" stickyHeader interactive>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader w={6}>
                <Checkbox
                  checked={
                    indeterminate ? "indeterminate" : checkedPlans.length > 0
                  }
                  onCheckedChange={(changes) => {
                    if (changes.checked) {
                      const all: CheckedPlan[] = lapsedPlans.map((plan) => ({
                        lpaNo: plan.lpaNo,
                        planType: plan.planType,
                        isFullyPaid: false,
                        reinstatementFee: 500,
                        reinstatementPayment: parseFloat(plan.newInstAmt),
                      }));
                      setCheckedPlans(all);
                    } else {
                      setCheckedPlans([]);
                    }
                  }}
                />
              </Table.ColumnHeader>

              <Table.ColumnHeader>LPA Number</Table.ColumnHeader>
              <Table.ColumnHeader>Plan Type</Table.ColumnHeader>
              <Table.ColumnHeader>Mode</Table.ColumnHeader>
              <Table.ColumnHeader>Due Date</Table.ColumnHeader>
              <Table.ColumnHeader
                textAlign="end"
                display={{ base: "block", mdDown: "none" }}
              >
                Actions
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {lapsedPlans.length === 0 ? (
              <Table.Row>
                <Table.Cell textAlign="center" colSpan={6} py={5}>
                  No lapsed plans available for reinstatement.
                </Table.Cell>
              </Table.Row>
            ) : (
              lapsedPlans.map((plan) => (
                <RITableRow
                  key={plan.lpaNo}
                  plan={plan}
                  checked={checkedPlans.some((pln) => pln.lpaNo === plan.lpaNo)}
                  onChanged={handleCheckedChange}
                />
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Flex justify={"space-between"} mt={3}>
        <Box>
          <Body fontSize="sm" fontStyle="italic">
            No. of plans selected:
          </Body>
          <H4>
            {checkedPlans.length}/{lapsedPlans.length}
          </H4>
        </Box>
        {/* Totals */}
        <Box
          p={3}
          mt={3}
          width={{ base: "md", mdDown: "full" }}
          bg="gray.100"
          ml={"auto"}
          borderRadius={"sm"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Grid templateColumns="repeat(2, 1fr)" gap="0" width={"full"}>
            <GridItem colSpan={4} mb={2}>
              <Body fontSize={"lg"} fontWeight={"semibold"}>
                Payment Details
              </Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body>Reinstatement Payment Subtotal :</Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body textAlign="right">
                ₱ <span ref={TotalRIPayment}>0.00</span>
              </Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body>Reinstatement Fee Subtotal :</Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body textAlign="right">
                ₱ <span ref={TotalRIFee}>0.00</span>
              </Body>
            </GridItem>
            <GridItem colSpan={4} mb={2}>
              <Separator my={2} />
            </GridItem>
            <GridItem colSpan={2}>
              <Body fontWeight={"semibold"}>Total Amount Due :</Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body textAlign="right" fontWeight={"semibold"}>
                ₱ <span ref={TotalAmountDue}>0.00</span>
              </Body>
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
}
