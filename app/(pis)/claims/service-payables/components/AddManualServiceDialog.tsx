"use client";

// Keying a plan holder in by hand — the franchise path.
//
// A company-owned chapel endorses its week's services through the system, so
// they arrive already attached to a plan and a claim, and nobody types anything.
// Some franchises cannot do that. They send the paperwork in, and a processor
// sits down with it and enters the plan holders one at a time. That is the old
// process, and the rules are explicit that it is only the ENTRY that differs:
// everything after this dialog — the record, the discrepancy check, the
// termination — is the same screen an owned chapel's service goes through.
//
// WHAT IS ASKED FOR, and what is deliberately not.
//
// The plan number is the whole of the lookup. Everything else about the plan —
// the holder, the plan type, the contract date, the branch that collects on it —
// is already on file and is read from it, because the processor is saying WHICH
// plan was serviced rather than re-entering it. Asking for what the system knows
// is how two versions of one plan get into a database.
//
// THE PLAN NUMBER IS SUGGESTED AS IT IS TYPED (user, 2026-09-15: "in the
// insertion of LPANo suggest the lpa no"). Two characters in, the plans whose
// number or holder matches are listed under the field and one of them can be
// picked. It is a lookup, not a guess: every row shown is a plan on file, and
// picking one fills in exactly the digits that plan is keyed on.
//
// WHY IT IS WORTH IT HERE OF ALL PLACES. This is the only screen in the module
// where a plan number is TYPED rather than read off an endorsement, and it is
// typed off a hand-written form, twenty times in a sitting. A mistyped digit
// that happens to hit another plan is the failure this prevents — the wrong
// family terminated against a chapel's billing — and one that hits nothing is
// found here rather than in the deficiency list an hour later.
//
// THE NAME IS THE EXCEPTION, AND IT STAYS A PLAIN INPUT (user, same message:
// "but the declare planholder would be manual input"). It is entered separately,
// exactly as the franchise wrote it, because comparing it against the plan
// holder on file is what raises the name discrepancy. Suggesting it — or
// prefilling it from the plan the number resolved to — would guarantee the two
// matched and quietly delete the one check this path exists to make. The
// suggestion on the number and the silence on the name are the same decision
// read from two ends: the number is a FACT to be looked up, the name is
// EVIDENCE to be transcribed.
//
// NOTHING IS REFUSED HERE. A plan number that resolves to nothing still goes in
// — the franchise sent it, and losing the entry would lose the only record that
// they did. It goes in carrying a DEFICIENCY and not a discrepancy: an account
// nobody can find has not broken a rule, it is a plan holder whose ID has not
// been confirmed, and the answer is to send for the number.

import { useEffect, useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { LuInfo } from "react-icons/lu";
import { FloatingLabelInput, ModalForm, ModalFormField } from "osp-ui-kit";
import {
  CompactModalFormActions,
  CompactModalFormChrome,
} from "./CompactModalForm";
import { db, toFullName, type PersonName } from "../../../data";
import { cutRange, periodOf, type ServiceBilling } from "../service-payables-data";

/**
 * How many plans the number field offers at once.
 *
 * EIGHT, which is about a screenful inside a modal without the form's own fields
 * being pushed under the fold. The list is a shortcut to a plan somebody already
 * half-knows; a processor who cannot narrow it below eight should type another
 * character rather than scroll.
 */
const MAX_SUGGESTIONS = 8;

export interface ManualServiceSubmission {
  lpaNo: string;
  /** The deceased as the franchise wrote it, in the two parts it was typed in. */
  deceased: PersonName;
  serviceDateISO: string;
  dateOfDeathISO: string;
  remarks: string;
}

interface ManualServiceForm {
  lpaNo: string;
  deceasedLastName: string;
  deceasedFirstName: string;
  serviceDate: string;
  dateOfDeath: string;
  remarks: string;
}

export interface AddManualServiceDialogProps {
  /**
   * The billing being keyed into.
   *
   * OPTIONAL SO THAT THE DIALOG NEED NEVER BE CONDITIONALLY MOUNTED. The
   * conveyor has no billing at all when its queue is clear, and mounting this
   * on `billing &&` would put an overlay's existence in the hands of something
   * that can change while it is closing — which is how this app has stranded a
   * page with `pointer-events: none` on `<body>` before. Mounted always, driven
   * by `open`, and inert without a billing.
   */
  billing?: ServiceBilling;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: ManualServiceSubmission) => void;
}

