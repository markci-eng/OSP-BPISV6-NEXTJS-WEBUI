"use client";
import React, { useState } from "react";
import { Box, Flex, Grid, IconButton } from "@chakra-ui/react";
import { LuPhone, LuPlus, LuTrash2 } from "react-icons/lu";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import {
  CONTACT_TYPE_INPUT_PROPS,
  ContactEntry,
  ContactType,
  emptyContact,
  uid,
} from "./person-edit-fields";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  InputCardAccordion,
} from "osp-ui-kit";

export function ContactListSection({
  selectedPerson,
  entityLabel,
}: {
  selectedPerson?: SalesAgent;
  entityLabel: string;
}) {
  const [contacts, setContacts] = useState<ContactEntry[]>(() => {
    const entries: [ContactType, string | undefined][] = [
      ["Email", selectedPerson?.email],
      ["Mobile Number", selectedPerson?.mobile],
      ["Landline Number", selectedPerson?.landline],
    ];
    const existing: ContactEntry[] = entries
      .filter(([, value]) => Boolean(value))
      .map(([type, value]) => ({ id: uid(), type, value: value as string }));
    return existing.length > 0 ? existing : [emptyContact()];
  });

  const updateContact = (id: string, patch: Partial<ContactEntry>) =>
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );

  const removeContact = (id: string) =>
    setContacts((prev) => prev.filter((c) => c.id !== id));

  const addContact = () => setContacts((prev) => [...prev, emptyContact()]);

  return (
    <InputCardAccordion
      icon={<LuPhone />}
      title="Contact Information"
      subtitle={`Manage ${entityLabel} contact details`}
    >
      <Flex flexDir="column" gap={3}>
        <Flex justify="flex-end">
          <IconButton
            aria-label="Add contact"
            size="xs"
            variant="ghost"
            color="var(--chakra-colors-primary)"
            onClick={addContact}
          >
            <LuPlus /> Add Contact
          </IconButton>
        </Flex>
        {contacts.map((contact, idx) => (
          <Box
            key={contact.id}
            p={3}
            borderRadius="md"
            borderWidth={1}
            borderColor="gray.200"
            bg="white"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Box fontWeight="medium" color="gray.600">
                Contact {idx + 1}
              </Box>
              <IconButton
                aria-label="Remove contact"
                size="xs"
                variant="ghost"
                color="red.500"
                disabled={contacts.length === 1}
                onClick={() => removeContact(contact.id)}
              >
                <LuTrash2 />
              </IconButton>
            </Flex>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gapX={2}
              gapY={3}
            >
              <FloatingLabelSelect
                required
                label="Contact Type"
                value={contact.type}
                onValueChange={(value) =>
                  updateContact(contact.id, {
                    type: value as ContactType,
                    value: "",
                  })
                }
              >
                <option value="Email">Email</option>
                <option value="Mobile Number">Mobile Number</option>
                <option value="Landline Number">Landline Number</option>
              </FloatingLabelSelect>
              <FloatingLabelInput
                required
                label={contact.type || "Contact Details"}
                disabled={!contact.type}
                {...(contact.type
                  ? CONTACT_TYPE_INPUT_PROPS[contact.type]
                  : {})}
                value={contact.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateContact(contact.id, { value: e.target.value })
                }
              />
            </Grid>
          </Box>
        ))}
      </Flex>
    </InputCardAccordion>
  );
}
