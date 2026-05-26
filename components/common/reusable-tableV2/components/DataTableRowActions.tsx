"use client";

import * as React from "react";
import { HStack, IconButton, Menu, Portal, Text } from "@chakra-ui/react";
import { MoreHorizontal } from "lucide-react";
import type { RowAction } from "../types";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_ICON_BUTTON_STYLES } from "@/lib/theme/standard-design-tokens";

type DataTableRowActionsProps<TData> = {
  row: TData;
  actions: RowAction<TData>[];
};

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  const visibleActions = actions.filter(
    (action) => !action.hidden || !action.hidden(row),
  );

  if (visibleActions.length === 0) return null;

  if (visibleActions.length === 1) {
    const action = visibleActions[0];
    const Icon = action.icon;

    return (
      <IconButton
        aria-label={action.label}
        variant="ghost"
        size="sm"
        {...STANDARD_ICON_BUTTON_STYLES.sm}
        color={
          action.variant === "destructive"
            ? BRAND_COLORS.destructiveRed
            : BRAND_COLORS.primaryGreen
        }
        _hover={{
          bg:
            action.variant === "destructive"
              ? BRAND_COLORS.errorBg
              : BRAND_COLORS.successBg,
        }}
        disabled={action.disabled?.(row)}
        onClick={(event) => {
          event.stopPropagation();
          action.onClick(row);
        }}
      >
        {Icon ? <Icon size={16} /> : <MoreHorizontal size={16} />}
      </IconButton>
    );
  }

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <IconButton
          aria-label="Row actions"
          variant="ghost"
          size="sm"
          {...STANDARD_ICON_BUTTON_STYLES.sm}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </IconButton>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="176px" zIndex="popover">
            {visibleActions.map((action, index) => (
              <React.Fragment key={action.id}>
                {action.separator && index > 0 && <Menu.Separator />}

                <Menu.Item
                  value={action.id}
                  disabled={action.disabled?.(row)}
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onClick(row);
                  }}
                >
                  <HStack gap={2}>
                    {action.icon && <action.icon size={16} />}

                    <Text
                      color={
                        action.variant === "destructive"
                          ? BRAND_COLORS.destructiveRed
                          : BRAND_COLORS.primaryGreen
                      }
                    >
                      {action.label}
                    </Text>
                  </HStack>
                </Menu.Item>
              </React.Fragment>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
