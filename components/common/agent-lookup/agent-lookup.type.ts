// Helper facade over the centralized mock data in data/saleforce.
// Types are re-exported so existing imports from this module keep working.

import {
  hierarchy,
  Position,
  refPosition,
  SalesAgent,
  SalesAgentAddress,
  salesAgents,
} from "@/data/saleforce/sales-agent-data";

export type { Position, SalesAgent, SalesAgentAddress };
export { refPosition };

const getRank = (position: Position): number => hierarchy.indexOf(position);

// In-memory mutable copy so runtime mutations don't touch the source data.
let agents: SalesAgent[] = [...salesAgents];

// ----------------------
// Utility Functions
// ----------------------
export const getAgentById = (id: string): SalesAgent | undefined =>
  agents.find((a) => a.id === id);

export const getAgentNameById = (id: string): string | undefined =>
  getAgentById(id)?.name;

export const getSuperior = (id: string): SalesAgent | undefined => {
  const agent = getAgentById(id);
  return agent?.superiorId ? getAgentById(agent.superiorId) : undefined;
};

export const getSubordinates = (superiorId: string): SalesAgent[] =>
  agents.filter((a) => a.superiorId === superiorId);

export const getAgentsByPosition = (position: Position): SalesAgent[] =>
  agents.filter((a) => a.position === position);

export const getPosibleSubordinates = (
  agent: SalesAgent | null,
): SalesAgent[] => {
  if (!agent) return [];

  const rank = getRank(agent.position);
  return agents.filter(
    (a) => getRank(a.position) === rank + 1 && a.superiorId !== agent.id,
  );
};

export const getPosibleSuperior = (agent: SalesAgent | null): SalesAgent[] => {
  if (!agent) return [];

  const rank = getRank(agent.position);

  return agents.filter(
    (a) => rank > getRank(a.position) && getRank(a.position) > rank - 2,
  );
};

export const getAgentPositionById = (agentId: string): string => {
  const agent = getAgentById(agentId);
  return agent?.position ?? "Not Valid";
};

export const getAllRefPosition = (): Record<string, string> => {
  return refPosition;
};

export const getPositionDesc = (position: string): string => {
  return refPosition[position];
};

// ----------------------
// Validation
// ----------------------

const isValidHierarchy = (
  agent: SalesAgent,
  superior: SalesAgent | null,
): boolean => {
  if (!superior) return agent.position === "RM";
  return getRank(superior.position) < getRank(agent.position);
};

// ----------------------
// Runtime Mutations
// ----------------------

export const addAgent = (agent: SalesAgent): void => {
  if (getAgentById(agent.id)) {
    throw new Error("Agent ID already exists");
  }

  const superior = agent.superiorId ? getAgentById(agent.superiorId) : null;

  if (!isValidHierarchy(agent, superior || null)) {
    throw new Error("Invalid hierarchy assignment");
  }

  agents.push(agent);
};

export const updateAgent = (updated: SalesAgent): void => {
  const index = agents.findIndex((a) => a.id === updated.id);
  if (index === -1) throw new Error("Agent not found");

  const superior = updated.superiorId ? getAgentById(updated.superiorId) : null;

  if (!isValidHierarchy(updated, superior || null)) {
    throw new Error("Invalid hierarchy update");
  }

  agents[index] = updated;
};

export const reassignAgent = (
  agentId: string,
  newSuperiorId: string | null,
): void => {
  const agent = getAgentById(agentId);
  if (!agent) throw new Error("Agent not found");

  const newSuperior = newSuperiorId ? getAgentById(newSuperiorId) : null;

  if (!isValidHierarchy(agent, newSuperior || null)) {
    throw new Error("Invalid reassignment");
  }

  agent.superiorId = newSuperiorId;
};

export const deleteAgent = (agentId: string): void => {
  const hasSubordinates = agents.some((a) => a.superiorId === agentId);

  if (hasSubordinates) {
    throw new Error("Cannot delete agent with subordinates");
  }

  agents = agents.filter((a) => a.id !== agentId);
};

// Optional: expose all agents (read-only copy)
export const getAllAgents = (): SalesAgent[] => [...agents];
