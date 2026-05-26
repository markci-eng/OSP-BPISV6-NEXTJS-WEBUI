import { Employee } from "@/data/doc-management/employeeSelector";
import { Documents } from "@/data/doc-management/documenttype";

export type AssignedDocRow = Documents & {
  controlNo: string;
  employeeName: string;
  remainingQtyNum: number;
  assignedStatus: "Assigned" | "Unassigned" | "Unknown Employee";
  expiryDateNum: string;
  branch?: string;
};

export type AssignDocumentPayload = {
  employeeId: string;
  selectedEmployee: Employee;
  docType: string;
  quantity: string;
  documentSeries: string;
};

export type BlockDocumentPayload = {
  employeeId?: string;
  documentCode: string;
  documentType: string;
  documentStart: string;
  documentEnd: string;
  blockType: string;
  remarks: string;
};

export type ReassignDocumentPayload = {
  employeeId?: string;
  documentCode: string;
  currentEmployeeId?: string;
  newEmployeeId: string;
  remarks: string;
};
