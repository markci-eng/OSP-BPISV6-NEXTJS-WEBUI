export interface IPersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  birthDate: string;
  idType: string;
  idNumber: string;
  height: number;
  weight: number;
  gender: string;
  civilStatus: string;
  nationality: string;
  mobileNumber: string;
  emailAddress: string;
  mailingAddress: string;
  landLineNumber?: string;
  // addressLine1?: string;
}
export interface IEmployment{
  occupation?: string;
  employerName?: string;
  employmentStatus?: string;
  officeAddress?: string;
  TIN ?: string;
  SSS ?: string;
  sourceOfIncome?: string;
}

export interface IBeneficiary {
  firstName: string;
  middleInitial: string;
  lastName: string;
  birthDate: string;
  address: string;
  relationship: string;
  beneficiaryClass: string;
}
export interface IAddress{
  lot?: string;
  street?: string;
  barangay?: string;
  district?: string;
  city?: string;
  province?: string;
  // addressLine?: string;
}

export interface IHealthDeclaration {
  healthDeclaration1: boolean;
  healthDeclaration2: boolean;
  healthDeclaration3: boolean;
  healthDeclaration4: boolean;
}

export interface ITransactionData {
  personalInfo: IPersonalInfo;
  employment: IEmployment;
  address: IAddress;
  beneficiaries: IBeneficiary[];
  principalBeneficiary?: IBeneficiary;
  contingentBeneficiary?: IBeneficiary;
  healthDeclaration: IHealthDeclaration;
}

export type IDetailsPersonalInfo = Pick<
    IPersonalInfo,
    "firstName" | "middleName" | "lastName" | "birthDate" | "mobileNumber" | "emailAddress"
>;

export interface ISearchedPlanholder {
    contractNo: string;
    planType: string;
    personalInfo: IDetailsPersonalInfo;
    address: Required<IAddress> & { zipCode: string };
    installmentAmount: number;
    balance: number;
}

export interface IPlanholderApiResponse {
  myPlan?: {
    accountNo?: string;
    lpaNo?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    emailAddress?: string;
    mobileNo?: string;
    dateOfBirth?: string;
  };
  planDetails?: {
    lpaNo?: string;
    planCode?: string;  
    planType?: string;
    contractPrice?: number;
    amount?: number;
    amountPayable?: number;
    balance?: number;
  };
  phAddress?: {
    addno?: string;
    street?: string;
    barangay?: string;
    district?: string;
    city?: string;
    province?: string;
    zipCode?: number | string;
  };
}
export interface IApplicationData {
  personalInfo: IPersonalInfo;
  employment: IEmployment;
  address: IAddress;
  beneficiaries: IBeneficiary[];
  principalBeneficiary?: IBeneficiary;
  contingentBeneficiary?: IBeneficiary;
  healthDeclaration: IHealthDeclaration;
}