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
import type { AssignedDocRow, BlockDocumentPayload } from "./types";
import {
  ModalForm,
  ModalFormField,
  ModalFormSection,
} from "@/components/common/modal-form/modal-form";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";

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
      title="Block Document"
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
            disabled={!blockType}
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
      {/* Read-only info fields */}
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
          <Field.Label>Document Type</Field.Label>
          <Input value={row?.documentType ?? ""} readOnly />
        </Field.Root>
      </ModalFormField>

      {/* Block type — spans both columns */}
      <ModalFormField fullWidth>
        <Field.Root>
          <Field.Label>Block Type</Field.Label>
          <Select.Root
            collection={blockTypeCollection}
            value={blockType ? [blockType] : []}
            onValueChange={(details) => setBlockType(details.value[0] ?? "")}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select block type" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {blockTypeCollection.items.map((item) => (
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

      {/* Document range section */}
      <ModalFormSection title="Document Range" fullWidth>
        <ModalFormField>
          <Field.Root>
            <Field.Label>Document Start</Field.Label>
            <Input
              value={documentStart}
              onChange={(e) => setDocumentStart(e.target.value)}
            />
          </Field.Root>
        </ModalFormField>

        <ModalFormField>
          <Field.Root>
            <Field.Label>Document End</Field.Label>
            <Input
              value={documentEnd}
              onChange={(e) => setDocumentEnd(e.target.value)}
            />
          </Field.Root>
        </ModalFormField>
      </ModalFormSection>

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
