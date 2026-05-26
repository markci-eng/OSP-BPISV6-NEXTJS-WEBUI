"use client";

import React from "react";
import { Box, Flex, Separator, Strong } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";
import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import { ClaimInfoState, PayeeInfo, composePayeeName } from "./claims.types";
import Summary from "@/components/forms/Summary";

interface ClaimFormSummaryProps {
  planholder?: PlanholderInfoType;
  claimInfo: ClaimInfoState;
  payees: PayeeInfo[];
}

const composePlanholderName = (p?: PlanholderInfoType): string => {
  if (!p) return "—";
  return (
    [p.firstName, p.middleName, p.lastName, p.suffix]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
};

const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ClaimFormSummary = ({
  planholder,
  claimInfo,
  payees,
}: ClaimFormSummaryProps) => {
  const isPlural = payees.length > 1;

  return (
      <Summary
        title="Claim Summary"
        subtitle="Verify the information below before submitting the claim."
        data={[
          {
            title: "Planholder Information",
            data: [
              { label: "Name", value: composePlanholderName(planholder) },
              {
                label: "Date of Birth",
                value: formatDate(planholder?.dateOfBirth?.toDateString()),
              },
              { label: "Gender", value: planholder?.gender ?? "—" },
              { label: "Civil Status", value: planholder?.civilStatus ?? "—" },
              { label: "Nationality", value: planholder?.nationality ?? "—" },
            ],
          },
          {
            title: "Claim Information",
            data: [
              { label: "LPA Number", value: planholder?.lpaNumber ?? "—" },
              {
                label: "Incident Date",
                value: formatDate(claimInfo.incidentDate),
              },
              { label: "Incident Type", value: claimInfo.incidentType || "—" },
              { label: "Claim Type", value: claimInfo.claimType || "—" },
            ],
          },
        ]}
      >
        <Summary.BottomBox>
          <Box px={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }}>
            <Strong color="var(--chakra-colors-primary)">
              {isPlural ? `Claimants (${payees.length})` : "Claimant"}
            </Strong>

            <Separator my={3} />

            <Flex flexDir="column" gap={4} mt={3} px={1}>
              {payees.length === 0 ? (
                <Box
                  p={6}
                  borderRadius="md"
                  borderWidth={1}
                  borderStyle="dashed"
                  borderColor="border"
                  textAlign="center"
                  color="gray.500"
                >
                  No claimants have been added.
                </Box>
              ) : (
                payees.map((payee, index) => (
                  <Box
                    key={payee.id}
                    pt={index === 0 ? 0 : 5}
                    borderTopWidth={index === 0 ? 0 : 1}
                    borderColor="border"
                    px={1}
                  >
                    <Flex gap={2} align="center" mb={4}>
                      <Strong fontSize="md">
                        {composePayeeName(payee)}
                      </Strong>
                    </Flex>

                    <Flex flexDir="column" gap={{ base: 2, md: 4 }}>
                      <Summary.Box
                        title=""
                        data={[
                          {
                            label: "Relationship",
                            value: payee.relToPh || "—",
                          },
                          { label: "Email", value: payee.email || "—" },
                          {
                            label: "Contact",
                            value: payee.contactNumber || "—",
                          },
                        ]}
                      />

                      <Box>
                        <Flex gap={2} align="center" mb={4}>
                          <Strong fontSize="md">
                            Bank / Payout Information
                          </Strong>
                        </Flex>
                        <Summary.Box
                          title=""
                          data={[
                            {
                              label: "Payout Channel",
                              value: payee.channel || "—",
                            },
                            { label: "Bank Name", value: payee.bankName || "—" },
                            {
                              label: "Account Name",
                              value: payee.accountName || "—",
                            },
                            {
                              label: "Account No.",
                              value: payee.accountNo || "—",
                            },
                          ]}
                        />
                      </Box>

                    </Flex>
                  </Box>
                ))
              )}
            </Flex>
          </Box>
        </Summary.BottomBox>
      </Summary>
  );
};

export default ClaimFormSummary;
