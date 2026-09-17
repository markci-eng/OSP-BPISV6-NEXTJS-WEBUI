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
    onSuccess: (updated, { status }) => {
      queryClient.setQueryData(["approvals", view], updated);

      // Approving an assignment writes the roles through to the policy
      // service, so the access console is now showing a user's old groups —
      // and the group rails count their members from the same map.
      if (view === "user-assignment" && status === "Approved") {
        queryClient.invalidateQueries({
          queryKey: ["role-access", "user-roles"],
        });
      }
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
