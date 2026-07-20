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
import { FiSliders } from "react-icons/fi";

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
      zIndex={hasRightContent ? 10 : undefined}
      px={{ base: 2, lg: 3 }}
      mx={-1}
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
              {title &&
                (typeof title === "string" ? (
                  <Text
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.800"
                    lineClamp={1}
                  >
                    {title}
                  </Text>
                ) : (
                  title
                ))}

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
              <HStack
                gap={0}
                flex={{ base: "1 1 100%", lg: "1 1 180px" }}
                minW={{ base: "full", lg: "260px" }}
                maxW={{ base: "full", lg: "380px" }}
                w="full"
              >
                <Box
                  flex={1}
                  border="1.5px solid"
                  borderColor={
                    globalFilter
                      ? "var(--chakra-colors-primary-disabled)"
                      : "gray.200"
                  }
                  borderRightWidth="0"
                  borderLeftRadius="lg"
                  bg="white"
                  boxShadow="xs"
                  overflow="hidden"
                  transition="border-color 0.15s, box-shadow 0.15s"
                  _hover={{
                    borderColor: globalFilter
                      ? "var(--chakra-colors-primary)"
                      : "gray.300",
                  }}
                  _focusWithin={{
                    borderColor: "var(--chakra-colors-primary)",
                    boxShadow:
                      "0 0 0 3px var(--chakra-colors-primary-disabled)",
                  }}
                  minH="8"
                  display="flex"
                  alignItems="center"
                >
                  <Input
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    border="none"
                    bg="transparent"
                    boxShadow="none"
                    borderRadius="0"
                    px={3}
                    h="30px"
                    w="full"
                    fontSize="xs"
                    color={globalFilter ? "gray.800" : "gray.700"}
                    fontWeight={globalFilter ? "medium" : "normal"}
                    _placeholder={{ color: "gray.400" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                  />

                  {globalFilter && (
                    <Flex align="center" pr={2} flexShrink={0}>
                      <IconButton
                        aria-label="Clear search"
                        variant="ghost"
                        size="xs"
                        borderRadius="full"
                        color="gray.400"
                        _hover={{ bg: "gray.100", color: "gray.600" }}
                        onClick={() => setGlobalFilter("")}
                      >
                        <X size={12} />
                      </IconButton>
                    </Flex>
                  )}
                </Box>

                <IconButton
                  aria-label="Search"
                  bg="var(--chakra-colors-primary)"
                  color="white"
                  borderLeftRadius="0"
                  borderRightRadius="lg"
                  h="30px"
                  minW="30px"
                  flexShrink={0}
                  _hover={{ opacity: 0.88 }}
                  _active={{ opacity: 0.75 }}
                >
                  <Search size={13} />
                </IconButton>
              </HStack>
            )}

            {features.columnToggle &&
              (() => {
                const hideableColumns = table
                  .getAllColumns()
                  .filter((column) => column.getCanHide());

                return (
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button
                        bg={"white"}
                        color={"gray.700"}
                        border={"1px solid"}
                        borderColor={"gray.200"}
                        boxShadow={"sm"}
                        variant="solid"
                        size="xs"
                        h="30px"
                        flexShrink={0}
                        w={{ base: "full", md: "auto" }}
                        disabled={hideableColumns.length === 0}
                      >
                        <FiSliders size={13} style={{ marginRight: 4 }} />
                        Columns
                      </Button>
                    </Menu.Trigger>

                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content minW="180px" zIndex="popover">
                          {hideableColumns.map((column) => (
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
                );
              })()}

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
