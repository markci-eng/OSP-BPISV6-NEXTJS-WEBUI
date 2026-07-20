"use client";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuUser,
  LuFileText,
  LuUsers,
  LuPencil,
  LuMinus,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";

import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";

import { ClaimInfoState, PayeeInfo, composePayeeName } from "./claims.types";

/* ------------------------------------------------------------------ */
/* Data model                                                          */
/* ------------------------------------------------------------------ */

interface SummaryField {
  label: string;
  value?: string | null;
  required?: boolean;
}

type SectionState = "complete" | "required-missing";

const isEmpty = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "—";
};

const getSectionState = (fields: SummaryField[]): SectionState => {
  // A section is complete once all required fields are filled — missing
  // optional fields are surfaced inline as "Not provided", not as a badge.
  if (fields.some((f) => f.required && isEmpty(f.value)))
    return "required-missing";
  return "complete";
};

const STATE_META: Record<
  SectionState,
  { label: string; Icon: IconType; fg: string; bg: string; border: string }
> = {
  complete: {
    label: "Complete",
    Icon: LuCircleCheck,
    fg: "green.600",
    bg: "green.50",
    border: "green.200",
  },
  "required-missing": {
    label: "Action needed",
    Icon: LuTriangleAlert,
    fg: "red.600",
    bg: "red.50",
    border: "red.200",
  },
};

