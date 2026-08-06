import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApprovalStatus,
  ApprovalView,
} from "@/app/(bpis)/data/approvals/types";
import { updateApprovalStatus } from "../api/approvals.api";

export function useApprovalMutations(view: ApprovalView) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      rowIds,
      status,
    }: {
      rowIds: string[];
      status: ApprovalStatus;
    }) => updateApprovalStatus(view, rowIds, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["approvals", view], updated);
    },
  });

  return {
    approve: (rowIds: string[]) =>
      mutation.mutateAsync({ rowIds, status: "Approved" }),
    deny: (rowIds: string[]) =>
      mutation.mutateAsync({ rowIds, status: "Denied" }),
    isMutating: mutation.isPending,
  };
}
