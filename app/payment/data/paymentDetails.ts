import { createListCollection } from "@chakra-ui/react";
import { DepositHdr, PaymentRecord } from "./payment.types";

export const tableColumns = [

  {
    accessorKey: "LPANo",
    header: "LPA#",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: "Full Name",
    enableColumnFilter: true,
  },
  {
    accessorKey: "SI",
    header: "Sales Invoice",
    enableColumnFilter: true,
  },
  {
    accessorKey: "SIDate",
    header: "Sales Invoice Date",
    enableColumnFilter: true,
  },
  {
    accessorKey: "SIAmount",
    header: "Sales Invoice Amount",
    enableColumnFilter: true,
  },
  {
    accessorKey: "InstNo",
    header: "Installment#",
    enableColumnFilter: true,
  },
  {
    accessorKey: "PayClass",
    header: "Payment Class",
    enableColumnFilter: true,
  },

 
];


export const tableItems = [
  {
    id: "1",
    LPANo: "L25031417H",
    name: "Juan DC",
    SI: "00000001",
    SIDate: "2026-02-25",
    SIAmount: "1000.00",
    InstNo: 1,
    PayClass: "NS",
    TEPCV: "00.00",
    TEDue: "00.00",
    COMPCV: "00000001",
    GrossCom: "1.00",
    TaxCom: "1.00",
    ComDue: "1.00",
    AuditDate: "2026-02-25",
    AuditUser: "JJ",
    EditDate: "2026-02-25",
    EditUser: "JJ",
  },
  {
    id: "2",
    LPANo: "L25031417H",
    name: "Juan DC",
    SI: "00000002",
    SIDate: "2026-02-25",
    SIAmount: "1000.00",
    InstNo: 1,
    PayClass: "NS",
    TEPCV: "00.00",
    TEDue: "00.00",
    COMPCV: "00000001",
    GrossCom: "1.00",
    TaxCom: "1.00",
    ComDue: "1.00",
    AuditDate: "2026-02-25",
    AuditUser: "JJ",
    EditDate: "2026-02-25",
    EditUser: "JJ",
  },
  {
    id: "3",
    LPANo: "L25031417H",
    name: "Juan DC",
    SI: "00000003",
    SIDate: "2026-02-25",
    SIAmount: "1000.00",
    InstNo: 1,
    PayClass: "NS",
    TEPCV: "00.00",
    TEDue: "00.00",
    COMPCV: "00000001",
    GrossCom: "1.00",
    TaxCom: "1.00",
    ComDue: "1.00",
    AuditDate: "2026-02-25",
    AuditUser: "JJ",
    EditDate: "2026-02-25",
    EditUser: "JJ",
  },
];


export const PayClass = createListCollection({
  items: [
    { label: "DEFERRED COLLECTION", value: "DC" },
    { label: "ASSIGNMENT FEE", value: "AF" },
    { label: "BANK CHARGE", value: "BC" },
    { label: "CASH BOND RESERVE", value: "CB" },
    { label: "REPLACEMENT OF COFPP", value: "CF" },
    { label: "CREDIT LIFE INSURANCE", value: "CL" },
    { label: "CANCELLED OR", value: "CO" },
    { label: "MEETING AND CONFERENCE", value: "MC" },
    { label: "CHANGE MODE", value: "MF" },
    { label: "MARKETING TRANSPORTATION", value: "MT" },
    { label: "NEW SALE", value: "NS" },
    { label: "OTHER COLLECTION", value: "OC" },
    { label: "OTHER FEES", value: "OF" },
    { label: "OVERRIDING COMMISSION - SA", value: "OV" },
    { label: "PROCESSING FEE", value: "PF" },
    { label: "RETURNED BUDGET", value: "RB" },
    { label: "REINSTATEMENT FEE", value: "RF" },
    { label: "REINSTATEMENT PAYMENT", value: "RI" },
    { label: "REPRINTING OF PHID", value: "RP" },
    { label: "REPRINTING OF SFID", value: "RS" },
    { label: "SURCHARGE FEE", value: "SF" },
    { label: "SERVICE PAYMENT", value: "SV" },
    { label: "TRANSFER FEE", value: "TF" },
    { label: "TAXES AND LICENSES", value: "TL" },
    { label: "UPDATING PAYMENT", value: "UP" },
  ],
});

// For LOAN planholders only Lending Payment and Lending Penalty are allowed.
export const LoanPayClass = createListCollection({
  items: [
    { label: "LENDING PAYMENT", value: "LE" },
    { label: "LENDING PENALTY", value: "PL" },
  ],
});

export const PayType = createListCollection({
  items: [
    { label: "CASH PAYMENT", value: "CH" },
    { label: "CHEQUE PAYMENT", value: "CK" },
  ],
});

