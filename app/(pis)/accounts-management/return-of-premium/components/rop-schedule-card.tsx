"use client";

// ROP Schedule — under the payout details and their proof.
//
// The request's own facts (mobile number, plan, contract price, amount, date
// applied) are `InfoRow`s like the rest of the panel, because they are read,
// not entered. The release it is, its status, the remarks and the notes are
// what the processor sets, so those are fields.
//
// It edits local state only; there is nowhere to persist it to yet.

import { useEffect, useState } from "react";
import { Box, Flex, Text, Textarea } from "@chakra-ui/react";
import { FloatingLabelSelect } from "osp-ui-kit";

import { InfoRow } from "../../components/section-card";
import {
  ROP_NOTES_MAX_LENGTH,
  ROP_SCHEDULE_OPTIONS,
  ROP_SCHEDULE_REMARKS_OPTIONS,
  ROP_SCHEDULE_STATUS_OPTIONS,
} from "../data/data";
import type {
  RopSchedule,
  RopScheduleNo,
  RopScheduleRemarks,
  RopScheduleStatus,
} from "../data/types";

/** MM/DD/YYYY, matching the ROP Details card. */
function ledgerDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export interface RopScheduleCardProps {
  schedule: RopSchedule;
}

export function RopScheduleCard({ schedule }: RopScheduleCardProps) {
  const [draft, setDraft] = useState<RopSchedule>(schedule);

  // Reset whenever the user moves to another record — the panel keeps this
  // card mounted, and one request's edits do not belong to the next.
  useEffect(() => {
    setDraft(schedule);
  }, [schedule]);

  const set = <K extends keyof RopSchedule>(key: K, value: RopSchedule[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // No card of its own: the "ROP Schedule" title strip is on the panel's card
  // that holds this and the validation lists together.
  return (
    <Flex direction="column" gap={3}>
      <Flex direction="column" gap={1}>
        <InfoRow
          label="Mobile No."
          value={
            <span style={{ fontFamily: "var(--chakra-fonts-mono)" }}>
              {draft.mobileNo}
            </span>
          }
        />
        <InfoRow label="Plan Code" value={draft.planCode} />
        <InfoRow
          label="Contract Price"
          value={peso.format(draft.contractPrice)}
        />
      </Flex>

      <FloatingLabelSelect
        label="ROP Schedule"
        value={draft.scheduleNo}
        onValueChange={(value) => set("scheduleNo", value as RopScheduleNo)}
      >
        {ROP_SCHEDULE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FloatingLabelSelect>

      <Flex direction="column" gap={1}>
        <InfoRow label="Amount" value={peso.format(draft.amount)} />
        <InfoRow label="Date Applied" value={ledgerDate(draft.dateApplied)} />
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={3}>
        <Box flex="1" minW={0}>
          <FloatingLabelSelect
            label="Status"
            value={draft.status}
            onValueChange={(value) => set("status", value as RopScheduleStatus)}
          >
            {ROP_SCHEDULE_STATUS_OPTIONS.map((option) => (
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
              set("remarks", value as RopScheduleRemarks)
            }
          >
            {ROP_SCHEDULE_REMARKS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FloatingLabelSelect>
        </Box>
      </Flex>

      <Box>
        <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
          Notes
        </Text>
        <Textarea
          value={draft.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={ROP_NOTES_MAX_LENGTH}
          placeholder="Add notes about this schedule"
          rows={4}
          resize="vertical"
          fontSize="sm"
        />
        <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
          {draft.notes.length}/{ROP_NOTES_MAX_LENGTH}
        </Text>
      </Box>
    </Flex>
  );
}

export default RopScheduleCard;
