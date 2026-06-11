"use client";

import { Box, Field, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import React from "react";
import { IEmployment } from "../planholder";
import FloatingLabelInput from "../floating-label-input";

interface LifePlanApplication3Props {
  initialData?: IEmployment;
  onUpdate?: (employment: IEmployment) => void;
}

const LifePlanApplication3 = ({
  initialData,
  onUpdate,
}: LifePlanApplication3Props) => {
  const [formData, setFormData] = React.useState<IEmployment>({
    occupation: initialData?.occupation ?? "Software Engineer",
    employerName: initialData?.employerName ?? "ABC Technologies Inc.",
    employmentStatus: initialData?.employmentStatus ?? "Regular",
    officeAddress:
      initialData?.officeAddress ?? "456 Ayala Avenue, Bel-Air, Makati City",
    TIN: initialData?.TIN ?? "123-456-789-000",
    SSS: initialData?.SSS ?? "34-1234567-8",
    sourceOfIncome: initialData?.sourceOfIncome ?? "Salary",
  });

  const updateFormData = (nextData: IEmployment) => {
    setFormData(nextData);
    onUpdate?.(nextData);
  };

  return (
    <Box
      // bg={BRAND_COLORS.white}
      // borderWidth="1px"
      // borderColor={BRAND_COLORS.neutralBorder}
      // borderRadius={STANDARD_RADIUS.lg}
      // boxShadow={STANDARD_SHADOWS.level1}
      p={{ base: STANDARD_SPACING.sm, md: STANDARD_SPACING.md }}
    >
      <VStack align="stretch" gap={STANDARD_SPACING.md}>
        {/* <Box>
          <Text
            color={BRAND_COLORS.neutralText}
            fontSize={{ base: "18px", md: "20px" }}
            fontWeight="700"
            lineHeight="1.3"
          >
            Employment
          </Text>
        </Box> */}

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={STANDARD_SPACING.sm}>
          <Field.Root>
            <FloatingLabelInput
              id="occupation"
              label="Occupation"
              value={formData.occupation}
              onChange={(e) => {
                updateFormData({ ...formData, occupation: e.target.value });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="employerName"
              label="Employer Name"
              value={formData.employerName}
              onChange={(e) => {
                updateFormData({ ...formData, employerName: e.target.value });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="employmentStatus"
              label="Employment Status"
              value={formData.employmentStatus}
              onChange={(e) => {
                updateFormData({
                  ...formData,
                  employmentStatus: e.target.value,
                });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="officeAddress"
              label="Office Address"
              value={formData.officeAddress}
              onChange={(e) => {
                updateFormData({ ...formData, officeAddress: e.target.value });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="tin"
              label="TIN"
              value={formData.TIN}
              onChange={(e) => {
                updateFormData({ ...formData, TIN: e.target.value });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="sssGsis"
              label="SSS"
              value={formData.SSS}
              onChange={(e) => {
                updateFormData({ ...formData, SSS: e.target.value });
              }}
            />
          </Field.Root>
          <Field.Root>
            <FloatingLabelInput
              id="otherSourceOfFund"
              label="Other Source of Fund"
              value={formData.sourceOfIncome}
              onChange={(e) => {
                updateFormData({ ...formData, sourceOfIncome: e.target.value });
              }}
            />
          </Field.Root>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default LifePlanApplication3;
