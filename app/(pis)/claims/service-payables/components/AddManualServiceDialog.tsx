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
// THE NAME IS THE EXCEPTION, and it is the point of the exercise. It is entered
// separately, exactly as the franchise wrote it, because comparing it against
// the plan holder on file is what raises the name discrepancy. Prefilling it
// from the plan would guarantee they matched and quietly delete the one check
// this path exists to make.
//
// NOTHING IS REFUSED HERE. A plan number that resolves to nothing still goes in
// — the franchise sent it, and losing the entry would lose the only record that
// they did. It goes in carrying a DEFICIENCY and not a discrepancy: an account
// nobody can find has not broken a rule, it is a plan holder whose ID has not
// been confirmed, and the answer is to send for the number.

import { useEffect } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { LuInfo } from "react-icons/lu";
import { FloatingLabelInput, ModalForm, ModalFormField } from "osp-ui-kit";
import { db, toFullName } from "../../../data";
import { cutRange, type ServiceBilling } from "../service-payables-data";

export interface ManualServiceSubmission {
  lpaNo: string;
  endorsedName: string;
  serviceDateISO: string;
  dateOfDeathISO: string;
  remarks: string;
}

interface ManualServiceForm {
  lpaNo: string;
  endorsedName: string;
  serviceDate: string;
  dateOfDeath: string;
  remarks: string;
}

export interface AddManualServiceDialogProps {
  billing: ServiceBilling;
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
  const { fromISO, toISO } = cutRange(billing.period);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ManualServiceForm>({
    defaultValues: {
      lpaNo: "",
      endorsedName: "",
      serviceDate: fromISO,
      dateOfDeath: fromISO,
      remarks: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        lpaNo: "",
        endorsedName: "",
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

  const submit = handleSubmit((values) => {
    onSubmit({
      lpaNo: values.lpaNo.trim().toUpperCase(),
      endorsedName: values.endorsedName.trim(),
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
      description={`${billing.chapelDesc} · ${billing.periodLabel}`}
      footer={
        <Flex
          w="full"
          gap={3}
          gridColumn={{ base: "span 2", sm: "span 1" }}
          direction={{ base: "column", sm: "row-reverse" }}
        >
          <Button type="button" onClick={submit} w={{ base: "full", sm: "auto" }}>
            Add
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
      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="LPA Number"
          helperText="From the franchise's paperwork. Everything else about the plan is read from it."
          {...register("lpaNo", {
            required: "The plan number is required",
            validate: (value) =>
              value.trim().length > 0 || "The plan number is required",
          })}
          errorText={errors.lpaNo?.message}
        />
      </ModalFormField>

      {/* The lookup's answer, either way. A number that finds nothing is not an
          error here — it is a discrepancy, and the row goes in carrying it —
          so this reports rather than blocks. */}
      {lpaNo.length > 0 && (
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

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Planholder as endorsed"
          helperText="Exactly as the franchise wrote it — a mismatch is what raises the discrepancy."
          {...register("endorsedName", {
            required: "The endorsed name is required",
            validate: (value) =>
              value.trim().length > 0 || "The endorsed name is required",
          })}
          errorText={errors.endorsedName?.message}
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
          helperText={`Within ${billing.periodLabel}`}
          {...register("serviceDate", {
            required: "The service date is required",
            validate: (value) =>
              (value >= fromISO && value <= toISO) ||
              `The service date must fall in ${billing.periodLabel}`,
          })}
          errorText={errors.serviceDate?.message}
        />
      </ModalFormField>

      <ModalFormField fullWidth>
        <FloatingLabelInput
          label="Remarks"
          helperText="Optional — what the franchise submitted, and anything odd about it."
          {...register("remarks")}
        />
      </ModalFormField>
    </ModalForm>
  );
}

export default AddManualServiceDialog;
