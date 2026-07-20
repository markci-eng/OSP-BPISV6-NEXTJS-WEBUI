"use client";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuBriefcase,
  LuFileText,
  LuHouse,
  LuUser,
  LuWallet,
  LuPencil,
  LuMinus,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";

import {
  computeAmortizationSchedule,
  formatLoanCurrency,
  initialLoanApplicantInfo,
  LoanAddressInfo,
  LoanApplicantInfo,
} from "./loan-application";
import { LoanRecord } from "./loan-select-plan";

const MOCK_SELECTED_PLANS: LoanRecord[] = [
  {
    lpaNo: "L12345678G",
    planType: "ST. DOROTHY",
    status: "Fully Paid",
    terminationStatus: "Not Yet Terminated",
    indicativeLoanAmount: 24800,
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

const formatAddress = (address: LoanAddressInfo): string => {
  const parts = [
    address.number,
    address.street,
    address.barangay,
    address.district,
    address.city,
    address.province,
    address.zip,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
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

interface LoanApplicationPageProps {
  applicantInfo?: LoanApplicantInfo;
  selectedPlans?: LoanRecord[];
  /** Jump back to a wizard step to edit that section. */
  onEditStep?: (step: number) => void;
}

export default function LoanApplicationPage({
  applicantInfo = initialLoanApplicantInfo,
  selectedPlans = MOCK_SELECTED_PLANS,
  onEditStep,
}: LoanApplicationPageProps) {
  const handleEdit = (step: number) => onEditStep?.(step);

  const totalIndicativeLoanAmount = selectedPlans.reduce(
    (sum, plan) => sum + plan.indicativeLoanAmount,
    0,
  );
  const amortizationSchedule = computeAmortizationSchedule(
    totalIndicativeLoanAmount,
    Number(applicantInfo.loanTerm),
  );
  const monthlyAmortization = amortizationSchedule[0]?.amortization ?? 0;

  const fullName =
    [
      applicantInfo.fullName.firstName,
      applicantInfo.fullName.middleName,
      applicantInfo.fullName.lastName,
      applicantInfo.fullName.suffix,
    ]
      .filter(Boolean)
      .join(" ") || "—";

  const loanFields: SummaryField[] = [
    {
      label: "Indicative Loan Amount",
      value: formatLoanCurrency(totalIndicativeLoanAmount),
      required: true,
    },
    {
      label: "Loan Term",
      value: applicantInfo.loanTerm ? `${applicantInfo.loanTerm} Months` : "—",
      required: true,
    },
    {
      label: "Monthly Amortization",
      value: formatLoanCurrency(monthlyAmortization),
    },
  ];

  const personalFields: SummaryField[] = [
    { label: "Full Name", value: fullName, required: true },
    { label: "Birthdate", value: applicantInfo.birthdate, required: true },
    { label: "Age", value: applicantInfo.age },
    {
      label: "Contact Number",
      value: applicantInfo.contactNumber,
      required: true,
    },
    { label: "Email Address", value: applicantInfo.email, required: true },
  ];

  const addressFields: SummaryField[] = [
    {
      label: "Present Address",
      value: formatAddress(applicantInfo.presentAddress),
      required: true,
    },
    {
      label: "Permanent Address",
      value: applicantInfo.isSameAddress
        ? "Same as Present Address"
        : formatAddress(applicantInfo.permanentAddress),
      required: true,
    },
  ];

  const employmentFields: SummaryField[] = [
    { label: "Occupation", value: applicantInfo.occupation },
  ];

  return (
    <Flex flexDir="column" gap={4} pb={2}>
      {/* Plan Details */}
      {selectedPlans.length === 0 ? (
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
          No plans have been selected.
        </Box>
      ) : (
        selectedPlans.map((plan) => (
          <SectionCard
            key={plan.lpaNo}
            icon={LuFileText}
            title={plan.lpaNo}
            description={plan.planType}
            fields={[
              { label: "LPA Number", value: plan.lpaNo, required: true },
              { label: "Plan Type", value: plan.planType },
              { label: "Account Status", value: plan.status },
              {
                label: "Termination Status",
                value: plan.terminationStatus,
              },
            ]}
            onEdit={() => handleEdit(0)}
          />
        ))
      )}

      {/* Loan Details */}
      <SectionCard
        icon={LuWallet}
        title="Loan Details"
        description="Loan amount, term, and amortization"
        fields={loanFields}
        onEdit={() => handleEdit(1)}
      />

      {/* Personal Info */}
      <SectionCard
        icon={LuUser}
        title="Personal Info"
        description="Planholder identification and details"
        fields={personalFields}
        onEdit={() => handleEdit(1)}
      />

      {/* Residential Address */}
      <SectionCard
        icon={LuHouse}
        title="Residential Address"
        description="Present and permanent address"
        fields={addressFields}
        onEdit={() => handleEdit(1)}
      />

      {/* Employment */}
      <SectionCard
        icon={LuBriefcase}
        title="Employment"
        description="Work related details"
        fields={employmentFields}
        onEdit={() => handleEdit(1)}
      />
    </Flex>
  );
}
