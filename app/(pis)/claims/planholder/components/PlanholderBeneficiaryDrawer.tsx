"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import {
  Box,
  Drawer,
  Field,
  Flex,
  Portal,
  Select,
  SimpleGrid,
  createListCollection,
  defineStyle,
} from "@chakra-ui/react";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";
import { FloatingLabelInput } from "osp-ui-kit";
import { CancelSmButton, SaveSmButton } from "st-peter-ui";
import { SectionTitle } from "../../components/section-title";
import {
  getBeneficiaryRelationOptions,
  getPayoutChannelOptions,
  type BeneficiaryPayout,
  type PlanholderBeneficiary,
} from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PayoutChannelSection } from "./PayoutChannelSection";

/**
 * What the form collects. Deliberately the same shape as the payee form's
 * details — name in parts, a date of birth, and the relationship — so a
 * beneficiary and a payee are captured the same way.
 */
export interface BeneficiaryFormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  birthDate: string; // ISO "yyyy-mm-dd"
  relation: string;
  lotBldgUnit: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

interface PlanholderBeneficiaryDrawerProps {
  /**
   * The beneficiary being edited, or `null` to add a new one. This is what
   * puts the drawer in edit vs. add mode — it decides the title and whether
   * the fields open populated.
   */
  beneficiary?: PlanholderBeneficiary | null;
  open: boolean;
  onClose: () => void;
  /**
   * Save the form — an add when `beneficiary` is null, otherwise an edit.
   *
   * The payout channels come through separately: they are a list the section
   * edits in place, not a field react-hook-form registers.
   */
  onSave: (values: BeneficiaryFormValues, payouts: BeneficiaryPayout[]) => void;
}

type Option = { label: string; value: string };

/** "—"/empty placeholders collapse to a blank, editable field. */
const clean = (v?: string) => (v && v !== "—" ? v : "");

/* ------------------------------ field wrappers ------------------------------ */

/** react-hook-form-bound floating-label text input. */
function TextField({
  control,
  name,
  label,
  type = "text",
}: {
  control: Control<BeneficiaryFormValues>;
  name: keyof BeneficiaryFormValues;
  label: string;
  type?: string;
}) {
  return (
    <Field.Root>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FloatingLabelInput
            label={label}
            type={type}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </Field.Root>
  );
}

const floatingLabelStyles = defineStyle({
  pos: "absolute",
  bg: "bg",
  px: "0.5",
  top: "-3",
  insetStart: "2",
  fontWeight: "normal",
  pointerEvents: "none",
  color: "fg",
  zIndex: 1,
});

/** react-hook-form-bound floating-label select. */
function SelectField({
  control,
  name,
  label,
  items,
}: {
  control: Control<BeneficiaryFormValues>;
  name: keyof BeneficiaryFormValues;
  label: string;
  items: Option[];
}) {
  const collection = useMemo(() => createListCollection({ items }), [items]);
  return (
    <Field.Root>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Box pos="relative" w="full">
            <Select.Root
              collection={collection}
              value={field.value ? [field.value] : []}
              onValueChange={(d) => field.onChange(d.value[0])}
              onInteractOutside={field.onBlur}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder=" " />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {collection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <Field.Label css={floatingLabelStyles}>{label}</Field.Label>
          </Box>
        )}
      />
    </Field.Root>
  );
}

/**
 * A titled form section — plain stacked block, no card chrome. The heading is
 * the claims area's own {@link SectionTitle}, so this form's sections read the
 * same as the death claim form's and the sections on the plan holder page
 * rather than carrying their own typography.
 */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      {/* SectionTitle owns its bottom margin, so the fields follow directly. */}
      <SectionTitle title={title} subtitle={subtitle} />
      <Flex direction="column" gap={5}>
        {children}
      </Flex>
    </Box>
  );
}

/* ------------------------------ drawer ------------------------------ */

/**
 * Add / edit a beneficiary — one bottom sheet serving both, since the form is
 * the same either way and only the title differs. Headed by the shared
 * {@link DrawerPageHeader}, the same page-style bar the claim detail drawer
 * carries, so the plan holder page reads as one flow.
 *
 * Removal is not offered here: a beneficiary is removed from its detail drawer
 * or by swiping its row, so the form only ever writes.
 *
 * No backend yet — the parent holds the list in state, so edits survive until
 * the page reloads.
 */
