"use client";

import type { ReactNode } from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuUserPen,
  LuMapPin,
  LuPhone,
  LuFileText,
  LuPencil,
  LuMinus,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";

/* ------------------------------------------------------------------ */
/* Data model                                                          */
/* ------------------------------------------------------------------ */

interface SummaryField {
  label: string;
  value?: string | null;
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

const isEmpty = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toUpperCase() === "N/A";
};

const getSectionState = (fields: SummaryField[]): SectionState => {
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
          flexShrink={0}
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

const SectionCard = ({
  icon,
  title,
  description,
  state,
  onEdit,
  fields,
  children,
}: {
  icon: IconType;
  title: string;
  description: string;
  state: SectionState;
  onEdit?: () => void;
  fields?: SummaryField[];
  children?: ReactNode;
}) => (
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

    {/* Body */}
    <Box
      px={{ base: 4, md: 5 }}
      py={4}
      borderTopWidth="1px"
      borderColor="gray.100"
      bg="white"
    >
      {fields ? (
        <SimpleGrid
          columns={{ base: 1, md: 4 }}
          columnGap={6}
          rowGap={{ base: 0.5, md: 4 }}
        >
          {fields.map((field) => (
            <FieldCell key={field.label} field={field} />
          ))}
        </SimpleGrid>
      ) : (
        children
      )}
    </Box>
  </Box>
);

const DocumentRow = ({ doc }: { doc: UploadedFile }) => (
  <Flex align="center" gap={3} py={2}>
    <Flex
      align="center"
      justify="center"
      boxSize={7}
      borderRadius="full"
      bg="gray.100"
      color="gray.600"
      flexShrink={0}
    >
      <Box as={LuFileText} boxSize="14px" />
    </Flex>
    <Text
      fontSize="sm"
      fontWeight="medium"
      color="gray.900"
      truncate
      minW={0}
      flex="1 1 auto"
    >
      {doc.file.name}
    </Text>
    <Text fontSize="xs" color="gray.400" flexShrink={0}>
      {(doc.file.size / 1024).toFixed(1)} KB
    </Text>
  </Flex>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface EditPlanholderReviewProps {
  planholder: SalesAgent;
  selectedDocuments: UploadedFile[];
  /** Jump back to a wizard step to edit that section. */
  onEditStep?: (step: number) => void;
}

export default function EditPlanholderReview({
  planholder,
  selectedDocuments,
  onEditStep,
}: EditPlanholderReviewProps) {
  const sections: SummarySection[] = [
    {
      id: "personal",
      step: 1,
      icon: LuUserPen,
      title: "Personal Information",
      description: "Basic identity and demographics",
      fields: [
        { label: "Last Name", value: planholder.lastName, required: true },
        { label: "First Name", value: planholder.firstName, required: true },
        { label: "Middle Name", value: planholder.middleName },
        { label: "Suffix", value: planholder.suffix },
        { label: "Gender", value: planholder.gender, required: true },
        {
          label: "Date of Birth",
          value: planholder.birthDate,
          required: true,
        },
        {
          label: "Place of Birth",
          value: planholder.placeOfBirth,
          required: true,
        },
        {
          label: "Civil Status",
          value: planholder.civilStatus,
          required: true,
        },
        {
          label: "Nationality",
          value: planholder.nationality,
          required: true,
        },
        { label: "Naturalization Date", value: planholder.naturalizationDate },
        { label: "Height", value: planholder.height, required: true },
        { label: "Weight", value: planholder.weight, required: true },
      ],
    },
    {
      id: "address",
      step: 1,
      icon: LuMapPin,
      title: "Address",
      description: "Residential details",
      fields: [
        { label: "Lot/Bldg/Unit No.", value: planholder.address?.unit },
        {
          label: "Street",
          value: planholder.address?.street,
          required: true,
        },
        {
          label: "Barangay",
          value: planholder.address?.barangay,
          required: true,
        },
        { label: "District", value: planholder.address?.district },
        { label: "City", value: planholder.address?.city, required: true },
        {
          label: "Province",
          value: planholder.address?.province,
          required: true,
        },
        {
          label: "Zip Code",
          value: planholder.address?.zipCode,
          required: true,
        },
      ],
    },
    {
      id: "contact",
      step: 1,
      icon: LuPhone,
      title: "Contact Information",
      description: "Phone and email",
      fields: [
        { label: "Email", value: planholder.email, required: true },
        { label: "Mobile Number", value: planholder.mobile, required: true },
        { label: "Landline Number", value: planholder.landline },
      ],
    },
  ];

  const documentsState: SectionState =
    selectedDocuments.length === 0 ? "required-missing" : "complete";

  return (
    <Flex direction="column" gap={4} pb={2}>
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          icon={section.icon}
          title={section.title}
          description={section.description}
          state={getSectionState(section.fields)}
          onEdit={onEditStep ? () => onEditStep(section.step) : undefined}
          fields={section.fields}
        />
      ))}

      <SectionCard
        icon={LuFileText}
        title="Attached Documents"
        description="Files submitted for this request"
        state={documentsState}
        onEdit={onEditStep ? () => onEditStep(0) : undefined}
      >
        {selectedDocuments.length === 0 ? (
          <Flex align="center" gap={2} color="gray.400" fontSize="sm">
            <Box as={LuMinus} boxSize="13px" />
            <Text fontStyle="italic">No documents uploaded.</Text>
          </Flex>
        ) : (
          <Flex direction="column" divideY="1px" divideColor="gray.100">
            {selectedDocuments.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </Flex>
        )}
      </SectionCard>
    </Flex>
  );
}
