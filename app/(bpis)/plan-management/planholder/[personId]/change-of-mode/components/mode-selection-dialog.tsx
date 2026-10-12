"use client";

import { useEffect, useMemo, useState } from "react";
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
  Skeleton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  RowItem,
  SaveButton,
  SelectButton,
  UnselectSolidButton,
  useMessageDialog,
} from "osp-ui-kit";
import { usePlanInfo } from "../../hooks/usePlanInfo";
import { usePlanTypes } from "../../hooks/usePlanTypes";
import type { ModePlan } from "./change-of-mode-table";
import {
  computeModeChange,
  formatPeso,
  installmentProgress,
  type Mode,
  type ModeChange,
  modeOptions,
  MODES,
} from "./change-of-mode-utils";

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function peso(amount: number | null | undefined) {
  return amount == null ? "—" : formatPeso(amount);
}

/** Modes the plan can move to: less frequent than its own, with a plan type. */
function availableModes(
  plan: ModePlan,
  options: Partial<Record<Mode, unknown>>,
) {
  const current = MODES.indexOf(plan.mode.toUpperCase() as Mode);
  return MODES.filter((mode, index) => index > current && options[mode]);
}

export function ModeSelectionDialog({
  open,
  onOpenChange,
  plan,
  change,
  onSelect,
  onUnselect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ModePlan;
  /** The mode change already chosen for this plan, if any. */
  change: ModeChange | undefined;
  onSelect: (change: ModeChange) => void;
  onUnselect: () => void;
}) {
  // The plan code and installment amount are on the plan's details, not the
  // list rows; what each mode costs is in the plan-type reference table.
  // Only fetched when the plan doesn't bring its code and amount along.
  const hasOwnPricing =
    plan.planCode != null && plan.installmentAmount != null;
  const info = usePlanInfo(hasOwnPricing ? "" : plan.lpaNo);
  const planTypes = usePlanTypes();
  const details = info.data?.planDetails;
  const planCode = plan.planCode ?? details?.planCode;
  const loading = info.isLoading || planTypes.isLoading;

  const options = useMemo(
    () => modeOptions(planTypes.data ?? [], planCode),
    [planTypes.data, planCode],
  );
  const allowed = useMemo(() => availableModes(plan, options), [plan, options]);
  const installmentAmount =
    plan.installmentAmount ??
    details?.installmentAmount ??
    options[plan.mode.toUpperCase() as Mode]?.instAmt ??
    undefined;

  // Only what the user picks is state. Until then the default follows the
  // data in: the mode already chosen for this plan, else the first allowed.
  const [pickedMode, setPickedMode] = useState<Mode>();
  const selectedMode = pickedMode ?? change?.newMode ?? allowed[0];

  const changeTo = (mode: Mode) => {
    const target = options[mode];
    return target && installmentAmount != null
      ? computeModeChange(plan, installmentAmount, mode, target)
      : null;
  };
  const computed = selectedMode ? changeTo(selectedMode) : null;

  // `ssr: false` resolves the breakpoint on the first render. Without it the
  // first render mounts the mobile Drawer and the second swaps in the desktop
  // Dialog, and that mount/unmount race corrupts zag-js's pointer-events
  // bookkeeping and freezes the page after closing.
  const isDesktop =
    useBreakpointValue({ base: false, md: true }, { ssr: false }) ?? false;
  const { messageBox } = useMessageDialog();

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` and
  // `data-inert` stuck on <body> after a modal closes, which freezes the
  // whole page. Once this one is closed and no other modal is open, restore
  // interactivity.
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

  const handleModeChange = async (value: string) => {
    const next = value as Mode;
    if (!next || next === selectedMode) return;
    const result = changeTo(next);
    if (!result) return;

    if (result.pendingInstallments > 0) {
      const confirmed = await messageBox({
        title: "Confirm Mode Change",
        message: `${result.pendingInstallments} more ${titleCase(plan.mode)} installment${result.pendingInstallments === 1 ? "" : "s"} (${formatPeso(result.pendingAmount)}) must be paid before this plan can change to ${titleCase(next)}. Do you want to proceed?`,
        confirmText: "Proceed",
        cancelText: "Cancel",
        variant: "confirmation",
      });
      if (!confirmed) return;
    }

    setPickedMode(next);
  };

  const { total: totalInstallments } = installmentProgress(plan);

  const modeSelector = (
    <Box mb={5}>
      <SectionLabel>Select New Mode</SectionLabel>
      <RadioCard.Root
        variant="subtle"
        value={selectedMode ?? null}
        onValueChange={(e) => handleModeChange(e.value ?? "")}
      >
        <Grid
          templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }}
          gap={2}
        >
          {MODES.map((mode) => (
            <RadioCard.Item
              key={mode}
              value={mode}
              disabled={!allowed.includes(mode)}
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
                }}
              >
                <RadioCard.ItemText>{titleCase(mode)}</RadioCard.ItemText>
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
      {loading ? (
        <Text fontSize="sm" color="fg.muted" mt={2}>
          Loading available modes…
        </Text>
      ) : info.isError || planTypes.isError ? (
        <Text fontSize="sm" color="danger" mt={2}>
          Could not load this plan&apos;s available modes. Close and try again.
        </Text>
      ) : (
        allowed.length === 0 && (
          <Text fontSize="sm" color="fg.muted" mt={2}>
            {plan.mode.toUpperCase() === "ANNUAL"
              ? "This plan is already paid annually, the least frequent mode."
              : "No other payment mode is available for this plan."}
          </Text>
        )
      )}
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
        <PanelLabel dot="gray.400">Current Mode</PanelLabel>
        <RowItem label="Mode" value={titleCase(plan.mode)} />
        <RowItem label="Total Payable" value={peso(plan.totalAmountPayable)} />
        <RowItem
          label="Installments Paid"
          value={`${plan.instNo} / ${totalInstallments}`}
        />
        <RowItem label="Balance" value={peso(plan.balance)} />
        <RowItem
          label="Inst. Amount"
          value={
            loading ? (
              // RowItem puts its value in a <p>, which can't hold a <div>.
              <Skeleton as="span" display="inline-block" h={4} w={20} />
            ) : (
              peso(installmentAmount)
            )
          }
        />
      </Box>

      <Box
        p={4}
        bg="var(--chakra-colors-primary-disabled)/20"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="var(--chakra-colors-primary)/30"
      >
        <PanelLabel dot="var(--chakra-colors-primary)" accent>
          After Change
        </PanelLabel>
        <RowItem
          label="New Mode"
          value={computed ? titleCase(computed.newMode) : "—"}
        />
        <RowItem label="New TAP" value={peso(computed?.newTotalAmountPayable)} />
        <RowItem
          label="Pending Inst."
          value={
            computed
              ? `${computed.pendingInstallments} (${formatPeso(computed.pendingAmount)})`
              : "—"
          }
        />
        <RowItem
          label="Remaining Inst."
          value={computed ? String(computed.newInstallmentsRemaining) : "—"}
        />
        <RowItem label="New Balance" value={peso(computed?.newBalance)} />
        <RowItem
          label="New Inst. Amount"
          value={peso(computed?.newInstallmentAmount)}
        />
      </Box>
    </SimpleGrid>
  );

  const actionButton = (
    <Box mt={2} justifySelf="center">
      {change && change.newMode === selectedMode ? (
        <UnselectSolidButton width="full" onClick={onUnselect} />
      ) : change ? (
        <SaveButton
          width="full"
          disabled={!computed}
          onClick={() => computed && onSelect(computed)}
        />
      ) : (
        <SelectButton
          width="full"
          disabled={!computed}
          onClick={() => computed && onSelect(computed)}
        />
      )}
    </Box>
  );

  const header = (
    <Box>
      <Text
        fontSize="17px"
        fontWeight="700"
        letterSpacing="-0.02em"
        lineHeight="1.2"
      >
        Change of Mode
      </Text>
      <Text fontSize="12px" color="gray.500" mt="3px">
        {plan.lpaNo} · {plan.planDescription}
      </Text>
    </Box>
  );

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
                  <Dialog.Title asChild>{header}</Dialog.Title>
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
                <Drawer.Title asChild>{header}</Drawer.Title>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="10px"
      fontWeight="700"
      color="gray.500"
      letterSpacing="0.1em"
      textTransform="uppercase"
      mb={2}
    >
      {children}
    </Text>
  );
}

function PanelLabel({
  dot,
  accent = false,
  children,
}: {
  dot: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Flex align="center" gap="6px" mb={3}>
      <Box w="7px" h="7px" borderRadius="full" bg={dot} flexShrink={0} />
      <Text
        fontSize="10px"
        fontWeight="700"
        color={accent ? "var(--chakra-colors-primary-hover)" : "gray.500"}
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        {children}
      </Text>
    </Flex>
  );
}
