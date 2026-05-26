import {
  Box,
  createListCollection,
  Flex,
  Grid,
  Separator,
  Table,
} from "@chakra-ui/react";
import {
  AddButton,
  AddSmButton,
  Body,
  Checkbox,
  H4,
  InputFloatingLabel,
  SelectFloatingLabel,
} from "st-peter-ui";

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

export function NewPlanHolderInfoForm() {
  return (
    <Box>
      <Body fontWeight={"semibold"}>New Plan Holder Information</Body>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gapX={4}>
        <InputFloatingLabel label={"Last Name"} name={""} />
        <InputFloatingLabel label={"First Name"} name={""} />
        <InputFloatingLabel label={"Middle Name"} name={""} />
        <InputFloatingLabel label={"Date of Birth"} type="date" name={""} />
        <SelectFloatingLabel label={"Gender"} collection={GenderCollection} />
        <SelectFloatingLabel
          label={"Civil Status"}
          collection={CivilStatusCollection}
        />
        <InputFloatingLabel label={"Contact Number"} type="number" name={""} />
        <Checkbox
          label="Insurable"
          onCheckedChange={(details) => {
            alert(details.checked ? "Checked" : "Unchecked");
          }}
        />
      </Grid>
      <Separator mb={5} />
      <Body fontWeight={"semibold"}>New Plan Holder Address</Body>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gapX={4}>
        <SelectFloatingLabel label={"Province"} collection={GenderCollection} />
        <SelectFloatingLabel
          label={"City / Municipality"}
          collection={GenderCollection}
        />
        <SelectFloatingLabel label={"District"} collection={GenderCollection} />
        <SelectFloatingLabel label={"Barangay"} collection={GenderCollection} />
        <InputFloatingLabel label={"Lot/Bldg/Unit No."} name={""} />
        <InputFloatingLabel label={"Street"} name={""} />
      </Grid>
      <Separator mb={5} />

      <Flex justify={"space-between"} mb={2}>
        <Body fontWeight={"semibold"}>Beneficiaries</Body>
        <AddSmButton />
      </Flex>

      <Table.ScrollArea borderWidth="1px" rounded="md" height="160px">
        <Table.Root size="sm" stickyHeader>
          <Table.Header>
            <Table.Row bg="bg.subtle">
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
                No Beneficiaries Added
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
