import { delay } from "@/lib/delay";
import type {
  ApprovalStatus,
  ApprovalView,
  UserAssignmentRequest,
} from "@/app/(bpis)/data/approvals/types";
import { applyAssignedRoles } from "@/app/(bpis)/role-access-management/api/role-access.api";
import { approvalConfig } from "../config/approval-config";
import {
  enqueueApproval,
  readApprovals,
  writeApprovals,
} from "./approvals.store";

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

/** The group codes a request row carries, as the policy service spells them. */
function groupCodesOf(value: string): string[] {
  return value
    .split(",")
    .map((code) => code.trim())
    .filter((code) => code && code !== "—");
}

export async function updateApprovalStatus(
  view: ApprovalView,
  rowIds: string[],
  status: ApprovalStatus,
): Promise<any[]> {
  await delay(400);

  const config = approvalConfig[view];
  const ids = new Set(rowIds);
  const decided: any[] = [];

  const updated = readApprovals(view).map((row, index) => {
    if (!ids.has(config.getRowId(row, index))) return row;

    const next = withStatus(row, status);
    decided.push(next);
    return next;
  });

  writeApprovals(view, updated);

  // Approving an assignment is what grants it. Until this line the user holds
  // whatever they held when the request was filed, which is the whole point of
  // sending it here rather than writing the roles at the console.
  if (view === "user-assignment" && status === "Approved") {
    decided.forEach((row: UserAssignmentRequest) =>
      applyAssignedRoles(row.memberCode, groupCodesOf(row.requestedGroups)),
    );
  }

  return updated;
}

/** What the access console knows about a role change when it files one. */
export type UserAssignmentInput = {
  user: string;
  memberCode: string;
  position: string;
  branch: string;
  /** AccessGroupCodes held today. */
  currentGroups: string[];
  /** AccessGroupCodes being asked for. */
  requestedGroups: string[];
  /** Permissions the change would grant and revoke. */
  granted: number;
  revoked: number;
  requester: string;
};

/** Highest `UAR-nnnn` in the queue plus one, so ids stay unique per session. */
function nextAssignmentId(): string {
  const highest = readApprovals("user-assignment").reduce(
    (max: number, row: UserAssignmentRequest) => {
      const n = Number(String(row.id).replace(/\D/g, ""));
      return Number.isFinite(n) && n > max ? n : max;
    },
    0,
  );

  return `UAR-${String(highest + 1).padStart(4, "0")}`;
}

/**
 * Files an access group assignment for approval.
 *
 * The user's roles are deliberately NOT written here: assignment is what the
 * approver grants, so until this row is approved the user keeps the access they
 * already had.
 */
export async function submitUserAssignment(
  input: UserAssignmentInput,
): Promise<UserAssignmentRequest> {
  await delay(400);

  const today = new Date().toISOString().slice(0, 10);

  const row: UserAssignmentRequest = {
    id: nextAssignmentId(),
    user: input.user,
    memberCode: input.memberCode,
    position: input.position,
    branch: input.branch,
    currentGroups: input.currentGroups.join(", ") || "—",
    requestedGroups: input.requestedGroups.join(", ") || "—",
    permissionEffect: `+${input.granted} / −${input.revoked}`,
    status: "Pending",
    date: today,
    requestDate: today,
    requester: input.requester,
  };

  enqueueApproval("user-assignment", row);

  return row;
}
