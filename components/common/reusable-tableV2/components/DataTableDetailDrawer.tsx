"use client";

import * as React from "react";
import { Box, Text } from "@chakra-ui/react";
import Drawer from "@/components/drawers/Drawer";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

type DataTableDetailDrawerProps<TData> = {
  title?: React.ReactNode;
  selectedRow: TData | null;
  renderDetail?: (row: TData) => React.ReactNode;
  onClose: () => void;
};

export function DataTableDetailDrawer<TData>({
  title,
  selectedRow,
  renderDetail,
  onClose,
}: DataTableDetailDrawerProps<TData>) {
  return (
    <Drawer
      title={typeof title === "string" ? title : "Details"}
      open={!!selectedRow}
      onOpenChange={(open: any) => {
        if (!open) {
          onClose();
        }
      }}
    >
      {selectedRow && renderDetail ? (
        <Box p={{ base: 3, md: 4 }}>{renderDetail(selectedRow)}</Box>
      ) : selectedRow ? (
        <Box p={{ base: 3, md: 4 }}>
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
            borderRadius={STANDARD_RADIUS.md}
            borderWidth="1px"
            borderColor="border.muted"
            bg="bg"
            p={{ base: 3, md: 4 }}
            boxShadow={STANDARD_SHADOWS.level2}
            mt={2}
          >
            <Box
              display="grid"
              gridTemplateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
              }}
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
      ) : null}
    </Drawer>
  );
}
