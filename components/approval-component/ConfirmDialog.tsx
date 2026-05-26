"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, Dialog, HStack, Portal, Text } from "@chakra-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "primary" | "destructive";
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open && !loading) {
          onCancel();
        }
      }}
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" rounded="2xl">
            <Dialog.Header>
              <Dialog.Title asChild>
                <Text fontWeight="medium" fontSize="md" color="fg">
                  {title}
                </Text>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text fontSize="sm" color="fg.muted">
                {description}
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>

                <Button
                  onClick={onConfirm}
                  disabled={loading}
                  colorPalette={variant === "destructive" ? "red" : "blue"}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
