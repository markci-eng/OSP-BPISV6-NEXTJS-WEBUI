"use client";

import {
  Alert,
  Box,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  ADDRESS_TYPES,
  CancelButton,
  DEFAULT_SIGNUP_OPTIONS,
  FloatingLabelInput,
  FloatingLabelSelect,
  ModalForm,
  ModalFormField,
  ModalFormSection,
  ModalFormSeparator,
  SaveButton,
  ZIP_CODE_LENGTH,
  useMessageDialog,
} from "osp-ui-kit";
import { usePersonSearch } from "../hooks/usePersonSearch";
import { useRelationships } from "../hooks/useRelationships";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AddressInfo,
  Beneficiary,
  PersonIdentity,
  PersonSearchResult,
} from "@/types/plan-management.types";

/** The part of an address a person types; ids and `isPrimary` are the API's. */
export type BeneficiaryAddressValues = Omit<
  AddressInfo,
  "addressId" | "personId" | "isPrimary"
>;

export interface BeneficiaryFormValues {
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;
  // ISO date (yyyy-mm-dd), as the date input produces it.
  dateOfBirth: string;
  gender: string;
  relationCode: string | null;
  relationship: string;
  sameAsPlanholderAddress: boolean;
  address: BeneficiaryAddressValues;
  /**
   * The beneficiary's own person record, or null for someone new. On an add
   * it is the existing person the lookup matched; on an edit it stays the
   * beneficiary's, so correcting a misspelt name does not detach them from
   * their record — unless the corrected identity matches someone else.
   */
  personId: string | null;
}

export interface RelationshipOption {
  label: string;
  // The API's relation code, when the option list came from the API.
  code?: string;
}

// Stored uppercase, like the rest of the form. Saved values are uppercased on
// load (see `toDraft`) so older mixed-case records still match an option.
const GENDERS = ["MALE", "FEMALE"];
const SUFFIXES = DEFAULT_SIGNUP_OPTIONS.suffix.map((s) => s.toUpperCase());
// The kit types these as uppercase but ships them mixed-case.
const ADDRESS_TYPE_OPTIONS = ADDRESS_TYPES.map((t) => t.toUpperCase());

type Draft = Omit<
  BeneficiaryFormValues,
  "middleName" | "suffix" | "address" | "personId"
> & {
  middleName: string;
  suffix: string;
  // Held as text so a half-typed ZIP code survives until submit.
  address: Omit<BeneficiaryAddressValues, "zipCode"> & { zipCode: string };
};

type Errors = Partial<Record<string, string>>;

const REQUIRED = "This field is required.";

const NAME_MAX_LENGTH = 50;

// The earliest birth date accepted, as an ISO date.
const MIN_BIRTH_DATE = "1910-01-01";

/** Today as an ISO date in local time; `toISOString` would give UTC's date. */
function today() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function toAddressDraft(address?: AddressInfo | null): Draft["address"] {
  return {
    addressType: address?.addressType?.toUpperCase() ?? "",
    addNo: address?.addNo ?? "",
    street: address?.street ?? "",
    barangay: address?.barangay ?? "",
    district: address?.district ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    zipCode: address?.zipCode != null ? String(address.zipCode) : "",
  };
}

/**
 * What the person lookup is keyed on, or null until there is enough to look
 * up: last name, first name, and a complete, past birth date. Uppercased to
 * match how the form saves names.
 */
function identityOf(draft: Draft): PersonIdentity | null {
  const lastName = draft.lastName.trim().toUpperCase();
  const firstName = draft.firstName.trim().toUpperCase();
  const birthDate = draft.dateOfBirth;
  if (!lastName || !firstName || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null;
  }
  // A date input reports a value mid-year ("0002-05-01" while "2" is being
  // typed into the year), so a year that cannot be a birth year is not sent.
  if (birthDate < MIN_BIRTH_DATE || birthDate > today()) return null;
  return {
    lastName,
    firstName,
    middleName: draft.middleName.trim().toUpperCase() || null,
    suffix: draft.suffix.trim() || null,
    birthDate,
  };
}

