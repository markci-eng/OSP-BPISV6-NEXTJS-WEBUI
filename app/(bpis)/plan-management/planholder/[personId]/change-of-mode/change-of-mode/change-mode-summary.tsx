"use client";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuUser, LuPencil, LuMinus } from "react-icons/lu";
import type { CheckedPlanType } from "@/data/plan-management/change-of-mode/change-mode.types";

/* ------------------------------------------------------------------ */
/* Data model                                                          */
/* ------------------------------------------------------------------ */

interface SummaryField {
  label: string;
  value?: string | null;
}

const isEmpty = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toUpperCase() === "N/A";
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

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

const PlanSummaryCard = ({
  planholderName,
  lpaNo,
  icon,
  fields,
  onEdit,
}: {
  planholderName: string;
  lpaNo: string;
  icon: IconType;
  fields: SummaryField[];
  onEdit?: () => void;
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
            {planholderName}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {lpaNo}
          </Text>
        </Box>
      </Flex>

      {onEdit && (
        <Flex align="center" gap={2} flexShrink={0}>
          <EditButton onClick={onEdit} />
        </Flex>
      )}
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface RevRIProps {
  selectedPlans: CheckedPlanType[] | undefined;
  planholderName?: string;
  onSubmit: () => void;
  onBack: () => void;
}

export function ChangeModeSummaryPage({
  selectedPlans,
  planholderName = "Juan Dela Cruz",
  onBack,
}: RevRIProps) {
  if (!selectedPlans) return null;

  return (
    <Flex flexDir="column" gap={4} pb={2}>
      {selectedPlans.map((plan, index) => {
        const fields: SummaryField[] = [
          { label: "New Plan Code", value: plan.new_plan_code },
          { label: "New Mode", value: plan.new_mode },
          {
            label: "Installment Payment",
            value: plan.new_installment_amount.toLocaleString("en-US", {
              style: "currency",
              currency: "PHP",
            }),
          },
          { label: "Change of Mode Fee", value: "PHP 100.00" },
        ];

        return (
          <PlanSummaryCard
            key={index}
            planholderName={planholderName}
            lpaNo={plan.lpa_no}
            icon={LuUser}
            fields={fields}
            onEdit={onBack}
          />
        );
      })}
    </Flex>
  );
}