export const depositColumns = [
  {
    accessorKey: "name",
    header: "DRS Reference No",
    enableColumnFilter: true,
  },
  {
    accessorKey: "DepositDateTime",
    header: "Deposit Date Time",
    enableColumnFilter: true,
  },
  {
    accessorKey: "AccountNo",
    header: "Account No",
    enableColumnFilter: true,
  },
  {
    accessorKey: "BankBranch",
    header: "Bank Branch",
    enableColumnFilter: true,
  },
  {
    accessorKey: "BankCode",
    header: "Bank Code",
    enableColumnFilter: true,
  },
  {
    accessorKey: "Amount",
    header: "Amount",
    enableColumnFilter: true,
  },
  {
    accessorKey: "DepositedBy",
    header: "Deposited By",
    enableColumnFilter: true,
  },
  {
    accessorKey: "isApproved",
    header: "Status",
    enableColumnFilter: true,
    cell: ({ row }: any) =>
      row.original.isApproved ? "Approved" : "Pending",
  },
];
// without deposit
export const drsItems: DepositHdr[] = [
  {
    id: "1",
    name: "DRSCODE00000000001",
    DepositDateTime: "",
    AccountNo: "1234567890",
    BankBranch: "Makati Branch",
    BankCode: "001",
    Amount: "₱10000.00",
    DepositedBy: "Juan Dela Cruz",
    isApproved: 1,
  },
  {
    id: "2",
    name: "DRSCODE00000000002",
    DepositDateTime: "",
    AccountNo: "0987654321",
    BankBranch: "Quezon Branch",
    BankCode: "002",
    Amount: "₱20000.00",
    DepositedBy: "Maria Santos",
    isApproved: 1,
  },
  {
    id: "3",
    name: "DRSCODE00000000003",
    DepositDateTime: "",
    AccountNo: "1122334455",
    BankBranch: "Cebu Branch",
    BankCode: "003",
    Amount: "₱15000.00",
    DepositedBy: "",
    isApproved: 0,
  },
  {
    id: "4",
    name: "DRSCODE00000000004",
    DepositDateTime: "",
    AccountNo: "2233445566",
    BankBranch: "Davao Branch",
    BankCode: "004",
    Amount: "₱5000.00",
    DepositedBy: "",
    isApproved: 0,
  },
  {
    id: "5",
    name: "DRSCODE00000000005",
    DepositDateTime: "",
    AccountNo: "3344556677",
    BankBranch: "Manila Branch",
    BankCode: "005",
    Amount: "₱12000.00",
    DepositedBy: "",
    isApproved: 0,
  }
];

export const depositHDR: DepositHdr[] = [
  {
    id: "1",
    name: "DRSCODE00000000001",
    DepositDateTime: "2026-03-01 09:15:00",
    AccountNo: "1234567890",
    BankBranch: "Makati Branch",
    BankCode: "001",
    Amount: "₱10000.00",
    DepositedBy: "Juan Dela Cruz",
    isApproved: 1,
  },
  {
    id: "2",
    name: "DRSCODE00000000002",
    DepositDateTime: "2026-03-01 11:42:00",
    AccountNo: "0987654321",
    BankBranch: "Quezon Branch",
    BankCode: "002",
    Amount: "₱20000.00",
    DepositedBy: "Maria Santos",
    isApproved: 1,
  },
  {
    id: "3",
    name: "DRSCODE00000000003",
    DepositDateTime: "2026-03-02 08:25:00",
    AccountNo: "1122334455",
    BankBranch: "Cebu Branch",
    BankCode: "003",
    Amount: "₱15000.00",
    DepositedBy: "",
    isApproved: 0,
  },
  {
    id: "4",
    name: "DRSCODE00000000004",
    DepositDateTime: "2026-03-02 13:05:00",
    AccountNo: "2233445566",
    BankBranch: "Davao Branch",
    BankCode: "004",
    Amount: "₱5000.00",
    DepositedBy: "",
    isApproved: 0,
  },
  {
    id: "5",
    name: "DRSCODE00000000005",
    DepositDateTime: "2026-03-03 10:18:00",
    AccountNo: "3344556677",
    BankBranch: "Manila Branch",
    BankCode: "005",
    Amount: "₱12000.00",
    DepositedBy: "",
    isApproved: 0,
  },
  
];

export const AccountName = createListCollection({
  items: [
    { label: "WREATH & CANDLES - TRIBUTE", value: "5211500" },
    { label: "STAFF BENEFIT", value: "5311202" },
    { label: "TAXES & LICENSES", value: "5411000" },
    { label: "LIGHT, WATER & POWER", value: "5511102" },
    { label: "TELEPHONE EXPENSES", value: "5511200" },
    { label: "FREIGHT", value: "5511300" },
    { label: "TRANSPORTATION EXPENSES", value: "5621000" },
    { label: "FORMS & SUPPLIES", value: "5631000" },
    { label: "ADVERTISING & PUBLICITY", value: "5721000" },
    { label: "REPAIRS & MAINTENANCE", value: "5911000" },
    { label: "INTEREST & OTHER CHARGES", value: "5941400" },
    { label: "MISCELLANEOUS EXPENSES", value: "5941600" },
    { label: "MEDICAL KIT", value: "5941601" },
  ],
});

