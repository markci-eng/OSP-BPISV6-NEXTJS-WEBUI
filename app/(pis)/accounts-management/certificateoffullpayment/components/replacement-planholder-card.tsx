"use client";

// Planholder Information for the Replacement request picked under Branch (user,
// 2026-10-06) — the 40% column beside the document viewer, drawn like the CSV
// panel's card: the same title strip and dashed-leader rows.

import { Box, Flex, Text } from "@chakra-ui/react";
import { OSPBadge } from "osp-ui-kit";
import { User } from "lucide-react";

import {
  InfoRow,
  KIT_BORDER,
  KIT_SHADOW,
  SectionCard,
} from "../../components/section-card";
import { RopPlanholderCard } from "../../return-of-premium/components/rop-planholder-card";
import { formatAddress } from "../data/regions";
import type { CofpReplacementDetails } from "../data/replacement-details";
import type { CofpReplacementRequest } from "../data/types";

export interface CofpReplacementPlanholderCardProps {
  request: CofpReplacementRequest;
  details: CofpReplacementDetails;
}

export function CofpReplacementPlanholderCard({
  request,
  details,
}: CofpReplacementPlanholderCardProps) {
  const address = formatAddress(request.address);

  return (
    <SectionCard
      icon={<User size={14} />}
      title="Planholder Information"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      // The request's status at the right end of the title strip (user,
      // 2026-10-06) rather than among the rows.
      action={
        <OSPBadge type={details.status === "PENDING" ? "warning" : "info"}>
          {details.status}
        </OSPBadge>
      }
    >
      {/* The plan holder's name and LPA number as the CSV and Transfer cards
          head theirs (user, 2026-10-06): avatar, surname-first name, and the
          LPA number under it. Replaces the LPA No. and name rows. */}
      <Box pb={3} mb={1} borderBottomWidth="1px" borderColor="gray.100">
        <RopPlanholderCard
          orientation="horizontal"
          embedded
          name={`${request.lastName}, ${request.firstName} ${request.middleName}`}
          lpaNo={request.lpaNo}
          // No person id on a request — the LPA number keys the mock avatar.
          personId={request.lpaNo}
        />
      </Box>

      <Flex direction="column" gap={1}>
        <InfoRow label="Branch" value={request.branch} />
        <InfoRow
          label="COFP No."
          value={
            <Text as="span" fontFamily="mono">
              {request.cofpNo}
            </Text>
          }
        />
        <InfoRow label="Termination Status" value={details.terminationStatus} />
      </Flex>

      {/* The address under the rows, drawn like the Remarks box on the
          Planholder Remarks and Notes card (user, 2026-10-06): a label over a
          plain box that grows with the text, so the whole line is read. */}
      <Box mt={3}>
        <Text
          fontSize="xs"
          fontWeight="700"
          color="gray.700"
          textTransform="uppercase"
          letterSpacing="wide"
          mb={1.5}
        >
          Address:
        </Text>
        <Box
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          px={3}
          py={2.5}
          fontFamily="mono"
          fontSize="xs"
          lineHeight="1.7"
          color={address ? "gray.700" : "gray.400"}
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {address || "No address on file."}
        </Box>
      </Box>
    </SectionCard>
  );
}

export default CofpReplacementPlanholderCard;
