"use client";
import {
  Dialog,
  Portal,
  RadioCard,
  Flex,
  Heading,
  Box,
  SimpleGrid,
  Stack,
  CloseButton,
  List,
  Grid,
  HStack,
} from "@chakra-ui/react";
import {
  Body,
  SaveButton,
  SelectButton,
  Small,
  UnselectSolidButton,
} from "st-peter-ui";
import type { CheckedPlanType, PlanDetails } from "./change-mode.types";
import { PlanTypes } from "./data";
import { useEffect, useMemo, useState } from "react";

const modes = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];

const PlanDetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box width={"full"} my={2}>
      <Small>{label}</Small>
      <Box border={"none"} py={0} borderRadius={"sm"}>
        <Body fontWeight={"semibold"}>{value}</Body>
      </Box>
    </Box>
  );
};

export function PlanDetailsDialog({
  checked,
  plan,
  onCheckedChange,
}: {
  checked: boolean;
  plan: PlanDetails;
  onCheckedChange?: (checked: boolean, values: CheckedPlanType) => void;
}) {
  const [value, setValue] = useState<string>(
    modes[modes.indexOf(plan.mode) + 1] ?? modes[0] ?? "",
  );
  const [isChecked, setIsChecked] = useState(checked);
  const [selectedMode, setSelectedMode] = useState<CheckedPlanType>();
  const [prevSelect, setPrevSelect] = useState("");
  const plans = useMemo(
    () => PlanTypes.filter((type) => type.description === plan.plan_type),
    [plan.plan_type],
  );

  const prevPlan = useMemo(
    () =>
      PlanTypes.filter((type) => type.description === plan.plan_type).findLast(
        (type) => type.mode === plan.mode,
      ),
    [plan.plan_type],
  );

  const changeModeFee = 100;
  const [newPlanCode, setNewPlanCode] = useState(plan.plan_code);
  const [newMode, setNewMode] = useState(plan.mode);
  const [newInstNo, setNewInstNo] = useState(plan.installment_no);
  const [newInstNoDone, setNewInstNoDone] = useState(0);
  const [newBalance, setNewBalance] = useState(plan.balance);
  const [newInstAmt, setNewInstAmt] = useState(plan.installment_amount);
  const [newTAP, setNewTAP] = useState(plan.total_amount_paid + newBalance);
  const [pendingInstallment, setPendingInstallment] = useState(0);

  useEffect(() => {
    const selected = plans.findLast((type) => type.mode === value) ?? plans[0];
    if (!selected) return;
    const _oldInstNo = plan.total_amount_paid / plan.installment_amount;
    const _oldMonthMode =
      plan.mode === "Monthly"
        ? 1
        : plan.mode === "Quarterly"
          ? 3
          : plan.mode === "Semi-Annual"
            ? 6
            : plan.mode === "Annual"
              ? 12
              : 0;
    const _newMonthMode =
      selected.mode === "Monthly"
        ? 1
        : selected.mode === "Quarterly"
          ? 3
          : selected.mode === "Semi-Annual"
            ? 6
            : selected.mode === "Annual"
              ? 12
              : 0;
    const _newInstAmt = selected.installment_amount;
    const _totalMonthDone = _oldInstNo * _oldMonthMode;
    const _totalRemMonth = 60 - _totalMonthDone;
    const _newRemInstNo = Math.floor(_totalRemMonth / _newMonthMode);
    const _newBalance = _newInstAmt * _newRemInstNo;
    const _totalAmtPaid =
      plan.total_amount_paid +
      (((_totalRemMonth / _newMonthMode - _newRemInstNo) * _newMonthMode) /
        _oldMonthMode) *
        plan.installment_amount;
    const _newTAP = _newBalance + _totalAmtPaid;

    setPendingInstallment(
      ((_totalRemMonth / _newMonthMode - _newRemInstNo) * _newMonthMode) /
        _oldMonthMode,
    );
    setNewPlanCode(selected.plan_code);
    setNewMode(selected.mode);
    setNewInstNo(_newRemInstNo);
    setNewInstNoDone(_totalMonthDone / _newMonthMode);
    setNewInstAmt(_newInstAmt);
    setNewBalance(_newBalance);
    setNewTAP(_newTAP);
    if (
      ((_totalRemMonth / _newMonthMode - _newRemInstNo) * _newMonthMode) /
        _oldMonthMode ===
      0
    )
      setPrevSelect(value);
  }, [value, plans]);

  useEffect(() => {
    if (pendingInstallment > 0) {
      if (
        !confirm(
          `You have to pay ${pendingInstallment} installments before you can change mode from ${plan.mode} to ${newMode} which costs  ${formatMoney(pendingInstallment * plan.installment_amount)}. Do you want to proceed?`,
        )
      ) {
        setValue(prevSelect);
        return;
      }
    }
    setPrevSelect(value);
  }, [pendingInstallment]);

  return (
    <Portal>
      <Dialog.Backdrop zIndex={1000} />
      <Dialog.Positioner zIndex={1001} p={{ base: 0, md: undefined }}>
        <Dialog.Content zIndex={1001} borderRadius={{ base: 0, md: undefined }}>
          <Dialog.Header>
            <Dialog.Title>Plan Details</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {/* Mode selector */}
            <RadioCard.Root
              variant="subtle"
              value={value}
              onValueChange={(e) => setValue(e.value ?? "")}
              mx={1}
              mb={5}
            >
              <RadioCard.Label>Mode of Payment</RadioCard.Label>
              <Grid
                templateColumns={{
                  base: "repeat(2,1fr)",
                  md: "repeat(4,1fr)",
                }}
                gap={2}
              >
                {modes.map((item, index) => (
                  <RadioCard.Item
                    key={index}
                    value={item}
                    disabled={(prevPlan?.mop ?? 0) > index}
                  >
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl
                      _checked={{
                        backgroundColor:
                          "var(--chakra-colors-primary-disabled)/50",
                        borderColor: "var(--chakra-colors-primary)",
                        borderWidth: "1px",
                        color: "var(--chakra-colors-primary-hover)",
                      }}
                      _disabled={{
                        borderColor: "dangerHover",
                        backgroundColor: "dangerDisabled",
                        color: "danger",
                        _checked: {
                          backgroundColor:
                            "var(--chakra-colors-primary-disabled)/50",
                          borderColor: "var(--chakra-colors-primary)",
                          borderWidth: "1px",
                          color: "var(--chakra-colors-primary-hover)",
                        },
                      }}
                    >
                      <RadioCard.ItemText>{item}</RadioCard.ItemText>
                      <RadioCard.ItemIndicator
                        _checked={{
                          color: "var(--chakra-colors-primary)",
                          borderColor: "var(--chakra-colors-primary)",
                        }}
                      />
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </Grid>
            </RadioCard.Root>

            {/* Plan details layout */}
            <Stack direction={{ base: "column", md: "row" }} pt={3}>
              <SimpleGrid columns={{ base: 1, md: 2 }} px={0} w="full">
                {/* LEFT COLUMN */}
                <Box px={3} py={3}>
                  <Heading size="lg" textAlign="center">
                    Current Mode
                  </Heading>

                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow label="Mode" value={plan.mode} />
                    <PlanDetailRow
                      label="Total Amount Payable"
                      value={formatMoney(plan.total_amount_payable)}
                    />
                  </Flex>
                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow
                      label="Total Amount Paid"
                      value={formatMoney(plan.total_amount_paid)}
                    />
                    <PlanDetailRow
                      label="Remaining Installment"
                      value={String(plan.installment_no)}
                    />
                  </Flex>
                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow
                      label="Balance"
                      value={formatMoney(plan.balance)}
                    />
                    <PlanDetailRow
                      label="Installment Amount"
                      value={formatMoney(plan.installment_amount)}
                    />
                  </Flex>
                </Box>

                {/* RIGHT COLUMN */}
                <Box
                  px={3}
                  py={3}
                  bg="gray.50"
                  border="1px solid #ddd"
                  borderRadius="md"
                >
                  <Heading size="lg" textAlign="center">
                    After Change of Mode
                  </Heading>

                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow label="New Mode" value={newMode} />
                    <PlanDetailRow
                      label="New TAP"
                      value={formatMoney(newTAP)}
                    />
                  </Flex>
                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow
                      label="Total Amount Paid"
                      value={formatMoney(plan.total_amount_paid)}
                    />
                    <PlanDetailRow
                      label="Remaining Installment"
                      value={String(newInstNo)}
                    />
                  </Flex>
                  <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={2}
                  >
                    <PlanDetailRow
                      label="New Balance"
                      value={formatMoney(newBalance)}
                    />
                    <PlanDetailRow
                      label="New Installment Amount"
                      value={formatMoney(newInstAmt)}
                    />
                  </Flex>
                </Box>
              </SimpleGrid>
            </Stack>

            {/* Payment Summary */}
            {/* <Box
                p={5}
                mt={5}
                width={{base: "lg", mdDown: "full"}}
                mx="auto"
                borderWidth="1px"
                borderColor="var(--chakra-colors-primary)"
                borderRadius="lg"
                bg={"var(--chakra-colors-primary-disabled)/50"}
              >
                <Body>
                  Applying for change of mode requires the following payments:
                </Body>

                <List.Root mt={2} py={2} px={4}>
                  {pendingInstallment > 0 && (
                    <List.Item _marker={{ color: "foreground" }}>
                      <HStack justifyContent={"space-between"} width={"full"}>
                        <Body>
                          Installment Payment From Previous Mode (x
                          {pendingInstallment}):{" "}
                        </Body>
                        <Body>
                          <strong>
                            {formatMoney(
                              pendingInstallment * plan.installment_amount
                            )}
                          </strong>
                        </Body>
                      </HStack>
                    </List.Item>
                  )}
                  <List.Item _marker={{ color: "foreground" }}>
                    <HStack justifyContent={"space-between"} width={"full"}>
                      <Body>Installment Payment: </Body>
                      <Body>
                        <strong>{formatMoney(newInstAmt)}</strong>
                      </Body>
                    </HStack>
                  </List.Item>
                  <List.Item _marker={{ color: "foreground" }}>
                    <HStack justifyContent={"space-between"} width={"full"}>
                      <Body>Change Mode Fee: </Body>
                      <Body>
                        <strong>{formatMoney(changeModeFee)}</strong>
                      </Body>
                    </HStack>
                  </List.Item>
                  <List.Item _marker={{ color: "transparent" }}>
                    <HStack
                      justifyContent={"space-between"}
                      width={"full"}
                      mt={3}
                    >
                      <Body fontWeight="bold">Total Amount Due: </Body>
                      <Body>
                        <strong>
                          {formatMoney(
                            pendingInstallment * plan.installment_amount +
                              newInstAmt +
                              changeModeFee
                          )}
                        </strong>
                      </Body>
                    </HStack>
                  </List.Item>
                </List.Root>
              </Box> */}

            {/* Select / Unselect */}
            <Box mt={3} textAlign="center" pb={{ base: "0", mdDown: "60px" }}>
              {isChecked ? (
                selectedMode?.new_mode === value ? (
                  <UnselectSolidButton
                    onClick={() => {
                      setIsChecked(false);
                      onCheckedChange?.(false, {
                        lpa_no: plan.lpa_no,
                        pending_installment: 0,
                        pending_installment_amount: 0,
                        new_plan_code: "",
                        new_mode: "",
                        new_installment_amount: 0,
                        new_installment_number_done: 0,
                        new_balance: 0,
                        new_tap: 0,
                      });
                    }}
                  />
                ) : (
                  <SaveButton
                    onClick={() => {
                      setIsChecked(true);
                      const payload: CheckedPlanType = {
                        lpa_no: plan.lpa_no,
                        pending_installment: pendingInstallment,
                        pending_installment_amount:
                          pendingInstallment * plan.installment_amount,
                        new_plan_code: newPlanCode,
                        new_mode: newMode,
                        new_installment_amount: newInstAmt,
                        new_installment_number_done: newInstNoDone,
                        new_balance: newBalance,
                        new_tap: newTAP,
                      };
                      setSelectedMode(payload);
                      onCheckedChange?.(true, payload);
                    }}
                  />
                )
              ) : (
                <SelectButton
                  onClick={() => {
                    setIsChecked(true);
                    const payload: CheckedPlanType = {
                      lpa_no: plan.lpa_no,
                      pending_installment: pendingInstallment,
                      pending_installment_amount:
                        pendingInstallment * plan.installment_amount,
                      new_plan_code: newPlanCode,
                      new_mode: newMode,
                      new_installment_amount: newInstAmt,
                      new_installment_number_done: newInstNoDone,
                      new_balance: newBalance,
                      new_tap: newTAP,
                    };
                    setSelectedMode(payload);
                    onCheckedChange?.(true, payload);
                  }}
                />
              )}
            </Box>
          </Dialog.Body>

          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
}

function formatMoney(num: number) {
  return (
    "₱ " +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
