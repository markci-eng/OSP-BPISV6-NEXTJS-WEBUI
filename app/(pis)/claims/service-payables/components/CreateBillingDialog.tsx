"use client";

// The Create Billing form.
//
// Modelled on the screen this replaces, less two of its fields.
//
// The Billing Number is gone: it said "System Generated" and could not be typed
// into, which made it a caption for something that has not happened yet. It IS
// generated — and it is shown where it becomes real, on the billing's own line
// in the main section, the moment this form is submitted.
//
// The CV Number is gone because it is no longer used.
//
// What is left is the CV date, the mortuary and its code, and the CIS Billing
// Number — the billing code this is being raised against, read-only. That last
// one earns its place by being fixed: the form is where a user confirms WHAT
// they are billing before committing to a number quoted outside this system.
//
// The mortuary was an F2 lookup there. It is a select here, over the real
// `RefMortuary` list, and it OPENS ALREADY ANSWERED: the billing code begins
// with the chapel, and `RefMortuary` keys each mortuary on that same chapel
// code, so the chapel's designated mortuary is filled in before the user
// touches anything. Still a select and not a caption — the designated answer
// is the near-certain one, not the only one, and a chapel the reference data
// gives no mortuary of its own opens on the full list unanswered. The list
// keeps the chapel's own first for exactly those cases — see
// `getMortuaryOptions`. Choosing one fills the code beside it, because the
// two are one fact.
//
// Built on the kit's `ModalForm` and its floating-label fields, the same
// construction every other modal form in this app uses, with `react-hook-form`
// holding the state as the project's conventions require.

import { useEffect, useMemo } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  ModalForm,
  ModalFormField,
} from "osp-ui-kit";
import {
  defaultMortCodeFor,
  formatCSP,
  getMortuary,
  getMortuaryOptions,
  type ServiceBilling,
} from "../service-payables-data";
import type { BillingDetails } from "../service-payables-store";

/**
 * How a field that cannot be typed into is drawn.
 *
 * `readOnly` alone changes only what the keyboard can do — the field still
 * looks exactly like the two above it that ARE editable, so the only way to
 * find out is to click it and have nothing happen. A washed background and
 * muted text say it before that.
 *
 * `readOnly` and not `disabled`, deliberately: a disabled field is skipped by
 * the keyboard and dropped from form submission, and these two are meant to be
 * READ — they are what the user checks before committing.
 */
const READ_ONLY_FIELD = {
  bg: "gray.50",
  color: "gray.600",
  cursor: "default",
  _hover: { bg: "gray.50" },
  _focusVisible: { borderColor: "gray.200", boxShadow: "none" },
} as const;

/** What the form holds. The mortuary NAME is derived, so it is not a field. */
interface CreateBillingForm {
  cvDate: string;
  mortuaryCode: string;
}

/**
 * Today, as the date input wants it.
 *
 * Local rather than `toISOString()`, which converts to UTC first and so hands
 * back yesterday for anyone east of Greenwich for most of their working day —
 * this application runs at UTC+8.
 */
function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export interface CreateBillingDialogProps {
  billing: ServiceBilling;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (details: BillingDetails) => void;
}

