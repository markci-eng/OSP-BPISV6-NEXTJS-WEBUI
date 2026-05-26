import {
  VStack,
  Box,
  Grid,
  GridItem,
  Button,
  CloseButton,
  Dialog,
  For,
  HStack,
  Portal,
  createListCollection,
  Select,
  Field,
  Flex,
  Input,
} from "@chakra-ui/react";
import {
  Body,
  H4,
  Small,
  DeleteSolidButton,
  SecondaryMdButton,
  PrimaryMdButton,
  DynamicOutlineButton,
} from "st-peter-ui";
import { InputFloatingLabel } from "st-peter-ui";

const beneficiaryTypes = createListCollection({
  items: [
    { label: "Principal", value: "principal" },
    { label: "Contingent", value: "contingent" },
  ],
});
const relationshipTypes = createListCollection({
  items: [
    { label: "Spouse", value: "spouse" },
    { label: "Child", value: "child" },
    { label: "Parent", value: "parent" },
    { label: "Sibling", value: "sibling" },
    { label: "Friend", value: "friend" },
  ],
});

const Beneficiary = () => {
  return (
    <>
      <HStack justify="space-between" display="flex" gap={4} mb={4}>
        <Box>
          <H4>Add Your Beneficiaries</H4>
          <Body>
            Protect your loved ones by adding beneficiaries to your plan.
          </Body>
        </Box>
        <Dialog.Root
          placement="center"
          motionPreset="slide-in-bottom"
          size={{ mdDown: "full", md: "lg" }}
        >
          <Dialog.Trigger asChild>
            <DynamicOutlineButton label="Add"></DynamicOutlineButton>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Add Beneficiary</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <VStack gap={6} w="full">
                    {/* Row 1: Selects */}
                    <Flex gap={4} w="full">
                      <Select.Root
                        collection={beneficiaryTypes}
                        size="md"
                        flex="1"
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select beneficiary type" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            {beneficiaryTypes.items.map((beneficiaryType) => (
                              <Select.Item
                                item={beneficiaryType}
                                key={beneficiaryType.value}
                              >
                                {beneficiaryType.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>

                      <Select.Root
                        collection={relationshipTypes}
                        size="md"
                        flex="1"
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select relationship" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            {relationshipTypes.items.map((relationshipType) => (
                              <Select.Item
                                item={relationshipType}
                                key={relationshipType.value}
                              >
                                {relationshipType.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Flex>

                    {/* Row 2: Name Fields */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                      <Field.Root>
                        <InputFloatingLabel
                          id="firstName"
                          type="text"
                          label="First Name"
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root>
                        <InputFloatingLabel
                          id="middleInitial"
                          type="text"
                          label="Middle Initial"
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root>
                        <InputFloatingLabel
                          id="lastName"
                          type="text"
                          label="Last Name"
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                    </Grid>
                    <Flex gap={4} w="full">
                      <Field.Root flex="1">
                        <InputFloatingLabel
                          id="address"
                          type="text"
                          label="Address"
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                    </Flex>
                    {/* Row 3: DOB  */}
                    <Flex gap={4} w="full">
                      <Field.Root w={{ base: "full", md: "300px" }}>
                        <Field.Label>Date of Birth</Field.Label>
                        <Input id="dateOfBirth" type="date" />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                    </Flex>
                  </VStack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <SecondaryMdButton>Cancel</SecondaryMdButton>
                  </Dialog.ActionTrigger>
                  <PrimaryMdButton>Save</PrimaryMdButton>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </HStack>

      <HStack justify="space-between" align="center" w="full" mb={4}>
        <Body fontWeight="bold">Principal Beneficiaries</Body>
      </HStack>

      <VStack align="stretch" gap={3} mb={4}>
        {[1, 2].map((idx) => (
          <Box
            key={idx}
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            rounded="md"
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 4 }}
          >
            <Grid
              templateColumns={{
                base: "auto 1fr auto",
                md: "repeat(4, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
            >
              {/* <Checkbox.Root aria-label={`select-beneficiary-${idx}`}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root> */}

              <GridItem>
                <VStack align="center" gap={0} minW={0}>
                  <Body fontWeight="semibold">Juan Dela Cruz</Body>
                  <Small color="gray.500">Name</Small>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  align="center"
                  gap={0}
                  display={{ base: "none", md: "flex" }}
                >
                  <Body fontWeight="semibold">Sibling</Body>
                  <Small color="gray.500">Relationship</Small>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  align="center"
                  gap={0}
                  display={{ base: "none", md: "flex" }}
                >
                  <Body fontWeight="semibold">Jan 01, 1990</Body>
                  <Small color="gray.500">Date of Birth</Small>
                </VStack>
              </GridItem>

              <DeleteSolidButton m="auto" />
            </Grid>
          </Box>
        ))}
      </VStack>
      <HStack justify="space-between" align="center" w="full" mb={4}>
        <Body fontWeight="bold">Contingent Beneficiaries</Body>
      </HStack>
      <VStack align="stretch" gap={3} mb={4}>
        {[1].map((idx) => (
          <Box
            key={idx}
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            rounded="md"
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 4 }}
          >
            <Grid
              templateColumns={{
                base: "auto 1fr auto",
                md: "repeat(4, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
              alignItems="center"
            >
              <GridItem>
                <VStack align="center" gap={0} minW={0}>
                  <Body fontWeight="semibold">Alex Santos</Body>
                  <Small color="gray.500">Name</Small>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  align="center"
                  gap={0}
                  display={{ base: "none", md: "flex" }}
                >
                  <Body fontWeight="semibold">Parent</Body>
                  <Small color="gray.500">Relationship</Small>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  align="center"
                  gap={0}
                  display={{ base: "none", md: "flex" }}
                >
                  <Body fontWeight="semibold">Feb 14, 1980</Body>
                  <Small color="gray.500">Date of Birth</Small>
                </VStack>
              </GridItem>

              <DeleteSolidButton m="auto" />
            </Grid>
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default Beneficiary;
