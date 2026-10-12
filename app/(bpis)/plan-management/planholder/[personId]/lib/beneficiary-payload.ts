import type {
  AddBeneficiaryPayload,
  Beneficiary,
  BeneficiaryPayload,
} from "@/types/plan-management.types";
import type { BeneficiaryFormValues } from "../components/beneficiary-form-modal";

/**
 * The API body for what `BeneficiaryFormModal` submitted.
 *
 * Pass `original` for an edit: its ids are carried over — the beneficiary's,
 * and its address's, so the address is updated rather than added alongside —
 * and so is its class, which the form does not edit. Without it this is an
 * add, and `isPrincipal` says which list the beneficiary is joining.
 */
export function toBeneficiaryPayload(
  values: BeneficiaryFormValues,
  context: { lpaNo: string; isPrincipal: boolean; original?: undefined },
): AddBeneficiaryPayload;
export function toBeneficiaryPayload(
  values: BeneficiaryFormValues,
  context: { lpaNo: string; original: Beneficiary },
): BeneficiaryPayload;
export function toBeneficiaryPayload(
  values: BeneficiaryFormValues,
  context:
    | { lpaNo: string; original: Beneficiary }
    | { lpaNo: string; isPrincipal: boolean; original?: undefined },
): BeneficiaryPayload {
  const { original } = context;
  // An empty id is how a locally added, never-saved address looks.
  const addressId = original?.address.addressId;
  return {
    lpaNo: context.lpaNo,
    beneficiaryId: original?.beneficiaryId ?? null,
    personId: values.personId,
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName,
    suffix: values.suffix,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    relationCode: values.relationCode,
    isPrincipal: original ? original.isPrincipal : context.isPrincipal,
    address: {
      ...values.address,
      // Left out for a new address — see `BeneficiaryAddressPayload`.
      ...(addressId ? { addressId } : {}),
      // A beneficiary has the one address, so it is their primary.
      isPrimary: true,
    },
  };
}