/** The found person's primary active address, else any active one, else any. */
function addressFromRecord(
  person: PersonSearchResult,
): Draft["address"] | null {
  const addresses = person.addresses ?? [];
  const address =
    addresses.find((a) => a.isPrimary && a.isActive) ??
    addresses.find((a) => a.isActive) ??
    addresses[0];
  if (!address) return null;
  return {
    addressType: address.addType?.toUpperCase() ?? "",
    addNo: address.addNo ?? "",
    street: address.street ?? "",
    barangay: address.barangay ?? "",
    district: address.district ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    zipCode: address.zipCode != null ? String(address.zipCode) : "",
  };
}

const withoutAddressErrors = (errors: Errors): Errors =>
  Object.fromEntries(
    Object.entries(errors).filter(([key]) => !key.startsWith("address.")),
  );

// How long the identity fields must sit still before the lookup is sent.
const LOOKUP_DELAY_MS = 500;

function sameAddress(a: Draft["address"], b: Draft["address"]) {
  return (Object.keys(a) as (keyof Draft["address"])[]).every(
    (key) => a[key].trim().toLowerCase() === b[key].trim().toLowerCase(),
  );
}

function toDraft(
  beneficiary: Beneficiary | null | undefined,
  planholderAddress: AddressInfo | null | undefined,
): Draft {
  const address = toAddressDraft(beneficiary?.address);
  return {
    lastName: beneficiary?.lastName ?? "",
    firstName: beneficiary?.firstName ?? "",
    middleName: beneficiary?.middleName ?? "",
    suffix: beneficiary?.suffix?.toUpperCase() ?? "",
    dateOfBirth: beneficiary?.dateOfBirth?.slice(0, 10) ?? "",
    gender: beneficiary?.gender?.toUpperCase() ?? "",
    relationCode: beneficiary?.relationCode ?? null,
    relationship: beneficiary?.relationship ?? "",
    sameAsPlanholderAddress:
      !!beneficiary &&
      !!planholderAddress &&
      sameAddress(address, toAddressDraft(planholderAddress)),
    address,
  };
}

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  const lastName = draft.lastName.trim();
  if (!lastName) errors.lastName = "Last Name is required.";
  else if (lastName.length < 2 || lastName.length > NAME_MAX_LENGTH) {
    errors.lastName = `Last Name must be between 2 and ${NAME_MAX_LENGTH} characters long.`;
  }

  const firstName = draft.firstName.trim();
  if (!firstName) errors.firstName = "First Name is required.";
  else if (firstName.length > NAME_MAX_LENGTH) {
    errors.firstName = `First Name must be between 1 and ${NAME_MAX_LENGTH} characters long.`;
  }

  // Optional, but a period on its own (an "N/A" stand-in) is not a name.
  const middleName = draft.middleName.trim();
  if (/^[.\s]+$/.test(middleName)) {
    errors.middleName = "Period is not a valid Middle name.";
  } else if (middleName.length > NAME_MAX_LENGTH) {
    errors.middleName = `Middle name must be between 1 and ${NAME_MAX_LENGTH} characters long.`;
  }

  const required = ["dateOfBirth", "gender", "relationship"] as const;
  for (const key of required) {
    if (!draft[key].trim()) errors[key] = REQUIRED;
  }

  // The API requires the reference table's code, not just a label. A label
  // with no code is a saved relationship the table does not know; an empty
  // one is already caught as required above.
  if (draft.relationship.trim() && !draft.relationCode?.trim()) {
    errors.relationship = "Choose a relationship from the list.";
  }

  // ISO dates compare correctly as strings.
  if (draft.dateOfBirth && draft.dateOfBirth < MIN_BIRTH_DATE) {
    errors.dateOfBirth = "Date of birth cannot be earlier than 01/01/1910.";
  } else if (draft.dateOfBirth && draft.dateOfBirth > today()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  for (const [key, value] of Object.entries(draft.address)) {
    if (!value.trim()) errors[`address.${key}`] = REQUIRED;
  }
  const zip = draft.address.zipCode.trim();
  if (zip && !new RegExp(`^\\d{${ZIP_CODE_LENGTH}}$`).test(zip)) {
    errors["address.zipCode"] = `ZIP code must be ${ZIP_CODE_LENGTH} digits.`;
  }

  return errors;
}

