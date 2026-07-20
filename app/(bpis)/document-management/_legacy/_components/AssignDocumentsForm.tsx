"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  createListCollection,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { DocumentType } from "@/data/doc-management/documenttype";
import { Employee } from "@/data/doc-management/employeeSelector";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

const springTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

const MotionButton = motion(Button);

export type AssignDocumentPayload = {
  selectedEmployee: Employee;
  docType: string;
  quantity: string;
  documentSeries: string;
};

type Props = {
  employee: Employee | null;
  onAssigned: (payload: AssignDocumentPayload) => void;
};

export default function AssignDocumentsForm({ employee, onAssigned }: Props) {
  const [docType, setDocType] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [documentSeries, setDocumentSeries] = React.useState("");
  const documentTypeCollection = createListCollection({
    items: DocumentType.items.map((type) => ({
      label: type.label,
      value: type.value,
      series: type.series,
    })),
  });

  const { messageBox } = useMessageDialog();

  const handleDocTypeChange = (value: string) => {
    setDocType(value);

    const selectedType = DocumentType.items.find(
      (item) => item.value === value,
    );

    // Temporary default series until backend/real series source is ready
    setDocumentSeries(selectedType ? "00000001-00000050" : "");
  };

  const handleSubmit = async () => {
    if (!employee || !docType || !quantity) return;

    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to save changes?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (!confirmed) return;

    onAssigned({
      selectedEmployee: employee,
      docType,
      quantity,
      documentSeries,
    });

    setDocType("");
    setQuantity("");
    setDocumentSeries("");
  };

  const isSubmitDisabled = !employee || !docType || !quantity;

  return (
    <Box>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        }}
        gap={4}
        alignItems="center"
      >
        <FloatingLabelSelect
          label="Document Type"
          value={docType}
          onChange={(e) => handleDocTypeChange(e.target.value)}
        >
          {documentTypeCollection.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </FloatingLabelSelect>

        <FloatingLabelInput
          type="number"
          min="1"
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <FloatingLabelInput
          label="Document Series"
          value={documentSeries}
          onChange={(e) => setDocumentSeries(e.target.value)}
        />
      </Grid>

      <Flex justify="flex-end" mt={4}>
        <MotionButton
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
          w={{ base: "full", sm: "auto" }}
        >
          Save
        </MotionButton>
      </Flex>
    </Box>
  );
}
