"use client";

// Untag and Remove on the List of Confiscated COFP (user, 2026-10-07).
//
// UNTAG is per row, beside Edit: the certificate is no longer confiscated.
// REMOVE is under the list, for the checked rows — captioned Untag too (user,
// 2026-10-07). Both ask first, and the page
// drops what they ran on from the list.

import { useCallback } from "react";
import { TagIcon } from "lucide-react";
import { useMessageDialog, type BulkAction } from "osp-ui-kit";
import { toast } from "sonner";

import type { CofpForPrinting } from "../data/types";

/** Untag, as the list card's `onUntag` — held steady across renders. */
export function useCofpUntag(
  onUntagged: (row: CofpForPrinting) => void,
): (row: CofpForPrinting) => Promise<void> {
  const { messageBox } = useMessageDialog();

  return useCallback(
    async (row: CofpForPrinting) => {
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: `Untag ${row.cofpNo} (${row.lpaNo}) as confiscated?`,
        confirmText: "Untag",
        variant: "confirmation",
      });
      if (!confirmed) return;
      onUntagged(row);
      toast.success(`${row.cofpNo} untagged.`);
    },
    [messageBox, onUntagged],
  );
}

/** Remove, one of the list card's `footerActions`, run on the checked rows. */
export function useCofpRemoveAction(
  onRemoved: (rows: CofpForPrinting[]) => void,
): BulkAction<CofpForPrinting> {
  const { messageBox } = useMessageDialog();

  return {
    id: "remove-confiscated",
    // Captioned Untag (user, 2026-10-07): the row action's own word, for the
    // checked rows.
    label: "Untag",
    icon: TagIcon,
    variant: "destructive",
    onClick: async (rows) => {
      if (rows.length === 0) return;
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: `Untag ${rows.length} certificate(s) as confiscated?`,
        confirmText: "Untag",
        variant: "confirmation",
      });
      if (!confirmed) return;
      onRemoved(rows);
      toast.success(`${rows.length} certificate(s) untagged.`);
    },
  };
}
