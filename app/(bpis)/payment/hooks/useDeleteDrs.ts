import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDrs } from "../api/payment.api";

export function useDeleteDrs() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteDrs(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["payment", "drs-list"], updated);
    },
  });

  return {
    deleteDrs: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
