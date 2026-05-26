export interface PlanholderLookup {
  personId: string;
  lpaNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dueDate: Date;
  installmentNo: number;
  totalInstallment: number;
  balance: number;
  planDescription: string;
  mode: string;
  effectivityDate: Date;
  branch: string;
  accountStatus: string;
  terminationStatus: string;
}
