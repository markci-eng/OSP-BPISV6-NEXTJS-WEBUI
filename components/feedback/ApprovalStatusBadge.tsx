import type { ReactNode } from "react";
import { OSPBadge } from "osp-ui-kit";
import type { OSPBadgeProps } from "osp-ui-kit";

export function getApprovalStatusTone(
  status: string,
): NonNullable<OSPBadgeProps["type"]> {
  if (status === "Approved") return "success";
  if (status === "Denied") return "danger";
  return "warning";
}

export function ApprovalStatusBadge({
  status,
  icon,
}: {
  status: string;
  icon?: ReactNode;
}) {
  return (
    <OSPBadge
      type={getApprovalStatusTone(status)}
      gap={icon ? 1 : undefined}
      flexShrink={0}
    >
      {icon}
      {status}
    </OSPBadge>
  );
}
