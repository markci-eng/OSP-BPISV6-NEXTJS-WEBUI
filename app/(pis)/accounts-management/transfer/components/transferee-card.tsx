"use client";

// Transferee Details — the person the plan is being transferred to. Stands
// beside the Transferor Details card, with its Valid ID card under it.
//
// READ-ONLY: `InfoRow`s, compact, labels allowed two lines, an em dash where a
// field has nothing in it.

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { UserRoundPlus } from "lucide-react";
import { OSPBadge } from "osp-ui-kit";

import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import { RopPlanholderCard } from "../../return-of-premium/components/rop-planholder-card";
import type {
  TransfereeBeneficiary,
  TransfereeDetails,
} from "../data/types";
import { ColumnHeading, partyName } from "./transfer-party-card";

/** The same row as the Transferor Details card's. */
function Row(props: { label: string; value?: ReactNode; valueWrap?: boolean }) {
  return <InfoRow {...props} labelWrap compact />;
}

/**
 * The designated beneficiaries: a heading with the count, then one tile per
 * beneficiary in the order named — its number, the name, and the relationship
 * in a read-only box at the right.
 *
 * TILES RATHER THAN `InfoRow`s: a beneficiary is a person with an attribute,
 * not a labelled fact, and the numbered tile keeps the naming order visible.
 */
function Beneficiaries({
  beneficiaries,
}: {
  beneficiaries: TransfereeBeneficiary[];
}) {
  const count = beneficiaries.length;

  return (
    <Box mt={3} pt={3} borderTopWidth="1px" borderColor="border.muted">
      <Flex align="center" justify="space-between" gap={2} mb={1.5}>
        <Text
          fontSize="2xs"
          fontWeight="semibold"
          color="gray.600"
          textTransform="uppercase"
          letterSpacing="wider"
          truncate
        >
          Designated Beneficiaries ({count})
        </Text>
        {count > 0 && <OSPBadge type="success">Designated</OSPBadge>}
      </Flex>

      {count === 0 ? (
        // Said in words rather than left blank, so no beneficiaries reads as
        // a fact about the transferee rather than a section that failed to
        // load.
        <Text fontSize="xs" color="gray.500" py={1}>
          No beneficiaries designated.
        </Text>
      ) : (
        <Flex direction="column" gap={1.5}>
          {beneficiaries.map((beneficiary, i) => (
            <BeneficiaryTile
              key={`${beneficiary.name}-${i}`}
              number={i + 1}
              beneficiary={beneficiary}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}

/**
 * One beneficiary: its number, the name, and the relationship in a read-only
 * box at the right.
 */
function BeneficiaryTile({
  number,
  beneficiary,
}: {
  number: number;
  beneficiary: TransfereeBeneficiary;
}) {
  return (
    <Flex
      align="center"
      gap={2}
      px={2.5}
      py={1.5}
      bg="gray.50"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      minW={0}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="18px"
        flexShrink={0}
        borderRadius="full"
        bg="green.700"
        color="white"
        fontSize="2xs"
        fontWeight="bold"
      >
        {number}
      </Flex>
      <Text
        flex="1"
        minW={0}
        fontSize="sm"
        fontWeight="semibold"
        color="gray.800"
        truncate
      >
        {beneficiary.name}
      </Text>
      {/* Drawn as a field, as in the form it was filed on, but only shown —
          the card is read-only. */}
      <Text
        flexShrink={0}
        minW="80px"
        maxW="45%"
        px={2}
        py={0.5}
        fontSize="xs"
        color="gray.700"
        bg="bg"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="sm"
        truncate
      >
        {beneficiary.relationship}
      </Text>
    </Flex>
  );
}

export interface TransfereeCardProps {
  transferee: TransfereeDetails;
  /** The plan being transferred — the transferee takes it on under this LPA. */
  lpaNo: string;
  /** The transfer's person id; keys the transferee's own avatar from it. */
  personId: string;
}

export function TransfereeCard({
  transferee,
  lpaNo,
  personId,
}: TransfereeCardProps) {
  const { beneficiaries } = transferee;

  return (
    <SectionCard
      icon={<UserRoundPlus size={14} />}
      title="Transferee Details"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      fill
    >
      {/* THE TRANSFEREE HEADS IT (user, 2026-09-30), drawn as the Transferor
          card's planholder row: name, LPA number, birthdate, age and
          insurability. The insurability badge lives here rather than in the
          title strip, so it is not shown twice. */}
      <Box pb={3} mb={3} borderBottomWidth="1px" borderColor="border.muted">
        <RopPlanholderCard
          orientation="horizontal"
          embedded
          name={partyName(transferee)}
          lpaNo={lpaNo}
          personId={`${personId}-transferee`}
          birthdate={transferee.dateOfBirth || undefined}
          insurability={transferee.insurable ? "Insurable" : "Not Insurable"}
        />
      </Box>

      <ColumnHeading>Contact &amp; Residency</ColumnHeading>
      <Row
        label="Contact Number"
        value={transferee.contactNumber || undefined}
      />
      {/* The one value long enough to need a second line. */}
      <Row
        label="Registered Address"
        valueWrap
        value={transferee.registeredAddress || undefined}
      />

      <Beneficiaries beneficiaries={beneficiaries} />
    </SectionCard>
  );
}

export default TransfereeCard;
