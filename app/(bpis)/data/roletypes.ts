export type Role =
  | "cashier"
  | "encoder"
  | "branch_manager"
  | "STL"
  | "CS"
  | "SA2";

export const canApprove = (role: Role) => role === "branch_manager";
export const canRequest = (role: Role) =>
  role === "cashier" ||
  role === "encoder" ||
  role === "branch_manager" ||
  role === "SA2" ||
  role === "STL" ||
  role === "CS";
