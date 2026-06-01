"use client";

import {
  Box,
  Checkbox,
  CloseButton,
  createListCollection,
  Drawer,
  Flex,
  Grid,
  Portal,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  InputFloatingLabel,
  PrimaryMdButton,
  SecondaryMdButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import React, { useState } from "react";
import type { BeneficiaryProps } from "../pages/beneficiaries";

const relationships = createListCollection({
  items: [
    { value: "SPOUSE", label: "Spouse" },
    { value: "SON", label: "Son" },
    { value: "DAUGHTER", label: "Daughter" },
    { value: "FATHER", label: "Father" },
    { value: "MOTHER", label: "Mother" },
    { value: "BROTHER", label: "Brother" },
    { value: "SISTER", label: "Sister" },
    { value: "GRANDCHILD", label: "Grandchild" },
    { value: "OTHERS", label: "Others" },
  ],
});

interface FormData {
  lastName: string;
  firstName: string;
  middleInitial: string;
  relationship: string;
  age: string;
  address: string;
}

interface FormErrors {
  lastName?: string;
  firstName?: string;
  relationship?: string;
  age?: string;
  address?: string;
}

const emptyForm = (): FormData => ({
  lastName: "",
  firstName: "",
  middleInitial: "",
  relationship: "",
  age: "",
  address: "",
});

interface AddBeneficiaryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryClass: "PRINCIPAL" | "CONTINGENT";
  planholderAddress?: string;
  onAdd?: (
    beneficiary: Omit<BeneficiaryProps, "personId" | "lpaNumber">,
  ) => void;
}

export function AddBeneficiaryDrawer({
  open,
  onOpenChange,
  beneficiaryClass,
  planholderAddress,
  onAdd,
}: AddBeneficiaryDrawerProps) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [inheritAddress, setInheritAddress] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.relationship.trim()) next.relationship = "Required";
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) <= 0)
      next.age = "Enter a valid age";
    if (!form.address.trim()) next.address = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd?.({
      beneficiaryClass,
      lastName: form.lastName.toUpperCase(),
      firstName: form.firstName.toUpperCase(),
      middleInitial: form.middleInitial.toUpperCase(),
      relationship: form.relationship.toUpperCase(),
      age: Number(form.age),
      address: form.address.toUpperCase(),
    });
    handleClose();
  };

  const handleClose = () => {
    setForm(emptyForm());
    setErrors({});
    setInheritAddress(false);
    onOpenChange(false);
  };

  const label =
    beneficiaryClass === "PRINCIPAL"
      ? "Principal Beneficiary"
      : "Contingent Beneficiary";

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) handleClose();
      }}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth={1} borderColor="gray.100">
              <Drawer.Title>
                <Flex direction="column" gap={0.5}>
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color="var(--chakra-colors-primary)"
                  >
                    Add {label}
                  </Text>
                  <Text fontSize="xs" color="gray.400" fontWeight="normal">
                    Fill in the beneficiary details below.
                  </Text>
                </Flex>
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body py={5}>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gapX={3}
              >
                <FieldWrapper error={errors.lastName}>
                  <InputFloatingLabel
                    label="Last Name"
                    required
                    value={form.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("lastName", e.target.value)
                    }
                  />
                </FieldWrapper>

                <FieldWrapper error={errors.firstName}>
                  <InputFloatingLabel
                    label="First Name"
                    required
                    value={form.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("firstName", e.target.value)
                    }
                  />
                </FieldWrapper>

                <FieldWrapper>
                  <InputFloatingLabel
                    label="Middle Initial"
                    value={form.middleInitial}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("middleInitial", e.target.value)
                    }
                  />
                </FieldWrapper>

                <FieldWrapper error={errors.relationship}>
                  <SelectFloatingLabel
                    label="Relationship"
                    required
                    collection={relationships}
                    value={form.relationship ? [form.relationship] : []}
                    onValueChanged={(value: string[]) =>
                      update("relationship", value[0] ?? "")
                    }
                  />
                </FieldWrapper>

                <FieldWrapper error={errors.age}>
                  <InputFloatingLabel
                    label="Age"
                    required
                    type="number"
                    value={form.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("age", e.target.value)
                    }
                  />
                </FieldWrapper>

                <Box gridColumn={{ md: "span 2" }} mt={2}>
                  <FieldWrapper error={errors.address}>
                    <Box
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={
                        errors.address
                          ? "red.400"
                          : inheritAddress
                            ? "var(--chakra-colors-primary-disabled)"
                            : "border"
                      }
                      bg={
                        inheritAddress
                          ? "var(--chakra-colors-primary-disabled)/10"
                          : "white"
                      }
                      transition="all 0.15s"
                      overflow="hidden"
                      py={2}
                    >
                      <Flex
                        align="center"
                        justify="space-between"
                        px={3}
                        pt={2}
                        pb={1}
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="medium"
                          color={
                            inheritAddress
                              ? "var(--chakra-colors-primary)"
                              : "gray.500"
                          }
                        >
                          Address
                        </Text>
                        {planholderAddress && (
                          <Checkbox.Root
                            size="sm"
                            checked={inheritAddress}
                            onCheckedChange={(e) => {
                              const checked = !!e.checked;
                              setInheritAddress(checked);
                              update(
                                "address",
                                checked ? planholderAddress : "",
                              );
                            }}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                            <Checkbox.Label fontSize="xs" color="gray.500">
                              Same as planholder address
                            </Checkbox.Label>
                          </Checkbox.Root>
                        )}
                      </Flex>
                      <Textarea
                        mt={2}
                        required
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="Enter full address"
                        rows={3}
                        resize="vertical"
                        disabled={inheritAddress}
                        border="none"
                        outline="none"
                        _focus={{ boxShadow: "none" }}
                        px={3}
                        pt={0}
                        pb={2}
                        fontSize="sm"
                        color={inheritAddress ? "gray.600" : "gray.800"}
                      />
                    </Box>
                  </FieldWrapper>
                </Box>
              </Grid>
            </Drawer.Body>

            <Drawer.Footer
              borderTopWidth={1}
              borderColor="gray.100"
              gap={2}
              justifyContent="flex-end"
            >
              <SecondaryMdButton onClick={handleClose}>
                Cancel
              </SecondaryMdButton>
              <PrimaryMdButton onClick={handleSubmit}>
                Add Beneficiary
              </PrimaryMdButton>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function FieldWrapper({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <Box mb={1}>
      {children}
      {error && (
        <Text fontSize="xs" color="red.500" mt={1} ml={1}>
          {error}
        </Text>
      )}
    </Box>
  );
}
