"use client";

// The service record as an OVERLAY — full-screen on a phone, a side panel from
// `md` up. Everything inside it is {@link ServiceRecordView}; this file is only
// the drawer around it.
//
// Used below `xl`, where the For Process page is a single stacked column and a
// record has nowhere to go but on top of it. From `xl` the page shows the same
// component in place instead, with the plan holder beside it — see the swap on
// the For Process page.
//
// A copy of `PlanholderClaimRequestDrawer` in every structural respect, because
// it is the same thing one level down and the two should behave identically.

import { useEffect } from "react";
import { Drawer, Portal } from "@chakra-ui/react";
import type { ServiceBilling, ServiceRecord } from "../service-payables-data";
import { ServiceRecordView } from "./ServiceRecordView";

export interface ServiceRecordDrawerProps {
  /** The service being worked. Absent keeps the drawer closed. */
  service?: ServiceRecord | null;
  billing?: ServiceBilling;
  /** The chapels the picker inside offers. */
  billings: ServiceBilling[];
  onSelectService: (serviceId: string) => void;
  onChangeChapel: (billingCode: string) => void;
  open: boolean;
  onClose: () => void;
  /**
   * What the record's one commit does — handed to the view inside, where it is
   * documented. Passed through here so the narrow presentation of a queue's
   * record offers the same act as the wide one; a drawer that still said
   * Terminate where the page said Verify would be the same screen disagreeing
   * with itself at 1279 pixels.
   */
  action?: "terminate" | "verify" | "approve" | "endorse";
  /**
   * Which identifier the chapel picker inside reads its billings by — passed
   * through for the same reason `action` is: the narrow presentation of a
   * queue's record must name a billing the way the wide one does.
   */
  lead?: "code" | "number";
}

export function ServiceRecordDrawer({
  service,
  billing,
  billings,
  onSelectService,
  onChangeChapel,
  open,
  onClose,
  action,
  lead,
}: ServiceRecordDrawerProps) {
  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` /
  // `data-inert` stuck on <body> after a modal closes, freezing the page.
  // The query is what confirms nothing else is still open — the create-billing
  // dialog can be raised from the page underneath this one.
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
            {/* No `Drawer.Body`: the view is a header bar and a scrolling body,
                and they go straight into this flex column so the bar stays put
                while the body moves under it. The bar also renders this
                drawer's `Drawer.Title`, which is what names it. */}
            {service && billing && (
              <ServiceRecordView
                service={service}
                billing={billing}
                billings={billings}
                onSelectService={onSelectService}
                onChangeChapel={onChangeChapel}
                onBack={onClose}
                action={action}
                lead={lead}
              />
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default ServiceRecordDrawer;
