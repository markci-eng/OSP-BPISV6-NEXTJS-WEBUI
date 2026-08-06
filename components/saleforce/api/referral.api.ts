import { delay } from "@/lib/delay";
import { REFERRAL_HISTORY } from "../data/referral.mock";
import type { ReferralHistoryItem } from "../data/referral.mock";

export async function getReferralHistory(): Promise<ReferralHistoryItem[]> {
  await delay(400);

  return REFERRAL_HISTORY;
}
