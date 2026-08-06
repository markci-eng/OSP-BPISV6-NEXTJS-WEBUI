import { delay } from "@/lib/delay";
import { salesAgents } from "@/app/(bpis)/data/saleforce/sales-agent-data";
import type { SalesAgent } from "@/app/(bpis)/data/saleforce/sales-agent-data";

export const AGENT_PAGE_SIZE = 20;

export function filterAgentsByQuery(query: string): SalesAgent[] {
  const q = query.trim().toLowerCase();
  if (!q) return salesAgents;

  return salesAgents.filter(
    (a) =>
      a.id.toLowerCase().includes(q) ||
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.position.toLowerCase().includes(q) ||
      a.branch.toLowerCase().includes(q),
  );
}

export function filterAgents(query: string, position: string): SalesAgent[] {
  const queryFiltered = filterAgentsByQuery(query);
  if (position === "All") return queryFiltered;

  return queryFiltered.filter((a) => a.position === position);
}

export async function getAgentsByQuery(query: string): Promise<SalesAgent[]> {
  await delay(300);

  return filterAgentsByQuery(query);
}

export async function getAgentPage({
  pageParam,
  query,
  position,
}: {
  pageParam: number;
  query: string;
  position: string;
}): Promise<{ items: SalesAgent[]; nextPage: number | undefined }> {
  await delay(300);

  const all = filterAgents(query, position);
  const start = (pageParam - 1) * AGENT_PAGE_SIZE;

  return {
    items: all.slice(start, start + AGENT_PAGE_SIZE),
    nextPage: start + AGENT_PAGE_SIZE < all.length ? pageParam + 1 : undefined,
  };
}
