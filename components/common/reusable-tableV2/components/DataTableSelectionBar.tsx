"use client";

import * as React from "react";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { RowAction } from "../types";

type DataTableSelectionBarProps<TData> = {
  selectedCount: number;
  selectedRows: TData[];
  bulkActions?: RowAction<TData[]>[];
  onClearSelection: () => void;

  /**
   * Desktop: float inside table container.
   * Mobile: fixed at bottom of viewport.
   */
  floating?: boolean;
};

export function DataTableSelectionBar<TData>({
  selectedCount,
  selectedRows,
  bulkActions,
  onClearSelection,
  floating = false,
}: DataTableSelectionBarProps<TData>) {
  if (selectedCount === 0) return null;

  const content = (
    <Flex
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      direction={{ base: "column", sm: "row" }}
      gap={3}
    >
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="700">
          {selectedCount} selected
        </Text>

        <Button
          display={{ base: "inline-flex", sm: "none" }}
          variant="ghost"
          size="xs"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </HStack>

      <HStack gap={2} w={{ base: "full", sm: "auto" }}>
        {bulkActions?.map((action) => (
          <Button
            key={action.id}
            size="sm"
            flex={{ base: 1, sm: "unset" }}
            variant={action.variant === "destructive" ? "outline" : "solid"}
            colorPalette={action.variant === "destructive" ? "red" : "green"}
            onClick={() => {
              action.onClick(selectedRows);
              onClearSelection();
            }}
          >
            {action.icon && <action.icon size={15} />}
            {action.label}
          </Button>
        ))}

        <Button
          display={{ base: "none", sm: "inline-flex" }}
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </HStack>
    </Flex>
  );

  if (!floating) {
    return (
      <Box px={{ base: 4, md: 5 }} py={3} borderBottomWidth="1px" bg="gray.50">
        {content}
      </Box>
    );
  }

  return (
    <Box
      position={{ base: "fixed", md: "absolute" }}
      left={{ base: 0, md: "50%" }}
      right={{ base: 0, md: "auto" }}
      bottom={{ base: 0, md: 4 }}
      transform={{ base: "none", md: "translateX(-50%)" }}
      zIndex={50}
      px={{ base: 0, md: 4 }}
      pb={{ base: "env(safe-area-inset-bottom)", md: 0 }}
      pointerEvents="none"
    >
      <Box pointerEvents="auto">{content}</Box>
    </Box>
  );
}
