"use client";

import { useEffect, useState } from "react";
import { Box, Flex, HStack, IconButton, Input, Text } from "@chakra-ui/react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMaximize,
  LuMinimize,
  LuRotateCw,
  LuScanLine,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SIZES,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

export interface PdfToolbarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  zoomFactor: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onRotate: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  disabled?: boolean;
}

const iconButtonStyles = {
  boxSize: { base: "44px", md: STANDARD_SIZES.iconButton.md },
  minW: { base: "44px", md: STANDARD_SIZES.iconButton.md },
  borderRadius: STANDARD_RADIUS.md,
  variant: "ghost" as const,
  color: BRAND_COLORS.neutralText,
  _hover: { bg: BRAND_COLORS.subtleBg },
  _active: { transform: "scale(0.94)" },
  transition: "transform 0.1s ease, background-color 0.15s ease",
  flexShrink: 0,
};

export function PdfToolbar({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  zoomFactor,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onRotate,
  onToggleFullscreen,
  isFullscreen,
  disabled = false,
}: PdfToolbarProps) {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setPageInput(String(currentPage || 1));
  }, [currentPage, editing]);

  const commitPageInput = () => {
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed) && parsed > 0) onJumpToPage(parsed);
    setEditing(false);
  };

  return (
    <Flex
      as="nav"
      aria-label="PDF viewer controls"
      align="center"
      justify={{ base: "flex-start", md: "center" }}
      gap={STANDARD_SPACING.xs}
      px={STANDARD_SPACING.sm}
      py={STANDARD_SPACING.xs}
      bg="white/90"
      backdropFilter="blur(10px)"
      borderTopWidth="1px"
      borderColor={BRAND_COLORS.neutralBorder}
      overflowX={{ base: "auto", md: "visible" }}
      flexShrink={0}
      className="no-print"
      opacity={disabled ? 0.5 : 1}
      pointerEvents={disabled ? "none" : "auto"}
      css={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
    >
      <HStack gap="2px" flexShrink={0}>
        <IconButton aria-label="Zoom out" onClick={onZoomOut} {...iconButtonStyles}>
          <LuZoomOut />
        </IconButton>
        <Text
          fontSize="12px"
          fontWeight="700"
          color={BRAND_COLORS.neutralText}
          minW="42px"
          textAlign="center"
        >
          {Math.round(zoomFactor * 100)}%
        </Text>
        <IconButton aria-label="Zoom in" onClick={onZoomIn} {...iconButtonStyles}>
          <LuZoomIn />
        </IconButton>
      </HStack>

      <Box w="1px" h="24px" bg={BRAND_COLORS.neutralBorder} flexShrink={0} />

      <IconButton aria-label="Fit to width" onClick={onResetZoom} {...iconButtonStyles}>
        <LuScanLine />
      </IconButton>

      <Box w="1px" h="24px" bg={BRAND_COLORS.neutralBorder} flexShrink={0} />

      <HStack gap="4px" flexShrink={0}>
        <IconButton
          aria-label="Previous page"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          {...iconButtonStyles}
        >
          <LuChevronLeft />
        </IconButton>
        <HStack gap="4px" px="2px" flexShrink={0}>
          <Input
            aria-label="Current page"
            value={pageInput}
            onFocus={() => setEditing(true)}
            onChange={(e) =>
              setPageInput(e.target.value.replace(/[^0-9]/g, ""))
            }
            onBlur={commitPageInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            w="40px"
            h="32px"
            px="2px"
            textAlign="center"
            fontSize="13px"
            borderRadius={STANDARD_RADIUS.sm}
          />
          <Text fontSize="13px" color={BRAND_COLORS.grey} whiteSpace="nowrap">
            of {totalPages || 1}
          </Text>
        </HStack>
        <IconButton
          aria-label="Next page"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          {...iconButtonStyles}
        >
          <LuChevronRight />
        </IconButton>
      </HStack>

      <Box w="1px" h="24px" bg={BRAND_COLORS.neutralBorder} flexShrink={0} />

      <IconButton aria-label="Rotate page" onClick={onRotate} {...iconButtonStyles}>
        <LuRotateCw />
      </IconButton>

      <IconButton
        aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
        onClick={onToggleFullscreen}
        display={{ base: "none", md: "inline-flex" }}
        {...iconButtonStyles}
      >
        {isFullscreen ? <LuMinimize /> : <LuMaximize />}
      </IconButton>
    </Flex>
  );
}
