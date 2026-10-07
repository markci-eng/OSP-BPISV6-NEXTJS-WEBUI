"use client";

// One party to the transfer — the transferor or the transferee — as ONE CARD
// (user, 2026-09-30): their details on the left 40%, the IDs they submitted
// on the right 60% (user, 2026-10-02), with a vertical rule between them. Below `lg` the halves
// stack and the rule turns horizontal.
//
// Shared by both parties so the two cards cannot drift apart; each passes its
// own title, badge and details list.

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

import {
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import type { TransferSubmittedId } from "../data/types";
import {
  IdCounter,
  TransferSubmittedIdsViewer,
  useIdCarousel,
} from "./transfer-submitted-ids-card";

/** "LAST, FIRST MIDDLE", leaving the middle name off when there is none. */
export function partyName({
  lastName,
  firstName,
  middleName,
}: {
  lastName: string;
  firstName: string;
  middleName: string;
}): string {
  return `${lastName}, ${[firstName, middleName].filter(Boolean).join(" ")}`;
}

/**
 * The small caption over each half, naming what the half holds. Shared with
 * ROP's payout fold, which splits the same way.
 */
export function ColumnHeading({
  children,
  action,
}: {
  children: string;
  action?: ReactNode;
}) {
  return (
    <Flex align="center" justify="space-between" gap={2} mb={2} minH="18px">
      <Text
        fontSize="2xs"
        fontWeight="semibold"
        color="gray.600"
        textTransform="uppercase"
        letterSpacing="wider"
        truncate
      >
        {children}
      </Text>
      {action}
    </Flex>
  );
}

export interface TransferPartyCardProps {
  icon: ReactNode;
  /** "Transferor" or "Transferee". */
  title: string;
  /** The badge at the right of the title strip. */
  action?: ReactNode;
  /** The party's details, for the left half. They set the card's height. */
  details: ReactNode;
  /** The party's proofs of identity, in the order they were filed. */
  documents: TransferSubmittedId[];
}

export function TransferPartyCard({
  icon,
  title,
  action,
  details,
  documents,
}: TransferPartyCardProps) {
  const carousel = useIdCarousel(documents);

  return (
    <SectionCard
      icon={icon}
      title={title}
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      action={action}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        align="stretch"
        minW={0}
      >
        {/* THE DETAILS, the left half. */}
        <Flex
          direction="column"
          w={{ base: "full", lg: "40%" }}
          flexShrink={0}
          minW={0}
          pr={{ base: 0, lg: 4 }}
        >
          <ColumnHeading>Details</ColumnHeading>
          {details}
        </Flex>

        {/* THE DIVIDING RULE — vertical beside, horizontal once stacked. */}
        <Box
          flexShrink={0}
          alignSelf="stretch"
          borderLeftWidth={{ base: 0, lg: "1px" }}
          borderTopWidth={{ base: "1px", lg: 0 }}
          borderColor="border.muted"
          my={{ base: 3, lg: 0 }}
        />

        {/* THE SUBMITTED IDS, the right half. OUT OF FLOW ON `lg`, so the
            viewer is exactly as tall as the details beside it rather than as
            tall as the scan it happens to show. */}
        <Box
          flex="1"
          minW={0}
          position={{ base: "static", lg: "relative" }}
        >
          <Flex
            direction="column"
            position={{ base: "static", lg: "absolute" }}
            inset={0}
            pl={{ base: 0, lg: 4 }}
          >
            <ColumnHeading action={<IdCounter carousel={carousel} />}>
              Submitted IDs
            </ColumnHeading>
            <TransferSubmittedIdsViewer documents={documents} carousel={carousel} />
          </Flex>
        </Box>
      </Flex>
    </SectionCard>
  );
}

export default TransferPartyCard;
