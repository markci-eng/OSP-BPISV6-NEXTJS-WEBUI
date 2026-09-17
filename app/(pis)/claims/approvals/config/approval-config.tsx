"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { approveBilling } from "../../service-payables/service-payables-store";
import { getDeathClaimApprovals, getServiceApprovals } from "../data/data";
import { deathClaimColumns } from "../data/columns/death-claim-columns";
import { serviceColumns } from "../data/columns/service-columns";
import type {
  ApprovalView,
  DeathClaimApproval,
  ServiceApproval,
} from "../data/types";

export type ApprovalConfig = {
  title: string;
  description: string;
  /**
   * The rows, READ WHEN THE TABLE MOUNTS rather than held as an array on this
   * object.
   *
   * Both queues are derived from stores that this page itself writes to — see
   * `commit`. A module-level array would be the snapshot taken the first time
   * anything imported this file, so a billing approved here would still be
   * listed as pending after navigating away and back, which is the one thing a
   * queue must never do.
   */
  getData: () => any[];
  columns: ColumnDef<any, any>[];
  getRowId: (row: any, index: number) => string;
  /**
   * Whether this queue can be DENIED, or only approved.
   *
   * SERVICE PAYABLES CANNOT (user, 2026-09-15): "in service there is no deny
   * only approval". It is not a missing feature — `BillingStage` has no denied
   * state because a billing is never rejected outright; what is wrong with one
   * is a discrepancy on a service, which is corrected elsewhere and does not
   * hold the billing. A Deny button there would be a control with nowhere to
   * write and nothing to mean.
   *
   * A death claim CAN be denied, because a claim is a question with two
   * answers — the beneficiary is owed the benefit or they are not.
   *
   * It takes away three things at once: the row action, the bulk action, and the
   * Deny button in the detail drawer. It also takes away the REJECTED CARD,
   * which is the part worth stating — a stat card that can only ever read zero
   * is not a filter, it is furniture that looks like one.
   */
  canDeny: boolean;
  /**
   * What the stat cards above the table COUNT, and what clicking one filters by.
   *
   *   "status"  Total / Pending / Approved / Rejected — the AMD shape.
   *   "kind"    Total, then one card per claim NATURE (user, 2026-09-15).
   *
   * THE SPLIT THAT TELLS YOU SOMETHING IS NOT THE SAME ON BOTH QUEUES. Every row
   * on this page is verified and awaiting a decision, so on the service queue
   * "Pending" is just the total again and the other two count only what this
   * session did — thin, but it is the only split a billing has. A claim queue
   * holds three different KINDS of claim, and which of them is waiting is the
   * question a supervisor actually opens the page with.
   */
  cardFacet: "status" | "kind";
  /**
   * Put Approve and Deny IN THE ROW as a pair of buttons, instead of behind the
   * table's "…" row-action menu (user, 2026-09-15).
   *
   * The kit collapses two or more row actions into a menu, so a supervisor
   * working down a queue had to open a menu per claim to reach either answer.
   * With this on, the table appends a decision cell and the menu is not
   * rendered at all — one way to answer a row, and it is visible.
   *
   * IT ALSO SHOWS THE OUTCOME. With the Status column gone, the cell is the only
   * thing that can report what was just pressed, so a decided row swaps its two
   * buttons for the badge. That is why this is one column and not two buttons
   * bolted onto the end of the column list.
   *
   * Left off for service payables, where there is only one answer — the kit
   * already renders a single row action inline as a tick, which is the same
   * thing this would build by hand.
   */
  decisionColumn: boolean;
  /**
   * Write the decision back to the module the record belongs to.
   *
   * Optional, and absent where the module has nowhere to put it — the table's
   * own state still moves the row either way, so a queue without a commit
   * behaves exactly as this page did before, for the length of the session.
   */
  commit?: (row: any, status: "Approved" | "Denied") => void;

  detailFields: ApprovalFieldConfig[];
  mobile: ApprovalMobileConfig;
};

