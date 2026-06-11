"use client";

import * as React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BottomQuickActions } from "@/claude components/drawer/bottom-quick-actions";
import type { QuickAction } from "@/claude components/drawer/bottom-quick-actions";

type DataTableDetailDrawerProps<TData> = {
  title?: React.ReactNode;
  selectedRow: TData | null;
  renderDetail?: (row: TData) => React.ReactNode;
  actions?: QuickAction[];
  onClose: () => void;
};

export function DataTableDetailDrawer<TData>({
  title,
  selectedRow,
  renderDetail,
  actions = [],
  onClose,
}: DataTableDetailDrawerProps<TData>) {
  const headerSlot = selectedRow
    ? renderDetail
      ? renderDetail(selectedRow)
      : (
          <Box>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Record Information
            </Text>

            <Box
              rounded="md"
              borderWidth="1px"
              borderColor="border.muted"
              bg="bg"
              p={{ base: 3, md: 4 }}
              boxShadow="sm"
              mt={2}
            >
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
                gap={4}
              >
                {Object.entries(selectedRow as Record<string, any>).map(
                  ([key, value]) => (
                    <Box key={key}>
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="fg.muted"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={1}
                      >
                        {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                      </Text>
                      <Text fontSize="sm" color="fg" fontWeight="medium">
                        {String(value ?? "-")}
                      </Text>
                    </Box>
                  ),
                )}
              </Box>
            </Box>
          </Box>
        )
    : undefined;

  return (
    <BottomQuickActions
      open={!!selectedRow}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={typeof title === "string" ? title : "Details"}
      headerSlot={headerSlot}
      actions={actions}
    />
  );
}
