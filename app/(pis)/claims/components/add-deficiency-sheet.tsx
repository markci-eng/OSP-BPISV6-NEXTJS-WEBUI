"use client";

// THE PHONE'S RAISE DEFICIENCY — the Add Document sheet's twin (user,
// 2026-10-01: "do the same for raise deficiency"). The History sheet's drawer,
// the X as Cancel, Add pinned at the foot, and the choice made from a list in
// the same sheet rather than a native select — see `sheet-picker`.
//
// THE SAME TWO KINDS AS THE DESKTOP FORM: a document type, or "Other — not a
// document", which asks what is missing in its own field. See
// `AddDeficiencyDialog` for why the two branches differ.
//
// No prose: the desktop's description line and both helper texts are left out.

import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FloatingLabelInput, PrimarySmButton } from "osp-ui-kit";
import type { DocumentTypeOption } from "./add-document-sheet";
import { BottomSheet } from "./bottom-sheet";
import {
  OTHER_DEFICIENCY,
  type AddDeficiencySubmission,
} from "./add-deficiency-dialog";
import {
  FieldError,
  PickerField,
  PickerGroup,
  PickerRow,
  PickerTitle,
  SheetTextArea,
} from "./sheet-picker";

const OTHER_LABEL = "Other — not a document";

interface TextFields {
  description: string;
  remarks: string;
}

export interface AddDeficiencySheetProps {
  /** Document types a deficiency can still be raised against. */
  types: DocumentTypeOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AddDeficiencySubmission) => void;
}

export function AddDeficiencySheet({
  types,
  open,
  onOpenChange,
  onSubmit,
}: AddDeficiencySheetProps) {
  const [code, setCode] = useState("");
  const [tried, setTried] = useState(false);
  const [picking, setPicking] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TextFields>({ defaultValues: { description: "", remarks: "" } });

  // A fresh form each time it opens.
  useEffect(() => {
    if (!open) return;
    setCode("");
    setTried(false);
    setPicking(false);
    reset({ description: "", remarks: "" });
  }, [open, reset]);

  const isOther = code === OTHER_DEFICIENCY;
  const chosen = types.find((t) => t.code === code);
  const codeMissing = tried && !code;

  // Both checks in one pass — the choice is state, the text is the form's, and
  // neither should wait on the other to be reported.
  const add = () => {
    setTried(true);
    void handleSubmit((values) => {
      if (!code) return;
      onSubmit({
        documentCode: chosen ? chosen.code : "",
        description: chosen ? chosen.name : values.description.trim(),
        remarks: values.remarks.trim(),
      });
      onOpenChange(false);
    })();
  };

  const pick = (next: string) => {
    setCode(next);
    setPicking(false);
  };

  return (
    <BottomSheet
      title={
        picking ? (
          <PickerTitle label="Deficiency" onBack={() => setPicking(false)} />
        ) : (
          "Raise deficiency"
        )
      }
      open={open}
      onClose={() => onOpenChange(false)}
      footer={
        picking ? undefined : (
          <PrimarySmButton w="full" h="42px" minH="42px" onClick={add}>
            Add
          </PrimarySmButton>
        )
      }
    >
      {/* THE LIST IS HIDDEN, NOT UNMOUNTED, while the form shows — the text
          fields are registered and must keep what was typed across a trip to
          the list and back. */}
      <Flex direction="column" gap={3} display={picking ? "flex" : "none"}>
        {types.length > 0 && (
          <PickerGroup label="Documents">
            {types.map((t) => (
              <PickerRow
                key={t.code}
                label={t.name}
                code={t.code}
                onPick={() => pick(t.code)}
              />
            ))}
          </PickerGroup>
        )}
        <PickerGroup label="Not a document">
          <PickerRow label={OTHER_LABEL} onPick={() => pick(OTHER_DEFICIENCY)} />
        </PickerGroup>
      </Flex>

      <Flex direction="column" gap={3} display={picking ? "none" : "flex"}>
        <Box>
          <PickerField
            label="Deficiency"
            value={isOther ? OTHER_LABEL : chosen?.name}
            placeholder="Choose what is missing"
            invalid={codeMissing}
            onClick={() => setPicking(true)}
          />
          {codeMissing && <FieldError>Choose what is missing</FieldError>}
        </Box>

        {/* Only on the "Other" branch — see `AddDeficiencyDialog`. */}
        {isOther && (
          <FloatingLabelInput
            label="What is missing"
            {...register("description", {
              validate: (value) =>
                !isOther || value.trim().length > 0 || "Say what is missing",
            })}
            errorText={errors.description?.message}
          />
        )}

        {/* TALLER THAN A LINE — remarks run long (user, 2026-10-01). */}
        <SheetTextArea label="Remarks" {...register("remarks")} />
      </Flex>
    </BottomSheet>
  );
}

export default AddDeficiencySheet;
