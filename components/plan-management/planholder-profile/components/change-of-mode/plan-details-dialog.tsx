"use client";
import {
  Drawer,
  Portal,
  RadioCard,
  Flex,
  Box,
  SimpleGrid,
  CloseButton,
  Grid,
  Text,
} from "@chakra-ui/react";
import { SaveButton, SelectButton, UnselectSolidButton } from "st-peter-ui";
import { RowItem } from "@/components/info-card/row-item";
import type { CheckedPlanType, PlanDetails } from "./change-mode.types";
import { PlanTypes } from "./data";
import { useEffect, useMemo, useState } from "react";

const modes = ["Monthly", "Quarterly", "Semi-Annual", "Annual"];

export function PlanDetailsDialog({
  open,
  onOpenChange,
  checked,
  plan,
  onCheckedChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checked: boolean;
  plan: PlanDetails;
  onCheckedChange?: (checked: boolean, values: CheckedPlanType) => void;
}) {
  const [value, setValue] = useState<string>(
    modes[modes.indexOf(plan.mode) + 1] ?? modes[0] ?? "",
  );
  const [isChecked, setIsChecked] = useState(checked);
  const [selectedMode, setSelectedMode] = useState<CheckedPlanType>();
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
  }, [value, plans]);

  const handleModeChange = (newValue: string) => {
    if (!newValue || newValue === value) return;
    const selected =
      plans.findLast((type) => type.mode === newValue) ?? plans[0];
    if (!selected) return;

    const _oldInstNo = plan.total_amount_paid / plan.installment_amount;
    const _oldMonthMode =
      plan.mode === "Monthly"
        ? 1
        : plan.mode === "Quarterly"
          ? 3
          : plan.mode === "Semi-Annual"
            ? 6
            : 12;
    const _newMonthMode =
      selected.mode === "Monthly"
        ? 1
        : selected.mode === "Quarterly"
          ? 3
          : selected.mode === "Semi-Annual"
            ? 6
            : 12;
    const _totalMonthDone = _oldInstNo * _oldMonthMode;
    const _totalRemMonth = 60 - _totalMonthDone;
    const _newRemInstNo = Math.floor(_totalRemMonth / _newMonthMode);
    const pending =
      ((_totalRemMonth / _newMonthMode - _newRemInstNo) * _newMonthMode) /
      _oldMonthMode;

    if (pending > 0) {
      if (
        !confirm(
          `You have to pay ${pending} installments before you can change mode from ${plan.mode} to ${selected.mode} which costs ${formatMoney(pending * plan.installment_amount)}. Do you want to proceed?`,
        )
      )
        return;
    }

    setValue(newValue);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="bottom"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="xl"
            borderBottomRadius="0"
            maxH="92dvh"
          >
            {/* Drag handle */}
            <Flex justify="center" pt="10px" pb="2px">
              <Box w="36px" h="4px" borderRadius="full" bg="gray.200" />
            </Flex>

            {/* Header */}
            <Drawer.Header
              borderBottomWidth="1px"
              borderColor="gray.100"
              pt="12px"
              pb="12px"
            >
              <Flex align="flex-start" justify="space-between" gap="12px">
                <Box>
                  <Drawer.Title
                    fontSize="17px"
                    fontWeight="700"
                    letterSpacing="-0.02em"
                    lineHeight="1.2"
                  >
                    Change of Mode
                  </Drawer.Title>
                  <Text fontSize="12px" color="gray.500" mt="3px">
                    {plan.lpa_no} · {plan.plan_type}
                  </Text>
                </Box>
                <Drawer.CloseTrigger asChild mt="2px" flexShrink={0}>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Flex>
            </Drawer.Header>

            <Drawer.Body
              overflowY="auto"
              px={4}
              pt={4}
              pb={`calc(20px + env(safe-area-inset-bottom))`}
            >
              {/* Mode selector */}
              <Box mb={5}>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.500"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  mb={2}
                >
                  Select New Mode
                </Text>
                <RadioCard.Root
                  variant="subtle"
                  value={value}
                  onValueChange={(e) => handleModeChange(e.value ?? "")}
                >
                  <Grid
                    templateColumns={{
                      base: "repeat(2,1fr)",
                      md: "repeat(4,1fr)",
                    }}
                    gap={2}
                  >
                    {modes.map((item, index) => (
                      <RadioCard.Item
                        key={item}
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
              </Box>

              {/* Comparison cards */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={4}>
                {/* Current mode */}
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Flex align="center" gap="6px" mb={3}>
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="full"
                      bg="gray.400"
                      flexShrink={0}
                    />
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="gray.500"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                    >
                      Current Mode
                    </Text>
                  </Flex>
                  <RowItem label="Mode" value={plan.mode} />
                  <RowItem
                    label="Total Payable"
                    value={formatMoney(plan.total_amount_payable)}
                  />
                  <RowItem
                    label="Amount Paid"
                    value={formatMoney(plan.total_amount_paid)}
                  />
                  <RowItem
                    label="Remaining Inst."
                    value={String(plan.installment_no)}
                  />
                  <RowItem label="Balance" value={formatMoney(plan.balance)} />
                  <RowItem
                    label="Inst. Amount"
                    value={formatMoney(plan.installment_amount)}
                  />
                </Box>

                {/* After change */}
                <Box
                  p={4}
                  bg="var(--chakra-colors-primary-disabled)/20"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="var(--chakra-colors-primary)/30"
                >
                  <Flex align="center" gap="6px" mb={3}>
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="full"
                      bg="var(--chakra-colors-primary)"
                      flexShrink={0}
                    />
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="var(--chakra-colors-primary-hover)"
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                    >
                      After Change
                    </Text>
                  </Flex>
                  <RowItem label="New Mode" value={newMode} />
                  <RowItem label="New TAP" value={formatMoney(newTAP)} />
                  <RowItem
                    label="Amount Paid"
                    value={formatMoney(plan.total_amount_paid)}
                  />
                  <RowItem label="Remaining Inst." value={String(newInstNo)} />
                  <RowItem
                    label="New Balance"
                    value={formatMoney(newBalance)}
                  />
                  <RowItem
                    label="New Inst. Amount"
                    value={formatMoney(newInstAmt)}
                  />
                </Box>
              </SimpleGrid>

              {/* Action */}
              <Box mt={2}>
                {isChecked ? (
                  selectedMode?.new_mode === value ? (
                    <UnselectSolidButton
                      width="full"
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
                      width="full"
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
                    width="full"
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
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
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
