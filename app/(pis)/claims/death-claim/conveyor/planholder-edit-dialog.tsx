"use client";

// THE PROCESSOR'S CORRECTION OF THE PLANHOLDER — name and date of birth, from
// the rail's Edit.
//
// A POP-UP IN THE CENTRE, like every other form on this screen (see
// `ReasonDialog`), and nothing on the card is editable in place: the card is the
// record being checked, and a field that turned into an input under the pointer
// would make reading it and changing it the same gesture.
//
// Bare, per this area's forms: the fields and the two buttons, no helper text.
// What a save does — the record is left as filed, the claim carries the proposal
// — is the store's business and is written there, on `PlanholderCorrection`.

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, Flex, SimpleGrid } from "@chakra-ui/react";
import {
  FloatingLabelInput,
  PrimarySmButton,
  SecondarySmButton,
} from "osp-ui-kit";
import { SectionPopup } from "../../components/section-popup";
import { SectionTitle } from "../../components/section-title";
import { FloatingLabelDate } from "../../components/floating-fields";
import {
  CORRECTABLE_PLANHOLDER_FIELDS,
  type PlanholderField,
  type PlanholderValues,
} from "../../claim-store";

const NAME_FIELDS: PlanholderField[] = [
  "lastName",
  "firstName",
  "middleName",
  "suffix",
];

export function PlanholderEditDialog({
  open,
  onClose,
  subtitle,
  values,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  /** The LPA number — which record this is. */
  subtitle: string;
  /** What the claim reads now: the record with any earlier proposal laid over. */
  values: PlanholderValues;
  onSave: (values: PlanholderValues) => void;
}) {
  const { control, handleSubmit, reset } = useForm<PlanholderValues>({
    defaultValues: values,
  });

  // RE-SEEDED EVERY TIME IT OPENS. It stays mounted for the page's life — see
  // `SectionPopup` — so without this the last claim's planholder would be sitting
  // in the fields when the next one is corrected.
  useEffect(() => {
    if (open) reset(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = handleSubmit((form) =>
    onSave(
      Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, value.trim()]),
      ) as PlanholderValues,
    ),
  );

  return (
    <SectionPopup
      title="Edit Planholder"
      open={open}
      onClose={onClose}
      maxW="520px"
    >
      <SectionTitle title="Edit Planholder" subtitle={subtitle} />

      <form onSubmit={submit}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          {/* Each in a `Field.Root`: the floating fields read their styles
              from it and throw without one — as the claim's own edit form has
              them. */}
          {NAME_FIELDS.map((name) => (
            <Field.Root key={name}>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <FloatingLabelInput
                    label={CORRECTABLE_PLANHOLDER_FIELDS[name]}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field.Root>
          ))}
          <Field.Root gridColumn={{ sm: "span 2" }}>
            <Controller
              control={control}
              name="dateOfBirthISO"
              render={({ field }) => (
                <FloatingLabelDate
                  label={CORRECTABLE_PLANHOLDER_FIELDS.dateOfBirthISO}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Field.Root>
        </SimpleGrid>

        <Flex justify="flex-end" gap={2} mt={5}>
          <SecondarySmButton type="button" onClick={onClose}>
            Cancel
          </SecondarySmButton>
          <PrimarySmButton type="submit">Save</PrimarySmButton>
        </Flex>
      </form>
    </SectionPopup>
  );
}

export default PlanholderEditDialog;
