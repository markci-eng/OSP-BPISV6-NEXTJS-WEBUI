"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  COFPApproval,
  CSVApproval,
  CreditMemoApproval,
  DebitMemoApproval,
  PlanTerminationApproval,
  ROPApproval,
  ReinstatementApproval,
  ApprovalView,
  TransferOfRightsApproval,
} from "../data/types";

import {
  ROP_DATA,
  REINSTATEMENT_DATA,
  TRANSFER_OF_RIGHTS_DATA,
  PLAN_TERMINATION_DATA,
  CSV_DATA,
  COFP_DATA,
  CREDIT_MEMO_DATA,
  DEBIT_MEMO_DATA,
} from "../data/data";

import { ropColumns } from "../data/columns/rop-columns";
import { reinstatementColumns } from "../data/columns/reinstatement-columns";
import { transferOfRightsColumns } from "../data/columns/transfer-of-rights-columns";
import { planTerminationColumns } from "../data/columns/plan-termination-columns";
import { csvColumns } from "../data/columns/csv-columns";
import { cofpColumns } from "../data/columns/cofp-columns";
import { creditMemoColumns } from "../data/columns/credit-memo-columns";
import { debitMemoColumns } from "../data/columns/debit-memo-columns";

export type ApprovalConfig = {
  title: string;
  description: string;
  data: any[];
  columns: ColumnDef<any, any>[];
  getRowId: (row: any, index: number) => string;
  detailLayout?: "fields";

  detailFields: ApprovalFieldConfig[];
  mobile: ApprovalMobileConfig;
};

