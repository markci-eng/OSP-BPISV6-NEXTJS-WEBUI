"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { Columns3, Search, X } from "lucide-react";
import { H4 } from "st-peter-ui";
import { DataTableFeatures, HeaderButton } from "../types";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_ICON_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SIZES,
} from "@/lib/theme/standard-design-tokens";

type DataTableToolbarProps<TData> = {
  table: TanStackTable<TData>;

  title?: React.ReactNode;
  description?: React.ReactNode;
  headerContent?: React.ReactNode;

  features: Required<DataTableFeatures>;

  globalFilter: string;
  setGlobalFilter: (value: string) => void;

  headerButton?: HeaderButton;
  headerActions?: React.ReactNode;
};

export function DataTableToolbar<TData>({
  table,
  title,
  description,
  headerContent,
  features,
  globalFilter,
  setGlobalFilter,
  headerButton,
  headerActions,
}: DataTableToolbarProps<TData>) {
  return (
    <Box p={{ base: 4, md: 5 }} borderBottomWidth="1px" bg="white">
      <Grid
        templateColumns={{
          base: "1fr",
          lg: headerContent
            ? "minmax(280px, 340px) minmax(0, 1fr)"
            : "minmax(220px, 1fr) minmax(0, auto)",
        }}
        alignItems="center"
        gap={4}
      >
        <Box minW={0} w="full">
          {title || description ? (
            <>
              {title && (typeof title === "string" ? <H4>{title}</H4> : title)}

              {description &&
                (typeof description === "string" ? (
                  <Text fontSize="sm" color="gray.600" mt={0.5}>
                    {description}
                  </Text>
                ) : (
                  description
                ))}

              {headerContent && <Box mt={3}>{headerContent}</Box>}
            </>
          ) : (
            headerContent
          )}
        </Box>

        <Flex
          gap={2}
          wrap="nowrap"
          align={{ base: "stretch", md: "center" }}
          justify={{ base: "stretch", lg: "flex-end" }}
          direction={{ base: "column", md: "row" }}
          w="full"
          minW={0}
        >
          {features.search && (
            <Box
              position="relative"
              flex={{ base: "none", md: "1 1 240px" }}
              minW={{ base: "full", md: "240px" }}
              maxW={{ base: "full", md: "320px" }}
              w="full"
            >
              <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
                color="gray.500"
                display="flex"
                alignItems="center"
                zIndex={1}
              >
                <Search size={16} />
              </Box>

              <Input
                placeholder="Search records..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                ps="34px"
                pe="34px"
                h={STANDARD_SIZES.searchInput.height}
                w="full"
                fontSize="sm"
                bg="white"
                borderRadius={STANDARD_RADIUS.md}
              />

              {globalFilter && (
                <IconButton
                  aria-label="Clear search"
                  variant="ghost"
                  size="xs"
                  {...STANDARD_ICON_BUTTON_STYLES.sm}
                  position="absolute"
                  right="6px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => setGlobalFilter("")}
                >
                  <X size={14} />
                </IconButton>
              )}
            </Box>
          )}

          {features.columnToggle && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  {...STANDARD_BUTTON_STYLES.md}
                  flexShrink={0}
                  display={{ base: "none", md: "inline-flex" }}
                >
                  <Columns3 size={16} style={{ marginRight: 6 }} />
                  Columns
                </Button>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="208px" zIndex="popover">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <Menu.Item
                          key={column.id}
                          value={column.id}
                          closeOnSelect={false}
                          onClick={() =>
                            column.toggleVisibility(!column.getIsVisible())
                          }
                        >
                          <HStack justify="space-between" w="full">
                            <Text textTransform="capitalize" fontSize="sm">
                              {column.id
                                .replace(/([A-Z])/g, " $1")
                                .replace(/_/g, " ")}
                            </Text>

                            <Checkbox.Root checked={column.getIsVisible()}>
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                            </Checkbox.Root>
                          </HStack>
                        </Menu.Item>
                      ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}

          {headerButton && (
            <Button
              variant="solid"
              size="sm"
              {...STANDARD_BUTTON_STYLES.md}
              flexShrink={0}
              w={{ base: "full", md: "auto" }}
              onClick={headerButton.onClick}
            >
              {headerButton.icon && (
                <headerButton.icon size={16} style={{ marginRight: 6 }} />
              )}
              {headerButton.label}
            </Button>
          )}

          {headerActions && (
            <Box
              flexShrink={0}
              w={{ base: "full", md: "150px" }}
              minW={{ md: "150px" }}
            >
              {headerActions}
            </Box>
          )}
        </Flex>
      </Grid>
    </Box>
  );
}
