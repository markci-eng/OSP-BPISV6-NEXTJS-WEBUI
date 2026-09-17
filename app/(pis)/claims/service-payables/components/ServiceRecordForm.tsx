"use client";

// The service record itself — the old screen's "Claims Info" block, and the
// button that commits it.
//
// This is the point of the whole module. Everything before it picks WHICH
// service is being processed; this is where the processor states what the chapel
// is owed for it and files the record.
//
// WHAT SAVING DOES, which is two things and reads as one:
//
//   1. it saves the record, and
//   2. when the chapel's billing already has a number, it terminates the plan
//      into that billing.
//
// The second is not a separate button because it is not a separate decision —
// "Save Service Record" is what the old screen called this, and committing the
// record IS what puts the plan's termination through. It is conditional only
// because a terminated plan has to be posted against a billing number, and a
// billing that has not been created yet has none. When that is the case the
// footer says so, in place of the line that would have said the plan was
// terminated.
//
// The three fields that are NOT the processor's — the LPA number, the plan and
// the chapel — are not on this form at all. They identify the record and are
// shown above it, on the plan holder block and the billing line.

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { Box, chakra, Checkbox, Field, Flex, SimpleGrid } from "@chakra-ui/react";
import { FloatingLabelInput, FloatingLabelSelect } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { db } from "../../../data";
import { FloatingLabelDate } from "../../components/floating-fields";
import { SectionTitle } from "../../components/section-title";
import {
  CREDIT_OF_SERVICE_OPTIONS,
  CSP_CODES,
  NATURE_OF_SERVICE,
  SERVICE_RECORD_DEFAULTS,
  SERVICE_RECORD_STATUSES,
  WREATH_AMOUNTS,
  cspAmountFor,
  defaultMortCodeFor,
  getBillingMortCode,
  getMortuary,
  getMortuaryOptions,
  labelFor,
  type CodedOption,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";
import {
  getServiceDeficiencies,
  useServiceDocumentsStore,
} from "../service-documents-store";
import type { ServiceRecordDetails } from "../service-payables-store";
import { getSavedServiceRecord } from "../service-payables-store";

/**
 * The form element's id, and the handle the Terminate button holds it by.
 *
 * A constant rather than a `useId`, because it has to be known by a component
 * that is not this one's child. Safe as a constant: exactly one service record
 * is open at a time, so there is never a second form to collide with.
 */
export const SERVICE_RECORD_FORM_ID = "service-record-form";

/** A real `<form>` that takes style props — see the note where it is rendered. */
const Form = chakra("form");

interface FormValues {
  status: string;
  dateFiled: string;
  dateOfDeath: string;
  requestingBranchCode: string;
  branchManager: string;
  deceasedLastName: string;
  deceasedFirstName: string;
  mortuaryCode: string;
  cspCode: string;
  cspAmount: string;
  natureOfService: string;
  withWreath: string;
  creditOfService: string;
  doubleUsed: boolean;
}

/* ------------------------------ field wrappers ------------------------------ */
//
// EVERY ONE OF THEM TAKES `readOnly`, and it is one flag from one place: the
// plan has been terminated, so this record is history rather than a form. See
// {@link ServiceRecordFormProps.locked}.
//
// READ-ONLY AND NOT DISABLED, which is the shape of the whole treatment. A
// disabled field is greyed to unreadable, drops out of the tab order and cannot
// have its text selected — and the one thing anyone does with a terminated
// record is READ it, and copy a figure off it. So the fields keep their values,
// their labels and their place in the tab order; what they lose is the ability
// to take a new value.

/** How a field that cannot be typed into is drawn — `CreateBillingDialog`'s. */
const READ_ONLY_FIELD = {
  bg: "gray.50",
  color: "gray.600",
  cursor: "default",
  _hover: { bg: "gray.50" },
  _focusVisible: { borderColor: "gray.200", boxShadow: "none" },
} as const;

function TextField({
  control,
  name,
  label,
  type = "text",
  readOnly = false,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  type?: string;
  readOnly?: boolean;
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
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            readOnly={readOnly}
            {...(readOnly ? READ_ONLY_FIELD : {})}
          />
        )}
      />
    </Field.Root>
  );
}

