"use client";

import { Box, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuUser,
  LuPhone,
  LuMapPin,
  LuBuilding2,
  LuPencil,
  LuMinus,
  LuCircleCheck,
  LuTriangleAlert,
  LuBadgeCheck,
  LuSparkles,
} from "react-icons/lu";
import { useApplicationOptional } from "@/app/(bpis)/sales-force/new/application/application-context";
import type { FieldKey } from "@/app/(bpis)/sales-force/new/application/types";

const PRIMARY = "var(--chakra-colors-primary)";
const AMBER = "#D97706";

/* ------------------------------------------------------------------ */
/* Data model                                                          */
/* ------------------------------------------------------------------ */

interface SummaryField {
  /** Canonical store key this field reads from. */
  key: FieldKey;
  label: string;
  value?: string | null;
  /** Whether the current value was AI-filled and left untouched. */
  aiFilled?: boolean;
  /** Optional fields render as "Not provided" instead of blocking submit. */
  required?: boolean;
}

interface SummarySection {
  id: string;
  /** Wizard step index this section maps back to for editing. */
  step: number;
  icon: IconType;
  title: string;
  description: string;
  fields: SummaryField[];
}

type SectionState = "complete" | "required-missing";

interface SectionBlueprint {
  id: string;
  step: number;
  icon: IconType;
  title: string;
  description: string;
  fields: Array<Pick<SummaryField, "key" | "label" | "required">>;
}

/**
 * Section blueprint — labels, step mapping, and required flags. Values are
 * hydrated live from the application store (see `useSummarySections`), so the
 * summary always reflects what the applicant actually entered / the AI filled.
 * `step` accounts for the new Document Upload step at index 0.
 */
const SECTION_BLUEPRINT: SectionBlueprint[] = [
  {
    id: "personal",
    step: 1,
    icon: LuUser,
    title: "Personal Information",
    description: "Basic identity and demographics",
    fields: [
      { key: "lastName", label: "Last Name", required: true },
      { key: "firstName", label: "First Name", required: true },
      { key: "middleName", label: "Middle Name" },
      { key: "suffix", label: "Suffix" },
      { key: "dateOfBirth", label: "Date of Birth", required: true },
      { key: "placeOfBirth", label: "Place of Birth", required: true },
      { key: "sex", label: "Sex", required: true },
      { key: "civilStatus", label: "Civil Status", required: true },
      { key: "nationality", label: "Nationality", required: true },
      { key: "idType", label: "ID Type" },
      { key: "idNumber", label: "ID Number" },
    ],
  },
  {
    id: "contact",
    step: 2,
    icon: LuPhone,
    title: "Contact Information",
    description: "Phone and email",
    fields: [
      { key: "mobileNumber", label: "Mobile", required: true },
      { key: "landlineNumber", label: "Landline" },
      { key: "email", label: "Email", required: true },
    ],
  },
  {
    id: "address",
    step: 2,
    icon: LuMapPin,
    title: "Address",
    description: "Residential details",
    fields: [
      { key: "street", label: "Street", required: true },
      { key: "barangay", label: "Barangay", required: true },
      { key: "district", label: "District" },
      { key: "city", label: "City", required: true },
      { key: "province", label: "Province", required: true },
      { key: "zipCode", label: "Zip Code", required: true },
    ],
  },
  {
    id: "employment",
    step: 3,
    icon: LuBuilding2,
    title: "Employment",
    description: "Work details and government IDs",
    fields: [
      { key: "employer", label: "Employer", required: true },
      { key: "position", label: "Position", required: true },
      { key: "hireDate", label: "Hire Date", required: true },
      { key: "nbiNumber", label: "NBI" },
      { key: "tinNumber", label: "TIN" },
      { key: "sssNumber", label: "SSS" },
    ],
  },
];

