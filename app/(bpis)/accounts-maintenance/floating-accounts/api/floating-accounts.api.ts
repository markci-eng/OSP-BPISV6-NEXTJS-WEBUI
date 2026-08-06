import { delay } from "@/lib/delay";
import { floatingAccountsData } from "../floating-accounts.data";
import type { FloatingAccounts } from "../floating-accounts.data";

export async function getFloatingAccounts(): Promise<FloatingAccounts[]> {
  await delay(500);

  return floatingAccountsData;
}