/**
 * A bound select over one of the module's coded lists.
 *
 * The blank option the kit prepends is hidden, the same way `DeathClaimForm`
 * hides it and for the same reason: every field here opens on an answer, so a
 * blank is only a way to un-answer a question that always has one.
 *
 * READ-ONLY IT IS NOT A SELECT AT ALL, it is the chosen option's LABEL in a
 * read-only input. `FloatingLabelSelect` has no `readOnly` and a `disabled` one
 * would be unreadable; more to the point, a dropdown that cannot be opened is
 * still drawn as a thing to open. What a locked record should show is the answer
 * — "SC - ST. CLAIRE" and not "SC", which is the label the picker was showing
 * anyway.
 */
function SelectField({
  control,
  name,
  label,
  options,
  readOnly = false,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  options: CodedOption[];
  readOnly?: boolean;
}) {
  return (
    <Field.Root css={{ "& option[value='']": { display: "none" } }}>
      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          readOnly ? (
            <FloatingLabelInput
              label={label}
              value={labelFor(options, String(field.value ?? ""))}
              readOnly
              {...READ_ONLY_FIELD}
            />
          ) : (
            <FloatingLabelSelect
              label={label}
              value={field.value === undefined ? "" : String(field.value)}
              onValueChange={field.onChange}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FloatingLabelSelect>
          )
        }
      />
    </Field.Root>
  );
}

/**
 * A branch as the Requesting Branch dropdown writes it — "NAGA — NAGA CITY".
 *
 * Here rather than inline because the locked field has to read out exactly what
 * the option said, and an option written in two places drifts into two spellings.
 */
function branchLabel(
  branches: { branchCode: string; description: string }[],
  code: string,
): string {
  const branch = branches.find((b) => b.branchCode === code);
  return branch ? `${branch.branchCode} — ${branch.description}` : code;
}

function DateField({
  control,
  name,
  label,
  readOnly = false,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  readOnly?: boolean;
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
            // `readOnly` on a date input is not enough on its own — the
            // browser's picker writes through it. The component takes the
            // calendar button away as well; see `FloatingLabelDate`.
            readOnly={readOnly}
          />
        )}
      />
    </Field.Root>
  );
}

/* ------------------------------ defaults ------------------------------ */

/**
 * What the form opens with: the record if one has been saved, otherwise the
 * facts already on file, with the module's defaults for the rest.
 *
 * Nearly every field has a real source. The date of death, the filing date, the
 * two halves of the deceased's name, the CSP code and the amount all come off the
 * service; the mortuary comes off the billing, because whoever created it
 * already chose one and asking again would be asking the same question twice.
 *
 * THE CODE AND THE AMOUNT ARE THE SAME TWO LOOKUPS the billing was totalled by —
 * the plan names the code, the code and the mortuary name the money — so the
 * form opens on the figure the queue was already showing rather than on a fresh
 * derivation that could disagree with it. Both stay editable: see
 * {@link ServiceRecordForm} for what happens when the processor changes either.
 *
 * Branch Manager is the exception and opens empty. The old screen carried one,
 * and there is no manager on a branch record in this data layer — inventing a
 * name to fill the box would be worse than an empty box a processor types into.
 */
