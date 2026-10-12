import type { AddressInfo } from "@/types/plan-management.types";

type AddressParts = Pick<
  AddressInfo,
  "addNo" | "street" | "barangay" | "district" | "city" | "province" | "zipCode"
>;

/**
 * Joins an address into one line, e.g. "12 Rizal St, Brgy. San Roque, Pasig, Metro Manila 1600".
 * Blank parts are skipped, so a missing district never prints as "undefined" or leaves a stray comma.
 * Returns undefined when there is no address or nothing in it to show.
 */
export function formatAddress(
  // ZIP code as text too, the way a form holds it.
  address:
    | (Partial<Omit<AddressParts, "zipCode">> & { zipCode?: number | string })
    | null
    | undefined,
): string | undefined {
  if (!address) return undefined;

  const clean = (value: string | number | null | undefined) =>
    value == null ? "" : String(value).trim();

  const streetLine = [address.addNo, address.street].map(clean).filter(Boolean).join(" ");
  const provinceLine = [address.province, address.zipCode].map(clean).filter(Boolean).join(" ");

  const formatted = [streetLine, clean(address.barangay), clean(address.district), clean(address.city), provinceLine]
    .filter(Boolean)
    .join(", ");

  return formatted || undefined;
}
