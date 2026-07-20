"use client";
import {
  Box,
  CloseButton,
  Dialog,
  Drawer,
  Flex,
  Grid,
  Portal,
  RadioCard,
  SimpleGrid,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { SaveButton, SelectButton, UnselectSolidButton } from "st-peter-ui";
import { RowItem } from "@/components/info-card/row-item";
import type {
  CheckedPlanType,
  PlanDetails,
} from "@/data/plan-management/change-of-mode/change-mode.types";
import { PlanTypes } from "@/data/plan-management/change-of-mode/data";
import { useEffect, useMemo, useState } from "react";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

const MODES = ["Monthly", "Quarterly", "Semi-Annual", "Annual"] as const;

function monthsPerMode(mode: string): number {
  if (mode === "Monthly") return 1;
  if (mode === "Quarterly") return 3;
  if (mode === "Semi-Annual") return 6;
  return 12;
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

function computeNewMode(
  plan: PlanDetails,
  newMode: string,
  plans: typeof PlanTypes,
) {
  const selected = plans.findLast((t) => t.mode === newMode) ?? plans[0];
  if (!selected) return null;

  const oldInstNo = plan.total_amount_paid / plan.installment_amount;
  const oldMonths = monthsPerMode(plan.mode);
  const newMonths = monthsPerMode(selected.mode);
  const totalMonthsDone = oldInstNo * oldMonths;
  const totalRemMonths = 60 - totalMonthsDone;
  const newRemInstNo = Math.floor(totalRemMonths / newMonths);
  const newInstAmt = selected.installment_amount;
  const newBalance = newInstAmt * newRemInstNo;
  const pending =
    ((totalRemMonths / newMonths - newRemInstNo) * newMonths) / oldMonths;
  const totalAmtPaid =
    plan.total_amount_paid + pending * plan.installment_amount;

  return {
    planCode: selected.plan_code,
    mode: selected.mode,
    instNo: newRemInstNo,
    instNoDone: totalMonthsDone / newMonths,
    instAmt: newInstAmt,
    balance: newBalance,
    tap: newBalance + totalAmtPaid,
    pending,
  };
}

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
  const plans = useMemo(
    () => PlanTypes.filter((t) => t.description === plan.plan_type),
    [plan.plan_type],
  );

  const prevPlan = useMemo(
    () => plans.findLast((t) => t.mode === plan.mode),
    [plans, plan.mode],
  );

  const [selectedMode, setSelectedMode] = useState<string>(
    MODES[MODES.indexOf(plan.mode as (typeof MODES)[number]) + 1] ?? MODES[0],
  );
  const [isChecked, setIsChecked] = useState(checked);
  const [confirmedMode, setConfirmedMode] = useState<CheckedPlanType>();

  const computed = useMemo(
    () => computeNewMode(plan, selectedMode, plans),
    [plan, selectedMode, plans],
  );

  const [hasMounted, setHasMounted] = useState(false);
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;
  const { messageBox } = useMessageDialog();

  // Defer rendering until the breakpoint is resolved on the client. Otherwise
  // the first render mounts the mobile Drawer and the second swaps in the
  // desktop Dialog — that mount/unmount race corrupts zag-js's modal
  // pointer-events bookkeeping and freezes the page after closing on web.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` + the
  // `data-inert` attribute stuck on <body> after a modal closes, which freezes
  // the whole page. When this drawer is closed and no other modal is open,
  // restore interactivity. The open-modal check keeps it safe if this drawer
  // is ever nested inside another dialog/drawer.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const buildPayload = (): CheckedPlanType => ({
    lpa_no: plan.lpa_no,
    pending_installment: computed?.pending ?? 0,
    pending_installment_amount:
      (computed?.pending ?? 0) * plan.installment_amount,
    new_plan_code: computed?.planCode ?? "",
    new_mode: computed?.mode ?? "",
    new_installment_amount: computed?.instAmt ?? 0,
    new_installment_number_done: computed?.instNoDone ?? 0,
    new_balance: computed?.balance ?? 0,
    new_tap: computed?.tap ?? 0,
  });

  const handleModeChange = async (newValue: string) => {
    if (!newValue || newValue === selectedMode) return;
    const result = computeNewMode(plan, newValue, plans);
    if (!result) return;

    if (result.pending > 0) {
      const cost = formatMoney(result.pending * plan.installment_amount);
      const confirmed = await messageBox({
        title: "Confirm Mode Change",
        message: `You have to pay ${result.pending} installments before you can change mode from ${plan.mode} to ${result.mode} which costs ${cost}. Do you want to proceed?`,
        confirmText: "Proceed",
        cancelText: "Cancel",
        variant: "confirmation",
      });
      if (!confirmed) return;
    }

    setSelectedMode(newValue);
  };

  const handleSelect = () => {
    const payload = buildPayload();
    setIsChecked(true);
    setConfirmedMode(payload);
    onCheckedChange?.(true, payload);
  };

  const handleUnselect = () => {
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
  };

  const modeSelector = (
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
        value={selectedMode}
        onValueChange={(e) => handleModeChange(e.value ?? "")}
      >
        <Grid
          templateColumns={{
            base: "repeat(2,1fr)",
            md: "repeat(4,1fr)",
          }}
          gap={2}
        >
          {MODES.map((item, index) => (
            <RadioCard.Item
              key={item}
              value={item}
              disabled={(prevPlan?.mop ?? 0) > index}
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl
                _checked={{
                  backgroundColor: "var(--chakra-colors-primary-disabled)/50",
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
  );

  const detailsGrid = (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={4}>
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
        <RowItem label="New Mode" value={computed?.mode ?? ""} />
        <RowItem label="New TAP" value={formatMoney(computed?.tap ?? 0)} />
        <RowItem
          label="Amount Paid"
          value={formatMoney(plan.total_amount_paid)}
        />
        <RowItem
          label="Remaining Inst."
          value={String(computed?.instNo ?? 0)}
        />
        <RowItem
          label="New Balance"
          value={formatMoney(computed?.balance ?? 0)}
        />
        <RowItem
          label="New Inst. Amount"
          value={formatMoney(computed?.instAmt ?? 0)}
        />
      </Box>
    </SimpleGrid>
  );

  const actionButton = (
    <Box mt={2} justifySelf="center">
      {isChecked ? (
        confirmedMode?.new_mode === selectedMode ? (
          <UnselectSolidButton width="full" onClick={handleUnselect} />
        ) : (
          <SaveButton width="full" onClick={handleSelect} />
        )
      ) : (
        <SelectButton width="full" onClick={handleSelect} />
      )}
    </Box>
  );

  if (!hasMounted) return null;

  if (isDesktop) {
    return (
      <Dialog.Root
        open={open}
        onOpenChange={(e) => onOpenChange(e.open)}
        placement="center"
        size="lg"
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="xl" maxH="92vh">
              <Dialog.Header
                borderBottomWidth="1px"
                borderColor="gray.100"
                pt="16px"
                pb="12px"
              >
                <Flex align="flex-start" justify="space-between" gap="12px">
                  <Box>
                    <Dialog.Title
                      fontSize="17px"
                      fontWeight="700"
                      letterSpacing="-0.02em"
                      lineHeight="1.2"
                    >
                      Change of Mode
                    </Dialog.Title>
                    <Text fontSize="12px" color="gray.500" mt="3px">
                      {plan.lpa_no} · {plan.plan_type}
                    </Text>
                  </Box>
                  <Dialog.CloseTrigger asChild mt="2px" flexShrink={0}>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>

              <Dialog.Body overflowY="auto" px={4} pt={4} pb={5}>
                {modeSelector}
                {detailsGrid}
                {actionButton}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="bottom"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop pointerEvents="none" />
        <Drawer.Positioner _closed={{ pointerEvents: "none" }}>
          <Drawer.Content
            pointerEvents="auto"
            borderTopRadius="xl"
            borderBottomRadius="0"
            maxH="92dvh"
          >
            <Flex justify="center" pt="10px" pb="2px">
              <Box w="36px" h="4px" borderRadius="full" bg="gray.200" />
            </Flex>

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
              pb="calc(20px + env(safe-area-inset-bottom))"
            >
              {modeSelector}
              {detailsGrid}
              {actionButton}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
