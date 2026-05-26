import React from "react";
import {
  VStack,
  HStack,
  SimpleGrid,
  Box,
  Text,
  Portal,
  Select,
  Field,
  createListCollection,
  Span,
} from "@chakra-ui/react";
import {InputFloatingLabel} from "st-peter-ui";
import { Body, H4 } from "st-peter-ui";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
const civilStatusOptions = [
  { value: "single", label: "Single" },
  { value: "in_relationship", label: "In a Relationship" },
];
const genderCollection = createListCollection({
  items: genderOptions,
});
const civilStatusCollection = createListCollection({
  items: civilStatusOptions,
});

const LifePlanApplication3 = () => {
  return (
    <>
      <VStack align="stretch" gap={4} mb={4}>
        <Body fontWeight="bold">
          Residential Address
        </Body>
      </VStack>

      {/* <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <FloatingLabelInput id="landlineNumber" label="Landline Number" />
        </Field.Root>
        <Field.Root>
          <FloatingLabelInput id="mailToCollect" label="Mail to Collect" />
        </Field.Root>
      </SimpleGrid> */}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* <VStack align="stretch" gap={4} mb={4}>
          <Select.Root collection={genderCollection} width="100%">
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Gender" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {genderOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack> */}
        {/* <VStack align="stretch" gap={4}>
          <Select.Root collection={civilStatusCollection} width="100%">
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Civil Status" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {civilStatusOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack> */}
      </SimpleGrid>

      {/* <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <FloatingLabelInput id="height" label="Height (inches)" />
        </Field.Root>
        <Field.Root>
          <FloatingLabelInput id="weight" label="Weight (lbs)" />
        </Field.Root>
      </SimpleGrid> */}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <InputFloatingLabel id="occupation" label="Occupation" />
        </Field.Root>
        <Field.Root>
          <InputFloatingLabel id="employerName" label="Employer Name" />
        </Field.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <InputFloatingLabel id="employmentStatus" label="Employment Status" />
        </Field.Root>
        <Field.Root>
          <InputFloatingLabel id="officeAddress" label="Office Address" />
        </Field.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <InputFloatingLabel id="tin" label="TIN" />
        </Field.Root>
        <Field.Root>
          <InputFloatingLabel id="sssGsis" label="SSS/GSIS" />
        </Field.Root>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root w="100%">
          <InputFloatingLabel
            id="otherSourceOfFund"
            label="Other Source of Fund"
          />
        </Field.Root>
      </SimpleGrid>
    </>
  );
};

export default LifePlanApplication3;