// Free text is shown uppercase with CSS while typing, rather than rewritten on
// every keystroke, so editing mid-word doesn't throw the caret to the end. The
// values themselves are uppercased on submit.
const UPPERCASE = { textTransform: "uppercase" } as const;

function toValues(
  draft: Draft,
  personId: string | null,
): BeneficiaryFormValues {
  const upper = (value: string) => value.trim().toUpperCase();
  const optional = (value: string) => value.trim() || null;
  return {
    ...draft,
    personId,
    lastName: upper(draft.lastName),
    firstName: upper(draft.firstName),
    middleName: optional(upper(draft.middleName)),
    suffix: optional(draft.suffix),
    address: {
      addressType: draft.address.addressType.trim().toUpperCase(),
      addNo: upper(draft.address.addNo),
      street: upper(draft.address.street),
      barangay: upper(draft.address.barangay),
      district: upper(draft.address.district),
      city: upper(draft.address.city),
      province: upper(draft.address.province),
      zipCode: Number(draft.address.zipCode.trim()),
    },
  };
}

export interface BeneficiaryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The beneficiary being edited. Omit (or pass null) to add one. */
  beneficiary?: Beneficiary | null;
  /** Backs the "same as planholder address" toggle; the toggle is disabled without it. */
  planholderAddress?: AddressInfo | null;
  /** Overrides the relationship list, which otherwise comes from the API's reference table. */
  relationshipOptions?: RelationshipOption[];
  /**
   * Return a promise to keep the modal open until it settles: it closes when
   * the promise resolves, and stays open showing the error's message when it
   * rejects, with the form as it was so nothing has to be typed again.
   */
  onAdd?: (values: BeneficiaryFormValues) => void | Promise<void>;
  /** Receives the original alongside the new values, so ids can be carried over. */
  onEdit?: (
    values: BeneficiaryFormValues,
    original: Beneficiary,
  ) => void | Promise<void>;
}

const SAVE_FAILED = "The beneficiary could not be saved. Please try again.";

