import React, { useState } from "react";
import { Box, Flex, Grid, IconButton } from "@chakra-ui/react";
import {
  InputFloatingLabel,
  PrimaryMdButton,
  SecondaryMdButton,
} from "st-peter-ui";
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
  email: "",
  mobile: "",
  landline: "",
});

const AgentEditForm: React.FC<AgentEditFormProps> = ({
  selectedAgent = mockAgent,
  onCancel,
  onSubmitted,
  hideActions,
}) => {
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
        icon={<LuBriefcase />}
        title="Employment Information"
        subtitle="Update agent employment details"
        isComplete={isEmploymentInfoComplete}
      >
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gapX={2}>
          <InputFloatingLabel
            required
            label="Position"
            value={employmentInfo.position}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ position: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Hire Date"
            value={employmentInfo.hireDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ hireDate: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Employee Status"
            value={employmentInfo.employeeStatus}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ employeeStatus: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Branch"
            value={employmentInfo.branch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ branch: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="Superior ID"
            value={employmentInfo.superiorId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ superiorId: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="SSS Number"
            value={employmentInfo.sssNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ sssNumber: e.target.value })
            }
          />
          <InputFloatingLabel
            required
            label="NBI Number"
            value={employmentInfo.nbiNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateEmploymentInfo({ nbiNumber: e.target.value })
            }
          />
          <InputFloatingLabel
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