export const samplePayments: PaymentRecord[] = [
  { LPANo: "LPA101", name: "Planholder 1", SI: "SI1001", SIDate: "2026-03-24", SIAmount: "500", InstNo: "1", PayClass: "A", TEPCV: "20", TEDue: "", COMPCV: "30", GrossCom: "500", TaxCom: "50", ComDue: "450", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA102", name: "Planholder 2", SI: "SI1002", SIDate: "2026-03-24", SIAmount: "600", InstNo: "2", PayClass: "B", TEPCV: "25", TEDue: "", COMPCV: "35", GrossCom: "600", TaxCom: "60", ComDue: "540", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA103", name: "Planholder 3", SI: "SI1003", SIDate: "2026-03-24", SIAmount: "550", InstNo: "3", PayClass: "A", TEPCV: "22", TEDue: "", COMPCV: "28", GrossCom: "550", TaxCom: "55", ComDue: "495", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA104", name: "Planholder 4", SI: "SI1004", SIDate: "2026-03-24", SIAmount: "700", InstNo: "4", PayClass: "B", TEPCV: "30", TEDue: "", COMPCV: "40", GrossCom: "700", TaxCom: "70", ComDue: "630", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA105", name: "Planholder 5", SI: "SI1005", SIDate: "2026-03-24", SIAmount: "480", InstNo: "5", PayClass: "A", TEPCV: "18", TEDue: "", COMPCV: "32", GrossCom: "480", TaxCom: "48", ComDue: "432", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA106", name: "Planholder 6", SI: "SI1006", SIDate: "2026-03-24", SIAmount: "650", InstNo: "6", PayClass: "B", TEPCV: "27", TEDue: "", COMPCV: "37", GrossCom: "650", TaxCom: "65", ComDue: "585", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA107", name: "Planholder 7", SI: "SI1007", SIDate: "2026-03-24", SIAmount: "520", InstNo: "7", PayClass: "A", TEPCV: "21", TEDue: "", COMPCV: "29", GrossCom: "520", TaxCom: "52", ComDue: "468", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA108", name: "Planholder 8", SI: "SI1008", SIDate: "2026-03-24", SIAmount: "620", InstNo: "8", PayClass: "B", TEPCV: "26", TEDue: "", COMPCV: "36", GrossCom: "620", TaxCom: "62", ComDue: "558", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA109", name: "Planholder 9", SI: "SI1009", SIDate: "2026-03-24", SIAmount: "490", InstNo: "9", PayClass: "A", TEPCV: "19", TEDue: "", COMPCV: "31", GrossCom: "490", TaxCom: "49", ComDue: "441", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA110", name: "Planholder 10", SI: "SI1010", SIDate: "2026-03-24", SIAmount: "680", InstNo: "10", PayClass: "B", TEPCV: "28", TEDue: "", COMPCV: "38", GrossCom: "680", TaxCom: "68", ComDue: "612", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA111", name: "Planholder 11", SI: "SI1011", SIDate: "2026-03-24", SIAmount: "540", InstNo: "11", PayClass: "A", TEPCV: "23", TEDue: "", COMPCV: "27", GrossCom: "540", TaxCom: "54", ComDue: "486", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA112", name: "Planholder 12", SI: "SI1012", SIDate: "2026-03-24", SIAmount: "690", InstNo: "12", PayClass: "B", TEPCV: "29", TEDue: "", COMPCV: "39", GrossCom: "690", TaxCom: "69", ComDue: "621", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA113", name: "Planholder 13", SI: "SI1013", SIDate: "2026-03-24", SIAmount: "500", InstNo: "13", PayClass: "A", TEPCV: "20", TEDue: "", COMPCV: "30", GrossCom: "500", TaxCom: "50", ComDue: "450", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA114", name: "Planholder 14", SI: "SI1014", SIDate: "2026-03-24", SIAmount: "600", InstNo: "14", PayClass: "B", TEPCV: "25", TEDue: "", COMPCV: "35", GrossCom: "600", TaxCom: "60", ComDue: "540", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
  { LPANo: "LPA115", name: "Planholder 15", SI: "SI1015", SIDate: "2026-03-24", SIAmount: "550", InstNo: "15", PayClass: "A", TEPCV: "22", TEDue: "", COMPCV: "28", GrossCom: "550", TaxCom: "55", ComDue: "495", AuditDate: "2026-03-24", AuditUser: "System", EditDate: "", EditUser: "" },
];