export function BeneficiaryFormModal({
  open,
  onOpenChange,
  beneficiary,
  planholderAddress,
  relationshipOptions: relationshipOverride,
  onAdd,
  onEdit,
}: BeneficiaryFormModalProps) {
  const isEdit = !!beneficiary;
  const { messageBox } = useMessageDialog();
  const relationshipQuery = useRelationships();
  const relationshipOptions: RelationshipOption[] = useMemo(
    () =>
      relationshipOverride ??
      (relationshipQuery.data ?? []).map((row) => ({
        label: row.description,
        code: row.relationCode,
      })),
    [relationshipOverride, relationshipQuery.data],
  );
  const [draft, setDraft] = useState<Draft>(() =>
    toDraft(beneficiary, planholderAddress),
  );
  const [errors, setErrors] = useState<Errors>({});
  // The identity the form opened with, which is never looked up: on an edit
  // that would overwrite the saved address the moment the modal opens.
  const [openedIdentityKey, setOpenedIdentityKey] = useState(() =>
    JSON.stringify(identityOf(toDraft(beneficiary, planholderAddress))),
  );
  // The lookup whose answer has already been applied, so it is applied once.
  const [appliedLookupKey, setAppliedLookupKey] = useState<string | null>(null);
  const [addressFromLookup, setAddressFromLookup] = useState(false);
  // Who the lookup found for which identity — null when it found nobody.
  const [matchedPerson, setMatchedPerson] = useState<{
    key: string;
    personId: string | null;
  } | null>(null);
  // While `onAdd` / `onEdit` is in flight, and why the last one failed.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Start from a clean form every time the modal opens, or when it is pointed
  // at a different beneficiary. Done during render rather than in an effect so
  // the first painted frame already shows the right values.
  const [openedFor, setOpenedFor] = useState<{
    open: boolean;
    beneficiary: Beneficiary | null | undefined;
  }>({ open, beneficiary });
  if (openedFor.open !== open || openedFor.beneficiary !== beneficiary) {
    setOpenedFor({ open, beneficiary });
    if (open) {
      const fresh = toDraft(beneficiary, planholderAddress);
      setDraft(fresh);
      setErrors({});
      setOpenedIdentityKey(JSON.stringify(identityOf(fresh)));
      setAppliedLookupKey(null);
      setAddressFromLookup(false);
      setMatchedPerson(null);
      setSaveError(null);
    }
  }

  // Look the person up once the name and birth date stop changing, and fill
  // the address from their existing record. Only a settled identity is sent:
  // the debounced key still holds the previous opening's value for a moment
  // after the modal reopens, and must not be looked up against this one.
  const identity = identityOf(draft);
  const identityKey = JSON.stringify(identity);
  const settledKey = useDebounce(identityKey, LOOKUP_DELAY_MS);
  const lookupKey =
    open &&
    identity &&
    settledKey === identityKey &&
    identityKey !== openedIdentityKey
      ? identityKey
      : null;
  const personQuery = usePersonSearch(lookupKey ? identity : null);
  if (
    lookupKey &&
    lookupKey !== appliedLookupKey &&
    personQuery.data !== undefined
  ) {
    const personId = personQuery.data?.personId ?? null;
    // Whoever the form's address last belonged to: the previous match, or on
    // an edit before any lookup, the beneficiary as saved.
    const previousPersonId = matchedPerson
      ? matchedPerson.personId
      : (beneficiary?.personId ?? null);
    setAppliedLookupKey(lookupKey);
    setMatchedPerson({ key: lookupKey, personId });
    const found = personQuery.data && addressFromRecord(personQuery.data);
    // The planholder's address was asked for explicitly; leave it be.
    if (!draft.sameAsPlanholderAddress) {
      if (found) {
        setDraft((prev) => ({ ...prev, address: found }));
        setErrors(withoutAddressErrors);
        setAddressFromLookup(true);
      } else if (personId !== previousPersonId) {
        // A different person, or nobody, with no address of their own: the
        // one in the form describes whoever was matched before.
        setDraft((prev) => ({ ...prev, address: toAddressDraft(null) }));
        setErrors(withoutAddressErrors);
        setAddressFromLookup(false);
      }
    }
  }
  const lookingUp = !!lookupKey && personQuery.isFetching;

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setAddressField = (key: keyof Draft["address"], value: string) => {
    setDraft((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`address.${key}`]: undefined }));
    setAddressFromLookup(false);
  };

  const toggleSameAddress = (checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      sameAsPlanholderAddress: checked,
      // Copy the planholder's address in; turning the toggle off leaves the
      // copy in place as a starting point to edit from.
      address: checked ? toAddressDraft(planholderAddress) : prev.address,
    }));
    if (checked) {
      setErrors(withoutAddressErrors);
      setAddressFromLookup(false);
    }
  };

  const selectRelationship = (label: string) => {
    const option = relationshipOptions.find((o) => o.code === label);

    setDraft((prev) => ({
      ...prev,
      relationship: option?.label ?? "",
      relationCode: option?.code ?? null,
    }));
    setErrors((prev) => ({ ...prev, relationship: undefined }));
  };

  // Validated on the submit button's click, which the browser also fires for
  // an Enter-key submit, so the form's confirmation step is only reached with
  // a complete form.
  const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const found = validate(draft);
    setErrors(found);
    if (!Object.values(found).some(Boolean)) return;
    e.preventDefault();
    // The footer is pinned, so the fields that failed may be scrolled out of
    // sight above it. Bring the first one into view once the errors render.
    const form = e.currentTarget.form;
    requestAnimationFrame(() => {
      const field = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
      field?.scrollIntoView({ block: "center", behavior: "smooth" });
      field?.focus({ preventScroll: true });
    });
  };

  // Only a match for the identity as it now stands counts: one found for a
  // name since edited away describes somebody else.
  const matchedPersonId =
    matchedPerson?.key === identityKey ? matchedPerson.personId : null;

  const handleSubmit = async () => {
    if (saving) return;
    // Asked here rather than through `ModalForm`'s `confirmation`: given one,
    // the kit's form only flags that a confirmation is due and never draws
    // it, so `onSubmit` is never reached and Save does nothing.
    const confirmed = await messageBox({
      title: isEdit ? "Save changes?" : "Add beneficiary?",
      message: isEdit
        ? "The beneficiary's details will be updated."
        : "This beneficiary will be added to the plan.",
      confirmText: isEdit ? "Save" : "Add",
      cancelText: "Cancel",
      variant: "confirmation",
    });
    if (!confirmed) return;
    const values = toValues(
      draft,
      matchedPersonId ?? beneficiary?.personId ?? null,
    );
    setSaving(true);
    setSaveError(null);
    try {
      if (beneficiary) await onEdit?.(values, beneficiary);
      else await onAdd?.(values);
      onOpenChange(false);
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message ? error.message : SAVE_FAILED,
      );
    } finally {
      setSaving(false);
    }
  };

  // Closing mid-save would drop the answer on the floor: an add that
  // succeeds after the modal is gone has nowhere to say so.
  const requestClose = () => {
    if (!saving) onOpenChange(false);
  };

  const addressLocked = draft.sameAsPlanholderAddress;
  // Match an edited beneficiary on its code first: the plan's own label for a
  // relationship need not be spelled the way the reference table spells it.
  const selectedRelationship =
    relationshipOptions.find(
      (o) => o.code && draft.relationCode && o.code === draft.relationCode,
    )?.code ?? draft.relationCode;
  // An edited beneficiary may carry a relationship the option list lacks;
  // keep it selectable instead of silently blanking the dropdown.
  const relationships =
    selectedRelationship &&
    !relationshipOptions.some((o) => o.label === selectedRelationship)
      ? [...relationshipOptions, { label: selectedRelationship }]
      : relationshipOptions;
  const relationshipHelper = relationshipOverride
    ? undefined
    : relationshipQuery.isPending
      ? "Loading relationships…"
      : undefined;
  const relationshipLoadError =
    !relationshipOverride && relationshipQuery.isError
      ? "Could not load relationships. Please refresh the page."
      : undefined;

  // `ModalForm` renders its backdrop and positioner in place, without a
  // portal. Inside the plan cards that puts them under an ancestor that
  // clips or transforms, which pins `position: fixed` to the card instead of
  // the viewport — the modal lands off-centre and jumps as the card animates.
  // Portalling the whole dialog to <body> gives it the viewport back.
  //
  // The wrapper patches the kit's small-screen layout, which `ModalForm` takes
  // no props for. Below `md` it goes full-screen, which zeroes the margins
  // that centre it on larger screens, but leaves the positioner at
  // `align-items: center` — so a form taller than the screen overflows both
  // edges, and the top half is past where the positioner can scroll. It also
  // sets `min-height: 100vh`, which on phones is taller than what is visible
  // under the browser's toolbars; `100dvh` is what is actually on screen.
  //
  // The dialog is also capped at 90vh (the full screen below `md`) with the
  // header fixed and the body scrolling. The kit wraps the body in a bare
  // <form>, so that has to pass the flex column down for the body to shrink.
  //
  // The kit renders the footer inside the scrolling body, so it is pinned with
  // `sticky` rather than moved out. It is pulled out over the body's side
  // padding so its background spans the dialog, and takes over the body's
  // bottom padding so nothing scrolls past underneath it. Its top border
  // replaces the kit's separator above it, which would scroll away.
  //
  // The kit's own close trigger is an empty, invisible button, so the header is
  // passed in with a visible one and the kit's is hidden.
  const title = isEdit ? "Edit Beneficiary" : "Add Beneficiary";
  const description = isEdit
    ? "Update the beneficiary's details."
    : "Enter the details of the new beneficiary.";
  return (
    <Portal>
      <Box
        display="contents"
        css={{
          "& .chakra-dialog__positioner": {
            alignItems: { base: "flex-start", md: "center" },
          },
          "& .chakra-dialog__content": {
            minH: { base: "100dvh", md: "auto" },
            maxH: { base: "100dvh", md: "90vh" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
          "& .chakra-dialog__closeTrigger:empty": {
            display: "none",
          },
          "& .chakra-dialog__content > form": {
            display: "flex",
            flexDirection: "column",
            flex: "1",
            minH: 0,
          },
          "& .chakra-dialog__body": {
            flex: "1",
            minH: 0,
            overflowY: "auto",
            pb: 0,
          },
          "& .chakra-dialog__body > .chakra-separator:has(+ .chakra-dialog__footer)":
            {
              display: "none",
            },
          "& .chakra-dialog__footer": {
            position: "sticky",
            bottom: 0,
            zIndex: 1,
            mx: -6,
            px: 12,
            py: 4,
            bg: "surfaceRaised",
            borderTopWidth: "1px",
          },
        }}
      >
        <ModalForm
          open={open}
          onOpenChange={(details) => {
            if (details.open) onOpenChange(true);
            else requestClose();
          }}
          header={
            <Dialog.Header>
              <Flex align="flex-start" gap={2} w="full">
                <Box flex="1">
                  <Dialog.Title>{title}</Dialog.Title>
                  <Dialog.Description>{description}</Dialog.Description>
                </Box>
                <Dialog.CloseTrigger asChild position="static">
                  <CloseButton size="sm" disabled={saving} />
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
          }
          onSubmit={() => void handleSubmit()}
          // See `handleSubmit`: the kit's own confirmation never appears.
          confirmation={false}
          footer={
            <Flex gap={2} justify="flex-end" w="full">
              <CancelButton
                type="button"
                onClick={requestClose}
                disabled={saving}
              />
              <SaveButton
                type="submit"
                onClick={handleSubmitClick}
                loading={saving}
              />
            </Flex>
          }
        >
          {saveError && (
            <Alert.Root status="error" mb={4} gridColumn="span 2">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  {isEdit
                    ? "The changes were not saved."
                    : "The beneficiary was not added."}
                </Alert.Title>
                <Alert.Description>{saveError}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <ModalFormSection title="Personal Information">
            <ModalFormField>
              <FloatingLabelInput
                label="Last Name"
                {...UPPERCASE}
                maxLength={NAME_MAX_LENGTH}
                value={draft.lastName}
                onValueChange={(v) => setField("lastName", v)}
                errorText={errors.lastName}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="First Name"
                {...UPPERCASE}
                maxLength={NAME_MAX_LENGTH}
                value={draft.firstName}
                onValueChange={(v) => setField("firstName", v)}
                errorText={errors.firstName}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="Middle Name"
                {...UPPERCASE}
                maxLength={NAME_MAX_LENGTH}
                value={draft.middleName}
                onValueChange={(v) => setField("middleName", v)}
                errorText={errors.middleName}
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelSelect
                label="Suffix"
                value={draft.suffix}
                onValueChange={(v) => setField("suffix", v)}
              >
                {/* Optional, so blank is a real choice, not a placeholder. */}
                <option value="" />
                {/* Keep a saved suffix the list doesn't know about. */}
                {[
                  ...SUFFIXES,
                  ...(draft.suffix && !SUFFIXES.includes(draft.suffix)
                    ? [draft.suffix]
                    : []),
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </FloatingLabelSelect>
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="Date of Birth"
                type="date"
                min={MIN_BIRTH_DATE}
                max={today()}
                value={draft.dateOfBirth}
                onValueChange={(v) => setField("dateOfBirth", v)}
                errorText={errors.dateOfBirth}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelSelect
                label="Gender at Birth"
                value={draft.gender}
                onValueChange={(v) => setField("gender", v)}
                errorText={errors.gender}
                required
              >
                <option value="" disabled hidden />
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </FloatingLabelSelect>
            </ModalFormField>
            <ModalFormField fullWidth>
              <FloatingLabelSelect
                label="Relationship"
                value={selectedRelationship ?? undefined}
                onValueChange={selectRelationship}
                helperText={relationshipHelper}
                errorText={errors.relationship ?? relationshipLoadError}
                required
              >
                <option value="" disabled hidden />
                {/* Neither field is unique alone: an option kept from a saved
                    beneficiary has no code, and the API may label two codes
                    alike. */}
                {relationships.map((r) => (
                  <option key={`${r.code ?? ""}:${r.label}`} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </FloatingLabelSelect>
            </ModalFormField>
          </ModalFormSection>

          <ModalFormSeparator />

          <ModalFormSection title="Address">
            <ModalFormField fullWidth>
              <Switch.Root
                checked={draft.sameAsPlanholderAddress}
                onCheckedChange={(e) => toggleSameAddress(e.checked)}
                disabled={!planholderAddress}
                colorPalette="green"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>
                  <Text fontSize="sm">Same as planholder address</Text>
                </Switch.Label>
              </Switch.Root>
              {!planholderAddress && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  The planholder has no address on record to copy.
                </Text>
              )}
              {lookingUp ? (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Looking up this person&apos;s address…
                </Text>
              ) : (
                addressFromLookup && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Filled in from this person&apos;s existing record.
                  </Text>
                )
              )}
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelSelect
                label="Address Type"
                value={draft.address.addressType}
                onValueChange={(v) => setAddressField("addressType", v)}
                errorText={errors["address.addressType"]}
                required
              >
                <option value="" disabled hidden />
                {/* Keep a copied type the kit's list doesn't know about. */}
                {[
                  ...ADDRESS_TYPE_OPTIONS,
                  ...(draft.address.addressType &&
                  !ADDRESS_TYPE_OPTIONS.includes(draft.address.addressType)
                    ? [draft.address.addressType]
                    : []),
                ].map((t) => (
                  <option key={t} value={t} disabled={addressLocked}>
                    {t}
                  </option>
                ))}
              </FloatingLabelSelect>
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="House / Unit No."
                {...UPPERCASE}
                value={draft.address.addNo}
                onValueChange={(v) => setAddressField("addNo", v)}
                errorText={errors["address.addNo"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="Street"
                {...UPPERCASE}
                value={draft.address.street}
                onValueChange={(v) => setAddressField("street", v)}
                errorText={errors["address.street"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>

            <ModalFormField>
              <FloatingLabelInput
                label="Province"
                {...UPPERCASE}
                value={draft.address.province}
                onValueChange={(v) => setAddressField("province", v)}
                errorText={errors["address.province"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="City / Municipality"
                {...UPPERCASE}
                value={draft.address.city}
                onValueChange={(v) => setAddressField("city", v)}
                errorText={errors["address.city"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="District"
                {...UPPERCASE}
                value={draft.address.district}
                onValueChange={(v) => setAddressField("district", v)}
                errorText={errors["address.district"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="Barangay"
                {...UPPERCASE}
                value={draft.address.barangay}
                onValueChange={(v) => setAddressField("barangay", v)}
                errorText={errors["address.barangay"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
            <ModalFormField>
              <FloatingLabelInput
                label="ZIP Code"
                inputMode="numeric"
                maxLength={ZIP_CODE_LENGTH}
                value={draft.address.zipCode}
                onValueChange={(v) =>
                  setAddressField("zipCode", v.replace(/\D/g, ""))
                }
                errorText={errors["address.zipCode"]}
                readOnly={addressLocked}
                required
              />
            </ModalFormField>
          </ModalFormSection>
        </ModalForm>
      </Box>
    </Portal>
  );
}
