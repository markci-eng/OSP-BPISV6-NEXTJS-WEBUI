"use client";

// THE PHONE'S ADD PAYEE — option A of the mock-up (user, 2026-10-02): one
// scrolling bottom sheet, the History sheet's own, with the X as Cancel and Add
// pinned at its foot. The same sections in the same order as the desktop form —
// Name, Details, Address, Payout channel — so the two cannot drift.
//
// SHORT FIELDS SHARE A ROW (name 2×2 with a narrow suffix, birth date beside
// relationship, barangay beside district, city beside province), which is what
// keeps it a sheet rather than a page.
//
// RELATIONSHIP IS PICKED FROM A LIST IN THE SAME SHEET (user, same day: "keep
// the in-sheet list") — see `sheet-picker`.
//
// "+ ADD CHANNEL" STACKS A SHORT SHEET over this one, fitted to its two fields:
// the phone's form of `PayoutChannelDrawer`: channel, account, and the
// supporting documents (user, 2026-10-02). Its channel list opens inside it
// the same way. On a phone there is no inline first-channel form — the button
// is the one way in.
//
// No prose: the desktop's subtitles and the On Hold helper text are left out.

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Grid, Switch, Text } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { LuPlus } from "react-icons/lu";
import {
  FloatingLabelInput,
  PrimarySmButton,
  SecondarySmButton,
  useMessageDialog,
} from "osp-ui-kit";
import {
  getBeneficiaryRelationOptions,
  getPayoutChannelByCode,
  getPayoutChannelOptions,
  type BeneficiaryPayout,
} from "../claims-data";
import type { PayeeFormValues } from "../planholder/components/PlanholderPayeeAddDrawer";
import { PayoutRow } from "../planholder/components/PayoutChannelSection";
import { usePayoutChannelForm } from "../planholder/components/PayoutChannelForm";
import { BottomSheet } from "./bottom-sheet";
import { SectionTitle } from "./section-title";
import { SheetFileRow, SheetFileTarget, useSheetFileInput } from "./sheet-file";
import {
  FieldError,
  PickerField,
  PickerGroup,
  PickerRow,
  PickerTitle,
} from "./sheet-picker";

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

/** Two fields to a row; the suffix track is narrow — it is "Jr" or "III". */
const PAIR = "repeat(2, minmax(0, 1fr))";
const NAME_SUFFIX = "minmax(0, 1fr) 84px";

/* ------------------------------ payout sheet ------------------------------ */

/** The desktop uploader's limits (`PayoutChannelFields`). */
const MAX_FILES = 5;
const MAX_FILE_MB = 10;

type ChannelOption = { label: string; value: string };

/** "BANK ACCOUNT" → "Bank account"; the seed's types are upper-case codes. */
function channelTypeLabel(type: string): string {
  if (type === "EWALLET") return "E-wallet";
  if (!type) return "Other";
  return type.charAt(0) + type.slice(1).toLowerCase();
}

/** The channels grouped by their type, in the seed's order. */
function groupChannels(
  options: ChannelOption[],
): { type: string; items: ChannelOption[] }[] {
  const groups = new Map<string, ChannelOption[]>();
  for (const option of options) {
    const type = getPayoutChannelByCode(option.value)?.channelType ?? "";
    groups.set(type, [...(groups.get(type) ?? []), option]);
  }
  return [...groups].map(([type, items]) => ({ type, items }));
}

/**
 * Add or edit one payout channel — a short sheet stacked over the payee sheet.
 * `payout` set means edit.
 */
