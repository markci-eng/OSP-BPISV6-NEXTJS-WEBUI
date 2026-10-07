"use client";

// The transferor — the planholder giving up the plan — as one card: details
// beside the IDs they submitted, laid out by the shared `TransferPartyCard`.
//
// THE DETAILS are read-only and drawn with the same `InfoRow` as the ROP
// Details card: dashed leaders, right-aligned values, and an em dash where a
// field has nothing in it. The planholder row heads them — name, LPA number,
// birthdate, age and insurability, drawn as Reinstatement's — then the plan,
// then branches and agents, without a heading between them.

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { UserRound } from "lucide-react";
import { OSPBadge } from "osp-ui-kit";

import { formatFiledDate } from "@/app/(pis)/data";
import { InfoRow } from "../../components/section-card";
import { RopPlanholderCard } from "../../return-of-premium/components/rop-planholder-card";
import type { TransferorDetails, TransferSubmittedId } from "../data/types";
import { partyName, TransferPartyCard } from "./transfer-party-card";

/** A stored date as the page prints it, or nothing for a date not yet set. */
function dateOrEmpty(iso: string): string | undefined {
  return iso ? formatFiledDate(iso) : undefined;
}

/**
 * An `InfoRow` whose label may take two lines — a half-card column is too
 * narrow for "Termination Status" beside "NOT YET TERMINATED" on one.
 */
function Row(props: { label: string; value?: ReactNode }) {
  return <InfoRow {...props} labelWrap compact />;
}

export interface TransferorCardProps {
  transferor: TransferorDetails;
  lpaNo: string;
  /** Keys the avatar, so one planholder keeps one face. */
  personId: string;
  /** The transferor's proofs of identity, in the order they were filed. */
  documents: TransferSubmittedId[];
}

export function TransferorCard({
  transferor,
  lpaNo,
  personId,
  documents,
}: TransferorCardProps) {
  return (
    <TransferPartyCard
      icon={<UserRound size={14} />}
      title="Transferor"
      action={
        <OSPBadge
          type={transferor.accountStatus === "ACTIVE" ? "success" : "warning"}
        >
          {transferor.accountStatus}
        </OSPBadge>
      }
      documents={documents}
      details={
        <>
          <Box pb={3} mb={1} borderBottomWidth="1px" borderColor="border.muted">
            <RopPlanholderCard
              orientation="horizontal"
              embedded
              name={partyName(transferor)}
              lpaNo={lpaNo}
              personId={personId}
              birthdate={transferor.dateOfBirth || undefined}
              insurability={transferor.insurable ? "Insurable" : "Not Insurable"}
            />
          </Box>

          <Row label="Plan Type" value={transferor.planType} />
          <Row label="Termination Status" value={transferor.terminationStatus} />
          <Row
            label="New Effectivity"
            value={dateOrEmpty(transferor.newEffectivityDate)}
          />
          <Row label="Due Date" value={dateOrEmpty(transferor.dueDate)} />
          <Row label="Date of Death" value={dateOrEmpty(transferor.dateOfDeath)} />
          <Row
            label="First ROP Schedule"
            value={dateOrEmpty(transferor.firstRopSchedule)}
          />
          <Row label="Last RI Date" value={dateOrEmpty(transferor.lastRiDate)} />
          <Row label="Last TF Date" value={dateOrEmpty(transferor.lastTfDate)} />
          <Row
            label="Account Verified"
            value={transferor.accountVerified || undefined}
          />

          <Row label="Originating Branch" value={transferor.originatingBranch} />
          <Row label="Requesting Branch" value={transferor.requestingBranch} />
          <Row label="Sales Agent 1" value={transferor.salesAgent1 || undefined} />
          <Row label="Sales Agent 2" value={transferor.salesAgent2 || undefined} />
        </>
      }
    />
  );
}

export default TransferorCard;