export const approvalConfig: Record<ApprovalView, ApprovalConfig> = {
  rop: {
    title: "Return Of Premium",
    description: "Review Return of Premium requests.",
    data: ROP_DATA,
    columns: ropColumns as ColumnDef<any, any>[],
    getRowId: (row: ROPApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planholderName", label: "Planholder" },
      { key: "planType", label: "Plan Type" },
      { key: "ropDate", label: "ROP Date" },
      { key: "totalAmount", label: "Total Amount" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "lpaNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["planType", "ropDate", "totalAmount", "requestDate"],
      labelMap: {
        lpaNo: "LPA No.",
        planholderName: "Planholder",
        planType: "Plan Type",
        ropDate: "ROP Date",
        totalAmount: "Total Amount",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  reinstatement: {
    title: "Reinstatement",
    description: "Review plan reinstatement requests.",
    data: REINSTATEMENT_DATA,
    columns: reinstatementColumns as ColumnDef<any, any>[],
    getRowId: (row: ReinstatementApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planholderName", label: "Planholder" },
      { key: "planType", label: "Plan Type" },
      { key: "mop", label: "Mode of Payment" },
      { key: "balance", label: "Balance" },
      { key: "reinstatementFee", label: "Reinstatement Fee" },
      { key: "dueDate", label: "Due Date" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "lpaNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["planType", "mop", "balance", "reinstatementFee"],
      labelMap: {
        lpaNo: "LPA No.",
        planholderName: "Planholder",
        planType: "Plan Type",
        mop: "Mode of Payment",
        balance: "Balance",
        reinstatementFee: "Reinstatement Fee",
        dueDate: "Due Date",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "transfer-of-rights": {
    title: "Transfer Of Rights",
    description: "Review transfer of rights requests.",
    data: TRANSFER_OF_RIGHTS_DATA,
    columns: transferOfRightsColumns as ColumnDef<any, any>[],
    getRowId: (row: TransferOfRightsApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planType", label: "Plan Type" },
      { key: "fromPlanholder", label: "From" },
      { key: "toPlanholder", label: "To" },
      { key: "balance", label: "Balance" },
      { key: "installmentAmount", label: "Installment Amount" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "fromPlanholder",
      secondaryField: "toPlanholder",
      badgeField: "status",
      visibleFields: ["lpaNo", "planType", "balance", "installmentAmount"],
      labelMap: {
        lpaNo: "LPA No.",
        planType: "Plan Type",
        fromPlanholder: "From",
        toPlanholder: "To",
        balance: "Balance",
        installmentAmount: "Installment Amount",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "plan-termination": {
    title: "Plan Termination",
    description: "Review plan termination requests.",
    data: PLAN_TERMINATION_DATA,
    columns: planTerminationColumns as ColumnDef<any, any>[],
    getRowId: (row: PlanTerminationApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planholderName", label: "Planholder" },
      { key: "planType", label: "Plan Type" },
      { key: "terminationReason", label: "Reason" },
      { key: "refundAmount", label: "Refund Amount" },
      { key: "terminationDate", label: "Termination Date" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "lpaNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: [
        "planType",
        "terminationReason",
        "refundAmount",
        "terminationDate",
      ],
      labelMap: {
        lpaNo: "LPA No.",
        planholderName: "Planholder",
        planType: "Plan Type",
        terminationReason: "Reason",
        refundAmount: "Refund Amount",
        terminationDate: "Termination Date",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  csv: {
    title: "Cash Surrender Value (CSV)",
    description: "Review cash surrender value requests.",
    data: CSV_DATA,
    columns: csvColumns as ColumnDef<any, any>[],
    getRowId: (row: CSVApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planholderName", label: "Planholder" },
      { key: "planType", label: "Plan Type" },
      { key: "surrenderValue", label: "Surrender Value" },
      { key: "surrenderDate", label: "Surrender Date" },
      { key: "reason", label: "Reason" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "lpaNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["planType", "surrenderValue", "surrenderDate", "reason"],
      labelMap: {
        lpaNo: "LPA No.",
        planholderName: "Planholder",
        planType: "Plan Type",
        surrenderValue: "Surrender Value",
        surrenderDate: "Surrender Date",
        reason: "Reason",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  cofp: {
    title: "Certificate Of Full Payment (COFP)",
    description: "Review certificate of full payment requests.",
    data: COFP_DATA,
    columns: cofpColumns as ColumnDef<any, any>[],
    getRowId: (row: COFPApproval) => row.id,

    detailFields: [
      { key: "lpaNo", label: "LPA No." },
      { key: "planholderName", label: "Planholder" },
      { key: "planType", label: "Plan Type" },
      { key: "cfpNumber", label: "COFP Number" },
      { key: "cfpDate", label: "COFP Date" },
      { key: "totalAmountPaid", label: "Total Amount Paid" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "lpaNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["planType", "cfpNumber", "cfpDate", "totalAmountPaid"],
      labelMap: {
        lpaNo: "LPA No.",
        planholderName: "Planholder",
        planType: "Plan Type",
        cfpNumber: "COFP Number",
        cfpDate: "COFP Date",
        totalAmountPaid: "Total Amount Paid",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "credit-memo": {
    title: "Credit Memo",
    description: "Review credit memo requests.",
    data: CREDIT_MEMO_DATA,
    columns: creditMemoColumns as ColumnDef<any, any>[],
    getRowId: (row: CreditMemoApproval) => row.id,

    detailFields: [
      { key: "memoNo", label: "Memo No." },
      { key: "planholderName", label: "Planholder" },
      { key: "creditMemoType", label: "Type" },
      { key: "amount", label: "Amount" },
      { key: "remarks", label: "Remarks" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "memoNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["creditMemoType", "amount", "remarks"],
      labelMap: {
        memoNo: "Memo No.",
        planholderName: "Planholder",
        creditMemoType: "Type",
        amount: "Amount",
        remarks: "Remarks",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "debit-memo": {
    title: "Debit Memo",
    description: "Review debit memo requests.",
    data: DEBIT_MEMO_DATA,
    columns: debitMemoColumns as ColumnDef<any, any>[],
    getRowId: (row: DebitMemoApproval) => row.id,

    detailFields: [
      { key: "memoNo", label: "Memo No." },
      { key: "planholderName", label: "Planholder" },
      { key: "debitMemoType", label: "Type" },
      { key: "amount", label: "Amount" },
      { key: "remarks", label: "Remarks" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "memoNo",
      secondaryField: "planholderName",
      badgeField: "status",
      visibleFields: ["debitMemoType", "amount", "remarks"],
      labelMap: {
        memoNo: "Memo No.",
        planholderName: "Planholder",
        debitMemoType: "Type",
        amount: "Amount",
        remarks: "Remarks",
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
