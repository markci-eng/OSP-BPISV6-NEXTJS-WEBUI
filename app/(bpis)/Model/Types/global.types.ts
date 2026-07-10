//Individual Interface/ Types

export interface TblPerson {
  PersonID: string;
  EntityType: string;
  Title: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  Suffix: string;
  DateOfBirth: string;
  PlaceOfBirth: string;
  GenderAtBirth: string;
  PreferredGender: string;
  CivilStatus: string;
  OccupationID: string;
  EmployerName: string;
  EmploymentStatus: string;
  NationalityID: number;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblPlanholder {
  LPANo: string;
  PersonID: string;
  OrgUnitCode: string;
  PlanCode: string;
  PlanTAP: number;
  PlanClass: string;
  SalesForceCode: string;
  AccountClass: string;
  AcctStatCode: string;
  TermiStatCode: string;
  Balance: number;
  DueDate: string;
  EffectivityDate: string;
  InstNo: number;
  IsInsured: boolean;
  IsServiceOnly: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblSalesForceID {
  SFIDNo: string;
  SalesForceCode: string;
  IssueDate: string;
  ExpiryDate: string;
  Remarks: string;
  IsPrinted: boolean;
  IsReprinted: boolean;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export type LookupEntryType = "LOAN" | "PH";
export type PlanholderLookupItem = {
  SalesForceCode: string;
  Person: TblPerson;
  SalesForceIDs: TblSalesForceID[];
  Planholders: TblPlanholder[];
  PlanData: PlanData;
  OrgUnit: refOrgUnit;

  LoanHdr?: Tblloanhdr;

  LAFNo?: string;
  LPANo: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;

  EntryType: LookupEntryType;
};

export type PlanData = {
  PlanType: refPlanType;
  PlanCatalog: refCatalog;
};

//Reference Table
export interface refPlanType {
  PlanCode: string;
  CatalogID: string;
  AccountClass: string;
  Mode: string;
  Term: string;
  ContractPice: number;
  TAP: number;
  CBI: number;
  IntsAmt: number;
  Benefits: string;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  EditUser: string;
  EditDate: string;
}

export interface refCatalog {
  CatalogID: string;
  CatalogDescription: string;
  ProductID: string;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  EditUser: string;
  EditDate: string;
}

export interface refOrgUnit {
  OrgUnitCode: string;
  OrgUnitDescription: string;
  OrgUnitType: string;
  IsActive: boolean;
  SpecialTerm: string;
  AuditUser: string;
  AuditDate: string;
  EditUser: string;
  EditDate: string;
}

export interface refBankBranch {
  BankCode: string;
  BankBranch: string;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  EditUser: string;
  EditDate: string;
}

export interface Tblloanhdr {
  LAFNo: string;
  LPANo: string;
  RefCode: string;
  BranchApplied: string;
  ReleaseDate: string;
  LoanFPDate: string;
  DateApplied: string;
  AppliedLoan: number;
  ApprovedLoan: number;
  NetProceeds: number;
  LoanTerm: number;
  TotalAmountPaid: number;
  LoanStat: string;
  Remarks: string;
  Balance: number;
  DocSent: boolean;
  DocRecieve: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: number;
  EditUser: string;
  EditDate: string;
}
