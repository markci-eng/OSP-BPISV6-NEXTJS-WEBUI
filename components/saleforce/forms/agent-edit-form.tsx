"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Box, Flex, Grid, IconButton, Text } from "@chakra-ui/react";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import {
  LuBriefcase,
  LuMapPin,
  LuPhone,
  LuPlus,
  LuTrash2,
  LuUserPen,
} from "react-icons/lu";
import { SalesAgent } from "../../common/agent-lookup/agent-lookup.type";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";

interface AgentEditFormProps {
  selectedAgent?: SalesAgent;
  onCancel?: () => void;
  onSubmitted?: () => void;
  successLink?: string;
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

type ContactType = "Email" | "Mobile Number" | "Landline Number";

interface ContactEntry {
  id: string;
  type: ContactType | "";
  value: string;
}

const CONTACT_TYPE_INPUT_PROPS: Record<
  ContactType,
  { type: string; inputMode?: "email" | "tel" }
> = {
  Email: { type: "email", inputMode: "email" },
  "Mobile Number": { type: "tel", inputMode: "tel" },
  "Landline Number": { type: "tel", inputMode: "tel" },
};

const mockAgent: SalesAgent = {
  id: "SA21",
  name: "Lim, Carlo",
  firstName: "Carlo",
  lastName: "Lim",
  middleName: "Santos",
  suffix: "",
  placeOfBirth: "Manila",
  birthDate: "1993-05-11",
  gender: "MALE",
  civilStatus: "Single",
  nationality: "Filipino",
  naturalizationDate: "N/A",
  height: "5'6\"",
  weight: "150 lbs",
  position: "SA2",
  hireDate: "2022-01-01",
  employeeStatus: "Active",
  branch: "Makati",
  superiorId: "STL1",
  sssNumber: "34-1234568-4",
  nbiNumber: "12-345678907-8",
  tinNumber: "1000-0007-0007",
  landline: "800-7007",
  mobile: "+63 917 111 1007",
  email: "carlo.lim@stpeter.com.ph",
  address: {
    unit: "Unit 9F",
    street: "Legazpi St.",
    barangay: "Legazpi Village",
    district: "District 1",
    city: "Makati",
    province: "Metro Manila",
    zipCode: "1229",
  },
  isContractPrinted: true,
  isSFIDPrinted: true,
  employer: "",
};

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
  type: "",
  value: "",
});

const FEET_OPTIONS = Array.from({ length: 6 }, (_, i) => String(i + 3)); // 3-8 ft
const INCH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i)); // 0-11 in

const ReadOnlyFieldTile = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <Box p={0.5}>
    <Box
      pos="relative"
      w="full"
      h="12"
      pt="5"
      pb="1"
      px="3"
      bg="gray.50"
      borderWidth="1.5px"
      borderColor="gray.200"
      borderRadius="lg"
    >
      <Text
        pos="absolute"
        top="-2"
        insetStart="2.5"
        px="0.5"
        bg="gray.50"
        fontSize="xs"
        fontWeight="medium"
        color="gray.400"
      >
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="gray.900" truncate>
        {value || "—"}
      </Text>
    </Box>
  </Box>
);

