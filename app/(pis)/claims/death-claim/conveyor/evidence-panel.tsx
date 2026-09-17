"use client";

// THE PINNED COLUMN — who this is, and the actions that are about the PLAN
// rather than about the claim.
//
// IT HAS BEEN EMPTIED OUT ON PURPOSE, TWICE, AND BOTH TIMES FOR THE SAME REASON.
// It began as three counted rows — documents on file, deficiencies outstanding,
// payees named — and two of the three were answered by the sections in the other
// column, in more detail, with buttons on them. A pinned figure you cannot act
// on is a worse copy of a thing already on screen.
//
// Then it led with "Not ready to decide", which reads as the system having
// already worked out the answer. It has not: a claim short of a document may
// still be one the processor sends back, holds, or approves on the strength of
// what is there. That is a judgement, and the judgement is theirs.
//
// And last the named list of missing documents went too. It was the strongest
// thing left — those are precisely what the branch would be asked for if the
// claim goes back — but it is a READING of the folder, pinned beside a folder
// the processor can open for themselves; the deficiencies tab in the other
// column is the same facts, first-hand and actionable. A rail that keeps
// summarising the column beside it is a rail competing with it.
//
// WHAT IS LEFT IS WHAT ONLY THIS COLUMN CAN SAY: whose plan this is, and the
// three things you do to that plan. Nothing here duplicates anything.
//
// AND NOTHING ABOUT THE PLAN HOLDER BEYOND THEIR NAME. Contestability and
// account status have teeth — Within means investigate, Lapsed means it may not
// be payable — and they are deliberately absent, because the plan holder's own
// card in the other column carries them, close enough to be on screen at the
// same time. The rule is not how important a fact is, it is whether a decision
// is being made HERE: a rail carrying Approve and Deny would have to carry what
// changes the verdict, since a fact you must scroll back for is a fact you skip.
// This rail carries plan actions, not the claim's verdict. If the verdict ever
// moves up here, those two come with it — not before.

import { Box, Text } from "@chakra-ui/react";
import { CARD_SHAPE } from "../../components/section-card";
import type { ClaimEvidence } from "./use-claim-evidence";

export function EvidencePanel({ evidence }: { evidence: ClaimEvidence }) {
  const { displayName, lpaNo } = evidence;

  return (
    // The shared shape, not a restatement of it — see `CARD_SHAPE`.
    <Box {...CARD_SHAPE} bg="white" px={4} py={4}>
      {/* THE LABEL NAMES WHAT THE BLOCK IS, not what the card is for. It read
          "Evidence" over a person's name, which asked the reader to think of the
          claimant as evidence; this says plainly whose record this is. */}
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.400"
        mb={2}
      >
        Plan Holder
      </Text>

      {/* The claim card names the claim; this names the person, and the two
          together are the pair a processor checks. */}
      <Text fontSize="sm" fontWeight="700" color="gray.800" lineClamp={2}>
        {displayName}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {lpaNo}
      </Text>

      {/* NO BUTTONS IN THIS CARD. The plan's three — Print SOA, Cancel Plan
          Termination, Consider Plan — sat here briefly, and they are in the
          block of nine above now, on the last row under the claim's six. One
          place in the rail to look for an action, rather than two. */}
    </Box>
  );
}

export default EvidencePanel;
