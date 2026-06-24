import {
  Dialog,
  Table,
  type TableRowProps,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import type { CheckedPlanType, PlanDetails } from "./change-mode.types";
import { useEffect, useState } from "react";
import { Checkbox, SecondarySmButton } from "st-peter-ui";
import { PlanDetailsDialog } from "./plan-details-dialog";

interface ChangeModeTableRowProps extends TableRowProps {
  checked: boolean;
  plan: PlanDetails;
  onCheckedChanged?: (checked: boolean, values: CheckedPlanType) => void;
}

export function ChangeModeTableRow({
  checked,
  plan,
  onCheckedChanged,
  ...rowProps
}: ChangeModeTableRowProps) {
  const [checkedValues, setCheckedValues] = useState<CheckedPlanType>();
  const [isChecked, setIsChecked] = useState(checked);
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    onClose();
  }, [isChecked]);

  const handleClick = useBreakpointValue({
    base: onOpen,
    md: () => {},
  });

  return (
    <Table.Row
      data-selected={isChecked ? "" : undefined}
      {...rowProps}
      _selected={{
        bg: "var(--chakra-colors-primary-disabled)",
        color: "var(--chakra-colors-primary-hover)",
      }}
      onClick={handleClick}
      py={{ base: 0, mdDown: 4 }}
    >
      <Table.Cell>
        <Checkbox
          readOnly
          checked={isChecked}
          onClick={onOpen}
          onCheckedChange={(changes) => {}}
        />
      </Table.Cell>

      <Table.Cell py={{ base: 0, mdDown: 4 }}>{plan.lpa_no}</Table.Cell>
      <Table.Cell>{plan.plan_type}</Table.Cell>
      <Table.Cell>{plan.plan_code}</Table.Cell>
      <Table.Cell>{plan.mode}</Table.Cell>
      <Table.Cell textAlign="end" display={{ base: "block", mdDown: "none" }}>
        <SecondarySmButton onClick={onOpen}>Change Mode</SecondarySmButton>
      </Table.Cell>
      {/* ------------------- MODAL ------------------- */}
      <Dialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen.open) onClose();
        }}
        size={{ base: "full", md: "xl" }}
        placement={"center"}
      >
        <PlanDetailsDialog
          checked={checked}
          plan={plan}
          onCheckedChange={(checked, values) => {
            setIsChecked(checked);
            setCheckedValues(values);
            if (values) onCheckedChanged?.(checked, values);
            onClose();
          }}
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
        />
      </Dialog.Root>
    </Table.Row>
  );
}
