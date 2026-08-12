"use client";

import * as React from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
} from "@chakra-ui/react";
import { Printer } from "lucide-react";
import { DRSPrintLayout } from "./DRSPrintLayout";

type DRSPrintModalProps = {
  open: boolean;
  onClose: () => void;
  row: any;
};

const PRINT_ROOT_ID = "drs-print-root";
const PRINT_STYLE_ID = "drs-print-style";

/**
 * Injected only while printing, so it never affects printing on other pages.
 * The layout is cloned to a direct child of <body> to escape the dialog's
 * overflow/positioning, and everything else is hidden.
 */
const PRINT_CSS = `
@media print {
  @page {
    size: portrait;
    margin: 0;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  body > *:not(#${PRINT_ROOT_ID}) {
    display: none !important;
  }

  #${PRINT_ROOT_ID} {
    display: block !important;
    visibility: visible !important;
  }

  #${PRINT_ROOT_ID} * {
    visibility: visible !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #${PRINT_ROOT_ID} .print-area {
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
  }
}
`;

export function DRSPrintModal({ open, onClose, row }: DRSPrintModalProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const source = printRef.current;
    if (!source) return;

    // Drop leftovers in case a previous print never fired "afterprint".
    document.getElementById(PRINT_ROOT_ID)?.remove();
    document.getElementById(PRINT_STYLE_ID)?.remove();

    const host = document.createElement("div");
    host.id = PRINT_ROOT_ID;
    host.style.display = "none";
    host.appendChild(source.cloneNode(true));

    const style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    style.textContent = PRINT_CSS;

    document.body.append(host, style);

    const cleanup = () => {
      window.removeEventListener("afterprint", cleanup);
      host.remove();
      style.remove();
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size={{ base: "full", md: "cover" }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner p={{ base: 0, md: undefined }}>
          <Dialog.Content
            maxW={{ base: "100dvw", md: "1100px" }}
            borderRadius={{ base: 0, md: undefined }}
            mx="auto"
          >
            <Dialog.Header borderBottomWidth="1px" className="no-print">
              <Flex w="full" align="center" justify="space-between">
                <Dialog.Title>DRS Print Preview</Dialog.Title>

                <Flex align="center" gap={2}>
                  <Button size="sm" onClick={handlePrint}>
                    <Printer size={16} />
                    Print
                  </Button>

                  <CloseButton size="md" onClick={onClose} />
                </Flex>
              </Flex>
            </Dialog.Header>

            <Dialog.Body p={0}>
              <Box
                maxH="calc(100vh - 120px)"
                overflow="auto"
                bg="gray.100"
                p={{ base: 3, md: 6 }}
              >
                <div ref={printRef}>
                  <DRSPrintLayout drs={row} />
                </div>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
