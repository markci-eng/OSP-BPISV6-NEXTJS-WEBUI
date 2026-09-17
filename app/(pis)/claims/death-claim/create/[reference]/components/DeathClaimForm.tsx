"use client";

import { Controller, useForm, type Control } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Box, Field, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import {
  LuBanknote,
  LuHandCoins,
  LuHandHeart,
  LuShieldAlert,
} from "react-icons/lu";
import { toast } from "sonner";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { FloatingLabelInput, FloatingLabelSelect } from "osp-ui-kit";
import type { ClaimPhase, DeathBenefit } from "@/app/(pis)/data";
import {
  createDeathClaim,
  CREATED_CLAIM_STATUS,
  SELECTABLE_CLAIM_STATUSES,
} from "@/app/(pis)/claims/claim-store";
import type { Planholder } from "@/app/(pis)/claims/claims-data";
import type {
  DeathClaim,
  DeathClaimType,
} from "@/app/(pis)/claims/death-claim/death-claims-data";
import { FloatingLabelDate } from "@/app/(pis)/claims/components/floating-fields";
import { SectionTitle } from "@/app/(pis)/claims/components/section-title";

/* ------------------------------ helpers ------------------------------ */

/** `1 day`, `2 days` — a count with its unit, singular when it is one. */
function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/**
 * Age at death, to the day — "42 years 10 months 2 days".
 *
 * Years alone is not enough here. Contestability and the benefit both turn on
 * how long the plan ran against a life, and a claim filed weeks either side of
 * a birthday is the case where that matters — rounding it to a year is
 * throwing away the part being checked.
 *
 * Every part is shown even at zero, so the field reads the same length and in
 * the same shape whatever the dates are; a value that drops a unit reads as a
 * different KIND of answer rather than as the same answer with a zero in it.
 *
 * The arithmetic is `formatAgeOfDeath`'s in the data layer, which renders the
 * same three parts abbreviated ("30 yrs 9 mos 6 days") for the tighter spaces
 * on the claim cards. Same calculation, spelled out for a form field.
 */
