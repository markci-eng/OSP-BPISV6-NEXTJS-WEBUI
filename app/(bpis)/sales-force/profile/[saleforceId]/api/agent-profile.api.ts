import { delay } from "@/lib/delay";
import { getAgentById } from "@/components/common/agent-lookup/agent-lookup.type";
import type { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";

export async function getAgentProfile(
  saleforceId: string,
): Promise<SalesAgent | undefined> {
  await delay(300);

  return getAgentById(saleforceId);
}
