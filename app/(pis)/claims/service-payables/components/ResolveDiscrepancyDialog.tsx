"use client";

// Putting a discrepancy right.
//
// NOTHING CALLS THIS, and that is a waiting state rather than dead code
// (user-confirmed 2026-08-25). A discrepancy is corrected in a module that has
// not been built; this workspace's job is to READ one and SEND it to the branch
// — see `RecordActions` and `DiscrepancyDrawer`. Its button was removed because
// recording a fix here let a processor mark an unfixed account fixed, and the
// billing took the plan back on that word.
//
// What it waits for is that module. The shape is already right for it: the note,
// the required audit trail, and the two outcomes below. `resolveDiscrepancy` in
// `service-payables-store` is the write it makes, kept for the same reason —
// exactly as `complyDeficiency` and the manual-franchise machinery are.
//
// UNTIL THEN THE SUPPLEMENTARY QUEUE IS EMPTY. `getSupplementaryItems` reads
// corrections made after endorsement, and no correction can be recorded, so
// there are none. That is honest: what a supplementary billing pays is undecided
// anyway.
//
// A discrepancy is not answered by attaching a file — that is a deficiency, and
// it has its own dialog. It is answered by SOMETHING BEING CORRECTED somewhere
// else: the plan holder's name amended on the plan, the ROP reversed, the
// account settled. None of that happens on this screen, and none of it happens
// in this data layer. What happens here is the processor recording that it HAS
// happened, and the payable moving on the strength of it.
//
// WHICH IS WHY THE NOTE IS REQUIRED. A cleared discrepancy with nothing written
// against it is a plan that was blocked and then silently was not, and the next
// person to look at the billing has no way to find out why. The note is the
// audit trail this stand-in can actually keep.
//
// WHERE THE SERVICE GOES NEXT is decided by the BILLING, not by this form, and
// the dialog says which it will be before the user commits — because the two
// outcomes are genuinely different work for them:
//
//   not yet endorsed  the plan is terminated into the billing it was always on,
//                     and nothing else happens.
//   endorsed          the billing has gone to accounting and cannot be reopened,
//                     so the plan is billed supplementarily instead.
//
// See `correctionRouteFor`.

import { useEffect } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { LuTriangleAlert } from "react-icons/lu";
import { FloatingLabelInput, ModalForm, ModalFormField } from "osp-ui-kit";
import {
  DISCREPANCY_KIND_LABELS,
  correctionRouteFor,
  deceasedName,
  type ServiceBilling,
  type ServiceRecord,
} from "../service-payables-data";

/** The red every held service in this module is drawn in. */
const DEFICIENCY_ACCENT = "#e11d48";

interface ResolveDiscrepancyForm {
  note: string;
}

export interface ResolveDiscrepancyDialogProps {
  service: ServiceRecord;
  billing: ServiceBilling;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: string) => void;
}

export function ResolveDiscrepancyDialog({
  service,
  billing,
  open,
  onOpenChange,
  onSubmit,
}: ResolveDiscrepancyDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveDiscrepancyForm>({ defaultValues: { note: "" } });

  // A fresh form each time it opens — see the same note in
  // `CreateBillingDialog`; it is also what lets this stay mounted between
  // openings rather than being conditionally rendered.
  useEffect(() => {
    if (open) reset({ note: "" });
  }, [open, reset]);

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

  const submit = handleSubmit((values) => {
    onSubmit(values.note.trim());
    onOpenChange(false);
  });

  const discrepancy = service.discrepancy;
  const supplementary = correctionRouteFor(billing) === "supplementary";

  return (
    <ModalForm
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      title="Resolve Discrepancy"
      description={`${service.lpaNo} · ${deceasedName(service)}`}
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row-reverse" }}
        >
          <Button type="button" onClick={submit} w={{ base: "full", sm: "auto" }}>
            Resolve
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
      {/* What is being cleared, in full, above the field that clears it. The
          reason is a sentence the processor has to have acted on somewhere else
          before they are entitled to be here, so it is stated rather than
          assumed to be remembered from the row they clicked. */}
      {discrepancy && (
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
            <Box color={DEFICIENCY_ACCENT} flexShrink={0} mt="2px">
              <LuTriangleAlert size={14} />
            </Box>
            <Box minW={0}>
              <Text fontSize="11px" fontWeight="700" color="gray.800">
                {DISCREPANCY_KIND_LABELS[discrepancy.kind]}
              </Text>
              <Text fontSize="11px" color="gray.600" lineHeight="1.5" mt="2px">
                {discrepancy.reason}
              </Text>
            </Box>
          </Flex>
        </ModalFormField>
      )}

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="What was corrected"
          helperText="Required — the only record of why this plan stopped being held."
          {...register("note", {
            required: "Say what was corrected",
            validate: (value) =>
              value.trim().length > 0 || "Say what was corrected",
          })}
          errorText={errors.note?.message}
        />
      </ModalFormField>

      {/* Said BEFORE the button, not after the action. Which of the two happens
          is not the user's choice and it is not obvious from anything on this
          screen — it depends on whether accounting has the billing. */}
      <ModalFormField fullWidth>
        <Text fontSize="11px" color="gray.500" lineHeight="1.5">
          {supplementary
            ? `${billing.billingNo ?? billing.billingCode} has been endorsed to accounting and cannot be reopened. This plan will be billed supplementarily.`
            : `${billing.billingNo ?? billing.billingCode} has not been endorsed yet, so this plan can be terminated into it as normal.`}
        </Text>
      </ModalFormField>
    </ModalForm>
  );
}

export default ResolveDiscrepancyDialog;
