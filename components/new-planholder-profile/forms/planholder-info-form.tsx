"use client";
import React, { useState } from "react";
import { Box, Flex, Grid, IconButton } from "@chakra-ui/react";
import {
  InputFloatingLabel,
  PrimaryMdButton,
  SecondaryMdButton,
} from "st-peter-ui";
import { LuMapPin, LuPhone, LuPlus, LuTrash2, LuUserPen } from "react-icons/lu";
import { SalesAgent } from "../../common/agent-lookup/agent-lookup.type";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";

interface PlanholderEditFormProps {
  selectedAgent?: SalesAgent;
  onCancel?: () => void;
  onSubmitted?: () => void;
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

const PlanholderEditForm: React.FC<PlanholderEditFormProps> = ({
  selectedAgent,
  onCancel,
  onSubmitted,
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

  const [personalInfo, setPersonalInfo] = useState({
    lastName: selectedAgent?.lastName ?? "",
    firstName: selectedAgent?.firstName ?? "",
    middleName: selectedAgent?.middleName ?? "",
    suffix: selectedAgent?.suffix ?? "",
    gender: selectedAgent?.gender ?? "",
    birthDate: selectedAgent?.birthDate ?? "",
    placeOfBirth: selectedAgent?.placeOfBirth ?? "",
    civilStatus: selectedAgent?.civilStatus ?? "",
    nationality: selectedAgent?.nationality ?? "",
    naturalizationDate: selectedAgent?.naturalizationDate ?? "",
    height: selectedAgent?.height ?? "",
    weight: selectedAgent?.weight ?? "",
  });

  const updatePersonalInfo = (patch: Partial<typeof personalInfo>) =>
    setPersonalInfo((prev) => ({ ...prev, ...patch }));

  const isPersonalInfoComplete = Object.values(personalInfo).every(
    (v) => v.trim() !== "",
  );

  return (
    <Flex flexDir="column" gap={4}>
      <InputCardAccordion
        defaultOpen
        icon={<LuUserPen />}
        title={"Personal Information"}
        subtitle="Update planholder personal information"
        isComplete={isPersonalInfoComplete}
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gapX={2}>
          <InputFloatingLabel
            required
            label="Last Name"
            value={personalInfo.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ lastName: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="First Name"
            value={personalInfo.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ firstName: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Middle Name"
            value={personalInfo.middleName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ middleName: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Suffix"
            value={personalInfo.suffix}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ suffix: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Gender"
            value={personalInfo.gender}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ gender: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Date of Birth"
            value={personalInfo.birthDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ birthDate: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Place of Birth"
            value={personalInfo.placeOfBirth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ placeOfBirth: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Civil Status"
            value={personalInfo.civilStatus}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ civilStatus: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Nationality"
            value={personalInfo.nationality}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ nationality: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Naturalization Date"
            value={personalInfo.naturalizationDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ naturalizationDate: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Height"
            value={personalInfo.height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ height: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Weight"
            value={personalInfo.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ weight: e.target.value })
            }
          />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuMapPin />}
        title="Addresses"
        subtitle="Manage planholder addresses"
      >
        <Flex flexDir="column" gap={3}>
          <Flex justify="flex-end">
            <IconButton
              aria-label="Add address"
              size="xs"
              variant="ghost"
              color="var(--chakra-colors-primary)"
              onClick={addAddress}
            >
              <LuPlus /> Add Address
            </IconButton>
          </Flex>
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
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuPhone />}
        title="Contact Information"
        subtitle="Manage planholder contact details"
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
      </InputCardAccordion>
    </Flex>
  );
};

export default PlanholderEditForm;
