"use client";

// Edit PH Info — opened from the pencil in a For Printing row's Action column
// (user, 2026-10-02). The name the certificate prints, and the address it is
// sent to.
//
// Laid out like the ROP screen's Edit PH Info dialog, with the birthdate swapped
// for the address. The LPA number is shown but locked: it is the record being
// corrected, not one of the corrections.
//
// THE ADDRESS CASCADES: province, then municipality/city, then district, then
// barangay, each listing only what sits under the one before it. Changing one
// clears everything below it — a barangay picked under the old city is not one
// the new city has. Street is typed; House No is typed and optional.
//
// IT EDITS A DRAFT. The list card keeps what comes back; nothing is persisted
// until there is somewhere to persist it to.

import { useEffect } from "react";
import { Box, CloseButton, Dialog, Flex, Grid, Portal, Text } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  PrimaryMdButton,
  SecondaryMdButton,
} from "osp-ui-kit";
import { UserPen } from "lucide-react";
import { useForm } from "react-hook-form";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  COFP_LOCATIONS,
  barangaysOf,
  citiesOf,
  districtsOf,
} from "../data/locations";
import type { CofpAddress } from "../data/types";

export interface CofpPhInfoForm extends CofpAddress {
  lastName: string;
  firstName: string;
  middleName: string;
}

export interface CofpPhInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown, never edited. */
  lpaNo: string;
  /** What the form opens on. */
  defaults: CofpPhInfoForm;
  onSave: (info: CofpPhInfoForm) => void;
}

/** A small uppercase heading over a group of fields. */
function GroupLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      color="gray.500"
      textTransform="uppercase"
      letterSpacing="wider"
    >
      {children}
    </Text>
  );
}

export function CofpPhInfoDialog({
  open,
  onOpenChange,
  lpaNo,
  defaults,
  onSave,
}: CofpPhInfoDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CofpPhInfoForm>({ defaultValues: defaults });

  // Reopen on the row as it stands, so a cancelled edit leaves nothing behind
  // for the next one.
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  // THE FOUR DROPDOWNS ARE CONTROLLED, not `register`ed onto the DOM: each one's
  // options come from the value above it, so an uncontrolled select would be
  // handed its value before its options exist and drop it. Registered here for
  // the `required` rule alone.
  register("province", { required: "Required" });
  register("city", { required: "Required" });
  register("district", { required: "Required" });
  register("barangay", { required: "Required" });

  const province = watch("province");
  const city = watch("city");
  const district = watch("district");
  const barangay = watch("barangay");

  /** Set one dropdown and clear the ones under it. */
  const pick = (
    field: keyof CofpAddress,
    value: string,
    ...below: (keyof CofpAddress)[]
  ) => {
    setValue(field, value, { shouldValidate: true });
    below.forEach((f) => setValue(f, ""));
  };

  const submit = handleSubmit((values) => {
    onSave(values);
    onOpenChange(false);
  });

  const required = "Required";
  const trim = (v: string) => v.trim();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="lg"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <form onSubmit={submit} noValidate>
              <Dialog.Header pb={2}>
                <Flex align="start" gap={3} minW={0}>
                  <Box color={BRAND_COLORS.primaryGreen} mt={0.5} flexShrink={0}>
                    <UserPen size={18} />
                  </Box>
                  <Box minW={0}>
                    <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                      Edit PH Info
                    </Dialog.Title>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      Planholder name and address on this certificate
                    </Text>
                  </Box>
                </Flex>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top={3} right={3} />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                <Flex direction="column" gap={4}>
                  <FloatingLabelInput label="LPA No." value={lpaNo} readOnly disabled />

                  <GroupLabel>Name</GroupLabel>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                    <FloatingLabelInput
                      label="First Name"
                      autoFocus
                      {...register("firstName", { required, setValueAs: trim })}
                      errorText={errors.firstName?.message}
                    />
                    <FloatingLabelInput
                      label="Middle Name"
                      {...register("middleName", { setValueAs: trim })}
                    />
                    <FloatingLabelInput
                      label="Last Name"
                      {...register("lastName", { required, setValueAs: trim })}
                      errorText={errors.lastName?.message}
                    />
                  </Grid>

                  <GroupLabel>Address</GroupLabel>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                    <FloatingLabelSelect
                      label="Province"
                      value={province}
                      onValueChange={(v) =>
                        pick("province", v, "city", "district", "barangay")
                      }
                      errorText={errors.province?.message}
                    >
                      {COFP_LOCATIONS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      label="Municipality/City"
                      value={city}
                      onValueChange={(v) => pick("city", v, "district", "barangay")}
                      errorText={errors.city?.message}
                    >
                      {citiesOf(province).map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      label="District"
                      value={district}
                      onValueChange={(v) => pick("district", v, "barangay")}
                      errorText={errors.district?.message}
                    >
                      {districtsOf(province, city).map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelSelect
                      label="Barangay"
                      value={barangay}
                      onValueChange={(v) => pick("barangay", v)}
                      errorText={errors.barangay?.message}
                    >
                      {barangaysOf(province, city, district).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </FloatingLabelSelect>
                    <FloatingLabelInput
                      label="Street"
                      {...register("street", { required, setValueAs: trim })}
                      errorText={errors.street?.message}
                    />
                    <FloatingLabelInput
                      label="House No. (optional)"
                      {...register("houseNo", { setValueAs: trim })}
                    />
                  </Grid>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer gap={2}>
                <SecondaryMdButton type="button" onClick={() => onOpenChange(false)}>
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

export default CofpPhInfoDialog;
