"use client";

import {
  Button,
  Dialog,
  Portal,
  Text,
  Flex,
  Box,
  Separator,
} from "@chakra-ui/react";

import {
  Info,
  AlertTriangle,
  CircleX,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

type DialogVariant =
  | "information"
  | "error"
  | "warning"
  | "success"
  | "confirmation";

type MessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: string;
  message?: string;

  onConfirm?: () => void;
  onCancel?: () => void;

  confirmText?: string;
  cancelText?: string;

  isLoading?: boolean;

  showCancel?: boolean;

  variant?: DialogVariant;
};

const variantStyles: Record<
  DialogVariant,
  {
    icon: React.ElementType;
  }
> = {
  information: { icon: Info },
  error: { icon: CircleX },
  warning: { icon: AlertTriangle },
  success: { icon: CheckCircle },
  confirmation: { icon: HelpCircle },
};

export default function MessageDialog({
  open,
  onOpenChange,
  title = "CONFIRMATION",
  message = "Do you want to proceed?",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  showCancel = true,
  variant = "confirmation",
}: MessageDialogProps) {
  const handleClose = () => onOpenChange(false);

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            overflow="hidden"
            bg="gray.100"
            border="1px solid"
            borderColor="gray.300"
            maxW="420px"
          >
            {/* Header */}
            <Box
              px={4}
              py={3}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon size={18} />
              <Text fontWeight="bold" letterSpacing="wide">
                {title}
              </Text>
            </Box>

            <Separator borderColor="gray.300" />

            {/* Body */}
            <Box px={4} py={6}>
              <Text fontSize="sm" color="gray.700">
                {message}
              </Text>
            </Box>

            {/* Footer */}
            <Flex justify="flex-end" px={4} pb={4}>
              {/* 👇 Wrapper for symmetry */}
              <Flex gap={2}>
                {showCancel && variant === "confirmation" && (
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="md"
                    minW="90px"
                    px={4}
                    whiteSpace="nowrap"
                    flexShrink={0}
                    onClick={() => {
                      onCancel?.();
                      handleClose();
                    }}
                  >
                    {cancelText}
                  </Button>
                )}

                <Button
                  size="sm"
                  // variant="outline"
                  borderRadius="md"
                  minW="90px"
                  px={4}
                  whiteSpace="nowrap"
                  flexShrink={0}
                  loading={isLoading}
                  onClick={() => {
                    onConfirm?.();
                    handleClose();
                  }}
                >
                  {confirmText}
                </Button>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}