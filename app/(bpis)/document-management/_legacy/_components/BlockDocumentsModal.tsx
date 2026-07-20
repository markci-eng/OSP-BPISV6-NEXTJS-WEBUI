"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button, Flex, createListCollection } from "@chakra-ui/react";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import type { AssignedDocRow, BlockDocumentPayload } from "./types";
import {
  ModalForm,
  ModalFormField,
  ModalFormSection,
} from "@/components/common/modal-form/modal-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

const blockTypeCollection = createListCollection({
  items: [
    { label: "Cancelled Series", value: "Cancelled Series" },
    { label: "Damaged", value: "Damaged" },
    { label: "Expired", value: "Expired" },
    { label: "Lost", value: "Lost" },
  ],
});

type Props = {
  open: boolean;
  onClose: () => void;
  row: AssignedDocRow | null;
  employeeID?: string;
  onSubmit: (payload: BlockDocumentPayload) => void;
};

const MotionButton = motion(Button);

const springTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

export default function BlockDocumentModal({
  open,
  onClose,
  row,
  employeeID,
  onSubmit,
}: Props) {
  const [blockType, setBlockType] = React.useState("");
  const [documentStart, setDocumentStart] = React.useState("");
  const [documentEnd, setDocumentEnd] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const { messageBox } = useMessageDialog();

  React.useEffect(() => {
    if (!open || !row) return;
    setBlockType("");
    setDocumentStart(row.documentStart ?? "");
    setDocumentEnd(row.documentEnd ?? "");
    setRemarks("");
  }, [open, row]);

  const handleSubmit = async () => {
    if (!row || !blockType) return;

    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to save changes?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (!confirmed) return;

    onSubmit({
      employeeId: employeeID ?? row.salesForceId,
      documentCode: row.documentCode,
      documentType: row.documentType ?? "",
      documentStart,
      documentEnd,
      blockType,
      remarks,
    });
  };

  return (
    <ModalForm
      open={open}
      // onSubmit={handleSubmit}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
      backButton
      title="Block Document"
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
            disabled={!blockType}
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
          label="Document Type"
          value={row?.documentType ?? ""}
          readOnly
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelSelect
          label="Block Type"
          value={blockType}
          onChange={(e) => setBlockType(e.target.value)}
        >
          {blockTypeCollection.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      <ModalFormSection title="Document Range" fullWidth>
        <ModalFormField>
          <FloatingLabelInput
            label="Document Start"
            value={documentStart}
            onChange={(e) => setDocumentStart(e.target.value)}
          />
        </ModalFormField>

        <ModalFormField>
          <FloatingLabelInput
            label="Document End"
            value={documentEnd}
            onChange={(e) => setDocumentEnd(e.target.value)}
          />
        </ModalFormField>
      </ModalFormSection>

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
