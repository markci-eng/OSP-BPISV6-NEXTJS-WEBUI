"use client";

// The CSV panel's one card — ROP's planholder card and ROP details card in a
// single block.
//
// THE IDENTITY ROW ON TOP is ROP's planholder card in its embedded horizontal
// layout: avatar, name with the Edit PH Info pencil, the LPA number, birthdate
// and age, and the request's status. Under it run the plan's facts in the
// dashed-leader rows ROP Details draws, then a second green strip for the
// COFP details.

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { OSPBadge } from "osp-ui-kit";
import { ShieldCheck, User } from "lucide-react";

import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import { RopPlanholderCard } from "../../return-of-premium/components/rop-planholder-card";
import { CSV_STATUS_BADGE } from "../data/data";
import type { CsvRecord } from "../data/types";

/** MM/DD/YYYY, which is how the ledger prints a date. */
function ledgerDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

/**
 * A title strip inside the card, the same look as `SectionCard`'s own, run
 * edge to edge so it reads as a new block rather than another row.
 */
function SubSectionStrip({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Flex
      align="center"
      gap={2}
      mx={-4}
      my={2}
      px={4}
      py={2}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="green.100"
      borderLeftWidth="3px"
      borderLeftColor="green.500"
      bg="green.50"
    >
      <Box color="green.700" display="flex">
        {icon}
      </Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="green.700"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {title}
      </Text>
    </Flex>
  );
}

const ACCOUNT_STATUS_BADGE: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  LAPSED: "warning",
  FORFEITED: "danger",
};

export interface CsvPlanholderCardProps {
  record: CsvRecord;
  /** Opens Edit PH Info. */
  onEdit?: () => void;
}

export function CsvPlanholderCard({ record, onEdit }: CsvPlanholderCardProps) {
  return (
    <SectionCard
      icon={<User size={14} />}
      title="Planholder Information"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
    >
      <Box pb={3} mb={1} borderBottomWidth="1px" borderColor="gray.100">
        <RopPlanholderCard
          orientation="horizontal"
          embedded
          name={record.planholderName}
          lpaNo={record.lpaNo}
          personId={record.personId}
          birthdate={record.birthdate}
          status={{
            label: record.status,
            type: CSV_STATUS_BADGE[record.status],
          }}
          onEdit={onEdit}
        />
      </Box>

      <Flex direction="column" gap={1}>
        <InfoRow label="CSV No." value={record.csvNo} />
        <InfoRow label="Branch" value={record.branchCode} />
        <InfoRow
          label="Plan Description"
          value={<OSPBadge type="info">{record.planDescription}</OSPBadge>}
        />
        <InfoRow
          label="New Effectivity Date"
          value={ledgerDate(record.newEffectivityDate)}
        />
        <InfoRow
          label="Account Status"
          value={
            <OSPBadge type={ACCOUNT_STATUS_BADGE[record.accountStatus] ?? "info"}>
              {record.accountStatus}
            </OSPBadge>
          }
        />
        <InfoRow label="Termination Status" value={record.terminationStatus} />
        <InfoRow
          label="Loan Status"
          value={
            <OSPBadge type={record.loanStatus === "CLEARED" ? "info" : "danger"}>
              {record.loanStatus}
            </OSPBadge>
          }
        />

        <SubSectionStrip
          icon={<ShieldCheck size={14} />}
          title="COFP Details"
        />

        <InfoRow
          label="COFP No."
          value={
            record.cofpNo ? (
              <Text as="span" fontFamily="mono">
                {record.cofpNo}
              </Text>
            ) : undefined
          }
        />
        <InfoRow
          label="Confiscated"
          value={
            <OSPBadge type={record.confiscated ? "danger" : "success"}>
              {record.confiscated ? "YES" : "NO"}
            </OSPBadge>
          }
        />
      </Flex>
    </SectionCard>
  );
}

export default CsvPlanholderCard;
