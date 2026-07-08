"use client";

import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { RowItem } from "@/claude components/info-card/row-item";
import { Box, Flex, Separator, Text } from "@chakra-ui/react";
import {
  LuBriefcase,
  LuFileText,
  LuHouse,
  LuUser,
  LuWallet,
} from "react-icons/lu";

import {
  computeAmortizationSchedule,
  formatLoanCurrency,
  initialLoanApplicantInfo,
  LoanAddressInfo,
  LoanApplicantInfo,
} from "./loan-application";
import type { LoanRecord } from "@/app/plan-management/planholder/[personId]/loan/loan-select-plan";

const MOCK_SELECTED_PLANS: LoanRecord[] = [
  {
    lpaNo: "L12345678G",
    planType: "ST. DOROTHY",
    status: "Fully Paid",
    terminationStatus: "Not Yet Terminated",
    indicativeLoanAmount: 24800,
  },
];

const AddressRowItem = ({ label, value }: { label: string; value: string }) => (
  <Flex
    direction={{ base: "column", sm: "row" }}
    align={{ base: "flex-start", sm: "center" }}
    py={1.5}
    fontSize="sm"
  >
    <Text color="gray.500" whiteSpace="nowrap">
      {label}
    </Text>
    <Box
      display={{ base: "none", sm: "block" }}
      flex="1"
      mx={3}
      borderBottom="1px dashed"
      borderColor="gray.300"
      transform="translateY(2px)"
    />
    <Text
      fontWeight="medium"
      textAlign={{ base: "left", sm: "right" }}
      whiteSpace={{ base: "normal", sm: "nowrap" }}
      wordBreak="break-word"
    >
      {value}
    </Text>
  </Flex>
);

const formatAddress = (address: LoanAddressInfo): string => {
  const parts = [
    address.number,
    address.street,
    address.barangay,
    address.district,
    address.city,
    address.province,
    address.zip,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

export default function LoanApplicationPage({
  applicantInfo = initialLoanApplicantInfo,
  selectedPlans = MOCK_SELECTED_PLANS,
}: {
  applicantInfo?: LoanApplicantInfo;
  selectedPlans?: LoanRecord[];
}) {
  const totalIndicativeLoanAmount = selectedPlans.reduce(
    (sum, plan) => sum + plan.indicativeLoanAmount,
    0,
  );
  const amortizationSchedule = computeAmortizationSchedule(
    totalIndicativeLoanAmount,
    Number(applicantInfo.loanTerm),
  );
  const monthlyAmortization = amortizationSchedule[0]?.amortization ?? 0;

  const fullName =
    [
      applicantInfo.fullName.firstName,
      applicantInfo.fullName.middleName,
      applicantInfo.fullName.lastName,
      applicantInfo.fullName.suffix,
    ]
      .filter(Boolean)
      .join(" ") || "—";

  return (
    <Flex direction={"column"} gap={5}>
      <InfoCardAccordion
        icon={<LuFileText />}
        title={"Plan Details"}
        subtitle={`${selectedPlans.length} plan(s) selected`}
        defaultOpen
      >
        {selectedPlans.length === 0 ? (
          <RowItem label="Plan" value="—" />
        ) : (
          selectedPlans.map((plan, index) => (
            <Box key={plan.lpaNo}>
              {index > 0 && <Separator my={2} />}
              <RowItem label="LPA Number" value={plan.lpaNo} />
              <RowItem label="Plan Type" value={plan.planType} />
              <RowItem label="Account Status" value={plan.status} />
              <RowItem
                label="Termination Status"
                value={plan.terminationStatus}
              />
            </Box>
          ))
        )}
      </InfoCardAccordion>
      <InfoCardAccordion
        icon={<LuWallet />}
        title={"Loan Details"}
        subtitle="Loan amount, term, and amortization"
        defaultOpen
      >
        <RowItem
          label="Indicative Loan Amount"
          value={formatLoanCurrency(totalIndicativeLoanAmount)}
        />
        <RowItem
          label="Loan Term"
          value={
            applicantInfo.loanTerm ? `${applicantInfo.loanTerm} Months` : "—"
          }
        />
        <RowItem
          label="Monthly Amortization"
          value={formatLoanCurrency(monthlyAmortization)}
        />
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<LuUser />}
        title={"Personal Info"}
        subtitle="Planholder identification and details"
        defaultOpen
      >
        <RowItem label="Full Name" value={fullName} />
        <RowItem label="Birthdate" value={applicantInfo.birthdate || "—"} />
        <RowItem label="Age" value={applicantInfo.age || "—"} />
        <RowItem
          label="Contact Number"
          value={applicantInfo.contactNumber || "—"}
        />
        <RowItem label="Email Address" value={applicantInfo.email || "—"} />
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<LuHouse />}
        title={"Residential Address"}
        subtitle="Present and permanent address"
        defaultOpen
      >
        <AddressRowItem
          label="Present Address"
          value={formatAddress(applicantInfo.presentAddress)}
        />
        <AddressRowItem
          label="Permanent Address"
          value={
            applicantInfo.isSameAddress
              ? "Same as Present Address"
              : formatAddress(applicantInfo.permanentAddress)
          }
        />
      </InfoCardAccordion>

      <InfoCardAccordion
        icon={<LuBriefcase />}
        title={"Employment"}
        subtitle="Work related details"
        defaultOpen
      >
        <RowItem label="Occupation" value={applicantInfo.occupation || "NA"} />
      </InfoCardAccordion>
    </Flex>
  );
}