const parseHeight = (height?: string) => {
  const match = height?.match(/(\d+)'\s*(\d+)/);
  return { feet: match?.[1] ?? "", inches: match?.[2] ?? "" };
};

const formatHeight = (feet: string, inches: string) =>
  feet && inches ? `${feet}'${inches}"` : "";

const AgentEditForm: React.FC<AgentEditFormProps> = ({
  selectedAgent = mockAgent,
  onCancel,
  onSubmitted,
  successLink,
  hideActions,
}) => {
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const [personalInfo, setPersonalInfo] = useState<{
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
    gender: string;
    birthDate: string;
    placeOfBirth: string;
    civilStatus: string;
    nationality: string;
    naturalizationDate: string;
    height: string;
    weight: string;
  }>({
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

  const [heightFeet, setHeightFeet] = useState(
    () => parseHeight(selectedAgent?.height).feet,
  );
  const [heightInches, setHeightInches] = useState(
    () => parseHeight(selectedAgent?.height).inches,
  );

  const updateHeightFeet = (feet: string) => {
    setHeightFeet(feet);
    updatePersonalInfo({ height: formatHeight(feet, heightInches) });
  };

  const updateHeightInches = (inches: string) => {
    setHeightInches(inches);
    updatePersonalInfo({ height: formatHeight(heightFeet, inches) });
  };

  const [employmentInfo, setEmploymentInfo] = useState<{
    position: string;
    hireDate: string;
    employeeStatus: string;
    branch: string;
    superiorId: string;
    sssNumber: string;
    nbiNumber: string;
    tinNumber: string;
  }>({
    position: selectedAgent?.position ?? "",
    hireDate: selectedAgent?.hireDate ?? "",
    employeeStatus: selectedAgent?.employeeStatus ?? "",
    branch: selectedAgent?.branch ?? "",
    superiorId: selectedAgent?.superiorId ?? "",
    sssNumber: selectedAgent?.sssNumber ?? "",
    nbiNumber: selectedAgent?.nbiNumber ?? "",
    tinNumber: selectedAgent?.tinNumber ?? "",
  });

  const [addresses, setAddresses] = useState<AddressEntry[]>(() =>
    selectedAgent?.address
      ? [{ id: uid(), ...selectedAgent.address }]
      : [emptyAddress()],
  );

  const [contacts, setContacts] = useState<ContactEntry[]>(() => {
    const entries: [ContactType, string | undefined][] = [
      ["Email", selectedAgent?.email],
      ["Mobile Number", selectedAgent?.mobile],
      ["Landline Number", selectedAgent?.landline],
    ];
    const existing: ContactEntry[] = entries
      .filter(([, value]) => Boolean(value))
      .map(([type, value]) => ({ id: uid(), type, value: value as string }));
    return existing.length > 0 ? existing : [emptyContact()];
  });

  const updatePersonalInfo = (patch: Partial<typeof personalInfo>) =>
    setPersonalInfo((prev) => ({ ...prev, ...patch }));

  const updateEmploymentInfo = (patch: Partial<typeof employmentInfo>) =>
    setEmploymentInfo((prev) => ({ ...prev, ...patch }));

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

  const isPersonalInfoComplete = Object.values(personalInfo).every(
    (v) => v.trim() !== "",
  );

  const isEmploymentInfoComplete = Object.values(employmentInfo).every(
    (v) => v.trim() !== "",
  );

  return (
    <Flex flexDir="column" gap={4}>
      <InputCardAccordion
        defaultOpen
        icon={<LuUserPen />}
        title="Personal Information"
        subtitle="Update agent personal information"
        isComplete={isPersonalInfoComplete}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gapX={2}
          gapY={3}
          mb={3}
        >
          <FloatingLabelInput
            required
            label="Last Name"
            value={personalInfo.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ lastName: e.target.value })
            }
          />
          <FloatingLabelInput
            required
            label="First Name"
            value={personalInfo.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ firstName: e.target.value })
            }
          />
          <FloatingLabelInput
            label="Middle Name"
            value={personalInfo.middleName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ middleName: e.target.value })
            }
          />
          <FloatingLabelInput
            label="Suffix"
            value={personalInfo.suffix}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ suffix: e.target.value })
            }
          />
          <FloatingLabelSelect
            required
            label="Gender"
            value={personalInfo.gender}
            onValueChange={(value) => updatePersonalInfo({ gender: value })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </FloatingLabelSelect>
          <FloatingLabelInput
            required
            label="Date of Birth"
            type="date"
            value={personalInfo.birthDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ birthDate: e.target.value })
            }
          />
          <FloatingLabelInput
            required
            label="Place of Birth"
            value={personalInfo.placeOfBirth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ placeOfBirth: e.target.value })
            }
          />
          <FloatingLabelSelect
            required
            label="Civil Status"
            value={personalInfo.civilStatus}
            onValueChange={(value) =>
              updatePersonalInfo({ civilStatus: value })
            }
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </FloatingLabelSelect>
          <FloatingLabelInput
            required
            label="Nationality"
            value={personalInfo.nationality}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ nationality: e.target.value })
            }
          />
          <FloatingLabelInput
            type="date"
            label="Naturalization Date"
            value={personalInfo.naturalizationDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ naturalizationDate: e.target.value })
            }
          />
          <Flex gap={2}>
            <FloatingLabelSelect
              required
              label="Height (ft)"
              value={heightFeet}
              onValueChange={updateHeightFeet}
            >
              {FEET_OPTIONS.map((ft) => (
                <option key={ft} value={ft}>
                  {ft} ft
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelSelect
              required
              label="Height (in)"
              value={heightInches}
              onValueChange={updateHeightInches}
            >
              {INCH_OPTIONS.map((inch) => (
                <option key={inch} value={inch}>
                  {inch} in
                </option>
              ))}
            </FloatingLabelSelect>
          </Flex>
          <Box pos="relative">
            <FloatingLabelInput
              required
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              pe="10"
              label="Weight"
              value={personalInfo.weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePersonalInfo({ weight: e.target.value })
              }
            />
            <Text
              pos="absolute"
              insetEnd="3"
              top="50%"
              transform="translateY(-50%)"
              fontSize="sm"
              fontWeight="medium"
              color="gray.400"
              pointerEvents="none"
            >
              lbs
            </Text>
          </Box>
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuBriefcase />}
        title="Employment Information"
        subtitle="Update agent employment details"
        isComplete={isEmploymentInfoComplete}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gapX={2}
          gapY={3}
        >
          <ReadOnlyFieldTile label="Position" value={employmentInfo.position} />
          <ReadOnlyFieldTile
            label="Hire Date"
            value={employmentInfo.hireDate}
          />
          <ReadOnlyFieldTile
            label="Employee Status"
            value={employmentInfo.employeeStatus}
          />
          <ReadOnlyFieldTile label="Branch" value={employmentInfo.branch} />
          <ReadOnlyFieldTile
            label="Superior ID"
            value={employmentInfo.superiorId}
          />
          <FloatingLabelInput
            required
            label="SSS Number"
            value={employmentInfo.sssNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ sssNumber: e.target.value })
            }
          />
          <FloatingLabelInput
            required
            label="NBI Number"
            value={employmentInfo.nbiNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ nbiNumber: e.target.value })
            }
          />
          <FloatingLabelInput
            required
            label="TIN Number"
            value={employmentInfo.tinNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ tinNumber: e.target.value })
            }
          />
        </Grid>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuMapPin />}
        title="Addresses"
        subtitle="Manage agent addresses"
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
              bg="white"
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
                templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                gapX={2}
                gapY={3}
              >
                <FloatingLabelInput
                  label="Lot/Bldg/Unit No."
                  value={addr.unit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAddress(addr.id, { unit: e.target.value })
                  }
                  required
                />
                <FloatingLabelInput
                  label="Street"
                  value={addr.street}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAddress(addr.id, { street: e.target.value })
                  }
                  required
                />

                <FloatingLabelSelect
                  label="Province"
                  value={addr.province}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateAddress(addr.id, { province: e.target.value })
                  }
                  required
                >
                  {addr.province && (
                    <option value={addr.province}>{addr.province}</option>
                  )}
                </FloatingLabelSelect>
                <FloatingLabelSelect
                  label="City"
                  value={addr.city}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateAddress(addr.id, { city: e.target.value })
                  }
                  required
                >
                  {addr.city && <option value={addr.city}>{addr.city}</option>}
                </FloatingLabelSelect>
                <FloatingLabelSelect
                  label="District"
                  value={addr.district}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateAddress(addr.id, { district: e.target.value })
                  }
                  required
                >
                  {addr.district && (
                    <option value={addr.district}>{addr.district}</option>
                  )}
                </FloatingLabelSelect>

                <FloatingLabelSelect
                  label="Barangay"
                  value={addr.barangay}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    updateAddress(addr.id, { barangay: e.target.value })
                  }
                  required
                >
                  {addr.barangay && (
                    <option value={addr.barangay}>{addr.barangay}</option>
                  )}
                </FloatingLabelSelect>
                <FloatingLabelInput
                  label="Zip Code"
                  value={addr.zipCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAddress(addr.id, { zipCode: e.target.value })
                  }
                  required
                />
              </Grid>
            </Box>
          ))}
        </Flex>
      </InputCardAccordion>

      <InputCardAccordion
        icon={<LuPhone />}
        title="Contact Information"
        subtitle="Manage agent contact details"
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
          <PrimaryMdButton
            onClick={async () => {
              const confirmed = await messageBox({
                title: "CONFIRMATION",
                message: "Save changes to this agent's information?",
                confirmText: "Yes",
                cancelText: "No",
                variant: "confirmation",
              });
              if (!confirmed) return;
              if (successLink) {
                router.push(successLink);
              } else {
                onSubmitted?.();
              }
            }}
          >
            Save Changes
          </PrimaryMdButton>
        </Flex>
      )}
    </Flex>
  );
};

export default AgentEditForm;
