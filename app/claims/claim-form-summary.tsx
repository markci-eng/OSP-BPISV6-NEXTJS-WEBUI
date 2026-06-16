"use client";

import { Box, Flex, Separator } from "@chakra-ui/react";
import { LuFileBadge2, LuUsers } from "react-icons/lu";

import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import { Card } from "@/claude components/card-accordion/card";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";

import { ClaimInfoState, PayeeInfo, composePayeeName } from "./claims.types";

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
  return (
    <Box py={3}>
      <InfoCard>
        Please review all the information below before submitting. Once
        submitted, changes may require additional processing time.
      </InfoCard>

      <Flex direction="column" gap={4} mt={5}>
        {/* Planholder */}
        <Card
          activeIcon={<LuFileBadge2 />}
          title="Planholder Information"
          subtitle={planholder?.lpaNumber ?? ""}
        >
          <RowItem label="LPA Number" value={planholder?.lpaNumber} />
          <RowItem label="Full Name" value={composePlanholderName(planholder)} />
          <RowItem
            label="Date of Birth"
            value={formatDate(planholder?.dateOfBirth?.toDateString())}
          />
          <RowItem label="Gender" value={planholder?.gender} />
          <RowItem label="Civil Status" value={planholder?.civilStatus} />
          <RowItem label="Nationality" value={planholder?.nationality} />
        </Card>

        {/* Claim Info */}
        <Card
          activeIcon={<LuFileBadge2 />}
          title="Claim Information"
          subtitle=""
        >
          <RowItem
            label="Incident Date"
            value={formatDate(claimInfo.incidentDate)}
          />
          <RowItem label="Incident Type" value={claimInfo.incidentType} />
          <RowItem label="Claim Type" value={claimInfo.claimType} />
        </Card>

        {/* Claimants */}
        {payees.length === 0 ? (
          <Box
            p={6}
            borderRadius="md"
            borderWidth={1}
            borderStyle="dashed"
            borderColor="border"
            textAlign="center"
            color="gray.500"
            fontSize="sm"
          >
            No claimants have been added.
          </Box>
        ) : (
          payees.map((payee) => (
            <Card
              key={payee.id}
              activeIcon={<LuUsers />}
              title={composePayeeName(payee)}
              subtitle={payee.relToPh || "Claimant"}
            >
              <RowItem label="Relationship" value={payee.relToPh} />
              <RowItem label="Email" value={payee.email} />
              <RowItem label="Contact Number" value={payee.contactNumber} />
              <Separator my={3} />
              <RowItem label="Payout Channel" value={payee.channel} />
              <RowItem label="Bank Name" value={payee.bankName} />
              <RowItem label="Account Name" value={payee.accountName} />
              <RowItem label="Account No." value={payee.accountNo} />
            </Card>
          ))
        )}
      </Flex>
    </Box>
  );
};

export default ClaimFormSummary;
