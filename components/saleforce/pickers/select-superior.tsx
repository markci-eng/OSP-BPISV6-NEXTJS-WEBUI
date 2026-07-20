import React from "react";
import {
  getAgentById,
  getAgentNameById,
  getPosibleSuperior,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import { createListCollection } from "@chakra-ui/react";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

const SelectSuperiorInput = (params: {
  currentAgent: SalesAgent | null;
  onSuperiorSelect: (params: SalesAgent) => void;
}) => {
  const { currentAgent, onSuperiorSelect } = params;

  const [selectedId, setSelectedId] = React.useState("");

  const posibleSuperior = getPosibleSuperior(currentAgent);
  const superiorCollection = createListCollection({
    items: posibleSuperior.map((a) => ({
      label: getAgentNameById(a.id),
      value: a.id,
      description: a.position,
    })),
  });

  return (
    <FloatingLabelSelect
      label="Select Superior"
      value={selectedId}
      onChange={(e) => {
        setSelectedId(e.target.value);
        const agent = getAgentById(e.target.value);
        if (agent) onSuperiorSelect(agent);
      }}
    >
      {superiorCollection.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </FloatingLabelSelect>
  );
};

export default SelectSuperiorInput;
