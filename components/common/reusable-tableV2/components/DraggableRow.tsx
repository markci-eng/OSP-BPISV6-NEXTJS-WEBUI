"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Table, IconButton, Box } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import type { TableSize } from "../types";
import { SIZE_STYLES } from "../types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_ICON_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";

type Props<TData> = {
  row: Row<TData>;
  size: TableSize;
  draggable?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
  onRowClick?: () => void;

  stickyActionsColumn?: boolean;
  actionsColumnId?: string;
  actionsColumnWidth?: string;
};

export function DraggableRow<TData>({
  row,
  size,
  draggable,
  selectable,
  isActive,
  onRowClick,
  stickyActionsColumn,
  actionsColumnId = "_actions",
  actionsColumnWidth = "32px",
}: Props<TData>) {
  const s = SIZE_STYLES[size];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: !draggable,
  });

  const style: React.CSSProperties = draggable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : {};

  const rowIsSelected = row.getIsSelected();

  const rowBg = isActive
    ? BRAND_COLORS.successBg
    : rowIsSelected
      ? "gray.50"
      : "white";

  const stickyBg = isActive
    ? BRAND_COLORS.successBg
    : rowIsSelected
      ? "gray.50"
      : "white";

  return (
    <Table.Row
      ref={setNodeRef}
      style={style}
      onClick={onRowClick}
      bg={rowBg}
      borderBottomWidth="1px"
      borderColor="gray.100"
      _hover={{
        bg: isActive ? BRAND_COLORS.successBg : "gray.50",
      }}
      opacity={isDragging ? 0.75 : 1}
      cursor={onRowClick ? "pointer" : "default"}
      data-selected={rowIsSelected ? "" : undefined}
    >
      {draggable && (
        <Table.Cell px={s.cellPx} py={2} w="32px" minW="32px" color="gray.400">
          <IconButton
            aria-label="Drag row"
            variant="ghost"
            size="xs"
            {...STANDARD_ICON_BUTTON_STYLES.sm}
            cursor="grab"
            _active={{ cursor: "grabbing" }}
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
          >
            <GripVertical size={14} />
          </IconButton>
        </Table.Cell>
      )}

      {selectable && (
        <Table.Cell px={s.cellPx} py={2} w="40px" minW="40px">
          <Checkbox.Root
            checked={rowIsSelected}
            onCheckedChange={(value: any) =>
              row.toggleSelected(
                typeof value === "boolean" ? value : !!value?.checked,
              )
            }
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control onClick={(event) => event.stopPropagation()} />
          </Checkbox.Root>
        </Table.Cell>
      )}

      {row.getVisibleCells().map((cell) => {
        const isActionsCell =
          stickyActionsColumn &&
          !draggable &&
          cell.column.id === actionsColumnId;
        const columnMeta = cell.column.columnDef.meta as
          | { numeric?: boolean; width?: string; minWidth?: string; maxWidth?: string }
          | undefined;
        const isNumericCell = columnMeta?.numeric || typeof cell.getValue() === "number";

        return (
          <Table.Cell
            key={cell.id}
            px={isActionsCell ? 0 : s.cellPx}
            py={2.5}
            fontSize={s.fontSize}
            color="gray.800"
            verticalAlign="middle"
            textAlign={isNumericCell ? "right" : "left"}
            fontVariantNumeric={isNumericCell ? "tabular-nums" : undefined}
            whiteSpace="nowrap"
            maxW={
              isActionsCell
                ? actionsColumnWidth
                : columnMeta?.maxWidth ?? columnMeta?.width ?? "280px"
            }
            overflow={isActionsCell ? "visible" : "hidden"}
            textOverflow={isActionsCell ? "clip" : "ellipsis"}
            w={isActionsCell ? actionsColumnWidth : columnMeta?.width}
            minW={isActionsCell ? actionsColumnWidth : columnMeta?.minWidth}
            position={isActionsCell ? "sticky" : undefined}
            right={isActionsCell ? 0 : undefined}
            zIndex={isActionsCell ? 2 : undefined}
            bg={isActionsCell ? stickyBg : undefined}
            borderLeftWidth={isActionsCell ? "1px" : undefined}
            borderLeftColor={isActionsCell ? "gray.200" : undefined}
            _after={
              isActionsCell
                ? {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: "-1px",
                    bottom: 0,
                    width: "1px",
                    bg: stickyBg,
                    pointerEvents: "none",
                  }
                : undefined
            }
          >
            <Box
              minW={0}
              overflow="hidden"
              textOverflow="ellipsis"
              display={isActionsCell || isNumericCell ? "flex" : undefined}
              justifyContent={
                isActionsCell ? "center" : isNumericCell ? "flex-end" : undefined
              }
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Box>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}
