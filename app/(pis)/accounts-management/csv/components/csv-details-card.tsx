"use client";

// CSV Details — the surrender being processed, laid out like ROP's schedule:
// the details on the left, the payout and ID/signature validation beside them.
//
// The request's own facts (plan code, contract price, date applied, the
// termination amounts) are `InfoRow`s, because they are read,
// not entered. The date received, the remarks and the status are what the
// processor sets.
//
// NOTES ARE WRITTEN BY THE VALIDATION LISTS: every ticked finding, payout
// first, shows there. It is read-only so a tick and its note cannot disagree.
//
// It edits local state only; there is nowhere to persist it to yet. The page
// keys this card by record, so moving to another request starts clean.

import { useState } from "react";
import { Box, Flex, Text, Textarea } from "@chakra-ui/react";
import { FloatingLabelInput, FloatingLabelSelect } from "osp-ui-kit";

import { InfoRow } from "../../components/section-card";
import {
  RopValidationCard,
  type RopValidationFindings,
} from "../../return-of-premium/components/rop-validation-card";
import {
  CSV_DETAILS_STATUS_OPTIONS,
  CSV_REMARKS_OPTIONS,
} from "../data/data";
import type { CsvDetails, CsvDetailsRemarks, CsvStatus } from "../data/types";

/** MM/DD/YYYY, matching the ROP cards. */
function ledgerDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export interface CsvDetailsCardProps {
  details: CsvDetails;
}

export function CsvDetailsCard({ details }: CsvDetailsCardProps) {
  const [draft, setDraft] = useState<CsvDetails>(details);
  const [findings, setFindings] = useState<RopValidationFindings>({
    payout: [],
    idSignature: [],
  });

  const set = <K extends keyof CsvDetails>(key: K, value: CsvDetails[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const notes = [...findings.payout, ...findings.idSignature].join("\n");

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      align="stretch"
      gap={4}
      w="full"
      minW={0}
      py={1}
    >
      <Flex
        direction="column"
        gap={3}
        w={{ base: "full", lg: "40%" }}
        minW={0}
        flexShrink={0}
      >
        <Flex direction="column" gap={1}>
          <InfoRow label="Plan Code" value={draft.planCode} />
          <InfoRow
            label="Contract Price"
            value={peso.format(draft.contractPrice)}
          />
          <InfoRow label="Date Applied" value={ledgerDate(draft.dateApplied)} />
        </Flex>

        <FloatingLabelInput
          type="date"
          label="Date Received"
          value={draft.dateReceived}
          onValueChange={(value) => set("dateReceived", value)}
        />

        <Flex direction="column" gap={1}>
          <InfoRow
            label="Termination Amount"
            value={peso.format(draft.terminationAmount)}
          />
          <InfoRow
            label="Excess Termination Value"
            value={peso.format(draft.excessTerminationValue)}
          />
        </Flex>

        <Flex direction={{ base: "column", md: "row" }} gap={3}>
          <Box flex="1" minW={0}>
            <FloatingLabelSelect
              label="Status"
              value={draft.status}
              onValueChange={(value) => set("status", value as CsvStatus)}
            >
              {CSV_DETAILS_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </FloatingLabelSelect>
          </Box>
          <Box flex="1" minW={0}>
            <FloatingLabelSelect
              label="Remarks"
              value={draft.remarks}
              onValueChange={(value) =>
                set("remarks", value as CsvDetailsRemarks)
              }
            >
              {CSV_REMARKS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </FloatingLabelSelect>
          </Box>
        </Flex>

        <Box>
          <Text fontSize="xs" fontWeight="600" color="gray.500">
            Notes
          </Text>
          <Text fontSize="xs" color="gray.400" mb={1}>
            Auto-displays the reasons selected in Payout and ID/Signature
            Validation
          </Text>
          <Textarea
            value={notes}
            readOnly
            placeholder="Select any reason in Payout Validation or ID/Signature Validation to display it here..."
            rows={5}
            resize="vertical"
            fontSize="sm"
            bg="gray.50"
          />
        </Box>
      </Flex>

      {/* Out of flow on `lg`, as on ROP, so the details set the row's height
          and the lists scroll inside it. */}
      <Box flex="1" minW={0} position={{ base: "static", lg: "relative" }}>
        <Box position={{ base: "static", lg: "absolute" }} inset={0}>
          <RopValidationCard onFindingsChange={setFindings} />
        </Box>
      </Box>
    </Flex>
  );
}

export default CsvDetailsCard;
