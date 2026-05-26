import React from "react";
import {
  getAgentById,
  getAgentNameById,
  getPosibleSuperior,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";
import { createListCollection } from "@chakra-ui/react";
import { SelectFloatingLabel } from "st-peter-ui";

const SelectSuperiorInput = (params: {
  currentAgent: SalesAgent | null;
  onSuperiorSelect: (params: SalesAgent) => void;
}) => {
  const { currentAgent, onSuperiorSelect } = params;

  const posibleSuperior = getPosibleSuperior(currentAgent);
  const superiorCollection = createListCollection({
    items: posibleSuperior.map((a) => ({
      label: getAgentNameById(a.id),
      value: a.id,
      description: a.position,
    })),
  });

  return (
    <SelectFloatingLabel
      label="Select Superior"
      collection={superiorCollection}
      onValueChanged={(x) => onSuperiorSelect(getAgentById(x[0])!)}
    />
  );
};

export default SelectSuperiorInput;
