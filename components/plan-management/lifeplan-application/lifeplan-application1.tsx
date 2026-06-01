import {
  Text,
  Select,
  Input,
  Box,
  VStack,
  Grid,
  createListCollection,
  FileUpload,
  Field,
  Separator
} from "@chakra-ui/react";
import { InputFloatingLabel } from "st-peter-ui";
import { Body, SecondaryMdButton, SecondarySmButton } from "st-peter-ui";
// Removed FloatingLabelSelect usage in favor of placeholder Selects

const LifePlanApplication1 = () => {
  const idCollection = createListCollection({
    items: [
      { label: "Passport", value: "passport" },
      { label: "Driver's License", value: "driver_license" },
      { label: "National ID", value: "national_id" },
    ],
  });

  return (
    <>
      <VStack mb={4} align="stretch">
        <Body fontWeight="bold">Identification</Body>
      </VStack>

      <VStack gap={6} align="stretch">
        {/* Identification Section */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Select.Root collection={idCollection}>
            <Select.HiddenSelect />
            {/* <Select.Label>Select ID Type</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select ID Type" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {idCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <FileUpload.Root>
            <FileUpload.HiddenInput />
            <Box
              asChild
              width="100%"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="sm"
              textAlign="start"
              p={2}
              boxSizing="border-box"
              cursor="pointer"
              _hover={{ borderColor: "gray.400" }}
              fontSize="sm"
            >
              <FileUpload.Trigger>
                <FileUpload.FileText />
              </FileUpload.Trigger>
            </Box>
          </FileUpload.Root>
        </Grid>

        <Separator />

        {/* Full Name Section */}
        <Body fontWeight="bold">Full Name</Body>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <InputFloatingLabel id="lastName" type="text" label="Last Name" />
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel id="firstName" type="text" label="First Name" />
          </Field.Root>
        </Grid>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <InputFloatingLabel
              id="middleName"
              type="text"
              label="Middle Name"
            />
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel
              id="suffix"
              type="text"
              label="Suffix (Optional)"
            />
          </Field.Root>
        </Grid>

        <Separator />

        {/* Personal Data Section */}
        <Body fontWeight="bold">Personal Details</Body>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <Field.Label>Date of Birth</Field.Label>

            <Input id="dateOfBirth" type="date" />
          </Field.Root>

          <Field.Root>
            <Field.Label>Date of Neutralization</Field.Label>

            <Input id="dateOfNeutralization" type="date" />
          </Field.Root>

          <Field.Root>
            <InputFloatingLabel id="height" label="Height (inches)" />
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel id="weight" label="Weight (lbs)" />
          </Field.Root>
        </Grid>

        <Separator />

        {/* Demographics Section (using placeholder Select) */}
        <Body fontWeight="bold">Demographics</Body>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2 , 1fr)" }} gap={8}>
          <Field.Root>
            <Select.Root
              collection={createListCollection({
                items: [
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ],
              })}
            >
              <Select.HiddenSelect id="gender" />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Gender" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {createListCollection({
                    items: [
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ],
                  }).items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>
          <Field.Root>
            <Select.Root
              collection={createListCollection({
                items: [
                  { label: "Single", value: "single" },
                  { label: "Married", value: "married" },
                  { label: "Widowed", value: "widowed" },
                  { label: "Divorced", value: "divorced" },
                  { label: "Separated", value: "separated" },
                  { label: "Annulled", value: "annulled" },
                ],
              })}
            >
              <Select.HiddenSelect id="civilStatus" />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Civil Status" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {createListCollection({
                    items: [
                      { label: "Single", value: "single" },
                      { label: "Married", value: "married" },
                      { label: "Widowed", value: "widowed" },
                      { label: "Divorced", value: "divorced" },
                      { label: "Separated", value: "separated" },
                      { label: "Annulled", value: "annulled" },
                    ],
                  }).items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel
              id="nationality"
              type="text"
              label="Nationality"
            />
          </Field.Root>
        </Grid>

        <Separator />

        {/* Basic Contact Info */}
        <Body fontWeight="bold">Contact Information</Body>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <InputFloatingLabel
              id="mobileNumber"
              type="text"
              label="Mobile Number"
            />
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel
              id="landlineNumber"
              type="text"
              label="Landline Number"
            />
          </Field.Root>
        </Grid>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <InputFloatingLabel id="email" type="email" label="Email Address" />
          </Field.Root>
          <Field.Root>
            <InputFloatingLabel
              id="mailingAddress"
              type="text"
              label="Mailing Address"
            />
          </Field.Root>
        </Grid>

        <Separator />

        {/* Insurability */}
        {/* <Text fontWeight="semibold" fontSize="md">
          Insurability
        </Text> */}

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          <Field.Root>
            <InputFloatingLabel
              id="insurability"
              type="text"
              label="Insurability"
              value="Insurable"
              readOnly
            />
          </Field.Root>
        </Grid>
      </VStack>
    </>
  );
};

export default LifePlanApplication1;
