import { delay } from "@/lib/delay";
import { accountListData } from "../account-transfer.data";
import type { AccountList } from "../account-transfer.data";

export async function getAccountList(): Promise<AccountList[]> {
  await delay(500);

  return accountListData;
}