export function PlanholderBeneficiaryDrawer({
  beneficiary,
  open,
  onClose,
  onSave,
}: PlanholderBeneficiaryDrawerProps) {
  const relationOptions = useMemo(() => getBeneficiaryRelationOptions(), []);
  const channelOptions = useMemo(() => getPayoutChannelOptions(), []);
  const isEdit = !!beneficiary;

  const EMPTY: BeneficiaryFormValues = {
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    birthDate: "",
    relation: "",
    lotBldgUnit: "",
    street: "",
    barangay: "",
    district: "",
    city: "",
    province: "",
    zipCode: "",
  };

  const { control, handleSubmit, reset } = useForm<BeneficiaryFormValues>({
    defaultValues: EMPTY,
  });

  // Held outside react-hook-form: the payout section edits a list in place,
  // and re-seeds from the beneficiary each time the drawer opens.
  const [payouts, setPayouts] = useState<BeneficiaryPayout[]>([]);
  useEffect(() => {
    if (!open) return;
    setPayouts(beneficiary ? [...beneficiary.payouts] : []);
  }, [open, beneficiary]);

  // Repopulate each time the drawer opens, so it always reflects the latest
  // saved values (and discards any abandoned edits). Opening in add mode
  // clears the form rather than leaving the last beneficiary's details behind.
  useEffect(() => {
    if (!open) return;
    reset(
      beneficiary
        ? {
            lastName: clean(beneficiary.lastName),
            firstName: clean(beneficiary.firstName),
            middleName: clean(beneficiary.middleName),
            suffix: clean(beneficiary.suffix),
            birthDate: beneficiary.birthDateISO,
            relation: clean(beneficiary.relation),
            lotBldgUnit: clean(beneficiary.lotBldgUnit),
            street: clean(beneficiary.street),
            barangay: clean(beneficiary.barangay),
            district: clean(beneficiary.district),
            city: clean(beneficiary.city),
            province: clean(beneficiary.province),
            zipCode: clean(beneficiary.zipCode),
          }
        : EMPTY,
    );
    // `EMPTY` is a fresh literal each render and would loop the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, beneficiary, reset]);

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. Restore it.
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

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            display="flex"
            flexDirection="column"
            h="100dvh"
            maxH="100dvh"
            borderRadius={0}
            overflow="hidden"
          >
            {/* The same page-style bar the claim detail drawer carries, so the
                two read as one flow rather than each styling its own header. */}
            <DrawerPageHeader
              title={isEdit ? "Edit Beneficiary" : "Add Beneficiary"}
              description={
                isEdit
                  ? beneficiary!.name
                  : "Declared by the plan holder on the plan"
              }
              onBack={onClose}
            />

            <Drawer.Body py={5} overflowY="auto">
              <form
                id="beneficiary-form"
                onSubmit={handleSubmit((values) => onSave(values, payouts))}
              >
                <Flex direction="column" gap={6}>
                  <Section title="Details">
                    {/* Name in parts, laid out like the payee form's name
                        block: two columns from `sm` up, stacked below. */}
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                      <TextField
                        control={control}
                        name="lastName"
                        label="Last Name"
                      />
                      <TextField
                        control={control}
                        name="firstName"
                        label="First Name"
                      />
                      <TextField
                        control={control}
                        name="middleName"
                        label="Middle Name"
                      />
                      <TextField
                        control={control}
                        name="suffix"
                        label="Suffix"
                      />
                    </SimpleGrid>
                    {/* Age is derived from this on save, not typed. */}
                    <TextField
                      control={control}
                      name="birthDate"
                      label="Date of Birth"
                      type="date"
                    />
                    <SelectField
                      control={control}
                      name="relation"
                      label="Relationship"
                      items={relationOptions}
                    />
                  </Section>

                  {/* Same address block the payee form captures, in the same
                      order, stacked one field per row. */}
                  <Section title="Address">
                    <TextField
                      control={control}
                      name="lotBldgUnit"
                      label="Lot/Bldg/Unit No."
                    />
                    <TextField
                      control={control}
                      name="street"
                      label="Street"
                    />
                    <TextField
                      control={control}
                      name="barangay"
                      label="Barangay"
                    />
                    <TextField
                      control={control}
                      name="district"
                      label="District"
                    />
                    <TextField control={control} name="city" label="City" />
                    <TextField
                      control={control}
                      name="province"
                      label="Province"
                    />
                    <TextField
                      control={control}
                      name="zipCode"
                      label="Zip Code"
                    />
                  </Section>

                  {/* Renders its own SectionTitle — the add control lives in
                      that heading's action slot, so it cannot be wrapped in
                      `Section` like the two above. */}
                  <PayoutChannelSection
                    payouts={payouts}
                    onChange={setPayouts}
                    channelOptions={channelOptions}
                    subject="beneficiary"
                  />
                </Flex>
              </form>
            </Drawer.Body>

            {/* Library buttons (the same ones `components/forms` uses), not
                hand-rolled pills — they carry their own label and icon. */}
            <Drawer.Footer
              borderTopWidth="1px"
              borderColor="gray.100"
              gap={2}
              justifyContent="flex-end"
            >
              <CancelSmButton
                borderRadius={STANDARD_RADIUS.md}
                onClick={onClose}
              />
              <SaveSmButton
                borderRadius={STANDARD_RADIUS.md}
                type="submit"
                form="beneficiary-form"
              />
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderBeneficiaryDrawer;
