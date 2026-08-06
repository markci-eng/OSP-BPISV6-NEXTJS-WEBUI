"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import {
  Box,
  Button,
  Drawer,
  Field,
  Flex,
  Portal,
  Select,
  Separator,
  SimpleGrid,
  Switch,
  Text,
  createListCollection,
  defineStyle,
} from "@chakra-ui/react";
import { LuChevronLeft, LuPencil } from "react-icons/lu";
import { toast } from "sonner";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { FloatingLabelInput } from "osp-ui-kit";
import {
  getPayoutChannelOptions,
  type ClaimPayee,
} from "../../claims-data";

interface PlanholderPayeeEditDrawerProps {
  /** The payee being edited. `null`/`undefined` keeps the drawer closed. */
  payee?: ClaimPayee | null;
  open: boolean;
  onClose: () => void;
}

type Option = { label: string; value: string };

/** Only the string-valued form keys — the text/select wrappers bind to these. */
type PayeeStringKey = {
  [K in keyof PayeeFormValues]: PayeeFormValues[K] extends string ? K : never;
}[keyof PayeeFormValues];

interface PayeeFormValues {
  name: string;
  relation: string;
  birthDate: string; // ISO "yyyy-mm-dd"
  amount: string;
  address: string;
  contact: string;
  email: string;
  channelCode: string;
  accountNo: string;
  payoutBranch: string;
  isOnHold: boolean;
}

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

/** A titled form section — plain stacked block, no card chrome. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wide"
        color="gray.400"
        mb={4}
      >
        {title}
      </Text>
      <Flex direction="column" gap={5}>
        {children}
      </Flex>
    </Box>
  );
}

/* ------------------------------ drawer ------------------------------ */

/**
 * Payee edit drawer — a second bottom sheet that slides up over the payee
 * detail drawer when "Edit" is tapped. Reuses the same chrome (green back
 * chevron, rounded icon, bold title + muted subtitle) so it reads as one flow.
 * The form mirrors the read-only view: a Details section and a Payout Channel
 * section. No backend yet — Save acknowledges and closes.
 */
export function PlanholderPayeeEditDrawer({
  payee,
  open,
  onClose,
}: PlanholderPayeeEditDrawerProps) {
  const channelOptions = useMemo(() => getPayoutChannelOptions(), []);

  const { control, handleSubmit, reset } = useForm<PayeeFormValues>({
    defaultValues: {
      name: "",
      relation: "",
      birthDate: "",
      amount: "",
      address: "",
      contact: "",
      email: "",
      channelCode: "",
      accountNo: "",
      payoutBranch: "",
      isOnHold: false,
    },
  });

  // Repopulate the form each time the drawer opens for a payee, so it always
  // reflects the latest saved values (and discards any abandoned edits).
  useEffect(() => {
    if (!open || !payee) return;
    reset({
      name: clean(payee.name),
      relation: clean(payee.relation),
      birthDate: payee.birthDateISO,
      amount: String(payee.amount ?? ""),
      address: clean(payee.address),
      contact: clean(payee.contact),
      email: clean(payee.email),
      channelCode: payee.channelCode,
      accountNo: clean(payee.accountNo),
      payoutBranch: clean(payee.payoutBranch),
      isOnHold: payee.isOnHold,
    });
  }, [open, payee, reset]);

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

  const onSubmit = (values: PayeeFormValues) => {
    // No backend yet — acknowledge the edit and close.
    console.log("Payee edited", { claimNo: payee?.claimNo, ...values });
    toast.success("Payee updated", {
      description: `${values.name || "Payee"}'s details were saved.`,
    });
    onClose();
  };

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
            <Drawer.Header
              borderBottomWidth="1px"
              borderColor="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Flex align="center" gap={2} minW={0}>
                <Flex
                  as="button"
                  align="center"
                  onClick={onClose}
                  cursor="pointer"
                  color="green.600"
                  _dark={{ color: "green.400" }}
                  aria-label="Go back"
                  flexShrink={0}
                  px={1}
                  py={1}
                  mr={1}
                  borderRadius="md"
                  _hover={{ bg: "green.50" }}
                  _active={{ transform: "scale(0.93)" }}
                  transition="all 0.14s ease"
                  userSelect="none"
                >
                  <LuChevronLeft size={20} strokeWidth={2.5} />
                </Flex>
                <Box
                  p={2.5}
                  borderRadius="full"
                  bg="#eaf5ee"
                  color={BRAND_COLORS.darkGreen}
                  flexShrink={0}
                >
                  <LuPencil size={18} />
                </Box>
                <Box minW={0}>
                  <Drawer.Title>
                    <Text
                      fontWeight="bold"
                      color={BRAND_COLORS.darkGreen}
                      truncate
                    >
                      Edit Payee
                    </Text>
                  </Drawer.Title>
                  <Text fontSize="xs" color="gray.500" truncate>
                    {payee ? payee.claimNo : ""}
                  </Text>
                </Box>
              </Flex>
            </Drawer.Header>

            <Drawer.Body py={5} overflowY="auto">
              <form id="payee-edit-form" onSubmit={handleSubmit(onSubmit)}>
                <Flex direction="column" gap={6}>
                  <Section title="Details">
                    <TextField control={control} name="name" label="Payee Name" />
                    <TextField
                      control={control}
                      name="relation"
                      label="Relation"
                    />
                    <TextField
                      control={control}
                      name="birthDate"
                      label="Date of Birth"
                      type="date"
                    />
                    <TextField
                      control={control}
                      name="amount"
                      label="Amount"
                      type="number"
                    />
                    <TextField
                      control={control}
                      name="address"
                      label="Address"
                    />
                    <TextField
                      control={control}
                      name="contact"
                      label="Contact"
                    />
                    <TextField control={control} name="email" label="Email" />

                    {/* On Hold — toggle the payout hold for this payee. */}
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

                  <Separator />

                  <Section title="Payout Channel">
                    <SelectField
                      control={control}
                      name="channelCode"
                      label="Channel"
                      items={channelOptions}
                    />
                    <TextField
                      control={control}
                      name="accountNo"
                      label="Account No."
                    />
                    <TextField
                      control={control}
                      name="payoutBranch"
                      label="Branch"
                    />
                  </Section>
                </Flex>
              </form>
            </Drawer.Body>

            <Drawer.Footer borderTopWidth="1px" borderColor="gray.100" gap={3}>
              <Button
                type="button"
                variant="outline"
                borderRadius="full"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="payee-edit-form"
                borderRadius="full"
                bg={BRAND_COLORS.primaryGreen}
                color="white"
                _hover={{ bg: BRAND_COLORS.darkGreen }}
              >
                Save
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderPayeeEditDrawer;
