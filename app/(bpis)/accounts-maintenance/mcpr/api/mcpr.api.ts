import { delay } from "@/lib/delay";
import { mcprData } from "../mcpr.data";
import type { MCPR } from "../mcpr.data";

export async function getMcprList(): Promise<MCPR[]> {
  await delay(500);

  return mcprData;
}