function defaultsFor(
  service: ServiceRecord,
  billing: ServiceBilling,
): FormValues {
  const saved = getSavedServiceRecord(service.id);
  if (saved) {
    return {
      status: saved.status,
      dateFiled: saved.dateFiledISO,
      dateOfDeath: saved.dateOfDeathISO,
      requestingBranchCode: saved.requestingBranchCode,
      branchManager: saved.branchManager,
      deceasedLastName: saved.deceasedLastName,
      deceasedFirstName: saved.deceasedFirstName,
      mortuaryCode: saved.mortuaryCode,
      cspCode: saved.cspCode,
      cspAmount: String(saved.cspAmount),
      natureOfService: saved.natureOfService,
      withWreath: saved.withWreath,
      creditOfService: saved.creditOfService,
      doubleUsed: saved.doubleUsed,
    };
  }

  return {
    status: SERVICE_RECORD_DEFAULTS.status,
    dateFiled: service.filedDateISO,
    dateOfDeath: service.dateOfDeathISO,
    requestingBranchCode: service.servicingBranchCode,
    branchManager: "",
    deceasedLastName: service.deceased.lastName,
    deceasedFirstName: service.deceased.firstName,
    // THE BILLING'S, OR THE ONE ITS AMOUNT WAS PRICED AGAINST. A billing that
    // has not been created yet names no mortuary — and this field used to open
    // blank because of it, which was honest while nothing depended on the
    // answer. The CSP amount now does: the figure beside it is this chapel's
    // likeliest mortuary's rate, and showing that amount over an empty mortuary
    // box would be quoting a price with the contract it came from hidden.
    // Same mortuary the Create Billing dialog opens on, and still the
    // processor's to change.
    mortuaryCode:
      getBillingMortCode(billing.billingCode) ||
      defaultMortCodeFor(service.chapelCode),
    cspCode: service.cspCode,
    cspAmount: String(service.csp),
    natureOfService: SERVICE_RECORD_DEFAULTS.natureOfService,
    withWreath: SERVICE_RECORD_DEFAULTS.withWreath,
    // OFF THE ENDORSEMENT, not off the defaults: the request already carries a
    // credit of service. The constant is the fallback for a service that came in
    // without one — a plan holder keyed in from a franchise's paperwork.
    creditOfService:
      service.creditOfService || SERVICE_RECORD_DEFAULTS.creditOfService,
    doubleUsed: false,
  };
}

/* ------------------------------ the form ------------------------------ */

export interface ServiceRecordFormProps {
  service: ServiceRecord;
  billing: ServiceBilling;
  onSave: (details: ServiceRecordDetails) => void;
  /**
   * The plan has been TERMINATED, so this record is closed: every field reads
   * and none of them takes a new value.
   *
   * WHY IT IS THE WHOLE FORM AND NOT THE FIELDS THAT MATTER. Terminating writes
   * a `TblClaimsSP` row — the line the chapel is actually paid from — and that
   * row is made of what was on this form: the mortuary, the CSP code, the
   * wreath, the credit of service. Leaving the fields editable afterwards offers
   * a processor an edit that goes nowhere: the record would be re-saved and the
   * posted line would not move, so the screen and the billing would disagree
   * and the screen would be the one that looked right.
   *
   * TOLD RATHER THAN DERIVED, though `isPlanTerminated` is one call away. One
   * component decides what a closed record means and every part of the view is
   * locked by the same answer — see `ServiceRecordView`.
   */
  locked?: boolean;
  /**
   * WHICH QUEUE THIS RECORD WAS OPENED FROM, and so what the block is FOR —
   * `ServiceRecordView`'s own prop, passed straight through.
   *
   *   `"terminate"`  For Process, and the default. The record is being MADE:
   *                  the heading says Create Service Record, and the ticks are
   *                  the processor's own.
   *   `"verify"`     For Verification. The record is being READ: the heading
   *                  names the thing rather than the act, and a system-set
   *                  Deficient stands beside Double Used.
   *
   * NOT THE SAME QUESTION AS {@link locked}, which is about the RECORD — a plan
   * terminated at the branch closes the fields on For Process too, and that
   * queue's screen is still the one for making records. This is about which
   * pile the reader came from, which is a thing only the page knows.
   *
   * FOR PROCESS IS LEFT AS IT WAS, deliberately (user, 2026-08-27): both of the
   * differences above arrived as part of the verifier's screen, and the queue
   * that had them by accident — one component drawing both — was not the one
   * they were asked for.
   *
   * `"read"` IS A RECORD OFF A LIST rather than off a queue — the conveyor's
   * held billing. It lands in the same half as the three above: the record is
   * being read, so it is titled as a thing rather than as an act. See
   * {@link RecordActionsProps.action}, which draws the distinction that matters
   * more — which commit is offered — and offers none for this one.
   */
  action?: "terminate" | "verify" | "approve" | "endorse" | "read";
  /**
   * Take the reader to the DEFICIENCY LIST — what the Deficient tick does when
   * it is pressed (user, 2026-09-14: "when click will move to the section of the
   * documents").
   *
   * THE FORM DOES NOT KNOW WHERE THAT IS, which is why this is a callback and
   * not a scroll written here. The Documents section is a sibling in a column
   * this component has never had a reference to, it is a different element in
   * the drawer than it is on the page, and which TAB of it should open is the
   * section's own state. The caller holds all three.
   *
   * Optional, and the tick is the inert reading it always was without it — see
   * the control itself, which is `disabled` exactly when this is absent.
   */
  onShowDeficiencies?: () => void;
}

