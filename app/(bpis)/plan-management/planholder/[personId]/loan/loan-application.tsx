"use client";

import React from "react";
import {
  Box,
  createListCollection,
  Flex,
  Grid,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  InputFloatingLabel,
  SelectFloatingLabel,
  TertiarySmButton,
} from "st-peter-ui";
import {
  LuBriefcase,
  LuChevronsDown,
  LuChevronsUp,
  LuHouse,
  LuUser,
  LuWallet,
} from "react-icons/lu";

import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";
import { LoanRecord } from "./loan-select-plan";

export interface LoanAddressInfo {
  number: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zip: string;
}

export interface LoanApplicantInfo {
  fullName: {
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
  };
  birthdate: string;
  age: string;
  contactNumber: string;
  email: string;
  presentAddress: LoanAddressInfo;
  permanentAddress: LoanAddressInfo;
  isSameAddress: boolean;
  occupation: string;
  loanTerm: string;
}

export interface AmortizationScheduleRow {
  period: number;
  amortization: number;
  balance: number;
}

export const computeAmortizationSchedule = (
  principal: number,
  termMonths: number,
): AmortizationScheduleRow[] => {
  if (!principal || !termMonths) return [];

  const monthlyAmortization = principal / termMonths;

  let balance = principal;
  const schedule: AmortizationScheduleRow[] = [];

  for (let period = 1; period <= termMonths; period++) {
    balance -= monthlyAmortization;
    schedule.push({
      period,
      amortization: monthlyAmortization,
      balance: Math.max(balance, 0),
    });
  }

  return schedule;
};

