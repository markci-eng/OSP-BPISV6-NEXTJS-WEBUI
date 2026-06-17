import React, { useState } from "react";
import { Box, Flex, Grid, IconButton } from "@chakra-ui/react";
import {
  InputFloatingLabel,
  PrimaryMdButton,
  SecondaryMdButton,
} from "st-peter-ui";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { SalesAgent } from "../../common/agent-lookup/agent-lookup.type";
import Card from "@/components/cards/Card";

interface AgentEditFormProps {
  selectedAgent?: SalesAgent;
  onCancel?: () => void;
  onSubmitted?: () => void;
  hideActions?: boolean;
}

interface AddressEntry {
  id: string;
  unit: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

interface ContactEntry {
  id: string;
  email: string;
  mobile: string;
  landline: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyAddress = (): AddressEntry => ({
  id: uid(),
  unit: "",
  street: "",
  barangay: "",
  district: "",
  city: "",
  province: "",
  zipCode: "",
});

const emptyContact = (): ContactEntry => ({
  id: uid(),
  email: "",
  mobile: "",
  landline: "",
});

const AgentEditForm: React.FC<AgentEditFormProps> = ({
  selectedAgent,
  onCancel,
  onSubmitted,
  hideActions,
}) => {
  const [addresses, setAddresses] = useState<AddressEntry[]>(() =>
    selectedAgent?.address
      ? [{ id: uid(), ...selectedAgent.address }]
      : [emptyAddress()],
  );

  const [contacts, setContacts] = useState<ContactEntry[]>(() =>
    selectedAgent
      ? [
          {
            id: uid(),
            email: selectedAgent.email ?? "",
            mobile: selectedAgent.mobile ?? "",
            landline: selectedAgent.landline ?? "",
          },
        ]
      : [emptyContact()],
  );

  const updateAddress = (id: string, patch: Partial<AddressEntry>) =>
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );

  const removeAddress = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const addAddress = () => setAddresses((prev) => [...prev, emptyAddress()]);

  const updateContact = (id: string, patch: Partial<ContactEntry>) =>
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );

  const removeContact = (id: string) =>
    setContacts((prev) => prev.filter((c) => c.id !== id));

  const addContact = () => setContacts((prev) => [...prev, emptyContact()]);

  return (
    <Flex flexDir="column" gap={4}>
      <Card.Root title="Personal Information">
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={2}
          >
            <InputFloatingLabel
              label="Last Name"
              defaultValue={selectedAgent?.lastName ?? ""}
            />
            <InputFloatingLabel
              label="First Name"
              defaultValue={selectedAgent?.firstName ?? ""}
            />
            <InputFloatingLabel
              label="Middle Name"
              defaultValue={selectedAgent?.middleName ?? ""}
            />
            <InputFloatingLabel
              label="Suffix"
              defaultValue={selectedAgent?.suffix ?? ""}
            />
            <InputFloatingLabel
              label="Gender"
              defaultValue={selectedAgent?.gender ?? ""}
            />
            <InputFloatingLabel
              label="Date of Birth"
              defaultValue={selectedAgent?.birthDate ?? ""}
            />
            <InputFloatingLabel
              label="Place of Birth"
              defaultValue={selectedAgent?.placeOfBirth ?? ""}
            />
            <InputFloatingLabel
              label="Civil Status"
              defaultValue={selectedAgent?.civilStatus ?? ""}
            />
            <InputFloatingLabel
              label="Nationality"
              defaultValue={selectedAgent?.nationality ?? ""}
            />
            <InputFloatingLabel
              label="Naturalization Date"
              defaultValue={selectedAgent?.naturalizationDate ?? ""}
            />
            <InputFloatingLabel
              label="Height"
              defaultValue={selectedAgent?.height ?? ""}
            />
            <InputFloatingLabel
              label="Weight"
              defaultValue={selectedAgent?.weight ?? ""}
            />
          </Grid>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Addresses">
        <Card.ButtonSection>
          <IconButton
            aria-label="Add address"
            size="xs"
            variant="ghost"
            color="var(--chakra-colors-primary)"
            onClick={addAddress}
          >
            <LuPlus /> Add Address
          </IconButton>
        </Card.ButtonSection>
        <Card.MainContent>
          <Flex flexDir="column" gap={3}>
            {addresses.map((addr, idx) => (
              <Box
                key={addr.id}
                p={3}
                borderRadius="md"
                borderWidth={1}
                borderColor="gray.200"
                bg="gray.50"
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Box fontWeight="medium" color="gray.600">
                    Address {idx + 1}
                  </Box>
                  <IconButton
                    aria-label="Remove address"
                    size="xs"
                    variant="ghost"
                    color="red.500"
                    disabled={addresses.length === 1}
                    onClick={() => removeAddress(addr.id)}
                  >
                    <LuTrash2 />
                  </IconButton>
                </Flex>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gapX={2}
                >
                  <InputFloatingLabel
                    label="Lot/Bldg/Unit No."
                    value={addr.unit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { unit: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Street"
                    value={addr.street}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { street: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Barangay"
                    value={addr.barangay}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { barangay: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="District"
                    value={addr.district}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { district: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="City"
                    value={addr.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { city: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Province"
                    value={addr.province}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { province: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Zip Code"
                    value={addr.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddress(addr.id, { zipCode: e.target.value })
                    }
                  />
                </Grid>
              </Box>
            ))}
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Contact Information">
        <Card.ButtonSection>
          <IconButton
            aria-label="Add contact"
            size="xs"
            variant="ghost"
            color="var(--chakra-colors-primary)"
            onClick={addContact}
          >
            <LuPlus /> Add Contact
          </IconButton>
        </Card.ButtonSection>
        <Card.MainContent>
          <Flex flexDir="column" gap={3}>
            {contacts.map((contact, idx) => (
              <Box
                key={contact.id}
                p={3}
                borderRadius="md"
                borderWidth={1}
                borderColor="gray.200"
                bg="gray.50"
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
                >
                  <InputFloatingLabel
                    label="Email"
                    value={contact.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateContact(contact.id, { email: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Mobile Number"
                    value={contact.mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateContact(contact.id, { mobile: e.target.value })
                    }
                  />
                  <InputFloatingLabel
                    label="Landline Number"
                    value={contact.landline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateContact(contact.id, { landline: e.target.value })
                    }
                  />
                </Grid>
              </Box>
            ))}
          </Flex>
        </Card.MainContent>
      </Card.Root>

      {!hideActions && (
        <Flex
          bottom={0}
          bg="white"
          py={3}
          width="full"
          justify="flex-end"
          gap={2}
          borderTopWidth={1}
          borderColor="gray.100"
        >
          <SecondaryMdButton onClick={onCancel}>Cancel</SecondaryMdButton>
          <PrimaryMdButton onClick={onSubmitted}>Save Changes</PrimaryMdButton>
        </Flex>
      )}
    </Flex>
  );
};

export default AgentEditForm;
