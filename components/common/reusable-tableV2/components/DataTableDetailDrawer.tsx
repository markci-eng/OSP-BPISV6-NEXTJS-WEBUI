"use client";

import * as React from "react";
import { Box, Separator, Text } from "@chakra-ui/react";
import { BottomQuickActions } from "@/claude components/drawer/bottom-quick-actions";
import type { QuickAction } from "@/claude components/drawer/bottom-quick-actions";
import { RowItem } from "@/claude components/info-card/row-item";
import { formatLabel } from "../utils";

type DataTableDetailDrawerProps<TData> = {
  title?: React.ReactNode;
  selectedRow: TData | null;
  renderDetail?: (row: TData) => React.ReactNode;
  actions?: QuickAction[];
  onClose: () => void;
};

const isNumericField = (value: unknown): boolean =>
  typeof value === "number";

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
      : (() => {
          const entries = Object.entries(selectedRow as Record<string, any>);
          const textFields = entries.filter(([, v]) => !isNumericField(v));
          const numericFields = entries.filter(([, v]) => isNumericField(v));

          return (
            <Box>
              {textFields.length > 0 && (
                <Box mb={numericFields.length > 0 ? 3 : 0}>
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={1}
                  >
                    Information
                  </Text>
                  {textFields.map(([key, value]) => (
                    <RowItem key={key} label={formatLabel(key)} value={value} />
                  ))}
                </Box>
              )}

              {numericFields.length > 0 && (
                <Box>
                  {textFields.length > 0 && <Separator mb={3} opacity={0.25} />}
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={1}
                  >
                    Amounts
                  </Text>
                  {numericFields.map(([key, value]) => (
                    <RowItem key={key} label={formatLabel(key)} value={value} />
                  ))}
                </Box>
              )}
            </Box>
          );
        })()
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
