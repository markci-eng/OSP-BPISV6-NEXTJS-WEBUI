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
import { DataTableFeatures, HeaderButton } from "../types";

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

  top?: string | number;
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
  top = "var(--sticky-header-h, 0px)",
}: DataTableToolbarProps<TData>) {
  const hasRightContent =
    features.search ||
    features.columnToggle ||
    !!headerButton ||
    !!headerActions;

  return (
    <Box
      position={hasRightContent ? "sticky" : "relative"}
      top={hasRightContent ? top : undefined}
      zIndex={hasRightContent ? 3 : undefined}
      px={3}
      py={2}
      borderBottomWidth="1px"
      bg="white"
    >
      <Grid
        templateColumns={{
          base: "1fr",
          lg:
            headerContent && hasRightContent
              ? "minmax(200px, 280px) minmax(0, 1fr)"
              : headerContent
                ? "1fr"
                : "minmax(160px, 1fr) minmax(0, auto)",
        }}
        alignItems="center"
        gap={2}
      >
        <Box minW={0} w="full">
          {headerContent ? (
            headerContent
          ) : (
            <>
              {title && (
                typeof title === "string" ? (
                  <Text fontWeight="600" fontSize="sm" color="gray.800" lineClamp={1}>
                    {title}
                  </Text>
                ) : title
              )}

              {description &&
                (typeof description === "string" ? (
                  <Text fontSize="xs" color="gray.500">
                    {description}
                  </Text>
                ) : (
                  description
                ))}
            </>
          )}
        </Box>

        {hasRightContent && (
        <Flex
          gap={1.5}
          wrap="nowrap"
          align="center"
          justify={{ base: "stretch", lg: "flex-end" }}
          direction={{ base: "column", md: "row" }}
          w="full"
          minW={0}
        >
          {features.search && (
            <Box
              position="relative"
              flex={{ base: "none", md: "1 1 180px" }}
              minW={{ base: "full", md: "160px" }}
              maxW={{ base: "full", md: "280px" }}
              w="full"
            >
              <Box
                position="absolute"
                left="8px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
                color="gray.400"
                display="flex"
                alignItems="center"
                zIndex={1}
              >
                <Search size={13} />
              </Box>

              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                ps="28px"
                pe="28px"
                h="30px"
                w="full"
                fontSize="xs"
                bg="white"
              />

              {globalFilter && (
                <IconButton
                  aria-label="Clear search"
                  variant="ghost"
                  size="xs"
                  position="absolute"
                  right="4px"
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={() => setGlobalFilter("")}
                >
                  <X size={12} />
                </IconButton>
              )}
            </Box>
          )}

          {features.columnToggle && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  h="30px"
                  flexShrink={0}
                  display={{ base: "none", md: "inline-flex" }}
                >
                  <Columns3 size={13} style={{ marginRight: 4 }} />
                  Columns
                </Button>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="180px" zIndex="popover">
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
                            <Text textTransform="capitalize" fontSize="xs">
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
              size="xs"
              h="30px"
              flexShrink={0}
              w={{ base: "full", md: "auto" }}
              onClick={headerButton.onClick}
            >
              {headerButton.icon && (
                <headerButton.icon size={13} style={{ marginRight: 4 }} />
              )}
              {headerButton.label}
            </Button>
          )}

          {headerActions && (
            <Box flexShrink={0} w={{ base: "full", md: "auto" }}>
              {headerActions}
            </Box>
          )}
        </Flex>
        )}
      </Grid>
    </Box>
  );
}
