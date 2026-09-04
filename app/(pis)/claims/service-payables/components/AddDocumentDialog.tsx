"use client";

// Putting a document on the service record's folder.
//
// Two fields, because a document IS two things: which requirement it answers,
// and the file itself. The type is a select over what is not on file yet — a
// document type is submitted once, so offering one that already has a file
// would be offering a duplicate the store would have to refuse.
//
// THE FILE IS REQUIRED. Both fields are, and the form will not submit without
// them — a document type with no file against it is not a document received,
// it is a deficiency, and that distinction is the axis the whole section is
// organised on. Letting one through would put a row in the Documents column
// that the Deficiency column had every right to still be asking for.
//
// The attachment is kept for this tab only — there is no upload path to the
// data layer yet — but it is a real file while it is here, which is what lets
// the preview show the document rather than describe it.
//
// `ModalForm` and floating-label fields, the same construction
// `CreateBillingDialog` uses — see the note at the top of that file for why the
// footer's submit is an `onClick` and not a `type="submit"`.

import { useEffect, useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  FloatingLabelSelect,
  ModalForm,
  ModalFormField,
  SingleFileUpload,
} from "osp-ui-kit";
import type { DocumentTypeRecord } from "../../../data";

/** What the form holds. The file is state, not a field — see below. */
interface AddDocumentForm {
  documentCode: string;
}

export interface AddDocumentSubmission {
  documentCode: string;
  /** Never null — the form does not submit without it. */
  file: File;
}

export interface AddDocumentDialogProps {
  /** The types still addable for this plan holder. */
  types: DocumentTypeRecord[];
  /**
   * The type to open on — set when the dialog was opened from a deficiency
   * rather than from the section's own Add button, so the requirement being
   * answered is already chosen.
   */
  presetCode?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AddDocumentSubmission) => void;
}

export function AddDocumentDialog({
  types,
  presetCode,
  open,
  onOpenChange,
  onSubmit,
}: AddDocumentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddDocumentForm>({ defaultValues: { documentCode: "" } });

  // The file is held here rather than in react-hook-form because
  // `SingleFileUpload` is a controlled component with its own `File | null`
  // shape, which a `register` cannot drive. Its required-ness is therefore
  // checked by hand below rather than by a validation rule.
  const [file, setFile] = useState<File | null>(null);
  /** Shown only after a submit was attempted without one — never on open. */
  const [fileMissing, setFileMissing] = useState(false);

  // Reopening gives a fresh form. Without this, cancelling one document and
  // starting another carries the first one's file into the second — the class
  // of mistake that is hardest to spot afterwards, since the row would look
  // right and only the attachment would be wrong.
  useEffect(() => {
    if (!open) return;
    reset({ documentCode: presetCode ?? "" });
    setFile(null);
    setFileMissing(false);
  }, [open, presetCode, reset]);

  // Safety net for Chakra v3 (zag-js) leaving `pointer-events: none` on <body>
  // after a modal closes — the same guard, for the same known failure, as in
  // `CreateBillingDialog`. The query is what keeps it from firing while the
  // record's own drawer is still up behind this on a narrow screen.
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

  /**
   * Both checks run, and neither short-circuits the other.
   *
   * `handleSubmit` only reaches its callback once the SELECT is valid, so a
   * form submitted empty would otherwise flag the type, the user would fix it,
   * submit again, and only then be told about the file. Setting the file's
   * error before handing over means one pass surfaces both.
   */
  const submit = (event?: React.MouseEvent) => {
    event?.preventDefault();
    setFileMissing(!file);

    return handleSubmit((values) => {
      if (!file) return;
      onSubmit({ documentCode: values.documentCode, file });
      onOpenChange(false);
    })();
  };

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Add Document"
      description="Record a document received for this service."
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
          label="Document Type"
          {...register("documentCode", {
            required: "Choose the document being submitted",
          })}
          errorText={errors.documentCode?.message}
        >
          <option value="">Select a document type</option>
          {types.map((type) => (
            <option key={type.documentCode} value={type.documentCode}>
              {type.documentDesc}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      <ModalFormField fullWidth>
        {/* `required` on the uploader is the asterisk only — the component has
            no error slot of its own, so the message below is this field's. */}
        <SingleFileUpload
          label="File"
          description="PDF or image. Kept for this session only until uploads are wired up."
          accept=".pdf,.png,.jpg,.jpeg"
          required
          value={file}
          onFileChange={(next) => {
            setFile(next);
            // Clear the complaint the moment it stops being true; leaving it up
            // beside a chosen file is the field arguing with itself.
            if (next) setFileMissing(false);
          }}
        />
        {fileMissing && (
          <Text fontSize="xs" color="red.600" mt={1.5}>
            Attach the document — a record with no file is a deficiency, not a
            submission.
          </Text>
        )}
      </ModalFormField>
    </ModalForm>
  );
}

export default AddDocumentDialog;
