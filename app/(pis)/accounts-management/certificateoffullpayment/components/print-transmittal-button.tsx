"use client";

// Print Transmittal — in the page header beside the title, for the memo
// picked in the rail (user, 2026-10-05). Opens the whole memo's transmittal in
// a new tab, the way the For Printing list's Print opens the certificates. The
// List of Printed's checkboxes are for Cancel COFP only, not this.

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Printer } from "lucide-react";
import { PrimaryMdFlexButton } from "osp-ui-kit";
import { toast } from "sonner";

import { buildTransmittalPdf } from "../data/transmittal-pdf";
import type { CofpMemo } from "../data/types";

export interface CofpPrintTransmittalButtonProps {
  memo?: CofpMemo;
  /** The memo's branch as the transmittal names it. */
  branchName: string;
}

export function CofpPrintTransmittalButton({
  memo,
  branchName,
}: CofpPrintTransmittalButtonProps) {
  const [building, setBuilding] = useState(false);

  // The tab is opened before the PDF is built, while the click still counts
  // as the user's — see the same note on the For Printing list's Print.
  const print = async () => {
    if (!memo) return;
    const tab = window.open("", "_blank");
    if (!tab) {
      toast.error("The new tab was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    tab.document.title = `Transmittal ${memo.memoNo}`;
    tab.document.body.textContent = "Preparing transmittal…";

    setBuilding(true);
    try {
      tab.location.href = await buildTransmittalPdf(memo, branchName);
    } catch {
      tab.close();
      toast.error("The transmittal could not be prepared. Try again.");
    } finally {
      setBuilding(false);
    }
  };

  return (
    // Sized to its label on a phone, where it shares the header row with the
    // page title.
    <Box w={{ base: "auto", sm: "200px" }} flexShrink={0}>
      <PrimaryMdFlexButton
        disabled={!memo || building}
        onClick={print}
      >
        <Printer size={16} />
        {building ? "Preparing…" : "Print Transmittal"}
      </PrimaryMdFlexButton>
    </Box>
  );
}

export default CofpPrintTransmittalButton;
