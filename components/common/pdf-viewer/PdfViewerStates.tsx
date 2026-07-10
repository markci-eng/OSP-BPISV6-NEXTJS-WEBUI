"use client";

import { Box, Button, VStack, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuFileX,
  LuFileWarning,
  LuLock,
  LuLoaderCircle,
  LuRefreshCw,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS, STANDARD_SPACING } from "@/lib/theme/standard-design-tokens";
import type { PdfStateVariant } from "./types";

const VARIANT_CONFIG: Record<
  PdfStateVariant,
  { icon: IconType; title: string; description: string; tone: "neutral" | "danger" }
> = {
  loading: {
    icon: LuLoaderCircle,
    title: "Loading document...",
    description: "Please wait while we prepare your statement.",
    tone: "neutral",
  },
  error: {
    icon: LuFileWarning,
    title: "Unable to load document",
    description:
      "Something went wrong while opening this PDF. Check your connection and try again.",
    tone: "danger",
  },
  empty: {
    icon: LuFileX,
    title: "No statement found",
    description: "We couldn't find a Statement of Account for this plan yet.",
    tone: "neutral",
  },
  "permission-denied": {
    icon: LuLock,
    title: "Access restricted",
    description:
      "You don't have permission to view this document. Contact your branch administrator.",
    tone: "danger",
  },
};

export interface PdfViewerStateProps {
  variant: PdfStateVariant;
  onRetry?: () => void;
}

export function PdfViewerState({ variant, onRetry }: PdfViewerStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  const isSpinning = variant === "loading";
  const isDanger = config.tone === "danger";

  return (
    <VStack
      role="status"
      aria-live="polite"
      justify="center"
      align="center"
      gap={STANDARD_SPACING.sm}
      minH="360px"
      w="full"
      py={STANDARD_SPACING.xl}
      px={STANDARD_SPACING.sm}
      textAlign="center"
    >
      <Box
        boxSize="64px"
        borderRadius={STANDARD_RADIUS.full}
        bg={isDanger ? BRAND_COLORS.errorBg : BRAND_COLORS.subtleBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Box
          as={Icon}
          boxSize="28px"
          color={isDanger ? BRAND_COLORS.errorRed : BRAND_COLORS.grey}
          css={
            isSpinning
              ? {
                  "@keyframes pdfViewerSpin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                  animation: "pdfViewerSpin 1s linear infinite",
                }
              : undefined
          }
        />
      </Box>
      <Text as="h2" fontWeight="700" fontSize="16px" color={BRAND_COLORS.neutralText}>
        {config.title}
      </Text>
      <Text fontSize="13px" color={BRAND_COLORS.grey} maxW="320px">
        {config.description}
      </Text>
      {onRetry && !isSpinning && (
        <Button
          onClick={onRetry}
          size="sm"
          mt={STANDARD_SPACING.xs}
          borderRadius={STANDARD_RADIUS.md}
        >
          <LuRefreshCw size={14} />
          Retry
        </Button>
      )}
    </VStack>
  );
}
