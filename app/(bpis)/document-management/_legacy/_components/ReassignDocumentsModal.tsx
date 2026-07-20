"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button, Flex, createListCollection } from "@chakra-ui/react";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import type { AssignedDocRow, ReassignDocumentPayload } from "./types";
import {
  ModalForm,
  ModalFormField,
} from "@/components/common/modal-form/modal-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

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
      backButton
      title="Reassign Document"
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row-reverse" }}
        >
          <MotionButton
            // type="submit"
            onClick={handleSubmit}
            disabled={!newEmployeeId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            w={{ base: "full", sm: "auto" }}
          >
            Save
          </MotionButton>

          <Button
            variant="outline"
            onClick={onClose}
            w={{ base: "full", sm: "auto" }}
          >
            Cancel
          </Button>
        </Flex>
      }
    >
      <ModalFormField>
        <FloatingLabelInput
          label="Employee ID"
          value={employeeID ?? row?.salesForceId ?? ""}
          readOnly
        />
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="Document Code"
          value={row?.documentCode ?? ""}
          readOnly
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Current Assignee"
          value={row?.employeeName ?? ""}
          readOnly
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelSelect
          label="Reassign To"
          value={newEmployeeId}
          onChange={(e) => setNewEmployeeId(e.target.value)}
        >
          {employeeCollection.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Remarks"
          placeholder="Enter remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </ModalFormField>
    </ModalForm>
  );
}
