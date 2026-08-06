import { delay } from "@/lib/delay";
import {
  drsItems as DRS_ITEMS_SEED,
  depositHDR as DEPOSIT_HDR_SEED,
  samplePayments as SAMPLE_PAYMENTS_SEED,
} from "../data/paymentDetails";
import type { DepositHdr, PaymentRecord } from "../data/payment.types";

/**
 * In-memory mock "backend" for the payment/DRS domain, seeded once from the
 * static mock data. Mutated in place so subsequent reads (e.g. after a
 * refetch) see the persisted result.
 */
let drsStore: DepositHdr[] = [...DRS_ITEMS_SEED];
let depositStore: DepositHdr[] = [...DEPOSIT_HDR_SEED];

export async function getDrsList(): Promise<DepositHdr[]> {
  await delay(500);

  return drsStore;
}

export async function deleteDrs(id: string): Promise<DepositHdr[]> {
  await delay(400);

  drsStore = drsStore.filter((item) => item.id !== id);

  return drsStore;
}

export async function getDepositList(): Promise<DepositHdr[]> {
  await delay(500);

  return depositStore;
}

export async function getSamplePayments(): Promise<PaymentRecord[]> {
  await delay(300);

  return SAMPLE_PAYMENTS_SEED;
}
