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

export function DRSPrintModal({ open, onClose, row }: DRSPrintModalProps) {
  const handlePrint = () => {
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
                <DRSPrintLayout drs={row} />
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
