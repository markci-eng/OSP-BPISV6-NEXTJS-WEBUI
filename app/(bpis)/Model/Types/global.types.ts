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

export interface TblAddress {
  //   AddressID: string;
  AddressID: number;
  PersonID: string;
  AddType: string;
  AddNo: string;
  Street: string;
  Barangay: string;
  District: string;
  City: string;
  Province: string;
  ZipCode: number;
  Geotag: string;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblContactInfo {
  ContactTypeID: string;
  ContactDetails: string;
  PersonID: string;
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

export interface TblSalesForce {
  SalesForceCode: string;
  PersonID: string;
  PosCode: string;
  IsActive: boolean;
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

export interface TblEmployee {
  EmpCode: string;
  OrgUnitCode: string;
  PersonID: string;
  EmpID: string;
  HireDate: string;
  PosCode: string;
  IsActive: boolean;
  AuditUser: string;
  AuditDate: string;
  IsUploaded: boolean;
}

export interface TblPayment {
  SINo: string;
  LPANo: string;
  PayClass: string;
  DocType: string;
  SIDate: string;
  SIAmt: number;
  InstNo: number;
  SIComAmt: number;
  SINComAmt: number;
  OrgUnitCode: string;
  PlanCode: string;
  PayType: string;
  Remarks: string;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblDRSHdr {
  RefNo: string;
  OrgUnitCode: string;
  DepositType: string;
  Amount: number;
  IsDeposited: boolean;
  PosCode: string;
  ApprovedBy: string;
  IsApproved: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblDRSDtl {
  SINo: string;
  RefNo: string;
  AuditUser: string;
  AuditDate: string;
}

export interface TblDepositHdr {
  DepositDateTime: string;
  OrgUnitCode: string;
  DepositType: string;
  RemittanceDate: string;
  AccountNumber: string;
  BankCode: string;
  BankBranch: string;
  Amount: number;
  DepositedBy: string;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

export interface TblDepositDtl {
  SINo: string;
  DepositDateTime: string;
  CollectedBy: string;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
}

//Interconnected Type / Joined Types

export interface PersonData extends TblPerson {
  Addresses: TblAddress[];
  Contacts: TblContactInfo[];
  Employee?: TblEmployee;
  SalesForce?: TblSalesForce;
}

export interface PersonPaymentData extends TblPerson {
  Planholders: PlanholderData[];
}

export interface SalesForceData extends TblSalesForce {
  Person: TblPerson;
  SalesForceIDs: TblSalesForceID[];
  Planholders: TblPlanholder[];
}

export interface PlanholderData extends TblPlanholder {
  Person: TblPerson;
  Payments: PaymentData[];
}

export interface PaymentData extends TblPayment {
  //   Planholder: TblPlanholder;
  DRS?: TblDRSDtl;
  Deposit?: TblDepositDtl;
}

export interface DRSHdrData extends TblDRSHdr {
  Details: TblDRSDtl[];
}

export interface DepositHdrData extends TblDepositHdr {
  Details: TblDepositDtl[];
}

export interface DatabaseModel {
  Persons: TblPerson[];
  Addresses: TblAddress[];
  Contacts: TblContactInfo[];
  Employees: TblEmployee[];
  SalesForces: TblSalesForce[];
  SalesForceIDs: TblSalesForceID[];
  Planholders: TblPlanholder[];
  Payments: TblPayment[];
  DRSHdrs: TblDRSHdr[];
  DRSDtls: TblDRSDtl[];
  DepositHdrs: TblDepositHdr[];
  DepositDtls: TblDepositDtl[];
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

export interface TblDocControlHdr {
  ControlNo: string;
  OriginatingOrgUnitCode: string;
  OrgUnitCode: string;
  ControlMasterNo: string;
  DocType: string;
  DocFrom: string;
  DocTo: string;
  DocExt: string;
  QtyInUnit: number;
  RemainingQtyInUnit: number;
  SalesForceCode: string;
  IssuedDate: string;
  ExpiryMonths: number;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
  EditUser: string;
  EditDate: string;
}

export interface TblDocControlDtl {
  DocumentCode: string;
  ControlNo: string;
  SalesForceCode: string;
  DocFrom: string;
  DocTo: string;
  DocExt: string;
  QtyInUnit: number;
  RemainingQtyInUnit: number;
  ExpiryDate: string;
  IsReAssigned: boolean;
  AuditUser: string;
  AuditDate: string;
  IsReported: boolean;
  EditUser: string;
  EditDate: string;
}

export interface DocControlHdrData extends TblDocControlHdr {
  OrgUnit: refOrgUnit;
  OriginatingOrgUnit: refOrgUnit;
  SalesForce: TblSalesForce;
  Details: TblDocControlDtlData[];
}

export interface TblDocControlDtlData extends TblDocControlDtl {
  Header: TblDocControlHdr;
  SalesForce: TblSalesForce;
}

export interface refDocumentType {
  DocType: string;
  DocTypeDescription: string;
  Unit: string;
  Quantity: number;
  MaxiAssignQuantity: number;
  ReorderPoint: number;
  ExpiryMonths: number;
  IsActive: boolean;
  IsAllowExtension: boolean;
  IsForLending: boolean;
  IsForEvaluation: boolean;
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