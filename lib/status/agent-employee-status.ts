import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";

export const AGENT_EMPLOYEE_STATUS_COLOR: Record<
  SalesAgent["employeeStatus"],
  "success" | "warning" | "danger"
> = {
  Active: "success",
  Inactive: "warning",
  Resigned: "danger",
};
