"use client";

// RAISING A BILLING FOR A FRANCHISE THAT SUBMITS ON PAPER — the one screen in
// this module where a billing is CREATED rather than found.
//
// `CreateBillingDialog`'s construction, with the two halves of it swapped. There,
// the billing is the given: it already exists, derived from a chapel and a
// period, and what the form collects is the mortuary to raise it against. Here
// there is no billing at all until this is submitted, and the MORTUARY is the
// given — it is the franchisee, the thing the processor has on the paperwork in
// front of them — so it leads, and the period is chosen beside it.
//
// WHAT IS ASKED FOR, AND WHAT IS DELIBERATELY NOT.
//
// The mortuary, the cut and the CV date. Nothing else: the territory, the chapel
// and the company are read from the mortuary or fixed, and a form that asked for
// them would be asking a processor to re-enter what the reference table already
// says. The billing NUMBER is not asked for either — it is minted on submit,
// which is the whole reason this form exists.
//
// THERE IS NO CIS BILLING CODE FIELD, and that absence is the point rather than
// an omission. `CreateBillingDialog` ends with the code read-only, because
// confirming WHAT you are billing before committing to a number is the last
// thing that form does. A paper franchise has no code to confirm — it never
// endorsed anything — so what stands in its place is the mortuary's own
// identification, which is the only thing here that says what is being billed.
//
// FRANCHISED MORTUARIES LEAD THE LIST, in their own group. This path exists for
// them and for nothing else: a company-owned chapel endorses through the system
// by definition. The owned ones are still reachable underneath rather than
// filtered out — the class column is reference data, and a list that silently
// drops a row is worse than one that ranks it last.

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  CompactModalFormActions,
  CompactModalFormChrome,
} from "./CompactModalForm";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  ModalForm,
  ModalFormField,
} from "osp-ui-kit";
import {
  CUTS_PER_MONTH,
  getMortuaryOptions,
  periodLabel,
  periodOf,
  type BillingPeriod,
} from "../service-payables-data";
import type { FranchiseIntake } from "../use-franchise-billing";

/**
 * Today, as the date input wants it. Local rather than `toISOString()`, which
 * converts to UTC first and hands back yesterday for most of a working day at
 * UTC+8 — the same helper, for the same reason, as the create form's.
 */
function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The cut before this one — back a month when this is the first of four. */
function previousPeriod(period: BillingPeriod): BillingPeriod {
  if (period.cut > 1) return { ...period, cut: period.cut - 1 };
  return period.month > 0
    ? { year: period.year, month: period.month - 1, cut: CUTS_PER_MONTH }
    : { year: period.year - 1, month: 11, cut: CUTS_PER_MONTH };
}

/**
 * The cuts this form offers, newest first, starting at the one that has just
 * CLOSED.
 *
 * THE CURRENT CUT IS IN THE LIST BUT IT IS NOT THE DEFAULT. A franchise submits
 * for a week that has ended — the hard copies are the record of funerals already
 * rendered — so the cut a processor almost always wants is the one before the
 * one they are standing in. Defaulting to the current cut would put the common
 * case one click away and the rare one under the cursor.
 *
 * FOUR BACK, which is a month of work. A franchise running further behind than
 * that is real but unusual, and the answer for it is a longer list rather than a
 * different form; this is the range that keeps the select readable.
 */
const PERIODS_OFFERED = 5;

function recentPeriods(): BillingPeriod[] {
  const out: BillingPeriod[] = [periodOf(todayISO())];
  while (out.length < PERIODS_OFFERED) {
    out.push(previousPeriod(out[out.length - 1]));
  }
  return out;
}

/** A period as a form value — the select's options are strings. */
function periodValue(period: BillingPeriod): string {
  return `${period.year}-${period.month}-${period.cut}`;
}

function parsePeriodValue(value: string): BillingPeriod {
  const [year, month, cut] = value.split("-").map(Number);
  return { year, month, cut };
}

interface FranchiseIntakeForm {
  mortCode: string;
  period: string;
  cvDate: string;
}

export interface FranchiseIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (intake: FranchiseIntake) => void;
}

