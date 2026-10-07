"use client";

// Add Special COFP — in the page header beside the title under For Printing
// (user, 2026-10-05), above the Selected Region card. Opens the dialog that
// finds the plan holder and picks the branch the certificate goes to.

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { PrimaryMdFlexButton } from "osp-ui-kit";
import { toast } from "sonner";

import {
  CofpAddSpecialDialog,
  type CofpSpecialRequest,
} from "./add-special-cofp-dialog";

export interface CofpAddSpecialButtonProps {
  /** Handed what the dialog picked. Without one, the add is only announced. */
  onAdd?: (request: CofpSpecialRequest) => void;
}

export function CofpAddSpecialButton({ onAdd }: CofpAddSpecialButtonProps) {
  const [open, setOpen] = useState(false);

  const add = (request: CofpSpecialRequest) => {
    onAdd?.(request);
    toast.success(
      `Special COFP added for ${request.planholder.name} (${request.planholder.lpaNo}).`,
    );
  };

  return (
    <>
      {/* Sized to its label on a phone, where it shares the header row with
          the page title — as Print Transmittal is. */}
      <Box w={{ base: "auto", sm: "200px" }} flexShrink={0}>
        <PrimaryMdFlexButton onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add Special COFP
        </PrimaryMdFlexButton>
      </Box>
      <CofpAddSpecialDialog open={open} onOpenChange={setOpen} onAdd={add} />
    </>
  );
}

export default CofpAddSpecialButton;