function formatAgeAtDeath(birth: Date, death: Date): string {
  let years = death.getFullYear() - birth.getFullYear();
  let months = death.getMonth() - birth.getMonth();
  let days = death.getDate() - birth.getDate();

  if (days < 0) {
    // Borrow from the month before the death date, whose length is what the
    // remaining days are counted against.
    const previousMonth = new Date(death.getFullYear(), death.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return `${plural(years, "year")} ${plural(months, "month")} ${plural(days, "day")}`;
}

function formatPeso(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

/**
 * Today as `yyyy-mm-dd` in the processor's own timezone — the date input's
 * format. Built from the local parts rather than `toISOString()`, which would
 * hand back the UTC day and read as "yesterday" for a Manila morning.
 */
function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * How the claim was filed, and what the processor may change it to. The system
 * reads the nature off the request number, but that is only a suggestion —
 * processors re-classify claims, so the field stays editable.
 */
const NATURES: { value: DeathClaimType; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "special", label: "Special" },
];

/**
 * The selectable benefits, keyed by the benefit CODE the data layer stores
 * (`DeathBenefit`) so the selection maps straight onto the claim header.
 */
const BENEFITS: {
  value: DeathBenefit;
  label: string;
  icon: typeof LuBanknote;
}[] = [
  { value: "CAB", label: "Cash Assistance Benefit", icon: LuBanknote },
  { value: "ADB", label: "Accidental Death Benefit", icon: LuShieldAlert },
  {
    value: "ECAB",
    label: "Extended Cash Assistance Benefit",
    icon: LuHandCoins,
  },
  { value: "USB", label: "Unrendered Service Benefit", icon: LuHandHeart },
];

/**
 * What kind of unrendered service is being claimed — the nature code the source
 * system files a USB claim under.
 *
 * Only USB claims carry one, which is why this is not the form's `nature` field
 * (Regular/Special, RC/SC): that one says how the claim was classified and
 * every claim has it. These say what the plan holder's service was to have
 * been, and the code is what the system stores.
 *
 * The code is kept in the label as well as the value. Processors work from
 * paperwork that names the code, not the description, so a list of descriptions
 * alone would make them translate in their heads.
 */
const USB_TYPES: { value: string; label: string }[] = [
  { value: "CP", label: "CP - Cremation" },
  { value: "NA", label: "NA - Not Applicable" },
  { value: "OP", label: "OP - One Paid-up Plan" },
  { value: "RP", label: "RP - ROP" },
  { value: "SP", label: "SP - 70% of Pre-Need" },
  { value: "TC", label: "TC - USB - Continue" },
  { value: "TT", label: "TT - Traditional" },
  { value: "TV", label: "TV - Termination Value" },
];

interface FormValues {
  dateReceived: string;
  dateOfDeath: string;
  causeOfDeath: string;
  nature: DeathClaimType;
  claimStatus: ClaimPhase;
  benefit: DeathBenefit;
  /** USB only — see {@link USB_TYPES}. Opens on "NA" (Not Applicable). */
  usbType: string;
  payeeFirstName: string;
  payeeMiddleName: string;
  payeeLastName: string;
  payeeSuffix: string;
  payeeLotBldgUnit: string;
  payeeStreet: string;
  payeeBarangay: string;
  payeeDistrict: string;
  payeeCity: string;
  payeeProvince: string;
  payeeZipCode: string;
  planValue: number | string;
  percentRate: number | string;
  processingFee: number | string;
  others: number | string;
}

/* ------------------------------ field wrappers ------------------------------ */

/** react-hook-form-bound floating-label text/number input. */
function TextField({
  control,
  name,
  label,
  type = "text",
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
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
            value={
              field.value === undefined || field.value === null
                ? ""
                : String(field.value)
            }
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </Field.Root>
  );
}

/**
 * A field the processor cannot set — it is derived from the claim request or
 * the plan, so it is shown for context only. Contestability falls in here: it
 * follows from the plan's effectivity, not from anything on this form.
 */
function DerivedField({ label, value }: { label: string; value: string }) {
  return (
    <Field.Root>
      <FloatingLabelInput label={label} value={value} readOnly />
    </Field.Root>
  );
}

/**
 * react-hook-form-bound floating-label select.
 *
 * `helperText` is how a field says the value in it is only a suggestion — the
 * nature of claim uses it to make clear the processor may override what the
 * system worked out.
 *
 * The blank choice is taken off every select on this form. The kit prepends one
 * of its own, for a field that opens with nothing chosen; none of these do —
 * the nature and the status are computed from the request, and the USB type
 * opens on NA — so the blank is only a way to un-answer a question that always
 * has an answer. CSS rather than a prop, because the option is hardcoded inside
 * the component. The kit's mobile sheet already leaves empty-valued options
 * out, so this brings the native dropdown into line with it.
 */
function SelectField<T extends string>({
  control,
  name,
  label,
  options,
  helperText,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  options: { value: T; label: string }[];
  helperText?: string;
}) {
  return (
    <Field.Root css={{ "& option[value='']": { display: "none" } }}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FloatingLabelSelect
            label={label}
            helperText={helperText}
            value={field.value === undefined ? "" : String(field.value)}
            onValueChange={field.onChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FloatingLabelSelect>
        )}
      />
    </Field.Root>
  );
}

/** react-hook-form-bound floating-label date input. */
function DateField({
  control,
  name,
  label,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
}) {
  return (
    <Field.Root>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FloatingLabelDate
            label={label}
            value={field.value ? String(field.value) : ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </Field.Root>
  );
}

/**
 * A titled form section — plain stacked block, no card chrome. The heading is
 * the claims area's own {@link SectionTitle}, so the form's sections read the
 * same as the sections on the claims dashboards rather than carrying their own
 * typography.
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

/* ------------------------------ form ------------------------------ */

export function DeathClaimForm({
  claim,
  planholder,
}: {
  claim: DeathClaim;
  planholder: Planholder;
}) {
  const router = useRouter();

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      // Auto-filled from our data.
      dateOfDeath: claim.dateOfDeath.slice(0, 10),
      causeOfDeath: claim.typeOfIncident,
      planValue: planholder.planDetail.contractPrice,
      // The benefit the branch filed for, encoded in the request number. Shown
      // and submitted, never chosen here — see the Benefit section.
      benefit: claim.benefits,
      // Computed from the request, and left editable because a claim does get
      // re-classified.
      nature: claim.type,
      // Where a claim starts, not where it ends — see CREATED_CLAIM_STATUS.
      claimStatus: CREATED_CLAIM_STATUS,
      // The paperwork is logged the day it lands on the desk, so today is
      // nearly always right — but a backdated receipt can still be typed in.
      dateReceived: todayISO(),
      // "Not Applicable" is the common case and a real answer in its own
      // right, so the field opens on it rather than blank — the processor
      // changes it only when the plan actually names a service.
      usbType: "NA",
      payeeFirstName: "",
      payeeMiddleName: "",
      payeeLastName: "",
      payeeSuffix: "",
      payeeLotBldgUnit: "",
      payeeStreet: "",
      payeeBarangay: "",
      payeeDistrict: "",
      payeeCity: "",
      payeeProvince: "",
      payeeZipCode: "",
      percentRate: "",
      processingFee: "",
      others: "",
    },
  });

  // Read-only header details — all three come off the filing, so none of them
  // are the processor's to change here. Date filed is the branch's own record
  // of when the claim was lodged.
  const requestingBranch = claim.requestingBranch;
  const branchManager = claim.processor.name;
  // `yyyy-mm-dd`, which is what a date input takes — the seed carries a full
  // timestamp for some requests and a bare date for others, so the time is
  // trimmed rather than assumed absent. The BROWSER decides how it is then
  // displayed, which is exactly why this is the same as the two fields beside
  // it instead of a format of its own.
  const dateFiled = claim.filedAt.slice(0, 10);

  // Derived, not editable — contestability follows from the plan's effectivity,
  // not from anything typed on this form.
  const contestabilityLabel =
    planholder.contestability === "within" ? "Within" : "Over";

  // The statuses this form may assign, as select options (see the store: the
  // supervisor's verdicts are not among them).
  const statusOptions = SELECTABLE_CLAIM_STATUSES.map((status) => ({
    value: status,
    label: status,
  }));

  // Age at death — recomputed live from date of death vs. the plan holder's
  // DOB. The date is read while it is being typed, so a half-finished one is
  // normal and has to leave the field blank rather than show "NaN years".
  const dateOfDeath = watch("dateOfDeath");
  const ageAtDeath = (() => {
    if (!planholder.dateOfBirth || !dateOfDeath) return "";
    const death = new Date(dateOfDeath);
    if (Number.isNaN(death.getTime())) return "";
    return formatAgeAtDeath(planholder.dateOfBirth, death);
  })();

  // Live claim computation.
  const planValue = Number(watch("planValue")) || 0;
  const percentRate = Number(watch("percentRate")) || 0;
  const processingFee = Number(watch("processingFee")) || 0;
  const others = Number(watch("others")) || 0;
  const gross = (planValue * percentRate) / 100;
  const netProceeds = gross - processingFee - others;

  const benefit = watch("benefit");

  const onSubmit = (values: FormValues) => {
    // Open the claim header against this request. There is no backend yet, so
    // the write goes to the claims-local store — which is what takes the
    // request off the processor's queue and gives the claim its claim no.
    const created = createDeathClaim({
      requestNo: claim.reference,
      lpaNo: claim.lpaNo,
      requestingBranchCode: claim.requestingBranchCode,
      benefits: values.benefit,
      dateReceivedISO: values.dateReceived,
      dateOfDeathISO: values.dateOfDeath,
      causeOfDeath: values.causeOfDeath,
      natureCode: values.nature === "special" ? "SC" : "RC",
      // Only USB is classified this way — see the payee note below, which is
      // carried for the same reason.
      usbType: values.benefit === "USB" ? values.usbType : undefined,
      statusLabel: values.claimStatus,
      contestability: planholder.contestability,
      processor: branchManager,
      computation: {
        planValue,
        percentRate,
        gross,
        processingFee,
        others,
        netProceeds,
      },
      // Only USB claims name their payee here; the rest add one during
      // processing, on the plan holder's page.
      payee:
        values.benefit === "USB"
          ? {
              firstName: values.payeeFirstName,
              middleName: values.payeeMiddleName,
              lastName: values.payeeLastName,
              suffix: values.payeeSuffix,
              lotBldgUnit: values.payeeLotBldgUnit,
              street: values.payeeStreet,
              barangay: values.payeeBarangay,
              district: values.payeeDistrict,
              city: values.payeeCity,
              province: values.payeeProvince,
              zipCode: values.payeeZipCode,
            }
          : undefined,
    });

    toast.success("Claim created", {
      // The status is the processor's choice now, so say which one it landed in
      // rather than assuming it was endorsed.
      description: `${created.claimNo} is now ${created.statusLabel}.`,
    });
    // Continue on the plan holder's page, where the claim gets processed.
    router.push(`/claims/planholder/${encodeURIComponent(claim.lpaNo)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap={6}>
        {/* The heading names the whole filing, so what follows reads as the form
            it introduces — the subtitle is what tells the processor there is
            something to fill in below.

            Claim details, benefit and computation are one filing, so they are
            one run of the page. The headings inside carry the structure; the
            first group has no heading of its own — this one is it. */}
        <Box>
          <SectionTitle
            title="Claim Details"
            subtitle="Fill in the details below to open this claim."
          />
          {/* The form's own surface — and only up to `xl`. A phone reads a
              form as a sheet of its own, lifted off the page: that is the card
              this has always been in, and these are the shell card's own values
              (`Card.Root` — `bg`, an `sm` shadow, a `2xl` radius falling to
              `md`, 3/4 padding), kept so the mobile form is unchanged.

              On a desktop the card is what the PLAN HOLDER now sits in, one
              column over, and a card beside a card reads as two panels of equal
              weight — when one of them is the whole point of the page and the
              other is who it is about. So from `xl` the form drops its edge and
              is simply the page's main content, and the only card in view is
              the summary it is being filled in against. */}
          <Box
            bg={{ base: "bg", xl: "transparent" }}
            p={{ base: 3, md: 4, xl: 0 }}
            borderRadius={{ base: "2xl", md: "md", xl: 0 }}
            boxShadow={{ base: "sm", xl: "none" }}
          >
            <Flex direction="column" gap={7}>
              {/* ── Claim Details ── */}
              <Flex direction="column" gap={5}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                  <Field.Root>
                    <FloatingLabelInput
                      label="Requesting Branch"
                      value={requestingBranch}
                      readOnly
                    />
                  </Field.Root>
                  <Field.Root>
                    <FloatingLabelInput
                      label="Branch Manager"
                      value={branchManager}
                      readOnly
                    />
                  </Field.Root>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                  {/* Date filed is the branch's record of the lodgement —
                      read-only. Date received defaults to today; only a
                      backdated receipt needs changing.

                      The same date CONTROL as the two beside it, rather than a
                      text field spelling the date out. Three dates in a row
                      written two different ways read as two different kinds of
                      fact; they are the same kind, and only one of them happens
                      not to be editable. */}
                  <Field.Root>
                    <FloatingLabelDate
                      label="Date Filed"
                      value={dateFiled}
                      readOnly
                    />
                  </Field.Root>
                  <DateField
                    control={control}
                    name="dateReceived"
                    label="Date Received"
                  />
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                  <DateField
                    control={control}
                    name="dateOfDeath"
                    label="Date of Death"
                  />
                  <Field.Root>
                    <FloatingLabelInput
                      label="Age at Death"
                      value={ageAtDeath}
                      readOnly
                    />
                  </Field.Root>
                </SimpleGrid>

                <DerivedField
                  label="Contestability"
                  value={contestabilityLabel}
                />

                {/* Both of these open pre-filled with what the system worked out, and
            both stay editable: the nature gets re-classified often enough,
            and a claim is not always endorsed the moment it is opened. */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                  <SelectField
                    control={control}
                    name="nature"
                    label="Nature of Claim"
                    options={NATURES}
                  />
                  <SelectField
                    control={control}
                    name="claimStatus"
                    label="Claim Status"
                    options={statusOptions}
                  />
                </SimpleGrid>

                <TextField
                  control={control}
                  name="causeOfDeath"
                  label="Cause of Death"
                />
              </Flex>

              {/* ── Benefit ── */}
              <Section
                title="Benefit"
                subtitle="Filed on the claim request. Not editable here."
              >
                {/* Read-only. The benefit is decided when the branch files the
                    request — it is encoded in the request number — and the
                    processor opening the header does not get to re-decide it.

                    Still all four, rather than the one: the row is what says
                    WHICH of the four this claim is, and a lone card would leave
                    a reader to remember the other three to know that. The three
                    that were not filed are dimmed rather than dropped.

                    A `<ul>`, because that is what this now is — a list of the
                    benefits with one marked, not a set of controls. Nothing in
                    it is focusable or clickable, so a keyboard tabs straight
                    past it to the first field that is actually the processor's
                    to fill. */}
                <SimpleGrid as="ul" columns={4} gap={{ base: 2, md: 3 }}>
                  {BENEFITS.map((b) => {
                    const isSelected = benefit === b.value;
                    const BenefitIcon = b.icon;
                    return (
                      <Box
                        as="li"
                        key={b.value}
                        listStyleType="none"
                        // Says "this is the one" to a screen reader, which
                        // otherwise gets four benefits and no indication of
                        // which the claim was filed for — the colour is the
                        // only thing carrying it.
                        aria-current={isSelected ? "true" : undefined}
                        borderWidth="1px"
                        borderRadius="xl"
                        p={{ base: 2, md: 4 }}
                        minH={{ base: "96px", md: "116px" }}
                        textAlign="center"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        bg={isSelected ? "#f4faf6" : "white"}
                        borderColor={
                          isSelected ? BRAND_COLORS.primaryGreen : "gray.200"
                        }
                        // One even 1px edge, selected or not. The green ring
                        // that sat under the green border here drew as 2px, so
                        // the chosen benefit was a pixel wider on every side
                        // than the three beside it. The wash, the colour and
                        // the opacity below already say which one is picked.
                        // Matches the tile tabs this grid is built to mirror.
                        boxShadow="none"
                        // The unfiled three step back rather than disappear.
                        // They were already the pale version of the card; what
                        // they lose now is the shadow that made them look
                        // liftable and pressable.
                        opacity={isSelected ? 1 : 0.55}
                      >
                        <Box
                          color={
                            isSelected ? BRAND_COLORS.primaryGreen : "gray.500"
                          }
                          fontSize={{ base: "lg", md: "2xl" }}
                        >
                          <BenefitIcon />
                        </Box>
                        <Text
                          fontSize={{ base: "sm", md: "md" }}
                          fontWeight="800"
                          lineHeight="1"
                          color={
                            isSelected ? BRAND_COLORS.primaryGreen : "gray.800"
                          }
                        >
                          {b.value}
                        </Text>
                        <Text
                          fontSize={{ base: "10px", md: "xs" }}
                          color="gray.500"
                          lineHeight="short"
                        >
                          {b.label}
                        </Text>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {benefit === "USB" && (
                  <Box
                    borderWidth="1px"
                    borderColor={BRAND_COLORS.primaryGreen}
                    borderRadius="lg"
                    bg="#f9fdfb"
                    px={{ base: 4, md: 5 }}
                    py={4}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color={BRAND_COLORS.darkGreen}
                    >
                      Payee Details
                    </Text>
                    <Text fontSize="xs" color="gray.500" mb={4}>
                      Required for Unrendered Service Benefit (USB).
                    </Text>

                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.500"
                      mb={2}
                    >
                      Payee Name
                    </Text>
                    {/* Two columns, deliberately — NOT the one-row block the
                        Add Payee sheet carries. This column is the narrow half
                        of a two-column page from `xl`, so four fields across it
                        are four cramped fields; paired, each is the width of a
                        name. The sheet is the width of the screen and can
                        afford the row. */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                      <TextField
                        control={control}
                        name="payeeLastName"
                        label="Last Name"
                      />
                      <TextField
                        control={control}
                        name="payeeFirstName"
                        label="First Name"
                      />
                      <TextField
                        control={control}
                        name="payeeMiddleName"
                        label="Middle Name"
                      />
                      <TextField
                        control={control}
                        name="payeeSuffix"
                        label="Suffix"
                      />
                    </SimpleGrid>

                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.500"
                      mt={5}
                      mb={2}
                    >
                      Address
                    </Text>
                    {/* Seven fields, one under the other on a phone. On a
                        desktop that is a column of full-width boxes for
                        an address whose parts are each a word long — so
                        they pair up from `lg`, which is where there is
                        width for two of them to be worth reading. */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
                      <TextField
                        control={control}
                        name="payeeLotBldgUnit"
                        label="Lot/Bldg/Unit No."
                      />
                      <TextField
                        control={control}
                        name="payeeStreet"
                        label="Street"
                      />
                      <TextField
                        control={control}
                        name="payeeBarangay"
                        label="Barangay"
                      />
                      <TextField
                        control={control}
                        name="payeeDistrict"
                        label="District"
                      />
                      <TextField
                        control={control}
                        name="payeeCity"
                        label="City"
                      />
                      <TextField
                        control={control}
                        name="payeeProvince"
                        label="Province"
                      />
                      <TextField
                        control={control}
                        name="payeeZipCode"
                        label="Zip Code"
                      />
                    </SimpleGrid>

                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.500"
                      mt={5}
                      mb={2}
                    >
                      USB Type
                    </Text>
                    {/* One field, so no grid — full width, the same as every
                        other lone field on this form. */}
                    <SelectField
                      control={control}
                      name="usbType"
                      label="USB Type"
                      options={USB_TYPES}
                    />
                  </Box>
                )}
              </Section>

              {/* ── Claim Computation ── */}
              <Section title="Claim Computation">
                <TextField
                  control={control}
                  name="planValue"
                  label="Plan Value"
                  type="number"
                />
                <TextField
                  control={control}
                  name="percentRate"
                  label="Percent Rate"
                  type="number"
                />
                <Field.Root>
                  <FloatingLabelInput
                    label="Gross (computed)"
                    value={formatPeso(gross)}
                    readOnly
                  />
                </Field.Root>
                <TextField
                  control={control}
                  name="processingFee"
                  label="Less: Processing Fee"
                  type="number"
                />
                <TextField
                  control={control}
                  name="others"
                  label="Others"
                  type="number"
                />
                <Field.Root>
                  <FloatingLabelInput
                    label="Net Proceeds (computed)"
                    value={formatPeso(netProceeds)}
                    readOnly
                    fontWeight="600"
                  />
                </Field.Root>
              </Section>
            </Flex>
          </Box>
        </Box>

        {/* ── Footer ── */}
        {/* Bottom padding on mobile keeps the buttons clear of the floating
            "Planholder Details" pill (fixed at bottom 88px). */}
        <Flex
          // Ends of the row, at every width: leaving and filing are opposite
          // decisions and the space between them says so. It reads on a desktop
          // now that the form is a column of its own rather than the full width
          // of the page — Cancel under the first field, Submit under the last.
          justify="space-between"
          align="center"
          gap={3}
          pt={1}
          pb={{ base: "64px", md: 0 }}
        >
          {/* The standard form buttons — same pair `FormFooterActions` uses, so
              this footer carries no styling of its own. `type="submit"` keeps
              react-hook-form's `handleSubmit` in charge of the submission. */}
          <SecondaryMdButton type="button" onClick={() => router.back()}>
            Cancel
          </SecondaryMdButton>

          {/* Submit steps up a size on a desktop — the one button on this page
              that opens a claim, at the end of a long form, with the width to
              carry it. These are the `lg` button's own measurements (44px tall,
              24px of side padding, `md` type) rather than invented ones; they
              are applied as CSS because the shared buttons lock their size into
              the component — `PrimaryLgButton` is a different import, and one
              import cannot be two sizes at two widths. The phone keeps the `md`
              button it was designed with. */}
          <Box
            css={{
              "& > button": {
                lg: {
                  height: "44px",
                  paddingInline: "24px",
                  fontSize: "md",
                },
              },
            }}
          >
            <PrimaryMdButton type="submit">Submit</PrimaryMdButton>
          </Box>
        </Flex>
      </Flex>
    </form>
  );
}

export default DeathClaimForm;