export const formatLoanCurrency = (value: number): string =>
  `₱ ${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const blankLoanAddress = (): LoanAddressInfo => ({
  number: "",
  street: "",
  barangay: "",
  district: "",
  city: "",
  province: "",
  zip: "",
});

export const computeAge = (dob: string): string => {
  if (!dob) return "";

  const today = new Date();
  const birth = new Date(dob);
  let computedAge = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    computedAge--;
  }

  return String(computedAge);
};

export const initialLoanApplicantInfo: LoanApplicantInfo = {
  fullName: {
    lastName: "Dela Cruz",
    firstName: "Juan",
    middleName: "Sipag",
    suffix: "",
  },
  birthdate: "1995-05-01",
  age: computeAge("1995-05-01"),
  contactNumber: "09123456789",
  email: "juan.delacruz@gmail.com",
  presentAddress: {
    number: "123",
    street: "Duhat",
    barangay: "Brgy Manggahan",
    district: "District 1",
    city: "Sampaloc",
    province: "Manila",
    zip: "1234",
  },
  permanentAddress: blankLoanAddress(),
  isSameAddress: false,
  occupation: "",
  loanTerm: "12",
};

interface LoanInfoFormProps {
  planholder?: PlanholderInfoType;
  value: LoanApplicantInfo;
  onChange: (next: LoanApplicantInfo) => void;
  selectedPlans?: LoanRecord[];
}

const occupationOptions = createListCollection({
  items: [
    "Teacher",
    "Engineer",
    "Doctor",
    "Nurse",
    "Business Owner",
    "Student",
    "Other",
  ].map((occ) => ({ value: occ, label: occ })),
});

const loanTermOptions = createListCollection({
  items: ["3", "6", "9", "12"].map((term) => ({
    value: term,
    label: `${term} Months`,
  })),
});

const SECTIONS = ["loan", "personal", "address", "employment"] as const;

const LoanInfoForm = ({
  value,
  onChange,
  selectedPlans = [],
}: LoanInfoFormProps) => {
  const {
    fullName,
    birthdate,
    age,
    contactNumber,
    email,
    presentAddress,
    permanentAddress,
    isSameAddress,
    occupation,
    loanTerm,
  } = value;

  const totalIndicativeLoanAmount = selectedPlans.reduce(
    (sum, plan) => sum + plan.indicativeLoanAmount,
    0,
  );
  const amortizationSchedule = computeAmortizationSchedule(
    totalIndicativeLoanAmount,
    Number(loanTerm),
  );
  const monthlyAmortization = amortizationSchedule[0]?.amortization ?? 0;

  const [openSections, setOpenSections] = React.useState<string[]>([
    "loan",
    "personal",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const expandAll = () => setOpenSections([...SECTIONS]);
  const collapseAll = () => setOpenSections([]);

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange({
      ...value,
      isSameAddress: checked,
      permanentAddress: checked ? { ...presentAddress } : blankLoanAddress(),
    });
  };

  return (
    <Box>
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={2}
      >
        <InfoCard>
          Sections are expandable and collapsible — use them to focus only on
          relevant details.
        </InfoCard>

        <Flex gap={2} justify="flex-end">
          <TertiarySmButton onClick={expandAll} type="button">
            <LuChevronsDown size={14} />
            Expand All
          </TertiarySmButton>
          <TertiarySmButton onClick={collapseAll} type="button">
            <LuChevronsUp size={14} />
            Collapse All
          </TertiarySmButton>
        </Flex>
      </Flex>
      <Flex flexDir="column" gap={4} mt={5}>
        {/* Loan Details */}
        <InfoCardAccordion
          icon={<LuWallet />}
          title="Loan Details"
          subtitle="Indicative loan amount, term, and amortization"
          isOpen={openSections.includes("loan")}
          onToggle={() => toggleSection("loan")}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={3}
            mt={2}
          >
            <InputFloatingLabel
              key={totalIndicativeLoanAmount}
              label="Indicative Loan Amount"
              value={formatLoanCurrency(totalIndicativeLoanAmount)}
              readOnly
            />
            <SelectFloatingLabel
              label="Loan Term"
              collection={loanTermOptions}
              value={loanTerm ? [loanTerm] : []}
              onValueChanged={(val: string[]) =>
                onChange({ ...value, loanTerm: val[0] ?? "" })
              }
            />
          </Grid>

          {amortizationSchedule.length > 0 && (
            <Box mt={4}>
              <RowItem
                label="Monthly Amortization"
                value={formatLoanCurrency(monthlyAmortization)}
              />
            </Box>
          )}
        </InfoCardAccordion>

        {/* Personal Info */}
        <InfoCardAccordion
          icon={<LuUser />}
          title={"Personal Info"}
          subtitle="Planholder identification and details"
          isOpen={openSections.includes("personal")}
          onToggle={() => toggleSection("personal")}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={3}
            mt={2}
          >
            <InputFloatingLabel
              label="Last Name"
              value={fullName.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  fullName: { ...fullName, lastName: e.target.value },
                })
              }
              required
            />
            <InputFloatingLabel
              label="First Name"
              value={fullName.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  fullName: { ...fullName, firstName: e.target.value },
                })
              }
              required
            />
            <InputFloatingLabel
              label="Middle Name"
              value={fullName.middleName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  fullName: { ...fullName, middleName: e.target.value },
                })
              }
            />
            <InputFloatingLabel
              label="Suffix (Optional)"
              value={fullName.suffix}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  fullName: { ...fullName, suffix: e.target.value },
                })
              }
            />
            <InputFloatingLabel
              label="Birthdate"
              type="date"
              value={birthdate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  birthdate: e.target.value,
                  age: computeAge(e.target.value),
                })
              }
              required
            />
            <InputFloatingLabel
              label="Age"
              type="number"
              value={age}
              readOnly
            />
            <InputFloatingLabel
              label="Contact Number"
              value={contactNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...value, contactNumber: e.target.value })
              }
              required
            />
            <InputFloatingLabel
              label="Email Address"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...value, email: e.target.value })
              }
              required
            />
          </Grid>
        </InfoCardAccordion>

        {/* Residential Address */}
        <InfoCardAccordion
          icon={<LuHouse />}
          title="Residential Address"
          subtitle="Present and permanent address"
          isOpen={openSections.includes("address")}
          onToggle={() => toggleSection("address")}
        >
          <Text fontWeight="bold" fontSize="sm" mt={2} mb={1}>
            Present Address
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
            <InputFloatingLabel
              label="Address Number"
              value={presentAddress.number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: { ...presentAddress, number: e.target.value },
                })
              }
            />
            <InputFloatingLabel
              label="Street"
              value={presentAddress.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: { ...presentAddress, street: e.target.value },
                })
              }
            />
            <InputFloatingLabel
              label="Barangay"
              value={presentAddress.barangay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: {
                    ...presentAddress,
                    barangay: e.target.value,
                  },
                })
              }
            />
            <InputFloatingLabel
              label="District"
              value={presentAddress.district}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: {
                    ...presentAddress,
                    district: e.target.value,
                  },
                })
              }
            />
            <InputFloatingLabel
              label="City"
              value={presentAddress.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: { ...presentAddress, city: e.target.value },
                })
              }
            />
            <InputFloatingLabel
              label="Province"
              value={presentAddress.province}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: {
                    ...presentAddress,
                    province: e.target.value,
                  },
                })
              }
            />
            <InputFloatingLabel
              label="ZIP Code"
              type="number"
              value={presentAddress.zip}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  presentAddress: { ...presentAddress, zip: e.target.value },
                })
              }
            />
          </Grid>

          <HStack mt={4} mb={1} alignItems="center">
            <input
              type="checkbox"
              id="sameAddress"
              checked={isSameAddress}
              onChange={handleSameAddressChange}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "green",
                cursor: "pointer",
              }}
            />
            <Text fontSize="sm">Same as Present Address</Text>
          </HStack>

          <Text fontWeight="bold" fontSize="sm" mt={3} mb={1}>
            Permanent Address
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
            <InputFloatingLabel
              key={`permanent-number-${isSameAddress}`}
              label="Address Number"
              value={permanentAddress.number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    number: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-street-${isSameAddress}`}
              label="Street"
              value={permanentAddress.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    street: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-barangay-${isSameAddress}`}
              label="Barangay"
              value={permanentAddress.barangay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    barangay: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-district-${isSameAddress}`}
              label="District"
              value={permanentAddress.district}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    district: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-city-${isSameAddress}`}
              label="City"
              value={permanentAddress.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    city: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-province-${isSameAddress}`}
              label="Province"
              value={permanentAddress.province}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    province: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
            <InputFloatingLabel
              key={`permanent-zip-${isSameAddress}`}
              label="ZIP Code"
              type="number"
              value={permanentAddress.zip}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({
                  ...value,
                  permanentAddress: {
                    ...permanentAddress,
                    zip: e.target.value,
                  },
                })
              }
              disabled={isSameAddress}
            />
          </Grid>
        </InfoCardAccordion>

        {/* Employment */}
        <InfoCardAccordion
          icon={<LuBriefcase />}
          title="Employment"
          subtitle="Work related details"
          isOpen={openSections.includes("employment")}
          onToggle={() => toggleSection("employment")}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={3}
            mt={2}
          >
            <SelectFloatingLabel
              label="Occupation"
              collection={occupationOptions}
              value={occupation ? [occupation] : []}
              onValueChanged={(val: string[]) =>
                onChange({ ...value, occupation: val[0] ?? "" })
              }
            />
          </Grid>
        </InfoCardAccordion>
      </Flex>
    </Box>
  );
};

export default LoanInfoForm;
