"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import {
  Box,
  Drawer,
  Field,
  Flex,
  Grid,
  Portal,
  Select,
  Switch,
  Text,
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
} from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PayoutChannelSection } from "./PayoutChannelSection";
import { DIALOG_SHEET_CSS } from "./dialog-sheet";

/**
 * What the form collects.
 *
 * Deliberately the same shape as the beneficiary form's values — name in parts,
 * a date of birth, a relationship, and the address block — because a payee and
 * a beneficiary are the same kind of person captured the same way. What a payee
 * adds is claim-side: the amount it is paid and whether that payout is held.
 */
export interface PayeeFormValues {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  birthDate: string; // ISO "yyyy-mm-dd"
  relation: string;
  amount: string;
  isOnHold: boolean;
  lotBldgUnit: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

/** Only the string-valued keys — the text/select wrappers bind to these. */
type PayeeStringKey = {
  [K in keyof PayeeFormValues]: PayeeFormValues[K] extends string ? K : never;
}[keyof PayeeFormValues];

interface PlanholderPayeeAddDrawerProps {
  open: boolean;
  onClose: () => void;
  /** The claim the payee is being named on — shown as the drawer's subtitle. */
  claimNo?: string;
  /**
   * Show this as a CENTRED DIALOG rather than a full-height sheet.
   *
   * Same content, different presentation. The drawer is right where this opens
   * over a page you were reading and takes you somewhere — the claim detail's
   * own use. On `/claims/death-claim` the payee list is one section of a
   * column, and its add form and its detail should arrive the way the payments
   * and beneficiaries look-ups do on that page: a sheet laid over the middle of
   * the screen, sized to what is in it, closed with a cross.
   *
   * A prop rather than a second component, because only the chrome differs —
   * the form, its validation and everything it saves are the same either way.
   */
  asDialog?: boolean;
  /**
   * Save the form.
   *
   * The payout channels come through separately: they are a list the section
   * edits in place, not a field react-hook-form registers.
   */
  onSave: (values: PayeeFormValues, payouts: BeneficiaryPayout[]) => void;
}

type Option = { label: string; value: string };

/* ------------------------------ field wrappers ------------------------------ */

/** react-hook-form-bound floating-label text input. */
function TextField({
  control,
  name,
  label,
  type = "text",
}: {
  control: Control<PayeeFormValues>;
  name: PayeeStringKey;
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
  control: Control<PayeeFormValues>;
  name: PayeeStringKey;
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
 * A titled form section — plain stacked block, no card chrome, headed by the
 * claims area's own {@link SectionTitle} so this form's sections read the same
 * as the beneficiary form's.
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
      <SectionTitle title={title} subtitle={subtitle} />
      <Flex direction="column" gap={5}>
        {children}
      </Flex>
    </Box>
  );
}

/* ------------------------------ drawer ------------------------------ */

const EMPTY: PayeeFormValues = {
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  birthDate: "",
  relation: "",
  amount: "",
  isOnHold: false,
  lotBldgUnit: "",
  street: "",
  barangay: "",
  district: "",
  city: "",
  province: "",
  zipCode: "",
};

/**
 * Add a payee to a claim — a bottom sheet that stacks over the claim request
 * drawer, mirroring the Add Beneficiary sheet on the plan holder page.
 *
 * There is no edit mode here: an existing payee is edited from its own detail
 * drawer, which already has one. This sheet only ever adds.
 *
 * No backend yet — the claim drawer holds the list in state, so an added payee
 * survives until the page reloads.
 */
export function PlanholderPayeeAddDrawer({
  open,
  onClose,
  claimNo,
  onSave,
  asDialog = false,
}: PlanholderPayeeAddDrawerProps) {
  const relationOptions = useMemo(() => getBeneficiaryRelationOptions(), []);
  const channelOptions = useMemo(() => getPayoutChannelOptions(), []);

  const { control, handleSubmit, reset } = useForm<PayeeFormValues>({
    defaultValues: EMPTY,
  });

  // Held outside react-hook-form: the payout section edits a list in place.
  const [payouts, setPayouts] = useState<BeneficiaryPayout[]>([]);

  // Clear each time the sheet opens rather than leaving the last payee's
  // details behind.
  useEffect(() => {
    if (!open) return;
    reset(EMPTY);
    setPayouts([]);
  }, [open, reset]);

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
        <Drawer.Positioner
          alignItems={asDialog ? "center" : undefined}
          justifyContent={asDialog ? "center" : undefined}
          p={asDialog ? 3 : undefined}
        >
          <Drawer.Content
            display="flex"
            flexDirection="column"
            // A full-height sheet, or a centred one sized to its content — see
            // `asDialog`. The dialog's numbers are `SectionPopup`'s, so the
            // three sheets on that page are the same size and corner.
            h={asDialog ? "auto" : "100dvh"}
            maxH={asDialog ? { base: "88dvh", md: "82vh" } : "100dvh"}
            w={asDialog ? "full" : undefined}
            maxW={
              asDialog
                ? { base: "calc(100dvw - 24px)", md: "840px" }
                : undefined
            }
            css={asDialog ? DIALOG_SHEET_CSS : undefined}
            borderRadius={asDialog ? "xl" : 0}
            overflow="hidden"
          >
            {/* The same page-style bar the claim detail drawer carries — this
                sheet stacks over it, so the two must not style headers apart. */}
            <DrawerPageHeader
              title="Add Payee"
              description={claimNo ?? "Named on this claim"}
              onBack={onClose}
              dismiss={asDialog ? "close" : "back"}
            />

            <Drawer.Body py={5} overflowY="auto">
              <form
                id="payee-add-form"
                onSubmit={handleSubmit((values) => onSave(values, payouts))}
              >
                <Flex direction="column" gap={6}>
                  <Section title="Details">
                    {/* The name in parts, in the order it is READ off a claim
                        form: surname, given name, middle name, suffix. On a
                        desktop that is one row, so a name is one line of the
                        form rather than a block of four fields to work down —
                        it is a single fact entered in four boxes, and the
                        layout should say so.

                        The suffix is a fixed track and the other three divide
                        what is left. Almost every suffix is two or three
                        characters — Jr, Sr, III — and an equal quarter of the
                        row would be a box mostly empty sitting beside a surname
                        that has to truncate to fit its own. `minmax(0, 1fr)` on
                        the three so a long value scrolls inside its field
                        instead of widening the track and pushing the row past
                        the sheet.

                        Measured against the CONTAINER and not the window, the
                        same as the block on the death claim form — those two
                        are the same row and have to break at the same widths,
                        and there the window is actively misleading: that form
                        hands 360px to a summary rail at `xl`, so a wider window
                        leaves the row narrower. This sheet is the full width of
                        the screen today and the two rulers agree; asking the
                        container is what keeps them agreeing if it ever becomes
                        a side sheet. */}
                    <Box css={{ containerType: "inline-size" }}>
                      <Grid
                        templateColumns="minmax(0, 1fr)"
                        css={{
                          "@container (min-width: 400px)": {
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          },
                          "@container (min-width: 660px)": {
                            gridTemplateColumns:
                              "repeat(3, minmax(0, 1fr)) 120px",
                          },
                        }}
                        gap={5}
                      >
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
                        {/* Optional, both of them — nothing on this form is
                            validated as required today, and a payee with
                            neither is an ordinary payee, not an incomplete
                            one. */}
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
                      </Grid>
                    </Box>
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
                    {/* Claim-side, so it has no counterpart on the beneficiary
                        form: what this payee is paid out of the claim. */}
                    <TextField
                      control={control}
                      name="amount"
                      label="Amount"
                      type="number"
                    />

                    {/* On Hold — the same toggle the payee edit form carries. */}
                    <Controller
                      control={control}
                      name="isOnHold"
                      render={({ field }) => (
                        <Flex
                          align="center"
                          justify="space-between"
                          gap={3}
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="lg"
                          px={4}
                          py={3}
                        >
                          <Box minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color="gray.800"
                            >
                              On Hold
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Hold the payout for this payee.
                            </Text>
                          </Box>
                          <Switch.Root
                            checked={field.value}
                            onCheckedChange={(e) => field.onChange(e.checked)}
                            colorPalette="green"
                            flexShrink={0}
                          >
                            <Switch.HiddenInput onBlur={field.onBlur} />
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch.Root>
                        </Flex>
                      )}
                    />
                  </Section>

                  {/* The same address block the beneficiary form captures, in
                      the same order, stacked one field per row. */}
                  <Section title="Address">
                    <TextField
                      control={control}
                      name="lotBldgUnit"
                      label="Lot/Bldg/Unit No."
                    />
                    <TextField control={control} name="street" label="Street" />
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
                      `Section` like the two above. Inline while the payee has
                      no channel, in a stacked sheet once it has one. */}
                  <PayoutChannelSection
                    payouts={payouts}
                    onChange={setPayouts}
                    channelOptions={channelOptions}
                    subject="payee"
                  />
                </Flex>
              </form>
            </Drawer.Body>

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
                form="payee-add-form"
              />
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderPayeeAddDrawer;
