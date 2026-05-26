import { Box, Flex, Table } from "@chakra-ui/react";
import type { CheckedPlanType } from "./change-mode.types";
import { Body, H4, Small } from "st-peter-ui";
import { useEffect, useRef, useState } from "react";
import type { PlanDetails } from "./change-mode.types";
import { ChangeModeTableRow } from "./change-mode-table-row";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export function ChangeModeForm({
  activePlans,
  onCheckedPlansChange,
}: {
  activePlans: PlanDetails[];
  onCheckedPlansChange?: (checked: CheckedPlanType[] | undefined) => void;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlanType[]>([]);

  const TotalAmountDue = useRef<HTMLSpanElement>(null);
  const TotalInstallmentPayment = useRef<HTMLSpanElement>(null);
  const TotalChangeModeFee = useRef<HTMLSpanElement>(null);

  const handleCheckedChange = (checked: boolean, values: CheckedPlanType) => {
    setCheckedPlans((prev) => {
      if (checked) {
        // if (!prev.some((p) => p.lpa_no === values.lpa_no)) {
        //   return [...prev, values];
        // }
        const filtered = prev.filter((p) => p.lpa_no !== values.lpa_no);
        return [...filtered, values];
      }
      return prev.filter((p) => p.lpa_no !== values.lpa_no);
    });
  };

  useEffect(() => {
    onCheckedPlansChange?.(checkedPlans);
  }, [checkedPlans]);

  useEffect(() => {
    let totalDue = 0;
    let totalInstallmentPayment = 0;
    let totalChangeModeFee = 0;

    checkedPlans.forEach((plan) => {
      totalInstallmentPayment +=
        plan.new_installment_amount + plan.pending_installment_amount;
      totalChangeModeFee += 100;
      totalDue +=
        100 + plan.new_installment_amount + plan.pending_installment_amount;
    });

    if (TotalInstallmentPayment.current) {
      TotalInstallmentPayment.current.innerText =
        totalInstallmentPayment.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
    if (TotalChangeModeFee.current) {
      TotalChangeModeFee.current.innerText = totalChangeModeFee.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      );
    }
    if (TotalAmountDue.current) {
      TotalAmountDue.current.innerText = totalDue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }, [checkedPlans]);

  return (
    <Box py={{ base: 3, md: 4 }}>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={4}
      >
        <Box>
          <H4>Active Plans</H4>
          <Small color="gray.600" fontStyle="italic">
            Kindly select plans you want to change mode.
          </Small>
        </Box>
        <Box
          textAlign={{ base: "left", md: "right" }}
          bg={BRAND_COLORS.successBg}
          borderWidth="1px"
          borderColor={BRAND_COLORS.primaryGreen}
          borderRadius={STANDARD_RADIUS.md}
          px={4}
          py={3}
          minW={{ base: "full", md: "160px" }}
        >
          <Body fontSize="sm" fontStyle="italic">
            No. of plans selected:
          </Body>
          <H4>
            {checkedPlans.length}/{activePlans.length}
          </H4>
        </Box>
      </Flex>

      <Table.ScrollArea
        maxH="450px"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius={STANDARD_RADIUS.md}
        boxShadow={STANDARD_SHADOWS.level1}
      >
        <Table.Root size="sm" stickyHeader interactive>
          <Table.Header>
            <Table.Row bg={BRAND_COLORS.subtleBg}>
              <Table.ColumnHeader w={6} />
              <Table.ColumnHeader>LPA Number</Table.ColumnHeader>
              <Table.ColumnHeader>Plan Type</Table.ColumnHeader>
              <Table.ColumnHeader>Plan Code</Table.ColumnHeader>
              <Table.ColumnHeader>Mode</Table.ColumnHeader>
              <Table.ColumnHeader
                textAlign="end"
                display={{ base: "block", mdDown: "none" }}
              >
                Actions
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {activePlans.length === 0 ? (
              <Table.Row>
                <Table.Cell textAlign="center" colSpan={6} py={5}>
                  No lapsed plans available for reinstatement.
                </Table.Cell>
              </Table.Row>
            ) : (
              activePlans.map((plan) => (
                <ChangeModeTableRow
                  key={plan.lpa_no}
                  plan={plan}
                  checked={checkedPlans.some(
                    (pln) => pln.lpa_no === plan.lpa_no,
                  )}
                  onCheckedChanged={handleCheckedChange}
                />
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {/* Totals */}
      {/* <Box
          p={3}
          mt={3}
          width={{base: "md", mdDown: "full"}}
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
              <Body>Installment Payment Subtotal :</Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body textAlign="right">
                ₱ <span ref={TotalInstallmentPayment}>0.00</span>
              </Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body>Change Mode Fee Subtotal :</Body>
            </GridItem>
            <GridItem colSpan={2}>
              <Body textAlign="right">
                ₱ <span ref={TotalChangeModeFee}>0.00</span>
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
        </Box> */}
    </Box>
  );
}
