"use client";

// Return — a bulk action on the List of Confiscated COFP (user, 2026-10-05;
// moved into the kit's DataTable selection bar, user, 2026-10-06). Opens the
// Return COFP dialog for the checked certificates; the page drops them from
// the list once they are returned.

import { useState, type ReactNode } from "react";
import { Undo2 } from "lucide-react";
import type { BulkAction } from "osp-ui-kit";
import { toast } from "sonner";

import type { CofpForPrinting } from "../data/types";
import { CofpReturnDialog, type CofpReturnDetails } from "./return-cofp-dialog";

export interface CofpReturnActionOptions {
  /** The branch the list is under — the dialog's branch to start on. */
  branchCode?: string;
  onReturned: (rows: CofpForPrinting[], details: CofpReturnDetails) => void;
}

/**
 * The Return bulk action, and the dialog it opens — render `dialog` anywhere
 * on the page.
 */
export function useCofpReturnAction({
  branchCode,
  onReturned,
}: CofpReturnActionOptions): { action: BulkAction<CofpForPrinting>; dialog: ReactNode } {
  // The checked rows, held from the click — the table clears its checks as
  // soon as a bulk action runs.
  const [returning, setReturning] = useState<CofpForPrinting[]>();

  const action: BulkAction<CofpForPrinting> = {
    id: "return-cofp",
    label: "Return",
    icon: Undo2,
    onClick: (rows) => {
      if (rows.length > 0) setReturning(rows);
    },
  };

  // Mounted only while open, so every opening starts from the list's branch,
  // today's date and a blank remark.
  const dialog = returning && (
    <CofpReturnDialog
      open
      onOpenChange={(open) => !open && setReturning(undefined)}
      count={returning.length}
      defaultBranchCode={branchCode}
      onReturn={(details) => {
        onReturned(returning, details);
        toast.success(
          `${returning.length} certificate(s) returned to ${details.branch.description}.`,
        );
      }}
    />
  );

  return { action, dialog };
}
