"use client";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuFileText,
  LuUser,
  LuUsersRound,
  LuPencil,
  LuMinus,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Mock data — this step is not yet wired to live form state; the      */
/* upstream "New PH Info" step (new-ph-form.tsx) is uncontrolled.      */
/* ------------------------------------------------------------------ */

const PLAN_DETAILS = {
  lpaNumber: "L25031417H",
  planType: "ST. GREGORY",
  mode: "MONTHLY",
  term: "5YEARS",
};

const PLANHOLDER_INFO = {
  lastName: "DELA CRUZ",
  firstName: "JUAN",
  middleName: "GO",
  dateOfBirth: "09/11/1912",
  gender: "MALE",
  civilStatus: "WIDOWED",
  contactNumber: "+63-987-654-3210",
  insurability: "NOT INSURABLE",
  lotNo: "LOT 12-B",
  street: "MAPLE STREET",
  barangay: "SAMPALOC",
  district: "DISTRICT II",
  city: "DASMARINAS",
  province: "CAVITE",
};

interface BeneficiaryInfo {
  name: string;
  relationship: string;
  dateOfBirth: string;
  address: string;
}

const BENEFICIARIES: BeneficiaryInfo[] = [
  {
    name: "LIZ ANN L. RIVAS",
    relationship: "COUSIN",
    dateOfBirth: "11/02/1990",
    address:
      "B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171",
  },
  {
    name: "LIZ ANN L. RIVAS",
    relationship: "COUSIN",
    dateOfBirth: "11/02/1990",
    address:
      "B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171",
  },
];

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

interface TFReviewApplicationPageProps {
  /** Jump back to a wizard step to edit that section. */
  onEditStep?: (step: number) => void;
}

export default function TFReviewApplicationPage({
  onEditStep,
}: TFReviewApplicationPageProps) {
  const handleEdit = (step: number) => onEditStep?.(step);

  return (
    <Flex flexDir="column" gap={4} pb={2}>
      {/* Plan Details — read-only, not part of the active wizard steps */}
      <SectionCard
        icon={LuFileText}
        title="Plan Details"
        description={PLAN_DETAILS.lpaNumber}
        fields={[
          { label: "LPA Number", value: PLAN_DETAILS.lpaNumber },
          { label: "Plan Type", value: PLAN_DETAILS.planType },
          { label: "Mode", value: PLAN_DETAILS.mode },
          { label: "Term", value: PLAN_DETAILS.term },
        ]}
      />

      {/* New Planholder Info */}
      <SectionCard
        icon={LuUser}
        title="New Planholder Info"
        description="Identity, address, and contact details"
        fields={[
          {
            label: "Last Name",
            value: PLANHOLDER_INFO.lastName,
            required: true,
          },
          {
            label: "First Name",
            value: PLANHOLDER_INFO.firstName,
            required: true,
          },
          { label: "Middle Name", value: PLANHOLDER_INFO.middleName },
          {
            label: "Date of Birth",
            value: PLANHOLDER_INFO.dateOfBirth,
            required: true,
          },
          { label: "Gender", value: PLANHOLDER_INFO.gender, required: true },
          {
            label: "Civil Status",
            value: PLANHOLDER_INFO.civilStatus,
            required: true,
          },
          {
            label: "Contact Number",
            value: PLANHOLDER_INFO.contactNumber,
            required: true,
          },
          { label: "Insurability", value: PLANHOLDER_INFO.insurability },
          { label: "Lot No.", value: PLANHOLDER_INFO.lotNo },
          { label: "Street", value: PLANHOLDER_INFO.street },
          {
            label: "Barangay",
            value: PLANHOLDER_INFO.barangay,
            required: true,
          },
          { label: "District", value: PLANHOLDER_INFO.district },
          { label: "City", value: PLANHOLDER_INFO.city, required: true },
          {
            label: "Province",
            value: PLANHOLDER_INFO.province,
            required: true,
          },
        ]}
        onEdit={() => handleEdit(1)}
      />

      {/* Beneficiaries */}
      {BENEFICIARIES.length === 0 ? (
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
          No beneficiaries have been added.
        </Box>
      ) : (
        BENEFICIARIES.map((beneficiary, index) => (
          <SectionCard
            key={`${beneficiary.name}-${index}`}
            icon={LuUsersRound}
            title={beneficiary.name || `Beneficiary ${index + 1}`}
            description={beneficiary.relationship || "Beneficiary"}
            fields={[
              { label: "Name", value: beneficiary.name, required: true },
              {
                label: "Relationship",
                value: beneficiary.relationship,
                required: true,
              },
              {
                label: "Date of Birth",
                value: beneficiary.dateOfBirth,
                required: true,
              },
              {
                label: "Address",
                value: beneficiary.address,
                required: true,
              },
            ]}
            onEdit={() => handleEdit(1)}
          />
        ))
      )}
    </Flex>
  );
}
