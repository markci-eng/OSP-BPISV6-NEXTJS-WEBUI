"use client";

// Encode Old COFP — in the page header beside Print Transmittal under Printed
// (user, 2026-10-07). Opens the dialog that records a certificate issued
// before this screen.

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { FilePlus } from "lucide-react";
import { SecondaryMdFlexButton } from "osp-ui-kit";
import { toast } from "sonner";

import { CofpEncodeOldDialog, type CofpOldCofp } from "./encode-old-cofp-dialog";

export interface CofpEncodeOldButtonProps {
  /** The branch picked in the rail — said in the dialog's subtitle. */
  branchName?: string;
  /** The rail's branch — what the dialog's Branch Code starts on. */
  branchCode?: string;
  /** Handed what was encoded. Without one, the encode is only announced. */
  onEncode?: (cofp: CofpOldCofp) => void;
}

export function CofpEncodeOldButton({
  branchName,
  branchCode,
  onEncode,
}: CofpEncodeOldButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* The secondary of the pair, so Print Transmittal stays the header's
          main action. Sized as it is. */}
      <Box w={{ base: "auto", sm: "200px" }} flexShrink={0}>
        <SecondaryMdFlexButton onClick={() => setOpen(true)}>
          <FilePlus size={16} />
          Encode Old COFP
        </SecondaryMdFlexButton>
      </Box>
      {/* Mounted only while open, so every opening starts blank. */}
      {open && (
        <CofpEncodeOldDialog
          open
          onOpenChange={setOpen}
          branchName={branchName}
          defaultBranchCode={branchCode}
          onEncode={(cofp) => {
            onEncode?.(cofp);
            toast.success(`Old COFP ${cofp.cofpNo} encoded for ${cofp.lpaNo}.`);
          }}
        />
      )}
    </>
  );
}

export default CofpEncodeOldButton;