export function FranchiseIntakeDialog({
  open,
  onOpenChange,
  onSubmit,
}: FranchiseIntakeDialogProps) {
  const periods = useMemo(recentPeriods, []);
  // The last CLOSED cut — see {@link PERIODS_OFFERED}. `periods[0]` is the one
  // in progress.
  const defaultPeriod = periodValue(periods[1]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FranchiseIntakeForm>({
    defaultValues: {
      mortCode: "",
      period: defaultPeriod,
      cvDate: todayISO(),
    },
  });

  // A fresh form on every opening. Without this, cancelling one franchisee and
  // starting another carries the first one's mortuary into the second — the
  // mistake that is hardest to notice afterwards, and the same reason
  // `CreateBillingDialog` resets.
  useEffect(() => {
    if (open) {
      reset({ mortCode: "", period: defaultPeriod, cvDate: todayISO() });
    }
  }, [open, reset, defaultPeriod]);

  // The zag-js stuck-`pointer-events` guard — see `CreateBillingDialog`, where
  // the failure it covers is described.
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

  /**
   * Every mortuary, FRANCHISED FIRST — see the note at the top of this file on
   * why the owned ones are ranked last rather than filtered out.
   *
   * ONE LIST NOW RATHER THAN TWO GROUPS. The order still carries the ranking;
   * what says which kind a row is, is the row itself.
   */
  const mortuaries = useMemo(() => {
    const all = getMortuaryOptions();
    return [
      ...all.filter((m) => m.isFranchise),
      ...all.filter((m) => !m.isFranchise),
    ];
  }, []);

  // NOTHING IS WATCHED. Every field now shows its own value on its own control,
  // so no part of this form re-renders on someone else's keystroke; the values
  // are read once, on submit.

  const submit = handleSubmit((values) => {
    onSubmit({
      mortCode: values.mortCode,
      period: parsePeriodValue(values.period),
      cvDateISO: values.cvDate,
    });
    onOpenChange(false);
  });

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Franchise Entry"
      description="Raise a billing for a franchise that submits its paperwork by hand"
      footer={
        <CompactModalFormActions
          confirmLabel="Create Billing"
          onConfirm={submit}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <CompactModalFormChrome />

      {/* The mortuary spans both columns. It is the field this form is about,
          its options are the longest text on the screen, and the period and the
          CV date pair off evenly underneath it. */}
      <ModalFormField fullWidth>
        {/* NO HELPER TEXT (user, 2026-09-17). It said the mortuary is the
            franchisee and that its rate card prices the billing — true, and
            already known by anyone raising one of these. What the field is for
            is answered by the read-back below it, which names the actual
            franchisee rather than describing the field. */}
        <FloatingLabelSelect
          label="Mortuary"
          {...register("mortCode", { required: "The mortuary is required" })}
          errorText={errors.mortCode?.message}
        >
          {/* NO "Select a mortuary" ROW (user, 2026-09-17). `FloatingLabelSelect`
              already renders an empty first option of its own, and the floating
              label — which sits centered inside the field until something is
              picked — IS the prompt. A second row saying it in words put two
              blanks at the top of the list and told the reader what the label
              had already told them. */}
          {/* NO GROUP HEADINGS (user, 2026-09-15: "remove the franchised word in
              the selection"). They were `<optgroup label="Franchised">` and
              `"Company-owned"` — two headings to say a thing every row can say
              about itself, and a heading is the wrong place for it besides: it
              scrolls out of sight, so a reader half-way down a list of 424 has
              nothing on screen telling them which half they are in.

              THE IDENTIFIER RIDES ON EACH ROW INSTEAD, and it is the reference
              table's own value rather than a word invented here: `RefMortuary`
              records the class as FR or OW, which is what appears on a report
              and what somebody would say out loud. See `MORT_CLASS_LABEL`.

              IT IS THE LAST THING ON THE LINE so the browser's type-ahead still
              works. A native select matches from the START of an option's text,
              so a leading "FR · " would make typing a mortuary code jump
              nowhere — the one bit of searching a native select gives for
              free. */}
          {mortuaries.map((option) => (
            <option key={option.mortCode} value={option.mortCode}>
              {option.mortCode} — {option.mortuary} · {option.mortClass}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      {/* NO READ-BACK PANEL (user, 2026-09-17). Picking a mortuary used to open
          a bordered note naming it again and saying whether a chapel was on
          file — and on a franchise row there usually is not one, so the common
          case rendered a line about an absence. A note that mostly reports
          nothing missing reads as a warning about something being wrong.

          The select already shows what was picked, code and name and class, on
          its own closed field. */}
      <ModalFormField>
        {/* NO DATE RANGE UNDERNEATH (user, 2026-09-17). It spelled the chosen
            cut back as ISO dates — "Services from 2026-09-08 to 2026-09-15" —
            which is the option's own label said a second time in a format
            nobody speaks. The option reads SEPTEMBER 8-15, 2026 already. */}
        <FloatingLabelSelect
          label="Billing Period"
          {...register("period", { required: "The billing period is required" })}
          errorText={errors.period?.message}
        >
          {periods.map((option, index) => (
            <option key={periodValue(option)} value={periodValue(option)}>
              {periodLabel(option)}
              {index === 0 ? " (in progress)" : ""}
            </option>
          ))}
        </FloatingLabelSelect>
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="CV Date"
          type="date"
          {...register("cvDate", { required: "CV Date is required" })}
          errorText={errors.cvDate?.message}
        />
      </ModalFormField>

      {/* NO CLOSING EXPLANATION (user, 2026-09-17). This used to carry a
          paragraph on what happens next — that creating mints the number and
          opens an empty billing. It was written for a processor meeting the
          screen once; for the one who raises these every cut it was a wall of
          text between the last field and the button, saying what the empty
          billing says for itself the moment it opens. */}
    </ModalForm>
  );
}

export default FranchiseIntakeDialog;
