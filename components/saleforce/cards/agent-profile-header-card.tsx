"use client";

import {
  SalesAgent,
  getPositionDesc,
} from "../../common/agent-lookup/agent-lookup.type";
import ProfileHeaderCard from "@/components/cards/ProfileHeaderCard";

interface AgentProfileHeaderCardProps {
  agent?: SalesAgent;
}

const AgentProfileHeaderCard = ({ agent }: AgentProfileHeaderCardProps) => {
  const isActive = agent?.employeeStatus?.toLowerCase() === "active";
  const positionDesc =
    getPositionDesc(agent?.position ?? "") +
    (agent?.branch ? ` · ${agent.branch}` : "");
  return (
    <ProfileHeaderCard
      name={agent?.name ?? undefined}
      nameSubtitle={{ active: isActive, value: positionDesc }}
      headerInfo={{
        label: "Agent ID",
        value: agent?.id ?? "-",
      }}
    />
  );
};

export default AgentProfileHeaderCard;
