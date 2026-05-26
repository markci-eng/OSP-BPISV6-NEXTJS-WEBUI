"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import {
  LookupColumn,
  LookupField,
} from "../../common/reusable-lookup/LookUpField";
import {
  getPosibleSuperior,
  getPositionDesc,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";

interface SuperiorLookupProps {
  currentAgent: SalesAgent;
  value: SalesAgent | null;
  onSelect: (agent: SalesAgent | null) => void;
}

const columns: LookupColumn<SalesAgent>[] = [
  { key: "id", header: "Agent ID" },
  { key: "name", header: "Full Name" },
  {
    key: "position",
    header: "Position",
    render: (value) => getPositionDesc(String(value)) ?? String(value),
  }
];

export function SuperiorLookup({
  currentAgent,
  value,
  onSelect,
}: SuperiorLookupProps) {
  const posibleSuperior = React.useMemo(
    () => getPosibleSuperior(currentAgent),
    [currentAgent],
  );

  return (
    <Box w={{ base: "full", sm: "320px" }}>
      <LookupField<SalesAgent>
        label=""
        placeholder="Search Agent by Name, ID or Position..."
        modalTitle="Select New Superior"
        columns={columns}
        dataSource={posibleSuperior}
        searchKeys={["id", "firstName", "lastName", "position"]}
        onSelect={(e) => onSelect(e ?? null)}
        renderDisplay={(a) => `${a.name} (${a.id})`}
        value={value}
      />
    </Box>
  );
}

export default SuperiorLookup;
