import { approvalConfig } from "../config/approval-config";
import type { ApprovalView } from "@/app/(bpis)/data/approvals/types";

/**
 * In-memory mock "backend" for the approvals list. Seeded once from the
 * static config data, then mutated in place by approve/deny requests so
 * subsequent reads (e.g. after a refetch) see the persisted result.
 */
const store: Record<ApprovalView, any[]> = {
  "reassignment-doc": [...approvalConfig["reassignment-doc"].data],
  drs: [...approvalConfig.drs.data],
  "movement-employees": [...approvalConfig["movement-employees"].data],
  "reassignment-sa2": [...approvalConfig["reassignment-sa2"].data],
  "user-assignment": [...approvalConfig["user-assignment"].data],
};

export function readApprovals(view: ApprovalView): any[] {
  return store[view];
}

export function writeApprovals(view: ApprovalView, rows: any[]): void {
  store[view] = rows;
}

/**
 * Files a new request at the top of a queue, where a reviewer meets it first —
 * these lists are read newest-decision-first, and a request that landed behind
 * twenty settled rows would be missed.
 */
export function enqueueApproval(view: ApprovalView, row: any): void {
  store[view] = [row, ...store[view]];
}
