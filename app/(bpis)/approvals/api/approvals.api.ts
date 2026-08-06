import { delay } from "@/lib/delay";
import type {
  ApprovalStatus,
  ApprovalView,
} from "@/app/(bpis)/data/approvals/types";
import { approvalConfig } from "../config/approval-config";
import { readApprovals, writeApprovals } from "./approvals.store";

function withStatus(row: any, status: ApprovalStatus) {
  if (row.drs) {
    return { ...row, status, drs: { ...row.drs, status } };
  }

  return { ...row, status };
}

export async function getApprovals(view: ApprovalView): Promise<any[]> {
  await delay(500);

  return readApprovals(view);
}

export async function updateApprovalStatus(
  view: ApprovalView,
  rowIds: string[],
  status: ApprovalStatus,
): Promise<any[]> {
  await delay(400);

  const config = approvalConfig[view];
  const ids = new Set(rowIds);

  const updated = readApprovals(view).map((row, index) =>
    ids.has(config.getRowId(row, index)) ? withStatus(row, status) : row,
  );

  writeApprovals(view, updated);

  return updated;
}