/** The pair the CSP amount is priced by — see the re-pricing effect below. */
function pricedPair(values: Pick<FormValues, "mortuaryCode" | "cspCode">) {
  return `${values.mortuaryCode}|${values.cspCode}`;
}

export function ServiceRecordForm({
  service,
  billing,
  onSave,
  locked = false,
  action = "terminate",
  onShowDeficiencies,
}: ServiceRecordFormProps) {
  /**
   * The record is being READ on one of the queues past For Process — see
   * {@link ServiceRecordFormProps.action}.
   *
   * ALL OF THEM, not just the verifier's: For Approval and For Endorsement draw
   * the same record, and a heading that said Create over it there would be as
   * wrong as it was here. What differs between those queues is the act at the
   * foot of the rail, which is `RecordActions`' business rather than this
   * form's.
   */
  const verifying = action !== "terminate";
  // Computed once per SERVICE rather than per render: `billing` is rebuilt on
  // every store change, and re-deriving off it would reset the form under the
  // user each time anything in the module was written.
  const defaults = useMemo(
    () => defaultsFor(service, billing),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service.id],
  );

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: defaults,
  });

  // Subscribe: raising or withdrawing a deficiency in the Documents section
  // below has to flip the Deficient tick without anything being threaded
  // between the two components. Same subscription `RecordActions` keeps, for
  // the same reason and off the same rule — and kept unconditionally, since a
  // hook cannot be taken back on a prop.
  useServiceDocumentsStore();

  /**
   * WHETHER ANYTHING IS OUTSTANDING AGAINST THIS SERVICE — the Deficient tick,
   * derived rather than held.
   *
   * IT IS THE DEFICIENCY LIST ON THIS SCREEN, and nothing narrower (user,
   * 2026-08-27). `getServiceDeficiencies` is the exact call the Documents
   * section makes to draw its right-hand column and to count the "6 outstanding"
   * over it, so the tick and that list are one fact: anything standing in that
   * column ticks this box, and clearing the column clears it.
   *
   * IT WAS `getRaisedDeficiencies` FIRST, and that was the wrong rule for a
   * READING. That function deliberately leaves the requirement checklist out,
   * because it answers a different question — what HOLDS the service, i.e. what
   * stops it being terminated — and an unmet requirement never has. A box
   * labelled Deficient sitting a screen above six outstanding requirements and
   * reading as clear was the screen disagreeing with itself.
   *
   * WHICH MEANS IT IS TICKED ON ALMOST EVERYTHING TODAY, and honestly so: the
   * requirement list is a stand-in that starts every service at the same six
   * documents (see `ServiceRecordDocuments`), so until a real per-service
   * requirement table lands, nearly every service IS outstanding something. The
   * tick is telling the truth about the data it has.
   */
  const deficient =
    getServiceDeficiencies(
      db.getPlanholder(service.lpaNo)?.personId ?? "",
      service,
    ).length > 0;

  /**
   * The pair the amount currently in the field was priced for.
   *
   * What keeps the re-pricing effect below from firing on arrival: the form
   * opens on an amount already priced for its own pair — the service's, off the
   * same two lookups — and a processor's typed override would be overwritten on
   * the first render if the effect could not tell "the pair changed" from "the
   * pair was always this".
   */
  const repricedFor = useRef(pricedPair(defaults));

  // Moving to another plan holder in the rail keeps this component mounted and
  // swaps the service under it, so the fields have to be re-seeded — otherwise
  // the previous plan holder's amount and name stay on screen against the new
  // one, which is the worst kind of wrong: it looks filled in.
  useEffect(() => {
    reset(defaults);
    repricedFor.current = pricedPair(defaults);
  }, [defaults, reset]);

  const mortuaryCode = watch("mortuaryCode");
  const cspCode = watch("cspCode");

  /**
   * RE-PRICING: change the mortuary or the CSP code and the amount follows.
   *
   * The rate is `RefMortuaryCSPRate` keyed on exactly that pair, so a processor
   * who moves a service to another funeral home has changed what it is worth —
   * leaving the old mortuary's figure in the box would post one mortuary's rate
   * against another's contract, which is the mistake this field exists to
   * prevent rather than a thing to make the processor notice.
   *
   * WHAT IT WILL NOT DO IS BLANK THE FIELD. A pair with no rate on file leaves
   * the amount alone: that is the case the processor has to answer from the
   * paperwork, and clearing their work to say "no rate" would be the worst
   * possible way to ask.
   */
  useEffect(() => {
    const pair = pricedPair({ mortuaryCode, cspCode });
    if (repricedFor.current === pair) return;
    repricedFor.current = pair;

    const rate = cspAmountFor(mortuaryCode, cspCode);
    if (rate !== undefined) {
      setValue("cspAmount", String(rate), { shouldDirty: true });
    }
  }, [mortuaryCode, cspCode, setValue]);

  const mortuary = getMortuary(mortuaryCode);

  // This service's chapel first, then the rest — the create-billing form's
  // ordering, for the reason given on `getMortuaryOptions`. A service
  // transferred in from another chapel keeps the mortuary that rendered it,
  // which is why the rest of the list is still offered rather than filtered out.
  const mortuaries = useMemo(
    () => getMortuaryOptions(service.chapelCode),
    [service.chapelCode],
  );

  const branches = db.getBranches();

  const submit = handleSubmit((values) => {
    // A closed record has no submit path — `RecordActions` disables the button
    // that reaches this form. Checked here as well because the association is an
    // HTML one (`form="<id>"`) and any button anywhere on the page could carry
    // it: the guard belongs with the thing being guarded.
    if (locked) return;

    onSave({
      status: values.status,
      dateFiledISO: values.dateFiled,
      dateOfDeathISO: values.dateOfDeath,
      requestingBranchCode: values.requestingBranchCode,
      branchManager: values.branchManager,
      deceasedLastName: values.deceasedLastName,
      deceasedFirstName: values.deceasedFirstName,
      mortuaryCode: values.mortuaryCode,
      cspCode: values.cspCode,
      // Back to a number at the boundary. The field holds a string because that
      // is what an input holds, and every reader of the record wants the money.
      cspAmount: Number(values.cspAmount) || 0,
      natureOfService: values.natureOfService,
      withWreath: values.withWreath,
      creditOfService: values.creditOfService,
      doubleUsed: values.doubleUsed,
    });
  });

  return (
    // A REAL `<form>`, with an id, because the button that submits it is not
    // inside it — it stands in the rail, above the plan holder list. An HTML
    // button carrying `form="<id>"` submits that form from anywhere on the page,
    // which is the whole reason this is a form element and not a `<Box>`: the
    // alternative was handing a submit callback up through the view, and the
    // platform already has the association.
    //
    // `chakra("form")` rather than `<Box as="form">`: Chakra's `as` swaps the
    // tag but not the PROPS, so a Box will not take `onSubmit`.
    <Form id={SERVICE_RECORD_FORM_ID} onSubmit={submit}>
      {/* THE HEADING NAMES THE ACT ON THE WORKBENCH AND THE THING EVERYWHERE
          ELSE (user, 2026-08-27). On For Process the block IS a record being
          created, and "Create Service Record" is what the screen it replaces
          called it — that queue keeps its own word. Past it nothing here can be
          created: the record was made, the plan is terminated, the fields are
          read-only, and a heading saying Create over them would be the screen
          contradicting itself. See {@link ServiceRecordFormProps.action}. */}
      <SectionTitle
        title={verifying ? "Service Records" : "Create Service Record"}
        subtitle="What the chapel is owed for this service, and under what terms."
      />

      {/* Paired from `sm`. These are short fields — a code, a date, an amount —
          and a single column of them on a desktop is a column of half-empty
          boxes with the eye travelling twice as far down the form. */}
      <Flex direction="column" gap={5}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <SelectField
            control={control}
            name="status"
            label="Status"
            options={SERVICE_RECORD_STATUSES}
            readOnly={locked}
          />
          <DateField
            control={control}
            name="dateFiled"
            label="Date Filed"
            readOnly={locked}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <DateField
            control={control}
            name="dateOfDeath"
            label="Date of Death"
            readOnly={locked}
          />
          {/* Every branch, not only the territory's: a family can file at a
              branch anywhere, and the service is still this chapel's. */}
          <Field.Root css={{ "& option[value='']": { display: "none" } }}>
            <Controller
              control={control}
              name="requestingBranchCode"
              render={({ field }) =>
                // Locked, it reads out the branch the same way the dropdown
                // wrote it — see the note on `SelectField`.
                locked ? (
                  <FloatingLabelInput
                    label="Requesting Branch"
                    value={branchLabel(branches, String(field.value ?? ""))}
                    readOnly
                    {...READ_ONLY_FIELD}
                  />
                ) : (
                  <FloatingLabelSelect
                    label="Requesting Branch"
                    value={String(field.value ?? "")}
                    onValueChange={field.onChange}
                  >
                    {branches.map((branch) => (
                      <option key={branch.branchCode} value={branch.branchCode}>
                        {branch.branchCode} — {branch.description}
                      </option>
                    ))}
                  </FloatingLabelSelect>
                )
              }
            />
          </Field.Root>
        </SimpleGrid>

        <TextField
          control={control}
          name="branchManager"
          label="Branch Manager"
          readOnly={locked}
        />

        {/* The deceased, in two fields rather than the one name shown
            everywhere else on this screen. It is a name being TYPED here, and
            it is typed off a death certificate that has the parts separately —
            which is also why it is editable at all: the certificate is the
            record, and the seed's spelling is not. */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <TextField
            control={control}
            name="deceasedLastName"
            label="Deceased Lastname"
            readOnly={locked}
          />
          <TextField
            control={control}
            name="deceasedFirstName"
            label="Deceased Firstname"
            readOnly={locked}
          />
        </SimpleGrid>

        {/* Mortuary and its code, one above the other — the same pairing the
            create-billing form makes, where choosing the name fills the code
            and the two cannot disagree. */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <Field.Root>
            <Controller
              control={control}
              name="mortuaryCode"
              render={({ field }) =>
                locked ? (
                  <FloatingLabelInput
                    label="Mortuary"
                    value={
                      getMortuary(String(field.value ?? ""))?.mortuary ?? ""
                    }
                    readOnly
                    {...READ_ONLY_FIELD}
                  />
                ) : (
                  <FloatingLabelSelect
                    label="Mortuary"
                    value={String(field.value ?? "")}
                    onValueChange={field.onChange}
                  >
                    <option value="">Select a mortuary</option>
                    {mortuaries.map((option) => (
                      <option key={option.mortCode} value={option.mortCode}>
                        {option.mortuary}
                      </option>
                    ))}
                  </FloatingLabelSelect>
                )
              }
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              label="Mortuary Code"
              value={mortuary?.mortCode ?? ""}
              readOnly
              {...READ_ONLY_FIELD}
            />
          </Field.Root>
        </SimpleGrid>

        {/* The amount, and the code it is charged under — both derived, both
            still editable. The code comes off the plan and the amount off the
            code and the mortuary together, so changing either re-prices the
            other; see the re-pricing effect above. Editable because the rate
            table is sparse: a mortuary with no rate on file for this plan gives
            nothing to fill in, and somebody has to answer that from the
            paperwork. */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <SelectField
            control={control}
            name="cspCode"
            label="CSP Code"
            options={CSP_CODES}
            readOnly={locked}
          />
          <TextField
            control={control}
            name="cspAmount"
            label="CSP Amount"
            type="number"
            readOnly={locked}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          <SelectField
            control={control}
            name="natureOfService"
            label="Nature of Service"
            options={NATURE_OF_SERVICE}
            readOnly={locked}
          />
          <SelectField
            control={control}
            name="withWreath"
            label="With Wreath"
            options={WREATH_AMOUNTS}
            readOnly={locked}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
          {/* A SELECT SINCE 2026-08-25, when `RefCreditOfService` finally got its
              four rows — it was a free text input for as long as the table was
              empty, because a dropdown with nothing in it is worse than a box.

              EDITABLE, THOUGH IT ARRIVES ANSWERED. The endorsement carries a
              credit of service and this field opens on it; the processor is
              authorised to correct it, so it is not shown read-only. */}
          <SelectField
            control={control}
            name="creditOfService"
            label="Credit of Service"
            options={CREDIT_OF_SERVICE_OPTIONS}
            readOnly={locked}
          />
          {/* Beside its field rather than under the row, so the row is two
              controls wide like every other row on the form. Both ticks share
              the cell — see `Deficient`, which stands next to Double Used
              because the pair is read together: one is what the processor says
              about the service, the other what the system already knows. */}
          <Flex align="center" gap={6} minH="40px" wrap="wrap">
            <Controller
              control={control}
              name="doubleUsed"
              render={({ field }) => (
                <Checkbox.Root
                  checked={Boolean(field.value)}
                  onCheckedChange={(e) => field.onChange(Boolean(e.checked))}
                  // The one control on the form that is DISABLED rather than
                  // read-only: a checkbox has no read-only state in HTML, and
                  // its tick is legible greyed out in a way a field's text is
                  // not.
                  disabled={locked}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label fontSize="sm" color="gray.700">
                    Double Used
                  </Checkbox.Label>
                </Checkbox.Root>
              )}
            />

            {/* DEFICIENT — SYSTEM-GENERATED, AND NEVER THE PROCESSOR'S TO TICK
                (user, 2026-08-27).

                ON EVERY QUEUE SINCE 2026-09-14 (user: "add the deficient
                here"), where it used to be the verifier's alone. The older rule
                was that the tick arrived as part of what a VERIFIER reads and
                For Process should be left as it was; what changed is that the
                processor is the one who can do something about it. They are
                standing in the record that is short a document, and the fact
                was reaching them only as a sentence under a button in the rail.

                AND IT IS A WAY IN, NOT ONLY A FACT (user, 2026-09-14: "when
                click will move to the section of the documents"). Pressing it
                opens the Deficiency list below and scrolls there — which is the
                one thing a processor wants the moment they see the tick, and it
                is two thousand pixels down a record on a long folder. See
                `onShowDeficiencies`.

                IT STILL CANNOT BE TICKED. `checked` is derived, so a press
                changes nothing here; what it changes is where you are standing,
                and the place it takes you is where the fact is actually altered
                — submit the document, or withdraw the deficiency.

                It is derived, not decided: a service is
                deficient when something is outstanding against it, which is the
                deficiency it carries on record plus anything raised by hand in
                the Documents section below. `getRaisedDeficiencies` is that rule
                and it is not restated here — the same function answers the
                "Waiting on N requirements" line under the commit in the rail, so
                the tick and the sentence can never disagree.

                NO `Controller`, because it is not a form value: it is not in
                `FormValues`, it is not sent to `onSave`, and there is nothing
                for a processor to change. Wiring it into the form would make it
                look like something that gets saved.

                `disabled`, THE SAME AS THE TICK BESIDE IT (user, 2026-08-27).
                It was `readOnly` first, on the reasoning that a derived fact is
                there to be READ and should keep full contrast where a merely
                closed control is greyed. What that produced was two checkboxes
                on one row drawn two different ways — a pale grey box next to a
                black-bordered one — which reads as two different KINDS of
                control before it reads as a distinction about who sets them.
                Neither can be touched on this screen, and that is the thing the
                row should say once, in one voice.

                WHICH IS WHY IT IS NO LONGER `disabled` WHERE IT LEADS
                SOMEWHERE. A disabled control takes no clicks at all, so the
                tick could not be the way into the deficiency list and stay
                greyed out. Where the caller gives it somewhere to go it is a
                live control — cursor, hover, focus ring — and where it does not,
                it is the disabled reading it always was. The tick's state is
                derived either way, so neither version can be set from here. */}
            {/* THE CLICK IS ON THE WRAPPER, AND THE CHECKBOX TAKES NO POINTER
                EVENTS AT ALL.

                It was on `Checkbox.Root` itself for an afternoon and that was
                the wrong place to put it. The root is a <label> wrapping a
                hidden input, and a click on it is handled by the checkbox's own
                machinery first: the label forwards to the input, the input
                re-dispatches, and whether a handler passed in as a prop survives
                that depends on the order the library merges it in. A control
                whose press MIGHT arrive is not a control.

                So the box and its label are made inert — `pointerEvents: none`
                — and the plain element around them takes the press. There is
                nothing left to swallow it, and the checkbox goes back to doing
                the one thing it is good at: showing a state.

                `readOnly` rather than `disabled` now that the wrapper is the
                control: disabled greys the tick, and this one is a fact being
                READ, in full contrast, on a control that is very much alive. */}
            <Box
              role={onShowDeficiencies ? "button" : undefined}
              tabIndex={onShowDeficiencies ? 0 : undefined}
              onClick={onShowDeficiencies}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                if (!onShowDeficiencies) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onShowDeficiencies();
                }
              }}
              cursor={onShowDeficiencies ? "pointer" : undefined}
              borderRadius="md"
              title={
                onShowDeficiencies
                  ? "Open the deficiency list below"
                  : undefined
              }
              _focusVisible={{
                outline: "2px solid",
                outlineColor: BRAND_COLORS.primaryGreen,
                outlineOffset: "2px",
              }}
              _hover={
                onShowDeficiencies
                  ? { "& [data-part='label']": { color: "gray.900" } }
                  : undefined
              }
            >
              <Checkbox.Root
                checked={deficient}
                readOnly
                disabled={!onShowDeficiencies}
                pointerEvents="none"
              >
                <Checkbox.HiddenInput tabIndex={-1} />
                <Checkbox.Control />
                <Checkbox.Label fontSize="sm" color="gray.700">
                  Deficient
                </Checkbox.Label>
              </Checkbox.Root>
            </Box>
          </Flex>
        </SimpleGrid>
      </Flex>

      {/* No footer. The button that submits this form is in the RAIL — see
          `RecordActions`, which also decides whether it can be pressed at all:
          Terminate is disabled while the billing it would post against has no
          number. This form ends with its last field, and the button reaches it
          through `form={SERVICE_RECORD_FORM_ID}`. */}
    </Form>
  );
}

export default ServiceRecordForm;
