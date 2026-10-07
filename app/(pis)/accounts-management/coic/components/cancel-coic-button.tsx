"use client";

// Cancel COIC — a bulk action on the List of Printed, cloned from COFP's
// Cancel COFP (user, 2026-10-06). Cancels the checked certificates after a
// confirmation; the page drops them from the memo, and the memo from the rail
// once it has none left.

import { Ban } from "lucide-react";
import { useMessageDialog, type BulkAction } from "osp-ui-kit";
import { toast } from "sonner";

import type { CoicForPrinting, CoicMemo } from "../data/types";

export interface CoicCancelActionOptions {
  memo?: CoicMemo;
  onCancelled: (rows: CoicForPrinting[]) => void;
}

/** The Cancel COIC bulk action, run on the checked rows. */
export function useCoicCancelAction({
  memo,
  onCancelled,
}: CoicCancelActionOptions): BulkAction<CoicForPrinting> {
  const { messageBox } = useMessageDialog();

  return {
    id: "cancel-coic",
    label: "Cancel COIC",
    icon: Ban,
    variant: "destructive",
    onClick: async (rows) => {
      if (!memo || rows.length === 0) return;
      const count = rows.length;
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: `Are you sure you want to cancel ${count} certificate(s) under ${memo.memoNo}?`,
        confirmText: "Cancel COIC",
        variant: "confirmation",
      });
      if (!confirmed) return;

      onCancelled(rows);
      toast.success(`${count} certificate(s) under ${memo.memoNo} cancelled.`);
    },
  };
}
