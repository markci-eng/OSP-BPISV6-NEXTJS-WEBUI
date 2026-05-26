import {
  Box,
  createListCollection,
  Flex,
  Grid,
  Separator,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  AddSmButton,
  Body,
  Checkbox,
  InputFloatingLabel,
  SelectFloatingLabel,
} from "st-peter-ui";
import type { ReactNode } from "react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

const GenderCollection = createListCollection({
  items: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],
});

const CivilStatusCollection = createListCollection({
  items: [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ],
});

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Box mb={3}>
        <Body fontWeight="semibold" color={BRAND_COLORS.primaryGreen}>
          {title}
        </Body>
        <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} mt={1}>
          {description}
        </Text>
      </Box>
      {children}
    </Box>
  );
}

export function NewPlanHolderInfoForm() {
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <FormSection
        title="New Plan Holder Information"
        description="Provide the identity and contact details of the receiving plan holder."
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
          columnGap={4}
        >
          <InputFloatingLabel label={"Last Name"} name={""} />
          <InputFloatingLabel label={"First Name"} name={""} />
          <InputFloatingLabel label={"Middle Name"} name={""} />
          <InputFloatingLabel label={"Date of Birth"} type="date" name={""} />
          <SelectFloatingLabel label={"Gender"} collection={GenderCollection} />
          <SelectFloatingLabel
            label={"Civil Status"}
            collection={CivilStatusCollection}
          />
          <InputFloatingLabel
            label={"Contact Number"}
            type="number"
            name={""}
          />
          <Flex
            align="center"
            minH="40px"
            px={{ base: 0, md: STANDARD_SPACING.xs }}
          >
            <Checkbox
              label="Insurable"
              onCheckedChange={(details) => {
                alert(details.checked ? "Checked" : "Unchecked");
              }}
            />
          </Flex>
        </Grid>
      </FormSection>

      <Separator />

      <FormSection
        title="New Plan Holder Address"
        description="Enter the complete address using the standard province-to-street order."
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
          columnGap={4}
          rowGap={3}
        >
          <SelectFloatingLabel
            label={"Province"}
            collection={GenderCollection}
          />
          <SelectFloatingLabel
            label={"City / Municipality"}
            collection={GenderCollection}
          />
          <SelectFloatingLabel
            label={"District"}
            collection={GenderCollection}
          />
          <SelectFloatingLabel
            label={"Barangay"}
            collection={GenderCollection}
          />
          <InputFloatingLabel label={"Lot/Bldg/Unit No."} name={""} />
          <InputFloatingLabel label={"Street"} name={""} />
        </Grid>
      </FormSection>

      <Separator />

      <Box>
        <Flex
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={3}
        >
          <Box>
            <Body fontWeight="semibold" color={BRAND_COLORS.primaryGreen}>
              Beneficiaries
            </Body>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} mt={1}>
              Add beneficiaries linked to the new plan holder when available.
            </Text>
          </Box>
          <AddSmButton />
        </Flex>

        <Table.ScrollArea
          borderWidth="1px"
          borderColor={BRAND_COLORS.neutralBorder}
          rounded={STANDARD_RADIUS.md}
          maxH="220px"
        >
          <Table.Root size="sm" stickyHeader>
            <Table.Header>
              <Table.Row bg={BRAND_COLORS.subtleBg}>
                <Table.ColumnHeader>Full Name</Table.ColumnHeader>
                <Table.ColumnHeader>Relationship</Table.ColumnHeader>
                <Table.ColumnHeader>Date of Birth</Table.ColumnHeader>
                <Table.ColumnHeader>Address</Table.ColumnHeader>
                <Table.ColumnHeader>Beneficiary Class</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell colSpan={6} textAlign={"center"} py={5}>
                  <Text color="gray.500" fontSize="sm" fontWeight="500">
                    No Beneficiaries Added
                  </Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Box>
  );
}
