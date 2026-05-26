"use client";

import React from "react";
import { LuTrash, LuPlus, LuTriangleAlert } from "react-icons/lu";
import {
  Accordion,
  Badge,
  Button,
  Flex,
  Grid,
  Separator,
  Span,
  createListCollection,
} from "@chakra-ui/react";
import {
  InputFloatingLabel,
  SecondaryLgFlexButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { PayeeInfo, blankPayee, composePayeeName } from "./claims.types";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import SectionTitle from "@/components/texts/SectionTitle";

const SOFT_PAYEE_LIMIT = 3;

interface ClaimsPayeeFormProps {
  payees: PayeeInfo[];
  onPayeesChange: (next: PayeeInfo[]) => void;
}

const ClaimsPayeeForm = ({ payees, onPayeesChange }: ClaimsPayeeFormProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>(() =>
    payees.length ? [payees[payees.length - 1].id] : [],
  );

  const handleAddPayee = () => {
    const next = blankPayee();
    onPayeesChange([...payees, next]);
    setOpenItems((prev) => [...prev, next.id]);
  };

  const handleRemovePayee = (id: string) => {
    onPayeesChange(payees.filter((p) => p.id !== id));
    setOpenItems((prev) => prev.filter((v) => v !== id));
  };

  const updateField = <K extends keyof PayeeInfo>(
    id: string,
    key: K,
    value: PayeeInfo[K],
  ) => {
    onPayeesChange(
      payees.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
  };

  const overSoftLimit = payees.length > SOFT_PAYEE_LIMIT;

  return (
    <Flex flexDir="column" gap={4} marginX="auto" w="full">
      <Flex flexDir="column">
        <Caption value="We've pre-filled the form using the uploaded claimant documents. Please review and correct if needed." />
      </Flex>

      {overSoftLimit ? (
        <Flex
          align="center"
          gap={2}
          p={3}
          borderRadius="md"
          bg="yellow.50"
          color="yellow.800"
          borderWidth={1}
          borderColor="yellow.200"
        >
          <LuTriangleAlert />
          <Caption
            value={`More than ${SOFT_PAYEE_LIMIT} claimants have been added. This is allowed only for special cases and may require additional review.`}
          />
        </Flex>
      ) : null}

      <Accordion.Root
        multiple
        collapsible
        variant="enclosed"
        value={openItems}
        onValueChange={(e) => setOpenItems(e.value)}
      >
        {payees.map((payee, index) => {
          const name = composePayeeName(payee);
          const hasName = name !== "—";
          const isOpen = openItems.includes(payee.id);

          return (
            <Accordion.Item
              key={payee.id}
              value={payee.id}
              bg="white"
              _open={{ bg: "white" }}
            >
              <Flex
                align="center"
                pe={{ base: 2, md: 3 }}
                borderBottomWidth={isOpen ? 1 : 0}
                borderColor="gray.200"
              >
                <Accordion.ItemTrigger flex="1" minW={0}>
                  <Flex
                    flex="1"
                    minW={0}
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "flex-start", md: "center" }}
                    gap={{ base: 0, md: 2 }}
                    textAlign="start"
                  >
                    <FormTitle label={hasName ? name : `Claimant ${index + 1}`} />
                    {payee.relToPh ? (
                      <Badge size="sm" colorPalette="blue" variant="subtle">
                        {payee.relToPh}
                      </Badge>
                    ) : null}
                  </Flex>
                </Accordion.ItemTrigger>
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => handleRemovePayee(payee.id)}
                  aria-label="Remove claimant"
                >
                  <Span hideFrom="sm">
                    <LuTrash size={16} />
                  </Span>
                  <Span hideBelow="sm">Remove</Span>
                </Button>
              </Flex>

              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <Flex flexDir="column" gap={4}>
                    {/* Personal Info */}
                    <Flex flexDir="column">
                      <SectionTitle>Personal Information</SectionTitle>
                      <Separator my={2} />
                      <Grid
                        templateColumns={{
                          base: "1fr",
                          md: "repeat(2, 1fr)",
                        }}
                        gapX={3}
                        gapY={0}
                        pt={1}
                      >
                          <InputFloatingLabel
                            label="Last Name"
                            value={payee.lastName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(payee.id, "lastName", e.target.value)
                            }
                          />
                          <InputFloatingLabel
                            label="First Name"
                            value={payee.firstName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(
                                payee.id,
                                "firstName",
                                e.target.value,
                              )
                            }
                          />
                          <InputFloatingLabel
                            label="Middle Name"
                            value={payee.middleName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(
                                payee.id,
                                "middleName",
                                e.target.value,
                              )
                            }
                          />
                          <InputFloatingLabel
                            label="Suffix"
                            value={payee.suffix}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(payee.id, "suffix", e.target.value)
                            }
                          />
                          <InputFloatingLabel
                            label="Email"
                            value={payee.email}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(payee.id, "email", e.target.value)
                            }
                          />
                          <InputFloatingLabel
                            label="Contact Number"
                            value={payee.contactNumber}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(
                                payee.id,
                                "contactNumber",
                                e.target.value,
                              )
                            }
                          />
                          <SelectFloatingLabel
                            label="Relationship to Planholder"
                            value={payee.relToPh ? [payee.relToPh] : []}
                            collection={relationshipOptions}
                            onValueChange={(e: { value: string[] }) =>
                              updateField(
                                payee.id,
                                "relToPh",
                                e.value[0] ?? "",
                              )
                            }
                          />
                      </Grid>
                    </Flex>

                    {/* Bank Info */}
                    <Flex flexDir="column">
                      <SectionTitle>Bank / Payout Information</SectionTitle>
                      <Separator my={2} />
                      <Grid
                        templateColumns={{
                          base: "1fr",
                          md: "repeat(2, 1fr)",
                        }}
                        gapX={3}
                        gapY={0}
                        pt={1}
                      >
                          <SelectFloatingLabel
                            label="Payout Channel"
                            value={payee.channel ? [payee.channel] : []}
                            collection={channelList}
                            onValueChange={(e: { value: string[] }) =>
                              updateField(
                                payee.id,
                                "channel",
                                e.value[0] ?? "",
                              )
                            }
                          />
                          <InputFloatingLabel
                            label="Bank Name"
                            value={payee.bankName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(payee.id, "bankName", e.target.value)
                            }
                          />
                          <InputFloatingLabel
                            label="Account Name"
                            value={payee.accountName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(
                                payee.id,
                                "accountName",
                                e.target.value,
                              )
                            }
                          />
                          <InputFloatingLabel
                            label="Account No."
                            value={payee.accountNo}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              updateField(
                                payee.id,
                                "accountNo",
                                e.target.value,
                              )
                            }
                          />
                      </Grid>
                    </Flex>
                  </Flex>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>

      <SecondaryLgFlexButton
        onClick={handleAddPayee}
        width="fit-content"
        alignSelf="center"
      >
        <LuPlus />
        Add Claimant
      </SecondaryLgFlexButton>
    </Flex>
  );
};

const relationshipOptions = createListCollection({
  items: [
    { value: "Spouse", label: "Spouse" },
    { value: "Child", label: "Child" },
    { value: "Parent", label: "Parent" },
    { value: "Sibling", label: "Sibling" },
    { value: "Relative", label: "Relative" },
    { value: "Non-relative", label: "Non-relative" },
  ],
});

const channelList = createListCollection({
  items: [
    { value: "Check", label: "Check" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "E-Wallet", label: "E-Wallet" },
    { value: "Over-the-Counter", label: "Over-the-Counter" },
  ],
});

export default ClaimsPayeeForm;
