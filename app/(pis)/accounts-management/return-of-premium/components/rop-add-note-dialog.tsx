"use client";

// Add Notes — opened from the Notes title in the Planholder Remarks and Notes
// card (user, 2026-09-28).
//
// The LPA No and planholder name are shown so the processor can see which plan
// the note goes on; neither can be edited. The note itself is up to
// `PLANHOLDER_NOTE_MAX_LENGTH` characters.

import { useEffect } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  FloatingLabelInput,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";
import { MessageSquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { PLANHOLDER_NOTE_MAX_LENGTH } from "../data/data";

interface AddNoteForm {
  notes: string;
}

export interface RopAddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpaNo: string;
  planholderName: string;
  /** Called with the trimmed note when the form is saved. */
  onAdd: (notes: string) => void;
}

export function RopAddNoteDialog({
  open,
  onOpenChange,
  lpaNo,
  planholderName,
  onAdd,
}: RopAddNoteDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddNoteForm>({ defaultValues: { notes: "" } });

  // Every opening starts blank, so a cancelled note is not left behind.
  useEffect(() => {
    if (open) reset({ notes: "" });
  }, [open, reset]);

  const length = watch("notes").length;

  const submit = handleSubmit(({ notes }) => {
    onAdd(notes);
    onOpenChange(false);
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="sm"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <form onSubmit={submit} noValidate>
              <Dialog.Header pb={2}>
                <Flex align="start" gap={3} minW={0}>
                  <Box
                    color={BRAND_COLORS.primaryGreen}
                    mt={0.5}
                    flexShrink={0}
                  >
                    <MessageSquarePlus size={18} />
                  </Box>
                  <Box minW={0}>
                    <Dialog.Title
                      fontSize="md"
                      fontWeight="700"
                      color="gray.800"
                    >
                      Add Notes
                    </Dialog.Title>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      A note on this plan, added to the list under Notes
                    </Text>
                  </Box>
                </Flex>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    position="absolute"
                    top={3}
                    right={3}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                <Flex direction="column" gap={4}>
                  {/* Shown, not entered: which plan the note goes on. */}
                  <FloatingLabelInput
                    label="LPA No"
                    value={lpaNo}
                    readOnly
                    bg="gray.50"
                  />
                  <FloatingLabelInput
                    label="Planholder Name"
                    value={planholderName}
                    readOnly
                    bg="gray.50"
                  />

                  <Box>
                    <Textarea
                      autoFocus
                      placeholder="Enter notes..."
                      rows={4}
                      resize="vertical"
                      fontSize="sm"
                      maxLength={PLANHOLDER_NOTE_MAX_LENGTH}
                      aria-invalid={errors.notes ? true : undefined}
                      borderColor={errors.notes ? "red.500" : undefined}
                      {...register("notes", {
                        setValueAs: (v: string) => v.trim(),
                        required: "Required",
                        maxLength: {
                          value: PLANHOLDER_NOTE_MAX_LENGTH,
                          message: `Up to ${PLANHOLDER_NOTE_MAX_LENGTH} characters`,
                        },
                      })}
                    />
                    <Flex justify="space-between" mt={1}>
                      <Text fontSize="xs" color="red.500">
                        {errors.notes?.message}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {length}/{PLANHOLDER_NOTE_MAX_LENGTH}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer gap={2}>
                <SecondaryMdButton
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SecondaryMdButton>
                <PrimaryMdButton type="submit">Add Notes</PrimaryMdButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopAddNoteDialog;
