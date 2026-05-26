'use client'

import React from "react";
import { LookupColumn, LookupField } from "../reusable-lookup/LookUpField";
import {
  SalesAgent,
  getAgentNameById,
  getAllAgents,
} from "./agent-lookup.type";

const salesAgentColumns: LookupColumn<SalesAgent>[] = [
  { key: "id", header: "Agent ID" },
  { key: "name", header: "Full Name" },
  { key: "position", header: "Position" },
];

export function SearchAgentDialog({
  onSelectChange,
}: {
  onSelectChange?: (agent: SalesAgent | undefined) => void;
}) {
  const [selectAgent, setSelectAgent] = React.useState<SalesAgent | null>(null);
  return (
    <LookupField<SalesAgent>
      label=""
      placeholder="Search by Name or ID..."
      modalTitle="Search Agent"
      columns={salesAgentColumns}
      dataSource={getAllAgents()}
      searchKeys={["id", "firstName", "lastName", "position", "superiorId"]}
      onSelect={(e) => {
        onSelectChange?.(e ?? undefined);
        setSelectAgent(e);
      }}
      renderDisplay={(emp) => `${emp.name} (${emp.id})`}
      value={selectAgent}
    />
  );
}
