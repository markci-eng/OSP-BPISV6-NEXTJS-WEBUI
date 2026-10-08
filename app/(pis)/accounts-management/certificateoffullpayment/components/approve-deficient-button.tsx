"use client";

// Approve — the button under the List of Deficient, bottom right (user,
// 2026-10-07), for the checked accounts that are considered. Opens the
// Approve dialog for its notes / remarks; the page drops the approved rows
// from the list.

import { useMemo, useState, type ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";

import type { BulkAction } from "osp-ui-kit";

import type { CofpForPrinting } from "../data/types";
import {
  CofpApproveDialog,
  type CofpApproveDetails,
} from "./approve-deficient-dialog";

export interface CofpApproveActionOptions {
  onApproved: (rows: CofpForPrinting[], details: CofpApproveDetails) => void;
}

/**
 * The Approve button, one of the list card's `footerActions`, and the dialog
 * it opens — render `dialog` anywhere on the page.
 */
export function useCofpApproveAction({
  onApproved,
}: CofpApproveActionOptions): {
  action: BulkAction<CofpForPrinting>;
  dialog: ReactNode;
} {
  // The checked rows, held from the click.
  const [approving, setApproving] = useState<CofpForPrinting[]>();

  const action = useMemo<BulkAction<CofpForPrinting>>(
    () => ({
      id: "approve-deficient",
      label: "Approve",
      icon: CircleCheck,
      onClick: (rows: CofpForPrinting[]) => {
        if (rows.length > 0) setApproving(rows);
      },
    }),
    [],
  );

  // Mounted only while open, so every opening starts with a blank remark.
  const dialog = approving && (
    <CofpApproveDialog
      open
      onOpenChange={(open) => !open && setApproving(undefined)}
      count={approving.length}
      onApprove={(details) => {
        onApproved(approving, details);
        toast.success(`${approving.length} deficient account(s) approved.`);
      }}
    />
  );

  return { action, dialog };
}
