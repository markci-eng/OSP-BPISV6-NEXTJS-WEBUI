"use client";

import { useEffect } from "react";
import { Drawer, Portal } from "@chakra-ui/react";
import type { ClaimRequest } from "../../claims-data";
import { PlanholderClaimDetail } from "./PlanholderClaimDetail";

interface PlanholderClaimRequestDrawerProps {
  /** The claim being viewed. `null`/`undefined` keeps the drawer closed. */
  claim?: ClaimRequest | null;
  open: boolean;
  onClose: () => void;
}

/**
 * The claim request view as an OVERLAY — full-screen on mobile, a side panel
 * from `md` up. Everything inside it is {@link PlanholderClaimDetail}; this file
 * is only the drawer around it.
 *
 * Used below `xl`, where the profile is a single stacked column and a claim has
 * nowhere to go but on top of it. From `xl` the page shows the same component
 * in its main column instead, with the plan holder beside it — see the profile
 * page.
 */
export function PlanholderClaimRequestDrawer({
  claim,
  open,
  onClose,
}: PlanholderClaimRequestDrawerProps) {
  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` /
  // `data-inert` stuck on <body> after a modal closes, freezing the page.
  // Restore it. Only this drawer's own state is watched — the sheets opened
  // from inside the detail close themselves back into it, and the query below
  // is what confirms nothing is still open.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size={{ base: "full", md: "md" }}
    >
      <Portal>
        <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            {/* No `Drawer.Body`: the detail is a header bar and a scrolling
                body, and they go straight into this flex column so the bar
                stays put while the body moves under it. The bar also renders
                this drawer's `Drawer.Title`, which is what names it. */}
            {claim ? (
              <PlanholderClaimDetail claim={claim} onBack={onClose} />
            ) : null}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default PlanholderClaimRequestDrawer;
