"use client";

import { Box, HStack, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, MapPin } from "lucide-react";

// Branch filter trigger — mirrors the "Request Type" selector on the
// Approvals page so both filters read as one system. Shared by the CSV, ROP,
// RITF and COFP request lists.
export function BranchFilterMenu({
  value,
  onChange,
  options,
  w,
  includeAllOption = true,
  placeholder = "All Branches",
}: {
  /** Selected branch code; `"All"` for every branch, `""` for none yet. */
  value: string;
  onChange: (value: string) => void;
  options: string[];
  w?: string | Partial<Record<"base" | "sm" | "md" | "lg" | "xl", string>>;
  /** Drop the "All Branches" entry when a branch must be picked explicitly. */
  includeAllOption?: boolean;
  /** Trigger label while nothing is selected. */
  placeholder?: string;
}) {
  const selectedLabel =
    value === "All" ? "All Branches" : value || placeholder;

  return (
    <HStack w={w} gap={2} align="stretch">
      <Menu.Root>
        <Menu.Trigger asChild>
          <HStack
            flex="1"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            bg="white"
            px={4}
            py={3}
            cursor="pointer"
            justify="space-between"
            gap={3}
            _hover={{ borderColor: "gray.300" }}
            transition="border-color 0.15s"
            userSelect="none"
          >
            <HStack gap={3} minW={0} flex="1">
              <Box color="var(--chakra-colors-primary)" flexShrink={0}>
                <MapPin size={18} />
              </Box>
              <Box minW={0} flex="1">
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  lineHeight="1"
                >
                  Branch
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                  lineClamp={1}
                  mt="3px"
                >
                  {selectedLabel}
                </Text>
              </Box>
            </HStack>
            <Box color="gray.400" flexShrink={0}>
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="220px">
              {includeAllOption && (
                <Menu.Item
                  value="All"
                  onClick={() => onChange("All")}
                  fontWeight={value === "All" ? "600" : "400"}
                  color={
                    value === "All" ? "var(--chakra-colors-primary)" : undefined
                  }
                >
                  All Branches
                </Menu.Item>
              )}
              {options.map((b) => (
                <Menu.Item
                  key={b}
                  value={b}
                  onClick={() => onChange(b)}
                  fontWeight={value === b ? "600" : "400"}
                  color={value === b ? "var(--chakra-colors-primary)" : undefined}
                >
                  {b}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </HStack>
  );
}

export default BranchFilterMenu;
