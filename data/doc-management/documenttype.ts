import { createListCollection } from "@chakra-ui/react/collection";
import { Employee as EmployeeModel } from "./employeeSelector";

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
}

export interface DocumentListProps {
  documents: Document[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}

export const DocumentType = createListCollection({
  items: [
    {
      label: "ACKNOWLEDGE RECEIPT",
      value: "acknowledge_receipt",
      series: "00000001-00000050",
    },
    {
      label: "BANK PAYMENT",
      value: "bank_payment",
      series: "00000001-00000050",
    },
    {
      label: "CERTIFICATE OF FULLY PAID",
      value: "certificate_fully_paid",
      series: "00000001-00000050",
    },
    { label: "CREDIT MEMO", value: "credit_memo", series: "00000001-00000050" },
    {
      label: "CREMATION PLAN AGREEMENT",
      value: "cremation_plan_agreement",
      series: "00000001-00000050",
    },
    { label: "DEBIT MEMO", value: "debit_memo", series: "00000001-00000050" },
    {
      label: "FUEL YOUR DRIVE",
      value: "fuel_your_drive",
      series: "00000001-00000050",
    },
    {
      label: "PLANHOLDER IDENTIFICATION CARD",
      value: "planholder_id_card",
      series: "00000001-00000050",
    },
    {
      label: "LOAN APPLICATION FORM",
      value: "loan_application_form",
      series: "00000001-00000050",
    },
    { label: "LIFE PLAN AGREEMENT", value: "life_plan_agreement", series: "" },
    {
      label: "NEW LIFE PLAN PLUS AGREEMENT",
      value: "new_life_plan_plus_agreement",
      series: "000001-000050",
    },
    {
      label: "SALES INVOICE",
      value: "sales_invoice",
      series: "00000001-00000050",
    },
    { label: "OT", value: "ot", series: "00000001-00000050" },
    {
      label: "PLANHOLDER NOTICE",
      value: "planholder_notice",
      series: "00000001-00000050",
    },
    {
      label: "LIFE PLAN PLUS AGREEMENT",
      value: "life_plan_plus_agreement",
      series: "000001-000050",
    },
    {
      label: "LIFE PLAN AGREEMENT SEVEN PAY",
      value: "life_plan_agreement_seven_pay",
      series: "000001-000050",
    },
    {
      label: "LIFE PLAN AGREEMENT GABRIEL",
      value: "life_plan_agreement_gabriel",
      series: "000001-000050",
    },
  ],
});

export const BlockType = createListCollection({
  items: [
    {
      label: "CANCELLED",
      value: "cancelled",
    },
    {
      label: "LOST",
      value: "lost",
    },
  ],
});

export const DocumentExt = createListCollection({
  items: [
    {
      label: "",
      value: "",
    },
    {
      label: "H",
      value: "H",
    },
    {
      label: "G",
      value: "G",
    },
    {
      label: "I",
      value: "I",
    },
    {
      label: "A",
      value: "A",
    },
  ],
});

export const EMPLOYEES: EmployeeModel[] = [
  {
    id: "ZAMBOA08FC00027",
    name: "Bryan Breezy Dalagdag",
    branch: "Sales - Zamboanga West",
  },
  {
    id: "ZAMBOA08FC00028",
    name: "John Mark Santos",
    branch: "Sales - Zamboanga West",
  },
  {
    id: "CEBU01FC00112",
    name: "Carlo Miguel Mendoza",
    branch: "Sales - Cebu Central",
  },
  {
    id: "DAVAO02FC00054",
    name: "Ronald Bautista",
    branch: "Sales - Davao North",
  },
  {
    id: "ILOILO03FC00077",
    name: "Michael Fernandez",
    branch: "Sales - Iloilo City",
  },
  {
    id: "BACOLOD04FC00091",
    name: "Patricia Navarro",
    branch: "Sales - Bacolod Main",
  },
  {
    id: "CAGAYAN05FC00033",
    name: "Daniel Hernandez",
    branch: "Sales - Cagayan De Oro",
  },
];

export type Documents = {
  documentType: string;
  documentCode: string;
  controlNo: string;
  salesForceId: string;
  assignedTo: string;
  documentStart: string;
  documentEnd: string;
  documentExt: string;
  qtyInUnit: string;
  remainingQty: string;
  expiryDate: string;
};

export const documents: Documents[] = [
  {
    documentType: "SALES INVOICE",
    documentCode: "ZAMBOAOR00078251",
    controlNo: "ZAMBOAOR00055001",
    salesForceId: "ZAMBOA08FC00027",
    assignedTo: "Bryan Breezy Dalagdag",
    documentStart: "00055001",
    documentEnd: "00055050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "50",
    expiryDate: "2027-02-25",
  },
  {
    documentType: "ACKNOWLEDGE RECEIPT",
    documentCode: "ZAMBOAAR00012001",
    controlNo: "ZAMBOAAR00034001",
    salesForceId: "ZAMBOA08FC00028",
    assignedTo: "John Mark Santos",
    documentStart: "00034001",
    documentEnd: "00034030",
    documentExt: "",
    qtyInUnit: "30",
    remainingQty: "18",
    expiryDate: "2026-12-31",
  },
  {
    documentType: "LIFE PLAN AGREEMENT",
    documentCode: "CEBULPA00045021",
    controlNo: "CEBULPA00012001",
    salesForceId: "CEBU01FC00112",
    assignedTo: "Carlo Miguel Mendoza",
    documentStart: "00012001",
    documentEnd: "00012025",
    documentExt: "A",
    qtyInUnit: "25",
    remainingQty: "10",
    expiryDate: "2027-06-15",
  },
  {
    documentType: "DEBIT MEMO",
    documentCode: "DAVDM00033009",
    controlNo: "DAVDM00021001",
    salesForceId: "DAVAO02FC00054",
    assignedTo: "Ronald Bautista",
    documentStart: "00021001",
    documentEnd: "00021020",
    documentExt: "",
    qtyInUnit: "20",
    remainingQty: "20",
    expiryDate: "2026-09-10",
  },
  {
    documentType: "CREDIT MEMO",
    documentCode: "ILOICM00011234",
    controlNo: "ILOICM00050001",
    salesForceId: "ILOILO03FC00077",
    assignedTo: "Michael Fernandez",
    documentStart: "00050001",
    documentEnd: "00050040",
    documentExt: "",
    qtyInUnit: "40",
    remainingQty: "5",
    expiryDate: "2026-08-01",
  },
  {
    documentType: "PLANHOLDER IDENTIFICATION CARD",
    documentCode: "BACPID00091001",
    controlNo: "BACPID00070001",
    salesForceId: "BACOLOD04FC00091",
    assignedTo: "Patricia Navarro",
    documentStart: "00070001",
    documentEnd: "00070015",
    documentExt: "",
    qtyInUnit: "15",
    remainingQty: "15",
    expiryDate: "2028-01-01",
  },
  {
    documentType: "CERTIFICATE OF FULLY PAID",
    documentCode: "CAGCFP00088002",
    controlNo: "CAGCFP00061001",
    salesForceId: "CAGAYAN05FC00033",
    assignedTo: "Daniel Hernandez",
    documentStart: "00061001",
    documentEnd: "00061010",
    documentExt: "",
    qtyInUnit: "10",
    remainingQty: "2",
    expiryDate: "2026-05-20",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022003",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022004",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022005",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022006",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022007",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "BANK PAYMENT",
    documentCode: "ZAMBOABP00022008",
    controlNo: "ZAMBOABP00090001",
    salesForceId: "ZAMBOA08FC00029",
    assignedTo: "Angelica Dela Cruz",
    documentStart: "00090001",
    documentEnd: "00090050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "32",
    expiryDate: "2027-11-11",
  },
  {
    documentType: "OFFICIAL RECEIPT",
    documentCode: "CEBUOR00088011",
    controlNo: "CEBUOR00030001",
    salesForceId: "CEBU01FC00113",
    assignedTo: "Kristine Garcia",
    documentStart: "00030001",
    documentEnd: "00030050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "0",
    expiryDate: "2026-03-01",
  },
  {
    documentType: "LIFE PLAN PLUS AGREEMENT",
    documentCode: "DAVLPP00041001",
    controlNo: "DAVLPP00015001",
    salesForceId: "DAVAO02FC00055",
    assignedTo: "Julie Ann Ramirez",
    documentStart: "00015001",
    documentEnd: "00015030",
    documentExt: "B",
    qtyInUnit: "30",
    remainingQty: "4",
    expiryDate: "2026-07-10",
  },
  {
    documentType: "PLANHOLDER NOTICE",
    documentCode: "ILOPHN00022001",
    controlNo: "ILOPHN00042001",
    salesForceId: "ILOILO03FC00077",
    assignedTo: "Michael Fernandez",
    documentStart: "00042001",
    documentEnd: "00042020",
    documentExt: "",
    qtyInUnit: "20",
    remainingQty: "20",
    expiryDate: "2028-02-01",
  },
  {
    documentType: "LOAN APPLICATION FORM",
    documentCode: "BACLOAN00033001",
    controlNo: "BACLOAN00051001",
    salesForceId: "",
    assignedTo: "",
    documentStart: "00051001",
    documentEnd: "00051050",
    documentExt: "",
    qtyInUnit: "50",
    remainingQty: "50",
    expiryDate: "2027-10-01",
  },
  {
    documentType: "CREMATION PLAN AGREEMENT",
    documentCode: "CAGCREM00072001",
    controlNo: "CAGCREM00081001",
    salesForceId: "CAGAYAN05FC00033",
    assignedTo: "Daniel Hernandez",
    documentStart: "00081001",
    documentEnd: "00081015",
    documentExt: "",
    qtyInUnit: "15",
    remainingQty: "1",
    expiryDate: "2026-04-01",
  },
  {
    documentType: "FUEL YOUR DRIVE",
    documentCode: "ZAMFYD00099001",
    controlNo: "ZAMFYD00060001",
    salesForceId: "ZAMBOA08FC00028",
    assignedTo: "John Mark Santos",
    documentStart: "00060001",
    documentEnd: "00060010",
    documentExt: "",
    qtyInUnit: "10",
    remainingQty: "10",
    expiryDate: "2029-01-01",
  },
  {
    documentType: "DEBIT MEMO",
    documentCode: "CEBUDM00055110",
    controlNo: "CEBUDM00088001",
    salesForceId: "CEBU01FC00112",
    assignedTo: "Carlo Miguel Mendoza",
    documentStart: "00088001",
    documentEnd: "00088025",
    documentExt: "",
    qtyInUnit: "25",
    remainingQty: "6",
    expiryDate: "2026-06-15",
  },
  {
    documentType: "CREDIT MEMO",
    documentCode: "DAVCM00031002",
    controlNo: "DAVCM00020001",
    salesForceId: "DAVAO02FC00054",
    assignedTo: "Ronald Bautista",
    documentStart: "00020001",
    documentEnd: "00020030",
    documentExt: "",
    qtyInUnit: "30",
    remainingQty: "30",
    expiryDate: "2027-05-01",
  },
  {
    documentType: "CERTIFICATE OF FULLY PAID",
    documentCode: "CEBUCFP00044001",
    controlNo: "CEBUCFP00077001",
    salesForceId: "CEBU01FC00113",
    assignedTo: "Kristine Garcia",
    documentStart: "00077001",
    documentEnd: "00077010",
    documentExt: "",
    qtyInUnit: "10",
    remainingQty: "0",
    expiryDate: "2026-02-01",
  },
  {
    documentType: "SALES INVOICE",
    documentCode: "ILOSI00088001",
    controlNo: "ILOSI00095001",
    salesForceId: "ILOILO03FC00077",
    assignedTo: "Michael Fernandez",
    documentStart: "00095001",
    documentEnd: "00095040",
    documentExt: "",
    qtyInUnit: "40",
    remainingQty: "12",
    expiryDate: "2027-12-31",
  },
];

export const DOCUMENTS_BY_EMPLOYEE: Record<string, Document[]> = {
  ZAMBOA08FC00027: [
    {
      id: "d1",
      name: "Official Receipt Batch 55001-55050",
      type: "OFFICIAL RECEIPT",
      date: "Feb 28, 2026",
    },
    {
      id: "d2",
      name: "Sales Invoice 78251",
      type: "SALES INVOICE",
      date: "Mar 1, 2026",
    },
    {
      id: "d3",
      name: "Life Plan Agreement (Seven Pay)",
      type: "LIFE PLAN AGREEMENT SEVEN PAY",
      date: "Feb 15, 2026",
    },
  ],

  ZAMBOA08FC00028: [
    {
      id: "d4",
      name: "Acknowledge Receipt Batch 34001-34030",
      type: "ACKNOWLEDGE RECEIPT",
      date: "Feb 20, 2026",
    },
    {
      id: "d5",
      name: "Fuel Your Drive Promo Forms",
      type: "FUEL YOUR DRIVE",
      date: "Mar 2, 2026",
    },
  ],

  CEBU01FC00112: [
    {
      id: "d6",
      name: "Life Plan Agreement Batch 12001-12025",
      type: "LIFE PLAN AGREEMENT",
      date: "Feb 25, 2026",
    },
    {
      id: "d7",
      name: "Debit Memo 88001",
      type: "DEBIT MEMO",
      date: "Feb 18, 2026",
    },
    {
      id: "d8",
      name: "Certificate of Fully Paid",
      type: "CERTIFICATE OF FULLY PAID",
      date: "Mar 3, 2026",
    },
  ],

  DAVAO02FC00054: [
    {
      id: "d9",
      name: "Credit Memo 20001-20030",
      type: "CREDIT MEMO",
      date: "Feb 22, 2026",
    },
    {
      id: "d10",
      name: "Bank Payment Forms",
      type: "BANK PAYMENT",
      date: "Mar 1, 2026",
    },
  ],

  ILOILO03FC00077: [
    {
      id: "d11",
      name: "Planholder Notice Batch",
      type: "PLANHOLDER NOTICE",
      date: "Feb 10, 2026",
    },
    {
      id: "d12",
      name: "Loan Application Forms",
      type: "LOAN APPLICATION FORM",
      date: "Feb 27, 2026",
    },
  ],

  BACOLOD04FC00091: [
    {
      id: "d13",
      name: "Planholder Identification Cards",
      type: "PLANHOLDER IDENTIFICATION CARD",
      date: "Feb 14, 2026",
    },
  ],

  CAGAYAN05FC00033: [
    {
      id: "d14",
      name: "Cremation Plan Agreement Forms",
      type: "CREMATION PLAN AGREEMENT",
      date: "Mar 3, 2026",
    },
    {
      id: "d15",
      name: "Life Plan Agreement Gabriel",
      type: "LIFE PLAN AGREEMENT GABRIEL",
      date: "Feb 28, 2026",
    },
  ],
};

export interface PendingTransfer {
  id: string;
  documentName: string;
  documentType: string;
  fromEmployee: string;
  fromDepartment: string;
  toEmployee: string;
  toDepartment: string;
  requestedDate: string;
  status: "pending" | "approved" | "denied";
}

export const INITIAL_TRANSFERS: PendingTransfer[] = [
  {
    id: "t1",
    documentName: "Official Receipt Batch 55001-55050",
    documentType: "OFFICIAL RECEIPT",
    fromEmployee: "Bryan Breezy Dalagdag",
    fromDepartment: "Sales - Zamboanga West",
    toEmployee: "John Mark Santos",
    toDepartment: "Sales - Zamboanga West",
    requestedDate: "Mar 3, 2026",
    status: "pending",
  },
  {
    id: "t2",
    documentName: "Acknowledge Receipt 34001-34030",
    documentType: "ACKNOWLEDGE RECEIPT",
    fromEmployee: "John Mark Santos",
    fromDepartment: "Sales - Zamboanga West",
    toEmployee: "Bryan Breezy Dalagdag",
    toDepartment: "Sales - Zamboanga West",
    requestedDate: "Mar 3, 2026",
    status: "approved",
  },
  {
    id: "t3",
    documentName: "Life Plan Agreement (Seven Pay)",
    documentType: "LIFE PLAN AGREEMENT SEVEN PAY",
    fromEmployee: "Carlo Miguel Mendoza",
    fromDepartment: "Sales - Cebu Central",
    toEmployee: "Michael Fernandez",
    toDepartment: "Sales - Iloilo City",
    requestedDate: "Mar 2, 2026",
    status: "pending",
  },
  {
    id: "t4",
    documentName: "Debit Memo Batch 88001-88025",
    documentType: "DEBIT MEMO",
    fromEmployee: "Ronald Bautista",
    fromDepartment: "Sales - Davao North",
    toEmployee: "Daniel Hernandez",
    toDepartment: "Sales - Cagayan De Oro",
    requestedDate: "Mar 1, 2026",
    status: "approved",
  },
  {
    id: "t5",
    documentName: "Credit Memo 20001-20030",
    documentType: "CREDIT MEMO",
    fromEmployee: "Ronald Bautista",
    fromDepartment: "Sales - Davao North",
    toEmployee: "Carlo Miguel Mendoza",
    toDepartment: "Sales - Cebu Central",
    requestedDate: "Feb 28, 2026",
    status: "denied",
  },
  {
    id: "t6",
    documentName: "Bank Payment Forms Batch",
    documentType: "BANK PAYMENT",
    fromEmployee: "Angelica Dela Cruz",
    fromDepartment: "Sales - Zamboanga East",
    toEmployee: "Bryan Breezy Dalagdag",
    toDepartment: "Sales - Zamboanga West",
    requestedDate: "Mar 4, 2026",
    status: "pending",
  },
  {
    id: "t7",
    documentName: "Certificate of Fully Paid",
    documentType: "CERTIFICATE OF FULLY PAID",
    fromEmployee: "Kristine Garcia",
    fromDepartment: "Sales - Cebu Central",
    toEmployee: "Patricia Navarro",
    toDepartment: "Sales - Bacolod Main",
    requestedDate: "Mar 3, 2026",
    status: "approved",
  },
  {
    id: "t8",
    documentName: "Planholder Identification Cards",
    documentType: "PLANHOLDER IDENTIFICATION CARD",
    fromEmployee: "Patricia Navarro",
    fromDepartment: "Sales - Bacolod Main",
    toEmployee: "Julie Ann Ramirez",
    toDepartment: "Sales - Davao South",
    requestedDate: "Mar 2, 2026",
    status: "pending",
  },
  {
    id: "t9",
    documentName: "Cremation Plan Agreement Forms",
    documentType: "CREMATION PLAN AGREEMENT",
    fromEmployee: "Daniel Hernandez",
    fromDepartment: "Sales - Cagayan De Oro",
    toEmployee: "Michael Fernandez",
    toDepartment: "Sales - Iloilo City",
    requestedDate: "Mar 1, 2026",
    status: "denied",
  },
  {
    id: "t10",
    documentName: "Life Plan Agreement Gabriel",
    documentType: "LIFE PLAN AGREEMENT GABRIEL",
    fromEmployee: "Carlo Miguel Mendoza",
    fromDepartment: "Sales - Cebu Central",
    toEmployee: "Bryan Breezy Dalagdag",
    toDepartment: "Sales - Zamboanga West",
    requestedDate: "Mar 4, 2026",
    status: "pending",
  },
];
