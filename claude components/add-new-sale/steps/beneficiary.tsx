import { RowItem } from "@/claude components/info-card/row-item";
import {
  VStack,
  Box,
  Grid,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  createListCollection,
  Select,
  Field,
  Flex,
  Input,
  Stack,
  IconButton,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import {
  Body,
  H4,
  DeleteSolidButton,
  SecondaryMdButton,
  PrimaryMdButton,
} from "st-peter-ui";
import { IBeneficiary } from "../planholder";
import FloatingLabelInput from "../floating-label-input";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

const beneficiaryTypes = createListCollection({
  items: [
    { label: "Principal", value: "principal" },
    { label: "Contingent", value: "contingent" },
  ],
});
const relationshipTypes = createListCollection({
  items: [
    { label: "Spouse", value: "Spouse" },
    { label: "Child", value: "Child" },
    { label: "Parent", value: "Parent" },
    { label: "Sibling", value: "Sibling" },
    { label: "Friend", value: "Friend" },
  ],
});

type SelectedBeneficiary = {
  type: "principal" | "contingent";
  index: number;
};

const ReviewRows = ({
  rows,
}: {
  rows: { label: string; value?: React.ReactNode }[];
}) => (
  <VStack align="stretch" gap={1}>
    {rows.map((row) => (
      <RowItem key={row.label} label={row.label} value={row.value} />
    ))}
  </VStack>
);

interface BeneficiaryProps {
  onUpdate?: (
    principal: IBeneficiary | undefined,
    contingent: IBeneficiary | undefined,
    all: IBeneficiary[],
  ) => void;
}

const Beneficiary = ({ onUpdate }: BeneficiaryProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { messageBox } = useMessageDialog();

  const [principalBeneficiaries, setPrincipalBeneficiaries] = useState<
    IBeneficiary[]
  >([]);

  const [contingentBeneficiaries, setContingentBeneficiaries] = useState<
    IBeneficiary[]
  >([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<SelectedBeneficiary | null>(null);

  const [formBeneficiary, setFormBeneficiary] = useState<IBeneficiary>({
    firstName: "",
    middleInitial: "",
    lastName: "",
    birthDate: "",
    address: "",
    relationship: "",
    beneficiaryClass: "principal",
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormBeneficiary, setAddFormBeneficiary] = useState<IBeneficiary>({
    firstName: "",
    middleInitial: "",
    lastName: "",
    birthDate: "",
    address: "",
    relationship: "",
    beneficiaryClass: "principal",
  });

  const syncBeneficiaries = (
    principal: IBeneficiary[],
    contingent: IBeneficiary[],
  ) => {
    const allBeneficiaries = [...principal, ...contingent];

    onUpdate?.(
      principal.length > 0 ? principal[0] : undefined,
      contingent.length > 0 ? contingent[0] : undefined,
      allBeneficiaries,
    );
  };

  const handleSaveAddBeneficiary = async () => {
    if (
      !addFormBeneficiary.firstName ||
      !addFormBeneficiary.lastName ||
      !addFormBeneficiary.birthDate ||
      !addFormBeneficiary.relationship ||
      !addFormBeneficiary.address
    ) {
      await messageBox({
        title: "Missing Information",
        message: "Please fill in all required fields.",
        confirmText: "Okay",
        variant: "warning",
      });
      return;
    }

    let newPrincipal = principalBeneficiaries;
    let newContingent = contingentBeneficiaries;

    if (addFormBeneficiary.beneficiaryClass === "principal") {
      newPrincipal = [...principalBeneficiaries, addFormBeneficiary];
      setPrincipalBeneficiaries(newPrincipal);
    } else {
      newContingent = [...contingentBeneficiaries, addFormBeneficiary];
      setContingentBeneficiaries(newContingent);
    }

    setAddFormBeneficiary({
      firstName: "",
      middleInitial: "",
      lastName: "",
      birthDate: "",
      relationship: "",
      address: "",
      beneficiaryClass: "principal",
    });
    setAddDialogOpen(false);

    syncBeneficiaries(newPrincipal, newContingent);
  };

  const formatFullName = (beneficiary: IBeneficiary) => {
    return [
      beneficiary.firstName,
      beneficiary.middleInitial,
      beneficiary.lastName,
    ]
      .filter((namePart) => namePart.trim().length > 0)
      .join(" ");
  };

  const formatDateDisplay = (rawDate: string) => {
    if (!rawDate) return "N/A";
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleOpenEdit = (
    type: "principal" | "contingent",
    index: number,
    beneficiary: IBeneficiary,
  ) => {
    setSelectedBeneficiary({ type, index });
    setFormBeneficiary({ ...beneficiary });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedBeneficiary) return;

    let updatedPrincipal = principalBeneficiaries;
    let updatedContingent = contingentBeneficiaries;

    if (selectedBeneficiary.type === "principal") {
      updatedPrincipal = principalBeneficiaries.map((beneficiary, index) =>
        index === selectedBeneficiary.index
          ? { ...formBeneficiary }
          : beneficiary,
      );
      setPrincipalBeneficiaries(updatedPrincipal);
    } else {
      updatedContingent = contingentBeneficiaries.map((beneficiary, index) =>
        index === selectedBeneficiary.index
          ? { ...formBeneficiary }
          : beneficiary,
      );
      setContingentBeneficiaries(updatedContingent);
    }

    syncBeneficiaries(updatedPrincipal, updatedContingent);

    setEditDialogOpen(false);
    setSelectedBeneficiary(null);
  };

  const handleDeleteBeneficiary = (
    type: "principal" | "contingent",
    index: number,
  ) => {
    let updatedPrincipal = principalBeneficiaries;
    let updatedContingent = contingentBeneficiaries;

    if (type === "principal") {
      updatedPrincipal = principalBeneficiaries.filter(
        (_, beneficiaryIndex) => beneficiaryIndex !== index,
      );
      setPrincipalBeneficiaries(updatedPrincipal);
    } else {
      updatedContingent = contingentBeneficiaries.filter(
        (_, beneficiaryIndex) => beneficiaryIndex !== index,
      );
      setContingentBeneficiaries(updatedContingent);
    }

    syncBeneficiaries(updatedPrincipal, updatedContingent);
  };

  return (
    <>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={5}
      >
        <Box>
          <H4>Add Your Beneficiaries</H4>
          <Body color="gray.600">
            Protect your loved ones by adding beneficiaries to your plan.
          </Body>
        </Box>
        <Dialog.Root
          placement="center"
          motionPreset="slide-in-bottom"
          size={{ mdDown: "full", md: "lg" }}
          open={addDialogOpen}
          onOpenChange={(details) => setAddDialogOpen(details.open)}
        >
          <Dialog.Trigger asChild>
            <Button w={{ base: "full", md: "auto" }}>Add Beneficiary</Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content mx={{ base: 3, md: 0 }}>
                <Dialog.Header>
                  <Dialog.Title>Add Beneficiary</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <VStack gap={5} w="full" align="stretch">
                    {/* Row 1: Selects */}
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                      gap={4}
                      w="full"
                    >
                      <Select.Root
                        collection={beneficiaryTypes}
                        size="md"
                        value={
                          addFormBeneficiary.beneficiaryClass
                            ? [addFormBeneficiary.beneficiaryClass]
                            : []
                        }
                        onValueChange={(details) =>
                          setAddFormBeneficiary((prev) => ({
                            ...prev,
                            beneficiaryClass:
                              (details.value?.[0] as
                                | "principal"
                                | "contingent") ?? "principal",
                          }))
                        }
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
                        value={
                          addFormBeneficiary.relationship
                            ? [addFormBeneficiary.relationship]
                            : []
                        }
                        onValueChange={(details) =>
                          setAddFormBeneficiary((prev) => ({
                            ...prev,
                            relationship: details.value?.[0] ?? "",
                          }))
                        }
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
                    </Grid>

                    {/* Row 2: Name Fields */}
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                      gap={4}
                      w="full"
                    >
                      <Field.Root>
                        <FloatingLabelInput
                          id="firstName"
                          type="text"
                          label="First Name"
                          value={addFormBeneficiary.firstName}
                          onChange={(e) =>
                            setAddFormBeneficiary((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root>
                        <FloatingLabelInput
                          id="lastName"
                          type="text"
                          label="Last Name"
                          value={addFormBeneficiary.lastName}
                          onChange={(e) =>
                            setAddFormBeneficiary((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root>
                        <FloatingLabelInput
                          id="middleInitial"
                          type="text"
                          label="Middle Initial"
                          value={addFormBeneficiary.middleInitial}
                          onChange={(e) =>
                            setAddFormBeneficiary((prev) => ({
                              ...prev,
                              middleInitial: e.target.value,
                            }))
                          }
                        />
                        <Field.ErrorText>
                          This field is required
                        </Field.ErrorText>
                      </Field.Root>
                    </Grid>

                    <Field.Root>
                      <FloatingLabelInput
                        id="address"
                        type="text"
                        label="Address"
                        value={addFormBeneficiary.address}
                        onChange={(e) =>
                          setAddFormBeneficiary((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                      <Field.ErrorText>This field is required</Field.ErrorText>
                    </Field.Root>

                    {/* Row 3: DOB  */}
                    <Field.Root w={{ base: "full", md: "300px" }}>
                      <Field.Label>Date of Birth</Field.Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={addFormBeneficiary.birthDate}
                        onChange={(e) =>
                          setAddFormBeneficiary((prev) => ({
                            ...prev,
                            birthDate: e.target.value,
                          }))
                        }
                      />
                      <Field.ErrorText>This field is required</Field.ErrorText>
                    </Field.Root>
                  </VStack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Stack
                    display="flex"
                    justifyContent="flex-end"
                    direction={{ base: "row", sm: "row" }}
                    w={{ base: "full", sm: "auto" }}
                    gap={3}
                  >
                    <Dialog.ActionTrigger asChild>
                      <SecondaryMdButton>Cancel</SecondaryMdButton>
                    </Dialog.ActionTrigger>
                    <PrimaryMdButton onClick={handleSaveAddBeneficiary}>
                      Save
                    </PrimaryMdButton>
                  </Stack>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Flex>

      <HStack justify="space-between" align="center" w="full" mb={4}>
        <Body fontWeight="bold">Principal Beneficiaries</Body>
      </HStack>

      {principalBeneficiaries.length === 0 ? (
        <Box
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          rounded="xl"
          px={4}
          py={8}
          textAlign="center"
          mb={4}
        >
          <Body color="gray.500">No principal beneficiaries added yet</Body>
        </Box>
      ) : (
        <VStack align="stretch" gap={3} mb={4}>
          {principalBeneficiaries.map((beneficiary, idx) => (
            <Box
              key={idx}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="xl"
              px={{ base: 3, md: 4 }}
              py={{ base: 3, md: 4 }}
            >
              <Flex justify="space-between" align="start" gap={3}>
                <Box
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleOpenEdit("principal", idx, beneficiary)}
                >
                  <Body fontWeight="semibold" mb={1}>
                    {formatFullName(beneficiary)}
                  </Body>
                  <ReviewRows
                    rows={[
                      {
                        label: "Relationship",
                        value: beneficiary.relationship,
                      },
                      {
                        label: "Date of Birth",
                        value: formatDateDisplay(beneficiary.birthDate),
                      },
                      {
                        label: "Address",
                        value: beneficiary.address,
                      },
                    ]}
                  />
                </Box>

                <HStack gap={2} mt={{ base: 1, md: "auto" }}>
                  <IconButton
                    aria-label="Edit beneficiary"
                    variant="ghost"
                    color="green.600"
                    onClick={() =>
                      handleOpenEdit("principal", idx, beneficiary)
                    }
                  >
                    <LuPencil />
                  </IconButton>
                  {isMobile ? (
                    <IconButton
                      aria-label="Delete beneficiary"
                      variant="ghost"
                      color="red.500"
                      onClick={() => handleDeleteBeneficiary("principal", idx)}
                    >
                      <FaRegTrashAlt />
                    </IconButton>
                  ) : (
                    <DeleteSolidButton
                      onClick={() => handleDeleteBeneficiary("principal", idx)}
                    />
                  )}
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
      <HStack justify="space-between" align="center" w="full" mb={4}>
        <Body fontWeight="bold">Contingent Beneficiaries</Body>
      </HStack>
      {contingentBeneficiaries.length === 0 ? (
        <Box
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          rounded="xl"
          px={4}
          py={8}
          textAlign="center"
          mb={4}
        >
          <Body color="gray.500">No contingent beneficiaries added yet</Body>
        </Box>
      ) : (
        <VStack align="stretch" gap={3} mb={4}>
          {contingentBeneficiaries.map((beneficiary, idx) => (
            <Box
              key={idx}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="xl"
              px={{ base: 3, md: 4 }}
              py={{ base: 3, md: 4 }}
            >
              <Flex justify="space-between" align="start" gap={3}>
                <Box
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleOpenEdit("contingent", idx, beneficiary)}
                >
                  <Body fontWeight="semibold" mb={1}>
                    {formatFullName(beneficiary)}
                  </Body>
                  <ReviewRows
                    rows={[
                      {
                        label: "Relationship",
                        value: beneficiary.relationship,
                      },
                      {
                        label: "Date of Birth",
                        value: formatDateDisplay(beneficiary.birthDate),
                      },
                      {
                        label: "Address",
                        value: beneficiary.address,
                      },
                    ]}
                  />
                </Box>

                <HStack gap={2} mt={{ base: 1, md: "auto" }}>
                  <IconButton
                    aria-label="Edit beneficiary"
                    variant="ghost"
                    color="green.600"
                    onClick={() =>
                      handleOpenEdit("contingent", idx, beneficiary)
                    }
                  >
                    <LuPencil />
                  </IconButton>
                  {isMobile ? (
                    <IconButton
                      aria-label="Delete beneficiary"
                      variant="ghost"
                      color="red.500"
                      onClick={() => handleDeleteBeneficiary("contingent", idx)}
                    >
                      <FaRegTrashAlt />
                    </IconButton>
                  ) : (
                    <DeleteSolidButton
                      onClick={() => handleDeleteBeneficiary("contingent", idx)}
                    />
                  )}
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}

      <Dialog.Root
        placement="center"
        open={editDialogOpen}
        onOpenChange={(details) => setEditDialogOpen(details.open)}
        size={{ mdDown: "full", md: "xl" }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Edit Beneficiary</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap={4}>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    <Field.Root>
                      <Field.Label>First Name</Field.Label>
                      <Input
                        value={formBeneficiary.firstName}
                        onChange={(e) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter first name"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Middle Initial</Field.Label>
                      <Input
                        value={formBeneficiary.middleInitial}
                        onChange={(e) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            middleInitial: e.target.value,
                          }))
                        }
                        placeholder="Enter middle initial"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Last Name</Field.Label>
                      <Input
                        value={formBeneficiary.lastName}
                        onChange={(e) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter last name"
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Birthdate</Field.Label>
                      <Input
                        type="date"
                        value={formBeneficiary.birthDate}
                        onChange={(e) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            birthDate: e.target.value,
                          }))
                        }
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Relationship</Field.Label>
                      <Select.Root
                        collection={relationshipTypes}
                        value={
                          formBeneficiary.relationship
                            ? [formBeneficiary.relationship]
                            : []
                        }
                        onValueChange={(details) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            relationship: details.value?.[0] ?? "",
                          }))
                        }
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
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Address</Field.Label>
                      <Input
                        value={formBeneficiary.address}
                        onChange={(e) =>
                          setFormBeneficiary((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Enter address"
                      />
                    </Field.Root>
                  </Grid>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <SecondaryMdButton>Cancel</SecondaryMdButton>
                </Dialog.ActionTrigger>
                <PrimaryMdButton onClick={handleSaveEdit}>Save</PrimaryMdButton>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default Beneficiary;
