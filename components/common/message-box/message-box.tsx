"use client";

import {
  Button,
  Dialog,
  Portal,
  Text,
  Flex,
  Box,
  VStack,
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

const variantConfig: Record<
  DialogVariant,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    colorPalette: string;
  }
> = {
  information: {
    icon: Info,
    iconBg: "blue.subtle",
    iconColor: "blue.600",
    colorPalette: "blue",
  },
  error: {
    icon: CircleX,
    iconBg: "red.subtle",
    iconColor: "red.600",
    colorPalette: "red",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "orange.subtle",
    iconColor: "orange.600",
    colorPalette: "orange",
  },
  success: {
    icon: CheckCircle,
    iconBg: "green.subtle",
    iconColor: "green.600",
    colorPalette: "green",
  },
  confirmation: {
    icon: HelpCircle,
    iconBg: "blue.subtle",
    iconColor: "blue.600",
    colorPalette: "blue",
  },
};

export default function MessageDialog({
  open,
  onOpenChange,
  title = "Confirmation",
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

  const config = variantConfig[variant];
  const Icon = config.icon;
  const showCancelButton = showCancel && variant === "confirmation";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="sm"
      placement="center"
      motionPreset="scale"
    >
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="2xl"
            overflow="hidden"
            maxW="360px"
            boxShadow="xl"
          >
            {/* Icon + Title + Message */}
            <VStack gap={3} pt={8} pb={6} px={6} textAlign="center">
              <Box
                p={3}
                borderRadius="xl"
                bg={config.iconBg}
                color={config.iconColor}
                display="inline-flex"
              >
                <Icon size={26} strokeWidth={1.75} />
              </Box>

              <VStack gap={1}>
                <Text fontWeight="semibold" fontSize="md" color="fg">
                  {title}
                </Text>
                <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                  {message}
                </Text>
              </VStack>
            </VStack>

            {/* Actions */}
            <Flex
              px={6}
              pb={6}
              gap={3}
              direction={showCancelButton ? "row" : "column"}
            >
              {showCancelButton && (
                <Button
                  variant="outline"
                  flex={1}
                  borderRadius="lg"
                  size={"md"}
                  onClick={() => {
                    onCancel?.();
                    handleClose();
                  }}
                >
                  {cancelText}
                </Button>
              )}

              <Button
                flex={1}
                size={"md"} 
                borderRadius="lg"
                colorPalette={config.colorPalette}
                loading={isLoading}
                onClick={() => {
                  onConfirm?.();
                  handleClose();
                }}
              >
                {confirmText}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