export function AddManualServiceDialog({
  billing,
  open,
  onOpenChange,
  onSubmit,
}: AddManualServiceDialogProps) {
  // The billing IS a period, so the service date belongs inside it — a franchise
  // endorsement for the first week of August is not evidence of a funeral in
  // June. Bounded rather than merely defaulted, because a date outside the cut
  // would silently move the service onto a different billing than the one it was
  // keyed in against.
  //
  // Falls back to the current cut with no billing, which is a shape for the
  // fields to take rather than an answer: the form cannot be submitted in that
  // state — see `submit` — because there is nothing to submit it against.
  const { fromISO, toISO } = cutRange(
    billing?.period ?? periodOf(new Date().toISOString().slice(0, 10)),
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ManualServiceForm>({
    defaultValues: {
      lpaNo: "",
      deceasedLastName: "",
      deceasedFirstName: "",
      serviceDate: fromISO,
      dateOfDeath: fromISO,
      remarks: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        lpaNo: "",
        deceasedLastName: "",
        deceasedFirstName: "",
        serviceDate: fromISO,
        dateOfDeath: fromISO,
        remarks: "",
      });
    }
  }, [open, reset, fromISO]);

  // The zag-js stuck-`pointer-events` guard — see `CreateBillingDialog`.
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

  // Watched so the lookup answers AS THE NUMBER IS TYPED. A processor keying in
  // twenty plans off a stack of paper finds a mistyped digit here or finds it in
  // the discrepancy list an hour later.
  const lpaNo = watch("lpaNo").trim().toUpperCase();
  const found = lpaNo ? db.getPlanholder(lpaNo) : undefined;
  const foundName = found?.name ? toFullName(found.name) : undefined;

  /**
   * The plans this number could still become — what the field suggests.
   *
   * MATCHED ON THE NUMBER AND ON THE HOLDER, because a franchise's form carries
   * both and whichever is legible is what gets typed. A processor squinting at a
   * carbon copy reads "DELA CRUZ" off it more reliably than the last three
   * digits of an LPA.
   *
   * TWO CHARACTERS BEFORE IT SAYS ANYTHING. One character matches most of the
   * file, which is a list that costs a render and answers nothing.
   *
   * CAPPED AT {@link MAX_SUGGESTIONS} — this is a shortcut to a plan somebody
   * already half-knows, not a browser for the whole book. A processor who cannot
   * narrow it to eight has the wrong field open.
   *
   * THE EXACT MATCH IS NOT IN THE LIST. Once the number resolves the panel below
   * shows the plan in full, and a suggestion offering what is already in the
   * field is a row that does nothing when clicked.
   */
  const suggestions = useMemo(() => {
    if (found || lpaNo.length < 2) return [];
    return db
      .getPlanholders()
      .filter(
        (plan) =>
          plan.lpaNo.toUpperCase().includes(lpaNo) ||
          (plan.name ? toFullName(plan.name).toUpperCase() : "").includes(lpaNo),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [lpaNo, found]);

  const submit = handleSubmit((values) => {
    // Nothing to key INTO. Unreachable from the conveyor, where the button that
    // opens this is drawn only on a billing that allows it — stated because the
    // dialog is mounted whether or not there is one.
    if (!billing) return;
    onSubmit({
      lpaNo: values.lpaNo.trim().toUpperCase(),
      // Kept in two parts all the way through — this is what the service
      // record's Deceased Lastname and Firstname open with.
      deceased: {
        lastName: values.deceasedLastName.trim(),
        firstName: values.deceasedFirstName.trim(),
      },
      serviceDateISO: values.serviceDate,
      dateOfDeathISO: values.dateOfDeath,
      remarks: values.remarks.trim(),
    });
    onOpenChange(false);
  });

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Add Planholder"
      description={
        billing ? `${billing.chapelDesc} · ${billing.periodLabel}` : ""
      }
      footer={
        <CompactModalFormActions
          confirmLabel="Add"
          onConfirm={submit}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      {/* The same compact shape as `FranchiseIntakeDialog` (user, 2026-09-17:
          "make it similar to the Franchise Entry"), which is why the width, the
          gaps, the divider and the footer padding all come from one component
          rather than being set here. */}
      <CompactModalFormChrome />

      {/* NO HELPER TEXT ON ANY FIELD (user, 2026-09-17). Every input here used
          to carry a line under it explaining itself, and stacked down a form
          this size they read as a page of instructions a processor scrolls past
          twenty times a sitting. What each line said that MATTERS is enforced
          rather than described: the suggestions appear on their own once two
          characters are in, the service date is bounded by the cut and says so
          in an error if it leaves it, and Remarks has no `required` rule. The
          one thing the notes carried that the form cannot enforce — that the
          endorsed name is transcribed and not looked up — lives in the comment
          on that field and at the top of this file, where the next person to
          change it will actually be standing. */}
      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="LPA Number"
          // AUTOCOMPLETE OFF, because the browser's own history dropdown would
          // cover the suggestions below with the last twenty numbers this
          // processor typed — including the mistyped ones, offered as though
          // they were plans.
          autoComplete="off"
          {...register("lpaNo", {
            required: "The plan number is required",
            validate: (value) =>
              value.trim().length > 0 || "The plan number is required",
          })}
          errorText={errors.lpaNo?.message}
        />
      </ModalFormField>

      {/* WHAT THE NUMBER COULD STILL BE — the suggestions, between typing and
          resolving. They stand where the "on file" panel stands and give way to
          it the moment the number matches a plan exactly, so the space under the
          field always answers the same question: which plan is this.

          EACH ROW IS A PLAN ON FILE, so picking one cannot produce a number that
          resolves to nothing. That is the difference between this and type-ahead
          over free text — there is nothing here to get wrong.

          THE NAME IS ON THE ROW BUT PICKING DOES NOT FILL IT IN. See the note at
          the top of this file: the endorsed name is transcribed from the
          franchise's paperwork and compared against the plan, and a pick that
          filled both fields would make every comparison agree by construction.
          The name is shown so the processor can tell two similar numbers apart,
          which is the job it is doing here and no other. */}
      {suggestions.length > 0 && (
        <ModalFormField fullWidth>
          <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            overflow="hidden"
          >
            <Text
              px={3}
              py={1.5}
              bg="gray.50"
              borderBottomWidth="1px"
              borderColor="gray.200"
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.06em"
              textTransform="uppercase"
              color="gray.500"
            >
              {suggestions.length === MAX_SUGGESTIONS
                ? `First ${MAX_SUGGESTIONS} matching plans`
                : `${suggestions.length} matching ${
                    suggestions.length === 1 ? "plan" : "plans"
                  }`}
            </Text>
            <Box maxH="184px" overflowY="auto">
              {suggestions.map((plan) => (
                <Flex
                  as="button"
                  key={plan.lpaNo}
                  onClick={() =>
                    // `shouldValidate` so a field the processor had already been
                    // told off about clears its error on the pick rather than
                    // waiting for the next keystroke.
                    setValue("lpaNo", plan.lpaNo, { shouldValidate: true })
                  }
                  w="full"
                  align="center"
                  justify="space-between"
                  gap={3}
                  px={3}
                  py={2}
                  textAlign="left"
                  cursor="pointer"
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  _last={{ borderBottomWidth: 0 }}
                  _hover={{ bg: "#f4faf6" }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "#109448",
                    outlineOffset: "-2px",
                  }}
                >
                  <Box minW={0}>
                    <Text
                      fontSize="11.5px"
                      fontWeight="600"
                      fontFamily="mono"
                      color="gray.800"
                    >
                      {plan.lpaNo}
                    </Text>
                    <Text fontSize="10.5px" color="gray.500" truncate>
                      {plan.name ? toFullName(plan.name) : "—"}
                    </Text>
                  </Box>
                  <Text
                    fontSize="10px"
                    color="gray.400"
                    flexShrink={0}
                    textAlign="right"
                  >
                    {plan.planDesc}
                    <br />
                    {plan.accountStatusLabel}
                  </Text>
                </Flex>
              ))}
            </Box>
          </Box>
        </ModalFormField>
      )}

      {/* The lookup's answer, either way. A number that finds nothing is not an
          error here — it is a discrepancy, and the row goes in carrying it —
          so this reports rather than blocks.

          NOT WHILE THERE ARE SUGGESTIONS BELOW THE FIELD. "No plan on file under
          this number" is true of every half-typed number, and shown next to a
          list of plans that DO match it the sentence contradicts what is beside
          it. It waits until the typing has stopped finding anything at all. */}
      {lpaNo.length > 0 && suggestions.length === 0 && (
        <ModalFormField fullWidth>
          <Flex
            align="flex-start"
            gap={2}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            bg="gray.50"
            px={3}
            py={2.5}
          >
            <Box color="gray.400" flexShrink={0} mt="2px">
              <LuInfo size={14} />
            </Box>
            <Box minW={0}>
              <Text fontSize="11px" color="gray.700" lineHeight="1.5">
                {foundName
                  ? `On file: ${foundName} — ${found?.planDesc} (${found?.planCode})`
                  : "No plan on file under this number. It can still be added; it will be held as a deficiency until the plan holder's ID is confirmed."}
              </Text>
              {found && (
                <Text fontSize="10px" color="gray.500" mt="2px">
                  {found.accountStatusLabel} · {found.terminationStatus}
                </Text>
              )}
            </Box>
          </Flex>
        </ModalFormField>
      )}

      {/* THE DECEASED, IN TWO PARTS (user, 2026-09-17: "make it the deceased
          name instead of planholder as endorsed … make it last name and first
          name"). It was one box labelled "Planholder as endorsed", which named
          the wrong person and in a shape the service record could not use: that
          form asks for a Deceased Lastname and a Deceased Firstname, so a
          single string would have had to be guessed apart to fill them. Typed
          apart and carried apart, what goes in here is what the record opens
          with — see `toManualServiceRecord`, where this becomes
          `ServiceRecord.deceased` outright rather than a fallback for when the
          plan number fails to resolve.

          THE LABELS ARE THE RECORD'S LABELS, word for word, because it is the
          same two fields seen twice: keyed here, read there.

          TYPED, AND ONLY TYPED (user, 2026-09-15: "but the declare planholder
          would be manual input"). No suggestion list, no prefill from the plan
          the number resolved to, and `autoComplete` off so the browser does not
          offer one either. This is EVIDENCE — what the franchise wrote on its
          form — and the moment it can be chosen from a list of names on file it
          stops being able to disagree with them, which is the only thing it is
          here to do. */}
      <ModalFormField>
        <FloatingLabelInput
          label="Deceased Lastname"
          autoComplete="off"
          {...register("deceasedLastName", {
            required: "The deceased's last name is required",
            validate: (value) =>
              value.trim().length > 0 || "The deceased's last name is required",
          })}
          errorText={errors.deceasedLastName?.message}
        />
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="Deceased Firstname"
          autoComplete="off"
          {...register("deceasedFirstName", {
            required: "The deceased's first name is required",
            validate: (value) =>
              value.trim().length > 0 || "The deceased's first name is required",
          })}
          errorText={errors.deceasedFirstName?.message}
        />
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="Date of Death"
          type="date"
          {...register("dateOfDeath", { required: "Date of death is required" })}
          errorText={errors.dateOfDeath?.message}
        />
      </ModalFormField>

      <ModalFormField>
        <FloatingLabelInput
          label="Service Date"
          type="date"
          min={fromISO}
          max={toISO}
          {...register("serviceDate", {
            required: "The service date is required",
            validate: (value) =>
              (value >= fromISO && value <= toISO) ||
              `The service date must fall in ${billing?.periodLabel ?? "the billing period"}`,
          })}
          errorText={errors.serviceDate?.message}
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Remarks"
          {...register("remarks")}
        />
      </ModalFormField>
    </ModalForm>
  );
}

export default AddManualServiceDialog;
