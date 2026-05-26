export interface PlanDetailType {
  lpaNumber: string;
  planDescription: string;
  mode: string;
  term: number;
  planClass: string;
  accountClass: string;
  planCode: string;
  contractPrice: number;
  installmentAmount: number;
  totalAmountPayable: number;
  effectivityDate: Date;
  newEffectivityDate: Date;
  branch: string;
  cfpNumber?: string | null;
  cfpDate?: Date | null;
  isServiceOnly: boolean;
  isInsured: boolean;
  accountStatus: string;
  terminationStatus: string;
  salesAgent1: string;
  salesAgent2: string;
}

export interface PlanholderInfoType {
  lpaNumber: string | null;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  suffix?: string | undefined;
  nationality: string | null;
  naturalizationDate: Date | null;
  dateOfBirth: Date | null;
  placeOfBirth: string | null;
  gender: string | null;
  civilStatus: string | null;
  height: string | null;
  weight: number | null;
  employerName: string | null;
  employmentStatus: string | null;
  tin: string | null;
  securityNo: string | null;
  sourceOfFund: string | null;
}

export interface PlanholderAddressType {
  lpaNumber: string;
  addressType: string;
  addressNo: string | null;
  street: string | null;
  barangay: string | null;
  district: string | null;
  city: string;
  province: string;
  zipCode: number | null;
  isMailAddress?: boolean;
}

export interface PlanholderContactType {
  lpaNumber: string;
  value: string;
  type: "Email" | "MobileNo" | "LandlineNo";
}

export interface PlanholdersProps {
  lpaNumber: string;
  planDetails: PlanDetailType;
  planholderInfo: PlanholderInfoType;
  planholderAddress: PlanholderAddressType[];
  planholderContact: PlanholderContactType[];
}

export interface PlanholderPaymentProps {
  lpaNumber: string;
  payClass: string;
  siNumber: string;
  siDate: Date;
  siAmount: number;
  installmentNo: number;
  branch: string;
  planCode: string;
  payType: string;
  auditDate: Date;
}

export interface PlanTypeProps {
  planCode: string;
  planDescription: string;
  productCode: string;
  planClass: string;
  term: number;
  mode: string;
  contractPrice: number;
  totalAmountPayable: number;
  installmentAmount: number;
  auditDate: Date;
}
