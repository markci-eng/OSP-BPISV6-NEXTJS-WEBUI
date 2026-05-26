"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Button,
  Field,
  Flex,
  Input,
  Portal,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import type { AssignedDocRow, ReassignDocumentPayload } from "./types";
import {
  ModalForm,
  ModalFormField,
} from "@/components/common/modal-form/modal-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";

const springTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

const MotionButton = motion(Button);

const employeeCollection = createListCollection({
  items: EMPLOYEES.map((emp) => ({
    label: `${emp.name} (${emp.id})`,
    value: emp.id,
  })),
});

type Props = {
  open: boolean;
  onClose: () => void;
  row: AssignedDocRow | null;
  employeeID?: string;
  onSubmit: (payload: ReassignDocumentPayload) => void;
};

export default function ReassignDocumentModal({
  open,
  onClose,
  row,
  employeeID,
  onSubmit,
}: Props) {
  const [newEmployeeId, setNewEmployeeId] = React.useState("");
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    if (!open || !row) return;
    setNewEmployeeId("");
    setRemarks("");
  }, [open]);

  const { messageBox } = useMessageDialog();

  const handleSubmit = async () => {
    if (!row || !newEmployeeId) return;

    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to save changes?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (!confirmed) return;

    onSubmit({
      employeeId: employeeID,
      documentCode: row.documentCode,
      currentEmployeeId: row.salesForceId,
      newEmployeeId,
      remarks,
    });
  };

  return (
    <ModalForm
      open={open}
      // confirmation={true}
      // onSubmit={handleSubmit}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
      title="Reassign Document"
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row" }}
          justify="flex-end"
        >
          <Button
            {...STANDARD_BUTTON_STYLES.md}
            variant="outline"
            onClick={onClose}
            w={{ base: "full", sm: "auto" }}
          >
            Cancel
          </Button>

          <MotionButton
            {...STANDARD_BUTTON_STYLES.md}
            // type="submit"
            onClick={handleSubmit}
            disabled={!newEmployeeId}
            bg={BRAND_COLORS.primaryGreen}
            color={BRAND_COLORS.white}
            _hover={{ bg: BRAND_COLORS.darkGreen }}
            _active={{ bg: BRAND_COLORS.darkGreen }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            w={{ base: "full", sm: "auto" }}
          >
            Save
          </MotionButton>
        </Flex>
      }
    >
      {/* Read-only info */}
      <ModalFormField>
        <Field.Root>
          <Field.Label>Employee ID</Field.Label>
          <Input value={employeeID ?? row?.salesForceId ?? ""} readOnly />
        </Field.Root>
      </ModalFormField>

      <ModalFormField>
        <Field.Root>
          <Field.Label>Document Code</Field.Label>
          <Input value={row?.documentCode ?? ""} readOnly />
        </Field.Root>
      </ModalFormField>

      <ModalFormField fullWidth>
        <Field.Root>
          <Field.Label>Current Assignee</Field.Label>
          <Input value={row?.employeeName ?? ""} readOnly />
        </Field.Root>
      </ModalFormField>

      {/* Reassign To — spans both columns */}
      <ModalFormField fullWidth>
        <Field.Root>
          <Field.Label>Reassign To</Field.Label>
          <Select.Root
            collection={employeeCollection}
            value={newEmployeeId ? [newEmployeeId] : []}
            onValueChange={(details) =>
              setNewEmployeeId(details.value[0] ?? "")
            }
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select employee" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {employeeCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>
      </ModalFormField>

      {/* Remarks — spans both columns */}
      <ModalFormField fullWidth>
        <Field.Root>
          <Field.Label>Remarks</Field.Label>
          <Input
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Field.Root>
      </ModalFormField>
    </ModalForm>
  );
}
