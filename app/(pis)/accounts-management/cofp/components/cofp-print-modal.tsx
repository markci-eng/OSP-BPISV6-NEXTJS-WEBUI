"use client";

import { Box, Button, CloseButton, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { Printer } from "lucide-react";

import type { CofpRequest } from "../data/types";
import { CofpCertificate } from "./cofp-certificate";

/**
 * Print preview for the selected certificates. One certificate per page;
 * `print-area` / `no-print` are the app-wide classes from globals.css, so
 * printing drops the dialog chrome and keeps only the certificates.
 */
export function CofpPrintModal({
  open,
  onClose,
  requests,
}: {
  open: boolean;
  onClose: () => void;
  requests: CofpRequest[];
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size={{ base: "full", md: "cover" }}
      placement="center"
      scrollBehavior="inside"
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
              <Flex w="full" align="center" justify="space-between" gap={3}>
                <Box minW={0}>
                  <Dialog.Title fontSize="sm">
                    Certificate of Full Payment
                  </Dialog.Title>
                  <Text fontSize="xs" color="gray.500" mt="2px">
                    {requests.length} certificate
                    {requests.length === 1 ? "" : "s"} ready to print
                  </Text>
                </Box>

                <Flex align="center" gap={2}>
                  <Button size="sm" onClick={() => window.print()}>
                    <Printer size={16} />
                    Print
                  </Button>
                  <CloseButton size="sm" onClick={onClose} />
                </Flex>
              </Flex>
            </Dialog.Header>

            <Dialog.Body p={0}>
              <Box
                className="print-area"
                bg="gray.100"
                p={{ base: 3, md: 6 }}
                display="flex"
                flexDirection="column"
                gap={6}
              >
                {requests.map((request) => (
                  <Box
                    key={request.id}
                    className="cofp-sheet"
                    boxShadow="md"
                    bg="white"
                  >
                    <CofpCertificate request={request} />
                  </Box>
                ))}
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default CofpPrintModal;
