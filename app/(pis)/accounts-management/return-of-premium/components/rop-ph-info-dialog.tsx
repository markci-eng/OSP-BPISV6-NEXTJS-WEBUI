"use client";

// Edit PH Info — opened from the pencil beside the planholder's name.
//
// The name and birthdate the return is filed under. The LPA number is shown
// but locked: it is the key the whole screen is filed under, and changing it
// would be a different record rather than a correction to this one.
//
// IT EDITS A DRAFT, not the record. The panel holds what comes back and shows
// it on the planholder card; nothing is persisted until there is somewhere to
// persist it to.

import { useEffect } from "react";
import { Box, CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";
import { UserPen } from "lucide-react";
import { useForm } from "react-hook-form";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface PhInfoForm {
  lastName: string;
  firstName: string;
  middleName: string;
  /** ISO, as the native date input holds it. */
  birthdate: string;
}

export interface RopPhInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown, never edited. */
  lpaNo: string;
  /** What the form opens on. */
  defaults: PhInfoForm;
  onSave: (info: PhInfoForm) => void;
}

export function RopPhInfoDialog({
  open,
  onOpenChange,
  lpaNo,
  defaults,
  onSave,
}: RopPhInfoDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhInfoForm>({ defaultValues: defaults });

  // Reopen on what is currently shown, so a cancelled edit leaves nothing
  // behind for the next one.
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const submit = handleSubmit((values) => {
    onSave(values);
    onOpenChange(false);
  });

  const required = "Required";

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
                    <UserPen size={18} />
                  </Box>
                  <Box minW={0}>
                    <Dialog.Title
                      fontSize="md"
                      fontWeight="700"
                      color="gray.800"
                    >
                      Edit PH Info
                    </Dialog.Title>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      Planholder name and birthdate on this plan
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
                  <FloatingLabelInput
                    label="LPA No."
                    value={lpaNo}
                    readOnly
                    disabled
                  />
                  <FloatingLabelInput
                    label="Last Name"
                    autoFocus
                    {...register("lastName", {
                      required,
                      setValueAs: (v: string) => v.trim(),
                    })}
                    errorText={errors.lastName?.message}
                  />
                  <FloatingLabelInput
                    label="First Name"
                    {...register("firstName", {
                      required,
                      setValueAs: (v: string) => v.trim(),
                    })}
                    errorText={errors.firstName?.message}
                  />
                  <FloatingLabelInput
                    label="Middle Name"
                    {...register("middleName", {
                      setValueAs: (v: string) => v.trim(),
                    })}
                  />
                  <FloatingLabelInput
                    label="Birthday (MM/DD/YYYY)"
                    type="date"
                    {...register("birthdate", { required })}
                    errorText={errors.birthdate?.message}
                  />
                </Flex>
              </Dialog.Body>

              <Dialog.Footer gap={2}>
                <SecondaryMdButton
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SecondaryMdButton>
                <PrimaryMdButton type="submit">Save Changes</PrimaryMdButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopPhInfoDialog;
