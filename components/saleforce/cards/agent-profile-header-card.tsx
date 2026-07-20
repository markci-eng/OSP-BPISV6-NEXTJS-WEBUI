"use client";

import {
  SalesAgent,
  SalesAgentAddress,
} from "../../common/agent-lookup/agent-lookup.type";
import ProfileHeaderCard from "@/components/cards/ProfileHeaderCard";

interface AgentProfileHeaderCardProps {
  agent?: SalesAgent;
}

/** Flatten the structured agent address into a newline-delimited string
 *  that ProfileHeaderCard collapses into a single readable line. */
const formatAgentAddress = (address?: SalesAgentAddress): string | undefined => {
  if (!address) return undefined;
  const line = [
    address.unit,
    address.street,
    address.barangay,
    address.district,
    address.city,
    address.province,
    address.zipCode,
  ]
    .filter(Boolean)
    .join("\n");
  return line || undefined;
};

const AgentProfileHeaderCard = ({ agent }: AgentProfileHeaderCardProps) => {
  return (
    <ProfileHeaderCard
      name={agent?.name ?? undefined}
      personId={agent?.id}
      homeAddress={formatAgentAddress(agent?.address)}
      contactNo={agent?.mobile}
      landlineNo={agent?.landline}
      email={agent?.email}
    />
  );
};

export default AgentProfileHeaderCard;
