"use client";

// THE PHONE'S ADD DOCUMENT — option A of the mock-up (user, 2026-10-01): one
// bottom sheet, the History sheet's own, with the X as Cancel and Add pinned at
// its foot.
//
// THE TYPE IS A FIELD THAT OPENS A LIST IN THE SAME SHEET, outstanding
// deficiencies first, because a native select on a phone is a wheel of twenty
// names with nothing to say which ones this service is still asking for. Opened
// from a deficiency row, the type is already chosen, so it is one tap to the
// file and one to Add. See `sheet-picker`.
//
// ONE "CHOOSE FILE" TARGET, NO CAMERA BUTTON (user, same day). The phone's own
// picker already offers its camera from a plain file input.
//
// No prose: the desktop's description line and the uploader's helper text are
// left out. Only the two errors speak.

import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { PrimarySmButton } from "osp-ui-kit";
import { BottomSheet } from "./bottom-sheet";
import {
  FieldError,
  PickerField,
  PickerGroup,
  PickerRow,
  PickerTitle,
} from "./sheet-picker";
import { SheetFileRow, SheetFileTarget, useSheetFileInput } from "./sheet-file";

/**
 * A document type as this sheet needs it. Each screen maps its own record onto
 * this — the service record's `DocumentTypeRecord`, the claim's `DocumentType`.
 */
export interface DocumentTypeOption {
  code: string;
  name: string;
}

export interface AddDocumentSheetSubmission {
  code: string;
  /** Never null — the sheet does not submit without it. */
  file: File;
}

export interface AddDocumentSheetProps {
  /** The types still addable for this planholder. */
  types: DocumentTypeOption[];
  /** Codes on the deficiency list — listed first and tagged. */
  outstandingCodes: string[];
  presetCode?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: AddDocumentSheetSubmission) => void;
}

export function AddDocumentSheet({
  types,
  outstandingCodes,
  presetCode,
  open,
  onOpenChange,
  onSubmit,
}: AddDocumentSheetProps) {
  const [code, setCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  /** Errors show only after an Add was tried — never on open. */
  const [tried, setTried] = useState(false);
  const [picking, setPicking] = useState(false);
  const fileInput = useSheetFileInput({ onFiles: ([next]) => setFile(next) });

  // Reopening gives a fresh form — see the same reset in `AddDocumentDialog`.
  useEffect(() => {
    if (!open) return;
    setCode(presetCode ?? "");
    setFile(null);
    setTried(false);
    setPicking(false);
  }, [open, presetCode]);

  const outstanding = new Set(outstandingCodes);
  const chosen = types.find((t) => t.code === code);
  const outstandingTypes = outstandingCodes
    .map((c) => types.find((t) => t.code === c))
    .filter((t): t is DocumentTypeOption => Boolean(t));
  const otherTypes = types.filter((t) => !outstanding.has(t.code));

  const typeMissing = tried && !chosen;
  const fileMissing = tried && !file;

  const add = () => {
    setTried(true);
    if (!chosen || !file) return;
    onSubmit({ code: chosen.code, file });
    onOpenChange(false);
  };

  const pick = (next: string) => {
    setCode(next);
    setPicking(false);
  };


  return (
    <BottomSheet
      title={
        picking ? (
          <PickerTitle label="Document type" onBack={() => setPicking(false)} />
        ) : (
          "Add document"
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
      {picking ? (
        <Flex direction="column" gap={3}>
          {outstandingTypes.length > 0 && (
            <PickerGroup label="Outstanding">
              {outstandingTypes.map((t) => (
                <PickerRow
                  key={t.code}
                  label={t.name}
                  code={t.code}
                  outstanding
                  onPick={() => pick(t.code)}
                />
              ))}
            </PickerGroup>
          )}
          {otherTypes.length > 0 && (
            <PickerGroup label="Other types">
              {otherTypes.map((t) => (
                <PickerRow
                  key={t.code}
                  label={t.name}
                  code={t.code}
                  onPick={() => pick(t.code)}
                />
              ))}
            </PickerGroup>
          )}
        </Flex>
      ) : (
        <Flex direction="column" gap={3}>
          <Box>
            <PickerField
              label="Document type"
              value={chosen?.name}
              placeholder="Choose a type"
              tag={
                chosen && outstanding.has(chosen.code)
                  ? "Deficiency"
                  : undefined
              }
              invalid={typeMissing}
              onClick={() => setPicking(true)}
            />
            {typeMissing && <FieldError>Choose the document type</FieldError>}
          </Box>

          {/* THE FILE — one big target, then a row with Replace. */}
          <Box>
            {fileInput.input}
            {file ? (
              <SheetFileRow
                file={file}
                actionLabel="Replace"
                onAction={fileInput.open}
              />
            ) : (
              <SheetFileTarget invalid={fileMissing} onClick={fileInput.open} />
            )}
            {fileMissing && <FieldError>Attach the document</FieldError>}
          </Box>
        </Flex>
      )}
    </BottomSheet>
  );
}

export default AddDocumentSheet;