export const approvalConfig: Record<ApprovalView, ApprovalConfig> = {
  service: {
    title: "Service Payables",
    description: "Approve verified chapel billings.",
    getData: getServiceApprovals,
    columns: serviceColumns as ColumnDef<any, any>[],
    // The billing CODE, not the billing number — the code is derived and always
    // present, so it identifies a row even where the number has not been minted.
    getRowId: (row: ServiceApproval) => row.billingCode,
    canDeny: false,
    cardFacet: "status",
    decisionColumn: false,

    // THE SAME WRITE THE CONVEYOR USED TO MAKE. Approving here is not a note on
    // this page: it stamps the billing and sends it on to For Endorsement,
    // exactly as pressing Approve on the service payables screen did before that
    // queue moved here. The two cannot drift, because there is only one write.
    //
    // There is no denial branch to write because there is no denial — see
    // `canDeny` above.
    commit: (row: ServiceApproval, status) => {
      if (status === "Approved") approveBilling(row.billingCode);
    },

    detailFields: [
      { key: "billingNo", label: "Billing No." },
      { key: "billingCode", label: "Billing Code" },
      { key: "chapelDesc", label: "Chapel" },
      { key: "chapelCode", label: "Chapel Code" },
      { key: "territoryCode", label: "Territory" },
      { key: "periodLabel", label: "Billing Period" },
      { key: "serviceCount", label: "Services" },
      { key: "deficientCount", label: "Deficient" },
      { key: "totalAmount", label: "Total Amount" },
      { key: "requestDate", label: "Request Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "billingNo",
      secondaryField: "chapelDesc",
      badgeField: "status",
      visibleFields: [
        "territoryCode",
        "periodLabel",
        "serviceCount",
        "totalAmount",
        "requester",
      ],
      labelMap: {
        billingNo: "Billing No.",
        billingCode: "Billing Code",
        chapelDesc: "Chapel",
        chapelCode: "Chapel Code",
        territoryCode: "Territory",
        periodLabel: "Billing Period",
        serviceCount: "Services",
        deficientCount: "Deficient",
        totalAmount: "Total Amount",
        requestDate: "Request Date",
        requester: "Requester",
        status: "Status",
      },
    },
  },

  "death-claim": {
    title: "Death Claim",
    description: "Approve or deny verified death claims.",
    canDeny: true,
    cardFacet: "kind",
    // OFF AGAIN (user, 2026-09-15). It was added so the two answers were not
    // behind a menu, and taken out with the Requester column when the table was
    // trimmed. With it off, `ApprovalsTable` passes `rowActions` through instead,
    // so Approve and Deny are still on every row — one click further, in the "…"
    // menu — as well as in the detail drawer and in the bulk bar.
    decisionColumn: false,
    // NO `commit`. The death claim's own supervisor queue is still worked on the
    // conveyor — this is a second view onto it, not a replacement for it — and
    // deciding a claim there writes the endorsement. Stamping it from here too
    // would put the decision in two places with nothing to reconcile them.
    getData: getDeathClaimApprovals,
    columns: deathClaimColumns as ColumnDef<any, any>[],
    getRowId: (row: DeathClaimApproval) => row.id,

    detailFields: [
      { key: "claimNo", label: "Claim No." },
      { key: "priority", label: "Type" },
      { key: "reference", label: "Request No." },
      { key: "planholder", label: "Planholder" },
      { key: "lpaNo", label: "LPA No." },
      { key: "benefit", label: "Benefit" },
      { key: "dateOfDeath", label: "Date of Death" },
      { key: "requestingBranch", label: "Branch" },
      { key: "filedDate", label: "Filed Date", mandatory: true },
      { key: "requester", label: "Requester", mandatory: true },
      { key: "status", label: "Status", mandatory: true },
    ],

    mobile: {
      primaryField: "claimNo",
      secondaryField: "planholder",
      badgeField: "status",
      visibleFields: [
        "priority",
        "benefit",
        "dateOfDeath",
        "requestingBranch",
        "filedDate",
        "requester",
      ],
      labelMap: {
        claimNo: "Claim No.",
        priority: "Type",
        reference: "Request No.",
        planholder: "Planholder",
        lpaNo: "LPA No.",
        benefit: "Benefit",
        dateOfDeath: "Date of Death",
        requestingBranch: "Branch",
        filedDate: "Filed Date",
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
