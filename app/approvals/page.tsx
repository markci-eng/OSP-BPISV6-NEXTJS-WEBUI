"use client";
import { useState } from "react";
import { Box, HStack, IconButton, Menu, Portal, Text } from "@chakra-ui/react";
import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import Page from "@/components/layout/page/Page";
import { ApprovalsTable } from "./components/ApprovalsTable";
import type { ApprovalView } from "./data/types";

const APPROVAL_TYPES: { label: string; value: ApprovalView }[] = [
  { label: "Reassignment of Documents", value: "reassignment-doc" },
  { label: "Digital Remittance Slip (DRS)", value: "drs" },
  { label: "Movement of Employees", value: "movement-employees" },
  { label: "Reassignment of SA2", value: "reassignment-sa2" },
];

export default function page() {
  const [view, setView] = useState<ApprovalView>("reassignment-doc");
  const selectedLabel =
    APPROVAL_TYPES.find((t) => t.value === view)?.label ?? "";

  return (
    <Page.Root
      title="Approvals"
      description="Review & process pending requests across all types."
    >
      <Page.MainContent>
        {/* ── Request type selector ── */}
        <HStack w={{ base: "full", md: "sm" }} gap={2} align="stretch">
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
                    <Filter size={18} />
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
                      Request Type
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
                <Menu.Content minW="260px">
                  {APPROVAL_TYPES.map((type) => (
                    <Menu.Item
                      key={type.value}
                      value={type.value}
                      onClick={() => setView(type.value)}
                      fontWeight={type.value === view ? "600" : "400"}
                      color={
                        type.value === view
                          ? "var(--chakra-colors-primary)"
                          : undefined
                      }
                    >
                      {type.label}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          {/* <IconButton
            variant="outline"
            borderWidth="1px"
            borderColor="gray.200"
            aria-label="Sort options"
            borderRadius="xl"
            flexShrink={0}
            h="auto"
          >
            <SlidersHorizontal size={16} />
          </IconButton> */}
        </HStack>

        {/* ── List ── */}
        <ApprovalsTable view={view} setView={setView} />
      </Page.MainContent>
    </Page.Root>
  );
}
