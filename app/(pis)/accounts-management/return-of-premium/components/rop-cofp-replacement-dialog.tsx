"use client";

// Request COFP Replacement — opened from the page header, beside the title.
//
// The planholder's name and birthdate, as they should print on the new
// Certificate of Full Payment. It opens on what the record already holds, so
// the processor corrects rather than retypes; the middle name is not on the
// ROP record and starts blank.
//
// Nothing is persisted yet — a submit confirms with a toast.

import { useEffect } from "react";
import { Box, CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";
import { FileBadge } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

export interface CofpReplacementForm {
  lastName: string;
  firstName: string;
  middleName: string;
  /** ISO, as the native date input holds it. */
  birthdate: string;
}

export interface RopCofpReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What the form opens on. */
  defaults: CofpReplacementForm;
}

export function RopCofpReplacementDialog({
  open,
  onOpenChange,
  defaults,
}: RopCofpReplacementDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CofpReplacementForm>({ defaultValues: defaults });

  // Reopen on the record's values, so a cancelled request leaves nothing
  // behind for the next one.
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const submit = handleSubmit(() => {
    toast.success("COFP replacement request submitted");
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
                    <FileBadge size={18} />
                  </Box>
                  <Box minW={0}>
                    <Dialog.Title
                      fontSize="md"
                      fontWeight="700"
                      color="gray.800"
                    >
                      Request COFP Replacement
                    </Dialog.Title>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      Planholder details as they should print on the certificate
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
                    label="Date of Birth (MM/DD/YYYY)"
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
                <PrimaryMdButton type="submit">Submit Request</PrimaryMdButton>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default RopCofpReplacementDialog;
