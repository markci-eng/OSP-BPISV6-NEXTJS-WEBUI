"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Field,
  Flex,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { FloatingLabelInput } from "osp-ui-kit";
import { CLAIM_STATUS_LABELS, type ClaimPhase } from "@/app/(pis)/data";
import {
  FloatingLabelDate,
  FloatingLabelSelect,
} from "../../components/floating-fields";
import {
  editClaim,
  EDITABLE_CLAIM_FIELDS,
  type ClaimEditValues,
  type EditableClaimField,
} from "../../claim-store";
import type { ClaimRequest } from "../../claims-data";

/** Claim status options, in the order the status codes are defined. */
const STATUS_OPTIONS = Object.values(CLAIM_STATUS_LABELS).map((phase) => ({
  label: phase,
  value: phase,
}));

/** The fields the form compares, so only real changes are written. */
const FIELDS = Object.keys(EDITABLE_CLAIM_FIELDS) as EditableClaimField[];

/** The claim's current values, as the form holds them. */
function valuesOf(claim: ClaimRequest): ClaimEditValues {
  return {
    causeOfDeath: claim.causeOfIncident ?? "",
    dateOfDeathISO: claim.dateOfDeathISO ?? "",
    dateReceivedISO: claim.dateReceivedISO ?? "",
    statusLabel: claim.phase,
  };
}

interface PlanholderClaimEditDrawerProps {
  /** The claim being corrected. `null` keeps the sheet closed. */
  claim?: ClaimRequest | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Edit a filed claim.
 *
 * Only four fields can be changed here — the details a branch commonly gets
 * wrong on the paperwork, plus the status, which is how a claim is moved by
 * hand. Everything else on the claim is an identifier, derived from the plan
 * (contestability, age at death, nature of claim) or worked out on the create
 * form, so it is not the processor's to retype.
 *
 * Saving writes a remark naming what changed — see `editClaim`.
 */
export function PlanholderClaimEditDrawer({
  claim,
  open,
  onClose,
}: PlanholderClaimEditDrawerProps) {
  const { control, handleSubmit, reset } = useForm<ClaimEditValues>({
    defaultValues: claim ? valuesOf(claim) : undefined,
  });

  // Re-seed whenever the sheet is opened, so it always starts from what the
  // claim says now — including a correction made earlier in the session.
  useEffect(() => {
    if (open && claim) reset(valuesOf(claim));
  }, [open, claim, reset]);

  const onSubmit = (values: ClaimEditValues) => {
    if (!claim) return;

    const current = valuesOf(claim);
    const changed = FIELDS.filter((f) => values[f] !== current[f]);

    if (changed.length === 0) {
      toast.info("Nothing to save", {
        description: "No details were changed.",
      });
      onClose();
      return;
    }

    editClaim(claim.reference, values, changed);
    onClose();
    toast.success("Claim updated", {
      description: `${changed
        .map((f) => EDITABLE_CLAIM_FIELDS[f])
        .join(", ")} — recorded in the claim's remarks.`,
    });
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
            roundedTop="2xl"
            maxH="85vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Box pt={3} pb={1} display="flex" justifyContent="center">
              <Box
                w="36px"
                h="4px"
                bg="gray.300"
                borderRadius="full"
                opacity={0.7}
              />
            </Box>
            <Drawer.Header
              pt={2}
              pb={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box minW={0}>
                <Drawer.Title>
                  <Text fontWeight="bold" color={BRAND_COLORS.darkGreen}>
                    Edit Claim
                  </Text>
                </Drawer.Title>
                <Text fontSize="xs" color="gray.500" truncate>
                  {claim ? (claim.claimNo ?? claim.reference) : ""}
                </Text>
              </Box>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body pb={6} pt={5} overflowY="auto">
              <form id="edit-claim-form" onSubmit={handleSubmit(onSubmit)}>
                {/* Ordered as they read in Claim Details, so the form mirrors
                    the panel it is correcting. */}
                <VStack align="stretch" gap={5}>
                  <Field.Root>
                    <Controller
                      control={control}
                      name="statusLabel"
                      render={({ field }) => (
                        <FloatingLabelSelect
                          label="Claim Status"
                          items={STATUS_OPTIONS}
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange((v ?? field.value) as ClaimPhase)
                          }
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Controller
                      control={control}
                      name="dateReceivedISO"
                      render={({ field }) => (
                        <FloatingLabelDate
                          label="Date Received"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Controller
                      control={control}
                      name="dateOfDeathISO"
                      render={({ field }) => (
                        <FloatingLabelDate
                          label="Date of Death"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Controller
                      control={control}
                      name="causeOfDeath"
                      render={({ field }) => (
                        <FloatingLabelInput
                          label="Cause of Death"
                          value={field.value}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </Field.Root>
                </VStack>
              </form>
            </Drawer.Body>

            <Drawer.Footer
              borderTopWidth="1px"
              borderColor="gray.100"
              pt={3}
              pb={4}
            >
              <Flex gap={3} w="full" justify="flex-end">
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
                  form="edit-claim-form"
                  borderRadius="full"
                  bg={BRAND_COLORS.primaryGreen}
                  color="white"
                  _hover={{ bg: BRAND_COLORS.darkGreen }}
                >
                  Save Changes
                </Button>
              </Flex>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderClaimEditDrawer;