const isEmpty = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toUpperCase() === "N/A";
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
        <Flex
          align="center"
          gap={1.5}
          justify={{ base: "flex-end", md: "flex-start" }}
          flexShrink={0}
          minW={0}
        >
          <Text
            fontWeight="semibold"
            color="gray.900"
            textAlign={{ base: "right", md: "left" }}
            whiteSpace={{ base: "nowrap", md: "normal" }}
            lineHeight={{ md: "1.35" }}
          >
            {field.value}
          </Text>
          {field.aiFilled && (
            <Flex
              align="center"
              gap={0.5}
              px={1}
              py="1px"
              borderRadius="full"
              bg="#DCFCE7"
              color="#15803D"
              fontSize="9px"
              fontWeight={700}
              flexShrink={0}
              title="Filled by AI from your documents"
            >
              <LuSparkles size={9} />
              AI
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};

const ProgressRing = ({
  value,
  color,
  size = 72,
  stroke = 6,
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <Box
      position="relative"
      flexShrink={0}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--chakra-colors-gray-100)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        align="center"
        justify="center"
      >
        <Text fontSize="md" fontWeight="bold" color="gray.900" lineHeight="1">
          {value}%
        </Text>
      </Flex>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Composite pieces                                                    */
/* ------------------------------------------------------------------ */

const SectionChip = ({
  section,
  onEdit,
}: {
  section: SummarySection;
  onEdit: (step: number) => void;
}) => {
  const needsAction = getSectionState(section.fields) === "required-missing";
  const ChipIcon = needsAction ? LuTriangleAlert : section.icon;
  return (
    <Flex
      as="button"
      align="center"
      gap={2.5}
      p={2.5}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      bg="gray.50"
      cursor="pointer"
      textAlign="left"
      transition="all 0.15s ease"
      _hover={{ bg: "white", borderColor: "gray.300", shadow: "sm" }}
      onClick={() => onEdit(section.step)}
      minW={0}
    >
      <Flex
        align="center"
        justify="center"
        boxSize={7}
        borderRadius="full"
        bg={needsAction ? "red.50" : "gray.100"}
        color={needsAction ? "red.600" : "gray.600"}
        flexShrink={0}
      >
        <Box as={ChipIcon} boxSize="15px" />
      </Flex>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color="gray.900"
        truncate
        minW={0}
      >
        {section.title}
      </Text>
    </Flex>
  );
};

const SectionCard = ({
  section,
  onEdit,
}: {
  section: SummarySection;
  onEdit: (step: number) => void;
}) => {
  const state = getSectionState(section.fields);
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
            <Box as={section.icon} boxSize="18px" />
          </Flex>
          <Box minW={0}>
            <Text
              fontSize="md"
              fontWeight="semibold"
              color="gray.900"
              lineHeight="1.2"
            >
              {section.title}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {section.description}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={2} flexShrink={0}>
          <StatusPill state={state} />
          <EditButton onClick={() => onEdit(section.step)} />
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
          {section.fields.map((field) => (
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

interface AgentSummaryProps {
  /** Jump back to a wizard step to edit that section. */
  onEditStep?: (step: number) => void;
}

/**
 * Hydrate the section blueprint with live values from the application store.
 * Falls back to empty values when rendered outside the flow's provider.
 */
const useSummarySections = (): SummarySection[] => {
  const app = useApplicationOptional();
  return SECTION_BLUEPRINT.map((section) => ({
    ...section,
    fields: section.fields.map((f) => {
      const state = app?.fields[f.key];
      return {
        ...f,
        value: state?.value ?? "",
        aiFilled: !!state?.aiFilled && !!state?.value,
      };
    }),
  }));
};

const AgentSummary = ({ onEditStep }: AgentSummaryProps) => {
  const handleEdit = (step: number) => onEditStep?.(step);
  const sections = useSummarySections();

  return (
    <Flex flexDir="column" gap={4} pb={2}>
      {/* Section detail cards */}
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} onEdit={handleEdit} />
      ))}
    </Flex>
  );
};

export default AgentSummary;
