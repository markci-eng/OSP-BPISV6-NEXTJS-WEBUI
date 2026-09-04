"use client";

// Raising a deficiency by hand.
//
// The Deficiency list already fills itself from the service's requirements, so
// this dialog is only for what that list CANNOT know: the one-off things a
// particular service turns out to need. Which is why the first field offers
// something no requirement list does — "Other", for a deficiency with no
// document behind it at all.
//
// TWO KINDS, ONE FORM:
//
//   a document   the requirement list does not carry, but this service needs.
//                It keeps its code, so SUBMITTING that document clears the
//                deficiency exactly as it clears a required one.
//   a special    with no document behind it — "chapel to confirm the date of
//   case         interment". Nothing can be uploaded against it, so it is
//                cleared by being withdrawn.
//
// The document types offered are the ones not on file AND not already
// outstanding. A deficiency raised twice for the same document is not a
// stronger request, it is a list that cannot be cleared in one action; the
// store refuses the duplicate and this keeps it from being asked for.

import { useEffect } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  ModalForm,
  ModalFormField,
} from "osp-ui-kit";
import type { DocumentTypeRecord } from "../../../data";

/**
 * The select's value for the free-text branch.
 *
 * A sentinel rather than the empty string, because empty already means "not
 * chosen yet" — that is what the required rule checks for, and collapsing the
 * two would make "Other" indistinguishable from an unanswered field.
 */
export const OTHER_DEFICIENCY = "__other__";

interface AddDeficiencyForm {
  documentCode: string;
  /** Only used, and only required, on the "Other" branch. */
  description: string;
  remarks: string;
}

export interface AddDeficiencySubmission {
  /** Empty for a special case with no document behind it. */
  documentCode: string;
  description: string;
  remarks: string;
}

export interface AddDeficiencyDialogProps {
  /** Document types a deficiency can still be raised against. */
  types: DocumentTypeRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AddDeficiencySubmission) => void;
}

export function AddDeficiencyDialog({
  types,
  open,
  onOpenChange,
  onSubmit,
}: AddDeficiencyDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddDeficiencyForm>({
    defaultValues: { documentCode: "", description: "", remarks: "" },
  });

  // Watched rather than read on submit, because it decides what is on screen:
  // the description field only exists on the "Other" branch.
  const documentCode = watch("documentCode");
  const isOther = documentCode === OTHER_DEFICIENCY;

  // A fresh form each time it opens — see the same note in
  // `CreateBillingDialog`; it is also what lets this stay mounted between
  // openings rather than being conditionally rendered.
  useEffect(() => {
    if (open) reset({ documentCode: "", description: "", remarks: "" });
  }, [open, reset]);

  // The zag-js stuck-`pointer-events` guard — see `CreateBillingDialog`.
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

  const submit = handleSubmit((values) => {
    const type = types.find((t) => t.documentCode === values.documentCode);
    onSubmit({
      // A special case carries no code — that is what makes it unclearable by
      // upload, which is the whole difference between the two branches.
      documentCode: type ? type.documentCode : "",
      description: type ? type.documentDesc : values.description.trim(),
      remarks: values.remarks.trim(),
    });
    onOpenChange(false);
  });

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Add Deficiency"
      description="Note something this service needs that is not on the requirement list."
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row-reverse" }}
        >
          <Button type="button" onClick={submit} w={{ base: "full", sm: "auto" }}>
            Add
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            w={{ base: "full", sm: "auto" }}
          >
            Cancel
          </Button>
        </Flex>
      }
    >
      <ModalFormField fullWidth>
        <FloatingLabelSelect
          label="Deficiency"
          {...register("documentCode", {
            required: "Choose what is missing",
          })}
          errorText={errors.documentCode?.message}
          helperText={
            isOther
              ? "No document to upload against this one — withdraw it once it is settled."
              : undefined
          }
        >
          <option value="">Select what is missing</option>
          {types.map((type) => (
            <option key={type.documentCode} value={type.documentCode}>
              {type.documentDesc}
            </option>
          ))}
          {/* Last, and separated by its wording rather than a rule the native
              select cannot draw: everything above answers with a document, and
              this one does not. */}
          <option value={OTHER_DEFICIENCY}>Other — not a document</option>
        </FloatingLabelSelect>
      </ModalFormField>

      {/* Only on the "Other" branch. On the document branch the description IS
          the document type's, so a second field asking for one would be
          inviting a name that disagrees with the code beside it. */}
      {isOther && (
        <ModalFormField fullWidth>
          <FloatingLabelInput
            label="What is missing"
            {...register("description", {
              required: isOther ? "Say what is missing" : false,
              validate: (value) =>
                !isOther || value.trim().length > 0 || "Say what is missing",
            })}
            errorText={errors.description?.message}
          />
        </ModalFormField>
      )}

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Remarks"
          helperText="Optional — context for whoever picks this up."
          {...register("remarks")}
        />
      </ModalFormField>
    </ModalForm>
  );
}

export default AddDeficiencyDialog;
