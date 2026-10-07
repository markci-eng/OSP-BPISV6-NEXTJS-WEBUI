"use client";

// Cancel COFP — a bulk action on the List of Printed (user, 2026-10-05; moved
// into the kit's DataTable selection bar, user, 2026-10-06). Cancels the
// checked certificates after a confirmation; the page drops them from the
// memo, and the memo from the rail once it has none left.

import { Ban } from "lucide-react";
import { useMessageDialog, type BulkAction } from "osp-ui-kit";
import { toast } from "sonner";

import type { CofpForPrinting, CofpMemo } from "../data/types";

export interface CofpCancelActionOptions {
  memo?: CofpMemo;
  onCancelled: (rows: CofpForPrinting[]) => void;
}

/** The Cancel COFP bulk action, run on the checked rows. */
export function useCofpCancelAction({
  memo,
  onCancelled,
}: CofpCancelActionOptions): BulkAction<CofpForPrinting> {
  const { messageBox } = useMessageDialog();

  return {
    id: "cancel-cofp",
    label: "Cancel COFP",
    icon: Ban,
    variant: "destructive",
    onClick: async (rows) => {
      if (!memo || rows.length === 0) return;
      const count = rows.length;
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: `Are you sure you want to cancel ${count} certificate(s) under ${memo.memoNo}?`,
        confirmText: "Cancel COFP",
        variant: "confirmation",
      });
      if (!confirmed) return;

      onCancelled(rows);
      toast.success(`${count} certificate(s) under ${memo.memoNo} cancelled.`);
    },
  };
}