export function CreateBillingDialog({
  billing,
  open,
  onOpenChange,
  onSubmit,
}: CreateBillingDialogProps) {
  // The chapel's designated mortuary — the automatic answer this form opens
  // on. The billing already names its chapel, and `RefMortuary` names each
  // mortuary's chapel, so the two meet without the user's help.
  //
  // "FIRST OF THE CHAPEL'S OWN" IS NO LONGER FIRST-IN-THE-TABLE. With the whole
  // 424-row `RefMortuary` on file a chapel has several — the town's own St.
  // Peter chapel and every independent parlour working out of the same place —
  // and source order was offering owned chapels a franchised funeral home.
  // `getMortuariesForChapel` ranks them now: same class as the chapel first,
  // then the one that names its town. See that function.
  //
  // Still empty where the reference data gives the chapel none: an empty string
  // leaves the select on its prompt, and the required-field rule takes it from
  // there. EIGHT chapels are in that position now — it was fifty-eight until the
  // designation started looking mortuaries up by description — and a guess would
  // still be worse than a prompt.
  //
  // SHARED WITH THE PRICING since 2026-08-26 — `defaultMortCodeFor` is this same
  // answer, and it is what a chapel's services in the queue are priced against
  // before their billing exists. One rule and one place for it: the amount shown
  // on a For Process billing is the amount THIS mortuary's rate card gives, so
  // the two cannot say different things.
  const designatedMortuaryCode = useMemo(
    () => defaultMortCodeFor(billing.chapelCode),
    [billing.chapelCode],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateBillingForm>({
    defaultValues: { cvDate: todayISO(), mortuaryCode: designatedMortuaryCode },
  });

  // Reopening the form gives a fresh one — back to the designated mortuary,
  // not to whatever the last opening left. Without this, cancelling a billing
  // and starting another would carry the first one's mortuary into the second
  // — which is exactly the mistake that is hardest to notice afterwards.
  //
  // This is also what lets the dialog stay mounted between openings, which is
  // what keeps it from stranding the page — see the note where it is rendered.
  useEffect(() => {
    if (open) reset({ cvDate: todayISO(), mortuaryCode: designatedMortuaryCode });
  }, [open, reset, designatedMortuaryCode]);

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` /
  // `data-inert` stuck on <body> after a modal closes, freezing the page — a
  // known failure in this codebase, guarded the same way on the plan holder
  // card's drawer, the claim request drawer and this module's record drawer.
  //
  // The query is what keeps this from firing while something else is still up:
  // creating a billing is the last thing a user does before opening a record,
  // and the record's own drawer can be open over this one on a narrow screen.
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

  // Watched rather than read on submit, because it is displayed: picking the
  // mortuary fills the code field beside it as you look at it.
  const mortuaryCode = watch("mortuaryCode");
  const mortuary = getMortuary(mortuaryCode);

  // This chapel's own mortuaries first, then the rest. Keyed on the chapel and
  // not on the billing, since that is the only part of it the order depends on.
  const mortuaries = useMemo(
    () => getMortuaryOptions(billing.chapelCode),
    [billing.chapelCode],
  );

  const submit = handleSubmit((values) => {
    onSubmit({
      cvDateISO: values.cvDate,
      mortuaryCode: values.mortuaryCode,
      mortuaryName: getMortuary(values.mortuaryCode)?.mortuary ?? "",
    });
    onOpenChange(false);
  });

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Create Billing"
      description={`${billing.chapelDesc} · ${billing.periodLabel} · ${formatCSP(
        billing.totalCSP,
      )}`}
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row-reverse" }}
        >
          {/* `onClick`, not `type="submit"` with the modal's `onSubmit`.
              `ModalForm` takes an `onSubmit` prop but does not fire it — the
              one other modal form in this app has that same line commented out
              with a click handler in its place, which is the same conclusion
              reached twice. Validation still runs: `submit` is react-hook-form's
              `handleSubmit`, and it checks the fields itself. */}
          <Button type="button" onClick={submit} w={{ base: "full", sm: "auto" }}>
            Create
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            w={{ base: "full", sm: "auto" }}
          >
            Cancel
          </Button>
        </Flex>
      }
    >
      {/* Every field is `fullWidth`, so the form is one column at every size.
          Four fields do not fill two columns evenly, and two of them are
          read-only — a grid would have put a field the user CAN edit beside one
          they cannot, which reads as an arbitrary pairing. One column also
          means the mortuary and the code it fills sit one directly above the
          other, which is the one adjacency here that means something. */}
      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="CV Date"
          type="date"
          {...register("cvDate", { required: "CV Date is required" })}
          errorText={errors.cvDate?.message}
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelSelect
          label="Mortuary"
          {...register("mortuaryCode", { required: "Mortuary is required" })}
          errorText={errors.mortuaryCode?.message}
        >
          <option value="">Select a mortuary</option>
          {mortuaries.map((option) => (
            <option key={option.mortCode} value={option.mortCode}>
              {option.mortuary}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      {/* Filled by the pick above rather than typed. The old screen had it as
          its own input; here the two cannot disagree, which is the one thing a
          code paired with a name has to guarantee. */}
      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Mortuary Code"
          value={mortuary?.mortCode ?? ""}
          readOnly
          {...READ_ONLY_FIELD}
        />
      </ModalFormField>

      {/* The billing code — what this billing IS, and the last thing to check
          before committing. Never editable: it is derived from the chapel and
          the period, so a typed one would name a billing that does not exist. */}
      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="CIS Billing Number"
          value={billing.billingCode}
          readOnly
          {...READ_ONLY_FIELD}
        />
      </ModalFormField>
    </ModalForm>
  );
}

export default CreateBillingDialog;
