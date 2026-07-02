"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  type ApprovalView,
  type ReassignmentRequest,
  type SA2Reassignment,
  type EmployeeMovement,
  mapDRSToDepositAndPayments,
} from "../data/types";

import {
  REASSIGNMENT_DATA,
  SA2_DATA,
  MOVEMENT_DATA,
  depositDtlList,
  depositHdrList,
  drsList,
  paymentList,
} from "../data/data";
import { reassignmentColumns } from "../data/columns/reassignment-columns";
import { movementColumns } from "../data/columns/movement-columns";
import { sa2Columns } from "../data/columns/sa2-columns";
import { drsColumns } from "../data/columns/drs-columns";

const DRS_DATA = mapDRSToDepositAndPayments(
  drsList,
  depositHdrList,
  depositDtlList,
  paymentList,
).map((row) => ({
  ...row,

  referenceNo: row.drs?.referenceNo ?? "",
  status: row.drs?.status ?? "",
  requestDate: row.drs?.createdAt ?? "",
  requester: row.deposit?.deposit?.DepositedBy ?? "",

  depositedBy: row.deposit?.deposit?.DepositedBy ?? "",
  depositDateTime: row.deposit?.deposit?.DepositDateTime ?? "",
  bankCode: row.deposit?.deposit?.BankCode ?? "",
  bankBranch: row.deposit?.deposit?.BankBranch ?? "",
  accountNo: row.deposit?.deposit?.AccountNo ?? "",
  amount: Number(row.deposit?.deposit?.Amount ?? 0),
  siCount: row.deposit?.details?.length ?? 0,
}));

export type ApprovalConfig = {
  title: string;
  description: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  getRowId: (row: any, index: number) => string;
  detailLayout?: "fields" | "drs-print";

  detailFields: ApprovalFieldConfig[];
  mobile: ApprovalMobileConfig;
};

export const approvalConfig: Record<ApprovalView, ApprovalConfig> = {
  "reassignment-doc": {
    title: "Reassignment of Documents",
    description: "Review document reassignment requests.",
    data: REASSIGNMENT_DATA,
    columns: reassignmentColumns as ColumnDef<any, any>[],
    getRowId: (row: ReassignmentRequest) => row.salesForceId,

    detailFields: [
      { key: "salesForceId", label: "SalesForce ID" },
      { key: "document", label: "Document" },
      { key: "series", label: "Series" },
      { key: "from", label: "From" },
      { key: "to", label: "To" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "salesForceId",
      secondaryField: "document",
      badgeField: "status",
      visibleFields: ["series", "from", "to", "requestDate", "requester"],
      labelMap: {
        salesForceId: "SalesForce ID",
        document: "Document",
        series: "Series",
        from: "From",
        to: "To",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  drs: {
    title: "DRS Approval",
    description: "Review deposit report summaries.",
    data: DRS_DATA,
    columns: drsColumns as ColumnDef<any, any>[],
    getRowId: (row: any, index: number) =>
      row.drs?.id ?? row.id ?? String(index),
    detailLayout: "drs-print",
    detailFields: [
      { key: "drs.referenceNo", label: "Reference No." },
      { key: "deposit.deposit.DepositedBy", label: "Deposited By" },
      { key: "deposit.deposit.DepositDateTime", label: "Deposit Date" },
      { key: "deposit.deposit.BankCode", label: "Bank Code" },
      { key: "deposit.deposit.BankBranch", label: "Bank Branch" },
      { key: "deposit.deposit.AccountNo", label: "Account No." },
      { key: "deposit.deposit.Amount", label: "Amount" },
      { key: "drs.createdAt", label: "Request Date", mandatory: true },
      {
        key: "deposit.deposit.DepositedBy",
        label: "Requester",
        mandatory: true,
      },
      { key: "drs.status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "referenceNo",
      secondaryField: "depositedBy",
      badgeField: "status",
      visibleFields: [
        "depositDateTime",
        "bankCode",
        "amount",
        "siCount",
        "status",
      ],
      labelMap: {
        referenceNo: "Reference No.",
        depositedBy: "Deposited By",
        depositDateTime: "Deposit Date",
        bankCode: "Bank Code",
        bankBranch: "Bank Branch",
        accountNo: "Account No.",
        amount: "Amount",
        siCount: "SI Count",
        status: "Status",
      },
    },
  },

  "movement-employees": {
    title: "Movement of Employees",
    description: "Review employee movement requests.",
    data: MOVEMENT_DATA,
    columns: movementColumns as ColumnDef<any, any>[],
    getRowId: (row: EmployeeMovement) => row.id,

    detailFields: [
      { key: "id", label: "Request ID" },
      { key: "employee", label: "Employee" },
      { key: "currentPosition", label: "Current Position" },
      { key: "newPosition", label: "New Position" },
      { key: "movementType", label: "Movement Type" },
      { key: "date", label: "Effective Date" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "employee",
      secondaryField: "movementType",
      badgeField: "status",
      visibleFields: [
        "currentPosition",
        "newPosition",
        "date",
        "requestDate",
        "requester",
      ],
      labelMap: {
        id: "Request ID",
        employee: "Employee",
        currentPosition: "Current Position",
        newPosition: "New Position",
        movementType: "Movement Type",
        date: "Effective Date",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "reassignment-sa2": {
    title: "Reassignment of SA2",
    description: "Review SA2 reassignment requests.",
    data: SA2_DATA,
    columns: sa2Columns as ColumnDef<any, any>[],
    getRowId: (row: SA2Reassignment) => row.id,

    detailFields: [
      { key: "id", label: "Request ID" },
      { key: "employee", label: "Employee" },
      { key: "fromManager", label: "From Manager" },
      { key: "toManager", label: "To Manager" },
      { key: "branch", label: "Branch" },
      { key: "date", label: "Effective Date" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "employee",
      secondaryField: "branch",
      badgeField: "status",
      visibleFields: [
        "fromManager",
        "toManager",
        "date",
        "requestDate",
        "requester",
      ],
      labelMap: {
        id: "Request ID",
        employee: "Employee",
        fromManager: "From Manager",
        toManager: "To Manager",
        branch: "Branch",
        date: "Effective Date",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },
};

export type ApprovalFieldConfig = {
  key: string;
  label: string;
  mandatory?: boolean;
};

export type ApprovalMobileConfig = {
  primaryField: string;
  secondaryField?: string;
  badgeField: string;
  visibleFields: string[];
  labelMap: Record<string, string>;
};
