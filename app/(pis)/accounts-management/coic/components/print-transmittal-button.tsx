"use client";

// Print Transmittal — in the page header beside the title under Printed, for
// the memo picked in the rail. Cloned from COFP's (user, 2026-10-06).

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Printer } from "lucide-react";
import { PrimaryMdFlexButton } from "osp-ui-kit";
import { toast } from "sonner";

import { buildCoicTransmittalPdf } from "../data/transmittal-pdf";
import type { CoicMemo } from "../data/types";

export interface CoicPrintTransmittalButtonProps {
  memo?: CoicMemo;
  /** The memo's branch as the transmittal names it. */
  branchName: string;
}

export function CoicPrintTransmittalButton({
  memo,
  branchName,
}: CoicPrintTransmittalButtonProps) {
  const [building, setBuilding] = useState(false);

  // The tab is opened before the PDF is built, while the click still counts
  // as the user's.
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
      tab.location.href = await buildCoicTransmittalPdf(memo, branchName);
    } catch {
      tab.close();
      toast.error("The transmittal could not be prepared. Try again.");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Box w={{ base: "auto", sm: "200px" }} flexShrink={0}>
      <PrimaryMdFlexButton disabled={!memo || building} onClick={print}>
        <Printer size={16} />
        {building ? "Preparing…" : "Print Transmittal"}
      </PrimaryMdFlexButton>
    </Box>
  );
}

export default CoicPrintTransmittalButton;