function PayoutSheet({
  open,
  payout,
  channelOptions,
  onClose,
  onSave,
}: {
  open: boolean;
  payout: BeneficiaryPayout | null;
  channelOptions: ChannelOption[];
  onClose: () => void;
  onSave: (payout: BeneficiaryPayout) => void;
}) {
  const form = usePayoutChannelForm({ payout, active: open, channelOptions });
  const [picking, setPicking] = useState(false);
  const [tried, setTried] = useState(false);
  const groups = useMemo(() => groupChannels(channelOptions), [channelOptions]);

  // THE SUPPORTING DOCUMENTS — the desktop form's uploader, with its limits.
  // Held only while the sheet is open: like the desktop's, nothing stores them
  // against the payout yet, so an edit reopens with none.
  const [files, setFiles] = useState<File[]>([]);
  const [tooLarge, setTooLarge] = useState<string[]>([]);
  const fileInput = useSheetFileInput({
    multiple: true,
    onFiles: (picked) => {
      const big = picked.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      const ok = picked.filter((f) => !big.includes(f));
      setTooLarge(big.map((f) => f.name));
      setFiles((prev) => [...prev, ...ok].slice(0, MAX_FILES));
    },
  });

  useEffect(() => {
    if (!open) return;
    setPicking(false);
    setTried(false);
    setFiles([]);
    setTooLarge([]);
  }, [open]);

  const chosen = channelOptions.find((o) => o.value === form.channelCode);
  const channelMissing = tried && !form.channelCode;
  const accountMissing = tried && !form.accountNo.trim();

  const save = () => {
    setTried(true);
    const entry = form.buildPayout();
    if (!entry) return;
    onSave(entry);
  };

  return (
    <BottomSheet
      title={
        picking ? (
          <PickerTitle label="Payout channel" onBack={() => setPicking(false)} />
        ) : payout ? (
          "Edit payout channel"
        ) : (
          "Add payout channel"
        )
      }
      open={open}
      onClose={onClose}
      footer={
        picking ? undefined : (
          <PrimarySmButton w="full" h="42px" minH="42px" onClick={save}>
            {payout ? "Save" : "Add"}
          </PrimarySmButton>
        )
      }
    >
      {picking ? (
        <Flex direction="column" gap={3}>
          {groups.map((group) => (
            <PickerGroup key={group.type} label={channelTypeLabel(group.type)}>
              {group.items.map((option) => (
                <PickerRow
                  key={option.value}
                  label={option.label}
                  onPick={() => {
                    form.setChannelCode(option.value);
                    setPicking(false);
                  }}
                />
              ))}
            </PickerGroup>
          ))}
        </Flex>
      ) : (
        <Flex direction="column" gap={4} pt={2}>
          <Box>
            <PickerField
              label="Payout channel"
              value={chosen?.label}
              placeholder="Choose a channel"
              invalid={channelMissing}
              onClick={() => setPicking(true)}
            />
            {channelMissing && <FieldError>Choose a channel</FieldError>}
          </Box>
          <FloatingLabelInput
            label="Payout account"
            inputMode="numeric"
            value={form.accountNo}
            onValueChange={form.setAccountNo}
            errorText={accountMissing ? "Enter the account" : undefined}
          />

          <Box>
            <SectionTitle title="Documents" compact />
            {fileInput.input}
            <Flex direction="column" gap={2}>
              {files.map((file, i) => (
                <SheetFileRow
                  key={`${file.name}-${i}`}
                  file={file}
                  actionLabel="Remove"
                  onAction={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                />
              ))}
              {files.length < MAX_FILES && (
                <SheetFileTarget onClick={fileInput.open} />
              )}
            </Flex>
            {tooLarge.length > 0 && (
              <FieldError>
                Over {MAX_FILE_MB} MB, not added: {tooLarge.join(", ")}
              </FieldError>
            )}
          </Box>
        </Flex>
      )}
    </BottomSheet>
  );
}

/* ------------------------------ payee sheet ------------------------------ */

export interface AddPayeeSheetProps {
  open: boolean;
  onClose: () => void;
  /** Same contract as `PlanholderPayeeAddDrawer`'s, so callers swap freely. */
  onSave: (values: PayeeFormValues, payouts: BeneficiaryPayout[]) => void;
}

/**
 * ALWAYS IN THE TREE, with `open` driving it — never `{open && <AddPayeeSheet/>}`.
 */
export function AddPayeeSheet({ open, onClose, onSave }: AddPayeeSheetProps) {
  const { messageBox } = useMessageDialog();
  const relationOptions = useMemo(() => getBeneficiaryRelationOptions(), []);
  const channelOptions = useMemo(() => getPayoutChannelOptions(), []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayeeFormValues>({ defaultValues: EMPTY });

  // Held outside react-hook-form, as on the desktop form: a list, not a field.
  const [payouts, setPayouts] = useState<BeneficiaryPayout[]>([]);
  const [pickingRelation, setPickingRelation] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryPayout | null>(null);

  // A fresh form each time it opens.
  useEffect(() => {
    if (!open) return;
    reset(EMPTY);
    setPayouts([]);
    setPickingRelation(false);
    setPayoutOpen(false);
    setEditing(null);
  }, [open, reset]);

  const add = handleSubmit((values) => onSave(values, payouts));

  const openPayout = (payout: BeneficiaryPayout | null) => {
    setEditing(payout);
    setPayoutOpen(true);
  };

  const savePayout = (entry: BeneficiaryPayout) => {
    setPayouts((prev) =>
      editing
        ? prev.map((p) => (p.id === entry.id ? entry : p))
        : [...prev, entry],
    );
    setPayoutOpen(false);
  };

  // A channel is never removed without asking — the same confirm as desktop.
  const removePayout = async (payout: BeneficiaryPayout): Promise<boolean> => {
    const confirmed = await messageBox({
      title: "REMOVE PAYOUT CHANNEL",
      message: `Remove ${payout.channelName} (${payout.accountNoMasked}) from this payee's payout channels?`,
      confirmText: "Remove",
      variant: "confirmation",
    });
    if (!confirmed) return false;
    setPayouts((prev) => prev.filter((p) => p.id !== payout.id));
    return true;
  };

  return (
    <>
      <BottomSheet
        title={
          pickingRelation ? (
            <PickerTitle
              label="Relationship"
              onBack={() => setPickingRelation(false)}
            />
          ) : (
            "Add payee"
          )
        }
        open={open}
        onClose={onClose}
        footer={
          pickingRelation ? undefined : (
            <PrimarySmButton w="full" h="42px" minH="42px" onClick={add}>
              Add
            </PrimarySmButton>
          )
        }
      >
        <Controller
          control={control}
          name="relation"
          render={({ field }) => (
            // THE LIST IS HIDDEN, NOT UNMOUNTED, while the form shows, and the
            // form likewise — the inputs keep what was typed across the trip.
            <Flex
              direction="column"
              gap={3}
              display={pickingRelation ? "flex" : "none"}
            >
              <PickerGroup label="Relationship">
                {relationOptions.map((option) => (
                  <PickerRow
                    key={option.value}
                    label={option.label}
                    onPick={() => {
                      field.onChange(option.value);
                      setPickingRelation(false);
                    }}
                  />
                ))}
              </PickerGroup>
            </Flex>
          )}
        />

        <Flex
          direction="column"
          gap={6}
          pt={1}
          display={pickingRelation ? "none" : "flex"}
        >
          <Box>
            <SectionTitle title="Name" compact />
            <Flex direction="column" gap={4}>
              <Grid templateColumns={PAIR} gap={2}>
                <FloatingLabelInput
                  label="Last name"
                  {...register("lastName", {
                    validate: (v) => v.trim().length > 0 || "Required",
                  })}
                  errorText={errors.lastName?.message}
                />
                <FloatingLabelInput
                  label="First name"
                  {...register("firstName", {
                    validate: (v) => v.trim().length > 0 || "Required",
                  })}
                  errorText={errors.firstName?.message}
                />
              </Grid>
              <Grid templateColumns={NAME_SUFFIX} gap={2}>
                <FloatingLabelInput
                  label="Middle name"
                  {...register("middleName")}
                />
                <FloatingLabelInput label="Suffix" {...register("suffix")} />
              </Grid>
            </Flex>
          </Box>

          <Box>
            <SectionTitle title="Details" compact />
            <Flex direction="column" gap={4}>
              {/* The picker gets its own row: its frame is not the kit input's,
                  and side by side the mismatch shows. */}
              <Grid templateColumns={PAIR} gap={2}>
                <FloatingLabelInput
                  label="Date of birth"
                  type="date"
                  {...register("birthDate")}
                />
                <FloatingLabelInput
                  label="Amount"
                  type="number"
                  inputMode="decimal"
                  {...register("amount")}
                />
              </Grid>
              <Controller
                control={control}
                name="relation"
                render={({ field }) => (
                  <PickerField
                    label="Relationship"
                    value={field.value || undefined}
                    placeholder="Choose a relationship"
                    onClick={() => setPickingRelation(true)}
                  />
                )}
              />
              <Controller
                control={control}
                name="isOnHold"
                render={({ field }) => (
                  <Flex
                    align="center"
                    justify="space-between"
                    minH="44px"
                    px={3}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="xl"
                  >
                    <Text fontSize="13px" color="gray.800">
                      On hold
                    </Text>
                    <Switch.Root
                      checked={field.value}
                      onCheckedChange={(e) => field.onChange(e.checked)}
                      colorPalette="green"
                    >
                      <Switch.HiddenInput onBlur={field.onBlur} />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                  </Flex>
                )}
              />
            </Flex>
          </Box>

          <Box>
            <SectionTitle title="Address" compact />
            <Flex direction="column" gap={4}>
              <FloatingLabelInput
                label="Lot/Bldg/Unit no."
                {...register("lotBldgUnit")}
              />
              <FloatingLabelInput label="Street" {...register("street")} />
              <Grid templateColumns={PAIR} gap={2}>
                <FloatingLabelInput label="Barangay" {...register("barangay")} />
                <FloatingLabelInput label="District" {...register("district")} />
              </Grid>
              <Grid templateColumns={PAIR} gap={2}>
                <FloatingLabelInput label="City" {...register("city")} />
                <FloatingLabelInput label="Province" {...register("province")} />
              </Grid>
              <Grid templateColumns={PAIR} gap={2}>
                <FloatingLabelInput
                  label="Zip code"
                  inputMode="numeric"
                  {...register("zipCode")}
                />
              </Grid>
            </Flex>
          </Box>

          <Box>
            <SectionTitle title="Payout channel" compact />
            {payouts.length > 0 && (
              <Flex direction="column" gap={2}>
                {payouts.map((payout) => (
                  <PayoutRow
                    key={payout.id}
                    payout={payout}
                    onClick={() => openPayout(payout)}
                    onRequestRemove={() => removePayout(payout)}
                  />
                ))}
              </Flex>
            )}
            <Box mt={payouts.length > 0 ? 3 : 0}>
              <SecondarySmButton
                w="full"
                h="44px"
                minH="44px"
                onClick={() => openPayout(null)}
              >
                <LuPlus /> Add channel
              </SecondarySmButton>
            </Box>
          </Box>
        </Flex>
      </BottomSheet>

      <PayoutSheet
        open={open && payoutOpen}
        payout={editing}
        channelOptions={channelOptions}
        onClose={() => setPayoutOpen(false)}
        onSave={savePayout}
      />
    </>
  );
}

export default AddPayeeSheet;