const composePlanholderName = (p?: PlanholderInfoType): string => {
  if (!p) return "—";
  return (
    [p.firstName, p.middleName, p.lastName, p.suffix]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
};

const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const StatusPill = ({ state }: { state: SectionState }) => {
  // Only surface a badge when a section needs attention — a complete
  // section shows nothing.
  if (state === "complete") return null;
  const meta = STATE_META[state];
  return (
    <Flex
      align="center"
      gap={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg={meta.bg}
      color={meta.fg}
      borderWidth="1px"
      borderColor={meta.border}
      fontSize="xs"
      fontWeight="semibold"
      whiteSpace="nowrap"
      flexShrink={0}
    >
      <Box as={meta.Icon} boxSize="13px" />
      {meta.label}
    </Flex>
  );
};

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <Flex
    as="button"
    align="center"
    gap={1.5}
    px={3}
    py={1.5}
    borderRadius="lg"
    borderWidth="1px"
    borderColor="gray.200"
    bg="white"
    color="gray.700"
    fontSize="sm"
    fontWeight="medium"
    cursor="pointer"
    transition="all 0.15s ease"
    _hover={{ bg: "gray.50", borderColor: "gray.300", color: "gray.900" }}
    flexShrink={0}
    onClick={onClick}
  >
    <Box as={LuPencil} boxSize="13px" />
    Edit
  </Flex>
);

const FieldCell = ({ field }: { field: SummaryField }) => {
  const empty = isEmpty(field.value);
  return (
    <Flex
      fontSize="sm"
      py={{ base: 1.5, md: 0 }}
      // Mobile: RowItem-style row (label · dashed leader · value).
      // Desktop: stacked label above value.
      direction={{ base: "row", md: "column" }}
      align={{ base: "center", md: "stretch" }}
      gap={{ base: 0, md: 0.5 }}
      minW={0}
    >
      {/* LABEL */}
      <Text
        color="gray.500"
        whiteSpace="nowrap"
        fontSize={{ base: "sm", md: "xs" }}
        fontWeight={{ base: "normal", md: "medium" }}
        letterSpacing={{ md: "0.01em" }}
      >
        {field.label}
      </Text>

      {/* DASHED LEADER — mobile only */}
      <Box
        display={{ base: "block", md: "none" }}
        flex="1"
        mx={3}
        borderBottom="1px dashed"
        borderColor="gray.300"
        transform="translateY(2px)"
      />

      {/* VALUE */}
      {empty ? (
        <Flex align="center" gap={1} color="gray.400" flexShrink={0}>
          <Box as={LuMinus} boxSize="13px" />
          <Text fontStyle="italic" whiteSpace="nowrap">
            Not provided
          </Text>
        </Flex>
      ) : (
        <Text
          fontWeight="semibold"
          color="gray.900"
          textAlign={{ base: "right", md: "left" }}
          whiteSpace={{ base: "nowrap", md: "normal" }}
          lineHeight={{ md: "1.35" }}
        >
          {field.value}
        </Text>
      )}
    </Flex>
  );
};

/* ------------------------------------------------------------------ */
/* Composite pieces                                                    */
/* ------------------------------------------------------------------ */

interface SectionCardProps {
  icon: IconType;
  title: string;
  description: string;
  fields: SummaryField[];
  onEdit?: () => void;
}

const SectionCard = ({
  icon,
  title,
  description,
  fields,
  onEdit,
}: SectionCardProps) => {
  const state = getSectionState(fields);
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      shadow="xs"
      overflow="hidden"
    >
      {/* Header */}
      <Flex
        align="flex-start"
        justify="space-between"
        gap={3}
        flexWrap="wrap"
        px={{ base: 4, md: 5 }}
        py={4}
      >
        <Flex align="center" gap={3} minW={0} flex="1 1 auto">
          <Flex
            align="center"
            justify="center"
            boxSize={9}
            borderRadius="lg"
            bg="gray.100"
            color="gray.700"
            flexShrink={0}
          >
            <Box as={icon} boxSize="18px" />
          </Flex>
          <Box minW={0}>
            <Text
              fontSize="md"
              fontWeight="semibold"
              color="gray.900"
              lineHeight="1.2"
            >
              {title}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {description}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={2} flexShrink={0}>
          <StatusPill state={state} />
          {onEdit && <EditButton onClick={onEdit} />}
        </Flex>
      </Flex>

      {/* Definition grid */}
      <Box
        px={{ base: 4, md: 5 }}
        py={4}
        borderTopWidth="1px"
        borderColor="gray.100"
        bg="white"
      >
        <SimpleGrid
          columns={{ base: 1, md: 4 }}
          columnGap={6}
          rowGap={{ base: 0.5, md: 4 }}
        >
          {fields.map((field) => (
            <FieldCell key={field.label} field={field} />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface ClaimFormSummaryProps {
  planholder?: PlanholderInfoType;
  claimInfo: ClaimInfoState;
  payees: PayeeInfo[];
  /** Jump back to a wizard step to edit that section. */
  onEditStep?: (step: number) => void;
}

const ClaimFormSummary = ({
  planholder,
  claimInfo,
  payees,
  onEditStep,
}: ClaimFormSummaryProps) => {
  const handleEdit = (step: number) => onEditStep?.(step);

  const planholderFields: SummaryField[] = [
    { label: "LPA Number", value: planholder?.lpaNumber },
    { label: "Full Name", value: composePlanholderName(planholder) },
    {
      label: "Date of Birth",
      value: formatDate(planholder?.dateOfBirth?.toDateString()),
    },
    { label: "Gender", value: planholder?.gender },
    { label: "Civil Status", value: planholder?.civilStatus },
    { label: "Nationality", value: planholder?.nationality },
  ];

  const claimFields: SummaryField[] = [
    {
      label: "Incident Date",
      value: formatDate(claimInfo.incidentDate),
      required: true,
    },
    { label: "Incident Type", value: claimInfo.incidentType, required: true },
    { label: "Claim Type", value: claimInfo.claimType, required: true },
  ];

  const payeeFields = (payee: PayeeInfo): SummaryField[] => [
    { label: "Relationship", value: payee.relToPh, required: true },
    { label: "Email", value: payee.email },
    { label: "Contact Number", value: payee.contactNumber, required: true },
    { label: "Payout Channel", value: payee.channel, required: true },
    { label: "Bank Name", value: payee.bankName },
    { label: "Account Name", value: payee.accountName },
    { label: "Account No.", value: payee.accountNo },
  ];

  return (
    <Flex flexDir="column" gap={4} pb={2} pt={3}>
      {/* Planholder — reference only, not part of this wizard's steps */}
      <SectionCard
        icon={LuUser}
        title="Planholder Information"
        description={planholder?.lpaNumber ?? "Reference plan"}
        fields={planholderFields}
      />

      {/* Claim Info */}
      <SectionCard
        icon={LuFileText}
        title="Claim Information"
        description="Incident and claim type details"
        fields={claimFields}
        onEdit={() => handleEdit(0)}
      />

      {/* Claimants */}
      {payees.length === 0 ? (
        <Box
          p={6}
          borderRadius="2xl"
          borderWidth={1}
          borderStyle="dashed"
          borderColor="gray.200"
          textAlign="center"
          color="gray.500"
          fontSize="sm"
        >
          No claimants have been added.
        </Box>
      ) : (
        payees.map((payee, index) => {
          const name = composePayeeName(payee);
          return (
            <SectionCard
              key={payee.id}
              icon={LuUsers}
              title={name !== "—" ? name : `Claimant ${index + 1}`}
              description={payee.relToPh || "Claimant"}
              fields={payeeFields(payee)}
              onEdit={() => handleEdit(1)}
            />
          );
        })
      )}
    </Flex>
  );
};

export default ClaimFormSummary;
