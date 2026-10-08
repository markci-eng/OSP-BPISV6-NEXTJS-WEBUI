"use client";

// The "− 100% +" control over the Valid ID and Document Viewer cards. Steps a
// quarter at a time between `min` and `max`; the percentage between the two
// buttons resets to 100% when clicked.

import type { ReactNode } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "lucide-react";

import { BRAND_COLORS } from "@/lib/theme/brand-colors";

const STEP = 0.25;

export interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  min?: number;
  max?: number;
  /** Names what is being zoomed, for the buttons' labels. */
  label: string;
}

export function ZoomControl({
  zoom,
  onZoomChange,
  min = 0.5,
  max = 2,
  label,
}: ZoomControlProps) {
  const step = (delta: number) =>
    onZoomChange(Math.min(max, Math.max(min, zoom + delta * STEP)));

  return (
    <Flex
      role="group"
      aria-label={`${label} zoom`}
      align="center"
      gap={0.5}
      p="1px"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="md"
      bg="bg"
      flexShrink={0}
    >
      <ZoomButton
        label={`Zoom out ${label}`}
        disabled={zoom <= min}
        onClick={() => step(-1)}
      >
        <ZoomOut size={14} />
      </ZoomButton>
      <Box
        as="button"
        onClick={() => onZoomChange(1)}
        title="Reset to 100%"
        minW="42px"
        textAlign="center"
        cursor="pointer"
      >
        <Text
          fontSize="xs"
          fontWeight="600"
          color="gray.700"
          fontVariantNumeric="tabular-nums"
        >
          {Math.round(zoom * 100)}%
        </Text>
      </Box>
      <ZoomButton
        label={`Zoom in ${label}`}
        disabled={zoom >= max}
        onClick={() => step(1)}
      >
        <ZoomIn size={14} />
      </ZoomButton>
    </Flex>
  );
}

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      size="2xs"
      variant="ghost"
      color="gray.500"
      disabled={disabled}
      onClick={onClick}
      _hover={{ color: BRAND_COLORS.primaryGreen, bg: "green.50" }}
    >
      {children}
    </IconButton>
  );
}

export default ZoomControl;
